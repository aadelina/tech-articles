const flatten = (value,depth = 1) => {

    if(!Array.isArray(value)) {

        throw new TypeError('第一个参数必须是数组');

    } else if (typeof depth !== "number" || depth < 0 || Math.floor(depth) !== depth) {

        throw new TypeError("第二个参数必须是非负整数")
    }

    if(depth === 0) return value


    const flated = (element,curDepth) => {

        if(curDepth >= depth) return element

        return element.reduce((acl,curVal) => {

            if(Array.isArray(curVal)) {
               return acl.concat(flated(curVal,curDepth + 1))
            } else {
               return acl.concat(curVal)
            }
        },[])
    }

    return flated(value, 0)
     
}

module.exports = flatten;