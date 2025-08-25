class Subject {
    constructor() {
        this.state = null
        this.observers = []
    }
    // 添加观察者
    add(observer) {
        this.observers.push(observer)
    }
    // 移除观察者
    remove(removeObserver) {
        this.observers = this.observers.filter(item => removeObserver !== item)
    }
    // 通知观察者
    notify() {
        this.observers.forEach(item => {
            item.update(this.state)
        })
    }
    // 更新状态并通知观察者
    setState(state) {
        this.state = state
        this.notify()
    }
}

class Observer {

    constructor(name) {
        this.name = name
    }

    update(...args) {
        console.log(`${this.name}观察者状态更新成： ${args}`)
    }
    
}
const sub = new Subject()

const obsA = new Observer("观察者A")
const obsB = new Observer("观察者B")
const obsC = new Observer("观察者C")

// 注册
sub.add(obsA)
sub.add(obsB)
sub.add(obsC)

// 移除 B
sub.remove(obsB)
// 更新状态
sub.setState("我饿了")