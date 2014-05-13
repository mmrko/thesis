#!/usr/local/bin/node

var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    cwd = process.cwd();

// Since cordova always deploys www files from www/ we need to temporarily
// rename our build destination folder (dist/) to www/ so that our built
// assets are deployed instead of the unoptimized ones in www/
var move = function () {
    var hook = path.basename(path.dirname(module.parent.filename));

    console.log(chalk.cyan('** HOOK: ' + hook + ' <START> **'));

    if (fs.existsSync(path.join(cwd, 'dist'))) {
        console.log('Renaming www -> .www');
        fs.renameSync(path.join(cwd, 'www'), path.join(cwd, '.www'));
        console.log('Renaming dist -> www');
        fs.renameSync(path.join(cwd, 'dist'), path.join(cwd, 'www'));
    }

    console.log(chalk.cyan('** HOOK: ' + hook + ' <END> **'));
};

module.exports = move;
