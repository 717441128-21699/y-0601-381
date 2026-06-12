import React, { useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEyeStore } from '@/store/useEyeStore'
import { formatDuration } from '@/utils/date'
import dayjs from 'dayjs'
import styles from './index.module.scss'

const WeeklyReportPage: React.FC = () => {
  const { init, generateWeeklyReport, streakDays, bestStreak } = useEyeStore()

  useEffect(() => {
    init()
  }, [])

  const report = useMemo(() => {
    return generateWeeklyReport()
  }, [generateWeeklyReport])

  const weekStartDisplay = dayjs(report.weekStart).format('MM月DD日')
  const weekEndDisplay = dayjs(report.weekEnd).format('MM月DD日')

  const maxScreenTime = Math.max(...report.trends.map(t => t.screenTime), 1)

  const advices = useMemo(() => {
    const list: string[] = []
    if (report.avgScreenTime > 360) {
      list.push('本周平均每日屏幕时长较长，建议每工作45分钟休息5分钟，减少连续用眼时间。')
    }
    if (report.eyeExerciseCount < 7) {
      list.push('本周眼保健操完成次数偏少，建议每天至少做1次，缓解眼部疲劳。')
    }
    if (report.avgSleepHours < 7) {
      list.push('本周平均睡眠不足7小时，充足睡眠有助于眼睛恢复，请早点休息。')
    }
    if (report.avgOutdoorMinutes < 30) {
      list.push('本周户外活动时间偏少，建议每天至少户外活动30分钟，预防近视。')
    }
    if (list.length === 0) {
      list.push('本周护眼表现优秀，请继续保持良好的用眼习惯！')
      list.push('坚持20-20-20法则，每用眼20分钟远眺20秒。')
      list.push('保持充足睡眠和户外活动，让眼睛充分休息。')
    }
    return list
  }, [report])

  const handleShare = () => {
    const shareText = `【护眼健康周报】\n` +
      `📅 ${weekStartDisplay} - ${weekEndDisplay}\n` +
      `📱 平均屏幕时长：${formatDuration(report.avgScreenTime)}\n` +
      `👁️ 眼保健操：${report.eyeExerciseCount}次\n` +
      `😴 平均睡眠：${report.avgSleepHours}小时\n` +
      `🌳 平均户外：${report.avgOutdoorMinutes}分钟\n` +
      `🔥 连续护眼：${streakDays}天\n` +
      `——来自护眼健康小程序`

    Taro.showModal({
      title: '分享周报',
      content: shareText,
      confirmText: '复制分享',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({
            data: shareText,
            success: () => {
              Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
            }
          })
        }
      }
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerIcon}>📋</Text>
        <Text className={styles.headerTitle}>护眼健康周报</Text>
        <Text className={styles.headerDate}>
          {weekStartDisplay} - {weekEndDisplay}
        </Text>
      </View>

      <View className={styles.summaryGrid}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryIcon}>📱</Text>
          <Text className={styles.summaryValue}>
            {Math.round(report.avgScreenTime / 60 * 10) / 10}
            <Text className={styles.summaryUnit}>小时/天</Text>
          </Text>
          <Text className={styles.summaryLabel}>平均屏幕时长</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryIcon}>👁️</Text>
          <Text className={styles.summaryValue}>
            {report.eyeExerciseCount}
            <Text className={styles.summaryUnit}>次</Text>
          </Text>
          <Text className={styles.summaryLabel}>眼保健操</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryIcon}>😴</Text>
          <Text className={styles.summaryValue}>
            {report.avgSleepHours}
            <Text className={styles.summaryUnit}>小时/天</Text>
          </Text>
          <Text className={styles.summaryLabel}>平均睡眠</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryIcon}>🌳</Text>
          <Text className={styles.summaryValue}>
            {report.avgOutdoorMinutes}
            <Text className={styles.summaryUnit}>分钟/天</Text>
          </Text>
          <Text className={styles.summaryLabel}>平均户外活动</Text>
        </View>
      </View>

      <View className={styles.trendCard}>
        <Text className={styles.trendTitle}>本周屏幕时长趋势</Text>
        <View className={styles.trendBars}>
          {report.trends.map((item, index) => {
            const height = (item.screenTime / maxScreenTime) * 160
            const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
            const dayOfWeek = dayjs(item.day).day()
            return (
              <View key={item.day} className={styles.trendBarItem}>
                {item.screenTime > 0 && (
                  <Text className={styles.trendValue}>
                    {Math.round(item.screenTime / 60 * 10) / 10}h
                  </Text>
                )}
                <View
                  className={styles.trendBar}
                  style={{ height: `${Math.max(height, 8)}rpx` }}
                />
                <Text className={styles.trendLabel}>{dayLabels[dayOfWeek]}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.adviceCard}>
        <Text className={styles.adviceTitle}>
          💡 护眼建议
        </Text>
        <View className={styles.adviceList}>
          {advices.map((advice, index) => (
            <Text key={index} className={styles.adviceItem}>{advice}</Text>
          ))}
        </View>
      </View>

      <View className={styles.adviceCard}>
        <Text className={styles.adviceTitle}>
          🏆 本周成就
        </Text>
        <View className={styles.adviceList}>
          <Text className={styles.adviceItem}>
            连续护眼 {streakDays} 天，历史最佳 {bestStreak} 天
          </Text>
          <Text className={styles.adviceItem}>
            本周累计屏幕时长 {formatDuration(report.totalScreenTime)}
          </Text>
          <Text className={styles.adviceItem}>
            完成眼保健操 {report.eyeExerciseCount} 次
          </Text>
        </View>
      </View>

      <View className={styles.shareBtn} onClick={handleShare}>
        <Text>📤 分享给家人</Text>
      </View>

      <Text className={styles.footer}>护眼健康 · 用心呵护你的眼睛</Text>
    </ScrollView>
  )
}

export default WeeklyReportPage
