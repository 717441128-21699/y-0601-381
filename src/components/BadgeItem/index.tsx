import React from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import type { Badge } from '@/types'
import styles from './index.module.scss'

interface BadgeItemProps {
  badge: Badge
  onClick?: () => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, onClick }) => {
  return (
    <View
      className={classNames(styles.badgeItem, !badge.unlocked && styles.locked)}
      onClick={onClick}
    >
      <View className={styles.icon}>
        <Text>{badge.icon}</Text>
      </View>
      <Text className={styles.name}>{badge.name}</Text>
      <Text className={styles.desc}>{badge.description}</Text>
    </View>
  )
}

export default BadgeItem
