import React, { useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { useEyeStore } from '@/store/useEyeStore'
import { formatDuration } from '@/utils/date'
import { HEALTH_TIPS } from '@/data/mockData'
import StatCard from '@/components/StatCard'
import SectionHeader from '@/components/SectionHeader'
import styles from './index.module.scss'

const TodayPage: React.FC = () => {
  const {
    init,
    records,
    settings,
    todayScreenTime,
    streakDays,
    getTodayRecord,
    getWeekRecords
  } = useEyeStore()

  useEffect(() => {
    init()
  }, [])

  const todayRecord = getTodayRecord()
  const weekRecords = getWeekRecords()

  const goalProgress = useMemo(() => {
    const screenTime = todayRecord?.screenTime || 0
    const eyeExercises = todayRecord?.eyeExerciseCount || 0
    const sleepHours = todayRecord?.sleepHours || 0
    const outdoorMinutes = todayRecord?.outdoorMinutes || 0

    const screenDone = screenTime < settings.targetScreenTime
    const eyeDone = eyeExercises >= settings.targetEyeExercises
    const sleepDone = sleepHours >= settings.targetSleepHours
    const outdoorDone = outdoorMinutes >= settings.targetOutdoorMinutes

    const screenRemaining = settings.targetScreenTime - screenTime
    const screenTip = screenDone
      ? '已达标 ✓'
      : screenRemaining > 60
        ? `还可用 ${Math.round(screenRemaining / 60 * 10) / 10} 小时`
        : `还可用 ${Math.round(screenRemaining)} 分钟`

    return [
      {
        key: 'screen',
        icon: '📱',
        label: '屏幕时长',
        current: Math.round(screenTime / 60 * 10) / 10,
        target: Math.round(settings.targetScreenTime / 60 * 10) / 10,
        unit: '小时',
        progress: Math.min(screenTime / settings.targetScreenTime, 1),
        done: screenDone,
        tip: screenTip
      },
      {
        key: 'eye',
        icon: '👁️',
        label: '眼保健操',
        current: eyeExercises,
        target: settings.targetEyeExercises,
        unit: '次',
        progress: Math.min(eyeExercises / settings.targetEyeExercises, 1),
        done: eyeDone,
        tip: eyeDone ? '已达标 ✓' : `还差 ${settings.targetEyeExercises - eyeExercises} 次`
      },
      {
        key: 'sleep',
        icon: '😴',
        label: '睡眠时长',
        current: sleepHours,
        target: settings.targetSleepHours,
        unit: '小时',
        progress: Math.min(sleepHours / settings.targetSleepHours, 1),
        done: sleepDone,
        tip: sleepDone ? '已达标 ✓' : `还差 ${settings.targetSleepHours - sleepHours} 小时`
      },
      {
        key: 'outdoor',
        icon: '🌳',
        label: '户外活动',
        current: outdoorMinutes,
        target: settings.targetOutdoorMinutes,
        unit: '分钟',
        progress: Math.min(outdoorMinutes / settings.targetOutdoorMinutes, 1),
        done: outdoorDone,
        tip: outdoorDone ? '已达标 ✓' : `还差 ${settings.targetOutdoorMinutes - outdoorMinutes} 分钟`
      }
    ]
  }, [todayRecord, settings])

  const healthScore = useMemo(() => {
    let score = 60
    if (todayRecord) {
      if (todayRecord.screenTime < 240) score += 15
      else if (todayRecord.screenTime < 360) score += 10
      else if (todayRecord.screenTime < 480) score += 5

      if (todayRecord.eyeExerciseCount >= 3) score += 10
      else if (todayRecord.eyeExerciseCount >= 1) score += 5

      if (todayRecord.sleepHours >= 7) score += 10
      else if (todayRecord.sleepHours >= 6) score += 5

      if (todayRecord.outdoorMinutes >= 60) score += 10
      else if (todayRecord.outdoorMinutes >= 30) score += 5

      if (todayRecord.drynessLevel <= 1) score += 5
    }
    return Math.min(score, 100)
  }, [todayRecord])

  const maxScreenTime = useMemo(() => {
    return Math.max(...weekRecords.map(r => r.screenTime), 1)
  }, [weekRecords])

  const handleStartFocus = () => {
    Taro.switchTab({ url: '/pages/timer/index' })
  }

  const handleEyeExercise = () => {
    Taro.navigateTo({ url: '/pages/eye-exercise/index' })
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 12) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }, [])

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.greeting}>{greeting}，护护眼吧👀</Text>
        <Text className={styles.subGreeting}>今天也要好好爱护眼睛哦</Text>
        <View className={styles.streakBadge}>
          <Text className={styles.streakIcon}>🔥</Text>
          <Text className={styles.streakText}>已连续护眼 {streakDays} 天</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.scoreCard}>
          <Text className={styles.scoreTitle}>今日护眼评分</Text>
          <View className={styles.scoreRing}>
            <View className={styles.scoreValue}>{healthScore}</View>
            <Text className={styles.scoreLabel}>
              {healthScore >= 90 ? '非常棒！' : healthScore >= 70 ? '继续加油' : '需要改善'}
            </Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={`${styles.actionBtn} ${styles.focusBtn}`} onClick={handleStartFocus}>
            <Text className={styles.actionIcon}>⏱️</Text>
            <Text>开始专注</Text>
          </View>
          <View className={`${styles.actionBtn} ${styles.eyeBtn}`} onClick={handleEyeExercise}>
            <Text className={styles.actionIcon}>👀</Text>
            <Text>做眼操</Text>
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="今日数据" icon="📊" />
          <View className={styles.statsGrid}>
            <StatCard
              icon="📱"
              value={Math.round(todayScreenTime / 60 * 10) / 10}
              unit="小时"
              label="屏幕时长"
              color="blue"
            />
            <StatCard
              icon="👁️"
              value={todayRecord?.eyeExerciseCount || 0}
              unit="次"
              label="眼保健操"
              color="green"
            />
            <StatCard
              icon="😴"
              value={todayRecord?.sleepHours || 7}
              unit="小时"
              label="睡眠时长"
              color="purple"
            />
            <StatCard
              icon="🌳"
              value={todayRecord?.outdoorMinutes || 0}
              unit="分钟"
              label="户外活动"
              color="orange"
            />
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="今日目标" icon="🎯" />
          <View className={styles.goalCard}>
            {goalProgress.map(item => (
              <View key={item.key} className={styles.goalItem}>
                <View className={styles.goalHead}>
                  <View className={styles.goalIcon}>{item.icon}</View>
                  <View className={styles.goalInfo}>
                    <Text className={styles.goalLabel}>{item.label}</Text>
                    <Text className={styles.goalValue}>
                      {item.current}/{item.target} {item.unit}
                    </Text>
                  </View>
                  <Text className={classNames(styles.goalTip, item.done && styles.goalTipDone)}>
                    {item.tip}
                  </Text>
                </View>
                <View className={styles.goalBarBg}>
                  <View
                    className={classNames(styles.goalBar, item.done ? styles.goalBarDone : styles.goalBarProgress)}
                    style={{ width: `${item.progress * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.chartCard}>
            <View className={styles.chartHeader}>
              <Text className={styles.chartTitle}>近7天屏幕时长</Text>
              <Text className={styles.chartSubtitle}>单位：小时</Text>
            </View>
            <View className={styles.chartBars}>
              {weekRecords.map((record, index) => {
                const height = (record.screenTime / maxScreenTime) * 160
                const isToday = index === weekRecords.length - 1
                const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
                const dayIndex = (new Date().getDay() - 6 + index + 7) % 7
                return (
                  <View key={record.date} className={styles.barItem}>
                    <View
                      className={`${styles.bar} ${isToday ? styles.todayBar : ''}`}
                      style={{ height: `${Math.max(height, 12)}rpx` }}
                    />
                    <Text className={styles.barLabel}>{dayLabels[dayIndex]}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="护眼小贴士" icon="💡" />
          <ScrollView className={styles.tipsScroll} scrollX>
            {HEALTH_TIPS.map(tip => (
              <View key={tip.id} className={styles.tipCard}>
                <Text className={styles.tipIcon}>✨</Text>
                <Text className={styles.tipTitle}>{tip.title}</Text>
                <Text className={styles.tipContent}>{tip.content}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  )
}

export default TodayPage
