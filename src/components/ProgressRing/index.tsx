import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  unit?: string
  children?: React.ReactNode
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max,
  size = 200,
  strokeWidth = 12,
  color = '#22c55e',
  unit,
  children
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <View className={styles.progressRing} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size}>
        <circle
          className={styles.circleBg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.circleProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <View className={styles.content}>
        {children || (
          <>
            <Text className={styles.value}>{Math.round(progress * 100)}%</Text>
            {unit && <Text className={styles.unit}>{unit}</Text>}
          </>
        )}
      </View>
    </View>
  )
}

export default ProgressRing
