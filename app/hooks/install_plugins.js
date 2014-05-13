var fs = require('fs'),
    exec = require('exec'),
    xml2json = require('xml2json');

var installPlugins = function (cb) {
    var config = fs.readFileSync('config.xml', { encoding: 'utf8' })
        , jsonStr = xml2json.toJson(config)
        , json = JSON.parse(jsonStr)
        , plugins = json.widget.plugins.plugin
        , ids = plugins.map(function (plugin) { return plugin.name; });

    console.log('Installing plugins...');

    exec(['cordova', 'plugin', 'add'].concat(ids), function(err) {
        if (err instanceof Error)
            throw err;
        return cb && cb();
    });
};

module.exports = installPlugins;