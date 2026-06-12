import type { EyeExercise } from '@/types'

export const EYE_EXERCISES: EyeExercise[] = [
  {
    id: 'blink',
    name: '眨眼运动',
    description: '缓慢地眨眼，保持眼睛湿润',
    duration: 30,
    tip: '每眨一次眼都能给眼球涂上一层泪膜'
  },
  {
    id: 'far_view',
    name: '远眺放松',
    description: '看向20英尺（约6米）外的物体',
    duration: 20,
    tip: '远眺可以放松眼肌，缓解视疲劳'
  },
  {
    id: 'rotate',
    name: '眼球转动',
    description: '顺时针和逆时针转动眼球',
    duration: 30,
    tip: '动作要慢，感受眼肌的拉伸'
  },
  {
    id: 'focus',
    name: '远近聚焦',
    description: '交替看近处和远处的物体',
    duration: 30,
    tip: '近看约25厘米，远看约6米'
  },
  {
    id: 'palming',
    name: '掌心热敷',
    description: '用掌心温暖双眼，放松视神经',
    duration: 40,
    tip: '双手搓热后轻轻覆盖在眼睛上'
  },
  {
    id: 'massage',
    name: '穴位按摩',
    description: '按摩眼周穴位，促进血液循环',
    duration: 40,
    tip: '轻柔按压睛明、太阳、四白等穴位'
  }
]

export const EYE_EXERCISE_TIPS = [
  '每用眼20分钟，远眺20秒',
  '保持室内光线柔和，避免眩光',
  '屏幕与眼睛保持50-70厘米距离',
  '屏幕中心应在眼睛下方15-20度',
  '多吃富含维生素A的食物',
  '保证充足睡眠，让眼睛充分休息'
]
