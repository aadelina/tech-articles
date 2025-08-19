function flatten (value,depth) {

    depth = depth === undefined?1:depth

    if(!Array.isArray(value)) {

        throw new TypeError('第一个参数必须是数组');

    } else if (typeof depth !== "number" || depth < 0 || Math.floor(depth) !== depth) {

        throw new TypeError("第二个参数必须是非负整数")
    }

    //如果 depth 是 0，则返回对原数组进行浅拷贝的新数组
    if(depth === 0) return value.slice()

    const arr = []

    function flated (element,curDepth) {

        if(curDepth > depth) {
            arr.push(element)
            return arr
        }

        if(Array.isArray(element)) {
            element.forEach(item => {
                flated(item, curDepth + 1)
            })
        } else {
            arr.push(element)
        }

    }

    flated(value,0)
    return arr
}

module.exports = flatten;