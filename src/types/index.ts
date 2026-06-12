export interface DailyRecord {
  date: string
  screenTime: number
  eyeExerciseCount: number
  sleepHours: number
  outdoorMinutes: number
  drynessLevel: number
  visionLeft?: number
  visionRight?: number
  waterIntake?: number
}

export interface TimerSession {
  id: string
  startTime: number
  endTime?: number
  duration: number
  type: 'focus' | 'rest'
  completed: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  condition: string
}

export interface EyeExercise {
  id: string
  name: string
  description: string
  duration: number
  tip: string
}

export interface Settings {
  focusDuration: number
  restDuration: number
  blinkReminder: boolean
  blinkInterval: number
  farViewReminder: boolean
  farViewInterval: number
  nightMode: boolean
  nightStart: string
  nightEnd: string
  soundEnabled: boolean
  vibrationEnabled: boolean
  targetScreenTime: number
  targetEyeExercises: number
  targetSleepHours: number
  targetOutdoorMinutes: number
}

export interface EnvironmentRecord {
  date: string
  lightLevel: number
  humidity?: number
  temperature?: number
  screenBrightness?: number
}

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  totalScreenTime: number
  avgScreenTime: number
  eyeExerciseCount: number
  avgSleepHours: number
  avgOutdoorMinutes: number
  trends: { day: string; screenTime: number }[]
}

export type DrynessLevel = 0 | 1 | 2 | 3 | 4 | 5
