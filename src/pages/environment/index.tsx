import React, { useState, useEffect } from 'react'
import { View, Text, Slider, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useEyeStore } from '@/store/useEyeStore'
import styles from './index.module.scss'

const EnvironmentPage: React.FC = () => {
  const {
    init,
    environmentRecords,
    saveEnvironmentRecord,
    getTodayEnvironment,
    getRecentEnvironments
  } = useEyeStore()

  const [lightLevel, setLightLevel] = useState(3)
  const [humidity, setHumidity] = useState(45)
  const [temperature, setTemperature] = useState(24)
  const [screenBrightness, setScreenBrightness] = useState(60)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    const todayEnv = getTodayEnvironment()
    if (todayEnv) {
      setLightLevel(todayEnv.lightLevel)
      setHumidity(todayEnv.humidity || 45)
      setTemperature(todayEnv.temperature || 24)
      setScreenBrightness(todayEnv.screenBrightness || 60)
      setSaved(true)
    }
  }, [environmentRecords])

  const envScore = (() => {
    let score = 60
    if (lightLevel === 3) score += 15
    else if (lightLevel === 2 || lightLevel === 4) score += 8
    else score -= 5

    if (humidity >= 40 && humidity <= 60) score += 10
    else if (humidity >= 30 && humidity <= 70) score += 5

    if (temperature >= 20 && temperature <= 26) score += 10
    else if (temperature >= 18 && temperature <= 28) score += 5

    if (screenBrightness >= 40 && screenBrightness <= 70) score += 5
    else if (screenBrightness > 80) score -= 5

    return Math.min(Math.max(score, 0), 100)
  })()

  const envStatus = envScore >= 80 ? '优秀' : envScore >= 60 ? '良好' : envScore >= 40 ? '一般' : '较差'

  const handleSave = () => {
    saveEnvironmentRecord({
      lightLevel,
      humidity,
      temperature,
      screenBrightness
    })
    setSaved(true)
    Taro.showToast({ title: '已保存', icon: 'success' })
  }

  const suggestions = [
    {
      id: 1,
      icon: '💡',
      title: '光线调节',
      desc: '室内光线应柔和均匀，避免屏幕与环境亮度差过大。建议使用台灯补充照明。'
    },
    {
      id: 2,
      icon: '💧',
      title: '保持湿度',
      desc: '空调房内空气干燥容易引发干眼，建议使用加湿器，保持湿度在40%-60%。'
    },
    {
      id: 3,
      icon: '🪟',
      title: '定时通风',
      desc: '每2小时开窗通风一次，新鲜空气有助于缓解眼部疲劳。'
    },
    {
      id: 4,
      icon: '🪑',
      title: '正确姿势',
      desc: '保持眼睛与屏幕50-70厘米距离，屏幕中心略低于视线10-20度。'
    }
  ]

  const lightLabels = ['很暗', '偏暗', '适中', '明亮', '很亮']
  const recentRecords = getRecentEnvironments(5)

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.envCard}>
        <Text className={styles.envTitle}>🌿 今日用眼环境</Text>
        <Text className={styles.envScore}>{envScore}</Text>
        <Text className={styles.envLabel}>环境舒适度评分</Text>
        <View className={styles.envStatus}>
          <Text>✨</Text>
          <Text>{envStatus}</Text>
        </View>
      </View>

      <View className={styles.envGrid}>
        <View className={styles.envItem}>
          <View className={classNames(styles.itemIcon, styles.orangeBg)}>☀️</View>
          <Text className={styles.itemLabel}>环境光线</Text>
          <Text className={styles.itemValue}>
            {lightLabels[lightLevel - 1]}
          </Text>
        </View>
        <View className={styles.envItem}>
          <View className={styles.itemIcon}>💧</View>
          <Text className={styles.itemLabel}>空气湿度</Text>
          <Text className={styles.itemValue}>
            {humidity}
            <Text className={styles.itemUnit}>%</Text>
          </Text>
        </View>
        <View className={styles.envItem}>
          <View className={classNames(styles.itemIcon, styles.purpleBg)}>🌡️</View>
          <Text className={styles.itemLabel}>环境温度</Text>
          <Text className={styles.itemValue}>
            {temperature}
            <Text className={styles.itemUnit}>°C</Text>
          </Text>
        </View>
        <View className={styles.envItem}>
          <View className={classNames(styles.itemIcon, styles.greenBg)}>📱</View>
          <Text className={styles.itemLabel}>屏幕亮度</Text>
          <Text className={styles.itemValue}>
            {screenBrightness}
            <Text className={styles.itemUnit}>%</Text>
          </Text>
        </View>
      </View>

      <View className={styles.adjustSection}>
        <Text className={styles.adjustTitle}>
          🎛️ 记录环境情况
        </Text>

        <View className={styles.adjustRow}>
          <Text className={styles.adjustLabel}>光线强度</Text>
          <Slider
            className={styles.adjustSlider}
            min={1}
            max={5}
            step={1}
            value={lightLevel}
            activeColor="#22c55e"
            backgroundColor="#e2e8f0"
            blockSize={24}
            onChange={e => { setLightLevel(e.detail.value); setSaved(false) }}
          />
          <Text className={styles.adjustValue}>{lightLabels[lightLevel - 1]}</Text>
        </View>

        <View className={styles.adjustRow}>
          <Text className={styles.adjustLabel}>空气湿度</Text>
          <Slider
            className={styles.adjustSlider}
            min={20}
            max={80}
            step={5}
            value={humidity}
            activeColor="#22c55e"
            backgroundColor="#e2e8f0"
            blockSize={24}
            onChange={e => { setHumidity(e.detail.value); setSaved(false) }}
          />
          <Text className={styles.adjustValue}>{humidity}%</Text>
        </View>

        <View className={styles.adjustRow}>
          <Text className={styles.adjustLabel}>环境温度</Text>
          <Slider
            className={styles.adjustSlider}
            min={15}
            max={35}
            step={1}
            value={temperature}
            activeColor="#22c55e"
            backgroundColor="#e2e8f0"
            blockSize={24}
            onChange={e => { setTemperature(e.detail.value); setSaved(false) }}
          />
          <Text className={styles.adjustValue}>{temperature}°C</Text>
        </View>

        <View className={styles.adjustRow}>
          <Text className={styles.adjustLabel}>屏幕亮度</Text>
          <Slider
            className={styles.adjustSlider}
            min={20}
            max={100}
            step={5}
            value={screenBrightness}
            activeColor="#22c55e"
            backgroundColor="#e2e8f0"
            blockSize={24}
            onChange={e => { setScreenBrightness(e.detail.value); setSaved(false) }}
          />
          <Text className={styles.adjustValue}>{screenBrightness}%</Text>
        </View>

        <View className={styles.saveBtn} onClick={handleSave}>
          <Text>{saved ? '✓ 已保存，点击更新' : '保存今日记录'}</Text>
        </View>
      </View>

      {recentRecords.length > 0 && (
        <View className={styles.historySection}>
          <Text className={styles.historyTitle}>📋 近期环境记录</Text>
          {recentRecords.map(record => (
            <View key={record.date} className={styles.historyItem}>
              <View className={styles.historyDate}>
                <Text>{dayjs(record.date).format('MM月DD日')}</Text>
              </View>
              <View className={styles.historyData}>
                <Text className={styles.historyTag}>光线:{lightLabels[record.lightLevel - 1]}</Text>
                <Text className={styles.historyTag}>湿度:{record.humidity || '-'}%</Text>
                <Text className={styles.historyTag}>温度:{record.temperature || '-'}°C</Text>
                <Text className={styles.historyTag}>亮度:{record.screenBrightness || '-'}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.suggestions}>
        <Text className={styles.suggestionTitle}>
          💡 护眼建议
        </Text>
        <View className={styles.suggestionList}>
          {suggestions.map(item => (
            <View key={item.id} className={styles.suggestionItem}>
              <Text className={styles.suggestionIcon}>{item.icon}</Text>
              <View className={styles.suggestionContent}>
                <Text className={styles.suggestionName}>{item.title}</Text>
                <Text className={styles.suggestionDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default EnvironmentPage
