// V1 stays intentionally compact. Hidden entries keep their code and stored
// data, but are removed from navigation and page-access configuration until a
// later stage. Re-enable an entry by removing its key from this set.
export const V1_HIDDEN_NAV_KEYS = new Set<string>([
  'staffView',      // 手机模式
  'payouts',        // 佣金与奖励独立页（佣金总账并入财务中心；Sales 在任务箱看「我的佣金」）
  'rewards',        // 佣金与奖励页面路由（同上，保留全部数据与代码）
  'rewardMissions', // 自定义任务页（保留任务数据和收入结算行）
  'teamBattle',     // 战队对决页（保留战队数据和收入结算行）
  'approvals',      // 审批流程
  'missingInfo',    // 缺失资料汇总（任务箱已覆盖个人缺失提醒）
  'permissions',    // 权限设定（尚未实际拦截，V2 再放出）
  'notificationSettings', // 通知设定（保留规则关系页代码，V1 暂不开放）
  'salesBudget',    // 系统成本（owner-facing proposal, not for client delivery）
  'manual'          // System Manual（英文目录完成前不开放）
]);
