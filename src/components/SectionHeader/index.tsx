import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  icon?: string
  actionText?: string
  onAction?: () => void
  showDivider?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  actionText,
  onAction,
  showDivider = false
}) => {
  return (
    <>
      <View className={styles.sectionHeader}>
        <View className={styles.title}>
          {icon && <Text className={styles.icon}>{icon}</Text>}
          <Text>{title}</Text>
        </View>
        {actionText && (
          <View className={styles.action} onClick={onAction}>
            <Text>{actionText}</Text>
            <Text>›</Text>
          </View>
        )}
      </View>
      {showDivider && <View className={styles.divider} />}
    </>
  )
}

export default SectionHeader
