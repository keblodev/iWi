'use strict';

var gulp = require('gulp');
var ngrok = require('ngrok');
var shell = require('gulp-shell')
var bower = require('gulp-bower');
var jasmine = require('gulp-jasmine');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var psi = require('psi');
var optimist = require('optimist');
var reload = browserSync.reload;
var fs = require('fs');

var DotenvHelper = require('./_platform/helpers/gulp_helpers/dotenv-helper');

var dotenvHelper = new DotenvHelper()
    dotenvHelper.getEnv();

var clientName,
    serverName,
    clientAppPath,
    sharedClientResourcesPath,
    clientBuildPath,
    serverAppPath,
    serverBuildPath;

  //default client: angular
  clientName                = process.env.CLIENT_NAME;
  //default server: node
  serverName                = process.env.SERVER_NAME;

  clientAppPath             = process.env.CLIENT_APP_PATH;
  sharedClientResourcesPath = process.env.SHARED_CLIENT_RESOURCES_PATH;
  clientBuildPath           = process.env.CLIENT_BUILD_PATH;

  serverAppPath             = process.env.SERVER_APP_PATH;
  serverBuildPath           = process.env.SERVER_BUILD_PATH;


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
gulp.task('test-node', ['jshint-server'], function () {
    return gulp.src('./spec/_server/node_app/**/**.js')
        .pipe(jasmine({
          configPath: 'spec/_server/node_app/support/jasmine.json',
          rootPath: serverAppPath
        }));
});
//runs tests for client app
gulp.task('test-client', ['jshint-client'], function () {
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
  return bower({ directory: './bower_components', cwd: clientAppPath })
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

// Watch Files For Changes on CLIENT & Reload
gulp.task('watch-client', ['styles', 'browser-sync'], function () {
  gulp.watch([clientAppPath + '/**/*.html'], reload);
  gulp.watch([sharedClientResourcesPath + '/stylesheets/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([clientAppPath + '/**/*.js'], ['jshint']);
  gulp.watch([sharedClientResourcesPath + '/images/**/*'], reload);
});

// Watch Files For Changes on SERVER
gulp.task('watch-serv', function () {
  gulp.watch([serverAppPath + '/**/*.js'], ['jshint']);
});

// Build Production Files, the Default Task
gulp.task('def', ['clean'], function (cb) {
  runSequence('test', 'copy', ['styles', 'images', 'fonts'], 'html' , cb);
});

gulp.task('dev-build', ['clean'], function (cb) {
  runSequence('copy', ['styles', 'images', 'fonts'], 'html' , cb);
});


// run proxy for application
// TODO - create config for port, etc...
var subdomain = 'iwishrga';
gulp.task('ngrok-connect', function(cb){
  ngrok.connect({
    port: 3000,
    //got authtoken when sigh up on ngrok
    authtoken: '4PT9OzXbzx7ExXHB1i8E',
    subdomain: subdomain
  }, function(err, url) {
    if (err) return cb(err);
    cb();
  });
});

gulp.task('ngrok-disconnect', function(){
  ngrok.disconnect();
});

gulp.task('psi-desktop', function (cb) {
  psi({
    nokey: 'true',
    url: 'https://' + subdomain + '.ngrok.com',
    strategy: 'desktop',
    threshold: 40
  }, cb);
});

gulp.task('pagespeed', function(cb) {
  runSequence('ngrok-connect', 'psi-desktop', 'ngrok-disconnect', cb);
});

// Build Production Files and start server
gulp.task('start-dev', ['def'],   shell.task([
  'cd ' + serverBuildPath + ' && node app.js --client ' + (optimist.argv.client || "angular")])
);

// Debug Production Server
gulp.task('debug-dist', ['def'], shell.task([
  'cd ' + serverBuildPath + ' && node-debug app.js --client ' + (optimist.argv.client || "angular")])
);

// Debug Dev Server
gulp.task('debug', shell.task([
  'cd ' + serverAppPath + ' && node-debug app.js --client ' + (optimist.argv.client || "angular")])
);

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}