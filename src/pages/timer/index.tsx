import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { useEyeStore } from '@/store/useEyeStore'
import { formatTime, isNightTime } from '@/utils/date'
import { EYE_EXERCISE_TIPS } from '@/data/eyeExercises'
import styles from './index.module.scss'

type TimerMode = 'focus' | 'rest'
type TimerStatus = 'idle' | 'running' | 'paused'

const FOCUS_OPTIONS = [15, 25, 45, 60]
const REST_OPTIONS = [3, 5, 10, 15]

const TimerPage: React.FC = () => {
  const { settings, addScreenTime } = useEyeStore()

  const [mode, setMode] = useState<TimerMode>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60)
  const [totalTime, setTotalTime] = useState(settings.focusDuration * 60)
  const [blinkTip, setBlinkTip] = useState('')
  const [farViewTip, setFarViewTip] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const farViewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blinkHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const farViewHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nightModePollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wasInNightRef = useRef(false)
  const statusRef = useRef<TimerStatus>('idle')
  const modeRef = useRef<TimerMode>('focus')

  const currentTip = EYE_EXERCISE_TIPS[Math.floor(Math.random() * EYE_EXERCISE_TIPS.length)]

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const isInNightMode = useCallback(() => {
    return settings.nightMode && isNightTime(settings.nightStart, settings.nightEnd)
  }, [settings.nightMode, settings.nightStart, settings.nightEnd])

  const clearAllReminders = useCallback(() => {
    if (blinkTimerRef.current) {
      clearInterval(blinkTimerRef.current)
      blinkTimerRef.current = null
    }
    if (farViewTimerRef.current) {
      clearInterval(farViewTimerRef.current)
      farViewTimerRef.current = null
    }
    if (blinkHideRef.current) {
      clearTimeout(blinkHideRef.current)
      blinkHideRef.current = null
    }
    if (farViewHideRef.current) {
      clearTimeout(farViewHideRef.current)
      farViewHideRef.current = null
    }
    setBlinkTip('')
    setFarViewTip('')
  }, [])

  const startBlinkReminder = useCallback(() => {
    if (blinkTimerRef.current) {
      clearInterval(blinkTimerRef.current)
    }
    if (!settings.blinkReminder) return
    if (isInNightMode()) return

    blinkTimerRef.current = setInterval(() => {
      if (isInNightMode()) return
      setBlinkTip('💧 眨眨眼，保持眼睛湿润')
      if (blinkHideRef.current) clearTimeout(blinkHideRef.current)
      blinkHideRef.current = setTimeout(() => setBlinkTip(''), 3000)
    }, settings.blinkInterval * 60 * 1000)
  }, [settings.blinkReminder, settings.blinkInterval, isInNightMode])

  const startFarViewReminder = useCallback(() => {
    if (farViewTimerRef.current) {
      clearInterval(farViewTimerRef.current)
    }
    if (!settings.farViewReminder) return
    if (isInNightMode()) return

    farViewTimerRef.current = setInterval(() => {
      if (isInNightMode()) return
      setFarViewTip('🏞️ 远眺20秒，放松眼肌')
      if (farViewHideRef.current) clearTimeout(farViewHideRef.current)
      farViewHideRef.current = setTimeout(() => setFarViewTip(''), 3000)
    }, settings.farViewInterval * 60 * 1000)
  }, [settings.farViewReminder, settings.farViewInterval, isInNightMode])

  const triggerAlert = useCallback(() => {
    if (isInNightMode()) return
    if (settings.vibrationEnabled) {
      Taro.vibrateLong().catch(() => {})
    }
    if (settings.soundEnabled) {
      try {
        const audio = Taro.createInnerAudioContext()
        audio.src = 'https://freesound.org/data/previews/320/320655_5278806-lq.mp3'
        audio.volume = 0.8
        audio.play()
        audio.onEnded(() => audio.destroy())
        audio.onError(() => audio.destroy())
      } catch (_e) {
        // do nothing
      }
    }
  }, [settings.soundEnabled, settings.vibrationEnabled, isInNightMode])

  const startNightModePoll = useCallback(() => {
    if (nightModePollRef.current) clearInterval(nightModePollRef.current)
    wasInNightRef.current = isInNightMode()

    nightModePollRef.current = setInterval(() => {
      const nowInNight = isInNightMode()
      if (wasInNightRef.current && !nowInNight && statusRef.current === 'running' && modeRef.current === 'focus') {
        if (settings.blinkReminder) startBlinkReminder()
        if (settings.farViewReminder) startFarViewReminder()
      }
      wasInNightRef.current = nowInNight
    }, 30000)
  }, [isInNightMode, settings.blinkReminder, settings.farViewReminder, startBlinkReminder, startFarViewReminder])

  const stopNightModePoll = useCallback(() => {
    if (nightModePollRef.current) {
      clearInterval(nightModePollRef.current)
      nightModePollRef.current = null
    }
  }, [])

  const doSwitchMode = useCallback((newMode: TimerMode) => {
    if (timerRef.current) clearInterval(timerRef.current)
    clearAllReminders()
    stopNightModePoll()

    setMode(newMode)
    setStatus('idle')
    const duration = newMode === 'focus' ? settings.focusDuration : settings.restDuration
    setTimeLeft(duration * 60)
    setTotalTime(duration * 60)
  }, [settings.focusDuration, settings.restDuration, clearAllReminders, stopNightModePoll])

  const handleTimerComplete = useCallback(() => {
    clearAllReminders()
    stopNightModePoll()
    setStatus('idle')

    if (isInNightMode()) {
      if (mode === 'focus') {
        addScreenTime(totalTime / 60)
      }
      return
    }

    triggerAlert()

    if (mode === 'focus') {
      addScreenTime(totalTime / 60)
      Taro.showModal({
        title: '🎉 专注完成！',
        content: '辛苦了，休息一下眼睛吧～',
        confirmText: '开始休息',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            doSwitchMode('rest')
          }
        }
      })
    } else {
      Taro.showModal({
        title: '😊 休息结束！',
        content: '眼睛休息好了，继续加油吧～',
        confirmText: '开始专注',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            doSwitchMode('focus')
          }
        }
      })
    }
  }, [mode, totalTime, isInNightMode, addScreenTime, clearAllReminders, stopNightModePoll, triggerAlert, doSwitchMode])

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setStatus('running')

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    if (mode === 'focus') {
      if (settings.blinkReminder && !isInNightMode()) {
        startBlinkReminder()
      }
      if (settings.farViewReminder && !isInNightMode()) {
        startFarViewReminder()
      }
    }

    startNightModePoll()
  }, [mode, settings.blinkReminder, settings.farViewReminder, isInNightMode, startBlinkReminder, startFarViewReminder, startNightModePoll, handleTimerComplete])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    clearAllReminders()
    stopNightModePoll()
    setStatus('paused')
  }, [clearAllReminders, stopNightModePoll])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    clearAllReminders()
    stopNightModePoll()
    setStatus('idle')
    setTimeLeft(mode === 'focus' ? settings.focusDuration * 60 : settings.restDuration * 60)
    setTotalTime(mode === 'focus' ? settings.focusDuration * 60 : settings.restDuration * 60)
  }, [mode, settings.focusDuration, settings.restDuration, clearAllReminders, stopNightModePoll])

  const switchMode = (newMode: TimerMode) => {
    if (status === 'running') {
      Taro.showModal({
        title: '提示',
        content: '切换模式将停止当前计时，确定吗？',
        success: (res) => {
          if (res.confirm) {
            doSwitchMode(newMode)
          }
        }
      })
    } else {
      doSwitchMode(newMode)
    }
  }

  const selectDuration = (minutes: number) => {
    if (status === 'running') return
    setTimeLeft(minutes * 60)
    setTotalTime(minutes * 60)
  }

  const skip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    clearAllReminders()
    stopNightModePoll()
    handleTimerComplete()
  }, [clearAllReminders, stopNightModePoll, handleTimerComplete])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current)
      if (farViewTimerRef.current) clearInterval(farViewTimerRef.current)
      if (blinkHideRef.current) clearTimeout(blinkHideRef.current)
      if (farViewHideRef.current) clearTimeout(farViewHideRef.current)
      if (nightModePollRef.current) clearInterval(nightModePollRef.current)
    }
  }, [])

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0
  const circumference = 2 * Math.PI * 220
  const dashOffset = circumference * (1 - progress)

  const options = mode === 'focus' ? FOCUS_OPTIONS : REST_OPTIONS
  const currentDuration = Math.floor(totalTime / 60)

  const activeTip = farViewTip || blinkTip

  return (
    <View className={styles.page}>
      <View className={styles.modeTabs}>
        <View
          className={classNames(styles.modeTab, mode === 'focus' && styles.activeTab)}
          onClick={() => switchMode('focus')}
        >
          专注模式
        </View>
        <View
          className={classNames(styles.modeTab, styles.restTab, mode === 'rest' && styles.activeTab)}
          onClick={() => switchMode('rest')}
        >
          休息模式
        </View>
      </View>

      <View className={styles.timerContainer}>
        <View className={styles.timerRing}>
          <svg className={styles.timerSvg} width="480" height="480">
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              className={styles.circleBg}
              cx="240"
              cy="240"
              r="220"
              strokeWidth="16"
            />
            <circle
              className={classNames(
                styles.circleProgress,
                mode === 'focus' ? styles.focusProgress : styles.restProgress
              )}
              cx="240"
              cy="240"
              r="220"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <View className={styles.timerContent}>
            <Text className={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text className={styles.timerLabel}>
              {mode === 'focus' ? '专注中' : '休息中'}
            </Text>
            {activeTip && <Text className={styles.timerTip}>{activeTip}</Text>}
          </View>
        </View>
      </View>

      <View className={styles.controls}>
        <View className={styles.controlBtn} onClick={resetTimer}>
          <Text>↺</Text>
        </View>
        <View
          className={classNames(
            styles.controlBtn,
            styles.primaryBtn,
            status === 'running' && styles.pauseBtn,
            mode === 'rest' && status !== 'running' && styles.restPrimary
          )}
          onClick={status === 'running' ? pauseTimer : startTimer}
        >
          <Text>{status === 'running' ? '暂停' : status === 'paused' ? '继续' : '开始'}</Text>
        </View>
        <View className={styles.controlBtn} onClick={skip}>
          <Text>⏭</Text>
        </View>
      </View>

      <View className={styles.quickSettings}>
        <Text className={styles.quickTitle}>
          {mode === 'focus' ? '专注时长' : '休息时长'}
        </Text>
        <View className={styles.durationOptions}>
          {options.map(min => (
            <View
              key={min}
              className={classNames(
                styles.durationOption,
                currentDuration === min && styles.activeOption
              )}
              onClick={() => selectDuration(min)}
            >
              {min}分钟
            </View>
          ))}
        </View>

        {mode === 'focus' && (
          <>
            <View className={styles.settingRow}>
              <View className={styles.settingLabel}>
                <Text className={styles.settingIcon}>💧</Text>
                <Text>眨眼提醒</Text>
              </View>
              <Text className={styles.settingLabel}>
                {settings.blinkReminder ? `每${settings.blinkInterval}分钟` : '关闭'}
              </Text>
            </View>
            <View className={styles.settingRow}>
              <View className={styles.settingLabel}>
                <Text className={styles.settingIcon}>🏞️</Text>
                <Text>远眺提醒</Text>
              </View>
              <Text className={styles.settingLabel}>
                {settings.farViewReminder ? `每${settings.farViewInterval}分钟` : '关闭'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>
          💡 护眼小知识
        </Text>
        <Text className={styles.tipContent}>{currentTip}</Text>
      </View>
    </View>
  )
}

export default TimerPage
