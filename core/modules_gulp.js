module.exports = function(gulp) {
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');
	var rename = require('gulp-rename');
	var uglify = require('gulp-uglify');
	var sourcemaps = require('gulp-sourcemaps');
	var wrap = require("gulp-wrap");
	var template = require('gulp-template-compile');

	var settings = require('../neutron.json');
	var u = require('../libs/utilities');

	gulp.task('sass:navigation', function() {
		return gulp.src(u.getPath(settings.paths.core.root, 'modules/navigation/scss/*.scss'))
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(u.getPath(settings.paths.src.styleguides, 'modules/navigation/css')));
	});

	gulp.task('js:navigation', ['jstemplate'], function() {
		var dest = u.getPath(settings.paths.src.styleguides, 'modules/navigation/js');

		return gulp.src([
				u.getPath(settings.paths.core.root, 'modules/navigation/js/templates.js'),
				u.getPath(settings.paths.core.root, 'modules/navigation/js/libs/**/*.js'),
				u.getPath(settings.paths.core.root, 'modules/navigation/js/components/**/*.js'),
				u.getPath(settings.paths.core.root, 'modules/navigation/js/app.js')
			])
			.pipe(sourcemaps.init())
			.pipe(concat('scripts.min.js'))
			.pipe(wrap("(function() {\n\n <%= contents %> \n\n})();"))
			.pipe(uglify({
				compress: {
					negate_iife: false
				}
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(dest));
	});

	gulp.task('jstemplate', function() {
		gulp.src(u.getPath(settings.paths.core.root, 'modules/navigation/template/index.html'))
		.pipe(template({
			namespace: 'NADTJST'
		}))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest(u.getPath(settings.paths.core.root, 'modules/navigation/js/')));
	});
}
