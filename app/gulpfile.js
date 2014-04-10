var gulp = require('gulp'),
	 $ = require('gulp-load-plugins')(),
   livereloadserver = require('tiny-lr')(),
	 browserify = require('browserify'),
   path = require('path'),
	 exec = require('exec'),
   open = require('open'),
	 ripple = require('ripple-emulator'),
   chalk = require('chalk'),
   parseArgs = require('minimist'),
   runSequence = require('run-sequence'),
   wwwPath = function (glob) { return path.join('www_src', glob); };

var config = {
  ripple : {
    port : 4000,
    queryString : '?enableripple=cordova-3.0.0-WVGA',
  },
  production : parseArgs(process.argv.slice(2))._.indexOf('build') !== -1,
  dest : 'www',
  livereloadport: 35729
}

gulp.task('lint', function () {
    return gulp.src(wwwPath('js/**.js'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
  return gulp.src(wwwPath('**/*.js'))
      .pipe($.jscs())
      .pipe(gulp.dest(config.dest))
      .pipe($.size());
});

gulp.task('styles', function () {
  return gulp.src(wwwPath('**/*.css'))
      .pipe($.autoprefixer('last 1 version'))
      .pipe(gulp.dest(config.dest))
      .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src(wwwPath('**/*.{jpg,jpeg,gif,png}'))
      .pipe($.imagemin())
      .pipe(gulp.dest(config.dest))
      .pipe($.size());
});

gulp.task('html', function () {
  return gulp.src(wwwPath('*.html'))
      .pipe($.cond(!config.production, $.embedlr()))
      .pipe(gulp.dest(config.dest))
      .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(config.dest, { read: false }).pipe($.clean());
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

    gulp.watch(wwwPath('**'), function (event) {
      runSequence('prepare', function () {
          gulp.src(event.path).pipe($.livereload(livereloadserver));
      });
    });

    gulp.watch(wwwPath('**/*.css'), ['styles']);
    gulp.watch(wwwPath('**/*.js'), ['scripts']);
    gulp.watch(wwwPath('*.html'), ['html']);
    gulp.watch(wwwPath('**/*.{jpg,jpeg,gif,png}'), ['images']);
});

gulp.task('default', function (cb) {
  return runSequence(['build'], 'watch', cb);
});

gulp.task('build', function (cb) {
  return runSequence('clean', ['scripts', 'styles', 'images', 'html'], 'prepare', cb);
});
