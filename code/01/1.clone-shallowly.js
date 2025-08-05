const _ = require("lodash")

// 手动实现浅克隆
// 实现一个函数，能够对对象或数组进行浅克隆操作
// 实现要求
// ● 只拷贝对象或数组的第一层内容
// ● 不处理嵌套对象的深层拷贝
// ● 支持对象和数组两种数据类型
// ● 保持原始数据类型不变
// 挑战测试
// ● const obj = {a: 1, b: {c: 2}}; 浅克隆后修改b.c应影响原对象
// ● const arr = [1, [2, 3]]; 浅克隆后修改嵌套数组应该影响原数组

// 思路
/**
 * @params：value(数组或者对象)
 * @return：新拷贝的 value
 * 1.判断是数组还是对象，不同的类型不同的遍历方式，准备不同的容器
 */

// const cloneShallowly = (value) => {

//     if(!(value instanceof Object)) return 

//     if(Array.isArray(value)){
//         return [...value]
//     } else {
//         return {...value}
//     }
// }

// const cloneShallowly = (o) => {
//     //数据类型判断
//     if(!(o instanceof Object)) return 

//     if(Array.isArray(o)){
//         return o.slice()
//     } else {
//         return Object.assign({},o)
//     }
// }

const cloneShallowly = (o) => {
    //数据类型判断
    if(!(o instanceof Object)) return 

     const res = Array.isArray(o)?[]:{}

     for(const [key,value] of Object.entries(o)){
        res[key] = value
    }

    return res
    
}
const obj = {a: 1, b: {c: 2}}
const newObj = cloneShallowly(obj)
newObj.b.c = 3
//改变newObj中的 b 属性，原 obj 中的 b 属性也会被改变
console.log(newObj,obj) //{a: 1, b: {c: 3}} {a: 1, b: {c: 3}}


const arr = [1, [2, 3]] 
const newArr = cloneShallowly(arr)
newArr[1][0] = 4
//改变 newArr 中的嵌套数组的值，原 arr的嵌套数组也会发生改变
console.log(newArr,arr) //[1, [4, 3]]  [1, [4, 3]] 




