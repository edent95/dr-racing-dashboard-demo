import React, { useEffect, useRef, useState } from 'react';
import type { MultiFactorInfo } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';
import { useBrandedDialog } from './BrandedDialogProvider';
import { useStaffMfaPrompt } from '../hooks/useStaffMfaPrompt';
import { tr } from '../lib/i18n';
import { reauthenticateCurrentFirebaseStaff } from '../lib/auth';
import {
  beginStaffTotpEnrollment, finishStaffTotpEnrollment, getStaffMfaStatus, sendStaffMfaVerificationEmail,
  removeStaffTotpFactor, staffMfaErrorCode
} from '../lib/staffMfa';
import { useFirebaseEmulators } from '../lib/firebaseEmulators';

type Enrollment = Awaited<ReturnType<typeof beginStaffTotpEnrollment>> & { qr: string };

function errorMessage(error: unknown) {
  switch (staffMfaErrorCode(error)) {
    case 'auth/mfa-cancelled': return tr('验证已取消，未更改验证器。', 'Verification cancelled. Authenticator unchanged.', 'Pengesahan dibatalkan. Pengesah tidak berubah.');
    case 'auth/invalid-credential':
    case 'auth/wrong-password': return tr('当前密码不正确。', 'Current password is incorrect.', 'Kata laluan semasa tidak betul.');
    case 'auth/invalid-verification-code': return tr('验证码不正确，请输入 App 当前显示的 6 位验证码。', 'Code not accepted. Enter the current six-digit code from your app.', 'Kod tidak diterima. Masukkan kod enam digit semasa daripada aplikasi anda.');
    case 'auth/invalid-email':
    case 'auth/unverified-email': return tr('请先在个人资料中设置可收信的登录 Email，然后发送并完成邮件验证。', 'Set a usable login email in your profile, then send and complete email verification.', 'Tetapkan e-mel log masuk yang boleh menerima mel dalam profil, kemudian hantar dan lengkapkan pengesahan e-mel.');
    case 'auth/code-expired':
    case 'auth/user-token-expired':
    case 'auth/invalid-multi-factor-session':
    case 'auth/requires-recent-login': return tr('验证已过期，请重新登录后检查验证器状态。', 'Verification expired. Sign in again and check your authenticators.', 'Pengesahan tamat tempoh. Log masuk semula dan semak pengesah anda.');
    case 'auth/too-many-requests': return tr('尝试次数过多，请稍后再试。', 'Too many attempts. Try again later.', 'Terlalu banyak percubaan. Cuba lagi kemudian.');
    default: return tr('安全验证未完成，请检查连接后重试；若持续失败，请联系管理员。', 'Security verification did not complete. Check your connection and retry; contact the administrator if it continues.', 'Pengesahan keselamatan tidak selesai. Semak sambungan dan cuba lagi; hubungi pentadbir jika berterusan.');
  }
}

export default function StaffMfaSettings() {
  const { showPasswordPrompt, showConfirm } = useBrandedDialog();
  const requestCode = useStaffMfaPrompt();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getStaffMfaStatus>> | null>(null);
  const factors = status?.factors;
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [name, setName] = useState('Authenticator');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    if (!useFirebaseEmulators) void getStaffMfaStatus().then((value) => {
      if (mounted.current) setStatus(value);
    }).catch((failure) => { if (mounted.current) setError(errorMessage(failure)); });
    return () => { mounted.current = false; };
  }, []);

  const verifyPassword = async () => {
    const password = await showPasswordPrompt({
      title: tr('确认身份', 'Confirm identity', 'Sahkan identiti'),
      message: tr('更改验证器前，请验证当前密码。', 'Verify your current password before changing authenticators.', 'Sahkan kata laluan semasa sebelum menukar pengesah.'),
      inputLabel: tr('当前密码', 'Current password', 'Kata laluan semasa')
    });
    if (password === null) return null;
    return reauthenticateCurrentFirebaseStaff(password, requestCode);
  };
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (failure) {
      if (mounted.current) {
        setError(errorMessage(failure));
        if (staffMfaErrorCode(failure) !== 'auth/invalid-verification-code') setEnrollment(null);
      }
    } finally { if (mounted.current) setBusy(false); }
  };
  const begin = () => run(async () => {
    const user = await verifyPassword();
    if (!user || !mounted.current) return;
    const next = await beginStaffTotpEnrollment(user.uid);
    // Generate locally: the enrollment secret must never reach an image service.
    const { toDataURL } = await import('qrcode');
    const qr = await toDataURL(next.secret.generateQrCodeUrl(next.email, 'DR Racing'), { width: 224, margin: 2 });
    if (mounted.current) { setEnrollment({ ...next, qr }); setCode(''); }
  });
  const finish = () => run(async () => {
    if (!enrollment) return;
    await finishStaffTotpEnrollment(enrollment.uid, enrollment.secret, code, name);
    if (!mounted.current) return;
    setEnrollment(null); setCode('');
    setMessage(tr('验证器已添加。请在独立的无痕浏览器窗口测试一次完整登录，再移除旧验证器。', 'Authenticator added. Test a full sign-in in a separate private browser window before removing an old authenticator.', 'Pengesah ditambah. Uji log masuk penuh dalam tetingkap pelayar peribadi berasingan sebelum membuang pengesah lama.'));
    setStatus(await getStaffMfaStatus());
  });
  const remove = (factor: MultiFactorInfo) => run(async () => {
    const confirmed = await showConfirm({
      title: tr('移除验证器', 'Remove authenticator', 'Buang pengesah'), tone: 'warning',
      message: factors?.length === 1
        ? tr('这是最后一个验证器。移除后，此账号将只需要密码登录。若要换手机，请先添加并测试新的验证器。', 'This is your last authenticator. Removing it leaves password-only sign-in. To replace a phone, add and test the new authenticator first.', 'Ini pengesah terakhir anda. Membuangnya membolehkan log masuk dengan kata laluan sahaja. Tambah dan uji pengesah baharu dahulu untuk menukar telefon.')
        : tr('请确认新的验证器已经可以登录，再移除这个验证器。', 'Confirm your replacement authenticator works before removing this one.', 'Pastikan pengesah gantian berfungsi sebelum membuang yang ini.')
    });
    if (!confirmed || !mounted.current) return;
    const user = await verifyPassword();
    if (!user || !mounted.current) return;
    await removeStaffTotpFactor(user.uid, factor.uid);
    if (mounted.current) setStatus(await getStaffMfaStatus());
  });

  return <section className="mt-5 rounded-card border border-slate-100 bg-slate-50 p-4" aria-label="Authenticator security" data-testid="staff-mfa-settings">
    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-500" /><h3 className="text-footnote font-bold text-slate-700">{tr('验证器 App（两步验证）', 'Authenticator app (two-step verification)', 'Aplikasi pengesah (pengesahan dua langkah)')}</h3></div>
    <p className="mt-2 text-caption text-slate-500">{tr('密码正确后，还需要手机验证器的验证码。更换手机前先添加并测试新的验证器。', 'After your password, sign-in also requires a code from your authenticator. Add and test a replacement before changing phones.', 'Selepas kata laluan, log masuk memerlukan kod pengesah. Tambah dan uji pengganti sebelum menukar telefon.')}</p>
    {useFirebaseEmulators ? <p className="mt-3 text-footnote text-amber-700">{tr('Sandbox 不支持真实 TOTP 绑定。请在正式网站设置。', 'Sandbox does not support real TOTP enrollment. Set it up on the live website.', 'Sandbox tidak menyokong pendaftaran TOTP sebenar. Tetapkannya di laman langsung.')}</p> : <>
      {!enrollment && <>
        {status && (!status.hasUsableEmail || !status.emailVerified) && <div className="mt-3 space-y-2 text-footnote text-amber-700">
          <p>{status.hasUsableEmail
            ? tr('请完成登录邮箱验证后再添加验证器。', 'Verify your login email before adding an authenticator.', 'Sahkan e-mel log masuk sebelum menambah pengesah.')
            : tr('请先在上方个人资料中，把内部登录邮箱改为你能收信的邮箱。', 'First update the internal login email in your profile above to a mailbox you can access.', 'Tukar e-mel log masuk dalaman dalam profil di atas kepada peti mel yang boleh anda akses.')}</p>
          {status.hasUsableEmail && <button type="button" disabled={busy} onClick={() => void run(async () => {
            const sent = await sendStaffMfaVerificationEmail();
            if (!mounted.current) return;
            setStatus(await getStaffMfaStatus());
            setMessage(sent ? tr('验证邮件已发送。点击邮件中的链接后，返回这里检查验证状态。', 'Verification email sent. Follow its link, then return here to check verification.', 'E-mel pengesahan dihantar. Ikuti pautannya, kemudian kembali untuk menyemak pengesahan.') : tr('邮箱已验证。', 'Email verified.', 'E-mel disahkan.'));
          })} className="rounded-control bg-white px-3 py-2 ring-1 ring-amber-200">{tr('发送验证邮件', 'Send verification email', 'Hantar e-mel pengesahan')}</button>}
          <button type="button" disabled={busy} onClick={() => void run(async () => { setStatus(await getStaffMfaStatus()); })} className="ml-2 rounded-control bg-white px-3 py-2 ring-1 ring-slate-200">{tr('检查验证状态', 'Check verification', 'Semak pengesahan')}</button>
        </div>}
        <p className="mt-3 text-footnote">{!status ? tr('正在检查…', 'Checking…', 'Menyemak…') : factors.length ? tr('两步验证已启用', 'Two-step verification enabled', 'Pengesahan dua langkah diaktifkan') : tr('尚未设置验证器', 'No authenticator set up', 'Belum menyediakan pengesah')}</p>
        {factors?.map((factor, index) => <div key={factor.uid} className="mt-2 flex items-center justify-between gap-2 text-footnote"><span>{factor.displayName || `Authenticator ${index + 1}`}</span><button type="button" disabled={busy} onClick={() => void remove(factor)} className="rounded-control px-3 py-2 text-rose-700 disabled:opacity-50">{tr('移除', 'Remove', 'Buang')}</button></div>)}
        <button type="button" disabled={busy || !status?.hasUsableEmail || !status.emailVerified} onClick={() => void begin()} className="mt-3 rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white disabled:bg-slate-300">{busy ? tr('验证中…', 'Verifying…', 'Mengesahkan…') : tr('添加验证器', 'Add authenticator', 'Tambah pengesah')}</button>
      </>}
      {enrollment && <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); void finish(); }}>
        <p className="text-footnote">{tr('用验证器 App 扫码，或手动输入下方密钥。不要分享二维码或密钥。', 'Scan with your authenticator app, or enter the key below manually. Do not share the QR code or key.', 'Imbas dengan aplikasi pengesah, atau masukkan kunci di bawah secara manual. Jangan kongsi kod QR atau kunci.')}</p>
        <img src={enrollment.qr} width={224} height={224} alt={tr('验证器设置二维码', 'Authenticator setup QR code', 'Kod QR persediaan pengesah')} />
        <code className="block break-all rounded-control bg-white p-3 text-footnote select-all">{enrollment.secret.secretKey}</code>
        <label className="block text-footnote">{tr('验证器名称', 'Authenticator name', 'Nama pengesah')}<input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-control bg-white px-3 py-2 ring-1 ring-slate-200" /></label>
        <label className="block text-footnote">{tr('6 位验证码', 'Six-digit code', 'Kod enam digit')}<input value={code} onChange={(event) => setCode(event.target.value)} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required className="mt-1 w-full rounded-control bg-white px-3 py-2 ring-1 ring-slate-200" /></label>
        <div className="flex gap-3"><button disabled={busy || !/^\d{6}$/.test(code)} className="rounded-control bg-brand px-4 py-2 text-footnote font-bold text-white disabled:bg-slate-300">{tr('验证并启用', 'Verify and enable', 'Sahkan dan aktifkan')}</button><button type="button" disabled={busy} onClick={() => { setEnrollment(null); setCode(''); setError(''); }} className="rounded-control px-4 py-2 text-footnote">{tr('取消', 'Cancel', 'Batal')}</button></div>
      </form>}
    </>}
    {error && <p role="alert" className="mt-3 text-footnote text-rose-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-footnote text-emerald-700">{message}</p>}
    <p className="mt-3 text-caption text-slate-500">{tr('无法使用手机时，请联系项目负责人核实身份并恢复账号。密码重设不会移除两步验证。', 'If you lose access to your phone, contact the project owner for identity checks and account recovery. A password reset does not remove two-step verification.', 'Jika telefon tidak dapat diakses, hubungi pemilik projek untuk pengesahan identiti dan pemulihan akaun. Tetapan semula kata laluan tidak membuang pengesahan dua langkah.')}</p>
  </section>;
}
