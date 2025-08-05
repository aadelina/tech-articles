// throttle.test.js
const throttle = require('../5.throttle');

// 模拟定时器
jest.useFakeTimers();

describe('节流函数测试', () => {
  let callback;
  let throttledFunc;
  let returnFunc;

  beforeEach(() => {
    // 重置模拟函数
    callback = jest.fn();
    // 创建带返回值的测试函数
    returnFunc = jest.fn((num) => {
      return num * 2;  // 返回输入值的2倍
    });

    // 清除所有定时器
    jest.clearAllTimers();
  });


  // 测试默认配置(leading=true, trailing=true)
  test('默认配置下，函数应按指定间隔执行并在最后触发一次', () => {
    throttledFunc = throttle(callback, 1000);

    // 连续触发5次，每次间隔20ms
    throttledFunc(1); // t=0
    throttledFunc(2); // t=20
    throttledFunc(3); // t=40
    throttledFunc(4); // t=60
    throttledFunc(5); // t=80

    // 第一次调用应立即执行
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1);

    // 快进到99ms，仍在第一个间隔内
    jest.advanceTimersByTime(990);
    expect(callback).toHaveBeenCalledTimes(1); // 未到间隔，不执行

    // 快进到100ms，第一个间隔结束
    jest.advanceTimersByTime(10);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(5); // 最后一次的参数
  });

  // 测试leading=false(不立即执行)
  test('leading=false时，首次调用不应立即执行', () => {
    throttledFunc = throttle(callback, 1000, { leading: false });

    throttledFunc(1); // t=0
    expect(callback).not.toHaveBeenCalled(); // 不应立即执行

    // 快进50ms，触发第二次调用
    jest.advanceTimersByTime(500);
    throttledFunc(2);

    // 快进50ms，达到间隔时间
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(2); // 应使用最后一次调用的参数
  });

  // 测试trailing=false(不执行最后一次)
  test('trailing=false时，间隔结束后不应执行最后一次', () => {
    throttledFunc = throttle(callback, 1000, { trailing: false });

    throttledFunc(1); // t=0
    expect(callback).toHaveBeenCalledTimes(1); // leading=true，立即执行

    // 快进50ms，触发第二次调用
    jest.advanceTimersByTime(500);
    throttledFunc(2);

    // 快进50ms，达到间隔时间
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1); // trailing=false，不执行
  });

  // 测试this上下文绑定
  test('节流函数应正确绑定this上下文', () => {
    const context = { value: 10 };
    function testFunc() {
      callback(this.value);
    }
    
    throttledFunc = throttle(testFunc, 1000);
    
    // 使用call绑定上下文
    throttledFunc.call(context);
    expect(callback).toHaveBeenCalledWith(10);
  });

  // 测试间隔外的调用
  test('超过间隔时间的调用应重新执行', () => {
    throttledFunc = throttle(callback, 1000);

    throttledFunc(1); // t=0
    expect(callback).toHaveBeenCalledTimes(1);

    // 快进150ms，超过间隔时间
    jest.advanceTimersByTime(1500);
    throttledFunc(2); // t=150
    expect(callback).toHaveBeenCalledTimes(2); // 应再次执行
    expect(callback).toHaveBeenCalledWith(2);
  });

  // 测试长时间连续调用
  test('长时间连续调用应按间隔规律执行', () => {
    throttledFunc = throttle(callback, 1000);

    // 每20ms调用一次，持续500ms
    for (let i = 0; i < 25; i++) {
      
      throttledFunc(i);
      jest.advanceTimersByTime(200);
    }

    //总时长5000ms，预期执行6次(0：0ms, 4：1000ms,:9：2000ms,:14：3000ms,:19：4000ms,:24：5000ms)
    expect(callback).toHaveBeenCalledTimes(6);
  });
  // 测试默认模式下的返回值
  test('默认模式下应正确返回函数执行结果', async () => {
    throttledFunc = throttle(returnFunc, 1000);

    // 第一次调用(立即执行)
    const result1 = await throttledFunc(1);
    expect(result1).toBe(2);
    expect(returnFunc).toHaveBeenCalledWith(1);

    // 快进到1000ms(节流间隔结束)
    jest.advanceTimersByTime(1000);
    const result2 = await throttledFunc(2);  // 这个调用会触发尾部执行
    expect(result2).toBe(4);  // 应返回第二次调用的结果
    expect(returnFunc).toHaveBeenCalledWith(2);
  });

  // 测试leading=false模式的返回值
  test('leading=false时应返回延迟执行的结果', async () => {
    throttledFunc = throttle(returnFunc, 1000, { leading: false });

    // 第一次调用(不会立即执行)
    const promise1 = throttledFunc(1);
    expect(returnFunc).not.toHaveBeenCalled();

    // 推进到100ms
    jest.advanceTimersByTime(1000);
    
    // 应返回第一次调用的结果
    expect(await promise1).toBe(2);
    expect(returnFunc).toHaveBeenCalledWith(1);
  });

  // 测试间隔外调用的返回值
  test('超过间隔后调用应返回新的执行结果', async () => {
    throttledFunc = throttle(returnFunc, 1000);

    // 第一次调用
    const result1 = await throttledFunc(1);
    expect(result1).toBe(2);

    // 推进150ms(超过节流间隔)
    jest.advanceTimersByTime(1500);
    
    // 新的调用应立即执行并返回新结果
    const result2 = await throttledFunc(2);
    expect(result2).toBe(4);
    expect(returnFunc).toHaveBeenCalledTimes(2);
  });

  // 测试this上下文对返回值的影响
  test('正确绑定this上下文时的返回值', async () => {
    const context = { 
      multiplier: 3,
      calculate: function(num) {
        return num * this.multiplier;
      }
    };

    throttledFunc = throttle(context.calculate, 1000);

    // 绑定上下文调用
    const result = await throttledFunc.call(context, 2);
    expect(result).toBe(6);  // 2 * 3 = 6
  });
});

