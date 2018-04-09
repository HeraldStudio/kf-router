const glob = require('glob')
const path = require('path')
const chalk = require('chalk')
const unixify = fn => fn.replace(/\\/g, '/')

module.exports = (rootPath = 'routes') => {
  let rootModule = module
  while (rootModule.parent) {
    rootModule = rootModule.parent
  }

  const root = path.join(path.dirname(rootModule.filename), rootPath)
  let modules = {}

  glob.sync(root + '/**/*.js', {}).map(f => {
    let absolute = path.resolve(f)
    let relative = unixify(absolute.replace(root, '').replace(/\.js$/, ''))
    let mod = require(absolute)
    if (typeof mod === 'object' && mod.hasOwnProperty('route')) {
      modules[relative] = mod
    } else {
      console.log('kf-router [W] Loaded module without exports.route: ' + chalk.yellow(relative))
    }
  }).find(k => k)

  let requireRoute = route => {
    route = route.replace(/\/$/, '')

    if (modules.hasOwnProperty(route)) {
      return modules[route]
    } else if (modules.hasOwnProperty(route + '/index')) {
      modules[route] = modules[route + '/index']
      return modules[route]
    } else {
      return null
    }
  }

  return async ctx => {
    let [route, method] = [ctx.path, ctx.method.toLowerCase()]
    let handler = requireRoute(route)
    if (!handler || !handler.route) {
      ctx.throw(404)
    }
    if (!handler.route.hasOwnProperty(method)) {
      ctx.throw(405)
    }
    let params
    // supports koa-bodyparser
    if (typeof ctx.request.body === 'object' || typeof ctx.request.body === 'undefined') {
      params = {}
      Object.assign(params, ctx.request.body || {})
      Object.assign(params, ctx.query || {})
    } else {
      params = ctx.request.body || {}
    }
    // does not handle errors
    // pass through to upstream instead
    let res = await handler.route[method].call(ctx, params)
    if (res) {
      ctx.body = res
    }
  }
}
