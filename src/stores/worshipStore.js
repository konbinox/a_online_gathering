import { defineStore } from 'pinia'
import { FlowEngine } from '../engine/FlowEngine'

// 内嵌默认数据（完全不依赖 fetch）
const DEFAULT_FLOW = {
  id: "standard",
  name: "标准主日流程",
  modules: [
    { type: "welcome" },
    { type: "worship" },
    { type: "message" },
    { type: "bible" },
    { type: "announcement" },
    { type: "giving" },
    { type: "prayer" }
  ]
}

const DEFAULT_WEEKLY = {
  date: new Date().toISOString().split('T')[0],
  flowId: "standard",
  content: {
    welcome: {
      host: "欢迎你",
      leader: "主持同工",
      instruction: "欢迎参加主日崇拜",
      notice: ["请将名字改为真实姓名", "聚会期间请保持安静"]
    },
    worship: {
      leader: "敬拜同工",
      instruction: "带领会众敬拜",
      songs: []
    },
    message: {
      title: "神的恩典够你用",
      speaker: "牧师",
      leader: "牧师",
      instruction: "分享神的话语",
      outline: ["恩典的意义", "恩典的实践"]
    },
    bible: {
      ref: "哥林多后书 12:9",
      leader: "读经同工",
      instruction: "请读经文"
    },
    announcement: {
      leader: "报告同工",
      instruction: "报告家事",
      highlight: ["欢迎新朋友", "下周圣餐主日"],
      normal: ["周三祷告会", "周五小组聚会"]
    },
    giving: {
      leader: "财务同工",
      instruction: "奉献环节"
    },
    prayer: {
      leader: "祷告同工",
      instruction: "带领祷告"
    }
  }
}

export const useWorshipStore = defineStore('worship', {
  state: () => ({
    flowEngine: null,
    currentData: null,
    currentModule: null,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    songPlayer: { currentIndex: 0, isPlaying: false }
  }),

  actions: {
    async loadTodayData() {
      try {
        // 直接使用内嵌数据，不 fetch
        const flow = DEFAULT_FLOW
        const content = DEFAULT_WEEKLY.content
        
        this.flowEngine = new FlowEngine(flow, content)
        this.currentData = DEFAULT_WEEKLY
        this.currentModule = this.flowEngine.current()

        // 恢复进度
        const saved = localStorage.getItem('currentModuleIndex')
        if (saved && this.flowEngine) {
          const parsed = JSON.parse(saved)
          this.flowEngine.currentIndex = parsed.index
          this.currentModule = this.flowEngine.current()
        }

        this.initSyncListener()
        console.log('数据加载成功（内嵌模式）')
      } catch (error) {
        console.error('加载失败:', error)
      }
    },

    initSyncListener() {
      window.addEventListener('storage', (e) => {
        if (e.key === 'currentModuleIndex' && e.newValue) {
          const data = JSON.parse(e.newValue)
          if (this.flowEngine && data.index !== this.flowEngine.currentIndex) {
            this.flowEngine.currentIndex = data.index
            this.currentModule = this.flowEngine.current()
            this.songPlayer.currentIndex = 0
          }
        }
      })
    },

    nextModule() {
      if (this.flowEngine?.next()) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    prevModule() {
      if (this.flowEngine?.prev()) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    jumpToModule(type) {
      if (this.flowEngine?.jumpTo(type)) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    saveProgress() {
      if (this.currentModule && this.flowEngine) {
        localStorage.setItem('currentModuleIndex', JSON.stringify({
          type: this.currentModule.type,
          index: this.flowEngine.currentIndex
        }))
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerRunning = true
      this.timerInterval = setInterval(() => {
        if (this.timerRunning) this.timerSeconds++
      }, 1000)
    },

    pauseTimer() { this.timerRunning = false },
    
    resetTimer() {
      this.timerSeconds = 0
      this.timerRunning = false
      if (this.timerInterval) clearInterval(this.timerInterval)
    },
    
    formatTime() {
      const m = Math.floor(this.timerSeconds / 60)
      const s = this.timerSeconds % 60
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },

    nextSong() {
      const songs = this.currentModule?.data?.songs
      if (songs && this.songPlayer.currentIndex < songs.length - 1) {
        this.songPlayer.currentIndex++
      }
    },
    
    prevSong() {
      if (this.songPlayer.currentIndex > 0) this.songPlayer.currentIndex--
    }
  },

  getters: {
    getProgress: (state) => ({
      current: state.flowEngine?.currentIndex + 1 || 0,
      total: state.flowEngine?.flow?.length || 0,
      percentage: state.flowEngine ? ((state.flowEngine.currentIndex + 1) / state.flowEngine.flow.length) * 100 : 0
    }),
    
    getCurrentModuleData: (state) => state.currentModule?.data || null,
    
    getCurrentInstruction: (state) => ({
      leader: state.currentModule?.data?.leader || '待指定',
      instruction: state.currentModule?.data?.instruction || '准备进入下一环节'
    }),
    
    getCurrentSong: (state) => {
      const songs = state.currentModule?.data?.songs
      if (!songs?.length) return null
      return { title: songs[state.songPlayer.currentIndex] || '诗歌' }
    }
  }
})