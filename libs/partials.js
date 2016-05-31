var handlebars = require('handlebars');
var fse = require('fs-extra');
var path = require('path');
var u = require('./utilities');

partials = function () {
	var registeredPartials = [];

	function getPartialName(filePath) {
		var breakPath = filePath.split('patterns' + u.DS);
		return breakPath[1]
			.replace(u.settings.fileExtension, '')
			.replace(/\\/g, '/');
	}

	function setPartial(name, source) {
		handlebars.registerPartial(name, source);
	}

	function getPartialsData(source, data, patternsData) {
		var regex = /{{>(.*?)}}/g,
			match = source.match(regex),
			newData = data;

		var partialNames = getPartialsNames(match);
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
	}
	
	function getPartialsNames(match) {
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

	return {
		registeredPartials: registeredPartials,
		getPartialName: getPartialName,
		getPartialsNames: getPartialsNames,
		setPartial: setPartial,
		getPartialsData: getPartialsData
	}
};

module.exports = partials;
