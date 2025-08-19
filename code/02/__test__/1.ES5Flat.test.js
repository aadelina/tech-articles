const flatten = require('../2.1.ES6FlatReduce'); 

describe('数组扁平化函数测试', () => {
  // 基础功能测试
  test('不指定深度时默认展开1层', () => {
    const arr = [1, [2, 3], [4, [5]]];
    expect(flatten(arr)).toEqual([1, 2, 3, 4, [5]]);
  });

  test('指定深度为1时展开1层', () => {
    const arr = [1, [2, [3]], 4];
    expect(flatten(arr, 1)).toEqual([1, 2, [3], 4]);
  }); 

  test('指定深度为2时展开2层', () => {
    const arr = [1, [2, [3, [4]]], 5];
    expect(flatten(arr, 2)).toEqual([1, 2, 3, [4], 5]);
  });

  // 边界情况测试
  test('深度为0时不展开任何层级', () => {
    const arr = [1, [2, [3]]];
    expect(flatten(arr, 0)).toEqual([1, [2, [3]]]);
  });

  test('深度大于实际嵌套层级时完全展开', () => {
    const arr = [1, [2, [3]]];
    expect(flatten(arr, 10)).toEqual([1, 2, 3]);
  });

  // 特殊数组测试
  test('空数组返回空数组', () => {
    expect(flatten([])).toEqual([]);
  });

  test('非嵌套数组不变化', () => {
    const arr = [1, 2, 3];
    expect(flatten(arr, 5)).toEqual([1, 2, 3]);
  });

  test('包含空数组的情况', () => {
    const arr = [1, [], [2, [[]]], 3];
    expect(flatten(arr, 2)).toEqual([1, 2, [], 3]);
  });

  // 包含不同类型元素的数组
  test('包含多种数据类型的数组', () => {
    const arr = [
      'a',
      [1, true],
      [null, [undefined, { key: 'value' }]]
    ];
    expect(flatten(arr, 2)).toEqual([
      'a', 1, true, null, undefined, { key: 'value' }
    ]);
  });

  // 异常处理测试
  test('非数组参数抛出错误', () => {
    expect(() => flatten('not an array')).toThrow(TypeError);
  });

  test('非数字深度参数抛出错误', () => {
    expect(() => flatten([1, 2], 'deep')).toThrow(TypeError);
  });

  test('负数深度参数抛出错误', () => {
    expect(() => flatten([1, 2], -1)).toThrow(TypeError);
  });
});
    