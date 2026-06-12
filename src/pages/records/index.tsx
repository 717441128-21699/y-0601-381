import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Slider, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useEyeStore } from '@/store/useEyeStore'
import { formatDuration } from '@/utils/date'
import SectionHeader from '@/components/SectionHeader'
import styles from './index.module.scss'

type ChartType = 'screen' | 'sleep' | 'outdoor'

const DRYNESS_LEVELS = [
  { level: 0, label: '正常', icon: '😊' },
  { level: 1, label: '轻微', icon: '🙂' },
  { level: 2, label: '干涩', icon: '😐' },
  { level: 3, label: '酸胀', icon: '😣' },
  { level: 4, label: '疲劳', icon: '😫' },
  { level: 5, label: '严重', icon: '😭' }
]

const RecordsPage: React.FC = () => {
  const {
    init,
    records,
    updateDryness,
    updateSleep,
    updateOutdoor,
    updateVision,
    getTodayRecord,
    getWeekRecords
  } = useEyeStore()

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [chartType, setChartType] = useState<ChartType>('screen')
  const [sleepHours, setSleepHours] = useState(7)
  const [outdoorMinutes, setOutdoorMinutes] = useState(30)

  useEffect(() => {
    init()
  }, [])

  const todayRecord = getTodayRecord()
  const weekRecords = getWeekRecords()

  useEffect(() => {
    if (todayRecord) {
      setSleepHours(todayRecord.sleepHours)
      setOutdoorMinutes(todayRecord.outdoorMinutes)
    }
  }, [todayRecord])

  const currentRecord = useMemo(() => {
    return records.find(r => r.date === selectedDate)
  }, [records, selectedDate])

  const handleDrynessChange = (level: number) => {
    updateDryness(level)
    Taro.showToast({ title: '已记录', icon: 'success' })
  }

  const handleSleepChange = (value: number) => {
    setSleepHours(value)
    updateSleep(value)
  }

  const handleOutdoorChange = (value: number) => {
    setOutdoorMinutes(value)
    updateOutdoor(value)
  }

  const handleVisionRecord = () => {
    Taro.showModal({
      title: '记录视力',
      editable: true,
      placeholderText: '请输入左眼视力，如 5.0',
      success: (leftRes) => {
        if (leftRes.confirm && leftRes.content) {
          const leftVision = parseFloat(leftRes.content)
          if (isNaN(leftVision)) {
            Taro.showToast({ title: '请输入有效数字', icon: 'none' })
            return
          }
          Taro.showModal({
            title: '记录视力',
            editable: true,
            placeholderText: '请输入右眼视力，如 5.0',
            success: (rightRes) => {
              if (rightRes.confirm && rightRes.content) {
                const rightVision = parseFloat(rightRes.content)
                if (isNaN(rightVision)) {
                  Taro.showToast({ title: '请输入有效数字', icon: 'none' })
                  return
                }
                updateVision(leftVision, rightVision)
                Taro.showToast({ title: '已记录', icon: 'success' })
              }
            }
          })
        }
      }
    })
  }

  const goToEyeExercise = () => {
    Taro.navigateTo({ url: '/pages/eye-exercise/index' })
  }

  const goToEnvironment = () => {
    Taro.navigateTo({ url: '/pages/environment/index' })
  }

  const chartMax = useMemo(() => {
    const values = weekRecords.map(r => {
      if (chartType === 'screen') return r.screenTime
      if (chartType === 'sleep') return r.sleepHours * 60
      return r.outdoorMinutes
    })
    return Math.max(...values, 1)
  }, [weekRecords, chartType])

  const dateDisplay = useMemo(() => {
    const date = dayjs(selectedDate)
    if (date.isSame(dayjs(), 'day')) {
      return '今天'
    } else if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
      return '昨天'
    }
    return date.format('MM月DD日')
  }, [selectedDate])

  const changeDate = (offset: number) => {
    const newDate = dayjs(selectedDate).add(offset, 'day')
    if (newDate.isAfter(dayjs(), 'day')) return
    setSelectedDate(newDate.format('YYYY-MM-DD'))
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.dateSelector}>
        <View className={styles.dateNav} onClick={() => changeDate(-1)}>
          <Text>‹</Text>
        </View>
        <View>
          <Text className={styles.dateText}>{dateDisplay}</Text>
          <Text className={styles.dateSub}>
            {dayjs(selectedDate).format('YYYY年MM月DD日')}
          </Text>
        </View>
        <View className={styles.dateNav} onClick={() => changeDate(1)}>
          <Text>›</Text>
        </View>
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>📊 今日概览</Text>
        <View className={styles.summaryStats}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>
              {Math.round((currentRecord?.screenTime || 0) / 60 * 10) / 10}h
            </Text>
            <Text className={styles.summaryLabel}>屏幕时长</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>
              {currentRecord?.eyeExerciseCount || 0}次
            </Text>
            <Text className={styles.summaryLabel}>眼保健操</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>
              {currentRecord?.sleepHours || 0}h
            </Text>
            <Text className={styles.summaryLabel}>睡眠</Text>
          </View>
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>💧</Text>
            <Text>眼睛状态</Text>
          </View>
          <Text className={styles.cardValue}>
            {DRYNESS_LEVELS[currentRecord?.drynessLevel || 0]?.label}
          </Text>
        </View>
        <View className={styles.drynessSelector}>
          {DRYNESS_LEVELS.map(item => (
            <View
              key={item.level}
              className={classNames(
                styles.drynessItem,
                (currentRecord?.drynessLevel || 0) === item.level && styles.activeDryness
              )}
              onClick={() => handleDrynessChange(item.level)}
            >
              <Text className={styles.drynessIcon}>{item.icon}</Text>
              <Text className={styles.drynessLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>😴</Text>
            <Text>睡眠时长</Text>
          </View>
          <Text className={styles.cardValue}>{sleepHours}小时</Text>
        </View>
        <Slider
          min={4}
          max={12}
          step={0.5}
          value={sleepHours}
          activeColor="#22c55e"
          backgroundColor="#e2e8f0"
          blockSize={24}
          onChange={e => handleSleepChange(e.detail.value)}
        />
        <View className={styles.quickActions}>
          {[6, 7, 8, 9].map(h => (
            <View
              key={h}
              className={styles.quickBtn}
              onClick={() => handleSleepChange(h)}
            >
              {h}小时
            </View>
          ))}
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🌳</Text>
            <Text>户外活动</Text>
          </View>
          <Text className={styles.cardValue}>{outdoorMinutes}分钟</Text>
        </View>
        <Slider
          min={0}
          max={180}
          step={10}
          value={outdoorMinutes}
          activeColor="#22c55e"
          backgroundColor="#e2e8f0"
          blockSize={24}
          onChange={e => handleOutdoorChange(e.detail.value)}
        />
        <View className={styles.quickActions}>
          {[30, 60, 90, 120].map(m => (
            <View
              key={m}
              className={styles.quickBtn}
              onClick={() => handleOutdoorChange(m)}
            >
              {m}分钟
            </View>
          ))}
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>👁️</Text>
            <Text>视力记录</Text>
          </View>
        </View>
        <View className={styles.visionRow}>
          <View className={styles.visionItem}>
            <Text className={styles.visionEye}>左眼</Text>
            <Text className={styles.visionValue}>
              {currentRecord?.visionLeft?.toFixed(1) || '--'}
            </Text>
          </View>
          <View className={styles.visionItem}>
            <Text className={styles.visionEye}>右眼</Text>
            <Text className={styles.visionValue}>
              {currentRecord?.visionRight?.toFixed(1) || '--'}
            </Text>
          </View>
        </View>
        <View className={styles.eyeExerciseBtn} onClick={handleVisionRecord}>
          记录视力
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🧘</Text>
            <Text>眼保健操</Text>
          </View>
          <Text className={styles.cardValue}>
            {currentRecord?.eyeExerciseCount || 0}次
          </Text>
        </View>
        <View className={styles.eyeExerciseBtn} onClick={goToEyeExercise}>
          开始做眼操
        </View>
      </View>

      <View className={styles.recordCard}>
        <View className={styles.cardHeader}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🌡️</Text>
            <Text>用眼环境</Text>
          </View>
        </View>
        <View className={styles.eyeExerciseBtn} onClick={goToEnvironment}>
          查看环境记录
        </View>
      </View>

      <View className={styles.chartSection}>
        <SectionHeader title="本周趋势" icon="📈" />
        <View className={styles.chartCard}>
          <View className={styles.chartTabs}>
            <View
              className={classNames(styles.chartTab, chartType === 'screen' && styles.activeTab)}
              onClick={() => setChartType('screen')}
            >
              屏幕时长
            </View>
            <View
              className={classNames(styles.chartTab, chartType === 'sleep' && styles.activeTab)}
              onClick={() => setChartType('sleep')}
            >
              睡眠
            </View>
            <View
              className={classNames(styles.chartTab, chartType === 'outdoor' && styles.activeTab)}
              onClick={() => setChartType('outdoor')}
            >
              户外
            </View>
          </View>
          <View className={styles.trendChart}>
            {weekRecords.map((record, index) => {
              let value: number
              if (chartType === 'screen') value = record.screenTime
              else if (chartType === 'sleep') value = record.sleepHours * 60
              else value = record.outdoorMinutes

              const height = (value / chartMax) * 220
              const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
              const dayIndex = (new Date().getDay() - 6 + index + 7) % 7

              return (
                <View key={record.date} className={styles.trendItem}>
                  <View
                    className={styles.trendBar}
                    style={{ height: `${Math.max(height, 8)}rpx` }}
                  />
                  <Text className={styles.trendLabel}>{dayLabels[dayIndex]}</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default RecordsPage
