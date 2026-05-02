import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/a_online_gathering/',  // 保持这个
  plugins: [vue()]
})
