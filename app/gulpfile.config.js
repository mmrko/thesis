var argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs');

module.exports = {
  ripple : {
    port : 4000,
    queryString : '?enableripple=cordova-3.0.0-WVGA',
  },
  livereloadport: 35729,
  destPath : function (glob) {
    return glob ? path.join('www', glob) : 'www';
  },
  wwwPath : function (glob) {
    return glob ? path.join('www_src', glob) : 'www_src';
  },
  vendorPath : JSON.parse(fs.readFileSync('.bowerrc')).directory,
  production : argv._.indexOf('build') !== -1,
};
