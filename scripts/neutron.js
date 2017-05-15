"use strict";

const path = require('path');
const u = require('../core/libs/utilities');
const currentDir = u.getAppPath(process.cwd());
const settings = require(u.getPath('core/libs', '/settings'));
const del = require('del');
const engine = require('../core/libs/engine.js');

let cb;

const init = function(callback) {
	if (callback) {
		cb = () => {
			setTimeout(() => { callback(); }, 0);
		}
	}

	u.log('===========================', 'title');
	u.log('Neutron: Atomic Design Tool', 'title');
	u.log('===========================', 'title');
	u.log('');

	clean(engine);
}

const clean = (callback) => {
	u.log('Neutron: Start cleaning up public folder', 'info');
	u.log('');
	del([
		u.getAppPath(path.resolve(settings.paths.public.data, '*')),
		u.getAppPath(path.resolve(settings.paths.public.markups, '*')),
		u.getAppPath(path.resolve(settings.paths.public.patterns, '*'))
	], {
		force: true
	}).then(paths => {
		u.log('Neutron: Clean up is done!', 'success');
		u.log('');
		callback(cb);
	});
}

module.exports = init;
