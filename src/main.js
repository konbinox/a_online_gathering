import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import LeaderPanel from './views/LeaderPanel.vue'
import Viewer from './views/Viewer.vue'
import Edit from './views/Edit.vue'

const routes = [
  { path: '/', redirect: '/leader' },
  { path: '/leader', component: LeaderPanel },
  { path: '/viewer', component: Viewer },
  { path: '/edit', component: Edit }
]

const router = createRouter({
  history: createWebHashHistory(),  // Hash 模式
  routes
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')