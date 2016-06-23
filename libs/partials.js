var handlebars = require('handlebars');
var fse = require('fs-extra');
var path = require('path');

var settings = require('../neutron.json');

var u = require('./utilities');

partials = function () {
	var registeredPartials = [];

	function getPartialName(filePath) {
		var breakPath = filePath.split('patterns' + path.sep);
		return breakPath[1]
			.replace(settings.fileExtension, '')
			.replace(/\\/g, '/');
	}

	function setPartial(name, source) {
		handlebars.registerPartial(name, source);
	}

	function getPartialsData(source, data) {
		var regex = /{{\s?(>|render)(.*?)}}/g,
			match = source.match(regex),
			newData = data;

		var partialNames = getPartialsNames(match);
		var totalPartials = partialNames.length;

		return {
			data: newData,
			partials: partialNames.removeDuplicates()
		};
	}

	function getPartialsNames(match) {
		var partialNames = [];

		if (match) {
			match.forEach(function (k, v) {
				var partialName = k.match(/["'](.*?)["']/);

				if (partialName && partialName.length > 1) {
					// skip hidden patterns
					if (!isHiddenPartial(partialName[1])) {
						partialNames.push(partialName[1]);
					}
				}
			});
		}
		return partialNames;
	}

	function getPatternFolder(pattern) {
		return pattern.replace(/\//g, '-');
	}

	function isHiddenPartial(partialName) {
		return /(\/_)/.test(partialName);
	}

	return {
		registeredPartials: registeredPartials,
		getPartialName: getPartialName,
		getPartialsNames: getPartialsNames,
		setPartial: setPartial,
		getPartialsData: getPartialsData,
		getPatternFolder: getPatternFolder,
		isHiddenPartial: isHiddenPartial
	}
};

module.exports = partials;
