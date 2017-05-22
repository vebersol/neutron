var path = require('path');
var util = require('util');
var args = process.argv;
var isTest = args.indexOf('-t') > -1;

module.exports = {
	log: function (message, type) {
		var types = {
				title: '\x1b[45m',
				info: '\x1b[33m',
				error: '\x1b[31m',
				success: '\x1b[32m'
			},
			reset = '\x1b[0m',
			color = reset;

		if (type) {
			color = types[type];
		}

		console.log(color, message, reset);

		if (type === 'title') {
			console.log('');
		}
	},
	getPath: function (dir, filename) {
		if (filename) {
			return path.resolve(__dirname, '../../', dir + filename);
		}

		return path.resolve(__dirname, '../../', dir);
	},
	getAppPath: function (dir, filename) {
		if (filename) {
			return path.resolve(process.cwd(), dir + filename);
		}

		return path.resolve(process.cwd(), dir);
	}
}

// Extend some methods to native functions

Array.prototype.removeDuplicates = function () {
	var a = this;
	return a.filter(function(item, pos) {
		return a.indexOf(item) == pos;
	});
}
