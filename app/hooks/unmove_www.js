#!/usr/local/bin/node

var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    cwd = process.cwd();

module.exports = function (hook) {
    console.log(chalk.cyan('** HOOK: ' + hook + ' <START> **'));

    if (fs.existsSync(path.join(cwd, '.www'))) {
        console.log('Renaming www -> dist');
        fs.renameSync(path.join(cwd, 'www'), path.join(cwd, 'dist'));
        console.log('Renaming .www -> www');
        fs.renameSync(path.join(cwd, '.www'), path.join(cwd, 'www'));
    }

    console.log(chalk.cyan('** HOOK: ' + hook + ' <END> **'));
}
