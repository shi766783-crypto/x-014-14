import { migrateState } from '../data'

export function createStorage(key, seed) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key)
      // 读取时统一做迁移：旧记录补齐应还日期，且对损坏/空数据回退到种子数据
      return migrateState(raw ? JSON.parse(raw) : structuredClone(seed))
    } catch {
      return migrateState(structuredClone(seed))
    }
  }
  const write = (value) => localStorage.setItem(key, JSON.stringify(value))
  return { read, write }
}
