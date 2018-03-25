var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var extender = require('gulp-html-extend');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var mainBowerFiles = require('main-bower-files');
var autoprefixer = require('gulp-autoprefixer');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var argv = require('yargs').argv;
var gls = require('gulp-live-server');
var open = require('open');
var templateCache = require('gulp-angular-templatecache');
var runSequence =  require('run-sequence');
var browserSync = require('browser-sync').create();
var config = require('./config.js');
var htmlmin = require('gulp-htmlmin');

var server = null;

var paths = {
  // Files to transfer directly to dist
  'transfer': [
                './src/static/**/*'
                // ,'./path/to/folder.orFile'
              ],
  // distribution paths
  'dist': {
    'root': './dist',
    'all': './dist/**/*',
		'scripts': [
			'./dist/vendor.min.js',
			'./dist/templates.js',
			'./dist/app.min.js'
		]
  },
  // source files
  'src': {
    'css': './src/styles/style.scss',
    'html': './src/index.html',
    'js': ['./src/scripts/app.js', './src/scripts/**/*.js'],
    'templates': './src/scripts/**/*.html',
    'graphics': './src/icons/*.svg'
  },
  // watch paths
  'watch': {
    'html': ['./src/index.html', './src/html/**/*.html'],
    'js': './src/scripts/**/*.js',
    'css': './src/**/*.scss',
    'templates': './src/scripts/**/*.html',
    'graphics': './src/icons/*.svg',
    'server': ['{server,config}.js', './{schemas,routes,services}/*.js']
  }
};

gulp.task('default', ['serve']);
gulp.task('serve', function(cb) {
	return runSequence('build', 'development', cb);
});
gulp.task('build', function(cb) {
	return runSequence('clean', ['transfer', 'graphics', 'extend', 'style', 'script'], cb);
});
gulp.task('development', function(cb) {
	return runSequence('webserver', ['watch'], cb);
});

/**
  This function will remove all files and folders from the
  dist folder. 
**/
gulp.task('clean', function() {
  return del(paths.dist.all, {force:true, read: false});
});

/**
 * Task to directly transfer files listed in paths.transfer. Does no
 * modification to files.
 */
gulp.task('transfer', function(){
  return gulp.src(paths.transfer)
    .pipe(gulp.dest(paths.dist.root));
});

/**
  This function will expand the index file (srcIndex) and 
  place the expanded source to the dist folder. Will also
  call for a live reload.
**/
gulp.task('extend', function () {
  return gulp.src(paths.src.html)
    .pipe(extender({annotations:false,verbose:false}))
		.pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.dist.root));
});

/**
  This function will compile any LESS files inside 
  paths.sec.less, add sourcemaps, minify the css, and output
  it to the /dist folder. Will also call for a live reload.
**/
gulp.task('style', function() {
  return gulp.src(paths.src.css)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', errorCallback))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulpif(!argv.production, sourcemaps.write()))
    .pipe(gulp.dest(paths.dist.root));
});
 
/**
  This function will concatenate srcJS files (in order of 
  array), add sourcemaps, and output to dist folder. Will 
  also trigger a live reload.
**/
gulp.task('script', function() {
	runSequence(['scripts:internal', 'scripts:external', 'scripts:templates'], 'scripts:combined');
});

gulp.task('scripts:internal', function() {
  return gulp.src(paths.src.js)
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(uglify({mangle: false}).on('error', errorCallback))
    .pipe(gulpif(!argv.production, sourcemaps.write()))
    .pipe(gulp.dest(paths.dist.root));
});

gulp.task('scripts:external', function(){
  return gulp.src(mainBowerFiles('**/*.js'))
    .pipe(sourcemaps.init())
    .pipe(concat('vendor.min.js'))
    .pipe(gulpif(!argv.production, sourcemaps.write(), uglify()))
    .pipe(gulp.dest(paths.dist.root));
});

gulp.task('scripts:combined', function() {
	gulp.src(paths.dist.scripts)
    .pipe(sourcemaps.init({loadMaps: true}))
		.pipe(concat('wingscheap-combined.min.js'))
    .pipe(gulpif(!argv.production, sourcemaps.write()))
		.pipe(gulp.dest(paths.dist.root));
});

/**
 * JS templates to be transfered directly to dist folder
 */
gulp.task('scripts:templates', function(){
  return gulp.src(paths.src.templates)
			.pipe(htmlmin({collapseWhitespace: true}))
      .pipe(templateCache({
        standalone: true
      }))
      .pipe(gulp.dest(paths.dist.root));
});

/**
 * Function will take in all svg graphics and minify them,
 * and will then create a spritesheet.
 */
gulp.task('graphics', function() {
  return gulp.src(paths.src.graphics)
      .pipe(svgmin())
      .pipe(svgstore())
      .pipe(gulp.dest(paths.dist.root));
});

/**
  This function will watch path watch files for changes,
  and if changes are detected (via livereload command),
  will compile the changed file.
**/
gulp.task('watch', function(){
  gulp.watch(paths.watch.server, function() {
		server.start.bind(server)();
	});
  gulp.watch(['./dist/**/*', '!./dist/app.min.js'], function (file) {
    server.notify.apply(server, [file]);
  });
  gulp.watch(paths.watch.css, ['style']);
  gulp.watch(paths.watch.html, ['extend']);
  gulp.watch(paths.watch.js, ['script']);
  gulp.watch(paths.watch.templates, ['script']);
  gulp.watch(paths.transfer, ['transfer']);
  gulp.watch(paths.watch.graphics, ['graphics']);
});

gulp.task('webserver', function(){
  server = gls.new('server.js', {env: {fromGulp: true}}, config.port);
	server.start();
	open('http://localhost:' + config.port);
});

gulp.task('browser-sync', function() {
    browserSync.init({
			port: 3001,
      proxy: "localhost:" + config.port
    });
});

var errorCallback = function(err){
    gutil.log(gutil.colors.red('------ERROR------\n'+err.message));
    gutil.beep();
    this.emit('end');
};