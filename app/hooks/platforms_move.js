#!/usr/local/bin/node

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    cwd = process.cwd();

var movePlatformsDir = function () {
    var tempDir = path.join(cwd, 'temp'),
        oldPath = path.join(tempDir, 'platforms'),
        newPath = path.join(cwd, 'platforms');

    if (fs.existsSync(tempDir)) {
        console.log('Renaming: ' + oldPath +  ' -> ' + newPath);
        fs.renameSync(oldPath, newPath);
        rimraf(tempDir, function (err) { if (err) throw err; });
    }
};

movePlatformsDir();
