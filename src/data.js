export const today = new Date().toISOString().slice(0, 10)
const days = (date) => Math.ceil((new Date(`${date}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000)
// 旧外借记录迁移规则：借用中但没有应还日期的，默认按「借出日 + 30 天」补约定期限
export const DEFAULT_LOAN_DAYS = 30
const addDays = (date, count) => new Date(new Date(`${date}T00:00:00Z`).getTime() + count * 86400000).toISOString().slice(0, 10)
// 逾期只与「仍借用中 + 已过应还日期」有关，按当天实时计算，天数随时间自然增长
export const isOverdue = (usage) => usage.status === '借用中' && !!usage.dueDate && days(usage.dueDate) < 0
export const overdueDays = (usage) => (isOverdue(usage) ? -days(usage.dueDate) : 0)
function migrateUsage(entry) {
  if ('dueDate' in entry) return entry
  // 已归还的旧记录已了结，无需补期限，置空且永不参与逾期判断；
  // 借用中按统一宽限期补默认值，是否逾期取决于借出时间，而非一律判逾期。
  return { ...entry, dueDate: entry.status === '借用中' && entry.date ? addDays(entry.date, DEFAULT_LOAN_DAYS) : null }
}
export function migrateState(data) {
  if (!data || typeof data !== 'object') return structuredClone(seed)
  return { ...data, usages: Array.isArray(data.usages) ? data.usages.map(migrateUsage) : [] }
}
export const config = {
  storageKey: 'family-document-keeper-v1',
  brand: '家档管家', subtitle: 'Family Archive', icon: 'FolderLock', entityLabel: '证件档案', secondaryLabel: '家庭保险', historyLabel: '使用记录', heroTitle: '让重要文件，始终井然有序。', heroCopy: '证件、保单和家庭文件，都有清晰的去处与提醒。', createLabel: '新建档案',
  nav: [{ id: 'overview', label: '总览' }, { id: 'documents', label: '证件档案' }, { id: 'history', label: '使用记录' }, { id: 'insurance', label: '家庭保险' }, { id: 'achievements', label: '成就与榜单' }],
  metrics: [
    { label: '证件总数', collection: 'documents', tone: 'green' },
    { label: '90天内到期', tone: 'peach', value: (s) => s.documents.filter((x) => x.expires && days(x.expires) >= 0 && days(x.expires) <= 90).length },
    { label: '已过期', tone: 'red', value: (s) => s.documents.filter((x) => x.expires && days(x.expires) < 0).length },
    { label: '外借未还', tone: 'blue', value: (s) => s.usages.filter((x) => x.status === '借用中').length },
  ],
  form: { title: '新建证件档案', collection: 'documents', fields: [
    ['name', '证件名称', '身份证'], ['category', '类别', '身份类'], ['holder', '持有人', '林小满'], ['number', '证件号码', '110***********'], ['issued', '签发日期', '2023-01-01', 'date'], ['expires', '有效期至', '2033-01-01', 'date'], ['issuer', '发证机关', 'XX市公安局'], ['location', '存放位置', '保险柜'], ['copyLocation', '复印件位置', '云盘 / 家庭共享'], ['notes', '备注', ''],
  ]},
  categories: ['身份类', '资产类', '合同类', '医疗类', '教育类', '其他'],
  achievements: ['首次建档', '证件齐全', '零过期遗忘', '续办及时', '家庭档案大师', '收纳有序', '安全存档', '保险规划师', '使用有迹', '家庭守护者', '资料无忧', '档案领航员']
}
export const seed = {
  documents: [
    { id: 'doc-1', name: '林小满身份证', category: '身份类', holder: '林小满', number: '110***********', issued: '2023-01-18', expires: '2033-01-18', issuer: '杭州市公安局', location: '保险柜 · A-02', copyLocation: '家庭云盘 / 身份证', notes: '正反面已扫描' },
    { id: 'doc-2', name: '家庭医疗保险合同', category: '医疗类', holder: '林家', number: 'POL-2026-019', issued: '2026-01-01', expires: '2026-11-20', issuer: '安和保险', location: '书房文件盒', copyLocation: '云盘 / 保单', notes: '续保前确认受益人' },
    { id: 'doc-3', name: '周末房产合同', category: '资产类', holder: '林小满', number: 'PROP-0081', issued: '2024-06-12', expires: '2026-08-10', issuer: '杭城置业', location: '主卧抽屉', copyLocation: '云盘 / 房产', notes: '已过期的合同提醒仅供归档' },
  ],
  usages: [{ id: 'use-1', documentId: 'doc-1', date: '2026-09-16', purpose: '办理银行业务', borrower: '林小满', status: '借用中', note: '周五归还' }, { id: 'use-2', documentId: 'doc-2', date: '2026-08-11', purpose: '理赔资料', borrower: '林小满', status: '已归还', note: '' }, { id: 'use-3', documentId: 'doc-3', date: '2026-08-20', purpose: '办理过户手续', borrower: '周予安', status: '借用中', dueDate: '2026-09-03', note: '对方暂未归还，记得催还' }],
  policies: [{ id: 'pol-1', company: '安和保险', type: '家庭医疗险', number: 'AH-33001', insured: '林家', expires: '2026-11-20', premium: 2890, payment: '年缴' }],
}
export { days }
