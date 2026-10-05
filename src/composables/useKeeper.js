import { computed, reactive } from 'vue'
import { createStorage } from '../services/storage'
import { config, seed, migrateUsage } from '../data'

const storage = createStorage(config.storageKey, seed)
export function useKeeper() {
  const state = reactive(storage.read())
  const persist = () => storage.write(state)
  // 迁移旧外借记录：缺少应还日期且可推断（有借出日期）的按默认规则补齐并落盘；迁移幂等，无借出日期的记录保持空缺
  if (Array.isArray(state.usages) && state.usages.some((x) => !x.dueDate && x.date)) {
    state.usages = state.usages.map(migrateUsage)
    persist()
  }
  const add = (collection, item) => { state[collection].unshift({ id: `${collection}-${Date.now()}`, createdAt: new Date().toISOString(), ...item }); persist() }
  const update = (collection, id, patch) => { const item = state[collection].find((entry) => entry.id === id); if (item) Object.assign(item, patch); persist() }
  const remove = (collection, id) => { state[collection] = state[collection].filter((entry) => entry.id !== id); persist() }
  const reset = () => { Object.assign(state, structuredClone(seed)); persist() }
  const metrics = computed(() => config.metrics.map((metric) => ({ ...metric, value: metric.value ? metric.value(state) : state[metric.collection]?.length || 0 })))
  return { state, add, update, remove, reset, persist, metrics }
}
