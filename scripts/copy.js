"use strict";

const settings = require('../neutron.json');
const u = require('../core/libs/utilities');
const fse = require('fs-extra');

const copy = () => {
	let publicAssets = u.getPath(settings.paths.public.assets);

	u.log('Copy Assets', 'title');
	u.log('');

	u.log('Start removing assets from public folder', 'info');
	u.log('');

	fse.removeSync(publicAssets);

	u.log('Assets removed from public folder!', 'success');
	u.log('');

	u.log('Start copying assets', 'info');
	u.log('');

	fse.copy(u.getPath(settings.paths.src.assets), publicAssets, err => {
		if (err) {
			return u.log(err, 'error');
		}

		u.log('Assets copy successfull!', 'success');
	});
}

copy();
