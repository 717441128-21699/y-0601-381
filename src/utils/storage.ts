import Taro from '@tarojs/taro'

const STORAGE_PREFIX = 'eye_health_'

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const fullKey = STORAGE_PREFIX + key
      const value = Taro.getStorageSync(fullKey)
      if (value === '' || value === undefined || value === null) {
        return defaultValue ?? null
      }
      return JSON.parse(value) as T
    } catch (e) {
      console.error('[Storage] get error:', key, e)
      return defaultValue ?? null
    }
  },

  set(key: string, value: unknown): void {
    try {
      const fullKey = STORAGE_PREFIX + key
      Taro.setStorageSync(fullKey, JSON.stringify(value))
    } catch (e) {
      console.error('[Storage] set error:', key, e)
    }
  },

  remove(key: string): void {
    try {
      const fullKey = STORAGE_PREFIX + key
      Taro.removeStorageSync(fullKey)
    } catch (e) {
      console.error('[Storage] remove error:', key, e)
    }
  }
}
