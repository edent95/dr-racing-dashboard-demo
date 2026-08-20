/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  ClipboardList,
  Database,
  FileClock,
  GitBranch,
  Landmark,
  LifeBuoy,
  MessageCircle,
  MousePointerClick,
  Palette,
  ReceiptText,
  Route,
  ShieldCheck,
  Tag,
  Users,
  Wrench
} from 'lucide-react';
import { LoanApplication, TagNormalizationRule, WhatsAppTrackingClick, WhatsAppTrackingLink } from '../types';
import { getAppLanguage } from '../lib/i18n';
import { MANUAL_MS_COPY } from '../lib/manualMalay';

const WORKFLOW_MANUAL_MS_COPY: Record<string, string> = {
  '从 Sales 分享 Customer Intake Short Link、客户自己提交，到 Admin 检查、银行处理、拒贷补件循环和最终结案的自动流程。': 'Aliran automatik daripada Jualan berkongsi Customer Intake Short Link, pelanggan menghantar sendiri, semakan Pentadbir, pemprosesan bank, kitaran dokumen penolakan hingga penutupan akhir.',
  'Sales 分享链接': 'Jualan Kongsi Pautan',
  'Sales 从 Loan Applications 生成自己的 Customer Intake Short Link，再通过 WhatsApp 发给客户；链接会保留 Sales Handler 和来源追踪。': 'Jualan menjana Customer Intake Short Link sendiri daripada Loan Applications dan menghantarnya kepada pelanggan melalui WhatsApp; pautan mengekalkan Pengendali Jualan serta penjejakan sumber.',
  '官网 SEO 入口会先标记为 SEO；Operations Manager 在 Task Inbox 把它分配给 Active Sales。Sales 分享的 Short Link 继续直接归分享者。': 'Kemasukan SEO laman web ditandakan sebagai SEO dahulu; Pengurus Operasi menetapkannya kepada Jualan Aktif dalam Peti Masuk Tugasan. Pautan Pendek yang dikongsi oleh Jualan kekal dimiliki terus oleh pengongsi.',
  '客户选择 Cash / Loan 后都使用最完整的客户资料表；住址、薪资、紧急联系人、工作与偏好不会因购买方式被隐藏或清空。': 'Selepas pelanggan memilih Tunai / Pinjaman, kedua-duanya menggunakan borang maklumat pelanggan paling lengkap; alamat, gaji, kenalan kecemasan, pekerjaan dan keutamaan tidak disembunyikan atau dikosongkan mengikut kaedah pembelian.',
  'Customer 提交': 'Pelanggan Menghantar',
  '客户自己填写表格并提交后，系统创建 NEW application 并只通知分享链接所属的 Sales。Sales 检查并补齐全部资料和文件，按「通知 Admin」后，系统才把 Pending With 设为 Admin Team 并产生 Admin Notification 和 Task Inbox。': 'Selepas pelanggan menghantar borang, sistem mencipta permohonan BAHARU dan hanya memaklumkan Jualan pemilik pautan. Jualan menyemak serta melengkapkan semua maklumat dan dokumen, kemudian memilih Maklumkan Pentadbir sebelum sistem menetapkan Menunggu Dengan kepada Pasukan Pentadbir dan menjana Pemberitahuan serta Peti Masuk Tugasan Pentadbir.',
  'Sales 分享 / Customer 提交': 'Jualan Kongsi / Pelanggan Hantar',
  '系统创建 NEW application，先设为 Pending Handler 并通知 Sales 检查。Sales 补齐资料并按 Notify Admin 后，才进入 Pending Admin。handler_name 继续保留原 Sales 归属。': 'Sistem mencipta permohonan BAHARU, menetapkan Menunggu Dengan kepada Pengendali dan memaklumkan Jualan untuk semakan. Permohonan hanya memasuki Menunggu Pentadbir selepas Jualan melengkapkan maklumat dan menggunakan Notify Admin. handler_name kekal sebagai pemilik Jualan asal.',
  'Sales 检查': 'Semakan Jualan',
  'Sales 手动 Add Customer 或 Sales Short Link 提交后，申请都先留给所属 Sales。Sales 检查并补齐全部资料和文件，按「通知 Admin」后才交给 Admin；官网 SEO 入口仍先由 Operations Manager 分配 Active Sales。': 'Selepas Jualan menambah pelanggan secara manual atau Pautan Pendek Jualan dihantar, permohonan kekal dengan Jualan pemilik dahulu. Jualan menyemak dan melengkapkan semua maklumat serta dokumen sebelum memilih Maklumkan Pentadbir; kemasukan SEO laman web ditugaskan kepada Jualan Aktif oleh Pengurus Operasi.',
  'Sales 按 Notify Admin 后，系统立即检查申请车型的可用库存；若没有库存，Operations Manager 会收到补库存与成本通知，并可从 Task Inbox 直接 Add stock。补到可用库存后，通知和任务自动解除。': 'Selepas Jualan memilih Notify Admin, sistem terus menyemak stok tersedia untuk model permohonan. Jika tiada stok, Pengurus Operasi menerima pemberitahuan stok dan kos serta boleh menggunakan Add stock terus dari Peti Masuk Tugasan. Pemberitahuan dan tugasan selesai secara automatik selepas stok tersedia ditambah.',
  'Sales 按 Notify Admin 后不会预先指定某一位 Admin。所有 Active Admin 都会在 Task Inbox 看到同一份未分配申请；第一位打开的人通过云端原子认领成为 Admin owner，其他 Admin 随即不再看到。Super Admin 可先在 Staff Filter 选择当前 owner，再用任务卡的 Reassign Admin 改派给另一位 Active Admin。': 'Selepas Jualan memilih Notify Admin, tiada Pentadbir ditetapkan terlebih dahulu. Semua Pentadbir Aktif melihat permohonan belum ditugaskan yang sama dalam Peti Masuk Tugasan; orang pertama yang membukanya menuntut pemilikan secara atomik di awan dan Pentadbir lain tidak lagi melihatnya. Pentadbir Super boleh memilih pemilik semasa dalam Penapis Kakitangan, kemudian menggunakan Tetapkan Semula Pentadbir pada kad tugasan untuk memindahkannya kepada Pentadbir Aktif lain.',
  'Sales 检查完整资料': 'Jualan Semak Maklumat Lengkap',
  'NEW · Assigned Sales Handler · Pending Handler': 'BAHARU · Pengendali Jualan Ditugaskan · Menunggu Pengendali',
  'NEW · Pending Admin Review': 'BAHARU · Menunggu Semakan Pentadbir',
  'Admin 勾选 Missing 文件并点击「要求补资料」后，系统自动变成 PENDING、Pending Handler，并通知原 Handler。': 'Selepas Pentadbir menandakan dokumen Hilang dan memilih Minta Dokumen, sistem bertukar kepada MENUNGGU, menunggu Pengendali dan memaklumkan pengendali asal.',
  '文件全部 Received / Not Required 后，Admin 新增 Draft 银行并点击「提交银行」。系统自动变成 IN PROCESS；银行跟进以次日 11:00 为目标，但最迟不超过提交后的 24 小时。': 'Selepas semua dokumen Diterima / Tidak Diperlukan, Pentadbir menambah bank Draf dan memilih Hantar ke Bank. Sistem bertukar kepada SEDANG DIPROSES; susulan bank menyasarkan 11:00 hari berikutnya tetapi tidak pernah melebihi 24 jam selepas penghantaran.',
  'Submitted / Pending Review 银行卡提供 Approved、Follow Up Reject Bank、Follow Up Document、Rejected 和 Cancel。Reject Bank 固定进入新增其他银行；Document 选择银行要求的文件并回到同一家银行补件重提；Cancel 必须填写取消原因。Rejected 仍可加入多个 CODE 或手动原因及下一步。': 'Kad bank Dihantar / Menunggu Semakan menyediakan Diluluskan, Susulan Bank Ditolak, Susulan Dokumen, Ditolak dan Batal. Bank Ditolak menetapkan langkah menambah bank lain; Dokumen memilih fail yang diminta bank untuk dihantar semula kepada bank yang sama; Batal memerlukan sebab. Ditolak masih menyokong berbilang KOD atau sebab manual serta langkah seterusnya.',
  '银行拒绝后 Loan 进入 FOLLOW UP 并等待 Handler。Sales 可「拒贷结案」，或补资料后点击「补件已完成」；系统建立下一轮 Draft 并通知 Admin 重新提交。': 'Selepas bank menolak, pinjaman memasuki SUSULAN dan menunggu Pengendali. Jualan boleh menutup fail ditolak atau melengkapkan dokumen; sistem mencipta Draf pusingan baharu dan memaklumkan Pentadbir untuk menghantar semula.',
  'Loan Status 由业务动作自动转换。Sales/Admin 不再任意选择 Status；Super Admin 只保留带 Audit Log 的紧急 override。': 'Status Pinjaman berubah secara automatik melalui tindakan perniagaan. Jualan/Pentadbir tidak lagi memilih status sewenang-wenangnya; Pentadbir Super hanya mengekalkan override kecemasan dengan Log Audit.',
  'Undo Last Action 只恢复最近一次流程动作：Notify Admin、Request Documents 和 Documents Ready 可由原执行者在下一环节行动前撤回；批准、拒贷结案和客户联系结案只允许 Super Admin 撤回。每次撤回必须填写原因并写入 Activity 与 Audit Log；若已有收款、交车、库存或佣金影响，系统会阻止直接撤回。选错银行应把该银行记录设为 Cancelled / Wrong Bank，再选择正确银行。': 'Batalkan Tindakan Terakhir hanya memulihkan tindakan aliran kerja terkini: Maklumkan Pentadbir, Minta Dokumen dan Dokumen Sedia boleh dibatalkan oleh pelaksana asal sebelum peringkat seterusnya bertindak; kelulusan, penutupan penolakan dan penutupan hubungan pelanggan hanya boleh dibatalkan oleh Pentadbir Super. Setiap pembatalan memerlukan sebab dan direkodkan dalam Aktiviti serta Log Audit; sistem menghalang pembatalan terus jika sudah ada kesan bayaran, penghantaran, stok atau komisen. Jika bank tersalah pilih, tetapkan rekod bank itu kepada Dibatalkan / Bank Salah sebelum memilih bank yang betul.',
  'Staff live applications': 'Permohonan Langsung Kakitangan',
  'Sales、Admin 与 Super Admin 登录并完成云端同步后，都会增量监听自己有权查看的 customers；其他 Staff 保存申请或文件 metadata 后，列表、Task Inbox 和已打开的 Application Detail 会自动更新，不需要刷新。监听不会自动下载文件内容，只有打开预览时才从 Storage 读取。': 'Selepas Jualan, Pentadbir dan Pentadbir Super log masuk serta melengkapkan penyegerakan awan, setiap peranan mendengar perubahan customers dalam skop yang dibenarkan. Selepas kakitangan lain menyimpan permohonan atau metadata fail, senarai, Peti Masuk Tugasan dan Butiran Permohonan yang sedang dibuka dikemas kini secara automatik tanpa muat semula. Pendengar tidak memuat turun kandungan fail secara automatik; fail hanya dibaca daripada Storage apabila pratonton dibuka.',
  'Loan Applications 的 Staff 栏同时显示 Handler 与 Admin Owner；Pending With Handler 时 Handler 有待处理外发光，Pending With Admin / Bank 时 Admin Owner 有待处理外发光。Staff Filter 会同时匹配 handler_name 与 admin_owner_name。': 'Lajur Kakitangan dalam Permohonan Pinjaman memaparkan Pengendali dan Pemilik Pentadbir bersama-sama; Pengendali bercahaya apabila Menunggu Dengan ialah Pengendali, manakala Pemilik Pentadbir bercahaya apabila Menunggu Dengan ialah Pentadbir / Bank. Penapis Kakitangan memadankan handler_name dan admin_owner_name.',
  '主流程发布前验收可运行 npm run test:e2e:loan-flow。它会实际验证 Sales 短链接与客户提交，以及 Admin / Sales 在缺件、提交银行、拒贷 CODE、补件重提、批准和客户联系结案之间的完整交接。': 'Sebelum pelepasan, jalankan npm run test:e2e:loan-flow untuk penerimaan aliran utama. Ia mengesahkan pautan pendek Jualan dan penghantaran pelanggan, serta penyerahan penuh antara Pentadbir / Jualan melalui dokumen hilang, penghantaran bank, KOD penolakan, penghantaran semula, kelulusan dan penutupan selepas menghubungi pelanggan.',
  'Current Action': 'Tindakan Semasa',
  'Application Detail 顶部先显示当前要做的动作、Pending With、Handler、当前银行、Due Date、Next Action Detail 和缺失文件。处理人不用先翻完整份资料，就能知道现在卡在哪里、由谁继续。': 'Bahagian atas Butiran Permohonan menunjukkan tindakan semasa, Menunggu Dengan, Pengendali, bank semasa, Tarikh Akhir, Butiran Tindakan Seterusnya dan dokumen hilang. Pemilik kerja boleh terus melihat kedudukan proses dan siapa yang perlu meneruskan tanpa membaca keseluruhan rekod dahulu.',
  'Admin Bank Form Filter': 'Penapis Borang Bank Pentadbir',
  'Admin 在 Loan Application Detail 可开启 Bank Form Filter，只保留 File / Document Checklist 与填写银行表格所需的客户、薪资、车辆、贷款、年期、Gender、Race、Residency Status 和 Marital Status。Residency Status 继续使用原有 housing_status；编辑能力仍遵守 Role Access 的 Edit Loan Application。': 'Pentadbir boleh menghidupkan Penapis Borang Bank dalam Butiran Permohonan Pinjaman untuk memaparkan hanya Senarai Semak Fail / Dokumen serta butiran pelanggan, gaji, kenderaan, pinjaman, tempoh, jantina, bangsa, status kediaman dan perkahwinan yang diperlukan untuk borang bank. Status kediaman terus menggunakan housing_status sedia ada; kebolehan mengedit masih mematuhi Edit Permohonan Pinjaman dalam Akses Peranan.',
  '当前责任': 'Tanggungjawab Semasa',
  '系统动作': 'Tindakan Sistem',
  '结果': 'Hasil',
  'Sales 提交': 'Jualan Menghantar',
  'Admin 检查': 'Semakan Pentadbir',
  '缺资料': 'Dokumen Tidak Lengkap',
  '资料完整': 'Dokumen Lengkap',
  '银行处理中': 'Pemprosesan Bank',
  '银行拒绝': 'Bank Menolak',
  'Rejected（可选多个 CODE）': 'Ditolak (berbilang KOD pilihan)',
  'Attendance & Leave 是员工考勤入口': 'Attendance & Leave ialah pintu masuk kehadiran kakitangan',
  '员工可不限次数交替 Check in / Check out；正常班为 10:00–19:00。Admin 每周一维护全员 Working / Off Day 排班及月薪快照，Off Day 无需打卡；月薪只用于迟到 60 分钟时计算半天薪水。迟到 30 分钟扣 RM20，迟到 60 分钟扣半天薪水。员工可申请 OT，只有 Super Admin 可批准；前一晚 OT 批准后，次日生效上班时间为 12:00，12:31 打卡会按迟到 30 分钟档扣 RM20。Super Admin 可修改时间、迟到档位及 Office Wi-Fi Check in 规则，并查看全员；Admin/Sales 的考勤汇总仍只看自己。原始打卡、月度汇总和 Leave / MC / OT CSV 统一在 Data Export 导出。': 'Kakitangan boleh berselang-seli Check in / Check out tanpa had; syif biasa ialah 10:00–19:00. Setiap Isnin Admin menyelenggara jadual Working / Off Day dan snapshot gaji bulanan semua kakitangan; Off Day tidak memerlukan rekod dan gaji hanya digunakan untuk mengira potongan separuh hari apabila lewat 60 minit. Lewat 30 minit memotong RM20, manakala lewat 60 minit memotong separuh hari gaji. Kakitangan boleh memohon OT dan hanya Super Admin boleh meluluskan; OT malam sebelumnya yang diluluskan mengubah masa mula hari berikutnya kepada 12:00, dan daftar masuk 12:31 dikenakan potongan RM20. Super Admin boleh mengubah masa, tahap lewat dan peraturan daftar masuk Wi-Fi pejabat serta melihat seluruh pasukan; ringkasan Admin/Sales kekal untuk diri sendiri. CSV rekod mentah, ringkasan bulanan dan Cuti / MC / OT dieksport di Eksport Data.',
  '员工考勤、每周排班、异常监督与 Leave / MC / OT 申请。': 'Kehadiran kakitangan, jadual mingguan, pemantauan pengecualian dan permohonan Cuti / MC / OT.',
  '不限次数 Check in / Check out；查看每日总工时、迟到次数、规则扣除与每月员工汇总；提交 Leave 或附 MC。': 'Check in / Check out tanpa had; lihat jumlah jam harian, kiraan lewat, potongan peraturan dan ringkasan bulanan kakitangan; hantar Cuti atau MC.',
  'Admin 与 Super Admin 每周一可维护全员 Working / Off Day 排班及月薪快照；Off Day 不需要 Check in。Admin/Sales 的汇总只看自己，只有 Super Admin 看全员、隐藏月度汇总、审批 Leave / MC / OT，并修改正常班 10:00–19:00、OT 后次日 12:00、迟到扣款级别，以及 Office Wi-Fi Check in 开关和办公室公网 IP 白名单。默认迟到 30 分钟扣 RM20、60 分钟扣半天薪水，采用当天达到的最高档；批准 OT 后，次日 12:31 会达到 RM20 档。Data Export 分开提供原始打卡、员工月度汇总和 Leave / MC / OT CSV，且不包含 MC 文件内容。': 'Admin dan Super Admin boleh menyelenggara jadual Working / Off Day serta snapshot gaji bulanan setiap Isnin; Off Day tidak memerlukan daftar masuk. Ringkasan Admin/Sales hanya memaparkan diri sendiri, manakala hanya Super Admin melihat seluruh pasukan, menyembunyikan ringkasan bulanan, meluluskan Cuti / MC / OT dan mengubah syif biasa 10:00–19:00, masa mula 12:00 selepas OT, tahap potongan lewat, suis daftar masuk Wi-Fi pejabat serta senarai IP awam pejabat. Lalai lewat 30 minit memotong RM20 dan 60 minit memotong separuh hari gaji, menggunakan tahap tertinggi hari itu; selepas OT diluluskan, daftar masuk 12:31 mencapai tahap RM20. Eksport Data menyediakan CSV berasingan untuk rekod mentah, ringkasan bulanan dan Cuti / MC / OT tanpa kandungan fail MC.',
  'Attendance & Leave': 'Kehadiran & Cuti',
  '不限次数打卡、每周排班、迟到扣款，以及 Leave / MC / OT 提交和审批。': 'Rekod tanpa had, jadual mingguan, potongan lewat serta penghantaran dan kelulusan Cuti / MC / OT.',
  '旧版 Approval Workflow 当前隐藏；Leave / MC / OT 已转到独立 Attendance & Leave 页面。其他折扣、special loan case、commission 与 mission reward 审批代码继续保留。': 'Approval Workflow lama kini disembunyikan; Cuti / MC / OT telah dipindahkan ke halaman Kehadiran & Cuti. Kod kelulusan diskaun, kes pinjaman khas, komisen dan ganjaran misi yang lain masih dikekalkan.',
  '隐藏的旧版折扣、特殊 loan case、commission 与 mission reward 审批代码；Leave / MC / OT 已使用独立 Attendance & Leave 页面。': 'Kod kelulusan lama yang disembunyikan untuk diskaun, kes pinjaman khas, komisen dan ganjaran misi; Cuti / MC / OT kini menggunakan halaman Kehadiran & Cuti.'
};

const manualCopy = (source: string) => getAppLanguage() === 'ms' ? WORKFLOW_MANUAL_MS_COPY[source] || MANUAL_MS_COPY[source] || source : source;

interface FlowOverviewProps {
  applications: LoanApplication[];
  rawCustomerCount: number;
  rawCustomerMatchCount: number;
  duplicatedRawPhoneCount: number;
  missingVehicleInfoMissionCount: number;
  bankDefinitionCount: number;
  tagNormalizationRules: TagNormalizationRule[];
  whatsAppTrackingLinks: WhatsAppTrackingLink[];
  whatsAppTrackingClicks: WhatsAppTrackingClick[];
  approvalRequestCount: number;
  rewardTeamCount: number;
  auditLogCount: number;
  roleAccountCount: number;
}

interface ManualCardItem {
  title: string;
  detail: string;
  meta?: string;
}

interface FlowNode {
  label: string;
  detail: string;
}

const brandColorSwatches = [
  { name: 'Brand Red', token: 'red-800', hex: '#991b1b', usage: 'Active nav, primary action, selected high-level state' },
  { name: 'Brand Hover', token: 'red-900', hex: '#7f1d1d', usage: 'Primary action hover / stronger emphasis' },
  { name: 'Success', token: 'emerald-600', hex: '#059669', usage: 'Approved, completed, selected dropdown row, real on/off' },
  { name: 'Warning', token: 'amber-500', hex: '#f59e0b', usage: 'Pending, due soon, needs attention' },
  { name: 'Error', token: 'rose-600', hex: '#e11d48', usage: 'Rejected, overdue, sync error, failed validation' },
  { name: 'Data / Focus', token: 'indigo-600', hex: '#4f46e5', usage: 'Analytics helper, focus support, legacy secondary accent' },
  { name: 'Surface', token: 'slate-50', hex: '#f8fafc', usage: 'Quiet panels, table hover, low-density background' },
  { name: 'Text', token: 'slate-900', hex: '#0f172a', usage: 'Primary text and high-contrast data' }
];

const fontSamples = [
  { name: 'UI Body', size: '12-14px', weight: '500 / 600', sample: 'Loan Applications · Follow Up · Calendar' },
  { name: 'Section Title', size: '14-16px', weight: '700', sample: 'Brand / UIUX Guide' },
  { name: 'KPI Number', size: '24-56px', weight: '700', sample: '87%' },
  { name: 'Mono Data', size: '10-13px', weight: '500 / 600', sample: '+60 12-345 6789' }
];

const ratioRules = [
  { name: 'Spacing', value: '4 / 8 / 12 / 16 / 24', detail: 'Use 4px base rhythm. Dense tables stay tight; cards and sections breathe at 16-24px.' },
  { name: 'Radius', value: '8 / 12 / 16', detail: '`rounded-lg` controls, `rounded-xl` cards, `rounded-2xl` large manual sections only.' },
  { name: 'Controls', value: '32 / 40 / 48', detail: 'Inline controls can be 32px; normal buttons 40px; primary mobile actions 48px.' },
  { name: 'Sidebar', value: '48 rail / 32 icon', detail: 'Compact rows, full-color 32px nav tiles, red pill selected state.' },
  { name: 'Charts', value: '1 main chart', detail: 'One primary chart per subject; details stay collapsed under the chart.' },
  { name: 'Type Scale', value: '10 / 12 / 14 / 24 / 56', detail: 'Micro labels, body, section title, KPI, hero metric. Avoid viewport-scaled font sizes.' }
];

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{manualCopy(label)}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BrandColorSwatches() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {brandColorSwatches.map((color) => (
        <div key={color.name} className="overflow-hidden rounded-xl bg-slate-50">
          <div className="h-16" style={{ backgroundColor: color.hex }} />
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-slate-900">{manualCopy(color.name)}</p>
              <p className="font-mono text-[10px] font-semibold text-slate-400">{color.hex}</p>
            </div>
            <p className="mt-1 font-mono text-[10px] font-semibold text-indigo-500">{color.token}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{manualCopy(color.usage)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FontAndRatioGuide() {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.15fr]">
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold text-slate-900">{manualCopy('Apple-like Font System')}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {manualCopy('全站默认 font 已改成 Apple-like system stack：英文优先 San Francisco / SF Pro，中文优先 PingFang SC / Hiragino Sans GB；其他系统 fallback 到 Microsoft YaHei UI、Helvetica Neue、Arial、system-ui。数字/技术资料用 SF Mono fallback。')}
        </p>
        <div className="mt-3 space-y-2">
          {fontSamples.map((item) => (
            <div key={item.name} className="rounded-lg bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{manualCopy(item.name)}</p>
                <p className="font-mono text-[10px] text-slate-400">{item.size} · {item.weight}</p>
              </div>
              <p className={`mt-1 text-slate-900 ${item.name === 'KPI Number' ? 'text-3xl font-bold' : item.name === 'Mono Data' ? 'font-mono text-sm font-semibold' : 'text-sm font-semibold'}`}>
                {item.sample}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold text-slate-900">{manualCopy('Ratio / Scale Rules')}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {ratioRules.map((item) => (
            <div key={item.name} className="rounded-lg bg-white px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-900">{manualCopy(item.name)}</p>
                <p className="font-mono text-[10px] font-semibold text-red-800">{item.value}</p>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{manualCopy(item.detail)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManualSection({
  title,
  subtitle,
  icon,
  children
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{manualCopy(title)}</h3>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-500">{manualCopy(subtitle)}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
      {children}
    </section>
  );
}

function CardGrid({ items, columns = 'md:grid-cols-3' }: { items: ManualCardItem[]; columns?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${columns}`}>
      {items.map((item) => (
        <div key={item.title} className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold text-slate-900">{manualCopy(item.title)}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{manualCopy(item.detail)}</p>
          {item.meta && (
            <p className="mt-3 font-mono text-[10px] text-indigo-500">{item.meta}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ManualTable({
  columns,
  rows
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[860px] w-full text-left">
        <thead className="border-b border-slate-300 bg-slate-200/95 text-[10px] font-bold uppercase tracking-wider text-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3">{manualCopy(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-xs">
          {rows.map((row) => (
            <tr key={row.join('-')} className="align-top">
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="px-4 py-3 leading-relaxed text-slate-600">
                  {index === 0 ? <span className="font-bold text-slate-900">{manualCopy(cell)}</span> : manualCopy(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowStrip({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-3">
        {nodes.map((node, index) => (
          <React.Fragment key={node.label}>
            <div className="w-56 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-900">{manualCopy(node.label)}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{manualCopy(node.detail)}</p>
            </div>
            {index < nodes.length - 1 && (
              <div className="flex items-center text-slate-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function FlowOverview({
  applications,
  rawCustomerCount,
  rawCustomerMatchCount,
  duplicatedRawPhoneCount,
  missingVehicleInfoMissionCount,
  bankDefinitionCount,
  tagNormalizationRules,
  whatsAppTrackingLinks,
  whatsAppTrackingClicks,
  approvalRequestCount,
  rewardTeamCount,
  auditLogCount,
  roleAccountCount
}: FlowOverviewProps) {
  const bankApplicationCount = applications.reduce((sum, application) => sum + (application.bank_applications || []).length, 0);
  const activeNormalizationRules = tagNormalizationRules.filter((rule) => rule.active).length;
  const activeWhatsAppLinks = whatsAppTrackingLinks.filter((link) => link.active).length;

  return (
    <div id="system-manual-page" className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{manualCopy('System Manual')}</h2>
          <p className="max-w-4xl text-xs font-light leading-relaxed text-slate-500">
            {manualCopy('这页是 admin 使用说明书。它说明 Dr Racing Dashboard 的页面用途、角色权限、customer/loan 工作流、setting 维护、tools 报表、数据同步和 audit 逻辑。')}
          </p>
        </div>
        <span className="inline-flex self-start rounded-full bg-red-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {manualCopy('Admin operating guide')}
        </span>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(12,minmax(0,1fr))]">
        <StatPill label="Customers" value={applications.length} />
        <StatPill label="Raw Leads" value={rawCustomerCount} />
        <StatPill label="Raw Matches" value={rawCustomerMatchCount} />
        <StatPill label="Dup Phones" value={duplicatedRawPhoneCount} />
        <StatPill label="Missions" value={missingVehicleInfoMissionCount} />
        <StatPill label="Approvals" value={approvalRequestCount} />
        <StatPill label="Teams" value={rewardTeamCount} />
        <StatPill label="Bank Records" value={bankApplicationCount} />
        <StatPill label="Bank DB" value={bankDefinitionCount} />
        <StatPill label="Rules" value={activeNormalizationRules} />
        <StatPill label="WA Links" value={`${activeWhatsAppLinks}/${whatsAppTrackingLinks.length}`} />
        <StatPill label="Audit Logs" value={auditLogCount} />
      </section>

      <ManualSection
        title="1. Admin Quick Start"
        subtitle="新 admin 先理解这些核心规则，就能知道 dashboard 怎样运作。"
        icon={<BookOpenText className="h-5 w-5" />}
      >
        <CardGrid
          columns="md:grid-cols-2 xl:grid-cols-3"
          items={[
            {
              title: 'Task Inbox 是每日工作入口',
              detail: '默认首页汇总当前 staff 今天要做什么：missing info、raw lead follow-up、bank pending action、reminder 和 custom mission progress。它只读现有数据，不创建独立 task record。'
            },
            {
              title: 'Staff View 是手机工作台',
              detail: 'Staff View 面向手机和 sales 日常操作，只显示当前 staff 自己的 leads、due follow-up、customer tasks 和 scoped missions，并提供 Call、WhatsApp、Mark Contacted、Next Follow-up 大按钮。'
            },
            {
              title: 'Customers 是主要工作台',
              detail: '客户贷款申请、状态、final REJECT CODE、remarks、bank records、资料详情和 Add Customer 都从 Customers 处理。Show All 开启后可用 All Staff / Active staff dropdown 同时筛选 Handler 或 Admin Owner，并可继续叠加时间、状态和搜索条件。Staff 栏两行显示双方，外发光标出当前 Pending 的负责人。'
            },
            {
              title: 'Raw Customers 是 lead database',
              detail: 'TikTok/social lead 可用 CSV 或手动输入。Sales 新增的 lead 自动归属本人并设为 Private；Admin 可在 Duplicate Leads 案件删除错误名单，之后 CSV 自动排除同一来源记录。'
            },
            {
              title: '潜在客户关系是风控对比',
              detail: '集中比较贷款申请与 Lead Pool 的相同手机号、IC、银行户口和电邮；IC/户口列为高风险，并显示关联人员与负责人。'
            },
            {
              title: 'My Leads 是 sales 跟进台',
              detail: 'Raw Customer 被 taken 后会立即进入 Task Inbox > Open Leads > My Leads，并显示 Contacted、Follow Up Due、Interested 等状态。状态筛选可继续叠加 Today、Yesterday、Earlier 日期筛选与新旧排序；到期项目同时出现在 Tasks。Admin/Super Admin 可用 Staff Filter 查看所选员工的名单。'
            },
            {
              title: 'Calendar 是日程视图',
              detail: 'Calendar 汇总 customer application、customer call-back、bank submission/decision/follow-up 和 Raw Customer follow-up due date；Super Admin 可在选定日期直接指派 task 给 staff。'
            },
            {
              title: 'Attendance & Leave 是员工考勤入口',
              detail: '员工可不限次数交替 Check in / Check out；Admin 每周维护 Working / Off Day 排班及月薪快照。Operations Manager 查看全员考勤并审批 Leave / MC / OT；Super Admin 继续独占时间、迟到档位与 Office Wi-Fi Check in 等系统规则。原始打卡、月度汇总和 Leave / MC / OT CSV 统一在 Data Export 导出。'
            },
            {
              title: 'Setting 是后台配置',
              detail: 'Roles & Accounts（Accounts / Role Access / Task Assignment 三个 tabs）、Bank Database（Banks / Reject Reason Codes / Brand Logos 三个 tabs）、Vehicle Categories、Vehicle Info、Commission Rules 和 normalisation rules 都在 Setting 维护。'
            },
            {
              title: 'Tools 是管理工具',
              detail: 'Analytics、Missing Info Summary、Approval Workflow、Audit Log 与 Data Export 在 Admin Center；WhatsApp Tools 已归入 User。Sales 打开 Analytics 时只看自己的 personal analytics；Admin/Super Admin 看全局。'
            },
            {
              title: 'Finance Center 是 Operations 工作台',
              detail: 'Operations Manager 在 Finance Center 与 Task Inbox 处理 Deals P&L、Stock & Costing、实际放款、Finance Completed、交车与 Commission Paid；Super Admin 在没有 Active Operations Manager 时自动兜底。Vehicle Info 价格不会被这些成交操作改写。'
            },
            {
              title: 'Rewards 是奖励结算中心',
              detail: 'Reward / Commission Center 当前只开放 Payout Center。成交佣金逐笔读取 Finance Deal 的 Estimated、Earned、Payable、Paid 或 Reversed 状态；Missions 和 Team Battle 页面暂时隐藏，既有任务、战队与结算资料保留。'
            },
            {
              title: 'Sales Budget 是透明成本页',
              detail: 'Sales Budget 只读显示项目成本：MacBook、14 天人力、domain、server、AI service 和 skill value。它不写入 customer、audit、analytics 或 Firebase data。'
            },
            {
              title: 'Staff Mission 是待补资料',
              detail: 'New/Used 和 Cash/Loan 不由 customer 填。系统会分配给 handler staff 补齐；浮动面板可最小化后再展开。'
            },
            {
              title: 'Custom Mission 是 incentive',
              detail: 'Super Admin 可在 Rewards > Missions 创建 Top Sales、Fast Response、Raw Lead Conversion 任务，设置 target、reward、timeframe 和 scope，并先看当前 staff reference data。'
            },
            {
              title: 'Audit Log 是追踪记录',
              detail: '重要修改会记录 staff、role、IP、user agent、old value 和 new value。'
            },
            {
              title: 'Notification Center 是行动提醒',
              detail: 'Header 铃铛直接镜像当前 Task Inbox 的可见待办，数量和卡片内容必须相同。Hidden、已完成和已解决项目不会出现；打开卡片会回到 Task Inbox 处理。'
            },
            {
              title: 'Internal Comment 是内部沟通',
              detail: '每个 customer detail 有 Activity Thread。Admin 可直接 @Handler 指派补件或跟进行动，Staff 也可 @Admin/@Super Admin；被 tag 的人会在 Notification Center 与 Task Inbox 看到实际留言，打开或确认通知后解除该待办。'
            }
          ]}
        />
      </ManualSection>

      <ManualSection
        title="2. Page Map"
        subtitle="每一个顶层 tab 的用途、谁会用、主要动作。"
        icon={<Route className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Tab', 'Purpose', 'Main Actions', 'Admin Notes']}
          rows={[
            ['Task Inbox', '当前 staff 的每日工作队列。', '在 Tasks 与 Open Leads 之间切换；到期的 lead follow-up 会直接显示在 Tasks 卡片内，可更新状态、下次提醒、备注或打开 WhatsApp。Sales 申请跟进、Admin 申请审核和漏打下班卡任务会按 Task Assignment 进队；指定角色没有 Active 账号时由 Super Admin 接手。', '未来日期的 follow-up 留在 Calendar，日期到达后才进入 Tasks；Task Inbox 不写入独立 task storage。同一 application 只显示当前最先可执行的库存/交车任务：无库存时先显示 Stock needed，补库存后才显示 Awaiting delivery。同一 Deal 同时命中负利润、银行放款逾期、待财务完成或待付佣金时，合并成一张 Finance review 卡并逐项列出。同一员工同时只显示最新一张漏打下班卡任务；共享结案保存于 attendance_incident_resolutions，以后新一天再次漏打才产生下一张。'],
            ['Staff View', '手机优先的 staff 日常工作台。', '只看自己的 leads、missions、follow-up 和 customer tasks；用大按钮 Call、WhatsApp、Mark Contacted、Next Follow-up 快速处理。', '不创建新数据源，所有动作仍写回 Raw Customer Follow Up / Customers / Rewards Missions / Missing Info Summary 现有资料。'],
            ['Customers', '贷款申请和客户跟进主页面。', '默认查看最近 30 天；点击 8 张 summary card 直接筛选状态。Staff 栏同时显示 Handler 与 Admin Owner，并用 Pending 外发光标出当前负责人；Staff Filter 同时匹配两种归属。表格以图标区分 Cash/Loan；Cash 的 Accepted、Delivery 与 Complete 会读取 Finance Deal 成交状态，Loan 保留银行审批主流程。所有用户可双击复制表格资料，也可按 Enter/F2 进入获授权的编辑；Super Admin 可编辑全部客户。', '更换 Handler 仍仅限 Super Admin，会同时更新 handler name/role 并写入 Audit Log；Admin/Sales 的 Handler 保持只读。'],
            ['Task Inbox > Open Leads', '用 Open Leads 与 My Leads 两个 tab 分开显示公共未认领名单和本人负责的名单。', 'Open Leads 与 My Leads 都默认按 Date Added 由新到旧排列，可筛 Today、Yesterday、Earlier，也可切换 Oldest First。名单卡会按实际 Date Added 日期分组，每个新日期用横跨两列的 Today / Yesterday / 日期分隔线隔开。My Leads 的日期筛选会叠加 All、Contacted、Follow Up Due、Interested 状态筛选。公共 Open Lead 打开 WhatsApp 后会自动认领、标记 Contacted，并立即移到 My Leads；到期名单也会进入 Tasks。Public Taken Lead 可确认后 Return to Public Pool，Private Lead 不可放回。TikTok CSV 导入与手动 Add Lead 都先选 Public / Private Pool；Public 保持未分配并进入 Open Leads，Private 自动归当前用户并进入 My Leads。Super Admin 可在 My Leads 用 Assign Selected 转交 Private Lead。每张卡可单独删除，也可勾选多笔 Delete Selected 或删除当前 tab / 当前筛选显示的名单。', '所有单笔/批量/全删都必须确认。User > Follow Up 可选 WhatsApp 使用新标签页或当前页面，设置按员工保存在当前设备。Super Admin 可删除任何名单；Admin / Sales 只可删除自己创建或负责的名单。Sales 与 Super Admin 手动新增时都可以选择 Public + Public Lead 或 Private + Taken Lead。'],
            ['Task Inbox > Relationship Issues', '把同一组潜在客户、lead 与贷款申请的所有相同资料集中成一个风控案件。', '只有待处理或调查中的案件存在时才显示 tab；案件可分配负责人、并排核对资料、记录评论和结案。', '没有 active issue 时入口自动隐藏；删除 Duplicate Lead 仍写 Audit Log 并保存哈希导入指纹。'],
            ['Calendar', '监督员工每日要执行的日程。', '默认看 customer call-back、bank/raw lead follow-up 和管理层安排。', 'Follow Up 没有独立 tab；到期时直接成为 Task Inbox 的任务卡。被指派员工也会在 Calendar、Notification Center 和 Task Inbox 看到管理层任务。'],
            ['Attendance & Leave', '员工考勤、每周排班、异常监督与 Leave / MC / OT 申请。', '不限次数 Check in / Check out；Admin 维护 Working / Off Day 排班；Operations Manager 查看全员并审批 Leave / MC / OT。', 'Super Admin 继续独占上班时间、迟到扣款级别、Office Wi-Fi Check in 开关和办公室公网 IP 白名单等系统规则。'],
            ['Finance Center', 'Operations Manager 的成交利润、库存成本和佣金工作台。', '处理库存与成本、实际银行放款、交车、Finance Completed、负利润核对与 Commission Paid。', 'Admin/Sales 没有 Finance Center 权限；有 Active Operations Manager 时任务从 Super Admin 队列移出，没有时 Super Admin 自动兜底。'],
            ['Setting', '系统基础资料、权限、任务负责人和计算规则配置。', 'Roles & Accounts 用 Accounts / Role Access / Task Assignment 三个 tabs；Task Assignment 分别调整 Sales、Admin 和 Operations 任务的负责角色，Lead、日历和 @mention 继续跟随实际 owner；Bank Database 用 Banks / Reject Reason Codes / Brand Logos 三个 tabs。', '指定业务角色没有 Active 账号时 Super Admin 自动兜底。Commission Rules 只影响新 Finance Deal 默认值，不重写已保存 Deal。Reset Data 仍须重新验证 Super Admin。'],
            ['Rewards', '当前开放成交佣金与其他收入结算。', '成交佣金逐笔读取 Finance Deal；Missions 和 Team Battle 页面暂时隐藏。', 'Finance Deal 是销售成交佣金唯一事实来源：Estimated → Earned → Payable → Paid / Reversed。任务与战队资料和既有结算行继续保留。'],
            ['Sales Budget', '对朋友展示透明项目成本。', '查看 MacBook、14 天时间成本、domain、server、AI service、skill value、首月成本、月费和第一年成本。', '只读静态预算页，不接客户资料、audit log、analytics 或 Firebase 写入。'],
            ['Tools', '报表、missing info summary、approval、导出和系统追踪工具。', '看 Analytics/Missing Info Summary、管理 approval、检查 Audit Log 与 Data Export；Attendance 原始打卡、Attendance 员工月度汇总和 Leave / MC / OT 分开导出，原始时间戳按日期与时间分栏，没有资料的导出选项自动隐藏。', 'WhatsApp Tools 已移动到 User 页面。'],
            ['User', '当前登录 staff 的个人页面。', '上传/移除 avatar；编辑自己的姓名和登录 Username / Email；在 Change Password 重新输入当前密码后自行设置新密码。', '姓名或登录账号修改必须验证当前密码；姓名变更会同步 Auth claims、staff access、登录目录与现有业务资料归属。Role 仍只由 Super Admin 管理。'],
            ['System Manual', '完整系统说明书。', '理解 dashboard 如何工作、数据如何流动、每个配置影响哪里。', '给 admin onboarding 和日常排查使用。']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="3. Brand / UIUX Guide"
        subtitle="Dr Racing Dashboard 的品牌哲学：Quiet Speed、Operational Luxury、Staff First、Evidence Over Decoration。界面要像高效率工作台，不像 marketing landing page。"
        icon={<Palette className="h-5 w-5" />}
      >
        <CardGrid
          columns="md:grid-cols-2 xl:grid-cols-4"
          items={[
            {
              title: 'Quiet Speed',
              detail: '系统要让资料已经整理好，所以 staff 能快。速度来自清楚的任务、状态、筛选和下一步，不来自赛车装饰、大 hero 或视觉噪音。'
            },
            {
              title: 'Operational Luxury',
              detail: '高级感来自稳定 layout、清楚数字、干净图标、少解释、少跳动。它应该像专业工具，不像宣传页。'
            },
            {
              title: 'Staff First',
              detail: '设计先服务销售和 admin 的重复工作：scan、filter、WhatsApp、follow up、补资料、查 bank status、改 record。减少培训成本。'
            },
            {
              title: 'Evidence Over Decoration',
              detail: '每个 card、badge、icon、chart 都要说明 status、priority、owner、action 或 performance。没有业务信息的装饰要移除。'
            },
            {
              title: 'Color Roles',
              detail: 'Deep red 是 brand / active / primary operational action；emerald 是 success、selected 和真正 on/off；amber 是 pending；rose 是 error/reject；slate 是结构。'
            },
            {
              title: 'Two Icon Families',
              detail: 'Sidebar/mobile nav 用 colorful macOS tile PNG；页面内容、按钮、表格、状态用 flat line icon。不要把 tile icon 放进 dense table。'
            },
            {
              title: 'Progressive Disclosure',
              detail: '默认显示 current value、scope、priority 和 next action。raw detail、audit trail、advanced config、large table 默认收起。'
            },
            {
              title: 'High Signal Copy',
              detail: '文案短、业务化、少解释。按钮说动作，empty state 说具体原因；不要把 UTM、localStorage、Firebase 这类技术词暴露给普通 staff。'
            }
          ]}
        />

        <div className="mt-4">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{manualCopy('Color System')}</p>
          <BrandColorSwatches />
        </div>

        <div className="mt-4">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{manualCopy('Font / Ratio System')}</p>
          <FontAndRatioGuide />
        </div>

        <div className="mt-4">
          <ManualTable
            columns={['Area', 'Brand Rule', 'Implementation Rule']}
            rows={[
              ['Primary Color', 'Deep red should carry Dr Racing identity and high-level active/primary operational actions.', '`red-800` / `red-900` for active sidebar, primary buttons, selected high-level state. Do not mix red and indigo randomly.'],
              ['Secondary Color', 'Indigo can remain as analytical/focus support, not the main brand color.', 'Use indigo intentionally for analytics helpers, focus treatment, or legacy components until a full color migration is done.'],
              ['KPI Title Badges', 'All stat-card titles should use tinted semantic badges like Task Inbox titles, not pale standalone grey text.', 'Neutral=`bg-slate-100 text-slate-600`, pending=`amber`, success=`emerald`, danger/reject=`rose`, brand/primary=`red`. Apply this pattern across the site.'],
              ['Font', 'Use Apple OS-like system typography for a cleaner native-app feeling, including Chinese text.', 'Default sans stack starts with `-apple-system`, `SF Pro`, then `PingFang SC` / `Hiragino Sans GB` for Chinese; mono starts with `SF Mono`.'],
              ['Ratio', 'Keep the interface on a compact 4px rhythm with predictable type and control scale.', 'Spacing 4/8/12/16/24; radius 8/12/16; controls 32/40/48; type 10/12/14/24/56.'],
              ['Surfaces', 'Quiet white/slate surfaces keep dense business data readable.', 'Light/Dark Mode 都使用语义色映射：blue/indigo=info/focus、amber=pending、purple=follow-up、emerald=success、rose/red=reject/critical、slate=structure；不要硬编码浅色背景或低对比文字。'],
              ['Cards', 'Cards are for repeated items, KPI tiles, modals, drawers, and framed tools.', '业务 card、panel、sidebar 和 header 使用透明 outline 的 borderless surface；用 spacing、背景和 `rounded-xl` 建立层次。输入框、focus state 和必要分隔线仍需清楚。'],
              ['Controls', 'Use controls by meaning, not by style.', '`ToggleSwitch` only for true on/off. `ToggleOptionGroup` is the conventional single-select dropdown: current value + chevron, active row emerald + check.'],
              ['Tables', 'Tables are the main working surface, not secondary decoration.', 'Stable row height, sortable useful columns, action-only columns unsorted, long lists virtualized, existing data edited only by double-click or explicit edit affordance.'],
              ['Analytics', 'Analytics should answer business questions without chart noise.', 'One main chart per subject. Big number only for the main answer. Show sample badges for small denominators and total rows before details.'],
              ['Copywriting', 'Copy should be short, concrete, and business-facing.', 'Use business terms: Customer, Lead, Loan, Vehicle, Bank, Follow Up. Avoid technical field names, UTM language, and multi-sentence UI explanations.'],
              ['Mobile', 'Mobile is for field work, not full admin configuration.', 'Prioritize Task Inbox, Follow Up, Loan Applications, Lead Pool, Calendar. Keep buttons large and summaries compact.'],
              ['Accessibility', 'Premium UI still needs visible affordance.', 'Icon-only buttons need title/aria-label。重要状态不能只靠颜色；即使 card outline 透明，keyboard focus、input boundary 和 active state 仍必须可见。']
            ]}
          />
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold text-slate-900">{manualCopy('Design debt to clean next')}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Keep semantic status colors consistent in both themes; update ICONS.md for the PNG nav icon family; continue checking focus/input visibility on borderless surfaces; keep System Manual and design.md in sync when brand rules change.
          </p>
        </div>
      </ManualSection>

      <ManualSection
        title="4. Roles & Visibility"
        subtitle={`${roleAccountCount} 个 role account 控制 staff scope、setting 权限和数据可见范围。`}
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Role', 'Default View', 'Can Do', 'Important Limit']}
          rows={[
            ['Super Admin', '系统 Owner 与 Operations 后备。', '管理 Roles & Accounts、Firebase Auth、Role Access、Task Assignment、系统设置/规则、Reset Data、删除账号、部署与安全。', 'Task Assignment 可把 Sales、Admin 或 Operations 队列保留给原业务角色，或切换给 Super Admin；指定角色没有 Active 账号时自动兜底。'],
            ['Operations Manager', '查看全部贷款申请与团队考勤。', '分配 SEO Sales、管理库存/成本、交车、实际放款、Finance Completed、负利润、Commission Paid，以及审批请求和 Leave / MC / OT。', '不能管理账号/Auth、Role Access、Vehicle Info/Bank Database 系统配置、Reset Data、删除账号、部署或安全规则。'],
            ['Admin', '通常按账号或业务权限看数据。', '处理申请、看 analytics/mission、协助 bank application follow-up。', '不应直接维护 Super Admin 专属配置。'],
            ['Sales', '默认看自己的 applications、taken/private leads、missions、风险关系和 personal analytics。', '用 CSV 或手动输入新增自己的 Private lead、跟进自己的客户、完成自己 handler mission。', '不能浏览其他人的 Private lead；只有当记录与自己的 Private lead 在 phone、IC、bank account 或 email 匹配时，才会在 Potential Customer Relationships 显示关联记录。'],
            ['Logged out', '没有 dashboard 操作入口。', '只能访问 public routes，例如 /wa redirect、/customer-intake、/s short link；Email 账号可用 Forgot password 发送 Firebase 密码重设邮件，Username 账号需由 Super Admin 重置密码。', '员工用 Username / Email + Password 登录 Firebase Auth；Username 会映射成内部 Firebase Auth email。Remember me 控制登录持久化和登录账号记忆。Role Account 只保存角色、状态和 Auth 映射。']
          ]}
        />
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
          Super Admin 可在 Setting &gt; Roles &amp; Accounts &gt; Role Access 调整页面入口，并在 Task Assignment 调整 Sales 申请跟进、Admin 审核/银行跟进、漏打下班卡、SEO 分配、库存/成本、交车、财务结算、佣金、业务审批和 Leave / MC / OT 等任务负责人。Finance Center 仍只开放给 Operations Manager 与 Super Admin；Lead、日历和留言任务继续跟随具体 owner。
        </p>
      </ManualSection>

      <ManualSection
        title="5. Customer And Loan Workflow"
        subtitle="从 Sales 分享 Customer Intake Short Link、客户自己提交，到 Admin 检查、银行处理、拒贷补件循环和最终结案的自动流程。"
        icon={<Users className="h-5 w-5" />}
      >
        <FlowStrip
          nodes={[
            { label: 'Sales 分享链接', detail: 'Sales 从 Loan Applications 生成自己的 Customer Intake Short Link，再通过 WhatsApp 发给客户；链接会保留 Sales Handler 和来源追踪。' },
            { label: 'Customer 提交', detail: '客户选择 Cash / Loan 后都使用最完整的客户资料表；住址、薪资、紧急联系人、工作与偏好不会因购买方式被隐藏或清空。' },
            { label: 'Sales 检查', detail: 'Sales 手动 Add Customer 或 Sales Short Link 提交后，申请都先留给所属 Sales。Sales 检查并补齐全部资料和文件，按「通知 Admin」后才交给 Admin；官网 SEO 入口仍先由 Operations Manager 分配 Active Sales。' },
            { label: 'Admin 检查', detail: 'Admin 勾选 Missing 文件并点击「要求补资料」后，系统自动变成 PENDING、Pending Handler，并通知原 Handler。' },
            { label: '资料完整', detail: '文件全部 Received / Not Required 后，Admin 新增 Draft 银行并点击「提交银行」。系统自动变成 IN PROCESS；银行跟进以次日 11:00 为目标，但最迟不超过提交后的 24 小时。' },
            { label: '银行处理中', detail: 'Submitted / Pending Review 银行卡提供 Approved、Follow Up Reject Bank、Follow Up Document、Rejected 和 Cancel。Reject Bank 固定进入新增其他银行；Document 选择银行要求的文件并回到同一家银行补件重提；Cancel 必须填写取消原因。Rejected 仍可加入多个 CODE 或手动原因及下一步。' },
            { label: '银行批准', detail: 'Approved 自动通知原 Handler。Sales 联系客户后点击「客户已联系」，系统才会完成该任务和通知，同时保留最终 APPROVE。' },
            { label: '银行拒绝', detail: '银行拒绝后 Loan 进入 FOLLOW UP 并等待 Handler。Sales 可「拒贷结案」，或补资料后点击「补件已完成」；系统建立下一轮 Draft 并通知 Admin 重新提交。' }
          ]}
        />
        <p className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-violet-800">
          Used-motor records keep internal Motor Mileage and Vehicle Geran fields for both Cash and Loan. Customer Application Form never shows or submits Vehicle Geran because staff uploads and records it internally in Application Detail / Task Inbox. Loan customers may still attach the separate optional Supporting Doc.
        </p>
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-amber-800">
          {manualCopy('Sales 按 Notify Admin 后，系统立即检查申请车型的可用库存；若没有库存，Operations Manager 会收到补库存与成本通知，并可从 Task Inbox 直接 Add stock。补到可用库存后，通知和任务自动解除。')}
        </p>
        <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-blue-800">
          {manualCopy('Sales 按 Notify Admin 后不会预先指定某一位 Admin。所有 Active Admin 都会在 Task Inbox 看到同一份未分配申请；第一位打开的人通过云端原子认领成为 Admin owner，其他 Admin 随即不再看到。Super Admin 可先在 Staff Filter 选择当前 owner，再用任务卡的 Reassign Admin 改派给另一位 Active Admin。')}
        </p>
        <ManualTable
          columns={['当前责任', '系统动作', '结果']}
          rows={[
            ['Sales 分享 / Customer 提交', 'WhatsApp Short Link → Customer Intake Form', 'NEW · Assigned Sales Handler · Pending Handler'],
            ['Sales 检查完整资料', 'Notify Admin', 'NEW · Unassigned Admin Pool · First Open Claims'],
            ['SEO 官网申请', 'SEO Form → Cash/Loan progressive fields → Operations Manager assignment', 'NEW · SEO marker · Pending Sales assignment'],
            ['Admin 检查', 'Request Documents', 'PENDING · Pending Handler'],
            ['Admin 检查', 'Submit to Bank', 'IN PROCESS · Pending Bank/Admin'],
            ['银行处理中', 'Approved', 'APPROVE · Pending Handler'],
            ['银行处理中', 'Follow Up Reject Bank', 'FOLLOW UP · Pending Admin Add New Bank'],
            ['银行处理中', 'Follow Up Document', 'PENDING · Pending Handler · Same Bank'],
            ['银行处理中', 'Cancel + reason', 'Cancelled bank · Re-evaluate remaining bank workflow'],
            ['Sales 跟进批准客户', 'Customer Contacted', 'APPROVE · Workflow Closed'],
            ['银行处理中', 'Need More Info', 'PENDING · Pending Handler'],
            ['银行拒绝', 'Rejected（可选多个 CODE）', 'FOLLOW UP · Handler 选择结案或重提'],
            ['Sales 提交', 'Documents Ready', 'FOLLOW UP · Pending Admin Resubmit']
          ]}
        />
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-amber-800">
          {manualCopy('Loan Status 由业务动作自动转换。Sales/Admin 不再任意选择 Status；Super Admin 只保留带 Audit Log 的紧急 override。')}
        </p>
        <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-[11px] font-semibold leading-relaxed text-blue-800">
          {manualCopy('Undo Last Action 只恢复最近一次流程动作：Notify Admin、Request Documents 和 Documents Ready 可由原执行者在下一环节行动前撤回；批准、拒贷结案和客户联系结案只允许 Super Admin 撤回。每次撤回必须填写原因并写入 Activity 与 Audit Log；若已有收款、交车、库存或佣金影响，系统会阻止直接撤回。选错银行应把该银行记录设为 Cancelled / Wrong Bank，再选择正确银行。')}
        </p>
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 font-mono text-[11px] font-semibold leading-relaxed text-emerald-800">
          {manualCopy('主流程发布前验收可运行 npm run test:e2e:loan-flow。它会实际验证 Sales 短链接与客户提交，以及 Admin / Sales 在缺件、提交银行、拒贷 CODE、补件重提、批准和客户联系结案之间的完整交接。')}
        </p>
      </ManualSection>

      <ManualSection
        title="6. Customer Detail Drawer"
        subtitle="打开 customer row 后，右侧 detail drawer 是单个 customer ID 的完整资料中心。"
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <CardGrid
          columns="md:grid-cols-2 xl:grid-cols-4"
          items={[
            { title: 'Current Action', detail: 'Application Detail 顶部先显示当前要做的动作、Pending With、Handler、当前银行、Due Date、Next Action Detail 和缺失文件。处理人不用先翻完整份资料，就能知道现在卡在哪里、由谁继续。' },
            { title: 'Admin Bank Form Filter', detail: 'Admin 在 Loan Application Detail 可开启 Bank Form Filter，只保留 File / Document Checklist 与填写银行表格所需的客户、薪资、车辆、贷款、年期、Gender、Race、Residency Status 和 Marital Status。Residency Status 继续使用原有 housing_status；编辑能力仍遵守 Role Access 的 Edit Loan Application。' },
            { title: 'Basic & Personal Info', detail: 'Share Link、Add Customer 和 Application Detail 会先按购买方式分流。客户地址分为 Permanent Address (IC) 和 Resident Address；Resident Address 可点击「Same as Permanent Address (IC)」复制。Cash 只收姓名、电话、IC、IC 自动识别的 Date of Birth、Email（可选）和两个地址；Loan 才追加 Gender、种族、婚姻、住房与居住年数。Share Link / Customer Application Form 的 Loan Gender 必填，Add Customer 可先建立未完整记录，但 Notify Admin 前必须补齐。DOB 可复制但不手动编辑。旧记录的 full_address 继续作为 Permanent Address (IC)，不会自动填充 Resident Address。' },
            { title: 'Vehicle & Purchase', detail: '两种方式都保存 primary motorcycle、New/Used 与购买方式。Cash 必须填写 Total Cash Price，二手 Cash 另外填写 Motor Mileage；Loan 继续使用员工内部的 Motor Selling Price、Deposit 和 Total Cash Price。' },
            { title: 'Employment Details', detail: '只用于 Loan，保存 Gross/Net Monthly Salary、公司、职位、工作年数、地址和 office phone；Cash 不显示、不要求，也不会在新建 Cash payload 中保存这些申请资料。所有表单都不再收集 Work Hours，旧记录仍兼容保留。' },
            { title: 'Emergency Contacts', detail: '只用于 Loan，保存两个 emergency contact 的姓名、关系、地址和电话；Cash 不显示、不要求。' },
            { title: 'Status & Preferences', detail: 'Loan 保存 call availability、Bank/Cash salary method、salary bank（只在 Bank 时）、preferred motorcycle 和 loan tenure。Cash 不显示这些贷款偏好；remarks、final status 与 reject CODE 仍属于内部流程资料。贷款银行仍由 Super Admin 在 Bank Database 流程决定。' },
            { title: 'File / Document Checklist', detail: 'Cash 新车只追踪 IC；Cash 二手车内部追踪 IC 与 Vehicle Geran。Loan 追踪 IC、Payslip 和可选 Supporting Doc；二手 Loan 内部另加 Vehicle Geran，不再显示 Guarantor Doc。Customer Application Form 不显示 Vehicle Geran；该文件只由 staff 在 Add Customer 或 Application Detail 上传和记录。IC 最多 2 个，Payslip 与 Supporting Doc 各最多 3 个，并支持一次多选；每个文件最多 10MB，上传后进入同一份 Application Detail / Task Inbox 清单并自动变 Received。' },
            { title: 'Bank Applications', detail: '每个 customer 可有多间 bank application；Admin 可记录多个 reject CODE，Reject Reason 会自动关联 Error Code Database，没有 CODE 时可手动填写原因。' },
            { title: 'Activity Thread', detail: 'Customer 内部沟通集中在 detail drawer：Admin 可 @Handler，Staff 可 @Admin/@Super Admin；实际留言会进入被 tag 员工的 Notification Center 与 Task Inbox，员工打开或确认后解除待办。Enter 提交，Shift+Enter 换行。' },
            { title: 'Copy & Edit Gestures', detail: 'Loan Applications 表格与申请详情默认不暴露 input。表格保留双击复制、三击编辑；Application Detail 改为单击复制、双击编辑。Super Admin 可编辑全部客户资料，当前 Handler 只可编辑自己负责的资料与备注；其他用户仍为只读复制。Handler 更换仍仅限 Super Admin，银行流程字段仍由 Admin/Super Admin 管理。' }
          ]}
        />
      </ManualSection>

      <ManualSection
        title="7. Bank Application Manual"
        subtitle="Bank Application 是 customer 底下的独立银行申请记录，不等于 final loan status。"
        icon={<Landmark className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Status', 'Meaning', 'Fields Admin Should Update']}
          rows={[
            ['Draft', '资料准备中，还没提交银行。', 'Preparation Notes。'],
            ['Submitted', '已经提交给银行。', 'Submitted time、Submission Notes。'],
            ['Pending Review', '银行处理中或等待回复。', 'Follow Up Notes、next action、Bank Follow Up Date。'],
            ['Need More Info', '银行要求补资料。', 'Reason、Next Action、Bank Follow Up Date，隐藏 reject fields。'],
            ['Rejected', '银行拒绝这间 bank application。', '多个 Reject CODE 会自动关联 Reject Reason；没有 CODE 时手动填写 Reject Reason，并记录 Bank Notes 与 Next Action。'],
            ['Approved', '银行批准申请。', 'Offer amount、interest、tenure、monthly installment、decision notes。'],
            ['Cancelled', '申请取消。', 'Cancellation Reason。']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="8. Setting Manual"
        subtitle="Setting 是系统行为的配置中心。改这里会影响 Customers、Tools、selection controls、analytics 和 audit。"
        icon={<Tag className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Setting Group', 'Controls', 'Impact']}
          rows={[
            ['Roles & Accounts', 'Accounts tab 管理账号与 Firebase Auth；Role Access 管理页面入口；Task Assignment 管理 Sales、Admin 和 Operations 队列，每类可保留给原业务角色或切换给 Super Admin，并列出跟随具体 owner 的固定任务。', '三个 tabs 仍只限 Super Admin；任务设置沿用现有版本化 Role Access 配置，指定角色没有 Active 账号时 Super Admin 自动兜底。'],
            ['Bank Database', 'Banks tab 管理 bank 与 icon；Reject Reason Codes tab 管理 final reject CODE；Brand Logos tab 管理车辆品牌图。', '三个资料集共用一个页面并保留原本保存、权限、图片处理与审计行为。'],
            ['Vehicle Categories', '维护 Moped、Maxi Scooter、Big Bike、Super Bike 等分类、CC 提示、2–7 年默认最长 tenure，以及按 effective date 生效的 category rate history。', 'Monthly Plan 会按申请/价格日期选取当时有效利率；车型自己的 max tenure 优先，否则使用 category default。'],
            ['Vehicle Info', '维护 Motorcycle model、alias、brand、category 与车型辨识资料；现有 price / monthly-plan 栏位只供报价参考，不是 Finance Center 或 Deal 的金额来源。', 'Duplicate Models 区集中显示全部重复车型组。Super Admin 选择一条 Master 并确认 Merge 后，系统保留 Master、补齐其空白资料、删除其余重复记录，并把相关 Loan Application 车型名称统一成 Master；也可多选车型批量设置 category/tenure。Task Inbox Quick Add Stock 的成交金额只写入当前客户 Deal。'],
            ['Commission Rules', '设置新成交佣金占最终卖价的默认百分比，以及排行榜第 1–3 名的固定奖金。', '新 Finance Deal 可先按规则产生佣金估算；Super Admin 在 Task Inbox Quick Add Stock 手动填写并保存佣金后，会改为固定金额，不再随卖价或规则自动重算。'],
            ['Brand Logos', '上传品牌图后选择 square/wide、缩放、位置和背景色。', 'Square 保存为 256×256 PNG，wide 保存为 384×128 PNG，并上传 Firebase Storage 供车型和界面共用。'],
            ['Data Cleanup', '隐藏的 Super Admin debug 区，用来维护 Vehicle、marketing、bank_reject、application_status_reason normalisation rules。', '影响 parent/category reporting，避免同义字造成 analytics drift；普通 Setting 操作不需要打开。']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="9. Tools And Rewards Manual"
        subtitle="Finance Center 负责成交、库存与佣金状态；Rewards 读取成交佣金并汇总其他激励。"
        icon={<Wrench className="h-5 w-5" />}
      >
        <CardGrid
          columns="md:grid-cols-3"
          items={[
            {
              title: 'Finance Center',
              detail: 'Operations Manager 处理 Deals P&L、Stock & Costing、实际放款、交车、Finance Completed 与 Commission Paid；Task Inbox 汇总每笔成交的当前运营事项。'
            },
            {
              title: 'Analytics',
              detail: '整页使用 Daily / Weekly / Overall 报表模式和统一日期范围；Standard / Compare 设定直接显示在顶部筛选卡。主次 KPI、申请状态、提交趋势、申请明细，以及下方 NRIC、raw lead、车型、营销、运营和 final REJECT CODE 深入分析均使用同一套筛选数据。Sales 只看 personal analytics。'
            },
            {
              title: 'Analytics Chart / Bar',
              detail: 'Application Status 在卡片右上角独立切换 Comparison、Share 和 Performance；Marketing、Vehicle Demand、Customer Profile、Operations、Lead Pool 使用同一个 Tab 面板原地切换，一次只显示一个模块。当前模块在右上角独立切换并记住 Bar、Donut、Combo、Trend。'
            },
            {
              title: 'Missing Info Summary',
              detail: 'Tools 内保留 missing info 的 assigned/pending/completed summary，只看 missing New/Used 和 Cash/Loan，不管理 custom missions。'
            },
            {
              title: 'Reward / Commission Center',
              detail: '独立 Rewards 页面当前只开放 Payout Center。成交佣金逐笔读取 Finance Deal 保存的金额与 Estimated → Earned → Payable → Paid / Reversed 状态；Missions 和 Team Battle 页面暂时隐藏，但 mission、leaderboard、fast response 和 Team Battle bonus 的既有资料与结算规则继续保留。'
            },
            {
              title: 'Team Battle',
              detail: 'Team Battle 页面当前隐藏，既有队伍、成员和奖励资料不删除。恢复入口后仍按本月 approved loan count 计算团队输赢；平手或双方 0 approved 不派赢家 team bonus。'
            },
            {
              title: 'Approval Workflow',
              detail: '旧版 Approval Workflow 当前隐藏；Leave / MC / OT 已转到独立 Attendance & Leave 页面。其他折扣、special loan case、commission 与 mission reward 审批代码继续保留。'
            },
            {
              title: 'WhatsApp Tools',
              detail: '管理同一份 Default Message；Raw Customer WhatsApp 和新建 tracking link 默认都会使用它，current staff 会自动写入 tracking。'
            },
            {
              title: 'Audit Log',
              detail: '查谁改了什么、什么时候改、old/new value、IP 和 user agent。排查数据被改动时先看这里。'
            },
            {
              title: 'Notification Center',
              detail: 'Header 铃铛、sidebar badge 与 Notification Center 全部直接使用 Task Inbox 当前 staff scope 的同一份可见任务清单，因此数量与卡片内容一致。Hidden、已完成和已解决项目都排除；Super Admin 切换 Staff Filter 后三处一起切换。'
            },
            {
              title: 'Timeframe Filter',
              detail: 'Analytics 顶部日期面板按 Daily、Weekly、Overall 显示对应预设，支持 Custom start/end date，并明确显示实际生效范围。'
            },
            {
              title: 'Reporting Source',
              detail: 'Analytics 使用 cleaned application data、raw lead data、WhatsApp click data 和 Setting normalisation rules。'
            }
          ]}
        />
      </ManualSection>

      <ManualSection
        title="10. Sales Budget Manual"
        subtitle="Sales Budget 是项目透明成本页面，方便把投入和持续成本讲清楚。"
        icon={<ReceiptText className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Cost Group', 'What It Shows', 'Data Rule']}
          rows={[
            ['Hardware', 'MacBook Pro M4 Max 64GB/1TB 参考价格。', '静态参考值，正式报价前应重新检查市场价格。'],
            ['Time Cost', '用 RM8,000 previous salary / 22 working days x 14 days 计算 builder 机会成本。', '不写入 staff payroll，只作为项目成本解释。'],
            ['Recurring Cost', 'Domain yearly、server monthly、AI service monthly，并显示 first-month 和 year-one totals。', '只读计算，不创建 billing record。'],
            ['Bill', '显示可每月 charge 的基础月费：Domain / 12、Server per month、Founder / builder time 每月 4 天。', '只读计算，不创建 invoice、payment 或 accounting record。'],
            ['Skill Value', 'AI skill、marketing skill、sales skill、data analytic skill 的贡献说明。', '没有直接 receipt，所以不计入 direct cash total。']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="11. Tracking And Public Link Rules"
        subtitle="Dashboard 有 customer intake、WhatsApp tracking 和 Raw Customer WhatsApp quick open。用途不同，不能混在一起。"
        icon={<MousePointerClick className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Link Type', 'URL', 'Purpose', 'Stored Data']}
          rows={[
            ['Customer Intake', 'https://dr-racing.com/customer-intake 或 /s/{code}', '所有生产分享链接固定使用公开域名；旧 bo.dr-racing.com public links 会先 308 redirect。Sales Short Link 提交后先通知所属 Sales 检查，Sales 按 Notify Admin 后才通知 Admin；官网 SEO 申请先进入 SEO 待分配队列。', '创建 NEW application；Sales Short Link 初始 Pending Handler，SEO 来源保留在 customer_intake_tracking 并由 Super Admin 分配 Active Sales Handler。'],
            ['WhatsApp Tracking', 'https://dr-racing.com/wa?... 或 /s/{code}', '所有生产 tracking links 固定使用公开域名，记录点击来源后跳去 WhatsApp。', '默认使用 WhatsApp Tools 的 Default Message，并写入 WhatsAppTrackingClick，自动记录当前 staff。'],
            ['Raw Lead WhatsApp', 'Open Lead 的 WhatsApp action', '用 WhatsApp Tools 默认 message 直接打开 raw lead WhatsApp。', '把 public lead 标记为 Taken Lead，记录 owner/time/status，设为 Contacted 并立即移到 My Leads；不创建 customer，不写 tracking click。'],
            ['Short Link', 'https://dr-racing.com/s/{code}', '生产短链接固定使用 canonical public origin，不使用 staff dashboard 当前 origin。', '同一套 short link mechanism 可服务 customer intake 和 WhatsApp tracking。']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="12. Data Storage And Sync"
        subtitle="系统先保证本机可用，再尝试同步 Firebase。"
        icon={<Database className="h-5 w-5" />}
      >
        <FlowStrip
          nodes={[
            { label: 'React state', detail: '用户操作后先更新当前页面状态，UI 立即反映。' },
            { label: 'localStorage cache', detail: '启动时先从本机 cache 显示数据；Firebase 不可用时仍能继续使用。' },
            { label: 'Queued Firebase save', detail: '如果 Firebase configured，修改会在 250ms 内合并后顺序保存，pagehide 时会 flush pending edit，避免旧 async save 覆盖新数据。需要确认结果的流程会等云端 customer save 成功才显示完成；失败会恢复旧资料，不写入假 Audit。' },
            { label: 'Staff live applications', detail: 'Sales、Admin 与 Super Admin 登录并完成云端同步后，都会增量监听自己有权查看的 customers；其他 Staff 保存申请或文件 metadata 后，列表、Task Inbox 和已打开的 Application Detail 会自动更新，不需要刷新。监听不会自动下载文件内容，只有打开预览时才从 Storage 读取。' },
            { label: 'Live conflict guard', detail: '若另一台设备更新同一客户，而当前设备已有不同的本地修改，系统保留当前画面、停止合并并要求刷新；实时收到的资料只更新本机 cache，不由每个在线 Admin 重复回写云端通知。' },
            { label: 'Sync badge', detail: 'Header 对 staff 显示产品化状态：已同步、缓存中、本地模式、同步中、同步失败；Firebase 只留在内部技术说明。' },
            { label: 'Reminder dates', detail: 'Customer call-back 和 bank follow-up 存在 customer/bank records；Calendar、Task Inbox 和 Notifications 只读取这些日期。' },
            { label: 'Notifications', detail: '系统根据当前 dashboard data 和 comment tag 生成、去重并保存 notification。Raw lead assignment 以接手/转交事件产生；handler read 后 resolved，release 后移除，重新接手才产生新事件。' },
            { label: 'Production data', detail: '系统不再自动 seed demo customer。资料来自实际 intake、手动新增、Raw Lead 流程或受控 Excel missing-only import。' },
            { label: 'Audit append', detail: '重要变更在业务资料保存成功后 append audit log，记录变更来源。Admin 记录 Bank Decision 时只改 bank/workflow；已有库存或财务记录由 Finance 流程继续维护，不会被审批动作顺带重写。' }
          ]}
        />
      </ManualSection>

      <ManualSection
        title="13. Source Code Map"
        subtitle="Admin 不需要改代码，但这张表说明每个功能大概由哪个 module 负责，方便交接给 developer。"
        icon={<GitBranch className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Area', 'What It Does', 'Main File']}
          rows={[
            ['App Shell', '登录、routing、state、localStorage/Firebase sync、audit handlers。', 'src/App.tsx'],
            ['Task Inbox', '每次只显示一个员工的 tasks 和 notifications，并内含 Open Leads。到期 lead follow-up 直接成为带状态、下次提醒、备注和 WhatsApp 操作的 Tasks 卡片，不使用独立 Follow Up tab。Admin / Super Admin 的管理 scope 另会聚合前一天漏打下班卡的员工考勤任务，并实时消费共享结案记录。同一 Deal 的多个财务异常合并为一张 Finance review 卡；零售价 / 零收款不会被解释成已收齐。Super Admin 默认只看自己的任务，并可用 Staff Filter 选择 Active staff；没有 All Staff 任务汇总。', 'src/components/TaskInboxPage.tsx'],
            ['Staff View', 'Mobile-first staff 工作台，聚合自己的 leads、missions、customer tasks，并提供 Call/WhatsApp/Mark Contacted/Next Follow-up 大按钮。', 'src/components/StaffMobileView.tsx'],
            ['Customers', '客户列表、9 个可点击 summary/filter cards、Add Customer、customer intake link。默认只看最近 30 天；Total card 看全部状态，一般状态各自筛选，Follow Up 分为 Reject Bank（银行拒绝后新增其他银行）与 Document（补齐银行要求的资料后重提同一家银行）。普通首次缺文件不计入 Document。列表和 cards 共用 staff/time scope。', 'src/components/CustomerList.tsx'],
            ['Detail Drawer', '单个 customer 的完整资料、bank application、payslip、internal comment/activity thread、status edit。', 'src/components/DetailDrawer.tsx'],
            ['Task Inbox / Open Leads', '任务队列用 Open Leads / My Leads tab 分开公共未领取与本人负责的名单。两个 tab 都可按 All Dates / Today / Yesterday / Earlier 筛 Date Added，并在 Newest First / Oldest First 间排序；默认最新在上。两列卡片按实际 Date Added 日历日期分组，日期变化时插入横跨全宽的 Today / Yesterday / 完整日期分隔线。领取 Public lead 后自动转到 My Leads > Contacted；My Leads 的日期筛选可叠加 All、Contacted、Follow Up Due、Interested 状态筛选，到期名单也进入 Tasks。Public Taken Lead 可由 owner/Admin/Super Admin 确认后放回公共池，Private Lead 不可放回。Sales 与 Super Admin 手动 Add Lead 时先选择 Open Leads / Public Pool 或 My Leads / Private Pool；三个角色导入 TikTok CSV 时使用同一目标选择。Super Admin 可在 My Leads 多选现有 Private Lead，再用 Assign Selected 转交其他 Active Admin/Sales。支持 checkbox 多选、Select All、Delete Selected 和当前 tab / 当前筛选 Delete All；删除须确认。', 'src/components/TaskInboxPage.tsx + src/utils/rawLeadEntry.ts + src/App.tsx + firestore.rules'],
            ['Task Inbox / Relationship Issues', '案件级风控页：只有 new/investigating case 存在时显示入口；Sales 只读，Admin/Super Admin 成功载入 metadata 后可修改。', 'src/components/CustomerRelationshipRiskPage.tsx + src/services/relationshipMetaStorage.ts + src/utils/rawLeadImportExclusions.ts'],
            ['Calendar', '执行监督月历，显示 customer call-back、bank/raw-lead follow-up 日期与管理层安排；不再承载独立 Follow Up tab。', 'src/components/CalendarPage.tsx'],
            ['Attendance & Leave', '不限次数打卡、Admin 每周排班与月薪快照、Operations Manager 全员查看及 Leave / MC / OT 审批；系统考勤规则仍由 Super Admin 管理。', 'src/components/AttendancePage.tsx + src/utils/attendanceSummary.ts + src/services/dashboardRepository.ts + staff_leave_requests + firestore.rules'],
            ['Finance Center', 'Operations Manager 的库存、成本、成交、实际放款、交车、Finance Completed、负利润与佣金结算工作台。', 'src/components/FinanceCenter.tsx + src/components/RewardCommissionCenter.tsx + src/App.tsx'],
            ['Setting', 'Roles & Accounts 内含 Accounts / Role Access / Task Assignment；Bank Database 内含 Banks / Reject Reason Codes / Brand Logos；另有 Vehicle Info、Commission Rules 与 normalisation rules。', 'src/components/TagsAdmin.tsx + src/components/RoleAccessControlPage.tsx + src/data/roleNavAccess.ts'],
            ['Notification Settings', 'V1 当前隐藏；代码保留，恢复后供 Super Admin 查看通知触发、接收人、跳转和解除规则。', 'src/components/NotificationSettingsPage.tsx + src/hooks/useDashboardNotifications.ts + src/data/v1Scope.ts'],
            ['Vehicle Rules', '分类默认 tenure、effective rate、车型 effective price/deposit history、model override 和 bulk tenure/category。', 'src/data/vehicleCategories.ts + src/components/VehicleCategoryManager.tsx + src/components/VehicleModelPriceControls.tsx + src/components/VehicleBulkTenure.tsx'],
            ['Brand Logo Storage', '裁切后的 square/wide PNG 上传和共用。', 'src/services/brandLogoStorage.ts'],
            ['Motor Price Seed', '从 motor price.xlsx 融合进 Vehicle Information 的车型价格表。', 'src/data/motorPriceCatalog.ts'],
            ['Tools Analytics', 'Daily/Weekly/Overall 模式、顶部统一日期/对比面板、主次 KPI、卡内状态视图、自适应趋势、申请明细，以及一次显示一个模块的深入分析 Tab 面板。Operations 内的 Completed Tasks 按实际完成时间统计员工、任务分类、具体任务类型和逾期完成数；EXP 排名与计分不放在 Analytics。Marketing WhatsApp Tracking 模块当前隐藏，tracking 数据与 WhatsApp Tools 保留。', 'src/components/AnalyticsDashboard.tsx + src/utils/taskCompletionAnalytics.ts'],
            ['Staff EXP', 'Super Admin 专属独立页面，用同一批去重 Completed Task History 显示本月总 EXP、员工排名、Level 进度、角色贡献、最近 EXP 历史，并可编辑、恢复默认及保存 16 种任务的 EXP 分数。规则跟随现有 dashboard version sync；员工端只读取 EXP 规则投影，不读取佣金金额。', 'src/components/StaffExperienceDashboard.tsx + src/utils/staffExperience.ts + src/services/dashboardRepository.ts'],
            ['Reward Center', '当前只开放 Payout Center；Missions 和 Team Battle 页面由 V1 scope 隐藏。成交佣金逐笔读取 Finance Deal 生命周期，其他 mission、leaderboard 和 team bonus 资料保留。', 'src/components/RewardCommissionCenter.tsx + src/utils/commissionSettlement.ts + src/data/v1Scope.ts'],
            ['Sales Budget', '透明成本页，展示 MacBook、人力、domain、server、AI service、skill value、首月总成本、月费和第一年成本。', 'src/components/SalesBudgetPage.tsx'],
            ['Approval Workflow', '隐藏的旧版折扣、特殊 loan case、commission 与 mission reward 审批代码；Leave / MC / OT 已使用独立 Attendance & Leave 页面。', 'src/components/ApprovalWorkflowPage.tsx'],
            ['Staff Avatar', '共享 staff avatar、staff name badge 和上传式 default avatar library；从 Role Accounts 的 avatar_data_url、default_avatar_id 和 dashboard defaultAvatarLibrary 读取。', 'src/components/StaffAvatar.tsx + src/components/StaffNameBadge.tsx'],
            ['WhatsApp Tools', '每位员工可编辑自己的 Raw lead default message；讯息按 staff 名称保存在当前装置，下次登录或重开仍会载入，不会覆盖其他员工。页面同时提供 own tracking link builder、copy full link、copy short link、recent clicks。', 'src/components/WhatsAppTrackingAdmin.tsx + src/App.tsx'],
            ['User', 'User Profile 管理 avatar、默认 bank/lead follow-up days 和 WhatsApp 在新标签页/当前页面打开的本机偏好，并让 Firebase staff 验证当前密码后自行修改姓名、登录 Username / Email 或密码。Username 会映射成内部 Firebase Auth email；姓名修改由受保护 backend 同步 Auth claims、staff_access、Role Account、登录目录及客户/Lead/日历/考勤等业务归属；同时显示本人当月 Level、EXP 进度、完成数和已载入历史的 Tracked EXP。', 'src/components/UserProfilePage.tsx + src/App.tsx + server.mjs + src/lib/auth.ts + shared/staffLoginIdentifier.mjs + src/utils/staffExperience.ts'],
            ['Notification Center', 'Header 铃铛、badge 与面板直接镜像 Task Inbox 当前单一 Staff scope 的可见任务；Hidden、已完成和已解决项目不显示，卡片统一返回 Task Inbox 处理。', 'src/components/NotificationCenter.tsx + src/components/TaskInboxPage.tsx + src/App.tsx'],
            ['Audit Log', 'Search/sort audit entries and changed fields；Task Inbox/loan/lead/Vehicle Info 的完成动作会在原有 audit entry 中附加结构化 task completion marker，供 Analytics 与 EXP 统计，并继续保持 append-only。Super Admin 最多载入最新 2,000 条记录。', 'src/components/AuditLogAdmin.tsx + src/utils/taskCompletionAnalytics.ts + src/utils/staffExperience.ts'],
            ['Firebase Repository', 'Dashboard state load/save，包括 vehicle categories；250ms queue/pagehide flush 由 persistence hook 管理。', 'src/services/dashboardRepository.ts + src/hooks/useDashboardPersistence.ts'],
            ['Excel Customer Import', '默认 dry run；Excel 日期按原始 serial 解码，避免时区造成跨月。恢复缺失资料时使用 --write --missing-only，只新增不存在的 deterministic IDs，不覆盖现有客户。', 'scripts/import-loan-applications-from-xlsx.ts'],
            ['Types + Defaults', 'Data model、default banks、vehicles、normalisation rules。', 'src/types.ts + src/data/mockData.ts']
          ]}
        />
      </ManualSection>

      <ManualSection
        title="14. Admin Checklist"
        subtitle="日常管理时按这个顺序检查，能快速知道系统和业务是否健康。"
        icon={<CheckCircle2 className="h-5 w-5" />}
      >
        <CardGrid
          columns="md:grid-cols-2 xl:grid-cols-4"
          items={[
            { title: 'Morning', detail: '先打开 Task Inbox，看当前 staff 今天要处理的 missing info、raw follow-up、bank pending、reminder 和 custom mission progress。' },
            { title: 'Mobile Staff', detail: 'Sales 在手机上优先打开 Staff View：先处理 due follow-up lead，再用 Call/WhatsApp/Mark Contacted/Next Follow-up 更新状态。' },
            { title: 'Raw Leads', detail: '导入最新 raw lead CSV，检查 Duplicated numbers；确认错误名单后从 Duplicate Leads 删除，之后导入会自动排除。' },
            { title: 'Risk Relationships', detail: '打开 Potential Customer Relationships，先处理待处理/高风险案件，分配负责人并开始调查；并排核对 phone、IC、bank account、email，记录评论后选择明确结果结案。' },
            { title: 'Missing Info', detail: '去 Tools > Missing Info Summary，看哪些 staff 未补 New/Used、Cash/Loan 或 File / Document Checklist。' },
            { title: 'Commission', detail: '去 Finance Center > Commission Ledger 检查本月 Estimated、Earned、Payable、Paid 与 Reversed；需要结算时回到 Task Inbox，规则金额在 Configuration > Commission Rules 修改。' },
            { title: 'Bank Follow-up', detail: '打开 customer detail，更新 bank application status、need more info、reject/approved decision。银行拒绝且没有其他 pending、approved 或 draft bank 时，Admin / Super Admin 可直接使用 Close Rejected File 结案；assigned Sales 仍可在 Handler 阶段结案。' },
            { title: 'Notifications', detail: '先看 Header 铃铛的 Action Needed。用 Staff Filter 检查负责人的 Bank Need More Info；New raw lead assigned 只发给实际被分配的 Admin / Sales，并由该 handler 打开后 resolved。Super Admin 分配给自己时不产生这项通知任务。' },
            { title: 'Rejected Loans', detail: 'Final loan REJECT 时必须填至少一个纯数字 CODE；每个 CODE 都要有独立 explanation，全部 CODE chips 会进入 Analytics。Missing Reject Code Explanation 默认隐藏，用户触发后才显示。' },
            { title: 'Settings', detail: '新增 bank、vehicle、source 或 CODE 前先查已有关系。修改车辆分类利率、价格历史、deposit 或 max tenure 后，核对 Monthly Plan；Brand Logo 也从 Setting 统一维护。' },
            { title: 'Audit', detail: '发现数据异常时先看 Tools > Audit Log，确认 staff 和 changed fields。' },
            { title: 'Sync', detail: 'Header 显示 Firebase error 时，先确认本机仍是 local mode，再处理 Firebase config/rules。' }
          ]}
        />
      </ManualSection>

      <ManualSection
        title="15. Common Issues"
        subtitle="Admin 遇到问题时先看这些规则。"
        icon={<LifeBuoy className="h-5 w-5" />}
      >
        <ManualTable
          columns={['Question', 'Answer', 'Where To Check']}
          rows={[
            ['为什么 customer 没有出现在某个 staff 视图？', 'Customers 默认按 staff scope；确认当前员工是否为 handler_name 或 admin_owner_name。Super Admin 开启 Show All 后，Staff Filter 会同时匹配这两个归属。', 'Customers top staff scope card 与 Staff 栏。'],
            ['为什么 30 天以前的贷款资料不见了？', 'Customers 和 8 张 cards 默认只统计最近 30 个 calendar days，旧资料没有被删除。由用户把 time filter 切到 All time 或选择自定义日期。', 'Customers time filter。'],
            ['为什么 Staff View 没有某个 lead？', 'Staff View 只显示当前 staff 自己 taken 的 lead；确认 raw lead 的 taken_by_staff_name 是否等于当前登录 staff。', 'Raw Customers / Follow Up。'],
            ['为什么 Sales 的 Analytics 数字比 Admin 少？', 'Sales Analytics 是 personal scope，只统计自己的 customers、taken raw leads、WhatsApp links/clicks 和自己的 role account。Admin/Super Admin 才看 all-staff analytics。', 'Tools > Analytics scope badge。'],
            ['员工怎样更改或找回自己的密码？', '已登录员工到 User > User Profile 展开 Change Password，输入当前密码和至少 8 个字符的新密码；忘记密码时在登录页输入 email 后点击 Forgot password 接收 Firebase 重设邮件。Super Admin 仍可在 Roles & Accounts 用账号 row 的钥匙按钮代为重置。', 'User > User Profile / Login / Setting > Roles & Accounts。'],
            ['员工怎样修改自己的姓名或登录 Username / Email？', '到 User > User Profile 的 Account Information 点击 Edit，输入新姓名、Username / Email 和当前密码后保存。系统会自动同步登录身份和现有工作归属，并重新载入页面；Role 不能在这里修改。姓名与登录账号都必须保持唯一。Username 账号不能收重设密码邮件，需要联系 Super Admin。', 'User > User Profile > Account Information。'],
            ['为什么新增 Role Account 后 Firebase 没有用户或密码没变？', 'Roles & Accounts 的 Add Account 会通过受保护 backend API 创建或连接 Firebase Auth user；连接已存在 user 时不会改旧密码。员工可自行更改或找回密码；管理员代为重置时使用该账号 row 的钥匙按钮。必须用 Firebase Auth Super Admin 登录。', 'Setting > Roles & Accounts / Firebase Authentication。'],
            ['为什么 Reset Data 要确认两次？', '第一层确认无法撤销的删除范围；第二层必须输入当前已登录 Super Admin 的 Firebase 密码。backend 只接受两分钟内重新验证过的 Super Admin token，密码错误、验证过期或身份不符都不会开始删除。', 'Setting > Data Cleanup。'],
            ['为什么 Missing Info 一直出现？', '该 customer 缺 New/Used、Cash/Loan 或 File / Document Checklist 里仍有 Missing 文件，且 handler 是当前 staff。补齐后 missing info 会消失。', 'Tools > Missing Info Summary。'],
            ['为什么上传后 checklist 自动变 Received？', '每个 File / Document Checklist item 都有自己的 upload button。该 item 有文件后系统自动视为 Received；没有文件时用户只能手动选择 Missing 或 Not Required。', 'Customer Detail Drawer > File / Document Checklist。'],
            ['Custom Mission 的进度怎么算？', 'Top Sales 算 approved loan，Fast Response 算 taken lead 到 first follow-up 的平均分钟，Raw Lead Conversion 算 taken lead 是否匹配到 customer application。', 'Rewards > Missions。'],
            ['创建 Custom Mission 前怎样决定 target？', '打开 New Mission 后看 Reference Data。它会根据当前 metric、timeframe、scope 显示 staff 现有表现和 current leader。', 'Rewards > Missions > Custom Mission Builder。'],
            ['为什么 Reward Center 金额还没变成 Approved？', 'Reward Center 先显示从现有数据推算的 earned/estimate。真正发放必须在 Approval Workflow 提交并审核，审核后才会显示 Approved/Pending。', 'Rewards + Tools > Approvals。'],
            ['为什么银行跟进没有出现在 Calendar/Task Inbox？', '银行提醒不单独存表。需要在 Bank Application 填 Bank Follow Up Date，到期后才会出现在 Calendar、Task Inbox 和 Notification。', 'Customer Detail Drawer > Bank Applications。'],
            ['为什么 Notification badge 和 Task Inbox 数量不同？', '现在两者必须相同，因为铃铛、Notification Center 和 Task Inbox 都使用当前 staff scope 的同一份可见待办。Hidden、已完成或已解决项目不会进入铃铛；若刚切换 staff，请以 Task Inbox 完成载入后的数量为准。', 'Header Notification Center + Task Inbox Staff Filter。'],
            ['为什么 New raw lead assigned 一直出现？', '它只应在实际把 lead 分配给 Admin / Sales 时创建一次，而且只属于该员工。handler 打开后 resolved；release 会移除，重新 take 才创建新事件。Super Admin 分配给自己不会产生该任务；若只是在别人的 scope 查看，也不会替 handler resolved。', 'Raw Customers + Notification Center。'],
            ['为什么 bank selection 没有某间银行？', 'Bank Database 里该 bank 可能 inactive 或未创建。', 'Setting > Bank Database。'],
            ['为什么 Analytics source 很乱？', 'Marketing source 没有 normalisation rule，或 parent/category 被重复创建。', 'Setting > Debug Data Cleanup > Data Cleanup。'],
            ['为什么 rejected code 没有说明或数量不对？', 'Bank Database 的 Reject Reason Codes 必须为纯数字 code 加 explanation；final status 为 REJECT 时，每个 code 独立匹配一个解释。Missing Reject Code Explanation 默认隐藏，点击 Show missing explanations 才展开。', 'Setting > Bank Database + Customers final status。'],
            ['为什么 Vehicle Monthly Plan 跟预期不同？', '检查车型 category、计算日期对应的 effective rate、当时有效的 loan amount/deposit price history、finance profile，以及 model max tenure/category default tenure。', 'Setting > Vehicle Categories / Vehicle Info。'],
            ['为什么 Dark Mode 的状态颜色看起来不对？', '状态必须使用语义色：amber pending、purple follow-up、emerald success、rose/red reject、blue/indigo info。若某个组件硬编码浅色背景，需要按这套规则修正，而不是加 card outline。', 'System Manual > Brand / UIUX Guide。'],
            ['为什么 Firebase error？', 'Dashboard 会先用 localStorage 继续运行。需要检查 .env.local、Firestore rules 或 network。', 'Header sync badge + browser console。']
          ]}
        />
      </ManualSection>

      <section className="rounded-2xl bg-red-800 p-5 text-white">
        <div className="flex items-start gap-3">
          <BookOpenText className="mt-0.5 h-5 w-5 text-indigo-300" />
          <div>
            <h3 className="text-sm font-bold">{manualCopy('Main Rule')}</h3>
            <p className="mt-2 max-w-5xl text-xs leading-relaxed text-slate-300">
              {manualCopy('Admin/Sales 尽量输入真实业务资料；系统负责 normalisation、matching、audit 和 reporting。Raw leads 不直接变 Customers；customer 不填写 staff-only purchase fields；Setting 是业务规则来源；Tools 是 reporting/tracking/audit；所有重要修改都应该能在 Audit Log 找到。')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
