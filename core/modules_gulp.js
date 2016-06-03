module.exports = function(gulp) {
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');
	var rename = require('gulp-rename');
	var uglify = require('gulp-uglify');
	var sourcemaps = require('gulp-sourcemaps');
	var wrap = require("gulp-wrap");

	var settings = require('../democritus.json');
	var u = require('../libs/utilities');

	gulp.task('sass:navigation', function() {
		return gulp.src(u.getPath(settings.paths.core.root, 'modules/navigation/scss/*.scss'))
			.pipe(sass().on('error', sass.logError))
			.pipe(gulp.dest(u.getPath(settings.paths.src.styleguides, 'modules/navigation/css')));
	});

	gulp.task('js:navigation', function() {
		var dest = u.getPath(settings.paths.src.styleguides, 'modules/navigation/js');

		return gulp.src([
				u.getPath(settings.paths.core.root, 'modules/navigation/js/libs/zepto.js'),
				u.getPath(settings.paths.core.root, 'modules/navigation/js/libs/prism.js'),
				u.getPath(settings.paths.core.root, 'modules/navigation/js/main.js'),
			])
			.pipe(concat('scripts.js'))
			.pipe(wrap("(function() {\n\n <%= contents %> \n\n})();"))
			.pipe(gulp.dest(dest))
			.pipe(rename('scripts.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(dest));
	});

	gulp.task('html:navigation', function() {
		gulp.src(u.getPath(settings.paths.core.root, 'modules/navigation/template/index.html'), {
			base: u.getPath(settings.paths.core.root)
		})
			.pipe(gulp.dest(u.getPath(settings.paths.src.styleguides)));
	});
}
