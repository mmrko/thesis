var lr = require('connect-livereload'),
    connect = require('connect'),
    config = require('./gulpfile.config');

module.exports = function (app, options) {
    app.use(lr());
    app.use('/' + config.vendorPath, connect.static(config.vendorPath));
}