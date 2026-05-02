<template>
  <div class="viewer">
    <!-- 舞台光效 -->
    <div class="stage-light"></div>

    <!-- 🔴 LIVE 状态栏 -->
    <div class="live-bar">
      🔴 LIVE ｜ 当前：{{ getModuleName(store.currentModule?.type) }}
    </div>

    <!-- 主内容区（带卡片层） -->
    <div class="content">
      <!-- 欢迎模块 -->
      <div v-if="type === 'welcome'" class="welcome">
        <div class="welcome-title">🌟 欢迎参加主日崇拜</div>
        <div class="host" v-if="data?.host">主持：{{ data.host }}</div>
        <div class="notices">
          <div v-for="(notice, idx) in data?.notice" :key="idx" class="notice-item">
            {{ notice }}
          </div>
        </div>
      </div>

      <!-- 敬拜模块 -->
      <div v-else-if="type === 'worship'" class="worship">
        <div class="song-title">{{ currentSong?.title || '正在准备...' }}</div>
        <div class="lyrics" v-if="currentLyrics.length">
          <div 
            v-for="(line, idx) in currentLyrics" 
            :key="idx"
            :class="['lyric-line', { active: idx === currentLine }]"
          >
            {{ line }}
          </div>
        </div>
        <div class="song-sub" v-else>🎵 敬拜赞美</div>
      </div>

      <!-- 信息模块 -->
      <div v-else-if="type === 'message'" class="message">
        <div class="message-title">{{ data?.title }}</div>
        <div class="speaker">🎤 {{ data?.speaker }}</div>
        <div class="outline" v-if="data?.outline">
          <div v-for="(point, idx) in data.outline" :key="idx" class="outline-point">
            {{ idx + 1 }}. {{ point }}
          </div>
        </div>
      </div>

      <!-- 读经模块 -->
      <div v-else-if="type === 'bible'" class="bible">
        <div class="bible-ref">📖 {{ data?.ref }}</div>
        <div class="bible-text">{{ bibleText }}</div>
      </div>

      <!-- 公告模块 -->
      <div v-else-if="type === 'announcement'" class="announcement">
        <div class="highlight" v-if="data?.highlight?.length">
          <div class="highlight-title">🔥 本周重点</div>
          <div v-for="(item, idx) in data.highlight" :key="idx" class="highlight-item">
            {{ item }}
          </div>
        </div>
      </div>

      <!-- 奉献模块 -->
      <div v-else-if="type === 'giving'" class="giving">
        <div class="giving-title">💰 奉献支持</div>
        <div class="giving-methods">
          <div v-for="(method, idx) in store.givingData?.methods" :key="idx" class="giving-method">
            {{ method.name }}: {{ method.value || method.url }}
          </div>
        </div>
      </div>

      <!-- 祷告模块 -->
      <div v-else-if="type === 'prayer'" class="prayer">
        <div class="prayer-title">🙏 祷告</div>
        <div class="prayer-text">让我们一起同心祷告</div>
      </div>

      <!-- 默认占位 -->
      <div v-else class="placeholder">
        <div class="placeholder-title">{{ getModuleName(type) }}</div>
        <div class="placeholder-text">正在准备中...</div>
      </div>
    </div>

    <!-- 下一步提示 -->
    <div class="next-hint">
      下一步：{{ getNextModuleName() }}
    </div>
  </div>
</template>

<script setup>
import { useWorshipStore } from '../stores/worshipStore'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

const store = useWorshipStore()

const type = computed(() => store.currentModule?.type)
const data = computed(() => store.getCurrentModuleData)

const bibleText = computed(() => {
  if (!data.value?.ref) return ''
  return store.bibleDB?.[data.value.ref] || '经文加载中...'
})

const currentSong = computed(() => {
  if (!data.value?.songs || !data.value.songs.length) return null
  const songId = data.value.songs[0]
  return store.mediaLib?.[songId]
})

// 歌词数据
const lyricsDatabase = {
  '祢的恩典胜过一切': [
    '祢的恩典 每天够我用',
    '祢的恩典 时刻围绕我',
    '我的一生 在祢手中',
    '祢的恩典 胜过一切'
  ],
  '我要歌颂你的名': [
    '我要歌颂你的名',
    '我要高举你的名',
    '你是我唯一的救主',
    '你是我生命的主'
  ]
}

const currentLyrics = computed(() => {
  const songTitle = currentSong.value?.title
  return lyricsDatabase[songTitle] || []
})

const currentLine = ref(0)
let lyricInterval = null

const startLyricsAutoScroll = () => {
  if (lyricInterval) clearInterval(lyricInterval)
  lyricInterval = setInterval(() => {
    if (currentLyrics.value.length > 0) {
      currentLine.value = (currentLine.value + 1) % currentLyrics.value.length
    }
  }, 3000)
}

const stopLyricsAutoScroll = () => {
  if (lyricInterval) {
    clearInterval(lyricInterval)
    lyricInterval = null
  }
  currentLine.value = 0
}

watch(() => store.currentModule?.type, (newType) => {
  if (newType === 'worship') {
    startLyricsAutoScroll()
  } else {
    stopLyricsAutoScroll()
  }
})

const getNextModuleName = () => {
  if (!store.flowEngine) return '即将结束'
  const nextIndex = store.flowEngine.currentIndex + 1
  if (nextIndex >= store.flowEngine.flow.length) {
    return '聚会结束'
  }
  const nextModule = store.flowEngine.flow[nextIndex]
  const names = {
    welcome: '欢迎', worship: '敬拜', message: '信息',
    bible: '读经', announcement: '公告', giving: '奉献', prayer: '祷告'
  }
  return names[nextModule.type] || nextModule.type
}

const getModuleName = (t) => {
  const names = {
    welcome: '欢迎', worship: '敬拜', message: '信息',
    bible: '读经', announcement: '公告', giving: '奉献', prayer: '祷告'
  }
  return names[t] || t
}

onMounted(() => {
  if (type.value === 'worship') {
    startLyricsAutoScroll()
  }
})

onUnmounted(() => {
  stopLyricsAutoScroll()
})
</script>

<style scoped>
.viewer {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, rgba(80, 100, 255, 0.15), transparent 60%),
              linear-gradient(135deg, #0a0a1a 0%, #000000 100%);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  position: relative;
}

/* 舞台光效 */
.stage-light {
  position: absolute;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* LIVE 状态栏 */
.live-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff4d6d;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  backdrop-filter: blur(10px);
  z-index: 10;
  text-align: left;
}

/* 下一步提示 */
.next-hint {
  position: absolute;
  bottom: 20px;
  right: 30px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 10;
}

/* 🔥 内容卡片层 */
.content {
  font-size: 56px;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 50px 80px;
  border-radius: 30px;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
  max-width: 85%;
  width: auto;
  text-align: center;
  animation: fadeIn 0.6s ease;
  z-index: 2;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 欢迎模块 */
.welcome-title {
  font-size: 72px;
  margin-bottom: 40px;
  color: #ffd166;
}

.host {
  font-size: 40px;
  margin-bottom: 50px;
  opacity: 0.8;
}

.notice-item {
  font-size: 36px;
  padding: 12px;
}

/* 敬拜模块 */
.song-title {
  font-size: 72px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #ffd166;
}

.lyrics {
  margin-top: 30px;
}

.lyric-line {
  font-size: 48px;
  opacity: 0.4;
  transition: all 0.3s ease;
  margin: 15px 0;
}

.lyric-line.active {
  opacity: 1;
  color: #ffd166;
  font-size: 60px;
  transform: scale(1.05);
}

/* 信息模块 */
.message-title {
  font-size: 72px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #ffd166;
}

.speaker {
  font-size: 40px;
  margin-bottom: 50px;
  opacity: 0.8;
}

.outline-point {
  font-size: 40px;
  margin: 25px 0;
}

/* 读经模块 */
.bible-ref {
  font-size: 56px;
  margin-bottom: 40px;
  color: #ffd166;
}

.bible-text {
  font-size: 56px;
  line-height: 1.8;
  font-family: 'Georgia', serif;
}

/* 公告模块 */
.highlight-title {
  font-size: 56px;
  margin-bottom: 30px;
  color: #ff6b6b;
}

.highlight-item {
  font-size: 44px;
  padding: 15px;
  margin: 15px 0;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 12px;
}

/* 奉献模块 */
.giving-title {
  font-size: 64px;
  margin-bottom: 40px;
  color: #ffd166;
}

.giving-method {
  font-size: 40px;
  padding: 12px;
}

/* 祷告模块 */
.prayer-title {
  font-size: 64px;
  margin-bottom: 40px;
  color: #ffd166;
}

.prayer-text {
  font-size: 48px;
}

/* 响应式 */
@media (max-width: 768px) {
  .content {
    padding: 30px 40px;
  }
  .song-title, .message-title {
    font-size: 48px;
  }
  .bible-text {
    font-size: 36px;
  }
  .lyric-line {
    font-size: 32px;
  }
  .lyric-line.active {
    font-size: 42px;
  }
}
</style>