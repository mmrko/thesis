var path = require('path'),
    gulp = require('gulp'),
    exec = require('exec'),
    chalk = require('chalk'),
    $ = require('gulp-load-plugins')(),
    config = require('./gulpfile.config.js');

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
            style: config.minify ? 'compressed' : 'expanded'
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest(config.tmpPath('styles')));
});

gulp.task('images', function () {
    return gulp.src(config.wwwPath('images/**/*'))
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

// Process Angular templates
gulp.task('templates', function () {
    return gulp.src(config.wwwPath('templates/**/*.html'))
        .pipe($.angularTemplatecache(config.pluginOptions.ngTemplateCache))
        .pipe($.header.apply(this, config.pluginOptions.header))
        .pipe(gulp.dest(config.tmpPath('scripts')));
});

gulp.task('useref', ['styles', 'scripts', 'templates'], function () {

    var jsFilter = $.filter(['**/*.js']),
        jsFilterVendor = $.filter(['!**/*/vendor.js']),
        cssFilter = $.filter('**/*.css'),
        indexFileFilter = $.filter(config.indexFile);

    return gulp.src(config.wwwPath(config.indexFile))
        .pipe($.useref.assets({ searchPath: [config.wwwPath(), config.tmpPath()]}))

        // scripts
        .pipe(jsFilter)
        .pipe(jsFilterVendor)
        .pipe($.if(config.minify, $.ngmin()))
        .pipe(jsFilterVendor.restore())
        .pipe($.if(config.minify, $.uglify()))
        .pipe(jsFilter.restore())

        // styles
        .pipe(cssFilter)
        .pipe($.if(config.minify, $.csso()))
        .pipe(cssFilter.restore())

        .pipe($.useref.restore())
        .pipe($.useref())

        // config.indexFile
        .pipe(indexFileFilter)
        .pipe($.if(config.minify, $.htmlmin(config.pluginOptions.htmlmin)))
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


gulp.task('connect', function () {
    require('ripple-emulator').emulate.start({
        port: config.ripple.port,
        path: [config.wwwPath(), config.tmpPath()],
        middleware: './ripple-middleware'
    });
});

gulp.task('serve', ['connect'], function () {
    var url = 'http://localhost:' + config.ripple.port + '/' + config.indexFile + config.ripple.queryString;
    $.util.log('Running Ripple Emulator at ' + chalk.cyan(url));
    if (config.open) { require('opn')(url); }
});

gulp.task('clean', function () {
    return gulp.src(config.destPath(), { read: false }).pipe($.clean());
});

gulp.task('symlink', function () {
    // Symlink config.xml to config.tmpPath so that Ripple finds it
    return gulp.src('config.xml', { read: false }).pipe($.symlink(config.tmpPath()));
});

gulp.task('watch', ['symlink'], function () {

    var server = $.livereload();

    gulp.watch([
        config.wwwPath('styles/**/*.scss'),
        config.wwwPath('scripts/**/*.js'),
        config.wwwPath('images/**/*'),
        config.wwwPath('templates/**/*.html')
    ]).on('change', function (file) {

        var directory = path.relative(config.wwwPath(), file.path), // e.g. styles/x/y/z.scss
            type = directory.split(path.sep)[0]; // styles, scripts, images, templates

        // If a file was deleted, remove it from the cache as well
        if (file.type === 'deleted' && $.cached.caches.hasOwnProperty(type)) {
            delete $.cached.caches[type][file.path];
        }

        gulp.start(type);
    });

    gulp.watch([
        config.wwwPath('scripts/**/*.js'),
        config.tmpPath('styles/**/*.css'),
        config.wwwPath('images/**/*'),
        config.wwwPath('templates/**/*.html'),
        config.wwwPath(config.indexFile)
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('bower.json', ['wiredep']);
});


gulp.task('build', ['useref', 'images', 'fonts']);

gulp.task('default', ['clean'], function () {
    gulp.start('build')
});
