'use strict';

var gulp = require('gulp');
var path = require('path');
var del = require('del');
var connect = require('gulp-connect');
var settings = require('./democritus.json');
var u = require('./libs/utilities');

require('gulp-load')(gulp);

gulp.loadTasks(u.getPath(settings.paths.core.root, 'modules_gulp.js'));
gulp.loadTasks(u.getPath(settings.paths.libs.root, 'engine_gulp.js'));

gulp.task('clean', function(cb) {
	del.sync([
		path.resolve(settings.paths.public.patterns, '*'),
		path.resolve(settings.paths.public.markups, '*'),
		path.resolve(settings.paths.public.data, '*')
	], {force: true});
	cb();
});

gulp.task('connect', function () {
	connect.server({
		root: [settings.paths.public.root],
		port: 8080
	});
});

gulp.watch([
	u.getPath(settings.paths.src.patterns, '**/*.handlebars'),
	u.getPath(settings.paths.src.patterns, '**/*.json'),
	u.getPath(settings.paths.src.layouts, '**/*.handlebars'),
	u.getPath(settings.paths.src.data, '**/*.json')
], ['engine']);

gulp.watch('./core/modules/navigation/js/**/*.js', ['js:navigation']);
gulp.watch('./core/modules/navigation/scss/**/*.scss', ['sass:navigation']);
gulp.watch('./core/modules/navigation/template/**/*.html', ['copy:navigation']);

gulp.task('navigation', ['sass:navigation', 'js:navigation', 'copy:navigation']);
gulp.task('default', ['navigation', 'engine']);
gulp.task('server', ['navigation', 'engine', 'connect']);
