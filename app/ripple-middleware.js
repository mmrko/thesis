var lr = require('connect-livereload');

module.exports = function (app, options) {
    app.use(lr());
}