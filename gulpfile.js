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

gulp.watch('./src/**/*.handlebars', ['engine']);

gulp.task('navigation', ['sass:navigation', 'js:navigation', 'copy:navigation', 'watch:navigation']);
gulp.task('default', ['engine']);
gulp.task('server', ['engine', 'connect']);