<template>
  <div class="leader-layout">
    <!-- 左侧控制区 - 窄工具栏 -->
    <div class="control-panel">
      <h2>🎛 敬拜控制台</h2>

      <div class="module-info">
        <h3>{{ getModuleName(store.currentModule?.type) }}</h3>
        <p class="instruction">
          {{ store.currentModule?.data?.instruction || '准备进入下一环节' }}
        </p>
        <p class="leader" v-if="store.currentModule?.data?.leader">
          🎤 {{ store.currentModule?.data?.leader }}
        </p>
      </div>

      <div class="timer-section">
        <span class="timer">⏱️ {{ store.formatTime() }}</span>
        <div class="timer-buttons">
          <button @click="store.startTimer()" class="small">▶️</button>
          <button @click="store.pauseTimer()" class="small">⏸️</button>
          <button @click="store.resetTimer()" class="small">🔄</button>
        </div>
      </div>

      <div class="controls">
        <button @click="store.prevModule()" class="primary">◀ 上一页</button>
        <button @click="store.nextModule()" class="primary">下一页 ▶</button>
      </div>

      <div class="jump">
        <p class="section-title">快速跳转：</p>
        <div class="jump-buttons">
          <button
            v-for="m in modules"
            :key="m.type"
            @click="store.jumpToModule(m.type)"
            :class="{ active: store.currentModule?.type === m.type }"
          >
            {{ getModuleName(m.type) }}
          </button>
        </div>
      </div>

      <div class="extra">
        <button @click="openViewer" class="secondary">📺 投屏模式</button>
        <button @click="goToEdit" class="secondary">✏️ 编辑内容</button>
      </div>

      <div class="progress-info">
        <p>进度：{{ store.getProgress.current }} / {{ store.getProgress.total }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: store.getProgress.percentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 右侧预览区 - 主角 -->
    <div class="preview-panel">
      <Viewer />
    </div>
  </div>
</template>

<script setup>
import { useWorshipStore } from '../stores/worshipStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Viewer from './Viewer.vue'

const store = useWorshipStore()
const router = useRouter()

const modules = [
  { type: 'welcome' },
  { type: 'worship' },
  { type: 'message' },
  { type: 'bible' },
  { type: 'announcement' },
  { type: 'giving' },
  { type: 'prayer' }
]

const getModuleName = (type) => {
  const names = {
    welcome: '欢迎',
    worship: '敬拜',
    message: '信息',
    bible: '读经',
    announcement: '公告',
    giving: '奉献',
    prayer: '祷告'
  }
  return names[type] || type
}

const openViewer = () => {
  window.open('/viewer', '_blank')
}

const goToEdit = () => {
  router.push('/edit')
}

onMounted(() => {
  store.startTimer()
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') store.prevModule()
    else if (e.key === 'ArrowRight') store.nextModule()
    else if (e.key >= '1' && e.key <= '9') {
      const modulesList = ['welcome', 'worship', 'message', 'bible', 'announcement', 'giving', 'prayer']
      const idx = parseInt(e.key) - 1
      if (modulesList[idx]) store.jumpToModule(modulesList[idx])
    }
  })
})
</script>

<style scoped>
.leader-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 左侧控制区 - 窄工具栏 */
.control-panel {
  width: 280px;
  background: linear-gradient(180deg, #1a1a2e 0%, #121224 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-panel h2 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 2px solid #e94560;
  padding-bottom: 6px;
}

.module-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
}

.module-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #ffd166;
}

.instruction {
  font-size: 12px;
  line-height: 1.4;
  color: #ddd;
  margin: 5px 0;
}

.leader {
  font-size: 12px;
  color: #aaa;
  margin: 3px 0 0 0;
}

.timer-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.timer {
  font-size: 28px;
  font-weight: bold;
  font-family: monospace;
  color: #ffd166;
  display: block;
  margin-bottom: 8px;
}

.timer-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 🔥 主要控制按钮（上一页/下一页）- 大字 */
.controls {
  display: flex;
  gap: 10px;
  margin: 8px 0;
}

.controls button {
  flex: 1;
  padding: 12px 8px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.primary {
  background: #e94560;
  color: white;
}

.section-title {
  font-size: 12px;
  margin-bottom: 8px;
  color: #aaa;
  font-weight: bold;
}

/* 🔥 快速跳转按钮 - 大字 */
.jump-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.jump-buttons button {
  flex: 1 0 calc(33% - 6px);
  padding: 8px 4px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.jump-buttons button.active {
  background: #e94560;
  border-color: #e94560;
}

/* 🔥 底部功能按钮 - 大字 */
.extra {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #667eea;
  color: white;
  padding: 10px 6px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
}

.progress-info {
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.progress-info p {
  margin: 0 0 5px 0;
  font-size: 12px;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffd166;
  transition: width 0.3s;
}

/* 右侧预览区 */
.preview-panel {
  flex: 1;
  background: #000;
  overflow: hidden;
}

/* 🔥 计时小按钮 */
.small {
  padding: 5px 12px;
  font-size: 13px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

/* 按钮手感 */
button {
  transition: all 0.15s ease;
  cursor: pointer;
}

button:active {
  transform: scale(0.95);
}

/* 滚动条 */
.control-panel::-webkit-scrollbar {
  width: 4px;
}

.control-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.control-panel::-webkit-scrollbar-thumb {
  background: #e94560;
  border-radius: 2px;
}
</style>