'use strict';

var gulp = require('gulp');
var path = require('path');
var del = require('del');
var connect = require('gulp-connect');

require('gulp-load')(gulp);

gulp.loadTasks(__dirname + '/core/modules_gulp.js');
gulp.loadTasks(__dirname + '/libs/engine_gulp.js');

gulp.task('clean', function(cb) {
	del.sync([
		path.resolve('public/patterns', '*'),
		path.resolve('public/markups', '*'),
		path.resolve('public/data', '*')
	], {force: true});
	cb();
});

gulp.task('connect', function () {
	connect.server({
		root: ['public'],
		port: 8080
	});
});

gulp.task('engine-watch', ['engine'], function (cb) {
	cb();
});

gulp.watch(
    [
      './src/patterns/*.handlebars',
      './src/layouts/*.handlebars',
      './src/patterns/*.json',
      './src/css/*.css',
      './src/data/*.json',
    ],
    ['engine-watch']
);

// gulp.watch(['./src/**/*.handlebars', './core/*.html'], ['engine']);
gulp.watch('./core/modules/navigation/js/**/*.js', ['js:navigation']);
gulp.watch('./core/modules/navigation/scss/**/*.scss', ['sass:navigation']);
gulp.watch('./core/modules/navigation/template/**/*.html', ['copy:navigation']);

gulp.task('navigation', ['sass:navigation', 'js:navigation', 'copy:navigation']);
gulp.task('default', ['navigation', 'engine']);
gulp.task('server', ['navigation', 'engine', 'connect']);
