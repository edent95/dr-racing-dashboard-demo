/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Link2, MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import { WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import DoubleClickEditField from './DoubleClickEditField';
import SortableHeader, { compareSortValues, getNextSortState, SortDirection, SortState } from './SortableHeader';
import { getAppLocale, tr } from '../lib/i18n';
import { buildPublicSiteUrl } from '../lib/publicUrls';
import { normalizeMalaysiaPhoneDigits as normalizePhoneNumber } from '../utils/malaysiaPhone';

interface WhatsAppTrackingAdminProps {
  links: WhatsAppTrackingLink[];
  clicks: WhatsAppTrackingClick[];
  currentStaffName: string;
  defaultMessage: string;
  onUpdateDefaultMessage: (message: string) => void;
  onAddLink: (link: WhatsAppTrackingLink) => void;
  onUpdateLink: (id: string, updates: Partial<WhatsAppTrackingLink>) => void;
  onDeleteLink: (id: string) => void;
  onCreateShortLink: (fullUrl: string, link: WhatsAppTrackingLink) => Promise<string>;
  // Role Access → WhatsApp Tools page details.
  canManageLinks?: boolean;
  canCreateShortLinks?: boolean;
}

function buildTrackingUrl(link: WhatsAppTrackingLink) {
  const params = new URLSearchParams({
    id: link.id,
    phone: normalizePhoneNumber(link.phone_number),
    sales: link.sales_name,
    utm_source: link.channel,
    utm_medium: link.medium,
    utm_campaign: link.campaign,
    text: link.message
  });

  return buildPublicSiteUrl(`/wa?${params.toString()}`);
}

function getShortTrackingUrl(url: string) {
  const [baseUrl] = url.split('?');
  return `${baseUrl}?id=...`;
}

function getDisplayTrackingUrl(url: string) {
  const displayUrl = new URL(url);
  if (displayUrl.searchParams.has('sales')) {
    displayUrl.searchParams.set('sales', 'auto');
  }
  return displayUrl.toString();
}

type TrackingLinkSortKey = 'label' | 'phone_number' | 'utm' | 'click_count' | 'active';
type TrackingClickSortKey = 'label' | 'channel' | 'medium' | 'campaign' | 'clicked_at';

export default function WhatsAppTrackingAdmin({
  links,
  clicks,
  currentStaffName,
  defaultMessage,
  onUpdateDefaultMessage,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onCreateShortLink,
  canManageLinks = true,
  canCreateShortLinks = true
}: WhatsAppTrackingAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newMedium, setNewMedium] = useState('');
  const [newCampaign, setNewCampaign] = useState('');
  const [newMessage, setNewMessage] = useState(defaultMessage);
  const [defaultMessageDraft, setDefaultMessageDraft] = useState(defaultMessage);
  const [defaultMessageSaved, setDefaultMessageSaved] = useState('');
  const [expandedLinkIds, setExpandedLinkIds] = useState<Record<string, boolean>>({});
  const [shortLinksByLinkId, setShortLinksByLinkId] = useState<Record<string, string>>({});
  const [shortLinkFailedLinkId, setShortLinkFailedLinkId] = useState('');
  const [linkSortState, setLinkSortState] = useState<SortState<TrackingLinkSortKey>>({
    key: 'click_count',
    direction: 'desc'
  });
  const [clickSortState, setClickSortState] = useState<SortState<TrackingClickSortKey>>({
    key: 'clicked_at',
    direction: 'desc'
  });

  useEffect(() => {
    setDefaultMessageDraft(defaultMessage);
    setNewMessage((current) => (current.trim() ? current : defaultMessage));
  }, [defaultMessage]);

  const clickCountByLink = useMemo(() => {
    return clicks.reduce<Record<string, number>>((acc, click) => {
      acc[click.link_id] = (acc[click.link_id] || 0) + 1;
      return acc;
    }, {});
  }, [clicks]);

  const lastClickByLink = useMemo(() => {
    return clicks.reduce<Record<string, WhatsAppTrackingClick>>((acc, click) => {
      const existing = acc[click.link_id];
      if (!existing || new Date(click.clicked_at).getTime() > new Date(existing.clicked_at).getTime()) {
        acc[click.link_id] = click;
      }
      return acc;
    }, {});
  }, [clicks]);

  const sortedLinks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filteredLinks = links.filter((link) => (
      !query ||
      link.label.toLowerCase().includes(query) ||
      link.channel.toLowerCase().includes(query) ||
      link.medium.toLowerCase().includes(query) ||
      link.campaign.toLowerCase().includes(query) ||
      link.phone_number.toLowerCase().includes(query)
    ));

    const getSortValue = (link: WhatsAppTrackingLink) => {
      if (linkSortState.key === 'click_count') {
        return clickCountByLink[link.id] || 0;
      }

      if (linkSortState.key === 'utm') {
        return `${link.channel} ${link.medium} ${link.campaign}`.toLowerCase();
      }

      if (linkSortState.key === 'active') {
        return link.active ? 1 : 0;
      }

      return String(link[linkSortState.key] || '').toLowerCase();
    };

    return [...filteredLinks].sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), linkSortState.direction));
  }, [clickCountByLink, linkSortState, links, searchTerm]);

  const sortedRecentClicks = useMemo(() => {
    const getSortValue = (click: WhatsAppTrackingClick) => {
      if (clickSortState.key === 'clicked_at') {
        return new Date(click.clicked_at).getTime();
      }

      return String(click[clickSortState.key] || '').toLowerCase();
    };

    return [...clicks].sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b), clickSortState.direction)).slice(0, 10);
  }, [clickSortState, clicks]);

  const handleLinkSort = (key: TrackingLinkSortKey, defaultDirection: SortDirection = key === 'click_count' ? 'desc' : 'asc') => {
    setLinkSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleClickSort = (key: TrackingClickSortKey, defaultDirection: SortDirection = key === 'clicked_at' ? 'desc' : 'asc') => {
    setClickSortState((current) => getNextSortState(current, key, defaultDirection));
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    const phoneNumber = normalizePhoneNumber(newPhoneNumber);

    if (!label || !phoneNumber || !newChannel.trim() || !newMedium.trim()) {
      return;
    }

    onAddLink({
      id: `WA-${Date.now()}`,
      label,
      sales_name: currentStaffName.trim() || 'DR Racing Sales',
      phone_number: phoneNumber,
      channel: newChannel.trim().toLowerCase(),
      medium: newMedium.trim().toLowerCase(),
      campaign: newCampaign.trim().toLowerCase(),
      message: newMessage.trim() || defaultMessage.trim(),
      active: true,
      created_at: new Date().toISOString()
    });

    setNewLabel('');
    setNewPhoneNumber('');
    setNewChannel('');
    setNewMedium('');
    setNewCampaign('');
    setNewMessage(defaultMessage.trim());
  };

  const handleSaveDefaultMessage = () => {
    const message = defaultMessageDraft.trim();
    onUpdateDefaultMessage(message);
    setNewMessage(message);
    setDefaultMessageSaved(tr('默认信息已保存', 'Default message saved', "Mesej lalai disimpan"));
    window.setTimeout(() => setDefaultMessageSaved(''), 1600);
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const handleCopyShortLink = async (trackingUrl: string, link: WhatsAppTrackingLink) => {
    let shortLink = '';
    setShortLinkFailedLinkId('');
    try {
      shortLink = await onCreateShortLink(trackingUrl, link);
    } catch (error) {
      console.warn('WhatsApp short link save failed.', error);
      setShortLinkFailedLinkId(link.id);
      return;
    }

    setShortLinksByLinkId((current) => ({
      ...current,
      [link.id]: shortLink
    }));
    await handleCopy(shortLink);
  };

  const toggleExpandedLink = (id: string) => {
    setExpandedLinkIds((current) => ({
      ...current,
      [id]: !current[id]
    }));
  };

  return (
    <div id="whatsapp-tracking-page" className="space-y-6">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-title-2 text-slate-900">
            {tr('WhatsApp 工具', 'WhatsApp Tools', "Alat WhatsApp")}
          </h2>
        </div>

        <div className="relative self-start md:self-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="tracking-search-input"
            type="text"
            placeholder={tr('搜索链接、电话、来源、活动...', 'Search link, phone, channel, campaign...', "Pautan carian, telefon, saluran, kempen...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-control text-footnote w-80 focus:bg-slate-50 focus:ring-1 focus:ring-brand-100 outline-none transition-all"
          />
        </div>
      </section>

      <section className="rounded-card border border-slate-100 bg-white p-5 shadow-e1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-brand-50 text-brand-ink">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-headline text-slate-900">{tr('潜在客户默认 WhatsApp 讯息', 'Default WhatsApp Message for Leads', "Mesej WhatsApp lalai untuk prospek")}</h3>
              <p className="mt-1 max-w-2xl text-footnote leading-relaxed text-slate-500">
                {tr('可用变量：', 'Variables: ', "Pembolehubah:")}{'{name}'} {'{phone}'} {'{channel}'} {'{lead_id}'}
              </p>
              <p className="mt-1 max-w-2xl text-caption text-slate-400">
                {tr(
                  `只为 ${currentStaffName} 保存在此装置，不会修改其他员工的话术。`,
                  `Saved for ${currentStaffName} on this device only; other staff messages are unchanged.`,
                  `Disimpan untuk ${currentStaffName} pada peranti ini sahaja; mesej kakitangan lain tidak berubah.`
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveDefaultMessage}
            className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white transition-colors hover:bg-brand-deep"
          >
            {tr('保存讯息', 'Save Message', "Simpan Mesej")}
          </button>
        </div>
        <textarea
          value={defaultMessageDraft}
          onChange={(event) => setDefaultMessageDraft(event.target.value)}
          className="mt-4 min-h-24 w-full rounded-card border border-slate-100 bg-slate-50 px-3 py-3 text-footnote leading-relaxed text-slate-700 outline-none transition-all focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50"
          placeholder={tr('潜在客户默认 WhatsApp 讯息', 'Default WhatsApp message for leads', "Mesej WhatsApp lalai untuk prospek")}
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-caption">
          <span className="text-slate-400">{tr('例子：Hi ', 'Example: Hi ', "Contoh: Hai")}{'{name}'}, saya dari Dr Racing...</span>
          <span className="font-bold text-brand-ink">{defaultMessageSaved}</span>
        </div>
      </section>

      <section className="bg-white rounded-card border border-slate-100 shadow-e1 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100/70">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-headline text-slate-900">{tr('追踪链接', 'Tracking Links', "Pautan Penjejakan")}</h3>
            </div>
            <span className="inline-flex self-start rounded-full bg-brand-50 px-3 py-1 text-micro uppercase text-brand-ink">
              {tr('链接追踪工具', 'Link Tracking Tool', "Alat Penjejakan Pautan")}
            </span>
          </div>
          {canManageLinks && (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_170px_130px_130px_160px_auto] gap-3">
            <input
              id="new-tracking-label-input"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={tr('链接名称', 'Link label', "Label pautan")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <input
              id="new-tracking-phone-input"
              type="tel"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              placeholder="60123456789"
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote font-mono text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <input
              id="new-tracking-channel-input"
              type="text"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              placeholder={tr('来源，例如 facebook', 'facebook', "facebook")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <input
              id="new-tracking-medium-input"
              type="text"
              value={newMedium}
              onChange={(e) => setNewMedium(e.target.value)}
              placeholder={tr('媒介，例如 social', 'social', "sosial")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <input
              id="new-tracking-campaign-input"
              type="text"
              value={newCampaign}
              onChange={(e) => setNewCampaign(e.target.value)}
              placeholder={tr('活动名称', 'campaign', "kempen")}
              className="px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
            />
            <button
              id="add-tracking-link-btn"
              type="button"
              onClick={handleAdd}
              disabled={!newLabel.trim() || !newPhoneNumber.trim() || !newChannel.trim() || !newMedium.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-card bg-brand text-white text-footnote font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-brand-deep transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {tr('新增链接', 'Add Link', "Tambah Pautan")}
            </button>
          </div>
          <input
            id="new-tracking-message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={tr('这个追踪链接用的 WhatsApp 讯息', 'Tracking link WhatsApp message', "Menjejaki pautan mesej WhatsApp")}
            className="mt-3 w-full px-3 py-2.5 rounded-card bg-slate-50 border border-transparent text-footnote text-slate-700 outline-none focus:bg-white focus:border-brand-100 focus:ring-2 focus:ring-brand-50"
          />
          </>
          )}
          <p className="mt-2 text-micro tracking-normal font-medium text-slate-400">
            {tr('这里的讯息只用于这个追踪链接；上面的默认讯息会用于潜在客户名单。', 'This message belongs to the tracking link being created. The default message above is used for leads.', "Mesej ini tergolong dalam pautan penjejakan yang sedang dibuat. Mesej lalai di atas digunakan untuk prospek.")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-200/95 text-micro tracking-normal text-slate-700 uppercase tracking-wider border-b border-slate-300">
              <tr>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="label" label={tr('链接', 'Link', "Pautan")} sortState={linkSortState} onSort={handleLinkSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="phone_number" label={tr('电话', 'Phone', "Telefon")} sortState={linkSortState} onSort={handleLinkSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="utm" label="UTM" sortState={linkSortState} onSort={handleLinkSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="click_count" label={tr('独立访客', 'Unique visitors', "Pelawat unik")} sortState={linkSortState} onSort={handleLinkSort} defaultDirection="desc" />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="active" label={tr('状态', 'Status', "Status")} sortState={linkSortState} onSort={handleLinkSort} defaultDirection="desc" />
                </th>
                <th className="pr-6 py-3.5 text-right">{tr('操作', 'Action', "Tindakan")}</th>
              </tr>
            </thead>
            <tbody className="text-body divide-y divide-slate-50">
              {sortedLinks.map((link) => {
                const trackingUrl = buildTrackingUrl(link);
                const shortLink = shortLinksByLinkId[link.id];
                const isExpanded = Boolean(expandedLinkIds[link.id]);
                const displayTrackingUrl = getDisplayTrackingUrl(trackingUrl);
                const visibleTrackingUrl = isExpanded ? displayTrackingUrl : getShortTrackingUrl(trackingUrl);
                const lastClick = lastClickByLink[link.id];

                return (
                  <tr key={link.id} id={`tracking-row-${link.id}`} className="hover:bg-brand-50/20 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1 min-w-80">
                        <DoubleClickEditField
                          type="text"
                          value={link.label}
                          copyOnly={!canManageLinks}
                          onCommit={(value) => onUpdateLink(link.id, { label: value })}
                          displayClassName="block rounded-control bg-slate-50 px-3 py-2 text-left text-footnote text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-ink"
                          inputClassName="rounded-control border border-transparent bg-slate-50 px-3 py-2 text-footnote text-slate-700 outline-none focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50"
                          ariaLabel={tr(`更新追踪链接名称 ${link.id}`, `Update tracking label for ${link.id}`, `Kemas kini label penjejakan untuk ${link.id}`)}
                        />
                        <div className="flex items-center gap-2">
                          <Link2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span
                            className={`text-micro tracking-normal text-slate-400 ${isExpanded ? 'break-all' : 'truncate'}`}
                            title={displayTrackingUrl}
                          >
                            {visibleTrackingUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleExpandedLink(link.id)}
                            className="shrink-0 rounded-chip bg-slate-50 px-2 py-1 text-micro tracking-normal text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            aria-label={tr(`${isExpanded ? '收起' : '显示完整'}追踪链接 ${link.id}`, `${isExpanded ? 'Hide' : 'Show all'} tracking link ${link.id}`, `${isExpanded ? 'Hide' : 'Show all'} pautan penjejakan ${link.id}`)}
                          >
                            {isExpanded ? tr('收起', 'Hide', "Sembunyi") : tr('显示完整', 'Show all', "Tunjukkan semua")}
                          </button>
                        </div>
                        {shortLink && (
                          <div className="flex items-center gap-2">
                            <Link2 className="w-3.5 h-3.5 text-brand-ink shrink-0" />
                            <span className="truncate text-caption text-brand-ink" title={shortLink}>
                              {shortLink}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <DoubleClickEditField
                        type="tel"
                        value={link.phone_number}
                        copyOnly={!canManageLinks}
                        onCommit={(value) => onUpdateLink(link.id, { phone_number: normalizePhoneNumber(value) })}
                        normalizeValue={normalizePhoneNumber}
                        displayClassName="block w-40 truncate rounded-control bg-slate-50 px-3 py-2 text-left font-mono text-footnote text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-ink"
                        inputClassName="w-40 rounded-control border border-transparent bg-slate-50 px-3 py-2 font-mono text-footnote text-slate-600 outline-none focus:border-brand-100 focus:bg-white focus:ring-2 focus:ring-brand-50"
                        ariaLabel={tr(`更新电话 ${link.id}`, `Update phone for ${link.id}`, `Kemas kini telefon untuk ${link.id}`)}
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="grid grid-cols-1 gap-1.5 min-w-44">
                        <span className="text-micro tracking-normal text-slate-500">{tr('来源', 'source', "sumber")}: <b>{link.channel}</b></span>
                        <span className="text-micro tracking-normal text-slate-500">{tr('媒介', 'medium', "sederhana")}: <b>{link.medium}</b></span>
                        <span className="text-micro tracking-normal text-slate-500">{tr('活动', 'campaign', "kempen")}: <b>{link.campaign}</b></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-headline text-slate-800">{clickCountByLink[link.id] || 0}</span>
                      <p className="mt-1 text-micro tracking-normal text-slate-400">
                        {lastClick
                          ? new Date(lastClick.clicked_at).toLocaleString(getAppLocale(), {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })
                          : tr('还没有访客', 'No visitors yet', "Tiada pelawat lagi")}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <DoubleClickEditField
                        mode="select"
                        value={link.active ? 'active' : 'inactive'}
                        options={[
                          { value: 'active', label: tr('启用', 'Active', "Aktif") },
                          { value: 'inactive', label: tr('停用', 'Inactive', "Tidak Aktif") }
                        ]}
                        copyOnly={!canManageLinks}
                        onCommit={(value) => onUpdateLink(link.id, { active: value === 'active' })}
                        displayClassName={`block w-28 rounded-control border px-3 py-2 text-left text-footnote font-bold transition-colors ${
                          link.active
                            ? 'border-brand-100 bg-brand-50/70 text-brand-ink'
                            : 'border-slate-100 bg-slate-50 text-slate-500'
                        }`}
                        inputClassName={`w-28 rounded-control border px-3 py-2 text-footnote font-bold outline-none ${
                          link.active
                            ? 'bg-brand-50/70 border-brand-100 text-brand-ink'
                            : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}
                        formatDisplay={() => (link.active ? tr('启用', 'Active', "Aktif") : tr('停用', 'Inactive', "Tidak Aktif"))}
                        ariaLabel={tr(`更新追踪状态 ${link.id}`, `Update tracking status for ${link.id}`, `Kemas kini status penjejakan untuk ${link.id}`)}
                      />
                    </td>
                    <td className="pr-6 py-4 align-top text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(trackingUrl)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-control text-slate-400 hover:text-brand-ink hover:bg-brand-50 transition-colors cursor-pointer"
                          aria-label={tr(`复制完整追踪链接 ${link.id}`, `Copy full tracking link ${link.id}`, `Salin pautan penjejakan penuh ${link.id}`)}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {canCreateShortLinks && (
                        <button
                          type="button"
                          onClick={() => handleCopyShortLink(trackingUrl, link)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-control text-slate-400 hover:text-brand-ink hover:bg-brand-50 transition-colors cursor-pointer"
                          aria-label={tr(`复制短链接 ${link.id}`, `Copy short tracking link ${link.id}`, `Salin pautan penjejakan pendek ${link.id}`)}
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        )}
                        {canManageLinks && (
                        <button
                          type="button"
                          onClick={() => onDeleteLink(link.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-control text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          aria-label={tr(`删除追踪链接 ${link.id}`, `Delete tracking link ${link.id}`, `Padamkan pautan penjejakan ${link.id}`)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                      </div>
                      {shortLinkFailedLinkId === link.id && (
                        <p role="alert" className="mt-1 text-caption text-rose-600">
                          {tr('短链接保存失败，请再试一次', 'Short link not saved. Try again', 'Pautan pendek tidak disimpan. Cuba lagi')}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}

              {sortedLinks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-body text-slate-400">
                    {tr('没有找到 WhatsApp 追踪链接', 'No WhatsApp tracking links found', "Tiada pautan penjejakan WhatsApp ditemui")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-card border border-slate-100 shadow-e1 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-headline text-slate-900">{tr('最近访客', 'Recent Visitors', "Pelawat Terkini")}</h3>
          <p className="mt-1 text-caption text-slate-400">{tr('同一浏览器访问同一链接只计一次（记录首次访问）。', 'Each browser is counted once per link (first visit recorded).', 'Setiap pelayar dikira sekali bagi setiap pautan (lawatan pertama direkodkan).')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-300 bg-slate-200/95 text-micro uppercase text-slate-700">
              <tr>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="label" label={tr('名称', 'Label', "Label")} sortState={clickSortState} onSort={handleClickSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="channel" label={tr('来源', 'Channel', "Saluran")} sortState={clickSortState} onSort={handleClickSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="medium" label={tr('媒介', 'Medium', "Sederhana")} sortState={clickSortState} onSort={handleClickSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="campaign" label={tr('活动', 'Campaign', "Kempen")} sortState={clickSortState} onSort={handleClickSort} />
                </th>
                <th className="px-6 py-3.5">
                  <SortableHeader sortKey="clicked_at" label={tr('首次访问', 'First visit', "Lawatan pertama")} sortState={clickSortState} onSort={handleClickSort} defaultDirection="desc" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-footnote">
              {sortedRecentClicks.map((click) => (
                <tr key={click.id} className="hover:bg-brand-50/20">
                  <td className="px-6 py-3 font-semibold text-slate-700">{click.label}</td>
                  <td className="px-6 py-3 text-slate-500">{click.channel}</td>
                  <td className="px-6 py-3 text-slate-500">{click.medium}</td>
                  <td className="px-6 py-3 text-slate-500">{click.campaign}</td>
                  <td className="px-6 py-3 font-mono text-slate-400">
                    {new Date(click.clicked_at).toLocaleString(getAppLocale(), {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </td>
                </tr>
              ))}
              {sortedRecentClicks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-body text-slate-400">
                    {tr('还没有访客记录', 'No visitors recorded yet', "Tiada pelawat direkodkan lagi")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
