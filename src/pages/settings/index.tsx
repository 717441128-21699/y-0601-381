import React, { useState, useEffect } from 'react'
import { View, Text, Switch, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { useEyeStore } from '@/store/useEyeStore'
import styles from './index.module.scss'

const SettingsPage: React.FC = () => {
  const { init, settings, updateSettings, streakDays } = useEyeStore()

  useEffect(() => {
    init()
  }, [])

  const handleFocusDuration = () => {
    Taro.showActionSheet({
      itemList: ['15分钟', '25分钟', '45分钟', '60分钟'],
      success: (res) => {
        const durations = [15, 25, 45, 60]
        updateSettings({ focusDuration: durations[res.tapIndex] })
      }
    })
  }

  const handleRestDuration = () => {
    Taro.showActionSheet({
      itemList: ['3分钟', '5分钟', '10分钟', '15分钟'],
      success: (res) => {
        const durations = [3, 5, 10, 15]
        updateSettings({ restDuration: durations[res.tapIndex] })
      }
    })
  }

  const handleBlinkInterval = () => {
    Taro.showActionSheet({
      itemList: ['10分钟', '20分钟', '30分钟', '关闭'],
      success: (res) => {
        if (res.tapIndex === 3) {
          updateSettings({ blinkReminder: false })
        } else {
          const intervals = [10, 20, 30]
          updateSettings({
            blinkReminder: true,
            blinkInterval: intervals[res.tapIndex]
          })
        }
      }
    })
  }

  const handleFarViewInterval = () => {
    Taro.showActionSheet({
      itemList: ['20分钟', '40分钟', '60分钟', '关闭'],
      success: (res) => {
        if (res.tapIndex === 3) {
          updateSettings({ farViewReminder: false })
        } else {
          const intervals = [20, 40, 60]
          updateSettings({
            farViewReminder: true,
            farViewInterval: intervals[res.tapIndex]
          })
        }
      }
    })
  }

  const handleNightMode = (value: boolean) => {
    updateSettings({ nightMode: value })
  }

  const handleNightTime = (type: 'start' | 'end') => {
    const times = type === 'start'
      ? ['20:00', '21:00', '22:00', '23:00']
      : ['06:00', '07:00', '08:00', '09:00']
    Taro.showActionSheet({
      itemList: times,
      success: (res) => {
        if (type === 'start') {
          updateSettings({ nightStart: times[res.tapIndex] })
        } else {
          updateSettings({ nightEnd: times[res.tapIndex] })
        }
      }
    })
  }

  const handleSound = (value: boolean) => {
    updateSettings({ soundEnabled: value })
  }

  const handleVibration = (value: boolean) => {
    updateSettings({ vibrationEnabled: value })
  }

  const handleFamilyReport = () => {
    Taro.showModal({
      title: '家庭周报',
      content: '生成本周护眼健康周报，可分享给家人查看。',
      confirmText: '生成周报',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '周报生成中...', icon: 'loading' })
          setTimeout(() => {
            Taro.showToast({ title: '周报已生成', icon: 'success' })
          }, 1500)
        }
      }
    })
  }

  const handleClearData = () => {
    Taro.showModal({
      title: '清除数据',
      content: '确定要清除所有护眼记录数据吗？此操作不可恢复。',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync()
          Taro.showToast({ title: '已清除', icon: 'success' })
          setTimeout(() => {
            init()
          }, 500)
        }
      }
    })
  }

  const handleAbout = () => {
    Taro.showModal({
      title: '关于护眼健康',
      content: '版本：1.0.0\n\n专为长时间上网课和办公人群设计的护眼健康管理小程序，帮助您养成科学的用眼习惯。',
      showCancel: false
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userCard}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>护眼达人</Text>
          <Text className={styles.userDesc}>已坚持护眼 {streakDays} 天</Text>
        </View>
      </View>

      <View className={styles.familyCard} onClick={handleFamilyReport}>
        <View className={styles.familyInfo}>
          <Text className={styles.familyTitle}>👨‍👩‍👧 家庭周报</Text>
          <Text className={styles.familyDesc}>给家人生成护眼健康周报</Text>
        </View>
        <View className={styles.familyBtn}>
          <Text>生成 ›</Text>
        </View>
      </View>

      <View className={styles.settingsGroup}>
        <Text className={styles.groupTitle}>计时设置</Text>
        <View className={styles.settingItem} onClick={handleFocusDuration}>
          <View className={styles.settingIcon}>⏱️</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>专注时长</Text>
          </View>
          <Text className={styles.settingValue}>{settings.focusDuration}分钟</Text>
          <Text className={styles.settingArrow}>›</Text>
        </View>
        <View className={styles.settingItem} onClick={handleRestDuration}>
          <View className={classNames(styles.settingIcon, styles.blueIcon)}>☕</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>休息时长</Text>
          </View>
          <Text className={styles.settingValue}>{settings.restDuration}分钟</Text>
          <Text className={styles.settingArrow}>›</Text>
        </View>
      </View>

      <View className={styles.settingsGroup}>
        <Text className={styles.groupTitle}>提醒设置</Text>
        <View className={styles.settingItem} onClick={handleBlinkInterval}>
          <View className={classNames(styles.settingIcon, styles.orangeIcon)}>💧</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>眨眼提醒</Text>
            <Text className={styles.settingDesc}>提醒定时眨眼，保持眼睛湿润</Text>
          </View>
          <Text className={styles.settingValue}>
            {settings.blinkReminder ? `每${settings.blinkInterval}分钟` : '关闭'}
          </Text>
          <Text className={styles.settingArrow}>›</Text>
        </View>
        <View className={styles.settingItem} onClick={handleFarViewInterval}>
          <View className={classNames(styles.settingIcon, styles.purpleIcon)}>🏞️</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>远眺提醒</Text>
            <Text className={styles.settingDesc}>20-20-20法则，远眺放松眼睛</Text>
          </View>
          <Text className={styles.settingValue}>
            {settings.farViewReminder ? `每${settings.farViewInterval}分钟` : '关闭'}
          </Text>
          <Text className={styles.settingArrow}>›</Text>
        </View>
      </View>

      <View className={styles.settingsGroup}>
        <Text className={styles.groupTitle}>夜间勿扰</Text>
        <View className={styles.settingItem}>
          <View className={classNames(styles.settingIcon, styles.purpleIcon)}>🌙</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>夜间模式</Text>
            <Text className={styles.settingDesc}>夜间自动降低提醒频率</Text>
          </View>
          <Switch
            className={styles.settingSwitch}
            checked={settings.nightMode}
            color="#22c55e"
            onChange={e => handleNightMode(e.detail.value)}
          />
        </View>
        {settings.nightMode && (
          <>
            <View className={styles.settingItem} onClick={() => handleNightTime('start')}>
              <View className={styles.settingIcon}>🌆</View>
              <View className={styles.settingContent}>
                <Text className={styles.settingTitle}>开始时间</Text>
              </View>
              <Text className={styles.settingValue}>{settings.nightStart}</Text>
              <Text className={styles.settingArrow}>›</Text>
            </View>
            <View className={styles.settingItem} onClick={() => handleNightTime('end')}>
              <View className={classNames(styles.settingIcon, styles.orangeIcon)}>🌅</View>
              <View className={styles.settingContent}>
                <Text className={styles.settingTitle}>结束时间</Text>
              </View>
              <Text className={styles.settingValue}>{settings.nightEnd}</Text>
              <Text className={styles.settingArrow}>›</Text>
            </View>
          </>
        )}
      </View>

      <View className={styles.settingsGroup}>
        <Text className={styles.groupTitle}>通用设置</Text>
        <View className={styles.settingItem}>
          <View className={styles.settingIcon}>🔔</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>提醒音效</Text>
            <Text className={styles.settingDesc}>计时结束时播放提示音</Text>
          </View>
          <Switch
            className={styles.settingSwitch}
            checked={settings.soundEnabled}
            color="#22c55e"
            onChange={e => handleSound(e.detail.value)}
          />
        </View>
        <View className={styles.settingItem}>
          <View className={classNames(styles.settingIcon, styles.blueIcon)}>📳</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>震动提醒</Text>
            <Text className={styles.settingDesc}>计时结束时震动提醒</Text>
          </View>
          <Switch
            className={styles.settingSwitch}
            checked={settings.vibrationEnabled}
            color="#22c55e"
            onChange={e => handleVibration(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.settingsGroup}>
        <Text className={styles.groupTitle}>数据管理</Text>
        <View className={styles.settingItem} onClick={handleClearData}>
          <View className={classNames(styles.settingIcon, styles.pinkIcon)}>🗑️</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>清除数据</Text>
            <Text className={styles.settingDesc}>清除所有护眼记录数据</Text>
          </View>
          <Text className={styles.settingArrow}>›</Text>
        </View>
        <View className={styles.settingItem} onClick={handleAbout}>
          <View className={classNames(styles.settingIcon, styles.blueIcon)}>ℹ️</View>
          <View className={styles.settingContent}>
            <Text className={styles.settingTitle}>关于我们</Text>
            <Text className={styles.settingDesc}>版本 v1.0.0</Text>
          </View>
          <Text className={styles.settingArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.versionInfo}>护眼健康 v1.0.0 · 用心呵护你的眼睛</Text>
    </ScrollView>
  )
}

export default SettingsPage
