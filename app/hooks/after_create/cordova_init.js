#!/usr/local/bin/node

var installPlugins = require('./install_plugins'),
    platformAdd = require('./platforms_add'),
    platformMerge = require('./../platforms_merge');

var callback = function () {
    if (process.platform === 'win32') {
        platformAdd (['android', 'wp8'], platformMerge);
    } else if (process.platform === 'darwin') {
        platformAdd (['android', 'ios'], platformMerge);
    }
};

installPlugins(callback);