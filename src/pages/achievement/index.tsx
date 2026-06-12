import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classNames from 'classnames'
import { useEyeStore } from '@/store/useEyeStore'
import { BADGE_LIST } from '@/data/badges'
import styles from './index.module.scss'

type TimelineType = 'week' | 'month' | 'year'

const AchievementPage: React.FC = () => {
  const { init, records, streakDays, bestStreak, badges } = useEyeStore()
  const [timeline, setTimeline] = useState<TimelineType>('week')

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
  )
}

export default AchievementPage
