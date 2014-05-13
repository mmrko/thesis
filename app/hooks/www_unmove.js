#!/usr/local/bin/node

var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    cwd = process.cwd();

// Restore directory names changed by www_move.js
// TODO: This hooks is never reached if a build error is thrown. Changes
// made by www_move.js should be atomic.
var unmove = function () {
    var hook = path.basename(path.dirname(module.parent.filename));

    console.log(chalk.cyan('** HOOK: ' + hook + ' <START> **'));

    if (fs.existsSync(path.join(cwd, '.www'))) {
        console.log('Renaming www -> dist');
        fs.renameSync(path.join(cwd, 'www'), path.join(cwd, 'dist'));
        console.log('Renaming .www -> www');
        fs.renameSync(path.join(cwd, '.www'), path.join(cwd, 'www'));
    }

    console.log(chalk.cyan('** HOOK: ' + hook + ' <END> **'));
};

module.exports = unmove;
