import { create } from 'zustand'
import dayjs from 'dayjs'
import type { DailyRecord, Settings, Badge, TimerSession, EnvironmentRecord } from '@/types'
import { storage } from '@/utils/storage'
import { getTodayStr } from '@/utils/date'
import { BADGE_LIST } from '@/data/badges'
import { mockRecords } from '@/data/mockData'

interface EyeHealthState {
  records: DailyRecord[]
  settings: Settings
  badges: Badge[]
  currentSession: TimerSession | null
  todayScreenTime: number
  streakDays: number
  environmentRecords: EnvironmentRecord[]

  init: () => void
  updateSettings: (settings: Partial<Settings>) => void
  addScreenTime: (minutes: number) => void
  addEyeExercise: () => void
  updateDryness: (level: number) => void
  updateSleep: (hours: number) => void
  updateOutdoor: (minutes: number) => void
  updateVision: (left: number, right: number) => void
  startSession: (type: 'focus' | 'rest', duration: number) => void
  endSession: (completed: boolean) => void
  checkBadges: () => void
  getTodayRecord: () => DailyRecord | undefined
  getWeekRecords: () => DailyRecord[]
}

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  restDuration: 5,
  blinkReminder: true,
  blinkInterval: 20,
  farViewReminder: true,
  farViewInterval: 40,
  nightMode: false,
  nightStart: '22:00',
  nightEnd: '07:00',
  soundEnabled: true,
  vibrationEnabled: true
}

const getTodayRecordFromList = (records: DailyRecord[]): DailyRecord | undefined => {
  const today = getTodayStr()
  return records.find(r => r.date === today)
}

export const useEyeStore = create<EyeHealthState>((set, get) => ({
  records: [],
  settings: DEFAULT_SETTINGS,
  badges: [...BADGE_LIST],
  currentSession: null,
  todayScreenTime: 0,
  streakDays: 0,
  environmentRecords: [],

  init: () => {
    const savedSettings = storage.get<Settings>('settings')
    const savedRecords = storage.get<DailyRecord[]>('records')
    const savedBadges = storage.get<Badge[]>('badges')
    const savedStreak = storage.get<number>('streakDays')

    const records = savedRecords && savedRecords.length > 0 ? savedRecords : mockRecords
    const todayRecord = getTodayRecordFromList(records)

    set({
      settings: savedSettings || DEFAULT_SETTINGS,
      records,
      badges: savedBadges || BADGE_LIST,
      todayScreenTime: todayRecord?.screenTime || 0,
      streakDays: savedStreak || 7
    })
  },

  updateSettings: (settings) => {
    const newSettings = { ...get().settings, ...settings }
    storage.set('settings', newSettings)
    set({ settings: newSettings })
  },

  addScreenTime: (minutes) => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.screenTime += minutes
    } else {
      todayRecord = {
        date: today,
        screenTime: minutes,
        eyeExerciseCount: 0,
        sleepHours: 7,
        outdoorMinutes: 0,
        drynessLevel: 0
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({
      records: [...records],
      todayScreenTime: todayRecord.screenTime
    })
  },

  addEyeExercise: () => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.eyeExerciseCount += 1
    } else {
      todayRecord = {
        date: today,
        screenTime: 0,
        eyeExerciseCount: 1,
        sleepHours: 7,
        outdoorMinutes: 0,
        drynessLevel: 0
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({ records: [...records] })
    get().checkBadges()
  },

  updateDryness: (level) => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.drynessLevel = level
    } else {
      todayRecord = {
        date: today,
        screenTime: 0,
        eyeExerciseCount: 0,
        sleepHours: 7,
        outdoorMinutes: 0,
        drynessLevel: level
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({ records: [...records] })
  },

  updateSleep: (hours) => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.sleepHours = hours
    } else {
      todayRecord = {
        date: today,
        screenTime: 0,
        eyeExerciseCount: 0,
        sleepHours: hours,
        outdoorMinutes: 0,
        drynessLevel: 0
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({ records: [...records] })
    get().checkBadges()
  },

  updateOutdoor: (minutes) => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.outdoorMinutes = minutes
    } else {
      todayRecord = {
        date: today,
        screenTime: 0,
        eyeExerciseCount: 0,
        sleepHours: 7,
        outdoorMinutes: minutes,
        drynessLevel: 0
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({ records: [...records] })
    get().checkBadges()
  },

  updateVision: (left, right) => {
    const { records } = get()
    const today = getTodayStr()
    let todayRecord = records.find(r => r.date === today)

    if (todayRecord) {
      todayRecord.visionLeft = left
      todayRecord.visionRight = right
    } else {
      todayRecord = {
        date: today,
        screenTime: 0,
        eyeExerciseCount: 0,
        sleepHours: 7,
        outdoorMinutes: 0,
        drynessLevel: 0,
        visionLeft: left,
        visionRight: right
      }
      records.unshift(todayRecord)
    }

    storage.set('records', records)
    set({ records: [...records] })
  },

  startSession: (type, duration) => {
    const session: TimerSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration,
      type,
      completed: false
    }
    set({ currentSession: session })
  },

  endSession: (completed) => {
    const { currentSession, addScreenTime } = get()
    if (currentSession) {
      if (completed && currentSession.type === 'focus') {
        addScreenTime(currentSession.duration)
      }
      set({ currentSession: null })
    }
  },

  checkBadges: () => {
    const { records, badges } = get()
    const newBadges = [...badges]
    let changed = false

    const totalEyeExercises = records.reduce((sum, r) => sum + r.eyeExerciseCount, 0)
    const totalOutdoor = records.reduce((sum, r) => sum + r.outdoorMinutes, 0) / 60

    if (!newBadges.find(b => b.id === 'first_day')?.unlocked && records.length >= 1) {
      const badge = newBadges.find(b => b.id === 'first_day')
      if (badge) {
        badge.unlocked = true
        badge.unlockedAt = getTodayStr()
        changed = true
      }
    }

    if (!newBadges.find(b => b.id === 'eye_exercise_pro')?.unlocked && totalEyeExercises >= 20) {
      const badge = newBadges.find(b => b.id === 'eye_exercise_pro')
      if (badge) {
        badge.unlocked = true
        badge.unlockedAt = getTodayStr()
        changed = true
      }
    }

    if (!newBadges.find(b => b.id === 'outdoor_lover')?.unlocked && totalOutdoor >= 100) {
      const badge = newBadges.find(b => b.id === 'outdoor_lover')
      if (badge) {
        badge.unlocked = true
        badge.unlockedAt = getTodayStr()
        changed = true
      }
    }

    if (changed) {
      storage.set('badges', newBadges)
      set({ badges: newBadges })
    }
  },

  getTodayRecord: () => {
    return getTodayRecordFromList(get().records)
  },

  getWeekRecords: () => {
    const { records } = get()
    const weekRecords: DailyRecord[] = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      const record = records.find(r => r.date === date)
      if (record) {
        weekRecords.push(record)
      } else {
        weekRecords.push({
          date,
          screenTime: 0,
          eyeExerciseCount: 0,
          sleepHours: 0,
          outdoorMinutes: 0,
          drynessLevel: 0
        })
      }
    }
    return weekRecords
  }
}))
