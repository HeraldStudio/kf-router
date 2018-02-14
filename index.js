const glob = require('glob')
const path = require('path')
const chalk = require('chalk')

module.exports = (thatModule, config = {}) => {

  const root = path.normalize(thatModule.filename.replace(/\/[^\/]+$/, ''))

  let modules = {}

  glob.sync(root + '/**/*.js', {
    ignore: ['**/node_modules/**/*.js'].concat(config.ignore || [])
  }).map(f => {
    let absolute = path.resolve(f)
    let relative = absolute.replace(root, '').replace(/\.js$/, '')
    let mod = require(absolute)
    if (mod.hasOwnProperty('route')) {
      if (config.verbose !== false) {
        console.log('kf-router: module-load ' + chalk.cyan(relative), Object.keys(mod.route).join(', '))
      }
      modules[relative] = mod
    }
  })

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
    try {
      ctx.body = await handler.route[method].call(ctx) || ''
    } catch (e) {
      if (typeof e === 'number') {
        ctx.body = ''
        ctx.status = e
      } else if (typeof e === 'string') {
        ctx.body = e
        ctx.status = 400
      } else {
        throw e
      }
    }
  }
}
