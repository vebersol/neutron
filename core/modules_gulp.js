module.exports = function(gulp) {
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');
	var rename = require('gulp-rename');  
	var uglify = require('gulp-uglify');
	var sourcemaps = require('gulp-sourcemaps');
	
	gulp.task('sass:navigation', function() {
		return gulp.src('./core/modules/navigation/scss/*.scss')
			.pipe(sass().on('error', sass.logError))
			.pipe(gulp.dest('./public/styleguide/modules/navigation/css'));
	});

	gulp.task('js:navigation', function() {
		var dest = './public/styleguide/modules/navigation/js'
		return gulp.src(['./core/modules/navigation/js/libs/zepto.js', './core/modules/navigation/js/libs/prism.js', './core/modules/navigation/js/main.js'])
			.pipe(concat('scripts.js'))
			.pipe(gulp.dest(dest))
			.pipe(rename('scripts.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(dest))
	});

	gulp.task('copy:navigation', function() {
		gulp.src('./core/modules/navigation/template/index.html', {
			base: './core/'
		})
			.pipe(gulp.dest('./public/styleguide/'));
	});

	gulp.task('watch:navigation', function() {
		gulp.watch(['./core/modules/navigation/js/**/*.js'], ['js:navigation']);
		gulp.watch(['./core/modules/navigation/scss/**/*.scss'], ['sass:navigation']);
		gulp.watch(['./core/modules/navigation/template/**/*.html'], ['copy:navigation']);
	});
}