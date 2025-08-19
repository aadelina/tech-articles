const flatten = (arr) => {

    if(!Array.isArray(arr)) {
        throw new TypeError('第一个参数必须是数组');
    }
    
    let result = [...arr]

    while(result.some(item => Array.isArray(item))) {
        result = [].concat(...result)
    }

    return result
} 

module.exports = flatten;