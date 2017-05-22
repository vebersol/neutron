"use strict";

const browserSync = require('browser-sync');
const browserSyncConfig = require('../.browser-sync');
const u = require('../core/libs/utilities');

let cb;

const init = (callback) => {

	cb = callback || null;

	u.log('Starting webserver', 'title');

	browserSync(browserSyncConfig, () => {
		u.log('Webserver started', 'success');

		if (cb) {
			return cb();
		}
	});
}

module.exports = init;
