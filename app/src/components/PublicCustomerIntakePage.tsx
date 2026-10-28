/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Banknote, CheckCircle2, Landmark, Users } from 'lucide-react';
import ToggleOptionGroup from './ToggleOptionGroup';
import FileDropZone from './FileDropZone';
import StartYearMonthInput, { YearsMonthsDurationInput } from './StartYearMonthInput';
import { tr } from '../lib/i18n';
import { fieldLabelWith, FROM_IC } from '../data/fieldLabels';
import { deriveMalaysiaIcBirthDate } from '../utils/malaysiaIc';
import {
  GENDER_OPTIONS,
  getSalaryBankOptions,
  hasChildrenQuestion,
  HOUSING_STATUS_OPTIONS,
  LOAN_TENURE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RACE_OPTIONS
} from '../utils/customerApplicationForm';
import {
  getCustomerIntakeValidationIssues,
  type CustomerIntakeValidationIssue
} from '../utils/customerIntakeValidation';
import { getCustomerDocumentUploadLimit } from '../utils/documentChecklist';
import type { CustomerDocumentKey, PurchaseMethod, VehicleCondition } from '../types';
import { newId } from '../utils/id';
import { prepareDocumentFileForUpload } from '../lib/documentImageCompression';

// One line in remarks, which the Rules cap at 1000 characters with the intake note in front.
export const CUSTOMER_REMARK_MAX_LENGTH = 600;

export type CustomerIntakeDraft = {
  applicant_name: string;
  phone_no: string;
  ic_no: string;
  vehicle_model: string;
  vehicle_condition: VehicleCondition;
  purchase_method: PurchaseMethod;
  total_cash_price: string;
  motor_mileage: string;
  email: string;
  full_address: string;
  resident_address: string;
  bank_name: string;
  account_number: string;
  gender: string;
  race: string;
  marital_status: string;
  number_of_children: string;
  housing_status: string;
  years_at_residence: string;
  residence_start_year: string;
  residence_start_month: string;
  emergency_contact_1_full_name: string;
  emergency_contact_1_relationship: string;
  emergency_contact_1_full_address: string;
  emergency_contact_1_phone_no: string;
  emergency_contact_2_full_name: string;
  emergency_contact_2_relationship: string;
  emergency_contact_2_full_address: string;
  emergency_contact_2_phone_no: string;
  company_name: string;
  position: string;
  years_employed: string;
  employment_start_year: string;
  employment_start_month: string;
  company_address: string;
  office_phone_no: string;
  gross_monthly_salary: string;
  net_monthly_salary: string;
  available_to_receive_calls: string;
  salary_payment_method: string;
  preferred_motorcycle: string;
  loan_tenure: string;
  /** Free text from the customer, e.g. the payslip PDF password (owner 2026-10-20). */
  customer_remark: string;
};

export type CustomerIntakeDocumentDraft = {
  id: string;
  document_key: 'ic' | 'payslip' | 'bank_statement' | 'vehicle_geran';
  file_name: string;
  file_type: string;
  file_size: number;
  file_data_url: string;
};

export type CustomerIntakeSubmitError =
  | ''
  | 'authentication'
  | 'documents-incomplete'
  | 'link-inactive'
  | 'network'
  | 'permission-denied'
  | 'rate-limited'
  | 'timeout'
  | 'unknown';

type CustomerIntakeCopy = Record<string, string>;

interface PublicCustomerIntakePageProps {
  activeBankOptions: string[];
  canSubmit: boolean;
  copy: CustomerIntakeCopy;
  draft: CustomerIntakeDraft;
  formatIcNumber: (value: string) => string;
  formatPhoneNumber: (value: string) => string;
  headerControls: React.ReactNode;
  icValid: boolean;
  loanTenureOptions: string[];
  onSubmit: (documents: CustomerIntakeDocumentDraft[]) => void;
  onUpdateDraft: (field: keyof CustomerIntakeDraft, value: string) => void;
  phoneValid: boolean;
  salesName: string;
  assignmentPending?: boolean;
  isSubmitting?: boolean;
  submitError?: CustomerIntakeSubmitError;
  submittedApplicationId: string;
  // A retry after a timeout re-sent the earlier content; later edits were not sent.
  submittedWithoutLaterChanges?: boolean;
}

const inputClass = 'rounded-control border border-slate-100 bg-white px-3 py-2.5 text-callout text-slate-700 outline-none focus:ring-1 focus:ring-indigo-100';
const labelClass = 'text-micro uppercase text-slate-400';
const sectionTitleClass = 'text-headline text-slate-900';
const RequiredMark = () => <span aria-hidden="true" className="text-rose-500"> *</span>;
const CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
// 照片上传前会自动压缩，所以原图可以更大；压缩后仍要 ≤ 10MB（storage.rules 的上限）。
const CUSTOMER_DOCUMENT_MAX_PHOTO_INPUT_BYTES = 25 * 1024 * 1024;
const toJpegFileName = (fileName: string) => (
  /\.jpe?g$/i.test(fileName) ? fileName : `${fileName.replace(/\.[^./]+$/, '')}.jpg`
);
const documentTooLargeMessage = (fileName: string, limitMb: number) => tr(
  `${fileName}：每个文件必须小于或等于 ${limitMb}MB。`,
  `${fileName}: each file must be ${limitMb}MB or smaller.`,
  `${fileName}: setiap fail mestilah ${limitMb}MB atau lebih kecil.`
);
const CUSTOMER_DOCUMENT_ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const normalizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = cleaned.split('.');
  return decimalParts.length > 0 ? `${whole}.${decimalParts.join('').slice(0, 2)}` : whole;
};

export default function PublicCustomerIntakePage({
  activeBankOptions,
  canSubmit,
  copy,
  draft,
  formatIcNumber,
  formatPhoneNumber,
  headerControls,
  icValid,
  loanTenureOptions,
  onSubmit,
  onUpdateDraft,
  phoneValid,
  salesName,
  assignmentPending = false,
  isSubmitting = false,
  submitError = '',
  submittedApplicationId,
  submittedWithoutLaterChanges = false
}: PublicCustomerIntakePageProps) {
  const intakeFieldsRef = React.useRef<HTMLDivElement>(null);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);
  const [documents, setDocuments] = React.useState<CustomerIntakeDocumentDraft[]>([]);
  const [documentError, setDocumentError] = React.useState('');
  const [isPreparingDocuments, setIsPreparingDocuments] = React.useState(false);
  const salaryBankListId = React.useId();
  const icErrorId = React.useId();
  const detectedBirthDate = deriveMalaysiaIcBirthDate(draft.ic_no);
  const salaryBankOptions = getSalaryBankOptions(activeBankOptions);
  const isCashPurchase = draft.purchase_method === 'Cash';
  const isLoanPurchase = draft.purchase_method === 'Loan';
  const isUsedVehicle = draft.vehicle_condition === 'Used';
  const icFormatError = draft.ic_no.trim() && !icValid
    ? tr(
      '身份证号码必须是含有效出生日期的 12 位数字。',
      'Enter a valid 12-digit IC number with a valid birth date.',
      'Masukkan nombor IC 12 digit dengan tarikh lahir yang sah.'
    )
    : '';
  React.useEffect(() => {
    const allowedKeys = new Set<CustomerIntakeDocumentDraft['document_key']>([
      'ic',
      ...(isLoanPurchase ? ['payslip' as const, 'bank_statement' as const] : [])
    ]);
    setDocuments((current) => {
      const next = current.filter((document) => allowedKeys.has(document.document_key));
      return next.length === current.length ? current : next;
    });
  }, [isLoanPurchase]);
  const selectDocuments = async (documentKey: CustomerIntakeDocumentDraft['document_key'], files: File[]) => {
    setDocumentError('');
    if (files.length === 0 || isPreparingDocuments) return;

    const uploadLimit = getCustomerDocumentUploadLimit(documentKey as CustomerDocumentKey);
    const existingCount = documents.filter((document) => document.document_key === documentKey).length;
    if (existingCount + files.length > uploadLimit) {
      setDocumentError(tr(
        `${documentKey === 'ic' ? '身份证文件' : documentKey === 'payslip' ? '工资单' : '补充文件'}最多只能上传 ${uploadLimit} 个。`,
        `${documentKey === 'ic' ? 'IC Document' : documentKey === 'payslip' ? 'Payslip' : 'Supporting Doc'} accepts up to ${uploadLimit} files.`,
        `${documentKey === 'ic' ? 'Dokumen IC' : documentKey === 'payslip' ? 'Slip Gaji' : 'Dokumen Sokongan'} menerima sehingga ${uploadLimit} fail.`
      ));
      return;
    }

    const unsupportedFile = files.find((file) => !CUSTOMER_DOCUMENT_ACCEPTED_TYPES.has(file.type));
    if (unsupportedFile) {
      setDocumentError(tr(
        `${unsupportedFile.name}：只支持 PDF、JPEG、PNG 或 WebP 文件。`,
        `${unsupportedFile.name}: only PDF, JPEG, PNG, or WebP files are supported.`,
        `${unsupportedFile.name}: hanya fail PDF, JPEG, PNG atau WebP disokong.`
      ));
      return;
    }

    const maxInputBytes = (file: File) => (
      file.type.startsWith('image/') ? CUSTOMER_DOCUMENT_MAX_PHOTO_INPUT_BYTES : CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES
    );
    const invalidSizeFile = files.find((file) => file.size <= 0 || file.size > maxInputBytes(file));
    if (invalidSizeFile) {
      setDocumentError(documentTooLargeMessage(invalidSizeFile.name, maxInputBytes(invalidSizeFile) / 1024 / 1024));
      return;
    }

    setIsPreparingDocuments(true);
    try {
      const selectedAt = Date.now();
      const preparedFiles = await Promise.all(files.map(async (file) => ({
        file,
        prepared: await prepareDocumentFileForUpload(file)
      })));
      const stillTooLarge = preparedFiles.find(({ prepared }) => prepared.fileSize > CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES);
      if (stillTooLarge) {
        setDocumentError(documentTooLargeMessage(stillTooLarge.file.name, CUSTOMER_DOCUMENT_MAX_FILE_SIZE_BYTES / 1024 / 1024));
        return;
      }
      const preparedDocuments = preparedFiles.map(({ file, prepared }) => ({
        id: newId(documentKey),
        document_key: documentKey,
        file_name: prepared.compressed ? toJpegFileName(file.name) : file.name,
        file_type: prepared.fileType,
        file_size: prepared.fileSize,
        file_data_url: prepared.dataUrl
      }));
      setDocuments((current) => [
        ...current,
        ...preparedDocuments
      ].sort((left, right) => {
        const order = { ic: 0, payslip: 1, bank_statement: 2, vehicle_geran: 3 };
        return order[left.document_key] - order[right.document_key];
      }));
    } catch {
      setDocumentError(tr(
        '无法读取这个文件，请重新选择。',
        'This file could not be read. Select it again.',
        'Fail ini tidak dapat dibaca. Pilih semula.'
      ));
    } finally {
      setIsPreparingDocuments(false);
    }
  };
  const removeDocument = (documentId: string) => {
    setDocumentError('');
    setDocuments((current) => current.filter((document) => document.id !== documentId));
  };
  const validationIssueLabels: Record<CustomerIntakeValidationIssue, string> = {
    purchase_method: tr('请选择购买方式。', 'Select a purchase method.', 'Pilih kaedah pembelian.'),
    vehicle_model: tr('请填写想要的摩托。', 'Enter the preferred motorcycle.', 'Masukkan motosikal pilihan.'),
    vehicle_condition: tr('请选择新车或二手车。', 'Select New or Used.', 'Pilih Baharu atau Terpakai.'),
    total_cash_price: tr('请填写现金总价。', 'Enter the total cash price.', 'Masukkan jumlah harga tunai.'),
    applicant_name: tr('请填写姓名。', 'Enter the full name.', 'Masukkan nama penuh.'),
    phone_no_required: tr('请填写电话号码。', 'Enter the phone number.', 'Masukkan nombor telefon.'),
    phone_no_invalid: tr('电话号码格式不正确。', 'Enter a valid Malaysian phone number.', 'Masukkan nombor telefon Malaysia yang sah.'),
    ic_no_required: tr('请填写身份证号码。', 'Enter the IC number.', 'Masukkan nombor IC.'),
    ic_no_invalid: icFormatError,
    email_required: tr('请填写电邮。', 'Enter the email address.', 'Masukkan alamat e-mel.'),
    email_invalid: tr('电邮格式不正确。', 'Enter a valid email address.', 'Masukkan alamat e-mel yang sah.'),
    gender: tr('请选择性别。', 'Select the gender.', 'Pilih jantina.'),
    race: tr('请选择种族。', 'Select the race.', 'Pilih bangsa.'),
    marital_status: tr('请选择婚姻状态。', 'Select the marital status.', 'Pilih status perkahwinan.'),
    number_of_children: tr('请填写孩子数量(没有就填 0)。', 'Enter the number of children (0 if none).', 'Masukkan bilangan anak (0 jika tiada).'),
    years_at_residence: tr('请填写在现址住了几年几个月。', 'Enter how many years and months you have lived here.', 'Isi berapa tahun dan bulan anda menetap di sini.'),
    housing_status: tr('请选择住房状态。', 'Select the housing status.', 'Pilih status perumahan.'),
    full_address: tr('请填写 IC 上的永久地址。', 'Enter the Permanent Address (IC).', 'Masukkan Alamat Tetap (IC).'),
    resident_address: tr('请填写居住地址。', 'Enter the Resident Address.', 'Masukkan Alamat Kediaman.'),
    emergency_contact_1_full_name: `${copy.emergencyContact1}: ${copy.fullName}`,
    emergency_contact_1_relationship: `${copy.emergencyContact1}: ${copy.relationship}`,
    emergency_contact_1_phone_no_required: `${copy.emergencyContact1}: ${copy.phoneNumber}`,
    emergency_contact_1_phone_no_invalid: tr('紧急联系人 1 电话格式不正确。', 'Emergency Contact 1 needs a valid Malaysian phone number.', 'Kenalan Kecemasan 1 memerlukan nombor telefon Malaysia yang sah.'),
    emergency_contact_1_full_address: `${copy.emergencyContact1}: ${copy.fullAddress}`,
    emergency_contact_2_full_name: `${copy.emergencyContact2}: ${copy.fullName}`,
    emergency_contact_2_relationship: `${copy.emergencyContact2}: ${copy.relationship}`,
    emergency_contact_2_phone_no_required: `${copy.emergencyContact2}: ${copy.phoneNumber}`,
    emergency_contact_2_phone_no_invalid: tr('紧急联系人 2 电话格式不正确。', 'Emergency Contact 2 needs a valid Malaysian phone number.', 'Kenalan Kecemasan 2 memerlukan nombor telefon Malaysia yang sah.'),
    emergency_contact_2_full_address: `${copy.emergencyContact2}: ${copy.fullAddress}`,
    gross_monthly_salary: copy.grossMonthlySalary,
    net_monthly_salary: copy.netMonthlySalary,
    company_name: copy.companyName,
    position: copy.position,
    years_employed: tr('请选择开始上班的年和月。', 'Pick the year and month you started work.', 'Pilih tahun dan bulan mula bekerja.'),
    office_phone_no_required: copy.officePhone,
    office_phone_no_invalid: tr('公司电话格式不正确。', 'Enter a valid Malaysian office phone number.', 'Masukkan nombor telefon pejabat Malaysia yang sah.'),
    company_address: copy.companyAddress,
    available_to_receive_calls: copy.availableToReceiveCalls,
    salary_payment_method: tr('薪资收取方式', 'Salary Paid By', 'Gaji Dibayar Melalui'),
    bank_name: copy.bankName,
    account_number: copy.bankAccountNumber,
    loan_tenure: copy.loanTenure
  };
  const validationIssues = getCustomerIntakeValidationIssues(draft).map((issue) => ({
    issue,
    label: validationIssueLabels[issue]
  }));
  const handleIntakeKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== 'Enter'
      || event.shiftKey
      || event.ctrlKey
      || event.metaKey
      || event.altKey
      || event.nativeEvent.isComposing
      || !(event.target instanceof HTMLInputElement)
      || event.target.type === 'file'
      || event.target.readOnly
      || event.target.list
    ) {
      return;
    }

    const focusableFields = Array.from(intakeFieldsRef.current?.querySelectorAll<HTMLElement>(
      'input:not([type="file"]):not([disabled]):not([readonly]), textarea:not([disabled]), button:not([disabled])'
    ) || []);
    const currentIndex = focusableFields.indexOf(event.target);
    const nextField = focusableFields[currentIndex + 1];

    if (!nextField) {
      return;
    }

    event.preventDefault();
    nextField.focus();
    nextField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const uploadDocumentFields = [
    { key: 'ic' as const, label: tr('身份证文件', 'IC Document', 'Dokumen IC') },
    ...(isLoanPurchase
      ? [
          { key: 'payslip' as const, label: tr('工资单', 'Payslip', 'Slip Gaji') },
          {
            key: 'bank_statement' as const,
            label: tr('补充文件', 'Supporting Doc', 'Dokumen Sokongan')
          }
        ]
      : []),
  ];
  const uploadDocumentsSection = (
    <section className="space-y-3">
      <div>
        <h3 className={sectionTitleClass}>
          {tr('上传文件', 'Upload Documents', 'Muat Naik Dokumen')}
          <span className="ml-2 rounded-chip bg-slate-100 px-1.5 py-0.5 text-micro tracking-normal uppercase tracking-wide text-slate-500">
            {tr('选填', 'Optional', 'Pilihan')}
          </span>
        </h3>
        <p className="mt-1 text-footnote text-slate-400">
          {tr(
            '这部分可以跳过。支持一次选择多个 PDF 或图片；身份证最多 2 个，工资单和补充文件各最多 3 个，每个文件最多 10MB。',
            'You may skip this section. Select multiple PDFs or images at once: up to 2 IC files, 3 Payslips, and 3 Supporting Docs; 10MB per file.',
            'Bahagian ini boleh dilangkau. Pilih berbilang PDF atau imej sekali gus: sehingga 2 fail IC, 3 Slip Gaji dan 3 Dokumen Sokongan; 10MB setiap fail.'
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {uploadDocumentFields.map(({ key, label }) => {
          const selectedDocuments = documents.filter((document) => document.document_key === key);
          const uploadLimit = getCustomerDocumentUploadLimit(key);
          const limitReached = selectedDocuments.length >= uploadLimit;
          return (
            <FileDropZone
              key={key}
              testId={`public-document-drop-${key}`}
              className="rounded-card border border-slate-200 bg-slate-50/50 p-4"
              activeClassName="ring-2 ring-brand-100 bg-brand-50"
              disabled={limitReached || isPreparingDocuments}
              onFiles={(files) => { void selectDocuments(key, files); }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-footnote font-bold text-slate-700">{label}</p>
                <span className="text-micro tracking-normal text-slate-400">{selectedDocuments.length}/{uploadLimit}</span>
              </div>
              <label className={`mt-3 inline-flex items-center justify-center rounded-control bg-white px-3 py-2 text-footnote font-bold ring-1 ring-slate-200 ${limitReached || isPreparingDocuments ? 'cursor-not-allowed text-slate-400 opacity-60' : 'cursor-pointer text-brand-ink hover:bg-brand-50'}`}>
                  {limitReached ? tr('已达上限', 'Limit reached', 'Had dicapai') : tr('选择文件', 'Choose files', 'Pilih fail')}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    aria-label={`Upload ${
                      key === 'ic'
                        ? 'IC'
                        : key === 'payslip'
                          ? 'Payslip'
                          : 'Supporting Doc'
                    }`}
                    className="sr-only"
                    disabled={limitReached || isPreparingDocuments}
                    onChange={(event) => {
                      void selectDocuments(key, Array.from(event.target.files || []));
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
              <div className="mt-3 space-y-2">
                {selectedDocuments.length === 0 ? (
                  <p className="rounded-control bg-white px-3 py-2 text-caption text-slate-400">
                    {tr('尚未上传', 'No file selected', 'Tiada fail dipilih')}
                  </p>
                ) : selectedDocuments.map((selectedDocument) => (
                  <div key={selectedDocument.id} className="flex items-center justify-between gap-3 rounded-control bg-white px-3 py-2 ring-1 ring-slate-100">
                    <div className="min-w-0">
                      <p className="truncate text-footnote text-slate-700">{selectedDocument.file_name}</p>
                      <p className="mt-0.5 text-micro tracking-normal text-slate-400">
                        {(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(selectedDocument.id)}
                      className="shrink-0 text-footnote font-bold text-rose-600 hover:text-rose-700"
                    >
                      {tr('移除', 'Remove', 'Alih keluar')}
                    </button>
                  </div>
                ))}
              </div>
            </FileDropZone>
          );
        })}
      </div>
      {documentError && (
        <p role="alert" className="text-footnote text-rose-700">{documentError}</p>
      )}
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>
          {tr('备注', 'Remark', 'Catatan')}
          <span className="ml-2 rounded-chip bg-slate-100 px-1.5 py-0.5 text-micro tracking-normal uppercase tracking-wide text-slate-500">
            {tr('选填', 'Optional', 'Pilihan')}
          </span>
        </span>
        <textarea
          value={draft.customer_remark}
          onChange={(event) => onUpdateDraft('customer_remark', event.target.value.slice(0, CUSTOMER_REMARK_MAX_LENGTH))}
          maxLength={CUSTOMER_REMARK_MAX_LENGTH}
          placeholder={tr('例如:工资单 PDF 的密码', 'For example: the password of your payslip PDF', 'Contoh: kata laluan PDF slip gaji anda')}
          aria-label="Customer intake remark"
          className={`${inputClass} min-h-20`}
        />
      </label>
    </section>
  );
  const submitErrorReason = submitError === 'authentication'
    ? tr(
      '无法建立安全提交身份，请刷新页面后再试。',
      'A secure submission session could not be created. Refresh the page and try again.',
      'Sesi penyerahan selamat tidak dapat dibuat. Muat semula halaman dan cuba lagi.'
    )
    : submitError === 'link-inactive'
    ? tr(
      '这个申请链接已失效或已被停用，申请没有提交。请向销售员索取新的链接。',
      'This application link is no longer active, so the application was not submitted. Ask the salesperson for a new link.',
      'Pautan permohonan ini tidak lagi aktif, jadi permohonan tidak dihantar. Minta pautan baharu daripada jurujual.'
    )
    : submitError === 'network'
      ? tr(
        '网络连接中断，请检查网络后再试。',
        'The network connection was interrupted. Check your connection and try again.',
        'Sambungan rangkaian terputus. Semak sambungan anda dan cuba lagi.'
      )
      : submitError === 'permission-denied'
        ? tr(
          '系统拒绝了这次提交；链接可能已失效。请重新打开有效链接或联系销售员。',
          'The submission was rejected. The link may be inactive. Reopen a valid link or contact the salesperson.',
          'Penyerahan ditolak. Pautan mungkin tidak aktif. Buka semula pautan yang sah atau hubungi jurujual.'
        )
        : submitError === 'rate-limited'
          ? tr(
            '这个网络或这个链接短时间内提交了太多申请，这次没有提交。请一小时后再试，或直接联系销售员。',
            'Too many applications were sent from this network or this link in a short time, so this one was not submitted. Try again in an hour or contact the salesperson directly.',
            'Terlalu banyak permohonan dihantar dari rangkaian atau pautan ini dalam masa singkat, jadi permohonan ini tidak dihantar. Cuba lagi selepas sejam atau hubungi jurujual terus.'
          )
        : submitError === 'documents-incomplete'
          ? tr(
            '你的资料已经提交，销售员会联系你。但有文件因网络太慢没有上传完成。请再按一次「提交申请」，只会补传文件，不会重复提交；也可以稍后把文件直接发给销售员。',
            'Your details have been submitted and the salesperson will contact you. Some files did not finish uploading because the connection is slow. Press Submit Application again to upload only the files (nothing is submitted twice), or send the files to the salesperson later.',
            'Butiran anda telah dihantar dan jurujual akan menghubungi anda. Sesetengah fail tidak selesai dimuat naik kerana sambungan perlahan. Tekan Hantar Permohonan sekali lagi untuk memuat naik fail sahaja (tiada penghantaran berganda), atau hantar fail kepada jurujual kemudian.'
          )
        : submitError === 'timeout'
          ? tr(
            '结果待确认：服务器没有及时回应，申请可能已经送达。请稍等片刻再按提交，系统会先核对并按原来的资料重发，不会重复提交。',
            'Result pending: the server did not respond in time and your application may already have arrived. Wait a moment and press Submit again; it is checked first, re-sends the same details, and will not be submitted twice.',
            'Keputusan belum disahkan: pelayan tidak memberi respons tepat pada masanya dan permohonan anda mungkin sudah diterima. Tunggu sebentar dan tekan Hantar semula; ia akan disemak dahulu, menghantar butiran yang sama, dan tidak akan dihantar dua kali.'
          )
          : submitError === 'unknown'
            ? tr(
              '系统发生无法识别的错误，请稍后再试或联系销售员。',
              'The system returned an unexpected error. Try again shortly or contact the salesperson.',
              'Sistem mengalami ralat yang tidak dijangka. Cuba lagi sebentar lagi atau hubungi jurujual.'
            )
            : '';

  return (
    <div className="customer-intake-form min-h-screen bg-[#F9FAFB] px-4 py-8 text-[#1F2937] font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-panel border border-slate-100 bg-white p-6 shadow-e1">
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-brand text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-title-3 text-slate-900">{copy.customerIntakeTitle}</h1>
                <p className="mt-1 text-body leading-relaxed text-slate-500">
                  {assignmentPending
                    ? copy.seoIntakeStaffNote
                    : `${copy.customerIntakeSubmittedTo} ${salesName}. ${copy.customerIntakeStaffNote}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
              {headerControls}
            </div>
          </div>
        </div>

        <div className="rounded-panel border border-slate-100 bg-white p-6 shadow-e1">
          {submittedApplicationId ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-title-3 text-slate-900">{copy.submitted}</h2>
              <p className="mt-2 text-body text-slate-500">
                {copy.reference}: <span className="font-mono font-bold text-slate-700">{submittedApplicationId}</span>
              </p>
              {submittedWithoutLaterChanges && (
                <p role="status" className="mx-auto mt-4 max-w-md rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-footnote text-amber-800">
                  {tr(
                    '系统收到的是你第一次提交的资料；之后修改的内容没有提交。如需更正，请联系销售员。',
                    'We received the details from your first submission; changes made afterwards were not sent. Contact the salesperson to correct anything.',
                    'Kami menerima butiran daripada penyerahan pertama anda; perubahan selepas itu tidak dihantar. Hubungi jurujual untuk membetulkan apa-apa.'
                  )}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className={sectionTitleClass}>{copy.customerLoanInfo}</h2>
                <p className="mt-1 text-footnote text-slate-400">{copy.customerLoanInfoNote}</p>
              </div>

              <div
                ref={intakeFieldsRef}
                onKeyDownCapture={handleIntakeKeyDownCapture}
                className="space-y-6"
              >
                <section className="space-y-3">
                  <h3 className={sectionTitleClass}>
                    {tr('购买方式', 'Purchase Method', 'Kaedah Pembelian')} <span aria-hidden="true" className="text-rose-500">*</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {([
                      {
                        value: 'Cash' as PurchaseMethod,
                        label: tr('现金购买', 'Cash Purchase', 'Pembelian Tunai'),
                        helper: tr('填写身份、地址、车辆与现金价格。', 'Enter identity, address, vehicle, and cash price details.', 'Masukkan identiti, alamat, kenderaan dan harga tunai.'),
                        Icon: Banknote
                      },
                      {
                        value: 'Loan' as PurchaseMethod,
                        label: tr('申请贷款', 'Apply for Loan', 'Mohon Pinjaman'),
                        helper: tr('请填写所有贷款资料；只有上传文件可跳过。', 'Complete all loan details; only document uploads are optional.', 'Lengkapkan semua butiran pinjaman; hanya muat naik dokumen adalah pilihan.'),
                        Icon: Landmark
                      }
                    ]).map(({ value, label, helper, Icon }) => {
                      const selected = draft.purchase_method === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={label}
                          aria-pressed={selected}
                          onClick={() => onUpdateDraft('purchase_method', value)}
                          className={`flex items-start gap-3 rounded-card border p-4 text-left transition-colors ${
                            selected
                              ? 'border-brand-100 bg-brand-50 text-brand-ink ring-1 ring-brand-100'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-brand-ink' : 'text-slate-400'}`} />
                          <span>
                            <span className="block text-headline">{label}</span>
                            <span className="mt-1 block text-footnote font-medium leading-relaxed text-slate-500">{helper}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {draft.purchase_method && (
                  <>
                    <section className="space-y-3">
                      <h3 className={sectionTitleClass}>{tr('车辆资料', 'Vehicle Details', 'Butiran Kenderaan')}</h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>
                            {copy.preferredMotorcycle} <span aria-hidden="true" className="text-rose-500">*</span>
                          </span>
                          <input
                            value={draft.vehicle_model}
                            onChange={(event) => {
                              onUpdateDraft('vehicle_model', event.target.value);
                              onUpdateDraft('preferred_motorcycle', event.target.value);
                            }}
                            placeholder="Y16 ABS"
                            required
                            aria-required="true"
                            className={`${inputClass} ${showValidationErrors && !draft.vehicle_model.trim() ? 'border-rose-200 bg-rose-50/40' : ''}`}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>
                            {tr('新车 / 二手', 'New / Used', 'Baharu / Terpakai')} <span aria-hidden="true" className="text-rose-500">*</span>
                          </span>
                          <ToggleOptionGroup
                            value={draft.vehicle_condition}
                            options={[
                              { value: '', label: copy.notSet },
                              { value: 'New', label: tr('新车', 'New', 'Baharu') },
                              { value: 'Used', label: tr('二手', 'Used', 'Terpakai') }
                            ]}
                            onChange={(value) => onUpdateDraft('vehicle_condition', value as VehicleCondition)}
                            ariaLabel="Customer intake vehicle condition"
                            ariaRequired
                            className="w-full"
                            optionClassName="!py-2.5 !text-callout !font-normal"
                          />
                        </label>
                        {isCashPurchase && (
                          <label className="flex flex-col gap-1.5">
                            <span className={labelClass}>
                              {tr('现金总价', 'Total Cash Price', 'Jumlah Harga Tunai')} <span aria-hidden="true" className="text-rose-500">*</span>
                            </span>
                            <input
                              value={draft.total_cash_price}
                              onChange={(event) => onUpdateDraft('total_cash_price', normalizeDecimalInput(event.target.value))}
                              placeholder="RM 0.00"
                              inputMode="decimal"
                              required
                              aria-required="true"
                              className={inputClass}
                            />
                          </label>
                        )}
                        {/* Loan Tenure sits with the vehicle (meeting 2026-10-13), like the staff forms. */}
                        {draft.purchase_method === 'Loan' && (
                          <label className="flex flex-col gap-1.5 md:col-span-2">
                            <span className={labelClass}>{copy.loanTenure}<RequiredMark /></span>
                            <ToggleOptionGroup
                              value={draft.loan_tenure}
                              options={[
                                { value: '', label: copy.notSet },
                                ...(loanTenureOptions.length > 0 ? loanTenureOptions : [...LOAN_TENURE_OPTIONS])
                                  .map((year) => ({ value: year, label: `${year} years` }))
                              ]}
                              onChange={(value) => onUpdateDraft('loan_tenure', value)}
                              ariaLabel="Customer intake loan tenure"
                              ariaRequired
                              className="w-full"
                              optionClassName="!py-2.5 !text-callout !font-normal"
                            />
                          </label>
                        )}
                        {isUsedVehicle && (
                          <label className="flex flex-col gap-1.5">
                            <span className={labelClass}>
                              {tr('摩托里程', 'Motor Mileage', 'Perbatuan Motosikal')}
                              <span className="ml-1 normal-case tracking-normal text-slate-300">
                                {tr('选填', 'Optional', 'Pilihan')}
                              </span>
                            </span>
                            <input
                              value={draft.motor_mileage}
                              onChange={(event) => onUpdateDraft('motor_mileage', event.target.value.replace(/\D/g, '').slice(0, 9))}
                              placeholder="0"
                              inputMode="numeric"
                              className={inputClass}
                            />
                          </label>
                        )}
                      </div>
                    </section>

                <section className="space-y-3">
                  <h3 className={sectionTitleClass}>{copy.personalInfo}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>
                        {copy.fullName} <span aria-hidden="true" className="text-rose-500">*</span>
                      </span>
                      <input
                        value={draft.applicant_name}
                        onChange={(event) => onUpdateDraft('applicant_name', event.target.value)}
                        placeholder={copy.fullName}
                        required
                        aria-required="true"
                        className={`${inputClass} ${showValidationErrors && !draft.applicant_name.trim() ? 'border-rose-200 bg-rose-50/40' : ''}`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>
                        {copy.phoneNumber} <span aria-hidden="true" className="text-rose-500">*</span>
                      </span>
                      <input
                        value={draft.phone_no}
                        onChange={(event) => onUpdateDraft('phone_no', formatPhoneNumber(event.target.value))}
                        placeholder="+60 12-345 6789"
                        inputMode="tel"
                        required
                        aria-required="true"
                        className={`${inputClass} ${(draft.phone_no && !phoneValid) || (showValidationErrors && !draft.phone_no.trim()) ? 'border-rose-200 bg-rose-50/40' : ''}`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>
                        {copy.icNumber} <span aria-hidden="true" className="text-rose-500">*</span>
                      </span>
                      <input
                        value={draft.ic_no}
                        onChange={(event) => onUpdateDraft('ic_no', formatIcNumber(event.target.value))}
                        placeholder={copy.icNumber}
                        inputMode="numeric"
                        required
                        aria-required="true"
                        aria-label={copy.icNumber}
                        aria-invalid={Boolean(icFormatError)}
                        aria-describedby={icFormatError ? icErrorId : undefined}
                        className={`${inputClass} ${(draft.ic_no && !icValid) || (showValidationErrors && !draft.ic_no.trim()) ? 'border-rose-200 bg-rose-50/40' : ''}`}
                      />
                      {icFormatError && (
                        <p
                          id={icErrorId}
                          role="alert"
                          data-testid="customer-intake-ic-error"
                          className="text-footnote text-rose-600"
                        >
                          {icFormatError}
                        </p>
                      )}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>
                        {fieldLabelWith('dateOfBirth', FROM_IC)}
                        <RequiredMark />
                      </span>
                      <input
                        value={detectedBirthDate}
                        readOnly
                        aria-required="true"
                        placeholder={tr('输入完整 IC 后自动显示', 'Detected after a complete IC is entered', "Dikesan selepas IC lengkap dimasukkan")}
                        className={`${inputClass} bg-slate-50 text-slate-500`}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.email}<RequiredMark /></span>
                      <input
                        value={draft.email}
                        onChange={(event) => onUpdateDraft('email', event.target.value)}
                        placeholder={copy.email}
                        type="email"
                        required
                        aria-required="true"
                        className={inputClass}
                      />
                    </label>
                    {isLoanPurchase && (
                      <>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.gender}<RequiredMark /></span>
                          <ToggleOptionGroup
                            value={draft.gender}
                            options={[
                              { value: '', label: copy.notSet },
                              ...GENDER_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => onUpdateDraft('gender', value)}
                            ariaLabel="Customer intake gender"
                            ariaRequired
                            className="w-full"
                            optionClassName="!py-2.5 !text-callout !font-normal"
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.race}<RequiredMark /></span>
                          <ToggleOptionGroup
                            value={draft.race}
                            options={[
                              { value: '', label: copy.notSet },
                              ...RACE_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => onUpdateDraft('race', value)}
                            ariaLabel="Customer intake race"
                            ariaRequired
                            className="w-full"
                            optionClassName="!py-2.5 !text-callout !font-normal"
                          />
                        </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.maritalStatus}<RequiredMark /></span>
                      <ToggleOptionGroup
                        value={draft.marital_status}
                        options={[
                          { value: '', label: copy.notSet },
                          ...MARITAL_STATUS_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                        ]}
                        onChange={(value) => onUpdateDraft('marital_status', value)}
                        ariaLabel="Customer intake marital status"
                        ariaRequired
                        className="w-full"
                        optionClassName="!py-2.5 !text-callout !font-normal"
                      />
                    </label>
                    {/* Same rule as the staff forms: asked for Married, Divorced and Widowed. */}
                    {hasChildrenQuestion(draft.marital_status) && (
                      <label className="flex flex-col gap-1.5">
                        <span className={labelClass}>{tr('孩子数量', 'Number of Children', 'Bilangan Anak')}<RequiredMark /></span>
                        <input
                          value={draft.number_of_children}
                          onChange={(event) => onUpdateDraft('number_of_children', event.target.value.replace(/\D/g, '').slice(0, 2))}
                          placeholder={tr('没有就填 0', '0 if none', '0 jika tiada')}
                          inputMode="numeric"
                          required
                          aria-required="true"
                          aria-label="Customer intake number of children"
                          className={`${inputClass} ${showValidationErrors && !draft.number_of_children.trim() ? 'border-rose-200 bg-rose-50/40' : ''}`}
                        />
                      </label>
                    )}
                    {/* Years + months lived here (owner 2026-10-20), stored as the move-in year/month. */}
                    <YearsMonthsDurationInput
                      label={tr('在现址住了多久(年 / 月)', 'Lived here (years / months)', 'Tempoh menetap (tahun / bulan)')}
                      year={draft.residence_start_year}
                      month={draft.residence_start_month}
                      fallbackYears={draft.years_at_residence}
                      onChange={(field, value) => onUpdateDraft(field === 'year' ? 'residence_start_year' : 'residence_start_month', value)}
                      labelClassName={labelClass}
                      inputClassName={inputClass}
                      ariaPrefix="Customer intake residence"
                    />
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.housingStatus}<RequiredMark /></span>
                          <ToggleOptionGroup
                            value={draft.housing_status}
                            options={[
                              { value: '', label: copy.notSet },
                              ...HOUSING_STATUS_OPTIONS.filter(Boolean).map((option) => ({ value: option, label: option }))
                            ]}
                            onChange={(value) => onUpdateDraft('housing_status', value)}
                            ariaLabel="Customer intake housing status"
                            ariaRequired
                            className="w-full"
                            optionClassName="!py-2.5 !text-callout !font-normal"
                          />
                        </label>
                      </>
                    )}
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className={labelClass}>
                        {tr('永久地址（IC）', 'Permanent Address (IC)', 'Alamat Tetap (IC)')}<RequiredMark />
                      </span>
                      <textarea
                        value={draft.full_address}
                        onChange={(event) => onUpdateDraft('full_address', event.target.value)}
                        placeholder={tr('填写 IC 上的地址', 'Enter the address shown on the IC', 'Masukkan alamat pada IC')}
                        required
                        aria-required="true"
                        className={`${inputClass} min-h-24`}
                      />
                    </label>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <div className={`${labelClass} flex flex-wrap items-center justify-between gap-2`}>
                        <label htmlFor="customer-intake-resident-address">{tr('居住地址', 'Resident Address', 'Alamat Kediaman')}<RequiredMark /></label>
                        <button
                          type="button"
                          onClick={() => onUpdateDraft('resident_address', draft.full_address)}
                          className="rounded-chip bg-slate-100 px-2 py-1 text-micro tracking-normal normal-case tracking-normal text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                        >
                          {tr('与永久地址（IC）相同', 'Same as Permanent Address (IC)', 'Sama seperti Alamat Tetap (IC)')}
                        </button>
                      </div>
                      <textarea
                        id="customer-intake-resident-address"
                        value={draft.resident_address}
                        onChange={(event) => onUpdateDraft('resident_address', event.target.value)}
                        placeholder={tr('填写现在居住的地址', 'Enter the current resident address', 'Masukkan alamat kediaman semasa')}
                        required
                        aria-required="true"
                        className={`${inputClass} min-h-24`}
                      />
                    </div>
                  </div>
                </section>

                {isCashPurchase && uploadDocumentsSection}

                {isLoanPurchase && (
                  <>
                <section className="space-y-3">
                  <h3 className={sectionTitleClass}>{copy.emergencyContacts}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      {
                        title: copy.emergencyContact1,
                        fullName: 'emergency_contact_1_full_name',
                        relationship: 'emergency_contact_1_relationship',
                        address: 'emergency_contact_1_full_address',
                        phone: 'emergency_contact_1_phone_no'
                      },
                      {
                        title: copy.emergencyContact2,
                        fullName: 'emergency_contact_2_full_name',
                        relationship: 'emergency_contact_2_relationship',
                        address: 'emergency_contact_2_full_address',
                        phone: 'emergency_contact_2_phone_no'
                      }
                    ].map((contact) => (
                      <div key={contact.title} className="space-y-3 rounded-card border border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-micro uppercase text-slate-400">{contact.title}</p>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.fullName}<RequiredMark /></span>
                          <input required aria-required="true" value={draft[contact.fullName as keyof CustomerIntakeDraft]} onChange={(event) => onUpdateDraft(contact.fullName as keyof CustomerIntakeDraft, event.target.value)} placeholder={copy.fullName} className={inputClass} />
                        </label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="flex flex-col gap-1.5">
                            <span className={labelClass}>{copy.relationship}<RequiredMark /></span>
                            <input required aria-required="true" value={draft[contact.relationship as keyof CustomerIntakeDraft]} onChange={(event) => onUpdateDraft(contact.relationship as keyof CustomerIntakeDraft, event.target.value)} placeholder={copy.relationship} className={inputClass} />
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className={labelClass}>{copy.phoneNumber}<RequiredMark /></span>
                            <input required aria-required="true" value={draft[contact.phone as keyof CustomerIntakeDraft]} onChange={(event) => onUpdateDraft(contact.phone as keyof CustomerIntakeDraft, formatPhoneNumber(event.target.value))} placeholder="+60 12-345 6789" inputMode="tel" className={inputClass} />
                          </label>
                        </div>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.fullAddress}<RequiredMark /></span>
                          <textarea required aria-required="true" value={draft[contact.address as keyof CustomerIntakeDraft]} onChange={(event) => onUpdateDraft(contact.address as keyof CustomerIntakeDraft, event.target.value)} placeholder={copy.fullAddress} className={`${inputClass} min-h-20`} />
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className={sectionTitleClass}>{copy.employmentDetails}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.grossMonthlySalary}<RequiredMark /></span>
                      <input
                        value={draft.gross_monthly_salary}
                        onChange={(event) => onUpdateDraft('gross_monthly_salary', normalizeDecimalInput(event.target.value))}
                        placeholder="RM 0.00"
                        inputMode="decimal"
                        required
                        aria-required="true"
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.netMonthlySalary}<RequiredMark /></span>
                      <input
                        value={draft.net_monthly_salary}
                        onChange={(event) => onUpdateDraft('net_monthly_salary', normalizeDecimalInput(event.target.value))}
                        placeholder="RM 0.00"
                        inputMode="decimal"
                        required
                        aria-required="true"
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.companyName}<RequiredMark /></span>
                      <input required aria-required="true" value={draft.company_name} onChange={(event) => onUpdateDraft('company_name', event.target.value)} placeholder={copy.companyName} className={inputClass} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.position}<RequiredMark /></span>
                      <input required aria-required="true" value={draft.position} onChange={(event) => onUpdateDraft('position', event.target.value)} placeholder={copy.position} className={inputClass} />
                    </label>
                    <StartYearMonthInput
                      label={tr('开始上班(年 / 月)', 'Started work (year / month)', 'Mula bekerja (tahun / bulan)')}
                      year={draft.employment_start_year}
                      month={draft.employment_start_month}
                      fallbackYears={draft.years_employed}
                      onChange={(field, value) => onUpdateDraft(field === 'year' ? 'employment_start_year' : 'employment_start_month', value)}
                      labelClassName={labelClass}
                      selectClassName={inputClass}
                      ariaPrefix="Customer intake employment start"
                    />
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.officePhone}<RequiredMark /></span>
                      <input required aria-required="true" value={draft.office_phone_no} onChange={(event) => onUpdateDraft('office_phone_no', event.target.value)} placeholder={copy.officePhone} inputMode="tel" className={inputClass} />
                    </label>
                    <label className="flex flex-col gap-1.5 md:col-span-2">
                      <span className={labelClass}>{copy.companyAddress}<RequiredMark /></span>
                      <textarea required aria-required="true" value={draft.company_address} onChange={(event) => onUpdateDraft('company_address', event.target.value)} placeholder={copy.companyAddress} className={`${inputClass} min-h-24`} />
                    </label>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className={sectionTitleClass}>{copy.statusPreferences}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>{copy.availableToReceiveCalls}<RequiredMark /></span>
                      <input required aria-required="true" value={draft.available_to_receive_calls} onChange={(event) => onUpdateDraft('available_to_receive_calls', event.target.value)} placeholder="Anytime / office hour" className={inputClass} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>
                        {tr('薪资收取方式', 'Salary Paid By', 'Gaji Dibayar Melalui')}<RequiredMark />
                      </span>
                      <ToggleOptionGroup
                        value={draft.salary_payment_method}
                        options={[
                          { value: '', label: copy.notSet },
                          { value: 'Bank', label: tr('银行', 'Bank', 'Bank') },
                          { value: 'Cash', label: tr('现金', 'Cash', 'Tunai') }
                        ]}
                        onChange={(value) => onUpdateDraft('salary_payment_method', value)}
                        ariaLabel="Customer intake salary paid by"
                        ariaRequired
                        className="w-full"
                        optionClassName="!py-2.5 !text-callout !font-normal"
                      />
                    </label>
                    {/* Every loan needs a bank account, cash salary too (owner 2026-10-20). */}
                    <>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.bankName}<RequiredMark /></span>
                          <input
                            value={draft.bank_name}
                            list={salaryBankListId}
                            autoComplete="off"
                            onChange={(event) => onUpdateDraft('bank_name', event.target.value)}
                            placeholder={tr('选择或输入银行', 'Select or type the bank', 'Pilih atau taip bank')}
                            required
                            aria-required="true"
                            className={inputClass}
                          />
                          <datalist id={salaryBankListId}>
                            {salaryBankOptions.map((bankName) => <option key={bankName} value={bankName} />)}
                          </datalist>
                          <span className="text-micro tracking-normal font-medium text-slate-400">
                            {tr('工资收现金也要填你的银行户口。这里不是贷款银行，贷款银行由我们安排。', 'Needed even if your salary is paid in cash. This is your own account, not the financing bank.', 'Wajib walaupun gaji dibayar tunai. Ini akaun anda sendiri, bukan bank pembiayaan.')}
                          </span>
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={labelClass}>{copy.bankAccountNumber}<RequiredMark /></span>
                          <input
                            value={draft.account_number}
                            onChange={(event) => onUpdateDraft('account_number', event.target.value.replace(/\D/g, ''))}
                            placeholder={copy.bankAccountNumber}
                            inputMode="numeric"
                            required
                            aria-required="true"
                            className={inputClass}
                          />
                        </label>
                    </>
                  </div>
                </section>
                {uploadDocumentsSection}
                  </>
                )}
              </>
            )}
              </div>

              {draft.purchase_method && (
                <div
                  data-testid="customer-intake-required-status"
                  className={`mt-5 rounded-control border px-4 py-3 text-footnote ${
                    validationIssues.length > 0
                      ? 'border-amber-200 bg-amber-50/70 text-amber-800'
                      : canSubmit
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {validationIssues.length > 0 ? (
                    <>
                      <p className="font-bold">
                        {tr(
                          `还差 ${validationIssues.length} 项必填资料：`,
                          `${validationIssues.length} required ${validationIssues.length === 1 ? 'item is' : 'items are'} still missing:`,
                          `${validationIssues.length} maklumat wajib masih belum lengkap:`
                        )}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        {validationIssues.map(({ issue, label }) => <li key={issue}>{label}</li>)}
                      </ul>
                    </>
                  ) : canSubmit ? (
                    <p>
                      {tr(
                        '所有资料已完成，可以提交；上传文件可以留空。',
                        'All information is complete. You can submit now; document uploads may be left empty.',
                        'Semua maklumat telah lengkap. Anda boleh menyerahkan sekarang; muat naik dokumen boleh dibiarkan kosong.'
                      )}
                    </p>
                  ) : (
                    <p>
                      {tr(
                        '必填资料已完成，系统正在准备安全提交，请稍候。',
                        'All required information is complete. Preparing a secure submission session.',
                        'Semua maklumat wajib telah lengkap. Sesi penyerahan selamat sedang disediakan.'
                      )}
                    </p>
                  )}
                </div>
              )}

              {showValidationErrors && !canSubmit && (
                <div
                  role="alert"
                  data-testid="customer-intake-validation-summary"
                  className="mt-5 rounded-control border border-rose-200 bg-rose-50/70 px-4 py-3 text-footnote text-rose-700"
                >
                  <p className="font-bold">
                    {tr('无法提交，请先修正以下资料：', 'Unable to submit. Fix the following:', 'Tidak dapat menyerahkan. Betulkan perkara berikut:')}
                  </p>
                  {validationIssues.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {validationIssues.map(({ issue, label }) => <li key={issue}>{label}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2">
                      {tr('表格仍在准备中，请稍后再提交。', 'The form is still loading. Please submit again shortly.', 'Borang masih dimuatkan. Sila serahkan semula sebentar lagi.')}
                    </p>
                  )}
                </div>
              )}

              {submitErrorReason && (
                <div role="alert" className={`mt-5 rounded-control border px-4 py-3 text-footnote ${submitError === 'documents-incomplete' ? 'border-amber-200 bg-amber-50/70 text-amber-800' : 'border-rose-200 bg-rose-50/70 text-rose-700'}`}>
                  <p className="font-bold">
                    {submitError === 'documents-incomplete'
                      ? tr('资料已提交，文件未传完', 'Details submitted, files incomplete', 'Butiran dihantar, fail belum lengkap')
                      : submitError === 'timeout'
                      ? tr('结果待确认', 'Result pending', 'Keputusan belum disahkan')
                      : tr('提交失败', 'Submission failed', 'Penyerahan gagal')}
                  </p>
                  <p className="mt-1">{submitErrorReason}</p>
                  {submitError !== 'documents-incomplete' && (
                    <p className="mt-1">
                      {tr('已填写的资料仍然保留。', 'Your entered details have been kept.', 'Butiran yang dimasukkan masih disimpan.')}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!canSubmit) {
                      setShowValidationErrors(true);
                      return;
                    }

                    setShowValidationErrors(false);
                    onSubmit(documents.filter((document) => (
                      document.document_key === 'ic'
                      || (isLoanPurchase && (
                        document.document_key === 'payslip'
                        || document.document_key === 'bank_statement'
                      ))
                    )));
                  }}
                  disabled={isSubmitting || isPreparingDocuments}
                  className="rounded-control bg-brand px-5 py-2.5 text-headline text-white transition-colors hover:bg-brand-deep disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {isSubmitting
                    ? tr('提交中...', 'Submitting...', "Menyerahkan...")
                    : isPreparingDocuments
                      ? tr('正在读取文件...', 'Reading files...', 'Membaca fail...')
                      : copy.submitApplication}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
