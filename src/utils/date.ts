import dayjs from 'dayjs'

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}小时`
  }
  return `${hours}小时${mins}分钟`
}

export const getTodayStr = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

export const getWeekDays = (): string[] => {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return days
}

export const getWeekDayLabels = (): string[] => {
  return ['日', '一', '二', '三', '四', '五', '六'].map((d, i) => {
    const dayIndex = (dayjs().day() - 6 + i + 7) % 7
    return ['日', '一', '二', '三', '四', '五', '六'][dayIndex]
  })
}

export const isNightTime = (start: string, end: string): boolean => {
  const now = dayjs()
  const currentHour = now.hour()
  const currentMinute = now.minute()
  const currentTotal = currentHour * 60 + currentMinute

  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const startTotal = startHour * 60 + startMin
  const endTotal = endHour * 60 + endMin

  if (startTotal <= endTotal) {
    return currentTotal >= startTotal && currentTotal <= endTotal
  } else {
    return currentTotal >= startTotal || currentTotal <= endTotal
  }
}
