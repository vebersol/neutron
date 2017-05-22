"use strict";

const fse = require('fs-extra');
const chokidar = require('chokidar');
const navigation = require('./navigation');
const neutron = require('./neutron');
const copy = require('./copy');
const settings = require('../core/libs/settings');
const u = require('../core/libs/utilities');

let cb;

const init = (callback) => {

	u.log('===================', 'title');
	u.log('Watch neutron files', 'title');
	u.log('===================', 'title');
	u.log('');

	cb = callback || null;

	u.log('');
	u.log('Setting up files to watch...', 'info');
	u.log('');

	chokidar.watch([
		'neutron.json',
		settings.paths.src.data + '**',
		settings.paths.src.layouts + '**',
		settings.paths.src.patterns + '**',
		settings.paths.core.templates + '**',
		settings.paths.core.helpers + '**'
	], {
		persistent: true,
		ignoreInitial: true
	}).on('all', () => {
		neutron();
	});

	chokidar.watch([
		'core/modules/navigation/**'
	], {
		ignored: 'core/modules/navigation/js/templates.js',
		persistent: true,
		ignoreInitial: true
	}).on('all', (event, path) => {
		navigation();
	});

	chokidar.watch([
		settings.paths.src.assets + '**'
	], {
		persistent: true,
		ignoreInitial: true
	}).on('all', (event, filePath) => {
		let target = filePath.replace('web', 'public');

		fse.copy(u.getAppPath(filePath), target, err => {
			if (err) {
				return u.log(err, 'error');
			}

			u.log(filePath + ' copy successfull!', 'success');
			u.log('');
		});
	});

	u.log('');
	u.log('Watching files...', 'success');
	u.log('');

	if (cb) {
		return cb();
	}
}

module.exports = init;
