var handlebars = require('handlebars');
var fse = require('fs-extra');
var path = require('path');
var u = require('./utilities');

partials = function () {
	this.registeredPartials = [];
};

partials.prototype = {
	getPartialName: function (filePath) {
		var breakPath = filePath.split('patterns' + u.DS);
		return breakPath[1]
			.replace(u.settings.fileExtension, '')
			.replace(/\\/g, '/');
	},

	setPartial: function (name, source) {
		handlebars.registerPartial(name, source);
	},

	getPartialsData: function (source, data, patternsData) {
		var regex = /{{>(.*?)}}/g,
			match = source.match(regex),
			newData = data;

		var partialNames = this.getPartialsNames(match);
		var totalPartials = partialNames.length;

		for (var i = 0; i < totalPartials; i++) {
			if (patternsData.hasOwnProperty(partialNames[i])) {
				newData = Object.assign({}, patternsData[partialNames[i]], newData);
			}
		}

		return {
			data: newData,
			partials: partialNames.removeDuplicates()
		};
	},

	getPartialsNames: function (match) {
		var partialNames = [];

		if (match) {
			match.forEach(function (k, v) {
				var cleanString = k.replace('{{>', '').replace('}}', '').trim();
				var partialName = cleanString.split(' ')[0];

				partialNames.push(partialName);
			});
		}
		return partialNames;
	}
};

module.exports = partials;
