var handlebars = require('handlebars');
var path = require('path');
var u = require('./utilities');

module.exports = {
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
				newData = Object.assign(patternsData[partialNames[i]], newData);
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
				var cleanString = k.replace('{{>', '').replace('}}').trim();
				var partialName = cleanString.split(' ')[0];

				partialNames.push(partialName);
			});
		}

		return partialNames;
	}
}