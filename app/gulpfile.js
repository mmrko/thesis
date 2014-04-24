var gulp = require('gulp'),
    exec = require('exec'),
    chalk = require('chalk'),
    path = require('path'),
    config = require('./gulpfile.config.js'),
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
        .pipe($.cached('styles'))
        .pipe($.plumber())
        .pipe($.rubySass({
            style: config.emulate ? 'expanded' : 'compressed'
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest(config.wwwPath('styles')));
});

gulp.task('images', function () {
    return gulp.src(config.wwwPath('images/**'))
        .pipe($.cached('images'))
        .pipe($.if(config.minify, $.imagemin()))
        .pipe(gulp.dest(config.destPath('images')))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(config.destPath('fonts')))
        .pipe($.size());
});

gulp.task('useref', ['styles', 'scripts'], function () {

    var jsFilter = $.filter(['**/*.js', '!cordova.js']),
        cssFilter = $.filter('**/*.css'),
        indexFileFilter = $.filter(config.indexFile);

    return gulp.src(config.wwwPath(config.indexFile))
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.if(config.minify, $.uglify({ mangle: false })))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.if(config.minify, $.csso()))
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(indexFileFilter)
        .pipe($.if(config.emulate, $.embedlr(), $.htmlmin(config.pluginOptions.htmlmin)))
        .pipe(indexFileFilter.restore())
        .pipe(gulp.dest(config.destPath()))
        .pipe($.size());
});

// Inject Bower dependencies to config.indexFile
gulp.task('wiredep', function () {

    var wiredep = require('wiredep').stream;

    return gulp.src(config.wwwPath(config.indexFile))
        .pipe(wiredep({ directory: config.vendorPath}))
        .pipe(gulp.dest(config.wwwPath()));
});

// Run `cordova prepare`
gulp.task('cordova-prepare', function (cb) {
    exec(['cordova', 'prepare'], function (err, out, code) {
        if (err instanceof Error) { throw err; }
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
    // Symlink config.xml to config.destPath to keep Ripple happy
    return gulp.src('config.xml', { read: false }).pipe($.symlink(config.destPath()));
});

gulp.task('watch', ['serve', 'symlink'], function () {

    var server = $.livereload(), filter;

    gulp.watch([
        config.wwwPath('styles/**/*.scss'),
        config.wwwPath('scripts/**/*.js'),
        config.wwwPath('images/**')
    ], function (event) {
        switch (path.extname(event.path))
        {
            case '.scss':
                if (event.type === 'deleted') { delete $.cached.caches['styles'][event.path]; }
                gulp.start('styles');
                break;
            case '.js':
                if (event.type === 'deleted') { delete $.cached.caches['scripts'][event.path]; }
                gulp.start('scripts');
                break;
            default:
                if (event.type === 'deleted') { delete $.cached.caches['images'][event.path]; }
                gulp.start('images');
                break;
        }
    });

    // Simply move assets from config.wwwPath to config.destPath when they change
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

    // Run cordova-prepare task when assets change in config.destPath
    gulp.watch(config.destPath('**'), ['cordova-prepare']);

    // Refresh the browser when assets have been moved under the platform-specific www directories.
    // Since `cordova prepare` will move all the files in config.destPath it's enough for us to
    // watch over changes in one file only (e.g. config.indexFile)
    gulp.watch(path.join('platforms/ios/www', config.indexFile)).on('change', function (file) {
        server.changed(file.path);
    });

    // Inject Bower dependencies
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('emulate', ['default'], function (cb) {
    return gulp.start('watch');
});

gulp.task('build', ['useref', 'images', 'fonts'], function () {
    return gulp.start('cordova-prepare');
});

gulp.task('default', ['clean'], function () {
    return gulp.start('build');
});
