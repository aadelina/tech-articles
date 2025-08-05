const debounce = (func,delay,immediate) => {

    let timeoutId;

    const debounced =  function(...args) {
        
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if(immediate) {
            func.apply(this,args);
            immediate = false; // 立即执行后，设置为false
            return;
        }

        timeoutId = setTimeout(() => {
            func.apply(this,args);
        }, delay);      
    }

    debounced.cancel = () => {
        if(timeoutId) {
            clearTimeout(timeoutId);
        }
    }

    return debounced
}


module.exports = debounce;



