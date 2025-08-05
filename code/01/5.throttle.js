const throttle = (func, limit,options = { leading: true, trailing: true }) => {

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
    }
    
    let lastExcuted = 0;
    let timeoutId;
    if(!limit || limit < 1000){ limit = 1000; } // 最小限制为1000毫秒
    const { leading = true, trailing = true } = options

    return function(...args) {
      return new Promise((resolve, reject) => { 
        let result;
        //首次不执行
        if(!lastExcuted && !leading) {
            lastExcuted = Date.now();;
        }

        const wait = limit - (Date.now() - lastExcuted);

        if (wait <= 0) {
          if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null
          }
          
          result = func.apply(this, args);
          resolve(result);
          lastExcuted = Date.now();
            
        } else if (trailing ) {
            // 如果设置了trailing，使用setTimeout来延迟执行
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
              result = func.apply(this, args);
              resolve(result);
              lastExcuted = Date.now();
              timeoutId = null
            }, wait);
        }
      })
    }
}

// let throttledFunc = throttle((num) => num * 2, 1000);
// let i = 0
// let timer = setInterval(async () => {
//   if(i > 3) {
//     clearInterval(timer)
//     timer = null
//     return
//   }
//   console.log(await throttledFunc(i++)) 
// }, 300);

module.exports = throttle;

