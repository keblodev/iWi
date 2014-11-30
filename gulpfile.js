'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var jasmine = require('gulp-jasmine');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var optimist = require('optimist');
var reload = browserSync.reload;

//default client: angular
var clientName = (optimist.argv.client || "angular") + "_app";
//default server: node
var serverName = (optimist.argv.server || "node") + "_app";

var clientAppPath =             "_client/client_app/" + clientName;
var sharedClientResourcesPath = "_client/shared_resources/";
var clientBuildPath =           "_client/dist";

var serverAppPath =             "_server/" + serverName;
var serverBuildPath =           "_server/dist";

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

//runs tests for node_app
gulp.task('test-node', function () {
    return gulp.src('./spec/_server/node_app/**.js')
        .pipe(jasmine());
});
//runs tests for client app
gulp.task('test-client', function () {
    return gulp.src('./spec/' + clientAppPath + '/**.js')
        .pipe(jasmine());
});
//runs tests for client app and server
gulp.task('test', ['test-node', 'test-client']);

// Image optimizing
gulp.task('images', function () {
  return gulp.src(sharedClientResourcesPath + '/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(clientBuildPath + '/images'))
    .pipe($.size({title: 'images'}));
});

// copy to _client/dist
gulp.task('copy-client', function () {
  return gulp.src([
    clientAppPath + '/**/*',
    sharedClientResourcesPath + '/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest(clientBuildPath))
    .pipe($.size({title: 'copy'}));
});

// copy to _server/dist
gulp.task('copy-server', function () {
  return gulp.src([
    serverAppPath + '/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest(serverBuildPath))
    .pipe($.size({title: 'copy'}));
});


//install libs for client
gulp.task('install-client', function() {
  return bower({ directory: './bower_components', cwd: './' + clientAppPath })
    .pipe(gulp.dest('lib/'))
});
// install vendors
gulp.task('install', ['install-client']);

// Check _client
gulp.task('jshint-client', function () {
  return gulp.src(clientAppPath + '/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Check _server
gulp.task('jshint-server', function () {
  return gulp.src(serverAppPath + '/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src([sharedClientResourcesPath + '/fonts/**'])
    .pipe(gulp.dest(clientBuildPath + '/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
      sharedClientResourcesPath + '/stylesheets/*.scss',
      //clientAppPath + '/stylesheets/components/components.scss'
    ])
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.rubySass({
        style: 'expanded',
        precision: 10
      })
      .on('error', console.error.bind(console))
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest(clientBuildPath + '/stylesheets'))
    .pipe($.size({title: 'styles'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src(clientBuildPath + '/**/*.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    // .pipe($.if('*.css', $.uncss({
    //   html: [
    //     'app/index.html',
    //     'app/styleguide.html'
    //   ],
    //   // CSS Selectors for UnCSS to ignore
    //   ignore: [
    //     /.navdrawer-container.open/,
    //     /.app-bar.open/
    //   ]
    // })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update Production Style Guide Paths
    //.pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest(clientBuildPath))
    .pipe($.size({title: 'html'}));
});

//jshint for server and client
gulp.task('jshint', ['jshint-client', 'jshint-server']);

//copy for server and client
gulp.task('copy', ['copy-client', 'copy-server']);

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', clientBuildPath, serverBuildPath, '.sass-cache']));


gulp.task('browser-sync', function() {
    browserSync({
        https: true,
        server: ['.tmp', clientAppPath],
    });
});

gulp.task('reload', function() {
    return gulp.src(clientAppPath)
    .pipe(reload({stream: true, once: true}));
});

// Watch Files For Changes & Reload
gulp.task('watch', ['styles', 'browser-sync'], function () {

  gulp.watch([clientAppPath + '/**/*.html'], reload);
  gulp.watch([sharedClientResourcesPath + '/stylesheets/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([clientAppPath + '/**/*.js'], ['jshint']);
  gulp.watch([sharedClientResourcesPath + '/images/**/*'], reload);
});

// Build Production Files, the Default Task
gulp.task('def', ['clean'], function (cb) {
  runSequence('jshint', 'test', 'copy', ['styles', 'images', 'fonts'], 'html' , cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'https://example.com',
  strategy: 'mobile'
}));

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}