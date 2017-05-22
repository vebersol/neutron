"use strict";

const path = require('path');
const u = require('../core/libs/utilities');
const currentDir = u.getAppPath(process.cwd());
const settings = require(u.getPath('core/libs', '/settings'));
const del = require('del');
const engine = require('../core/libs/engine.js');

let cb;

const init = function(callback) {
	cb = callback || null;

	u.log('Neutron: Atomic Design Tool', 'title');

	clean(engine);
}

const clean = engine => {
	u.log('Neutron: Start cleaning up public folder', 'info');
	del([
		u.getAppPath(path.resolve(settings.paths.public.data, '*')),
		u.getAppPath(path.resolve(settings.paths.public.markups, '*')),
		u.getAppPath(path.resolve(settings.paths.public.patterns, '*'))
	], {
		force: true
	}).then(paths => {
		u.log('Neutron: Clean up is done!', 'success');

		engine(cb);
	});
}

module.exports = init;
