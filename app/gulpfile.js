var gulp = require('gulp'),
    browserify = require('browserify'),
    exec = require('exec'),
    chalk = require('chalk'),
    runSequence = require('run-sequence'),
    lazypipe = require('lazypipe'),
    config = require('./gulpfile.config.js'),
    $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
    return gulp.src(config.wwwPath('scripts/**/*.js'))
        .pipe($.cached('scripts'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jscs())
        .pipe($.size());
});

gulp.task('styles', function () {
    return gulp.src(config.wwwPath('styles/**/*.scss'))
        .pipe($.rubySass({
            style: config.emulate ? 'compressed' : 'expanded'
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest(config.wwwPath('styles')))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src(config.wwwPath('images/**/*'))
        .pipe($.cond(config.production, $.imagemin()))
        .pipe(gulp.dest(config.destPath('images')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {

    var jsFilter = $.filter(['**/*.js', '!cordova.js']),
        cssFilter = $.filter('**/*.css');

    return gulp.src(config.wwwPath('*.html'))
        .pipe($.cond(config.emulate, $.embedlr()))
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.cond(config.production, $.uglify({ mangle: false })))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.cond(config.production, $.csso()))
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.destPath()))
        .pipe($.size());
});

gulp.task('wiredep', function () {
    return gulp.src(config.wwwPath('*.html'))
        .pipe(require('wiredep').stream({
            directory: config.vendorPath
        }))
        .pipe(gulp.dest(config.wwwPath()));
});

gulp.task('prepare', function (cb) {
    exec(['cordova', 'prepare'], function (err, out, code) {
        if (err instanceof Error) {
          throw err;
        }
        cb();
    });
});

gulp.task('connect', function () {
    require('ripple-emulator').emulate.start({port: 4000});
});

gulp.task('serve', ['connect'], function () {
    var url = 'http://localhost:' + config.ripple.port + '/index.html' + config.ripple.queryString;
    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));
    require('opn')(url);
});

gulp.task('clean', function () {
    return gulp.src(config.destPath(), { read: false }).pipe($.clean());
});

gulp.task('symlink', function () {
    gulp.src('config.xml', { read: false }).pipe($.cond(config.emulate, $.symlink(config.destPath())));
});

gulp.task('watch', ['serve'], function () {

    var server = $.livereload();

    gulp.watch(config.wwwPath('scripts/**/*.js'), function (event) {
        if (event.type === 'deleted') {
            delete $.cached.caches['scripts'];
        }
        return gulp.start('html');
    });

    gulp.watch(config.wwwPath('styles/**/*.scss'), ['html']);
    gulp.watch(config.wwwPath('images/**/*'), ['images']);
    gulp.watch(config.wwwPath('*.html'), ['html']);
    gulp.watch('bower.json', ['wiredep']);

    gulp.watch([
        config.wwwPath('styles/**/*.css'),
        config.wwwPath('scripts/**/*.js'),
        config.wwwPath('images/**/*'),
        config.wwwPath('*.html')
    ]).on('change', function (event) {
        runSequence('prepare', function () {
            server.changed(event.path);
        });
    });

});

gulp.task('emulate', ['default'], function () {
    gulp.start('watch');
});

gulp.task('build', ['html', 'images', 'symlink'], function () {
    return gulp.start('prepare');
});

gulp.task('default', ['clean'], function () {
    return gulp.start('build');
});
