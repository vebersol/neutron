"use strict";

const fse = require('fs-extra');
const u = require('./utilities');
const settingsTarget = u.getPath(process.cwd(), '/neutron.json');
let settings;

const getSettings = function () {

	if (fse.existsSync(settingsTarget)) {
		return require(u.getAppPath(process.cwd(), '/neutron.json'));
	}

	return require(u.getPath('./', '/neutron.json'));
}

settings = getSettings();

module.exports = settings;
