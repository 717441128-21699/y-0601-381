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
  bestStreak: number
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
  saveEnvironmentRecord: (record: Omit<EnvironmentRecord, 'date'>) => void
  getTodayEnvironment: () => EnvironmentRecord | undefined
  getRecentEnvironments: (count: number) => EnvironmentRecord[]
  calculateStreak: () => void
  generateWeeklyReport: () => WeeklyReport
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
  vibrationEnabled: true,
  targetScreenTime: 480,
  targetEyeExercises: 1,
  targetSleepHours: 6,
  targetOutdoorMinutes: 30
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
  bestStreak: 0,
  environmentRecords: [],

  init: () => {
    const savedSettings = storage.get<Settings>('settings')
    const savedRecords = storage.get<DailyRecord[]>('records')
    const savedBadges = storage.get<Badge[]>('badges')
    const savedStreak = storage.get<number>('streakDays')
    const savedBestStreak = storage.get<number>('bestStreak')
    const savedEnvRecords = storage.get<EnvironmentRecord[]>('environmentRecords')

    const records = savedRecords && savedRecords.length > 0 ? savedRecords : mockRecords
    const todayRecord = getTodayRecordFromList(records)

    set({
      settings: savedSettings || DEFAULT_SETTINGS,
      records,
      badges: savedBadges || BADGE_LIST,
      todayScreenTime: todayRecord?.screenTime || 0,
      streakDays: savedStreak || 0,
      bestStreak: savedBestStreak || 0,
      environmentRecords: savedEnvRecords || []
    })

    get().calculateStreak()
  },

  updateSettings: (settings) => {
    const newSettings = { ...get().settings, ...settings }
    storage.set('settings', newSettings)
    set({ settings: newSettings })
    get().calculateStreak()
    get().checkBadges()
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
    get().calculateStreak()
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
    get().calculateStreak()
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
    get().calculateStreak()
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
    get().calculateStreak()
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
    const { records, badges, streakDays, bestStreak } = get()
    const newBadges = badges.map(b => ({ ...b }))
    let changed = false

    const totalEyeExercises = records.reduce((sum, r) => sum + r.eyeExerciseCount, 0)
    const totalOutdoor = records.reduce((sum, r) => sum + r.outdoorMinutes, 0) / 60
    const todayRecord = getTodayRecordFromList(records)

    const consecutiveSleep7 = (() => {
      let count = 0
      const sorted = [...records]
        .filter(r => r.date <= getTodayStr())
        .sort((a, b) => b.date.localeCompare(a.date))
      for (const r of sorted) {
        if (r.sleepHours >= 7) count++
        else break
      }
      return count
    })()

    const morningEyeExercise7 = (() => {
      let count = 0
      const sorted = [...records]
        .filter(r => r.date <= getTodayStr())
        .sort((a, b) => b.date.localeCompare(a.date))
      for (const r of sorted) {
        if (r.eyeExerciseCount >= 1) count++
        else break
      }
      return count
    })()

    const badgeChecks: { id: string; condition: boolean }[] = [
      { id: 'first_day', condition: records.length >= 1 },
      { id: 'three_days', condition: streakDays >= 3 },
      { id: 'seven_days', condition: streakDays >= 7 },
      { id: 'thirty_days', condition: streakDays >= 30 },
      { id: 'eye_exercise_pro', condition: totalEyeExercises >= 20 },
      { id: 'outdoor_lover', condition: totalOutdoor >= 100 },
      { id: 'good_sleeper', condition: consecutiveSleep7 >= 7 },
      { id: 'water_lover', condition: (todayRecord?.waterIntake || 0) >= 8 && records.filter(r => (r.waterIntake || 0) >= 8).length >= 7 },
      { id: 'early_bird', condition: morningEyeExercise7 >= 7 },
      { id: 'night_owl', condition: bestStreak >= 7 && get().settings.nightMode }
    ]

    for (const check of badgeChecks) {
      const badge = newBadges.find(b => b.id === check.id)
      if (badge && !badge.unlocked && check.condition) {
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
  },

  saveEnvironmentRecord: (record) => {
    const { environmentRecords } = get()
    const today = getTodayStr()
    const existing = environmentRecords.findIndex(r => r.date === today)
    const newRecord: EnvironmentRecord = { ...record, date: today }

    let updated: EnvironmentRecord[]
    if (existing >= 0) {
      updated = [...environmentRecords]
      updated[existing] = newRecord
    } else {
      updated = [newRecord, ...environmentRecords]
    }

    if (updated.length > 30) updated = updated.slice(0, 30)

    storage.set('environmentRecords', updated)
    set({ environmentRecords: updated })
  },

  getTodayEnvironment: () => {
    const today = getTodayStr()
    return get().environmentRecords.find(r => r.date === today)
  },

  getRecentEnvironments: (count) => {
    return get().environmentRecords.slice(0, count)
  },

  calculateStreak: () => {
    const { records, settings } = get()
    const sortedRecords = [...records]
      .filter(r => r.date <= getTodayStr())
      .sort((a, b) => b.date.localeCompare(a.date))

    let streak = 0
    let expectedDate = getTodayStr()

    for (const record of sortedRecords) {
      if (record.date !== expectedDate) break

      const isGoalMet = record.screenTime < settings.targetScreenTime
        && record.eyeExerciseCount >= settings.targetEyeExercises
        && record.sleepHours >= settings.targetSleepHours
        && record.outdoorMinutes >= settings.targetOutdoorMinutes
      if (isGoalMet) {
        streak++
      } else {
        break
      }

      const d = dayjs(expectedDate).subtract(1, 'day')
      expectedDate = d.format('YYYY-MM-DD')
    }

    const { bestStreak } = get()
    const newBest = Math.max(bestStreak, streak)

    storage.set('streakDays', streak)
    storage.set('bestStreak', newBest)
    set({ streakDays: streak, bestStreak: newBest })
  },

  generateWeeklyReport: () => {
    const weekRecords = get().getWeekRecords()
    const weekStart = weekRecords[0]?.date || ''
    const weekEnd = weekRecords[weekRecords.length - 1]?.date || ''

    const totalScreenTime = weekRecords.reduce((sum, r) => sum + r.screenTime, 0)
    const avgScreenTime = Math.round(totalScreenTime / 7)
    const eyeExerciseCount = weekRecords.reduce((sum, r) => sum + r.eyeExerciseCount, 0)
    const avgSleepHours = Math.round(weekRecords.reduce((sum, r) => sum + r.sleepHours, 0) / 7 * 10) / 10
    const avgOutdoorMinutes = Math.round(weekRecords.reduce((sum, r) => sum + r.outdoorMinutes, 0) / 7)

    const trends = weekRecords.map(r => ({
      day: r.date,
      screenTime: r.screenTime
    }))

    return {
      weekStart,
      weekEnd,
      totalScreenTime,
      avgScreenTime,
      eyeExerciseCount,
      avgSleepHours,
      avgOutdoorMinutes,
      trends
    }
  }
}))
