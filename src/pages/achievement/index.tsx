import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useEyeStore } from '@/store/useEyeStore'
import { BADGE_LIST } from '@/data/badges'
import { formatDuration } from '@/utils/date'
import styles from './index.module.scss'

type TimelineType = 'week' | 'month' | 'year'

const AchievementPage: React.FC = () => {
  const { init, records, settings, streakDays, bestStreak, badges } = useEyeStore()
  const [timeline, setTimeline] = useState<TimelineType>('week')
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const stats = useMemo(() => {
    const totalDays = records.length
    const totalEyeExercises = records.reduce((sum, r) => sum + r.eyeExerciseCount, 0)
    const totalScreenTime = records.reduce((sum, r) => sum + r.screenTime, 0)
    const totalOutdoor = records.reduce((sum, r) => sum + r.outdoorMinutes, 0)

    return {
      totalDays,
      totalEyeExercises,
      totalScreenHours: Math.round(totalScreenTime / 60),
      totalOutdoorHours: Math.round(totalOutdoor / 60)
    }
  }, [records])

  const hourlyData = useMemo(() => {
    const hours: { hour: number; minutes: number; level: 'normal' | 'warning' | 'danger' }[] = []
    for (let i = 6; i <= 23; i++) {
      const baseMinutes = Math.floor(Math.random() * 30) + 10
      let minutes = baseMinutes
      let level: 'normal' | 'warning' | 'danger' = 'normal'

      if (i >= 9 && i <= 11) {
        minutes = baseMinutes + 40
        level = 'danger'
      } else if (i >= 14 && i <= 16) {
        minutes = baseMinutes + 25
        level = 'warning'
      } else if (i >= 19 && i <= 21) {
        minutes = baseMinutes + 35
        level = 'danger'
      }

      if (minutes > 50) level = 'danger'
      else if (minutes > 35) level = 'warning'

      hours.push({ hour: i, minutes, level })
    }
    return hours
  }, [])

  const maxMinutes = Math.max(...hourlyData.map(d => d.minutes), 1)

  const unlockedCount = badges.filter(b => b.unlocked).length

  const calendarDays = useMemo(() => {
    const year = currentMonth.year()
    const month = currentMonth.month()
    const firstDay = dayjs(`${year}-${month + 1}-01`)
    const daysInMonth = firstDay.daysInMonth()
    const startDayOfWeek = firstDay.day()

    const isGoalMet = (record: { screenTime: number; eyeExerciseCount: number; sleepHours: number; outdoorMinutes: number } | undefined) => {
      if (!record) return false
      return record.screenTime < settings.targetScreenTime
        && record.eyeExerciseCount >= settings.targetEyeExercises
        && record.sleepHours >= settings.targetSleepHours
        && record.outdoorMinutes >= settings.targetOutdoorMinutes
    }

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isGoalMet: boolean; hasRecord: boolean }[] = []

    const prevMonth = firstDay.subtract(1, 'month')
    const prevMonthDays = prevMonth.daysInMonth()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const dateStr = prevMonth.date(day).format('YYYY-MM-DD')
      const record = records.find(r => r.date === dateStr)
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isGoalMet: isGoalMet(record),
        hasRecord: !!record
      })
    }

    const todayStr = dayjs().format('YYYY-MM-DD')
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = firstDay.date(i).format('YYYY-MM-DD')
      const record = records.find(r => r.date === dateStr)
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isGoalMet: isGoalMet(record),
        hasRecord: !!record
      })
    }

    const remaining = 42 - days.length
    const nextMonth = firstDay.add(1, 'month')
    for (let i = 1; i <= remaining; i++) {
      const dateStr = nextMonth.date(i).format('YYYY-MM-DD')
      const record = records.find(r => r.date === dateStr)
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isGoalMet: isGoalMet(record),
        hasRecord: !!record
      })
    }

    return days
  }, [currentMonth, records, settings])

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null
    return records.find(r => r.date === selectedDate)
  }, [selectedDate, records])

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'))
  }

  const handleDayClick = (date: string, hasRecord: boolean) => {
    if (!hasRecord) {
      Taro.showToast({ title: '当日无记录', icon: 'none' })
      return
    }
    setSelectedDate(date)
    setShowDetail(true)
  }

  const closeDetail = () => {
    setShowDetail(false)
    setSelectedDate(null)
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.streakCard}>
        <Text className={styles.streakIcon}>🔥</Text>
        <View className={styles.streakDays}>{streakDays}</View>
        <Text className={styles.streakLabel}>连续护眼天数</Text>
        <View className={styles.streakInfo}>
          <View className={styles.streakInfoItem}>
            <Text className={styles.streakInfoValue}>{bestStreak}</Text>
            <Text>历史最佳</Text>
          </View>
          <View className={styles.streakInfoItem}>
            <Text className={styles.streakInfoValue}>{stats.totalEyeExercises}</Text>
            <Text>累计眼操</Text>
          </View>
          <View className={styles.streakInfoItem}>
            <Text className={styles.streakInfoValue}>{unlockedCount}</Text>
            <Text>获得徽章</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📊</Text>
            累计数据
          </Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <View className={styles.statIcon}>📅</View>
            <Text className={styles.statValue}>
              {stats.totalDays}
              <Text className={styles.statUnit}>天</Text>
            </Text>
            <Text className={styles.statLabel}>护眼天数</Text>
          </View>
          <View className={styles.statItem}>
            <View className={classNames(styles.statIcon, styles.blueIcon)}>👁️</View>
            <Text className={styles.statValue}>
              {stats.totalEyeExercises}
              <Text className={styles.statUnit}>次</Text>
            </Text>
            <Text className={styles.statLabel}>眼保健操</Text>
          </View>
          <View className={styles.statItem}>
            <View className={classNames(styles.statIcon, styles.orangeIcon)}>⏱️</View>
            <Text className={styles.statValue}>
              {stats.totalScreenHours}
              <Text className={styles.statUnit}>小时</Text>
            </Text>
            <Text className={styles.statLabel}>累计屏幕时长</Text>
          </View>
          <View className={styles.statItem}>
            <View className={classNames(styles.statIcon, styles.purpleIcon)}>🌳</View>
            <Text className={styles.statValue}>
              {stats.totalOutdoorHours}
              <Text className={styles.statUnit}>小时</Text>
            </Text>
            <Text className={styles.statLabel}>户外活动</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📅</Text>
            目标日历
          </Text>
          <View className={styles.monthNav}>
            <Text className={styles.monthArrow} onClick={handlePrevMonth}>‹</Text>
            <Text className={styles.monthText}>{currentMonth.format('YYYY年M月')}</Text>
            <Text className={styles.monthArrow} onClick={handleNextMonth}>›</Text>
          </View>
        </View>

        <View className={styles.calendar}>
          <View className={styles.calendarWeekdays}>
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <Text key={day} className={styles.calendarWeekday}>{day}</Text>
            ))}
          </View>
          <View className={styles.calendarGrid}>
            {calendarDays.map(item => (
              <View
                key={item.date}
                className={classNames(
                  styles.calendarDay,
                  !item.isCurrentMonth && styles.otherMonth,
                  item.isToday && styles.today,
                  item.isGoalMet && item.isCurrentMonth && styles.goalMet,
                  item.hasRecord && !item.isGoalMet && item.isCurrentMonth && styles.goalNotMet
                )}
                onClick={() => handleDayClick(item.date, item.hasRecord)}
              >
                <Text className={styles.calendarDayNum}>{item.day}</Text>
                {item.isCurrentMonth && item.hasRecord && (
                  <View className={classNames(
                    styles.dot,
                    item.isGoalMet ? styles.dotSuccess : styles.dotWarning
                  )} />
                )}
              </View>
            ))}
          </View>
          <View className={styles.calendarLegend}>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.dotSuccess}`} />
              <Text>达标</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.dotWarning}`} />
              <Text>未达标</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} style={{ background: '#e2e8f0' }} />
              <Text>无记录</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🏆</Text>
            我的徽章
          </Text>
          <Text className={styles.sectionExtra}>
            {unlockedCount}/{badges.length}
          </Text>
        </View>
        <View className={styles.badgesGrid}>
          {badges.map(badge => (
            <View
              key={badge.id}
              className={classNames(styles.badgeCard, !badge.unlocked && styles.badgeLocked)}
            >
              <View className={styles.badgeIcon}>
                <Text>{badge.icon}</Text>
              </View>
              <Text className={styles.badgeName}>{badge.name}</Text>
              <Text className={styles.badgeDesc}>{badge.condition}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📈</Text>
            用眼时段分析
          </Text>
        </View>

        <View className={styles.timelineTabs}>
          <View
            className={classNames(styles.timelineTab, timeline === 'week' && styles.activeTimeline)}
            onClick={() => setTimeline('week')}
          >
            本周
          </View>
          <View
            className={classNames(styles.timelineTab, timeline === 'month' && styles.activeTimeline)}
            onClick={() => setTimeline('month')}
          >
            本月
          </View>
          <View
            className={classNames(styles.timelineTab, timeline === 'year' && styles.activeTimeline)}
            onClick={() => setTimeline('year')}
          >
            全年
          </View>
        </View>

        <View className={styles.hourlyChart}>
          <Text className={styles.chartTitle}>每小时平均屏幕时长</Text>
          <View className={styles.hourlyBars}>
            {hourlyData.map(item => {
              const height = (item.minutes / maxMinutes) * 160
              return (
                <View key={item.hour} className={styles.hourBar}>
                  <View
                    className={classNames(
                      styles.barFill,
                      item.level === 'warning' && styles.warningBar,
                      item.level === 'danger' && styles.dangerBar
                    )}
                    style={{ height: `${Math.max(height, 4)}rpx` }}
                  />
                  <Text className={styles.hourLabel}>{item.hour}时</Text>
                </View>
              )
            })}
          </View>

          <View className={styles.legend}>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.legendNormal}`} />
              <Text>正常</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.legendWarning}`} />
              <Text>偏多</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={`${styles.legendDot} ${styles.legendDanger}`} />
              <Text>过量</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: '24rpx', background: '#fff', borderRadius: '16rpx', padding: '24rpx', boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.06)' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1e293b', marginBottom: '16rpx' }}>
            💡 用眼建议
          </Text>
          <Text style={{ fontSize: '24rpx', color: '#64748b', lineHeight: 1.6 }}>
            根据数据分析，您在上午9-11点和晚上19-21点用眼时间较长，建议在这些时段增加休息频率，每20分钟远眺一次，适时做眼保健操放松眼睛。
          </Text>
        </View>
      </View>
    </ScrollView>

    {showDetail && selectedRecord && (
      <View className={styles.modalMask} onClick={closeDetail}>
        <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <View className={styles.modalHeader}>
            <Text className={styles.modalTitle}>
              {dayjs(selectedDate).format('YYYY年M月D日')} 明细
            </Text>
            <Text className={styles.modalClose} onClick={closeDetail}>×</Text>
          </View>
          <View className={styles.modalBody}>
            <View className={styles.detailItem}>
              <View className={styles.detailIcon}>📱</View>
              <View className={styles.detailInfo}>
                <Text className={styles.detailLabel}>屏幕时长</Text>
                <Text className={styles.detailValue}>{formatDuration(selectedRecord.screenTime)}</Text>
              </View>
              <Text className={classNames(
                styles.detailStatus,
                selectedRecord.screenTime < settings.targetScreenTime ? styles.statusSuccess : styles.statusFail
              )}>
                {selectedRecord.screenTime < settings.targetScreenTime ? '达标 ✓' : '未达标'}
              </Text>
            </View>
            <View className={styles.detailItem}>
              <View className={classNames(styles.detailIcon, styles.blueIcon)}>👁️</View>
              <View className={styles.detailInfo}>
                <Text className={styles.detailLabel}>眼保健操</Text>
                <Text className={styles.detailValue}>{selectedRecord.eyeExerciseCount} 次</Text>
              </View>
              <Text className={classNames(
                styles.detailStatus,
                selectedRecord.eyeExerciseCount >= settings.targetEyeExercises ? styles.statusSuccess : styles.statusFail
              )}>
                {selectedRecord.eyeExerciseCount >= settings.targetEyeExercises ? '达标 ✓' : '未达标'}
              </Text>
            </View>
            <View className={styles.detailItem}>
              <View className={classNames(styles.detailIcon, styles.purpleIcon)}>😴</View>
              <View className={styles.detailInfo}>
                <Text className={styles.detailLabel}>睡眠时长</Text>
                <Text className={styles.detailValue}>{selectedRecord.sleepHours} 小时</Text>
              </View>
              <Text className={classNames(
                styles.detailStatus,
                selectedRecord.sleepHours >= settings.targetSleepHours ? styles.statusSuccess : styles.statusFail
              )}>
                {selectedRecord.sleepHours >= settings.targetSleepHours ? '达标 ✓' : '未达标'}
              </Text>
            </View>
            <View className={styles.detailItem}>
              <View className={classNames(styles.detailIcon, styles.orangeIcon)}>🌳</View>
              <View className={styles.detailInfo}>
                <Text className={styles.detailLabel}>户外活动</Text>
                <Text className={styles.detailValue}>{selectedRecord.outdoorMinutes} 分钟</Text>
              </View>
              <Text className={classNames(
                styles.detailStatus,
                selectedRecord.outdoorMinutes >= settings.targetOutdoorMinutes ? styles.statusSuccess : styles.statusFail
              )}>
                {selectedRecord.outdoorMinutes >= settings.targetOutdoorMinutes ? '达标 ✓' : '未达标'}
              </Text>
            </View>
          </View>
          <View className={styles.modalFooter}>
            <View className={styles.modalBtn} onClick={closeDetail}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      </View>
    )}
  )
}

export default AchievementPage
