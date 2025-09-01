class EventLoop{
  
  // 定义调用栈、微任务、宏任务、执行状态
  constructor() {
    // 调用栈 - 执行同步代码
    this.callStack = this.createObservableArray('调用栈');

    // 微任务 - 存放 Promsie.then的回调、queueMicrotask的回调等
    this.microQueue = []

    // 宏任务 - 存放 setTimeout的回调等
    this.macroQueue = []

    // 是否 正在执行中
    this.running = false
  }

  // 执行同步代码
  executeSyncCode(name,func) {

    console.log(`\n执行同步代码: ${name}`);

    this.callStack.push(name)

    func(this)

    this.callStack.pop()

    console.log(`完成同步代码: ${name}`);

    // 同步代码执行完毕后，处理事件循环
    this.processEventLoop()
 
  }

  // 添加微任务
  pushMicroTask(name,func) {
    this.microQueue.push({name,func})
  }

  // 添加宏任务
  pushMacroTask(name,func) {
    this.macroQueue.push({name,func})
  }

  // 执行事件循环
  processEventLoop() {

    if(this.running) return

    this.running = true
    console.log("\n=== 开始事件循环 ===");

    // 处理所有微任务
    while(this.microQueue.length) {

      const microTask = this.microQueue.shift()

      // 压入调用栈
      this.callStack.push(microTask.name)

      // 执行
      microTask.func(this)

      // 弹出调用栈
      this.callStack.pop()
    }

    // 处理一个宏任务
    if(this.macroQueue.length) {

      const macroTask = this.macroQueue.shift() 

      // 压入调用栈
      this.callStack.push(macroTask.name)

      // 执行
      macroTask.func(this)

      // 弹出调用栈
      this.callStack.pop()

      // 一个宏任务执行完后可能产生新的微任务，需要再次处理或者需要继续执行下一个宏任务
      this.running = false

      this.processEventLoop()

    } else {

      console.log("\n=== 事件循环结束 ===");
      this.running  = false

    }

  }

  // 创建可观察的数组，使用Proxy监听变化
  createObservableArray(name) {
    const array = [];
    
    // 保存原始的push和pop方法
    const originalPush = array.push;
    const originalPop = array.pop;
    
    return new Proxy(array, {
      // 监听属性访问
      get(target, prop, receiver) {
        // 对于push和pop方法，我们需要重写
        if (prop === 'push') {
          return function(...args) {
            console.log(`\n[${name}变化] 准备添加元素:`, args);
            const result = originalPush.apply(target, args);
            console.log(`[${name}变化] 添加后:`, [...target]);
            return result;
          };
        }
        
        if (prop === 'pop') {
          return function() {
            console.log(`\n[${name}变化] 准备移除元素`);
            const popped = originalPop.apply(target);
            console.log(`[${name}变化] 移除了: ${popped}, 剩余:`, [...target]);
            return popped;
          };
        }
        
        // 其他属性和方法正常访问
        return Reflect.get(target, prop, receiver);
      },
      
      // 监听属性设置
      set(target, prop, value, receiver) {
        // 处理直接设置索引的情况，如array[0] = 'value'
        if (!isNaN(Number(prop))) {
          console.log(`\n[${name}变化] 设置索引${prop}为:`, value);
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }
}

 // 测试事件循环
 function testEventLoop() {
    
  const eventLoop = new EventLoop();
  
  // 执行主脚本（同步代码）
  eventLoop.executeSyncCode("主脚本", (el) => {

    // 主脚本中创建一个Promise（微任务）
    el.pushMicroTask("Promise.then 1", (el) => {
      console.log("执行第一个Promise的回调");
      // 在微任务中创建另一个微任务
      el.pushMicroTask("Promise.then 2", () => {
        console.log("执行第二个Promise的回调");
      });
      // 在微任务中创建一个宏任务
      el.pushMacroTask("setTimeout 2", () => {
        console.log("执行第二个setTimeout的回调");
      });
    });
    
    // 主脚本中创建一个setTimeout（宏任务）
    el.pushMacroTask("setTimeout 1", (el) => {
      console.log("执行第一个setTimeout的回调");
      // 在宏任务中创建一个微任务
      el.pushMicroTask("Promise.then 3", () => {
        console.log("执行第三个Promise的回调");
      });
    });
    
    // 主脚本中的同步代码
    console.log("这是主脚本中的同步代码");
  });
}

// 运行测试
testEventLoop();