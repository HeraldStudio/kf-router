# Koa 全自动文件路由 kf-router

Made with <3 by `rikumi`, Herald Studio

## 介绍

kf-router 是一个极简的、在 Koa 上运行的全自动文件路由中间件。只需在主程序中一行代码，即可根据需要的 ReSTful 路由结构，快速开始书写路由处理程序。

## 用法

### 安装

```bash
npm install -S kf-router
```

### 引入

kf-router 只需在 Koa 主程序的 `app` 中引入一个中间件：

```javascript
//: app.js

const koa = require('koa')
const app = new koa()
const kf = require('kf-router')

app.use(kf(module))
app.listen(3000)
```

将当前所在的 `module` 传入 kf，使 kf-router 得到从你的当前路径进行 `require` 的能力，接下来即可创建路由处理程序，开始服务。

### 路由处理程序

kf-router 将 Koa 的中间件语法进行了简单改造，使得路由处理程序更易书写。

路由处理程序只需放在主程序同级或次级文件夹，并导出 exports.route 对象。

```javascript
//: hello.js

exports.route = {
    get() {
        return { hello: 'world!' }
    }
}
```

路由处理程序支持 `get` `post` `put` `delete` 等对应于 Koa `ctx.request.method` 所有可能值的、以小写字母命名的方法；它们可以是 `async` 方法，也可以是普通方法，均可以使用 `return` 直接向请求者返回内容。

若要访问 Koa `ctx` 对象，使用 `this` 即可：

```javascript
//: hello.js

exports.route = {
    async get() {
        return this.headers
    }
}
```

因为路由中间件将作为中间件栈的最顶层，`next()` 方法不再提供。请始终将 `app.use(kf(module))` 放在主程序中所有 `use` 语句的最后，因为你无法使用路由以后的任何中间件。

路由处理程序可以放在任意一级子文件夹中，按照需要被请求的路径来命名，例如 `a/b.js` 可以处理 `/a/b` 的请求。路径可以为大小写字母、数字、下划线和中划线，不支持在路径名中使用参数。我们建议用原生的参数表来传递请求参数。

如果你既需要当前路径下包含子路由，又需要解析当前路径本身，可以用 index.js 来代替当前路径本身的路由处理程序。例如 `/api/index.js` 文件可以处理 `/api` 的请求，同时当然也可以处理 `/api/index` 的请求。

如果你注重安全性，我们通过对请求路径进行正则匹配，排除了那些恶意构造的请求，以防止对服务器文件系统进行搜寻和破坏，实现了简易的安全措施。

我们也为路由处理程序的引入提供了缓存，使得多次请求同一路由时，不会反复读取文件系统。虽然 Node.js `require` 也提供此机制，但我们对此进行改进，以便进一步适应 kf-router。

### 声明

kf-router 是简易的无协议开源软件，您暂时可以按照 WTFPL 随意使用它们。

kf-router 不是稳定有保障的软件，切勿在正式生产环境使用。