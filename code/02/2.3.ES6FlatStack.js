const flatten = (value,depth = 1) => {

    if(!Array.isArray(value)) {

        throw new TypeError('第一个参数必须是数组');

    } else if (typeof depth !== "number" || depth < 0 || Math.floor(depth) !== depth) {

        throw new TypeError("第二个参数必须是非负整数")
    }

    if(depth === 0) return value.slice()


    // 栈 先进后出
    // 为每个元素添加深度，当前深度是 0
    const stack = value.map(element => [element, 0])

    // 结果
    const result = []

    // 判断是否继续解构

    while(stack.length) {

        const [item, curDepth] = stack.pop()

        if(Array.isArray(item) && curDepth < depth) {

            stack.push(...item.map(element => [element, curDepth + 1]))

        } else {
            result.unshift(item)
        }
    }

    return result
     
}
module.exports = flatten;