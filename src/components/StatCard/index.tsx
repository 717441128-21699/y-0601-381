import React from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  icon: string
  value: string | number
  unit?: string
  label: string
  color?: 'green' | 'blue' | 'orange' | 'purple'
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  unit,
  label,
  color = 'green',
  onClick
}) => {
  const bgClass = {
    green: styles.greenBg,
    blue: styles.blueBg,
    orange: styles.orangeBg,
    purple: styles.purpleBg
  }[color]

  return (
    <View className={styles.statCard} onClick={onClick}>
      <View className={classNames(styles.iconWrap, bgClass)}>
        <Text>{icon}</Text>
      </View>
      <View>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      <Text className={styles.label}>{label}</Text>
    </View>
  )
}

export default StatCard
