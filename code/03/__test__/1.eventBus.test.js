const EventBus = require('../2.event_bus');

describe('EventBus 发布订阅模式测试', () => {
  let eventBus;
  
  // 每个测试前创建新的EventBus实例，避免测试间相互影响
  beforeEach(() => {
    eventBus = new EventBus();
  });

  test('应该能订阅并发布事件', () => {
    const callback = jest.fn();
    
    // 订阅事件
    eventBus.on('test-event', callback);
    
    // 发布事件
    eventBus.emit('test-event', 'hello', 'world');
    
    // 验证回调被调用且参数正确
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('hello', 'world');
  });

  test('一次性订阅应该只触发一次', () => {
    const onceCallback = jest.fn();
    
    // 一次性订阅
    eventBus.once('once-event', onceCallback);
    
    // 第一次发布
    eventBus.emit('once-event', 'first');
    // 第二次发布
    eventBus.emit('once-event', 'second');
    
    // 验证只被调用一次，且收到第一次的参数
    expect(onceCallback).toHaveBeenCalledTimes(1);
    expect(onceCallback).toHaveBeenCalledWith('first');
  });

  test('应该能取消订阅', () => {
    const callback = jest.fn();
    
    // 订阅事件
    eventBus.on('cancel-event', callback);
    // 取消订阅
    eventBus.off('cancel-event', callback);
    
    // 发布事件
    eventBus.emit('cancel-event', 'should not trigger');
    
    // 验证回调未被调用
    expect(callback).not.toHaveBeenCalled();
  });

  test('发布未被订阅的事件应该无副作用', () => {
    // 测试发布未订阅的事件不会报错
    expect(() => {
      eventBus.emit('unsubscribed-event', 'test');
    }).not.toThrow();
  });

  test('多个订阅者应该都能收到事件', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    eventBus.on('multi-subscribers', callback1);
    eventBus.on('multi-subscribers', callback2);
    
    eventBus.emit('multi-subscribers', 'shared data');
    
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith('shared data');
    expect(callback2).toHaveBeenCalledWith('shared data');
  });
});
    