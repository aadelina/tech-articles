const ajax = require('../4.ajaxPromise');
// 模拟XMLHttpRequest
class MockXHR {

  // 静态属性用于保存实例引用
  static instance;

  constructor() {
    // 创建实例时保存到静态属性
    MockXHR.instance = this;

    this.method = null;
    this.url = null;
    this.async = true;
    this.headers = {};
    this.responseType = '';
    this.status = 0;
    this.statusText = 'OK';
    this.response = null;
    this.responseText = '';
    this.readyState = 0;
    this.onreadystatechange = null;
    this.onerror = null;
    this.ontimeout = null;
  }

  open(method, url, async) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = 1;
  }

  setRequestHeader(key, value) {
    this.headers[key] = value;
  }

  send(data) {
    this.sendData = data;
    // 模拟异步完成
    setTimeout(() => {
      this.readyState = 4;
      if (this.onreadystatechange) {
        this.onreadystatechange();
      }
    }, 0);
  }

  // 辅助方法，用于测试控制响应
  setResponse(status, response, responseType = 'text') {
    this.status = status;
    this.responseType = responseType;
    this.response = response;
    this.responseText = typeof response === 'string' ? response : JSON.stringify(response);
  }
}

// 替换全局XMLHttpRequest
beforeEach(() => {
  global.XMLHttpRequest = MockXHR;
  MockXHR.instance = null;
});

describe('ajax', () => {
    it('应该处理网络错误', async () => {
        // 发送请求
        const promise = ajax({
          url: 'https://api.example.com/network-error',
          method: 'GET'
        });
        
        // 获取XHR实例并触发错误
        const xhr =  MockXHR.instance;
        
        // 模拟网络错误
        setTimeout(() => {
            if (xhr.onerror) {
                xhr.onerror();
            }
        }, 0);
        
        // 验证错误
        await expect(promise).rejects.toHaveProperty('error');
        await expect(promise).rejects.toMatchObject({
          error: expect.any(Error)
        });
      });
  it('应该发送GET请求并成功返回', async () => {
    const mockResponse = { data: 'test' };
    
    // 发送请求
    const promise = ajax({
      url: 'https://api.example.com/test',
      method: 'GET'
    });
    
    // 获取最后创建的XHR实例并设置响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(200, mockResponse);
    
    // 等待Promise完成
    const result = await promise;
    
    // 验证结果
    expect(result.data).toEqual(mockResponse);
    expect(result.status).toBe(200);
    expect(xhr.method).toBe('GET');
    expect(xhr.url).toBe('https://api.example.com/test');
  });

  it('应该发送POST请求并成功返回', async () => {
    const postData = { name: 'test' };
    const mockResponse = { success: true };
    
    // 发送请求
    const promise = ajax({
      url: 'https://api.example.com/submit',
      method: 'POST',
      data: postData
    });
    
    // 获取XHR实例并设置响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(201, mockResponse);
    
    // 等待结果
    const result = await promise;
    
    // 验证
    expect(result.data).toEqual(mockResponse);
    expect(result.status).toBe(201);
    expect(xhr.method).toBe('POST');
    expect(xhr.sendData).toBe(JSON.stringify(postData));
    expect(xhr.headers['Content-Type']).toBe('application/json');
  });

  it('应该处理请求错误', async () => {
    const errorMessage = 'Not Found';
    
    // 发送请求
    const promise = ajax({
      url: 'https://api.example.com/error',
      method: 'GET'
    });
    
    // 获取XHR实例并设置错误响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(404, errorMessage);
    
    // 验证错误
    await expect(promise).rejects.toHaveProperty('status', 404);
    await expect(promise).rejects.toHaveProperty('response', errorMessage);
  });

  

  it('应该处理GET请求的查询参数', async () => {
    const queryParams = { id: 123, name: 'test' };
    
    // 发送请求
    const promise = ajax({
      url: 'https://api.example.com/data',
      method: 'GET',
      data: queryParams
    });
    
    // 获取XHR实例并设置响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(200, { success: true });
    
    // 等待结果
    await promise;
    
    // 验证URL包含查询参数
    expect(xhr.url).toBe('https://api.example.com/data?id=123&name=test');
  });

  it('应该支持便捷的get方法', async () => {
    // 使用便捷方法发送请求
    const promise = ajax.get('https://api.example.com/get-test', { param: 'value' });
    
    // 获取XHR实例并设置响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(200, { result: 'success' });
    
    // 验证
    const result = await promise;
    expect(xhr.method).toBe('GET');
    expect(result.data).toEqual({ result: 'success' });
  });

  it('应该支持便捷的post方法', async () => {
    // 使用便捷方法发送请求
    const promise = ajax.post('https://api.example.com/post-test', { data: 'value' });
    
    // 获取XHR实例并设置响应
    const xhr =  MockXHR.instance;
    xhr.setResponse(200, { result: 'success' });
    
    // 验证
    const result = await promise;
    expect(xhr.method).toBe('POST');
    expect(result.data).toEqual({ result: 'success' });
  });

  it('应该正确解析JSON响应', async () => {
    const jsonResponse = { name: 'test', value: 123 };
    
    // 发送请求
    const promise = ajax({
      url: 'https://api.example.com/json',
      method: 'GET'
    });
    
    // 获取XHR实例并设置响应，模拟Content-Type为JSON
    const xhr =  MockXHR.instance;
    xhr.getResponseHeader = jest.fn(() => 'application/json');
    xhr.setResponse(200, jsonResponse);
    
    // 等待结果
    const result = await promise;
    
    // 验证JSON被正确解析
    expect(result.data).toEqual(jsonResponse);
    expect(typeof result.data).toBe('object');
  });
});
    