#!/usr/local/bin/node

var installPlugins = require('./install_plugins'),
    platformMerge = require('./platforms_merge');

var platformAdd = function () {
    if (process.platform === 'win32') {
        require('./platforms_add')(['android', 'wp8'], platformMerge);
    } else if (process.platform === 'darwin') {
        require('./platforms_add')(['android', 'ios'], platformMerge);
    }
};

installPlugins(platformAdd);