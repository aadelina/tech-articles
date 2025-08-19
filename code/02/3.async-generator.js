// 实现基于Generator的async/await
const asyncGenerator = (generatorFunc) => {
// 返回一个 Promise对象，模拟 async 的返回值
    return new Promise((resolve,reject) => {
        // 执行Generator，返回迭代器
        const generator = generatorFunc()

        // 准备递归函数，自动执行迭代器
        const step = (method,arg) => {

            let result = null
            try {
                // 执行迭代器的 next 或者 throw 方法
                result = generator[method](arg)
            } catch(error) {
                // 捕获同步代码错误，执行 reject 将错误抛出外部
                return reject(error)
            }

            const {value,done} = result

            // 若迭代器已经完成，则返回值并停止递归
            if(done) {
                return resolve(value)
            }

            // 将 yield 的结果包装成 Promise对象
            Promise.resolve(value)
            .then(
                // 成功，则把值传递给下一代
                val => step("next",val)
            ).catch(
                // 失败则捕获错误
                // Generator函数内部 没有 try/catch,使用 g.throw,则外部捕获错误
                // Generator函数内部 有 try/catch,使用 g.throw多个,则内部捕获错误一个，其他外部捕获
                error =>step("throw",error)
            )
        }
        // 开始启动迭代
        step("next")
    })
}
module.exports = asyncGenerator;