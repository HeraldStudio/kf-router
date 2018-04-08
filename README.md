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

app.use(kf())
app.listen(3000)
```

### 路由处理程序

kf-router 将 Koa 的中间件语法进行了简单改造，使得路由处理程序更易书写。

路由处理程序默认情况下只需放在主程序同级的 `routes` 文件夹内，并导出 exports.route 对象。

```javascript
//: routes/hello.js

exports.route = {
    get() {
        return { hello: 'world!' }
    }
}
```

路由处理程序支持 `get` `post` `put` `delete` 等对应于 Koa `ctx.request.method` 所有可能值的、以小写字母命名的方法；它们可以是 `async` 方法，也可以是普通方法，均可以使用 `return` 直接向请求者返回内容。

若要访问 Koa `ctx` 对象，使用 `this` 即可：

```javascript
//: routes/hello.js

exports.route = {
    async get() {
        return this.headers
    }
}
```

因为路由中间件将作为中间件栈的最顶层，`next()` 方法不再提供。请始终将 `app.use(kf())` 放在主程序中所有 `use` 语句的最后，因为你无法使用路由以后的任何中间件。

路由处理程序可以放在任意一级子文件夹中，按照需要被请求的路径来命名，例如 `a/b.js` 可以处理 `/a/b` 的请求。路径可以为大小写字母、数字、下划线和中划线，不支持在路径名中使用参数。我们建议用原生的参数表来传递请求参数。

如果你既需要当前路径下包含子路由，又需要解析当前路径本身，可以用 index.js 来代替当前路径本身的路由处理程序。例如 `/api/index.js` 文件可以处理 `/api` 的请求，同时当然也可以处理 `/api/index` 的请求。

kf-router 会自动支持 koa-bodyparser，将请求参数（合并了 URL 参数和 body 参数）传入路由处理程序：

```javascript
//: routes/add.js

exports.route = {
    async post({ a, b }) {
        return Number(a) + Number(b)
    }
}
```

注：若没有 koa-bodyparser，将只解析 URL 参数；若 body 为纯字符串，将只提供此字符串本身作为参数。

### 选项

`kf()` 支持传入一个参数来自定义路由处理程序所在的目录，默认为 `routes`。

### 声明

kf-router 是简易的无协议开源软件，您暂时可以按照 [WTFPL](https://zh.wikipedia.org/zh-hans/WTFPL) 随意使用它们。

kf-router 不是稳定有保障的软件，切勿在正式生产环境使用。
