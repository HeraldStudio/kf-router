exports.route = {
  get() {
    throw new Error('Error test')
  },
  async post() {
    throw new Error('async Error test')
  }
}
