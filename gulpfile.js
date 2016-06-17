'use strict';

var path = require('path');
var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var connect = require('gulp-connect');
var del = require('del');
var settings = require('./neutron.json');
var u = require('./libs/utilities');

require('gulp-load')(gulp);

gulp.loadTasks(u.getPath(settings.paths.core.root, 'modules_gulp.js'));
gulp.loadTasks(u.getPath(settings.paths.libs.root, 'engine_gulp.js'));

gulp.task('clean', function(cb) {
	del([
		path.resolve(settings.paths.public.data, '*'),
		path.resolve(settings.paths.public.markups, '*'),
		path.resolve(settings.paths.public.patterns, '*')
	], {
		force: true
	}).then(function() {
		cb();
	});
});

gulp.task('connect', function() {
	connect.server({
		root: [settings.paths.public.root],
		port: 8080
	});
});

gulp.task('copy:css', function() {
	return gulp.src(['**/*.css', '**/*.css.map'], {
			cwd: u.getPath(settings.paths.src.css)
		})
		.pipe(gulp.dest(u.getPath(settings.paths.public.css)));
});

gulp.task('copy:images', function() {
	return gulp.src(['**/*.gif', '**/*.jpg', '**/*.png', '**/*.svg'], {
			cwd: u.getPath(settings.paths.src.images)
		})
		.pipe(gulp.dest(u.getPath(settings.paths.public.images)));
});

gulp.task('copy:js', function() {
	return gulp.src(['**/*.js', '**/*.js.map'], {
			cwd: u.getPath(settings.paths.src.js)
		})
		.pipe(gulp.dest(u.getPath(settings.paths.public.js)));
});

gulp.task('copy:styleguide', ['js:navigation', 'sass:navigation'], function() {
	gulp.src(['**/*.css', '**/*.js', '**/*.map'], {
		cwd: u.getPath(settings.paths.src.styleguides)
	})
		.pipe(gulp.dest(u.getPath(settings.paths.public.styleguides)))
});

gulp.task('watch:patterns', function() {

	watch([
		u.getPath(settings.paths.src.patterns, '**/*' + settings.fileExtension),
		u.getPath(settings.paths.src.patterns, '**/*.json'),
		u.getPath(settings.paths.src.layouts, '**/*' + settings.fileExtension),
		u.getPath(settings.paths.src.data, '**/*.json')
	], {
		verbose: true
	}, batch(function(events, cb) {
		gulp.start('engine', cb);
	}));
});

gulp.task('watch:navigation', ['copy:styleguide'], function() {
	gulp.watch([
		'./core/modules/navigation/js/**/*.js',
		'./core/modules/navigation/template/**/*.html',
		'./core/modules/navigation/scss/**/*.scss',
		'!./core/modules/navigation/js/templates.js'
	], ['copy:styleguide']);
})


gulp.task('copy:all', ['copy:js', 'copy:css', 'copy:images', 'copy:styleguide']);
gulp.task('navigation', ['copy:styleguide']);
gulp.task('default', ['navigation', 'copy:all', 'engine']);
gulp.task('server', ['engine', 'watch:patterns', 'watch:navigation', 'connect']);
