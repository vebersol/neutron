const browserSync = require('browser-sync');
const browserSyncConfig = require('../.browser-sync');
const u = require('../core/libs/utilities');

let cb;

const init = (callback) => {

	cb = callback || null;

	u.log('==================', 'title');
	u.log('Starting webserver', 'title');
	u.log('==================', 'title');
	u.log('');

	browserSync(browserSyncConfig, () => {
		u.log('');
		u.log('Webserver started', 'success');
		u.log('');

		if (cb) {
			cb();
		}
	});
}

module.exports = init;
