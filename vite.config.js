import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',  // 改成 './' 使用相对路径
  plugins: [vue()]
})
