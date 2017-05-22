"use strict";

const settings = require('../core/libs/settings');
const u = require('../core/libs/utilities');
const fse = require('fs-extra');

let cb;

const copy = (callback) => {

	cb = callback || null;

	let publicAssets = u.getAppPath(settings.paths.public.assets);

	u.log('Copy Assets', 'title');

	u.log('Start removing assets from public folder', 'info');

	fse.removeSync(publicAssets);

	u.log('Assets removed from public folder!', 'success');

	u.log('Start copying assets', 'info');

	fse.copy(u.getAppPath(settings.paths.src.assets), publicAssets, err => {
		if (err) {
			return u.log(err, 'error');
		}

		u.log('Assets copy successfull!', 'success');

		if (cb) {
			cb();
		}
	});
}

module.exports = copy;
