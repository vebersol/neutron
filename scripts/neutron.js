const path = require('path');
const settings = require('../neutron.json');
const u = require('../core/libs/utilities');
const del = require('del');
const engine = require('../core/libs/engine.js');

const init = function() {
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
		path.resolve(settings.paths.public.data, '*'),
		path.resolve(settings.paths.public.markups, '*'),
		path.resolve(settings.paths.public.patterns, '*')
	], {
		force: true
	}).then(paths => {
		u.log('Neutron: Clean up is done!', 'success');
		u.log('');
		callback();
	});
}

init();
