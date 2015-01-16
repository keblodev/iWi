'use strict';

var gulp = require('gulp');
var ngrok = require('ngrok');
var shell = require('gulp-shell');
// this guy is faling on Travis
// var bower = require('gulp-bower');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var psi = require('psi');
var optimist = require('optimist');
var reload = browserSync.reload;
var fs = require('fs');
var mocha = require('gulp-mocha');
var vulcanize = require('gulp-vulcanize');
var open = require("gulp-open");
var wait = require("gulp-wait");
var os = require('os');
var serverStarter = require( 'gulp-develop-server' );

//is needed for pre-compiling all .coffe files
// require('shelljs/global');
require('coffee-script/register');

var gulpHelper = require('./_platform/helpers/gulp_helpers/gulp-helper');
var utils = gulpHelper.utils;

var DotenvHelper = gulpHelper.dotenvHelper;
var dotenvHelper = new DotenvHelper();
// Initing platform .env file to get env vars
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
    return gulp.src('./spec/_server/' + serverName + '/**/**.coffee')
        .pipe(mocha({reporter: 'dot'}));
});
//runs tests for client app
gulp.task('test-client', ['jshint-client'], function () {
    return gulp.src('./spec/_client/client_app/' + clientName + '/**/**.coffee')
        .pipe(mocha({reporter: 'dot'}));
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

//install libs for client
gulp.task('install-client',  shell.task([
  'cd ' + clientAppPath + ' && bower install -f'])
);
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
      sharedClientResourcesPath + '/**/*.scss',
      clientAppPath + '/**/*.scss'
    ])
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.rubySass({
        style: 'expanded',
        precision: 10
      })
      .on('error', console.error.bind(console))
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/'))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest(clientBuildPath))
    .pipe($.size())
});

gulp.task('vulcanize', function(){
  return gulp.src([
    clientBuildPath + '/elements/elements.html'
    ])
    .pipe(vulcanize({
        dest: '.tmp/',
        strip: true,
        inline: true
    }))
    .pipe(gulp.dest(clientBuildPath + '/elements'));
});

//TODO: do an appropriate html/js/css uglification task
// Scan Your HTML For Assets & Optimize Them
// TODO: It does not work with web components - investigate
// gulp.task('html', function () {
//   //TODO: it does not uglifies js and css
//   var assets = $.useref.assets({searchPath: '{.tmp,app}'});

//   return gulp.src([
//     clientBuildPath + '/**/*.html',
//     clientBuildPath + '/**/*.js',
//     clientBuildPath + '/**/*.css'])
//     .pipe(assets)
//     // Concatenate And Minify JavaScript
//     .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
//     // Remove Any Unused CSS
//     // .pipe($.if('*.css', $.uncss({
//     //   html: [
//     //     'app/index.html',
//     //     'app/styleguide.html'
//     //   ],
//     //   // CSS Selectors for UnCSS to ignore
//     //   ignore: [
//     //     /.navdrawer-container.open/,
//     //     /.app-bar.open/
//     //   ]
//     // })))
//     // Concatenate And Minify Styles
//     // In case you are still using useref build blocks
//     .pipe($.if('*.css', $.csso()))
//     .pipe(assets.restore())
//     .pipe($.useref())
//     // Update Production Style Guide Paths
//     //.pipe($.replace('components/components.css', 'components/main.min.css'))
//     // Minify Any HTML
//     .pipe($.if('*.html', $.minifyHtml()))
//     // Output Files
//     .pipe(gulp.dest(clientBuildPath))
//     .pipe($.size({title: 'html'}));
// });

//jshint for server and client
gulp.task('jshint', ['jshint-client', 'jshint-server']);

//copy for server and client
gulp.task('copy', ['copy-client', 'copy-server']);

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

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', clientBuildPath, serverBuildPath, '.sass-cache']));


gulp.task('browser-sync', function() {
    browserSync({
        server: ['.tmp', clientAppPath],
    });
});

gulp.task('reload', function() {
    return gulp.src(clientAppPath)
    .pipe(reload({stream: true, once: true}));
});

// Watch Files For Changes on CLIENT & Reload
gulp.task('watch-client',['browser-sync'] ,function () {
  gulp.watch([clientAppPath + '/**/*.html'], ['copy-client', reload]);
  gulp.watch([sharedClientResourcesPath + '/stylesheets/**/*.{scss,css}',
    clientAppPath + '/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch([clientAppPath + '/**/*.js'], ['jshint']);
  gulp.watch([sharedClientResourcesPath + '/images/**/*'], reload);
});

// Watch Files For Changes on CLIENT with production server
gulp.task('watch-client-prod', ['start-dev'], function () {
  gulp.watch([clientAppPath + '/**/*.html'], ['copy-client', 'restart-serv']);
  gulp.watch([sharedClientResourcesPath + '/stylesheets/**/*.{scss,css}'], ['styles', 'restart-serv']);
  gulp.watch([clientAppPath + '/**/*.js'], ['jshint']);
  gulp.watch([sharedClientResourcesPath + '/images/**/*'], 'restart-serv');
});

// Watch Files For Changes on SERVER
gulp.task('restart-serv', function () {
  utils.killAndRestartServer('node', 'gulp start-serv');
});

// Watch Files For Changes on SERVER
gulp.task('watch-serv', function () {
  gulp.watch([serverAppPath + '/**/*.js'], ['jshint']);
});

// Build Production Files, the Default Task
gulp.task('def', ['clean'], function (cb) {
  runSequence('test', 'copy', ['styles', 'images', 'fonts'], 'vulcanize' , cb);
});

gulp.task('dev-build', ['clean'], function (cb) {
  runSequence('copy', ['styles', 'images', 'fonts'], 'vulcanize' , cb);
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
//TODO: add watch task

gulp.task('start-serv', function(){
  var serverOptions = {
      path: serverBuildPath + '/app.js',
      execArgv: [ '--harmony' ]
  };

  var platform = os.platform();
  //TODO: osx and ubunt have same platform, but in linux
  // browser's name should be google-chrome
  var chrome = platform === 'win32'?'chrome':'Google Chrome';

  var browserOpenerOptions = {
    //TODO: move port to config
    url: "http://"+utils.getLocalIP()+":3000",
    app: chrome
  };

// If server side's coffee files changed, compile these files,
  gulp.src(serverBuildPath)
      .pipe(serverStarter(serverOptions))
      .pipe(gulp.src(clientBuildPath + '/index.html'))
      .pipe(wait(1500))
      .pipe(open("", browserOpenerOptions));
});


gulp.task('start-dev', function() {
   runSequence('def', 'start-serv');
});

// Debug Production Server
gulp.task('debug-dist', ['def'], shell.task([
  'cd ' + serverBuildPath + ' && node-debug app.js --client ' + (optimist.argv.client_app || "angular")])
);

// Debug Dev Server
gulp.task('debug', shell.task([
  'cd ' + serverAppPath + ' && node-debug app.js --client ' + (optimist.argv.client_app || "angular")])
);

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}