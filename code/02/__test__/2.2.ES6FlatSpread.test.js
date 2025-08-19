const flatten = require('../2.2.ES6FlatSpread'); 

describe('数组扁平化函数测试', () => {
  // 基础功能测试
  test('深度大于实际嵌套层级时完全展开', () => {
    const arr = [1, [2, [3]]];
    expect(flatten(arr)).toEqual([1, 2, 3]);
  });

  // 特殊数组测试
  test('空数组返回空数组', () => {
    expect(flatten([])).toEqual([]);
  });

  test('非嵌套数组不变化', () => {
    const arr = [1, 2, 3];
    expect(flatten(arr)).toEqual([1, 2, 3]);
  });

  test('包含空数组的情况', () => {
    const arr = [1, [], [2, [[]]], 3];
    expect(flatten(arr)).toEqual([1, 2, 3]);
  });

  // 包含不同类型元素的数组
  test('包含多种数据类型的数组', () => {
    const arr = [
      'a',
      [1, true],
      [null, [undefined, { key: 'value' }]]
    ];
    expect(flatten(arr)).toEqual([
      'a', 1, true, null, undefined, { key: 'value' }
    ]);
  });

  // 异常处理测试
  test('非数组参数抛出错误', () => {
    expect(() => flatten('not an array')).toThrow(TypeError);
  });
});
    