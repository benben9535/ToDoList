const { createApp, ref } = Vue;

const vm = createApp({
  data() {
    return {
      time: {}, // 時鐘物件
      addTaskContent: '', // 新增任務內容
      editTaskContent: '', // 修改任務內容
      editID: 0, // 要修改的項目編號
      actived: 'all', // 目前顯示的分類
      list:[], // 原始清單資料
      theme: 'white', // 目前使用的主題
      themeList: ['pink', 'white', 'wood', 'ocean', 'dark'], // 主題清單
      showSetting: false // 是否展開主題清單
    }
  },
  computed: {
    // 經過分類及排序後，要顯示的資料
    showList() {
      let list = []
      if (this.actived === 'all') {
        list = this.list.filter( item => {
          return true
        }).sort((itemA, itemB) => {
          if ((itemA.pin && itemB.pin)) {
            return itemA.id - itemB.id
          } else if ((itemA.pin)) {
            return -1
          } else if ((itemB.pin)) {
            return 1
          } else {
            return itemA.id - itemB.id
          }
        })
      } else if (this.actived === 'todo') {
        list = this.list.filter( item => {
          return item.done === false
        }).sort((itemA, itemB) => {
          if ((itemA.pin && itemB.pin)) {
            return itemA.id - itemB.id
          } else if ((itemA.pin)) {
            return -1
          } else if ((itemB.pin)) {
            return 1
          } else {
            return itemA.id - itemB.id
          }
        })
      } else if (this.actived === 'done') {
        list = this.list.filter( item => {
          return item.done === true
        }).sort((itemA, itemB) => {
          if ((itemA.pin && itemB.pin)) {
            return itemA.id - itemB.id
          } else if ((itemA.pin)) {
            return -1
          } else if ((itemB.pin)) {
            return 1
          } else {
            return itemA.id - itemB.id
          }
        })
      }
      return list
    },
    // 根據不同主題，變換icon顏色
    iconColor() {
      const grayIcon = ['pink', 'white', 'wood']
      const whiteIcon = ['ocean', 'dark']
      let color = ''
      if (grayIcon.includes(this.theme))color = 'gray'
      else if (whiteIcon.includes(this.theme)) color = 'white'
      return color
    }
  },
  watch: {
    // 資料或主題變動時，儲存到localStorage
    list: {
      handler: function(val) {
        localStorage.setItem('toDoList', JSON.stringify(val))
      },
      deep: true
    },
    theme(val) {
      localStorage.setItem('toDoListTheme', val)
    }
  },
  created() {
    // 設置時鐘
    this.updateDate()
    // 從localStorage取得歷史資料
    this.list = JSON.parse(localStorage.getItem('toDoList')) || []
    this.theme = localStorage.getItem('toDoListTheme') || 'white'
  },
  mounted() {
    // 解決手機版本100vh判定異常 - 用js取得瀏覽器高度後 填入CSS變數內
    const resetViewHeight = () => {
      const vh = this.getSafeAreaHeight() * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    resetViewHeight()

    // 當螢幕尺寸產生變化時 重新取得視窗高度
    window.addEventListener('resize', resetViewHeight)
  },
  methods: {
    /**
     * 取得安全區域高度，因為在iOS系統pwa模式下，全螢幕需扣除頂部邊界高度（需設置viewport-fit=cover）
     *
     * @return {Number} 安全區域高度
     */
    getSafeAreaHeight() {
      let vh = window.innerHeight
      const div = document.createElement('div')
      if (CSS.supports('top: env(safe-area-inset-top)')) {
        div.style.top = 'env(safe-area-inset-top)'
      } else if (CSS.supports('top: constant(safe-area-inset-top)')) {
        div.style.top = 'constant(safe-area-inset-top)'
      }
      if (div.style.top) {
        document.body.appendChild(div)
        const insetTop = parseInt(getComputedStyle(div).top)
        document.body.removeChild(div)
        vh -= insetTop
      }
    
      return vh
    },
    /**
     * 更新日期/時間
     */
    updateDate() {
      const now = new Date()
      const monthArr = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
      this.time = {
        year: now.getFullYear(),
        month: monthArr[now.getMonth()],
        day: now.getDate() < 10 ? '0' + now.getDate() : now.getDate(),
        hour: now.getHours() < 10 ? '0' + now.getHours() : now.getHours(),
        minute: now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
      }
      setTimeout(this.updateDate, 1000)
    },
    /**
     * 新增項目，點擊按鈕時的動畫
     */
    addTask() {
      document.getElementById('addBtn').classList.add('add-btn-active')
      setTimeout(() => {
        document.getElementById('addBtn').classList.remove('add-btn-active')
      }, 100)
      if (!this.addTaskContent) return
      this.list.push({
        id: +new Date(),
        content: this.addTaskContent,
        done: false,
        pin: false
      })
      this.addTaskContent = ''
    },
    /**
     * 編輯項目
     * 
     * @param {Number} id 項目編號
     * @param {String} content 項目內容
     */
     editTask(id, content) {
      this.editID = id
      this.editTaskContent = content
      this.$nextTick(() => {
        document.getElementById(`${id}`).focus()
      })
    },
    /**
     * 完成編輯
     * 
     * @param {Object} item 項目
     */
    finishEditing(item) {
      if (this.editTaskContent) {
        item.content = this.editTaskContent
      }
      this.editID = 0
      this.editTaskContent = ''
    },
    /**
     * 刪除項目
     * 
     * @param {Number} id 項目編號
     */
    deleteTask(id) {
      const index = this.list.findIndex(item => { return item.id === id })
      this.list.splice(index, 1)
    },
    /**
     * 置頂/取消置頂項目
     * 
     * @param {Object} item 項目
     */
    pinTask(item) {
      item.pin = !item.pin
    },
    /**
     * 勾選/取消勾選項目
     * 
     * @param {Object} item 項目
     */
     checkTask(item) {
      item.done = !item.done
    }
  }
});

vm.mount('#app');