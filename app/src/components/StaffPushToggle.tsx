import React, { useState } from 'react';
import { BellRing } from 'lucide-react';
import { tr } from '../lib/i18n';
import { disableStaffPush, enableStaffPush, getStaffPushState, type StaffPushState } from '../lib/staffPush';

const getIdToken = async () => (await import('../lib/auth')).getCurrentFirebaseIdToken(true);

/**
 * Turns phone push on or off for this device (owner meeting 2026-10-13: the next
 * step should reach the person who owns it without a WhatsApp group).
 */
export default function StaffPushToggle() {
  const [state, setState] = useState<StaffPushState>(() => getStaffPushState());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const explanation: Record<StaffPushState, string> = {
    on: tr('这台设备已开启。轮到你处理的事会推送到这里。', 'On for this device. Anything that needs you is pushed here.', 'Dihidupkan untuk peranti ini. Apa-apa yang memerlukan anda akan dihantar ke sini.'),
    off: tr('开启后，轮到你处理的事(银行结果、补文件、交车步骤、@你的留言)会推送到这台设备。', 'Turn on to get a push on this device when something needs you (bank results, documents, delivery steps, @mentions).', 'Hidupkan untuk menerima pemberitahuan di peranti ini apabila sesuatu memerlukan anda (keputusan bank, dokumen, langkah penghantaran, @sebutan).'),
    needs_install: tr('iPhone / iPad:先在 Safari 点「分享」→「添加到主屏幕」,再从主屏幕打开 Dr Racing,回到这里开启。', 'iPhone / iPad: in Safari tap Share → Add to Home Screen, open Dr Racing from the Home Screen, then turn it on here.', 'iPhone / iPad: dalam Safari tekan Kongsi → Tambah ke Skrin Utama, buka Dr Racing dari Skrin Utama, kemudian hidupkan di sini.'),
    blocked: tr('浏览器已拒绝通知。请在浏览器或手机设置里允许 Dr Racing 的通知，再回来开启。', 'Notifications are blocked. Allow them for Dr Racing in the browser or phone settings, then come back.', 'Pemberitahuan disekat. Benarkan untuk Dr Racing dalam tetapan pelayar atau telefon, kemudian kembali.'),
    unsupported: tr('这个浏览器不支持推送通知。', 'This browser does not support push notifications.', 'Pelayar ini tidak menyokong pemberitahuan tolak.'),
    not_configured: tr('本地测试环境没有连接 Firebase,推送不可用。', 'Push is not available without Firebase (local test mode).', 'Pemberitahuan tidak tersedia tanpa Firebase (mod ujian tempatan).')
  };

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      setState(state === 'on' ? await disableStaffPush(getIdToken) : await enableStaffPush(getIdToken));
    } catch (caught) {
      console.error('Staff push toggle failed', caught);
      setError(tr('开启失败，请稍后再试。', 'Could not turn it on; try again later.', 'Gagal dihidupkan; cuba lagi nanti.'));
      setState(getStaffPushState());
    } finally {
      setBusy(false);
    }
  };

  const canToggle = state === 'on' || state === 'off';

  return (
    <div data-testid="staff-push-toggle" data-state={state} className="rounded-card border border-slate-100 bg-white p-5 shadow-e1">
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-card ${state === 'on' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-headline text-slate-900">{tr('手机通知', 'Phone notifications', 'Pemberitahuan telefon')}</h3>
          <p className="text-footnote text-slate-500">{explanation[state]}</p>
          {error && <p className="mt-1 text-footnote text-rose-600">{error}</p>}
        </div>
        {canToggle && (
          <button
            type="button"
            disabled={busy}
            onClick={() => { void toggle(); }}
            className={`rounded-control px-3 py-2 text-footnote font-bold disabled:cursor-wait disabled:opacity-60 ${state === 'on' ? 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-ink' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
          >
            {busy
              ? tr('处理中…', 'Working…', 'Sedang diproses…')
              : state === 'on'
                ? tr('关闭这台设备', 'Turn off on this device', 'Matikan pada peranti ini')
                : tr('开启手机通知', 'Turn on phone notifications', 'Hidupkan pemberitahuan telefon')}
          </button>
        )}
      </div>
    </div>
  );
}
