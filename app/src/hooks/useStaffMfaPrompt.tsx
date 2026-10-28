import React from 'react';
import { useBrandedDialog } from '../components/BrandedDialogProvider';
import { tr } from '../lib/i18n';
import type { RequestStaffTotp } from '../lib/staffMfa';

export function useStaffMfaPrompt(): RequestStaffTotp {
  const { showPasswordPrompt } = useBrandedDialog();
  return async (factors, retry, selectedEnrollmentId) => {
    let enrollmentId = factors.find((factor) => factor.uid === selectedEnrollmentId)?.uid || factors[0]?.uid || '';
    const code = await showPasswordPrompt({
      title: tr('验证器验证码', 'Authenticator code', 'Kod pengesah'),
      message: retry
        ? tr('验证码不正确，请输入 App 当前显示的验证码。', 'That code was not accepted. Enter the current code from your app.', 'Kod tidak diterima. Masukkan kod semasa daripada aplikasi anda.')
        : tr('请输入验证器 App 的 6 位验证码以继续。', 'Enter the six-digit code from your authenticator app to continue.', 'Masukkan kod enam digit daripada aplikasi pengesah untuk meneruskan.'),
      inputLabel: tr('6 位验证码', 'Six-digit code', 'Kod enam digit'),
      inputType: 'totp',
      detail: factors.length > 1 ? <label className="block text-footnote">
        {tr('验证器', 'Authenticator', 'Pengesah')}
        <select className="mt-2 w-full rounded-control bg-white p-2" defaultValue={enrollmentId} onChange={(event) => { enrollmentId = event.target.value; }}>
          {factors.map((factor, index) => <option key={factor.uid} value={factor.uid}>{factor.displayName || `Authenticator ${index + 1}`}</option>)}
        </select>
      </label> : undefined
    });
    return code === null ? null : { enrollmentId, code };
  };
}
