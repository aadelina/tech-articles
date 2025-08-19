const asyncGenerator = require('../3.async-generator');

// 辅助函数：模拟异步操作
function delay(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

// 辅助函数：模拟失败的异步操作
function failAfter(ms, errorMessage) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
}

describe('asyncGenerator', () => {
  // 测试1：基本功能 - 执行简单的Generator函数
  test('should execute a simple generator function', async () => {
    function* simpleGenerator() {
      yield 1;
      yield 2;
      return 3;
    }

    const result = await asyncGenerator(simpleGenerator);
    expect(result).toBe(3);
  });

  // 测试2：处理同步值
  test('should handle synchronous values', async () => {
    function* syncGenerator() {
      const a = yield 10;
      const b = yield 20;
      return a + b;
    }

    const result = await asyncGenerator(syncGenerator);
    expect(result).toBe(30);
  });

  // 测试3：处理单个异步操作
  test('should handle a single asynchronous operation', async () => {
    function* asyncGeneratorFunc() {
      const result = yield delay(10, 'test');
      return result;
    }

    const result = await asyncGenerator(asyncGeneratorFunc);
    expect(result).toBe('test');
  });

  // 测试4：处理多个串行异步操作
  test('should handle multiple sequential async operations', async () => {
    function* serialAsyncGenerator() {
      const result1 = yield delay(10, 'first');
      const result2 = yield delay(10, 'second');
      const result3 = yield delay(10, 'third');
      return [result1, result2, result3];
    }

    const result = await asyncGenerator(serialAsyncGenerator);
    expect(result).toEqual(['first', 'second', 'third']);
  });

  // 测试5：处理异步操作的返回值传递
  test('should pass values between async operations', async () => {
    function* valuePassingGenerator() {
      const num1 = yield delay(10, 10);
      const num2 = yield delay(10, 20);
      return num1 + num2;
    }

    const result = await asyncGenerator(valuePassingGenerator);
    expect(result).toBe(30);
  });

  // 测试6：捕获异步操作的错误（外部捕获）
  test('should catch async errors in external catch', async () => {
    function* errorGenerator() {
      yield failAfter(10, 'Async error');
    }

    await expect(asyncGenerator(errorGenerator)).rejects.toThrow('Async error');
  });

  // 测试7：在Generator内部捕获错误
  test('should allow catching errors inside generator', async () => {
    function* errorHandlingGenerator() {
      try {
        yield failAfter(10, 'Expected error');
        return 'This should not be reached';
      } catch (error) {
        return `Caught error: ${error.message}`;
      }
    }

    const result = await asyncGenerator(errorHandlingGenerator);
    expect(result).toBe('Caught error: Expected error');
  });

  // 测试8：处理同步错误
  test('should handle synchronous errors', async () => {
    function* syncErrorGenerator() {
      yield 1;
      throw new Error('Sync error');
      yield 2; // 不会执行
    }

    await expect(asyncGenerator(syncErrorGenerator)).rejects.toThrow('Sync error');
  });

  // 测试9：错误处理后继续执行
  test('should continue execution after error handling', async () => {
    function* continueAfterErrorGenerator() {
      let result;
      
      try {
        yield failAfter(10, 'Temporary error');
      } catch (error) {
        result = error.message;
      }
      
      const recovery = yield delay(10, 'Recovered');
      return `${result}: ${recovery}`;
    }

    const result = await asyncGenerator(continueAfterErrorGenerator);
    expect(result).toBe('Temporary error: Recovered');
  });
});
