var lr = require('connect-livereload'),
    connect = require('connect'),
    config = require('./gulpfile.config');

module.exports = function (app, options) {
    app.use(lr())
        .use(connect.static(config.tmpPath()))
        .use('/' + config.vendorPath, connect.static(config.vendorPath))
        .use(connect.directory(config.srcPath()));
};