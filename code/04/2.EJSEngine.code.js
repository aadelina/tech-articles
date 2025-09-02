class EJSEngine {
    // 定义缓存和需要匹配的正则
    constructor() {
        // 对编译过的模板函数进行缓存提高性能
        this.cache = new Map()

        // 需要分别匹配独立的 <%= ... %> 标签，所以使用非贪婪匹配 *？;\s\S 指的是匹配所有字符空白字符和非空白字符
        // 四个分支，三个捕获组（前三个分支具备括号所以是三个捕获组），所以 match[1]-match[3]分别对应匹配的结果
        // 最后一个只匹配，避免出现模板中闭合标签的异常情况
        this.tagRegex = /<%=([\s\S]*?)%>|<%-([\s\S]*?)%>|<%([\s\S]*?)%>|%>/g

    }

    // 编译模板并缓存
    compile(template,options = {}) {

        if(!options.onCache && this.cache.get(template)) {
            return this.cache.get(template)
        }

        const code =  this.generateCode(template)

        // options预留扩展，比如可以添加属控制输出格式等
        const renderFn = new Function("data","options",code)


        if(!options.onCache) {
            this.cache.set(template,renderFn)
        }

        return renderFn

    }

    // 生成js代码
    generateCode(template) {

        let code = `
            const output = []
            const escape = (str) =>{
                if(typeof str !== "string") return str
                return str.replace(/>/g,"&gt;")
                          .replace(/</g,"&lt;")
                          .replace(/"/g,"&quot;")
                          .replace(/'/g,"&#39;")
                          .replace(/&/g,"&amp;")
                
            }
            with(data || {}){
        `

        let index = 0,match = null
        // 模板前中后，前面有字符串、中间是模板、后面字符串
        while((match = this.tagRegex.exec(template)) !== null){
            if(match.index > index) {
                const text = this.escapeString(template.slice(index,match.index))
                code += `output.push("${text}");\n`
            }

            if(match[1]) {
                const expr = match[1].trim()
                code += `output.push(escape(${expr}));\n`
            }else if(match[2]){
              const expr = match[2].trim()
              code += `output.push(${expr});\n`

            }else if(match[3]){
              const script = match[3].trim()
              code += `${script};\n`
            }

            index = this.tagRegex.lastIndex
        }

        if(index < template.length){
            const text = this.escapeString(template.slice(index))
            code += `output.push("${text}");\n`
        }

        code += `
            }
            return output.join("")
        `

        return code
    }

    // 将字符串中的特殊字符需要转义
    escapeString(str) {
        if(typeof str !== "string") return str
        // t tab  r 回车 n 换行
        return str.replace(/\\/g,"\\\\")
                  .replace(/"/g,'\\"')
                  .replace(/'/g,"\\'")
                  .replace(/\r/g,"\\r")
                  .replace(/\n/g,"\\n")
                  .replace(/\t/g,"\\t")
    }

    // 渲染
    render(template,data,options) {

        const renderFn = this.compile(template,options)

        return renderFn(data,options)
    }
}

  // 使用示例
  const engine = new EJSEngine();
  
  // 1. 基本插值示例
  const userTemplate = `
    <div class="user">
      <h2><%= name %></h2>
      <p>年龄: <%= age %></p>
      <p>职业: <%= job %></p>
      <p>简介: <%= bio || '暂无简介' %></p>
      <p>是否成年: <%= age >= 18 ? '是' : '否' %></p>
      <p>原始HTML: <%- htmlContent %></p>
    </div>
  `;
  
  const userData = {
    name: "张三",
    age: 30,
    job: "软件工程师",
    bio: '<script>alert("XSS攻击")</script>',
    htmlContent: "<strong>高级工程师</strong>"
  };
  
  console.log("1. 基本插值示例:");
  console.log(engine.render(userTemplate, userData));
  
  // 2. 分支表达式示例
  const permissionTemplate = `
    <div class="permissions">
      <h3>用户权限</h3>
      <% if (isAdmin) { %>
        <p>管理员权限: 可以访问所有功能</p>
        <button>管理用户</button>
      <% } else if (isEditor) { %>
        <p>编辑权限: 可以编辑内容</p>
        <button>编辑文章</button>
      <% } else { %>
        <p>普通用户权限: 只能查看内容</p>
      <% } %>
    </div>
  `;
  
  console.log("\n2. 分支表达式示例:");
  console.log(engine.render(permissionTemplate, {isAdmin:false, isEditor: true }));
  
  // 3. 循环表达式示例
  const productsTemplate = `
    <div class="products">
      <h3>商品列表</h3>
      <ul>
        <% for (let i = 0; i < products.length; i++) { %>
          <li>
            <span><%= i + 1 %>. <%= products[i].name %></span>
            <span>价格: ¥<%= products[i].price.toFixed(2) %></span>
            <% if (products[i].inStock) { %>
              <span class="in-stock">有货</span>
            <% } else { %>
              <span class="out-of-stock">缺货</span>
            <% } %>
          </li>
        <% } %>
      </ul>
    </div>
  `;
  
  const productsData = {
    products: [
      { name: "笔记本电脑", price: 5999, inStock: true },
      { name: "智能手机", price: 3999, inStock: true },
      { name: "平板电脑", price: 2999, inStock: false },
      { name: "智能手表", price: 1599, inStock: true }
    ]
  };
  
  console.log("\n3. 循环表达式示例:");
  console.log(engine.render(productsTemplate, productsData));
  
  // 4. 数组forEach循环示例
  const tagsTemplate = `
    <div class="tags-container">
      <h3>文章标签</h3>
      <% if (tags && tags.length) { %>
        <div class="tags">
          <% tags.forEach((tag, index) => { %>
            <span class="tag"><%= tag %></span>
            <% if (index !== tags.length - 1) { %>
              <span class="separator">|</span>
            <% } %>
          <% }) %>
        </div>
      <% } else { %>
        <p>暂无标签</p>
      <% } %>
    </div>
  `;
  
  console.log("\n4. 数组forEach循环示例:");
  console.log(engine.render(tagsTemplate, {
    tags: ["JavaScript", "模板引擎", "EJS", "前端开发"]
  }));