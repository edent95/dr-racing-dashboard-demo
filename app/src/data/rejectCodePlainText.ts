/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Plain-language Chinese / Malay versions of the seeded reject-code
 * `customer_request` lines (src/data/mockData.ts), keyed by the 8-digit code.
 * English comes from the stored ErrorCodeDefinition so Super Admin edits in
 * Error Code Admin still show; a code missing here falls back to that English.
 */

import type { ErrorCodeDefinition } from '../types';
import type { AppLanguage } from '../lib/i18n';
import { normalizeRejectCodes } from '../utils/rejectCodes';

const REJECT_CODE_PLAIN_TEXT: Record<string, { zh: string; ms: string }> = {
  '01000000': { zh: '工资单资料对不上，跟客户确认', ms: 'Maklumat slip gaji tidak sepadan, semak dengan pelanggan' },
  '01030000': { zh: '收入太低', ms: 'Pendapatan terlalu rendah' },
  '01040000': { zh: '人住在国外', ms: 'Tinggal di luar negara' },
  '01060000': { zh: '重新交收入证明', ms: 'Hantar semula bukti pendapatan' },
  '01080000': { zh: '目前没有工作', ms: 'Tiada kerja sekarang' },
  '14000000': { zh: '是别人要用的，不用再交', ms: 'Orang lain yang guna, tak perlu hantar semula' },
  '03010000': { zh: '先还清 CTOS 欠款', ms: 'Selesaikan hutang CTOS dulu' },
  '03010200': { zh: '先还清 CTOS 欠款', ms: 'Selesaikan hutang CTOS dulu' },
  '03020000': { zh: '有跳票记录', ms: 'Ada rekod cek tendang' },
  '03020100': { zh: '还款常迟（CCRIS）', ms: 'Selalu lambat bayar (CCRIS)' },
  '03020200': { zh: '有法律问题，不用再交', ms: 'Ada isu undang-undang, tak perlu hantar semula' },
  '03020300': { zh: '户口被标记（SAA）', ms: 'Akaun ditanda (SAA)' },
  '03020400': { zh: '在 AKPK 记录里，不用再交', ms: 'Dalam rekod AKPK, tak perlu hantar semula' },
  '03020500': { zh: '别的贷款已重组过', ms: 'Pinjaman lain sudah dijadual semula' },
  '03030000': { zh: '以前还 AEON 常迟', ms: 'Pernah lambat bayar AEON' },
  '03050000': { zh: '欠债太多，试加其他收入', ms: 'Komitmen terlalu tinggi, cuba tambah pendapatan lain' },
  '03040500': { zh: '银行月结单是假的', ms: 'Penyata bank palsu' },
  '03040200': { zh: '工资单是假的', ms: 'Slip gaji palsu' },
  '03050600': { zh: '支出超过收入，加其他收入', ms: 'Belanja lebih dari pendapatan, tambah pendapatan lain' },
  '03070103': { zh: '工资单是假的', ms: 'Slip gaji palsu' },
  '03070106': { zh: '银行月结单是假的', ms: 'Penyata bank palsu' },
  '03080200': { zh: '生意文件太弱', ms: 'Dokumen perniagaan terlalu lemah' },
  '03090000': { zh: '信用分数太低', ms: 'Skor terlalu rendah' },
  '04010000': { zh: '23 岁以上多半是还款 / CTOS / CCRIS 问题；18–22 岁或分数低要付 30% 以上首期', ms: 'Umur 23+: biasanya rekod bayaran / CTOS / CCRIS. Umur 18-22 atau skor rendah: minta deposit 30%+' },
  '04010100': { zh: '工作只是合约', ms: 'Kerja kontrak sahaja' },
  '04010400': { zh: '工作是合约制', ms: 'Kerja secara kontrak' },
  '04010600': { zh: '日薪 / 兼职', ms: 'Gaji harian / separuh masa' },
  '04010902': { zh: '兼职工作', ms: 'Kerja separuh masa' },
  '04020000': { zh: '已经辞职', ms: 'Sudah berhenti kerja' },
  '04050000': { zh: '工作年资不够', ms: 'Tempoh bekerja tidak cukup' },
  '05000000': { zh: '面谈时说法对不上', ms: 'Cerita tidak sepadan semasa temu duga' },
  '05010000': { zh: '雇主的回答对不上', ms: 'Jawapan majikan tidak sepadan' },
  '05010100': { zh: '客户的回答对不上', ms: 'Jawapan pelanggan tidak sepadan' },
  '05020100': { zh: '查无此人', ms: 'Tiada orang ini' },
  '05040000': { zh: '雇主的回答对不上', ms: 'Jawapan majikan tidak sepadan' },
  '05040100': { zh: '向申请人拿正确资料', ms: 'Minta maklumat betul daripada pemohon' },
  '06000000': { zh: '联络不到申请人', ms: 'Tidak dapat hubungi pemohon' },
  '06020000': { zh: '没有提供电话号码', ms: 'Tiada nombor telefon diberi' },
  '06060000': { zh: '联络不到申请人或雇主', ms: 'Tidak dapat hubungi pemohon atau majikan' },
  '08010000': { zh: '申请人不配合', ms: 'Pemohon tidak bekerjasama' },
  '08020000': { zh: '担保人不配合', ms: 'Penjamin tidak bekerjasama' },
  '09010000': { zh: '不肯给推荐人资料', ms: 'Enggan beri maklumat perujuk' },
  '09020000': { zh: '不肯给联名申请人资料', ms: 'Enggan beri maklumat pemohon bersama' },
  '10000000': { zh: '补交缺少的文件', ms: 'Hantar dokumen yang kurang' },
  '10010000': { zh: '交完整的工资单', ms: 'Hantar slip gaji penuh' },
  '10020000': { zh: '交工作证明信', ms: 'Hantar surat pengesahan kerja' },
  '10030000': { zh: '交 EPF 结单', ms: 'Hantar penyata KWSP' },
  '10040000': { zh: '交 Borang B 和报税收据', ms: 'Hantar Borang B dan resit cukai' },
  '10050000': { zh: '交和工资对得上的银行月结单', ms: 'Hantar penyata bank yang sepadan dengan gaji' },
  '10060000': { zh: '交完整的 SSM 文件', ms: 'Hantar dokumen SSM penuh' },
  '10060100': { zh: '交完整的 SSM 文件', ms: 'Hantar dokumen SSM penuh' },
  '10070000': { zh: '交 HR 信', ms: 'Hantar surat HR' },
  '10100000': { zh: '交取消表格', ms: 'Hantar borang pembatalan' },
  '10110000': { zh: '交工作准证', ms: 'Hantar permit kerja' },
  '10150000': { zh: '交最新的银行月结单', ms: 'Hantar penyata bank terkini' },
  '10160000': { zh: '交最新的银行月结单', ms: 'Hantar penyata bank terkini' },
  '13000000': { zh: '不满意批下来的额度', ms: 'Tidak setuju dengan had yang diluluskan' },
  '18000000': { zh: '在黑名单上', ms: 'Dalam senarai hitam' },
  '27000000': { zh: '支出超过收入，加其他收入', ms: 'Belanja lebih dari pendapatan, tambah pendapatan lain' },
  '30000000': { zh: '客户改变主意', ms: 'Pelanggan ubah fikiran' },
  '30010000': { zh: '改成付现金', ms: 'Mahu bayar tunai' },
  '30020000': { zh: '去了别的银行', ms: 'Pergi ke bank lain' },
  '30030000': { zh: '去了别的店', ms: 'Pergi ke kedai lain' },
  '30040000': { zh: '改申请别的贷款', ms: 'Ambil pinjaman lain' },
  '30050000': { zh: '已经没兴趣', ms: 'Sudah tidak berminat' },
  '30060000': { zh: '以后再申请', ms: 'Akan mohon semula nanti' },
  '34020000': { zh: '其实没有要申请', ms: 'Sebenarnya tidak mahu mohon' },
  '35000000': { zh: '有经济或个人问题', ms: 'Ada masalah kewangan atau peribadi' },
  '41000000': { zh: '重复申请', ms: 'Permohonan berganda' }
};

export interface RejectCodePlainText {
  code: string;
  text: string;
}

/**
 * Plain-language reason for every reject code found in `rawCode` (a stored
 * code may hold several, e.g. "01030000 / 03090000"). Unknown codes come back
 * with empty text so the caller can still show the number.
 */
export const getRejectCodePlainTexts = (
  rawCode: string,
  errorCodeIssueMap: Record<string, ErrorCodeDefinition>,
  language: AppLanguage
): RejectCodePlainText[] => (
  normalizeRejectCodes(rawCode).map((code) => {
    const definition = errorCodeIssueMap[code];
    const translated = language === 'en' ? '' : REJECT_CODE_PLAIN_TEXT[code]?.[language];
    return {
      code,
      text: translated || definition?.customer_request || definition?.issue || ''
    };
  })
);
