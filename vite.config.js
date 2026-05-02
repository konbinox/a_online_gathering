import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/a_online_gathering/',  // 关键！改成你的仓库名
  plugins: [vue()]
})
