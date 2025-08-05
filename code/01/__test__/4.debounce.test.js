// debounce.test.js
const debounce = require('../4.debounce');

// Jest内置的定时器模拟
jest.useFakeTimers();

describe('debounce 防抖函数', () => {
  let mockFunc; // 用于测试的模拟函数

  beforeEach(() => {
    // 重置模拟函数
    mockFunc = jest.fn();
  });

  afterEach(() => {
    // 清除所有定时器
    jest.clearAllTimers();
  });

  test('延迟时间内多次调用，只执行最后一次', () => {
    const debouncedFunc = debounce(mockFunc, 100);

    // 连续调用3次
    debouncedFunc('第一次');
    debouncedFunc('第二次');
    debouncedFunc('第三次');

    // 此时定时器未触发，函数不应执行
    expect(mockFunc).not.toHaveBeenCalled();

    // 快进时间到100ms（刚好触发定时器）
    jest.advanceTimersByTime(100);

    // 验证只执行了最后一次调用
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('第三次');
  });

  test('两次调用间隔超过延迟时间，都会执行', () => {
    const debouncedFunc = debounce(mockFunc, 100);

    // 第一次调用
    debouncedFunc('第一次');
    // 快进150ms（超过延迟时间，触发第一次执行）
    jest.advanceTimersByTime(150);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('第一次');

    // 第二次调用（与第一次间隔超过100ms）
    debouncedFunc('第二次');
    // 再快进100ms
    jest.advanceTimersByTime(100);
    expect(mockFunc).toHaveBeenCalledTimes(2);
    expect(mockFunc).toHaveBeenCalledWith('第二次');
  });

  test('延迟时间准确', () => {
    const delay = 200;
    const debouncedFunc = debounce(mockFunc, delay);

    debouncedFunc();
    // 快进199ms（未到延迟时间）
    jest.advanceTimersByTime(199);
    expect(mockFunc).not.toHaveBeenCalled();

    // 再快进1ms（总时间200ms）
    jest.advanceTimersByTime(1);
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  test('能正确传递参数和this指向', () => {
    const context = { name: '测试对象' };
    const debouncedFunc = debounce(function(arg1, arg2) {
      expect(this).toBe(context); // 验证this指向
      expect(arg1).toBe('参数1');
      expect(arg2).toBe('参数2');
    }, 100);

    // 绑定上下文并传参
    debouncedFunc.call(context, '参数1', '参数2');
    jest.advanceTimersByTime(100);
  });

  test('立即执行函数，第一次调用立即执行', () => {
    const debouncedFunc = debounce(mockFunc, 100, true);

    // 第一次调用
    debouncedFunc('第一次');
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('第一次');

    // 第二次调用
    debouncedFunc('第二次');
    // 再快进100ms
    jest.advanceTimersByTime(100);

    expect(mockFunc).toHaveBeenCalledTimes(2);
    expect(mockFunc).toHaveBeenCalledWith('第二次');
  });

  test('取消函数，函数不在执行', () => {

    const debouncedFunc = debounce(mockFunc, 100);

    // 第一次调用
    debouncedFunc('第一次');
    // 取消防抖函数
    debouncedFunc.cancel();
    // 再快进100ms
    jest.advanceTimersByTime(100);

    expect(mockFunc).not.toHaveBeenCalled();

  });
});


