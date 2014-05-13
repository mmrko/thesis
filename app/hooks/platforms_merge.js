#!/usr/local/bin/node

var gulp = require('gulp');

// Copy platform specific files from platform-merges/ to their respective directories in platforms/
var mergePlatforms = function () {
    console.log('Merging files from platform-merges/ into platforms/ ...');
    return gulp.src(['platform-merges/**', '!platform-merges/*.*'], { options: { sync: true }}).pipe(gulp.dest('platforms'));
};

if (require.main === 'module') {
    mergePlatforms();
}
else {
    module.exports = mergePlatforms;
}
