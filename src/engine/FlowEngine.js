export class FlowEngine {
  constructor(flow, content) {
    this.flow = flow.modules || []
    this.content = content || {}
    this.currentIndex = 0
    this.history = []
  }

  current() {
    if (this.currentIndex >= this.flow.length) return null
    const module = this.flow[this.currentIndex]
    return {
      ...module,
      data: this.getModuleData(module.type)
    }
  }

  getModuleData(type) {
    // 优先返回 weekly 中的数据
    if (this.content[type]) {
      return this.content[type]
    }
    // 没有数据时返回占位符
    return {
      empty: true,
      leader: '待指定',
      instruction: `「${type}」模块暂无内容，请在 weekly 数据中添加`,
      placeholder: true
    }
  }

  next() {
    if (this.currentIndex < this.flow.length - 1) {
      this.history.push(this.currentIndex)
      this.currentIndex++
      return true
    }
    return false
  }

  prev() {
    if (this.currentIndex > 0) {
      this.history.push(this.currentIndex)
      this.currentIndex--
      return true
    }
    return false
  }

  jumpTo(type) {
    const index = this.flow.findIndex(m => m.type === type)
    if (index !== -1 && index !== this.currentIndex) {
      this.history.push(this.currentIndex)
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

  reset() {
    this.currentIndex = 0
    this.history = []
  }
}