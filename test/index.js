const koa = require('koa')
const app = new koa()
const kf = require('../index')

const port = 3000

const axios = require('axios').create({
  baseURL: `http://localhost:${port}`
})

app.use(kf(module))

exports.route = {
  async get() {
    return [
      (await axios.post('/')).data,
      (await axios.put('/')).data,
      (await axios.delete('/')).data,
      (await axios.get('/some')).data,
      (await axios.get('/other')).data,
      (await axios.post('/bodyparser?a=1', 'b=2')).data
    ]
  },
  post() {
    return 'POST / [index.js]'
  },
  put() {
    return 'PUT / [index.js]'
  },
  delete() {
    return 'DELETE / [index.js]'
  }
}

app.listen(port)
