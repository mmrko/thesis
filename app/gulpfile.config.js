var argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs');

var config = {
    destPath : function (glob) {
        return glob ? path.join('www', glob) : 'www';
    },
    srcPath : function (glob) {
        return glob ? path.join('src', glob) : 'src';
    },
    vendorPath : JSON.parse(fs.readFileSync('.bowerrc')).directory,
    indexFile : 'index.html',
    emulate: !!argv.emulate || argv._.indexOf('emulate') !== -1,
    minify: !!argv.minify,
    open: !!argv.open,
    ripple : {
        port : 4000,
        queryString : '?enableripple=cordova-3.0.0-Nexus4'
    },
    pluginOptions: {
        htmlmin: { collapseWhitespace: true, removeComments: true },
        ngTemplateCache: { module: 'luminotrace.templates', root: 'templates', standalone: true },
        header: ['/* Don\'t edit this file directly. See the \'ng-templates\' task in gulpfile.js */\n']
    }
};

module.exports = config;
