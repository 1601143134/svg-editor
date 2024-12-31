export class eventBus {
  constructor() {
    this.eventList = {}
  }

  $on(event, callback) {
    if (!this.eventList[event]) {
      this.eventList[event] = []
    }
    this.eventList[event].push(callback)
  }

  $emit(event, ...args) {
    if (!this.eventList[event]) return;
    
    // 遍历订阅者数组，调用每个订阅者的回调函数
    this.eventList[event].forEach((callback) => {
      callback(args)
    });
  }

  $off(event, callback) {
    if (!this.eventList[event]) return;
    
    // 找到要删除的回调函数并从数组中删除
    const index = this.eventList[event].findIndex((cb) => cb === callback);
    if (index!== -1) {
      this.eventList[event].splice(index, 1);
    }
  }
}