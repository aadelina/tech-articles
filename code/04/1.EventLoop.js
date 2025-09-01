class EventLoop {

    constructor() {
      // 调用栈 - 执行同步代码
      this.callStack = [];
      // 微任务队列 - Promise.then, pushMicroTask等
      this.microTasks = [];
      // 宏任务队列 - setTimeout, setInterval, I/O等
      this.macroTasks = [];
      // 当前是否正在执行
      this.running = false;
    }
  
    // 执行同步代码
    executeSyncCode(name, func) {

      console.log(`\n执行同步代码: ${name}`);

      this.callStack.push(name);

      // 执行函数，可能会产生新的任务
      func(this);
      
      this.callStack.pop();

      console.log(`完成同步代码: ${name}`);

      // 同步代码执行完毕后，处理事件循环
      this.processEventLoop();
    }
  
    // 添加微任务
    pushMicroTask(name, func) {

      this.microTasks.push({ name, func });
    
    }
  
    // 添加宏任务
    pushMacroTask(name, func, delay = 0) {
      // 模拟延迟，实际浏览器中会有定时器线程管理
      this.macroTasks.push({ name, func, delay });
    }
  
    // 处理事件循环
    processEventLoop() {

      if (this.running) return;
      
      this.running = true;

      console.log("\n=== 开始事件循环 ===");
      
      // 处理所有微任务
      while (this.microTasks.length > 0) {

        const microTask = this.microTasks.shift();

        console.log(`\n处理微任务: ${microTask.name}`);
        
        // 进入调用栈
        this.callStack.push(microTask.name);

        // 执行
        microTask.func(this);
        
        // 弹出调用栈
        this.callStack.pop();

        console.log(`完成微任务: ${microTask.name}`);

      }
      
      // 处理一个宏任务
      if (this.macroTasks.length > 0) {
        // 这里不考虑延迟，实际应按延迟排序
        const macroTask = this.macroTasks.shift();

        console.log(`\n处理宏任务: ${macroTask.name}`);
        
        // 进入调用栈
        this.callStack.push(macroTask.name);

        // 执行
        macroTask.func(this);
        
        // 弹出调用栈
        this.callStack.pop();

        console.log(`完成宏任务: ${macroTask.name}`);

        // 一个宏任务执行完后可能产生新的微任务，需要再次处理或者需要继续执行下一个宏任务
        this.running = false;

        this.processEventLoop();

      } else {

        console.log("\n=== 事件循环结束 ===");

        this.running = false;
      }
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
  