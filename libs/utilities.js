var path = require('path');
var util = require('util');
var args = process.argv;
var isTest = args.indexOf('-t') > -1;
var userSettings = !isTest ?
	require('../democritus.json') : require('../spec/config.json');

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
	var rootPath;
	if (isTest) {
		rootPath = path.dirname(require.main.filename).replace(path.sep + 'libs', '');
	}
	else {
		rootPath = path.dirname(require.main.filename).replace(path.sep + 'libs', '');
	}
	return rootPath;
}

module.exports.rootPath = getRootPath();

var getSettings = function (settings) {
	var defaultSettings = {
		globalDataDir: '#{rootPath}/src/data',
		patternsDir: '#{rootPath}/src/patterns',
		fileExtension: '.handlebars',
		encode: 'utf8',
		publicDataPath: '#{rootPath}/public/data',
		publicPatternsPath: '#{rootPath}/public/patterns',
		publicMarkupsPath: '#{rootPath}/public/markups',
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
