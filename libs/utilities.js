var path = require('path');
var util = require('util');
var userSettings = require('../democritus.json');

module.exports = {
	DS: path.sep,
	log: function (message, type) {
		var types = {
				error: '\x1b[41m',
				success: '\x1b[42m'
			},
			reset = '\x1b[0m',
			color = reset;

		if (type) {
			color = types[type];
		}

		console.log(color, message, reset);
	}
}


var getRootPath = function () {
	var rootPath = path.dirname(require.main.filename).replace(path.sep + 'libs', '');
	return rootPath;
}

module.exports.rootPath = getRootPath();

var getSettings = function (settings) {
	var defaultSettings = {
		patternsDir: '#{rootPath}/src/patterns',
		allowedPatterns: ['atoms', 'molecules'],
		fileExtension: '.handlebars',
		encode: 'utf8',
		publicPatternsPath: '#{rootPath}/public/patterns',
		layoutsDir: '#{rootPath}/src/layouts',
		defaultLayoutName: 'application',
		webPath: './'
	};
	
	var settings = util._extend(defaultSettings, settings);
	var rootPath = getRootPath();

	Object.keys(settings).forEach(function (k) {
		if (typeof(settings[k]) === 'string') {
			settings[k] = settings[k].replace('#{rootPath}', rootPath);
				//.replace(/\//g, path.sep);
		}
	});

	return settings;
}

module.exports.settings = getSettings(userSettings);

Array.prototype.removeDuplicates = function () {
	var a = this;
	return a.filter(function(item, pos) {
		return a.indexOf(item) == pos;
	});
}