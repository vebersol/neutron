let fse = require('fs-extra');
let u = require('./utilities');
let settings;

const getSettings = function () {
	let settingsTarget = u.getPath(process.cwd(), '/neutron.json');

	if (fse.existsSync(settingsTarget)) {
		return require(u.getAppPath(process.cwd(), '/neutron.json'));
	}

	return require(u.getPath('./', '/neutron.json'));
}

settings = getSettings();

module.exports = settings;
