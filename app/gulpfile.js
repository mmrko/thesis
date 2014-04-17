var gulp = require('gulp'),
    browserify = require('browserify'),
    exec = require('exec'),
    chalk = require('chalk'),
    runSequence = require('run-sequence'),
    lazypipe = require('lazypipe'),
    config = require('./gulpfile.config.js'),
    path = require('path'),
    $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
    return gulp.src(config.wwwPath('scripts/**/*.js'))
        .pipe($.cached('scripts'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jscs());
});

gulp.task('styles', function () {
    return gulp.src(config.wwwPath('styles/**/*.scss'))
        .pipe($.plumber())
        .pipe($.rubySass({
            style: config.emulate ? 'expanded' : 'compressed',
            debugInfo: true
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest(config.wwwPath('styles')));
});

gulp.task('images', function () {
    return gulp.src(config.wwwPath('images/**'))
        .pipe($.cond(config.production, $.imagemin()))
        .pipe(gulp.dest(config.destPath('images')))
        .pipe($.size());
});

gulp.task('useref', ['styles', 'scripts'], function () {

    var jsFilter = $.filter(['**/*.js', '!cordova.js']),
        cssFilter = $.filter('**/*.css'),
        indexFileFilter = $.filter(config.indexFile);

    return gulp.src(config.wwwPath(config.indexFile))
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.cond(config.production, $.uglify({ mangle: false })))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.cond(config.production, $.csso()))
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(indexFileFilter)
        .pipe($.cond(config.emulate, $.embedlr(), $.htmlmin(config.pluginOptions.htmlmin)))
        .pipe(indexFileFilter.restore())
        .pipe(gulp.dest(config.destPath()))
        .pipe($.size());
});

gulp.task('wiredep', function () {

    var wiredep = require('wiredep').stream;

    return gulp.src(config.wwwPath(config.indexFile))
        .pipe(wiredep({
            directory: config.vendorPath
        }))
        .pipe(gulp.dest(config.wwwPath()));
});

// Run `cordova prepare`
gulp.task('cordova-prepare', function (cb) {
    exec(['cordova', 'prepare'], function (err, out, code) {
        if (err instanceof Error) {
          throw err;
        }
        cb();
    });
});

gulp.task('connect', function () {
    require('ripple-emulator').emulate.start({
        port: config.ripple.port
    });
});

gulp.task('serve', ['connect'], function () {
    var url = 'http://localhost:' + config.ripple.port + '/' + config.indexFile + config.ripple.queryString;
    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));
    require('opn')(url);
});

gulp.task('clean', function () {
    return gulp.src(config.destPath(), { read: false }).pipe($.clean());
});

gulp.task('symlink', function () {
    // Symlink config.xml to www/config.xml to keep Ripple happy
    gulp.src('config.xml', { read: false }).pipe($.cond(config.emulate, $.symlink(config.destPath())));
});

gulp.task('watch', ['serve'], function () {

    var server = $.livereload(), filter;

    gulp.watch(config.wwwPath('images/**'), ['images']);
    gulp.watch(config.wwwPath('styles/**/*.scss'), ['styles']);
    gulp.watch(config.wwwPath('scripts/**/*.js'), function (event) {
        if (event.type === 'deleted' && $.cached.caches.hasOwnProperty('scripts')) {
            delete $.cached.caches['scripts'];
        }
        gulp.start('scripts');
    });

    gulp.watch([
        config.wwwPath('scripts/**/*.js'),
        config.wwwPath('styles/**/*.css'),
        config.wwwPath(config.indexFile)
    ]).on('change', function (file) {

        filter = $.filter('**/*' + path.extname(file.path));

        return gulp.src(config.wwwPath(config.indexFile))
            .pipe($.embedlr())
            .pipe($.useref.assets())
            .pipe($.useref.restore())
            .pipe($.useref())
            .pipe(filter)
            .pipe(gulp.dest(config.destPath()))
            .pipe($.size());
    });

    // Run cordova-prepare when assets change
    gulp.watch([
        config.destPath('styles/**/*.css'),
        config.destPath('scripts/**/*.js'),
        config.destPath('images/**'),
        config.destPath(config.indexFile)
    ], ['cordova-prepare'])

    // Refresh the browser when assets have been moved under www directory of each platform
    // Hard-coded path value. Since all the files will be moved by `cordova prepare` it's
    // enough for us to watch over the indexFile
    gulp.watch('platforms/ios/www/' + config.indexFile).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('bower.json', ['wiredep']);

});

gulp.task('emulate', ['symlink', 'build'], function () {
    return gulp.start('watch');
});

gulp.task('build', ['useref', 'images'], function () {
    return gulp.start('cordova-prepare');
});

gulp.task('default', ['clean'], function () {
    return gulp.start('build');
});
