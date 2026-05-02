// src/stores/worshipStore.js
import { defineStore } from 'pinia'

// --- 内嵌数据 (所有内容都写在这里，不需要任何外部文件) ---
const DEFAULT_FLOW = {
  id: "standard",
  name: "标准主日流程",
  modules: [
    { type: "welcome" }, { type: "worship" }, { type: "message" },
    { type: "bible" }, { type: "announcement" }, { type: "giving" }, { type: "prayer" }
  ]
}

const DEFAULT_WEEKLY_CONTENT = {
  welcome: {
    host: "欢迎你",
    leader: "主持同工",
    instruction: "欢迎参加主日崇拜",
    notice: ["请将名字改为真实姓名", "聚会期间请保持安静"]
  },
  worship: {
    leader: "敬拜同工",
    instruction: "带领会众敬拜",
    songs: ["诗篇23篇", "祢的爱不离不弃"]
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
// ----------------------------------------------

// 一个极简的 FlowEngine，只为了满足 store 的调用
class SimpleFlowEngine {
  constructor(flow, content) {
    this.modules = flow.modules
    this.content = content
    this.currentIndex = 0
  }
  current() {
    const module = this.modules[this.currentIndex]
    return { ...module, data: this.content[module.type] || {} }
  }
  next() { if (this.currentIndex < this.modules.length - 1) { this.currentIndex++; return true } return false }
  prev() { if (this.currentIndex > 0) { this.currentIndex--; return true } return false }
  jumpTo(type) {
    const idx = this.modules.findIndex(m => m.type === type)
    if (idx !== -1) { this.currentIndex = idx; return true }
    return false
  }
}

export const useWorshipStore = defineStore('worship', {
  state: () => ({
    flowEngine: null,
    currentModule: null,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    songPlayer: { currentIndex: 0 }
  }),
  actions: {
    async loadTodayData() {
      // 直接使用内嵌数据，并且重置模块索引
      this.flowEngine = new SimpleFlowEngine(DEFAULT_FLOW, DEFAULT_WEEKLY_CONTENT)
      this.currentModule = this.flowEngine.current()
      // 从 localStorage 恢复进度（可选）
      const saved = localStorage.getItem('currentModuleIndex')
      if (saved) {
        try {
          const { index } = JSON.parse(saved)
          if (index !== undefined && this.flowEngine.modules[index]) {
            this.flowEngine.currentIndex = index
            this.currentModule = this.flowEngine.current()
          }
        } catch(e) { console.warn(e) }
      }
      console.log('✅ 内嵌数据加载成功!')
    },
    saveProgress() {
      if (this.currentModule && this.flowEngine) {
        localStorage.setItem('currentModuleIndex', JSON.stringify({ index: this.flowEngine.currentIndex }))
      }
    },
    nextModule() { if (this.flowEngine?.next()) { this.currentModule = this.flowEngine.current(); this.saveProgress(); this.songPlayer.currentIndex = 0 } },
    prevModule() { if (this.flowEngine?.prev()) { this.currentModule = this.flowEngine.current(); this.saveProgress(); this.songPlayer.currentIndex = 0 } },
    jumpToModule(type) { if (this.flowEngine?.jumpTo(type)) { this.currentModule = this.flowEngine.current(); this.saveProgress(); this.songPlayer.currentIndex = 0 } },
    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerRunning = true
      this.timerInterval = setInterval(() => { if (this.timerRunning) this.timerSeconds++ }, 1000)
    },
    pauseTimer() { this.timerRunning = false },
    resetTimer() { this.timerSeconds = 0; this.timerRunning = false; if (this.timerInterval) clearInterval(this.timerInterval) },
    formatTime() { return `${Math.floor(this.timerSeconds / 60).toString().padStart(2, '0')}:${(this.timerSeconds % 60).toString().padStart(2, '0')}` },
    nextSong() {
      const songs = this.currentModule?.data?.songs
      if (songs && this.songPlayer.currentIndex < songs.length - 1) this.songPlayer.currentIndex++
    },
    prevSong() { if (this.songPlayer.currentIndex > 0) this.songPlayer.currentIndex-- }
  },
  getters: {
    getProgress: (state) => ({
      current: (state.flowEngine?.currentIndex || 0) + 1,
      total: state.flowEngine?.modules?.length || 0,
      percentage: (( (state.flowEngine?.currentIndex || 0) + 1) / (state.flowEngine?.modules?.length || 1)) * 100
    }),
    getCurrentModuleData: (state) => state.currentModule?.data || {},
    getCurrentInstruction: (state) => ({
      leader: state.currentModule?.data?.leader || '同工',
      instruction: state.currentModule?.data?.instruction || '请准备'
    }),
    getCurrentSong: (state) => {
      const songs = state.currentModule?.data?.songs
      if (!songs) return null
      return { title: songs[state.songPlayer.currentIndex] || '诗歌' }
    }
  }
})