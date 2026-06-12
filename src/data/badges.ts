import type { Badge } from '@/types'

export const BADGE_LIST: Badge[] = [
  {
    id: 'first_day',
    name: '初次护眼',
    description: '完成第一天的护眼记录',
    icon: '🌱',
    unlocked: false,
    condition: '完成1天护眼记录'
  },
  {
    id: 'three_days',
    name: '坚持三天',
    description: '连续3天完成护眼目标',
    icon: '🌿',
    unlocked: false,
    condition: '连续3天达标'
  },
  {
    id: 'seven_days',
    name: '一周达人',
    description: '连续7天完成护眼目标',
    icon: '🌳',
    unlocked: false,
    condition: '连续7天达标'
  },
  {
    id: 'thirty_days',
    name: '护眼达人',
    description: '连续30天完成护眼目标',
    icon: '🏆',
    unlocked: false,
    condition: '连续30天达标'
  },
  {
    id: 'eye_exercise_pro',
    name: '眼操高手',
    description: '完成20次眼保健操',
    icon: '👀',
    unlocked: false,
    condition: '完成20次眼保健操'
  },
  {
    id: 'outdoor_lover',
    name: '户外达人',
    description: '累计户外活动100小时',
    icon: '🌞',
    unlocked: false,
    condition: '户外累计100小时'
  },
  {
    id: 'good_sleeper',
    name: '睡眠之星',
    description: '连续7天睡眠超过7小时',
    icon: '😴',
    unlocked: false,
    condition: '连续7天睡够7小时'
  },
  {
    id: 'water_lover',
    name: '水润眼睛',
    description: '连续7天喝水达标',
    icon: '💧',
    unlocked: false,
    condition: '连续7天喝水达标'
  },
  {
    id: 'early_bird',
    name: '早起护眼',
    description: '连续7天在早上做眼操',
    icon: '🌅',
    unlocked: false,
    condition: '连续7天早间眼操'
  },
  {
    id: 'night_owl',
    name: '夜猫子保护',
    description: '开启夜间模式并坚持7天',
    icon: '🌙',
    unlocked: false,
    condition: '夜间模式7天'
  }
]
