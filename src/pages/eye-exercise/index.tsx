import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import { useEyeStore } from '@/store/useEyeStore'
import { EYE_EXERCISES } from '@/data/eyeExercises'
import styles from './index.module.scss'

type Status = 'idle' | 'running' | 'paused' | 'completed'

const EyeExercisePage: React.FC = () => {
  const { addEyeExercise } = useEyeStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(EYE_EXERCISES[0].duration)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSteps = EYE_EXERCISES.length
  const currentExercise = EYE_EXERCISES[currentStep]

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setStatus('running')

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleStepComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setStatus('paused')
  }

  const handleStepComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
      setTimeLeft(EYE_EXERCISES[currentStep + 1].duration)
      setStatus('idle')
    } else {
      setStatus('completed')
      addEyeExercise()
      Taro.showToast({
        title: '🎉 眼操完成！',
        icon: 'success',
        duration: 2000
      })
    }
  }, [currentStep, totalSteps, addEyeExercise])

  const prevStep = () => {
    if (currentStep > 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setCurrentStep(prev => prev - 1)
      setTimeLeft(EYE_EXERCISES[currentStep - 1].duration)
      setStatus('idle')
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setCurrentStep(prev => prev + 1)
      setTimeLeft(EYE_EXERCISES[currentStep + 1].duration)
      setStatus('idle')
    }
  }

  const resetExercise = () => {
    setCurrentStep(0)
    setTimeLeft(EYE_EXERCISES[0].duration)
    setStatus('idle')
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const progress = currentExercise.duration > 0
    ? (currentExercise.duration - timeLeft) / currentExercise.duration
    : 0
  const circumference = 2 * Math.PI * 70
  const dashOffset = circumference * (1 - progress)

  const exerciseIcons = ['👀', '🏞️', '🔄', '🎯', '🫶', '💆']

  if (status === 'completed') {
    return (
      <View className={styles.page}>
        <View className={styles.completeCard}>
          <Text className={styles.completeIcon}>🎉</Text>
          <Text className={styles.completeTitle}>太棒了！</Text>
          <Text className={styles.completeDesc}>
            你已完成整套眼保健操\n眼睛得到了充分的放松
          </Text>
          <View className={styles.completeBtn} onClick={resetExercise}>
            再做一次
          </View>
          <View
            className={classNames(styles.completeBtn, styles.againBtn)}
            onClick={() => Taro.navigateBack()}
          >
            返回
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.progressBar}>
        <View className={styles.stepDots}>
          {EYE_EXERCISES.map((_, index) => (
            <View
              key={index}
              className={classNames(
                styles.stepDot,
                index < currentStep && styles.completedDot,
                index === currentStep && styles.activeDot
              )}
            />
          ))}
        </View>
        <Text className={styles.stepCount}>
          {currentStep + 1}/{totalSteps}
        </Text>
      </View>

      <View className={styles.exerciseCard}>
        <View className={styles.exerciseIcon}>
          <Text>{exerciseIcons[currentStep]}</Text>
        </View>
        <Text className={styles.exerciseName}>{currentExercise.name}</Text>
        <Text className={styles.exerciseDesc}>{currentExercise.description}</Text>

        <View className={styles.timerCircle}>
          <svg className={styles.timerSvg} width="160" height="160">
            <circle
              className={styles.timerBg}
              cx="80"
              cy="80"
              r="70"
              strokeWidth="8"
            />
            <circle
              className={styles.timerProgress}
              cx="80"
              cy="80"
              r="70"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <Text className={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      <View className={styles.tipBox}>
        <Text className={styles.tipTitle}>
          💡 小提示
        </Text>
        <Text className={styles.tipContent}>{currentExercise.tip}</Text>
      </View>

      <View className={styles.controls}>
        <View
          className={styles.controlBtn}
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <Text>⏮</Text>
        </View>
        <View
          className={classNames(styles.controlBtn, styles.primaryBtn)}
          onClick={status === 'running' ? pauseTimer : startTimer}
        >
          <Text>{status === 'running' ? '⏸' : '▶'}</Text>
        </View>
        <View
          className={styles.controlBtn}
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1}
        >
          <Text>⏭</Text>
        </View>
      </View>
    </View>
  )
}

export default EyeExercisePage
