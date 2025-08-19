const ajaxPromise = (options) => {
    return new Promise((resolve,reject) => {
        // 1.处理传递的参数，默认值设置
        if(!options || !options.url) {
            reject(new Error('URL is required'));
            return
        }
        const defaults = {
            method: "GET",
            data: null,
            headers: {},
            responseType: ''
        }

        const config = {...defaults,...options} 

        config.method = config.method.toUpperCase() 

        // 2. 初始化请求并设置参数
        // 创建 XMLHttpRequest 对象
        const xhr = new XMLHttpRequest()

        // 2.1 初始化请求
        let requestUrl = config.url
        // GET请求需要处理 url
        if(config.method === "GET" && config.data) {
            const params = new URLSearchParams()

            for(const key in config.data) {
                params.append(key,config.data[key])
            }
            
            requestUrl = `${config.url}${config.url.includes("?")?"&":"?"}${params.toString()}`
        }

        xhr.open(config.method.toUpperCase(),requestUrl,true)

        // 2.2 设置响应类型
        if(config.responseType) {
            xhr.responseType = config.responseType
        }
        
        // 2.3 设置请求头
        for(const key in config.headers) {
            xhr.setRequestHeader(key,config.headers[key])
        }

        // 2.4 设置超时
        if(config.timeout) {
            xhr.timeout = config.timeout
        }

        // 2.5 处理状态变化
        xhr.onreadystatechange = () => {
            // 4的状态是请求完成未成功
            if(xhr.readyState !== 4) return

            // 请求完成，清除超时定时器
            if(timeoutTimer) {
                clearTimeout(timeoutTimer)
            }
            

            // 请求成功
            if(xhr.status >= 200 && xhr.status < 300) {
                // 响应数据进行处理
                let responseData;

                if(xhr.responseType === "json") {
                    responseData = xhr.response
                } else {
                    try {
                        responseData = JSON.parse(xhr.responseText)
                    } catch (error) {
                        responseData = xhr.responseText
                    }
                }
                resolve({
                    data: responseData,
                    status: xhr.status,
                    statusText: xhr.statusText,
                    xhr: xhr
                  });

            } else {
                // 请求失败
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: xhr.response,
                    xhr: xhr,
                    error: new Error(`Request failed with status ${xhr.status}: ${xhr.statusText}`)
                });
            }

        }
        // 3.处理网络错误
        xhr.onerror = function() {
            // 清除超时定时器
            if(timeoutTimer) {
                clearTimeout(timeoutTimer)
            }
            reject({
                error: new Error('Network error occurred'),
                xhr: xhr
            });
        }

        // 4.超时处理
        let timeoutTimer;
        if(config.timeout) {
            timeoutTimer = setTimeout(() => {
                xhr.abort()
                reject({
                    error: new Error('Request timed out'),
                    xhr: xhr
                });
            },timeout)
        }

        // 5.发送请求
        try {
            // 5.1 对于不同的请求方法，POST/PUT/PATCH,需要设置请求体
            if(config.method === "POST" || config.method  === "PUT" || config.method  === "PATCH") {

                if(!config.headers['Content-Type']) {

                    config.headers['Content-Type'] = "application/json"

                    xhr.setRequestHeader("Content-Type","application/json")
                }

                const contentType = config.headers['Content-Type'] || ''

                let requestData = config.data

                if(contentType.includes("application/json") && config.data) {

                    requestData = JSON.stringify(config.data)

                } else if(contentType.includes("application/x-www-form-urlencoded") && config.data) {

                    const params = new URLSearchParams()

                    for(let key in config.data) {

                        params.append(key,config.data[key])
                    }
                    requestData = params.toString()
                }
                xhr.send(requestData)
            } else {
                // 5.2 GET请求
                xhr.send()
            }

        } catch (error) {
            // 清除超时定时器
            if(timeoutTimer) {
                clearTimeout(timeoutTimer)
            }
            reject(error)
        }
    })
}

ajaxPromise.get = (url,data,options = {}) => {
    return  ajaxPromise({...options,url,method:"GET",data})
}

ajaxPromise.post = (url,data,options = {}) => {
    return  ajaxPromise({...options,url,method:"POST",data})
}

module.exports = ajaxPromise;