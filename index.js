const glob = require('glob')
const path = require('path')
const chalk = require('chalk')

module.exports = (thatModule, config = {}) => {

  const root = path.normalize(thatModule.filename.replace(/\/[^\/]*$/, ''))

  let modules = {}

  let dropped = glob.sync(root + '/**/*.js', {
    ignore: ['/node_modules/**/*'].concat(config.ignore || []).map(k => {
      if (!/^\//.test(k)) { k = '/' + k }
      return root + k + '.js'
    })
  }).map(f => {
    let absolute = path.resolve(f)
    let relative = absolute.replace(root, '').replace(/\.js$/, '')
    let mod = require(absolute)
    if (typeof mod === 'object' && mod.hasOwnProperty('route')) {
      if (config.verbose !== false) {
        console.log('kf-router [load] ' + chalk.cyan(relative), Object.keys(mod.route).join(', '))
      }
      modules[relative] = mod
      return false
    } else {
      if (config.verbose !== false) {
        console.log('kf-router [drop] ' + chalk.yellow(relative))
      }
      return true
    }
  }).find(k => k)

  if (dropped) {
    console.log(chalk.yellow('\nkf-router: One or some modules are loaded but dropped. ' +
      'It is highly recommended to implicitly ignore them.'))
  }

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
