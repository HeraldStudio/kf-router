const bodyparser = require('koa-bodyparser')

module.exports = (thatModule, config = {}) => {

  const bp = bodyparser(config.bodyparser || {})

  let requireCache = {}

  let requireHandler = route => {
    try {
      return thatModule.require(route)
    } catch (e) {
      if (e.message !== `Cannot find module '${route}'`) {
        console.error(e)
      }
      return null
    }
  }

  let requireHandlerOrDirectory = route => {
    return requireHandler(route) || requireHandler(route + '/index')
  }

  let requireHandlerCached = route => {
    // 统一去掉结尾斜杠
    route = route.replace(/\/$/, '')

    if (requireCache.hasOwnProperty(route)) {
      return requireCache[route]
    } else {
      // 路径安全检查，支持字母数字符号下划线中划线，多个斜杠必须分开，结尾斜杠可有可无；不允许调用 node_modules 中的程序
      if (/^(\/[0-9a-zA-Z_\-]+)*\/?$/.exec(route) && !/(^|\/)node_modules(\/|$)/.test(route)) {
        let required = requireHandlerOrDirectory('.' + route)
        requireCache[route] = required
        return required
      }
    }
  }

  return async ctx => {
    await bp(ctx, async () => {})
    ctx.params = { ...ctx.query, ...ctx.request.body }
    let [route, method] = [ctx.path, ctx.method.toLowerCase()]

    // 转换为相对路径，进行 require
    let handler = requireHandlerCached(route)
    if (handler) {

      // 若 require 成功，判断是否有对应方法的处理函数，没有该方法则 405
      if (handler.hasOwnProperty('route') && handler.route.hasOwnProperty(method)) {

        // 把 ctx 传给对应方法的 this 进行调用，在该方法内用 this 代替 koa 的 ctx
        // 由于路由处理程序为最终生产者，暂不提供 next 参数
        let result = handler.route[method].call(ctx)

        if (result) { // 若函数返回了一个值

          // 若返回的是 Promise 对象，则为异步函数，等待 Promise 处理完毕；如有错误，输出而不抛出
          if (result.toString() === '[object Promise]') {
            let finalResult = await result.catch(console.err)

            // 若 Promise 最终返回一个值，则将该值作为响应体
            if (finalResult) {
              ctx.body = finalResult
            }
          } else { // 普通函数返回一个值，也将该值作为响应体
            ctx.body = result
          }
        }
        return
      }
      ctx.throw(405)
    } else {
      // 路径不合法或 require 不成功，一律 404
      ctx.throw(404)
    }
  }
}
