var gulp = require('gulp'),
   livereloadserver = require('tiny-lr')(),
	 browserify = require('browserify'),
	 exec = require('exec'),
   open = require('open'),
	 ripple = require('ripple-emulator'),
   chalk = require('chalk'),
   runSequence = require('run-sequence'),
   config = require('./gulpfile.config.js'),
   $ = require('gulp-load-plugins')();

gulp.task('lint', function () {
    return gulp.src(config.wwwPath('js/**.js'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
  return gulp.src(config.wwwPath('js/**/*.js'))
      .pipe($.jscs())
      .pipe(gulp.dest(config.destPath()))
      .pipe($.size());
});

gulp.task('styles', function () {
  return gulp.src(config.wwwPath('css/**/*.css'))
      .pipe($.autoprefixer('last 1 version'))
      .pipe(gulp.dest(config.destPath()))
      .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src(config.wwwPath('img/**/*.{jpg,jpeg,gif,png}'))
      .pipe($.cond(config.production, $.imagemin()))
      .pipe(gulp.dest(config.destPath()))
      .pipe($.size());
});

gulp.task('html', function () {
  return gulp.src(config.wwwPath('*.html'))
      .pipe($.cond(!config.production, $.embedlr()))
      .pipe(gulp.dest(config.destPath()))
      .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(config.destPath(), { read: false }).pipe($.clean());
});

gulp.task('prepare', function (cb) {
  exec(['cordova', 'prepare'], function (err, out, code) {
      if (err instanceof Error) {
        throw err;
      }
      cb();
  });
});

gulp.task('serve', function () {
    var url = 'http://localhost:' + config.ripple.port + '/index.html' + config.ripple.queryString;

    ripple.emulate.start({port: 4000});
    livereloadserver.listen(config.livereloadport);

    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));

    open(url);
});

gulp.task('watch', ['serve'], function () {

    gulp.watch([config.wwwPath('**'), '!' + config.vendorPath + '/**'], function (event) {
      runSequence('prepare', function () {
          gulp.src(event.path).pipe($.livereload(livereloadserver));
      });
    });

    gulp.watch(config.wwwPath('css/**/*.css'), ['styles']);
    gulp.watch(config.wwwPath('js/**/*.js'), ['scripts']);
    gulp.watch(config.wwwPath('*.html'), ['html']);
    gulp.watch(config.wwwPath('img/**/*.{jpg,jpeg,gif,png}'), ['images']);
});

gulp.task('default', function () {
  return runSequence(['build'], 'watch');
});

gulp.task('build', function (cb) {
  return runSequence('clean', ['scripts', 'styles', 'images', 'html'], 'prepare', cb);
});
