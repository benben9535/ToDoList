const { createApp, ref } = Vue;
const vm = createApp({
  data() {
    return {
      time: {},
      actived: 'all'
    }
  },
  mounted() {
    this.updateDate()
  },
  methods: {
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
      setInterval(this.updateDate, 1000 * 60)
    }
  }
});

vm.mount('#app');