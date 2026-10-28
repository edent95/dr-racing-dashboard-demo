/**
 * WhatsApp tracking link actions (add / update / delete). Moved verbatim from
 * App.tsx; every value the handlers used from App's closure is now an
 * explicit dependency. The one change: the Firebase ID token comes from the
 * `getFirebaseIdToken` dependency instead of an inline dynamic import, so
 * the server path can be tested. The visible-link filters stay in App.
 *
 * It holds no React state of its own, so it is a plain function of its
 * dependencies and unit tests call it directly.
 */
import type { Dispatch, SetStateAction } from 'react';
import type { BrandedDialogOptions } from '../components/BrandedDialogProvider';
import { tr } from '../lib/i18n';
import type { DashboardState } from '../services/dashboardRepository';
import { AuditLogEntry, RoleAccountRole, WhatsAppTrackingLink } from '../types';

export interface WhatsAppLinkAuditInput {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  changes: AuditLogEntry['changes'];
  stateOverrides?: Partial<DashboardState>;
}

export interface WhatsAppLinkActionsDeps {
  isFirebaseConfigured: boolean;
  currentStaffRole: RoleAccountRole;
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  setWhatsAppTrackingLinks: Dispatch<SetStateAction<WhatsAppTrackingLink[]>>;
  writeLocalDashboardValue: (key: 'whatsAppTrackingLinks', value: WhatsAppTrackingLink[]) => void;
  updateWhatsAppTrackingLinksState: (list: WhatsAppTrackingLink[]) => unknown;
  acknowledgeServerDashboardStateVersion: (version: number) => void;
  getFirebaseIdToken: () => Promise<string>;
  showConfirm: (options: BrandedDialogOptions) => Promise<boolean>;
  appendAuditLog: (input: WhatsAppLinkAuditInput) => void;
  createAuditChanges: <Before extends object, After extends object>(before: Before, after: After) => AuditLogEntry['changes'];
  triggerToast: (message: string, tone?: 'success' | 'warning' | 'error') => void;
}

export function useWhatsAppLinkActions({
  isFirebaseConfigured,
  currentStaffRole,
  whatsAppTrackingLinks,
  setWhatsAppTrackingLinks,
  writeLocalDashboardValue,
  updateWhatsAppTrackingLinksState,
  acknowledgeServerDashboardStateVersion,
  getFirebaseIdToken,
  showConfirm,
  appendAuditLog,
  createAuditChanges,
  triggerToast
}: WhatsAppLinkActionsDeps) {
  // Firestore Rules only let Super Admin write WhatsApp tracking links. Every
  // other role manages its own links (sales_name == own staff name) through the
  // server, which also updates /wa routing. Only local state is updated here.
  const shouldSaveWhatsAppLinksThroughServer = isFirebaseConfigured && currentStaffRole !== 'Super Admin';

  const mutateOwnWhatsAppLinkThroughServer = async (body: Record<string, unknown>) => {
    const token = await getFirebaseIdToken();
    const response = await fetch('/api/staff/whatsapp-links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({})) as {
      error?: string;
      id?: string;
      link?: WhatsAppTrackingLink | null;
      version?: number;
    };

    if (!response.ok || !payload.id) {
      const serverMessage = String(payload.error || '');
      if (serverMessage.includes('your own WhatsApp links')) {
        throw new Error(tr('只能管理自己名下的 WhatsApp 链接。', 'You can only manage your own WhatsApp links.', 'Anda hanya boleh mengurus pautan WhatsApp anda sendiri.'));
      }
      if (serverMessage.includes('phone number is invalid')) {
        throw new Error(tr('电话号码无效。', 'Phone number is invalid.', 'Nombor telefon tidak sah.'));
      }
      if (serverMessage.includes('was not found')) {
        throw new Error(tr('这条链接已不存在，请重新载入。', 'This link no longer exists. Reload and try again.', 'Pautan ini tidak lagi wujud. Muat semula dan cuba lagi.'));
      }
      throw new Error(tr('WhatsApp 链接保存失败。', 'WhatsApp link could not be saved.', 'Pautan WhatsApp tidak dapat disimpan.'));
    }

    if (typeof payload.version === 'number') {
      acknowledgeServerDashboardStateVersion(payload.version);
    }
    setWhatsAppTrackingLinks((current) => {
      const withoutTarget = current.filter((item) => item.id !== payload.id);
      const next = payload.link
        ? (body.action === 'create'
          ? [payload.link, ...withoutTarget]
          : current.map((item) => item.id === payload.id ? payload.link as WhatsAppTrackingLink : item))
        : withoutTarget;
      writeLocalDashboardValue('whatsAppTrackingLinks', next);
      return next;
    });
    return payload.link || null;
  };

  const handleAddWhatsAppTrackingLink = (link: WhatsAppTrackingLink) => {
    if (shouldSaveWhatsAppLinksThroughServer) {
      void mutateOwnWhatsAppLinkThroughServer({ action: 'create', link }).then((saved) => {
        triggerToast(tr(`WhatsApp 链接 ${saved?.label || link.label} 已创建`, `WhatsApp link ${saved?.label || link.label} created`, `Pautan WhatsApp ${saved?.label || link.label} dibuat`));
      }).catch((error) => {
        triggerToast(error instanceof Error ? error.message : String(error), 'error');
      });
      return;
    }

    updateWhatsAppTrackingLinksState([link, ...whatsAppTrackingLinks]);
    appendAuditLog({
      action: 'ADD_WHATSAPP_LINK',
      target_type: 'WhatsApp Link',
      target_id: link.id,
      target_label: link.label,
      changes: createAuditChanges({}, link as unknown as Record<string, unknown>),
      stateOverrides: { whatsAppTrackingLinks: [link, ...whatsAppTrackingLinks] }
    });
    triggerToast(tr(`WhatsApp 链接 ${link.label} 已创建`, `WhatsApp link ${link.label} created`, `Pautan WhatsApp ${link.label} dibuat`));
  };

  const handleUpdateWhatsAppTrackingLink = (id: string, updates: Partial<WhatsAppTrackingLink>) => {
    if (shouldSaveWhatsAppLinksThroughServer) {
      void mutateOwnWhatsAppLinkThroughServer({ action: 'update', id, updates }).catch((error) => {
        triggerToast(error instanceof Error ? error.message : String(error), 'error');
      });
      return;
    }

    const previous = whatsAppTrackingLinks.find((link) => link.id === id);
    updateWhatsAppTrackingLinksState(whatsAppTrackingLinks.map((link) => (
      link.id === id
        ? { ...link, ...updates }
        : link
    )));

    if (previous) {
      appendAuditLog({
        action: 'UPDATE_WHATSAPP_LINK',
        target_type: 'WhatsApp Link',
        target_id: id,
        target_label: previous.label,
        changes: createAuditChanges(previous as unknown as Record<string, unknown>, {
          ...previous,
          ...updates
        } as unknown as Record<string, unknown>),
        stateOverrides: {
          whatsAppTrackingLinks: whatsAppTrackingLinks.map((link) => (
            link.id === id
              ? { ...link, ...updates }
              : link
          ))
        }
      });
    }
  };

  const handleDeleteWhatsAppTrackingLink = async (id: string) => {
    const target = whatsAppTrackingLinks.find((link) => link.id === id);

    if (await showConfirm({
      eyebrow: tr('WhatsApp 链接', 'WhatsApp Link', 'Pautan WhatsApp'),
      title: tr('删除 WhatsApp 链接？', 'Delete WhatsApp link?', 'Padam pautan WhatsApp?'),
      message: tr(`确认删除「${target?.label || id}」？`, `Delete "${target?.label || id}"?`, `Padam "${target?.label || id}"?`),
      tone: 'danger',
      confirmLabel: tr('删除链接', 'Delete Link', 'Padam Pautan')
    })) {
      if (shouldSaveWhatsAppLinksThroughServer) {
        try {
          await mutateOwnWhatsAppLinkThroughServer({ action: 'delete', id });
          triggerToast(tr(`WhatsApp 链接 ${target?.label || id} 已删除`, `WhatsApp link ${target?.label || id} deleted`, `Pautan WhatsApp ${target?.label || id} dipadamkan`));
        } catch (error) {
          triggerToast(error instanceof Error ? error.message : String(error), 'error');
        }
        return;
      }

      updateWhatsAppTrackingLinksState(whatsAppTrackingLinks.filter((link) => link.id !== id));
      appendAuditLog({
        action: 'DELETE_WHATSAPP_LINK',
        target_type: 'WhatsApp Link',
        target_id: id,
        target_label: target?.label || id,
        changes: [
          {
            field: 'record',
            old_value: target ? `${target.label} / ${target.channel} / ${target.medium} / ${target.campaign}` : id,
            new_value: 'Deleted'
          }
        ],
        stateOverrides: { whatsAppTrackingLinks: whatsAppTrackingLinks.filter((link) => link.id !== id) }
      });
      triggerToast(tr(`WhatsApp 链接 ${target?.label || id} 已删除`, `WhatsApp link ${target?.label || id} deleted`, `Pautan WhatsApp ${target?.label || id} dipadamkan`));
    }
  };

  return {
    handleAddWhatsAppTrackingLink,
    handleUpdateWhatsAppTrackingLink,
    handleDeleteWhatsAppTrackingLink
  };
}
