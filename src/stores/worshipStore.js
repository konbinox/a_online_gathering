import { defineStore } from 'pinia'
import { FlowEngine } from '../engine/FlowEngine'
import { loadJSON } from '../utils/loader'

export const useWorshipStore = defineStore('worship', {
  state: () => ({
    flowEngine: null,
    currentData: null,
    weeklyData: null,
    flowData: null,
    mediaLib: null,
    bibleDB: null,
    membersData: null,
    givingData: null,
    currentModule: null,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    songPlayer: {
      currentIndex: 0,
      isPlaying: false
    }
  }),

  actions: {
    async loadTodayData() {
      try {
        // 加载基础数据
        this.flowData = await loadJSON('/src/data/flow.json')
        this.mediaLib = await loadJSON('/src/data/media.json')
        this.bibleDB = await loadJSON('/src/data/bible.json')
        this.membersData = await loadJSON('/src/data/members.json')
        this.givingData = await loadJSON('/src/data/giving.json')
        
        const today = new Date().toISOString().split('T')[0]
        let todayWeekData = null

        // 🔥 第5步修改：优先从 localStorage 读取编辑的内容
        const localWeekly = localStorage.getItem('weekly')
        if (localWeekly) {
          try {
            const localData = JSON.parse(localWeekly)
            // 如果本地数据有日期且匹配今天，或者没有日期，就使用它
            if (localData.date === today || !localData.date) {
              todayWeekData = localData
              console.log('✅ 使用本地编辑的数据')
            }
          } catch (e) {
            console.log('本地数据解析失败:', e)
          }
        }

        // 如果没有本地数据，从 weekly 目录加载当天文件
        if (!todayWeekData) {
          try {
            todayWeekData = await loadJSON(`/src/data/weekly/${today}.json`)
            if (todayWeekData) console.log('✅ 使用当天数据文件')
          } catch (e) {
            console.log('没有当天的专属文件')
          }
        }

        // 如果还没有，从旧的 weekly.json 加载
        if (!todayWeekData) {
          this.weeklyData = await loadJSON('/src/data/weekly.json')
          if (this.weeklyData && this.weeklyData.length) {
            todayWeekData = this.weeklyData.find(w => w.date === today)
            if (!todayWeekData && this.weeklyData[0]) {
              todayWeekData = this.weeklyData[0]
              console.log('✅ 使用第一个可用周数据:', todayWeekData.date)
            }
          }
        }

        // 如果还是没有，创建默认测试数据
        if (!todayWeekData) {
          console.warn('⚠️ 没有找到任何周数据，使用默认测试数据')
          todayWeekData = {
            date: today,
            flowId: "standard",
            content: {
              welcome: { host: "测试主持", leader: "测试", instruction: "测试用默认数据，请点击编辑按钮添加真实内容", notice: ["请点击✏️编辑本周内容添加数据"] },
              worship: { leader: "测试", instruction: "测试敬拜", songs: [] },
              message: { title: "测试信息", speaker: "测试讲员", leader: "测试", instruction: "测试信息" },
              bible: { ref: "诗篇 23:1", leader: "测试", instruction: "测试读经" },
              announcement: { leader: "测试", instruction: "测试公告", highlight: ["请点击编辑按钮添加公告"], normal: [] },
              giving: { leader: "测试", instruction: "测试奉献" },
              prayer: { leader: "测试", instruction: "测试祷告" }
            }
          }
        }

        const flow = this.flowData.find(f => f.id === todayWeekData.flowId)
        if (!flow) {
          console.error('没有找到对应的流程，使用默认流程')
          return
        }

        this.flowEngine = new FlowEngine(flow, todayWeekData.content)
        this.currentData = todayWeekData
        this.currentModule = this.flowEngine.current()

        // 从 localStorage 恢复进度
        const savedData = localStorage.getItem('currentModuleIndex')
        if (savedData && this.flowEngine) {
          const parsed = JSON.parse(savedData)
          if (parsed.index !== undefined) {
            this.flowEngine.currentIndex = parsed.index
            this.currentModule = this.flowEngine.current()
          }
        }

        // 初始化同步监听
        this.initSyncListener()

      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },

    initSyncListener() {
      window.addEventListener('storage', (e) => {
        if (e.key === 'currentModuleIndex' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue)
            if (this.flowEngine && data.index !== undefined && data.index !== this.flowEngine.currentIndex) {
              this.flowEngine.currentIndex = data.index
              this.currentModule = this.flowEngine.current()
              this.songPlayer.currentIndex = 0
              console.log('同步到模块:', this.currentModule?.type)
            }
          } catch (err) {
            console.error('同步解析失败:', err)
          }
        }
      })
    },

    nextModule() {
      if (this.flowEngine.next()) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    prevModule() {
      if (this.flowEngine.prev()) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    jumpToModule(type) {
      if (this.flowEngine.jumpTo(type)) {
        this.currentModule = this.flowEngine.current()
        this.saveProgress()
        this.songPlayer.currentIndex = 0
      }
    },

    saveProgress() {
      if (this.currentModule && this.flowEngine) {
        const data = {
          type: this.currentModule.type,
          index: this.flowEngine.currentIndex
        }
        localStorage.setItem('currentModuleIndex', JSON.stringify(data))
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerRunning = true
      this.timerInterval = setInterval(() => {
        if (this.timerRunning) {
          this.timerSeconds++
        }
      }, 1000)
    },

    pauseTimer() {
      this.timerRunning = false
    },

    resetTimer() {
      this.timerSeconds = 0
      this.timerRunning = false
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    formatTime() {
      const minutes = Math.floor(this.timerSeconds / 60)
      const seconds = this.timerSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    nextSong() {
      const songs = this.getCurrentSongs()
      if (songs && this.songPlayer.currentIndex < songs.length - 1) {
        this.songPlayer.currentIndex++
        this.songPlayer.isPlaying = true
      }
    },

    prevSong() {
      if (this.songPlayer.currentIndex > 0) {
        this.songPlayer.currentIndex--
        this.songPlayer.isPlaying = true
      }
    },

    getCurrentSongs() {
      if (!this.currentModule?.data?.songs) return null
      return this.currentModule.data.songs.map(id => this.mediaLib[id]).filter(s => s)
    }
  },

  getters: {
    getProgress: (state) => {
      if (!state.flowEngine || !state.flowEngine.flow) {
        return { current: 0, total: 0, percentage: 0 }
      }
      return state.flowEngine.getProgress()
    },
    
    getCurrentModuleData: (state) => {
      if (!state.currentModule) return null
      return state.currentModule.data
    },

    getCurrentInstruction: (state) => {
      if (!state.currentModule?.data) {
        return { leader: '待指定', instruction: '准备中' }
      }
      return {
        leader: state.currentModule.data.leader || '待指定',
        instruction: state.currentModule.data.instruction || '请准备进入下一环节'
      }
    },

    getCurrentSong: (state) => {
      const songs = state.currentModule?.data?.songs
      if (!songs || !songs.length) return null
      const songId = songs[state.songPlayer.currentIndex]
      return state.mediaLib ? state.mediaLib[songId] : null
    }
  }
})