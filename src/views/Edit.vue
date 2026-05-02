<template>
  <div class="edit-page">
    <div class="edit-header">
      <h1>✏️ 编辑本周内容</h1>
      <div class="actions">
        <button @click="goBack" class="back-btn">← 返回控制台</button>
        <button @click="save" class="save-btn">💾 保存</button>
        <button @click="formatJson" class="format-btn">🔧 格式化</button>
      </div>
    </div>

    <div class="edit-body">
      <div class="editor-area">
        <textarea 
          v-model="jsonText" 
          class="json-editor"
          placeholder='{
  "date": "2026-05-02",
  "flowId": "standard",
  "content": {
    "welcome": {
      "host": "主持名字",
      "leader": "负责同工",
      "instruction": "操作提示",
      "notice": ["公告1", "公告2"]
    }
  }
}'
        ></textarea>
      </div>

      <div class="preview-area">
        <h3>预览</h3>
        <div class="json-preview" v-if="parsedJson">
          <pre>{{ JSON.stringify(parsedJson, null, 2) }}</pre>
        </div>
        <div class="error" v-else>
          ⚠️ JSON 格式错误，请检查
        </div>
      </div>
    </div>

    <div class="tips">
      <h4>📖 使用说明：</h4>
      <ul>
        <li>直接修改 JSON 内容</li>
        <li>点击"格式化"可以美化代码</li>
        <li>保存后刷新主页面生效</li>
        <li>支持所有模块：welcome / worship / message / bible / announcement / giving / prayer</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const jsonText = ref('')

const parsedJson = computed(() => {
  try {
    return JSON.parse(jsonText.value)
  } catch (e) {
    return null
  }
})

onMounted(() => {
  // 从 localStorage 加载
  const saved = localStorage.getItem('weekly')
  if (saved) {
    jsonText.value = saved
  } else {
    // 默认示例
    jsonText.value = JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      flowId: "standard",
      content: {
        welcome: {
          host: "Elisa",
          leader: "Elisa",
          instruction: "7:30 准时开始",
          notice: ["请改名字加组号", "敬拜时请静音"]
        },
        worship: {
          leader: "Sheri",
          instruction: "带领敬拜，10分钟",
          songs: ["song_001", "song_002"]
        },
        message: {
          title: "跨越的人生",
          speaker: "刘彤牧师",
          leader: "刘牧师",
          instruction: "45分钟信息",
          outline: ["信心的跨越", "行动的跨越"]
        },
        bible: {
          ref: "马可福音 2:27",
          leader: "读经同工",
          instruction: "大声朗读经文"
        },
        announcement: {
          leader: "行政同工",
          instruction: "2分钟完成",
          highlight: ["🔥 本周日下午2:00 洗礼典礼"],
          normal: ["周三祷告会 晚上7:30"]
        },
        giving: {
          leader: "财务同工",
          instruction: "3分钟"
        },
        prayer: {
          leader: "祷告同工",
          instruction: "带领会众开麦祷告"
        }
      }
    }, null, 2)
  }
})

function save() {
  if (!parsedJson.value) {
    alert('JSON 格式错误，请检查后重试')
    return
  }
  localStorage.setItem('weekly', jsonText.value)
  alert('✅ 已保存！刷新主页面即可生效')
}

function formatJson() {
  if (parsedJson.value) {
    jsonText.value = JSON.stringify(parsedJson.value, null, 2)
  } else {
    alert('无法格式化：JSON 格式错误')
  }
}

function goBack() {
  router.push('/leader')
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
}

.edit-header {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.edit-header h1 {
  margin: 0;
  color: white;
}

.actions {
  display: flex;
  gap: 12px;
}

.back-btn, .save-btn, .format-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.save-btn {
  background: #e94560;
  color: white;
}

.format-btn {
  background: #667eea;
  color: white;
}

.back-btn:hover, .save-btn:hover, .format-btn:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

.edit-body {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.editor-area {
  flex: 2;
  min-width: 300px;
}

.preview-area {
  flex: 1;
  min-width: 250px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
}

.preview-area h3 {
  margin: 0 0 15px 0;
  color: white;
}

.json-editor {
  width: 100%;
  min-height: 500px;
  background: #1e1e2e;
  color: #ffd166;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
}

.json-preview {
  background: #0d0d1a;
  border-radius: 8px;
  padding: 15px;
  max-height: 500px;
  overflow: auto;
}

.json-preview pre {
  margin: 0;
  color: #aaa;
  font-size: 12px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error {
  color: #ff6b6b;
  padding: 20px;
  text-align: center;
}

.tips {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.tips h4 {
  color: #ffd166;
  margin: 0 0 10px 0;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
  color: #ccc;
}

.tips li {
  margin: 5px 0;
}
</style>