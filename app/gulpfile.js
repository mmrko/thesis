var gulp = require('gulp'),
    livereloadserver = require('tiny-lr')(),
    browserify = require('browserify'),
    exec = require('exec'),
    open = require('open'),
    ripple = require('ripple-emulator'),
    chalk = require('chalk'),
    wiredep = require('wiredep').stream,
    runSequence = require('run-sequence'),
    config = require('./gulpfile.config.js'),
    $ = require('gulp-load-plugins')();

gulp.task('lint', function () {
    return gulp.src(config.wwwPath('scripts/**.js'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
    return gulp.src(config.wwwPath('scripts/**/*.js'))
        .pipe($.jscs())
        .pipe($.size());
});

gulp.task('styles', function () {
    return gulp.src(config.wwwPath('styles/**/*.scss'))
        .pipe($.rubySass())
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
    return gulp.src(config.wwwPath('*.html'))
        .pipe($.cond(!config.production, $.embedlr()))
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.destPath()))
        .pipe($.size());
});

gulp.task('wiredep', function () {

    return gulp.src(config.wwwPath('*.html'))
        .pipe(wiredep({
            directory: config.vendorPath,
            ignorePath: config.wwwPath()
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
    ripple.emulate.start({port: 4000});
    livereloadserver.listen(config.livereloadport);
});

gulp.task('serve', ['connect'], function () {
    var url = 'http://localhost:' + config.ripple.port + '/index.html' + config.ripple.queryString;
    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));
    open(url);
});

gulp.task('clean', function () {
    return gulp.src(config.destPath(), { read: false }).pipe($.clean());
});

gulp.task('watch', ['serve'], function () {

    gulp.watch([config.wwwPath('**'), '!' + config.vendorPath + '/**'], function (event) {
      runSequence('prepare', function () {
          gulp.src(event.path).pipe($.livereload(livereloadserver));
      });
    });

    gulp.watch(config.wwwPath('styles/**/*.css'), ['styles']);
    gulp.watch(config.wwwPath('scripts/**/*.js'), ['scripts']);
    gulp.watch(config.wwwPath('images/**/*'), ['images']);
    gulp.watch(config.wwwPath('*.html'), ['html']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['html', 'images']);

gulp.task('default', ['clean'], function () {
  return gulp.start('build');
});
