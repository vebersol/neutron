var handlebars = require('handlebars');
var fse = require('fs-extra');
var path = require('path');

var settings = require('../neutron.json');

var u = require('./utilities');

partials = function () {
	var registeredPartials = [];
	var hiddenPartials = [];

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
					var name = partialName[1].split(':');
					if (_checkHidden(name[0])) {
						partialNames.push(name[0]);
					}
				}
			});
		}
		return partialNames;
	}

	function getPatternFolder(pattern) {
		return pattern.replace(/\//g, '-');
	}

	function _checkHidden(pattern) {
		if (hiddenPartials.indexOf(pattern) == -1) {
			return true;
		}

		return false;
	}

	function isHiddenPartial(partialName) {
		return /(\/_)/.test(partialName);
	}

	return {
		registeredPartials: registeredPartials,
		hiddenPartials: hiddenPartials,
		getPartialName: getPartialName,
		getPartialsNames: getPartialsNames,
		setPartial: setPartial,
		getPartialsData: getPartialsData,
		getPatternFolder: getPatternFolder,
		isHiddenPartial: isHiddenPartial
	}
};

module.exports = partials;
