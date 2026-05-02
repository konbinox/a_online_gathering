export class FlowEngine {
  constructor(flow, content) {
    this.flow = flow.modules || []
    this.content = content || {}
    this.currentIndex = 0
  }

  current() {
    if (this.currentIndex >= this.flow.length) return null
    const module = this.flow[this.currentIndex]
    return { ...module, data: this.content[module.type] || {} }
  }

  getModuleData(type) {
    return this.content[type] || { instruction: `「${type}」模块暂无内容` }
  }

  next() {
    if (this.currentIndex < this.flow.length - 1) {
      this.currentIndex++
      return true
    }
    return false
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return true
    }
    return false
  }

  jumpTo(type) {
    const index = this.flow.findIndex(m => m.type === type)
    if (index !== -1 && index !== this.currentIndex) {
      this.currentIndex = index
      return true
    }
    return false
  }

  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.flow.length,
      percentage: ((this.currentIndex + 1) / this.flow.length) * 100
    }
  }
}