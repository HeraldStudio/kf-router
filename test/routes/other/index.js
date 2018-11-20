exports.route = {
  beforeAll(method){
    this.msg='before other/index.js '+method;
  },
  afterAll(method){
    this.msg='after other/index.js '+method;
  },

  get() {
    console.log(this.msg);
    return 'GET /other [other/index.js]'
  }
}
