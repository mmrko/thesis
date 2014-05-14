var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs'),
    gulp = require('gulp'),
    _ = require('lodash'),
    xml2json = require('xml2json');

/**
 * @param {Array} args
 * @param {Function} cb
 */
var execute = function (args, cb) {

        args = _.compact(args);

        var cmd = path.resolve('./node_modules/cordova/bin', process.platform === 'win32' ? 'cordova.cmd' : 'cordova');

        var child = spawn(cmd, args);

        child.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        child.stderr.on('data', function (data) {
            console.error(data.toString());
        });

        child.on('close', function (code) {
            cb && cb();
        })
};

// Add platforms to project
var addPlatforms = function (platforms, cb) {
    console.log('Adding platforms: ' + platforms.join(', '));
    execute(['platform', 'add'].concat(platforms || ['android']), cb);
};

// Copy platform specific files from platform-merges/ to their respective directories in platforms/
var mergePlatforms = function () {
    console.log('Merging files from platform-merges/ into platforms/ ...');
    return gulp.src(['platform-merges/**', '!platform-merges/*.*'], { options: { sync: true }}).pipe(gulp.dest('platforms'));
};

var renameDirs = function (mapping) {
    var cwd = process.cwd();

    Object.keys(mapping).forEach(function (key) {
        var oldPath = path.join(cwd, key),
            newPath = path.join(cwd, mapping[key]);
        if (fs.existsSync(oldPath)) {
            console.log('Renaming directory: ' + oldPath + ' -> ' + newPath);
            fs.renameSync(oldPath, newPath);
        }
    });
};

var cordovaTasks = function (gulp, config) {

    // Install plugins listed in config.xml
    gulp.task('cordova-install-plugins', function (cb) {
        var config = fs.readFileSync('config.xml', { encoding: 'utf8' })
            , jsonStr = xml2json.toJson(config)
            , json = JSON.parse(jsonStr)
            , plugins = json.widget.plugins.plugin
            , ids = plugins.map(function (plugin) { return plugin.name; });

        console.log('Installing plugins...');

        execute(['plugin', 'add'].concat(ids), cb);
    });

    gulp.task('cordova-merge-platforms', mergePlatforms);

    gulp.task('cordova-create', ['cordova-install-plugins'], function () {
        if (process.platform === 'win32') {
            addPlatforms (['android', 'wp8'], mergePlatforms);
        } else if (process.platform === 'darwin') {
            addPlatforms (['android', 'ios'], mergePlatforms);
        }
    });

    gulp.task('cordova-deploy', ['build', 'cordova-merge-platforms'], function () {
        var args = ['run', config.cordova.platform, config.cordova.release, config.cordova.device];

        renameDirs({'www': '.www', 'dist': 'www'});

        execute(args, function () {
            renameDirs({'www': 'dist', '.www': 'www'});
        });
    });

    gulp.task('cordova-emulate', ['build', 'cordova-merge-platforms'], function () {
        var args = ['emulate', config.cordova.platform];

        renameDirs({'www': '.www', 'dist': 'www'});

        execute(args, function () {
            renameDirs({'www': 'dist', '.www': 'www'});
        });
    });

};

module.exports = cordovaTasks;
