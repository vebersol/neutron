var engine = require('./engine.js');
module.exports = function(gulp) {

	gulp.task('engine', ['clean'], function(cb) {
		engine(cb);
	});
}