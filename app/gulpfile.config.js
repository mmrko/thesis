var argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs'),
    emulate = argv._.indexOf('emulate') !== -1 || !!argv.emulate;

var config = {
    destPath : function (glob) {
        return glob ? path.join('www', glob) : 'www';
    },
    wwwPath : function (glob) {
        return glob ? path.join('www_src', glob) : 'www_src';
    },
    vendorPath : JSON.parse(fs.readFileSync('.bowerrc')).directory,
    indexFile : 'index.html',
    production : !emulate,
    emulate: emulate,
    ripple : {
        port : 4000,
        queryString : '?enableripple=cordova-3.0.0-WVGA-Nexus4',
    },
    pluginOptions: {
        htmlmin: { collapseWhitespace: true, removeComments:true }
    }
}

module.exports = config;
