var handlebars = require('handlebars');
var fse = require('fs-extra');
var path = require('path');

var settings = require('../neutron.json');

var u = require('./utilities');

partials = function () {
	var registeredPartials = [];
	var reverseDependencies = {};

	function getPartialName(filePath) {
		var breakPath = filePath.split('patterns' + path.sep);
		return breakPath[1]
			.replace(settings.fileExtension, '')
			.replace(/\\/g, '/');
	}

	function setPartial(name, source) {
		handlebars.registerPartial(name, source);
	}

	function getPartialsData(pattern) {
		var regex = /{{\s?(>|render)(.*?)}}/g,
			match = pattern.source.match(regex),
			newData = pattern.data ? pattern.data : {};

		var partialName = getPartialName(pattern.file.path)
		var dependenciesList = getPartialsNames(match);
		var cleanDependenciesList = dependenciesList.removeDuplicates();

		setReverseDependence(partialName, cleanDependenciesList);

		return {
			data: newData,
			partials: cleanDependenciesList
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

	function setReverseDependence(partial, dependencies) {
		var url = getPatternFolder(partial) + '/index.html';

		if (dependencies.length > 0) {
			dependencies.forEach(function (dependency) {
				var partialData = {
					partial: partial,
					path: url
				}
				if (reverseDependencies.hasOwnProperty(dependency)) {
					reverseDependencies[dependency].push(partialData);
				}
				else {
					reverseDependencies[dependency] = [partialData];
				}
			});
		}
	}

	return {
		registeredPartials: registeredPartials,
		reverseDependencies: reverseDependencies,
		getPartialName: getPartialName,
		getPartialsNames: getPartialsNames,
		setPartial: setPartial,
		getPartialsData: getPartialsData,
		getPatternFolder: getPatternFolder,
		isHiddenPartial: isHiddenPartial
	}
};

module.exports = partials;
