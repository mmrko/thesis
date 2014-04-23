var argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs');

var config = {
    destPath : function (glob) {
        return glob ? path.join('www', glob) : 'www';
    },
    wwwPath : function (glob) {
        return glob ? path.join('www_src', glob) : 'www_src';
    },
    vendorPath : JSON.parse(fs.readFileSync('.bowerrc')).directory,
    indexFile : 'index.html',
    emulate: !!argv.emulate || argv._.indexOf('emulate') !== -1,
    minify: !!argv.minify,
    ripple : {
        port : 4000,
        queryString : '?enableripple=cordova-3.0.0-Nexus4',
    },
    pluginOptions: {
        htmlmin: { collapseWhitespace: true, removeComments:true }
    }
}

module.exports = config;
