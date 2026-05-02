import { defineStore } from 'pinia'
import { FlowEngine } from '../engine/FlowEngine'
import { DEFAULT_FLOW, DEFAULT_WEEKLY } from '../data/defaultData'

export const useWorshipStore = defineStore('worship', {
  state: () => ({
    flowEngine: null,
    currentData: null,
    currentModule: null,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    songPlayer: { currentIndex: 0, isPlaying: false },
    lyricsData: {}
  }),

  actions: {
    async loadTodayData() {
      try {
        // 直接使用内嵌数据
        const flow = DEFAULT_FLOW
        const content = DEFAULT_WEEKLY.content
        
        this.flowEngine = new FlowEngine(flow, content)
        this.currentData = DEFAULT_WEEKLY
        this.currentModule = this.flowEngine.current()
        
        // 存储歌词数据
        if (content.worship?.lyrics) {
          this.lyricsData = content.worship.lyrics
        }

        // 恢复进度
        const saved = localStorage.getItem('currentModuleIndex')
        if (saved && this.flowEngine) {
          const parsed = JSON.parse(saved)
          this.flowEngine.currentIndex = parsed.index
          this.currentModule = this.flowEngine.current()
        }

        this.initSyncListener()
        console.log('✅ 内嵌数据加载成功')
      } catch (error) {
        console.error('加载失败:', error)
      }
    },

    // ... 其他方法保持不变（nextModule, prevModule, jumpToModule, 计时器等）
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
    },

    getCurrentLyrics() {
      const songs = this.currentModule?.data?.songs
      if (!songs?.length) return []
      const currentSong = songs[this.songPlayer.currentIndex]
      return this.lyricsData[currentSong] || []
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
      return { title: songs[state.songPlayer.currentIndex] }
    }
  }
})