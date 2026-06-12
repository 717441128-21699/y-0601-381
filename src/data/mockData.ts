import type { DailyRecord, EnvironmentRecord } from '@/types'
import dayjs from 'dayjs'

const generateMockRecords = (): DailyRecord[] => {
  const records: DailyRecord[] = []
  for (let i = 30; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    const isWeekend = dayjs(date).day() === 0 || dayjs(date).day() === 6
    records.push({
      date,
      screenTime: isWeekend
        ? Math.floor(Math.random() * 180) + 240
        : Math.floor(Math.random() * 240) + 360,
      eyeExerciseCount: Math.floor(Math.random() * 4) + 1,
      sleepHours: Math.floor(Math.random() * 3) + 6,
      outdoorMinutes: Math.floor(Math.random() * 60) + 20,
      drynessLevel: Math.floor(Math.random() * 4) + 1,
      waterIntake: Math.floor(Math.random() * 4) + 5
    })
  }
  return records
}

export const mockRecords: DailyRecord[] = generateMockRecords()

export const mockEnvironmentRecords: EnvironmentRecord[] = [
  { date: '2024-01-01', lightLevel: 3, humidity: 45, temperature: 24, screenBrightness: 60 },
  { date: '2024-01-02', lightLevel: 4, humidity: 40, temperature: 23, screenBrightness: 70 },
  { date: '2024-01-03', lightLevel: 2, humidity: 50, temperature: 22, screenBrightness: 50 }
]

export const HEALTH_TIPS = [
  { id: 1, title: '20-20-20法则', content: '每用眼20分钟，看20英尺（约6米）外的物体20秒' },
  { id: 2, title: '保持正确坐姿', content: '眼睛距离屏幕约50-70厘米，屏幕中心略低于视线' },
  { id: 3, title: '多眨眼', content: '正常情况下每分钟眨眼15-20次，看屏幕时会减少到5-10次' },
  { id: 4, title: '充足睡眠', content: '保证每天7-8小时睡眠，让眼睛得到充分休息' },
  { id: 5, title: '户外活动', content: '每天至少2小时户外活动，预防近视加深' },
  { id: 6, title: '饮食均衡', content: '多吃富含维生素A、C、E和叶黄素的食物' }
]
