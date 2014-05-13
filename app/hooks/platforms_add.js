var exec = require('exec');

// Add platforms to project
var addPlatforms = function (platforms, cb) {
    console.log('Adding platforms: ' + platforms.join(', '));
    exec(['cordova', 'platform', 'add'].concat(platforms || ['android']), function(err) {
        if (err instanceof Error)
            throw err;
        return cb && cb();
    });
};

module.exports = addPlatforms;
