import type { AppData } from './types'
import journeySeed from '../data/journeySeed.json'

/** 默认数据 = 日记加工后的 journey seed（首次访问 / 新存储键时写入） */
export function createSeedData(): AppData {
  // 深拷贝，避免运行时改到模块缓存
  return structuredClone(journeySeed) as AppData
}
