export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/timer/index',
    'pages/records/index',
    'pages/achievement/index',
    'pages/settings/index',
    'pages/eye-exercise/index',
    'pages/environment/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#22c55e',
    navigationBarTitleText: '护眼健康',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f0fdf4'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#22c55e',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日'
      },
      {
        pagePath: 'pages/timer/index',
        text: '计时'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/achievement/index',
        text: '成就'
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置'
      }
    ]
  }
})
