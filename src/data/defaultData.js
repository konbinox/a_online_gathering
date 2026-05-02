// 默认流程
export const DEFAULT_FLOW = {
  id: "standard",
  name: "标准主日流程",
  modules: [
    { type: "welcome" },
    { type: "worship" },
    { type: "message" },
    { type: "bible" },
    { type: "announcement" },
    { type: "giving" },
    { type: "prayer" }
  ]
}

// 默认周数据
export const DEFAULT_WEEKLY = {
  date: new Date().toISOString().split('T')[0],
  flowId: "standard",
  content: {
    welcome: {
      host: "欢迎你",
      leader: "主持同工",
      instruction: "欢迎参加主日崇拜，请安静默祷",
      notice: ["请将名字改为真实姓名", "聚会期间保持安静", "请打开视频"]
    },
    worship: {
      leader: "敬拜同工",
      instruction: "带领会众进入敬拜，约15分钟",
      songs: ["诗篇23篇", "祢的爱不离不弃"],
      lyrics: {
        "诗篇23篇": ["耶和华是我的牧者", "我必不致缺乏", "祂使我躺卧在青草地上", "领我在可安歇的水边"],
        "祢的爱不离不弃": ["祢的爱不离不弃", "永远在我心里", "我要一生跟随祢", "祢是我的一切"]
      }
    },
    message: {
      title: "神的恩典够你用",
      speaker: "牧师",
      leader: "牧师",
      instruction: "45分钟信息分享",
      outline: ["恩典的意义", "恩典的实践", "恩典的见证"]
    },
    bible: {
      ref: "哥林多后书 12:9",
      leader: "读经同工",
      instruction: "请大声朗读经文",
      text: "祂对我说：我的恩典够你用的，因为我的能力是在人的软弱上显得完全。"
    },
    announcement: {
      leader: "报告同工",
      instruction: "2分钟报告家事",
      highlight: ["🔥 欢迎新朋友", "🔥 下周日洗礼"],
      normal: ["周三祷告会 7:30pm", "周五小组聚会 7:30pm"]
    },
    giving: {
      leader: "财务同工",
      instruction: "奉献环节，3分钟"
    },
    prayer: {
      leader: "祷告同工",
      instruction: "带领会众同心祷告"
    }
  }
}