//事件总线
class EventBus {

    constructor() {
        this.events = {}
    }

    // 添加事件
    _add(event,callback,isOnce) {
        if(!this.events[event]) {
            this.events[event] = []
        } 
        this.events[event].push({callback,isOnce}) 
    }

    // 事件注册
    on (event,callback) {
        this._add(event,callback,false)
    }
    // 一次性事件监听
    once (event,callback) {
        this._add(event,callback,true)
    }

    // 事件触发
    emit(event,...data) {
        if(!this.events[event]) return 

        // 创建副本，防止在删除元素过程中产生异常
        const listeners = [...this.events[event]]

        listeners.forEach(({callback,isOnce},index) => {
            
            callback(...data)  
            
            if(isOnce){
                this.events[event] = this.events[event].filter((_,i) => !(i === index && this.events[event][i].isOnce))
            }
        })
    }

    // 事件移除
    off(event,callback) {
        if(!this.events[event]) return 
        this.events[event] = this.events[event].filter((item,index)=> item.callback!==callback)
    }
}

module.exports = EventBus
