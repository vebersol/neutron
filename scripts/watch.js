"use-strict";

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

	cb = callback || cb;

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
		'neutron.json',
		'core/modules/navigation/**/*'
	], {
		ignored: 'core/modules/navigation/js/templates.js',
		persistent: true,
		ignoreInitial: true
	}).on('all', (event, path) => {
		navigation();
	});

	chokidar.watch([
		'neutron.json',
		'src/assets'
	], {
		ignored: 'core/modules/navigation/js/templates.js',
		persistent: true,
		ignoreInitial: true
	}).on('all', (event, path) => {
		copy();
	});

	u.log('');
	u.log('Watching files...', 'success');
	u.log('');

	if (cb) {
		cb();
	}
}

module.exports = init;
