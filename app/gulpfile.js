var gulp = require('gulp'),
	 $ = require('gulp-load-plugins')(),
	 browserify = require('browserify'),
   path = require('path'),
	 exec = require('exec'),
   open = require('open'),
	 ripple = require('ripple-emulator'),
   chalk = require('chalk'),
   wwwPath = function (dir) { return path.join('www', dir); };

var config = {
  ripple : {
    port : 4000,
    queryString : '?enableripple=cordova-3.0.0-WVGA',
  }
}

gulp.task('lint', function () {
    return gulp.src(wwwPath('js/**.js'))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
  return gulp.src(wwwPath('js/**.js'))
      .pipe($.jscs())
      .pipe($.size());
});

gulp.task('prepare', function () {
  return exec(['cordova', 'prepare'], function (err, out, code) {
      if (err instanceof Error) {
        throw err;
      }
  });
});

gulp.task('serve', function () {
    var url = 'http://localhost:' + config.ripple.port + '/index.html' + config.ripple.queryString;
    ripple.emulate.start({port: 4000});
    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));
    open(url);
});

gulp.task('watch', ['serve'], function () {
    return gulp.watch(wwwPath('**'), ['prepare']);
});

gulp.task('default', ['watch']);

gulp.task('build', ['scripts'], function () {
  return gulp.start('prepare');
});
