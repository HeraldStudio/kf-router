exports.route = {
    beforeAll(method) {
        this.msg = 'before index.js ' + method;
    },
    get() {
        console.log(this.msg);
        return 'GET / [index.js]'
    },
    post() {
        console.log(this.msg);
        return 'POST / [index.js]'
    },
    put() {
        console.log(this.msg);
        return 'PUT / [index.js]'
    },
    delete() {
        console.log(this.msg);
        return 'DELETE / [index.js]'
    }
}
