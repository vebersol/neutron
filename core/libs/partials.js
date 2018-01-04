var handlebars = require('handlebars');
var mustache = require('mustache');
var fse = require('fs-extra');
var path = require('path');

var settings = require('./settings');

var u = require('./utilities');

partials = function () {
	var registeredPartials = [];
	var reverseDependencies = {};
	var hiddenPartials = [];

	function getPartialName(filePath) {
		var breakPath = filePath.split('patterns' + path.sep);
		return breakPath[1]
			.replace(settings.fileExtension, '')
			.replace(/\\/g, '/');
	}

	function getPartial(p) {
		var data = {};
		var match = p.match(/{{>\s?(('|").*?('|"))(.*)}}/);
		var partialName = match && match.length > 1 ? match[1].replace(/[\s'"]/g, '') : false;
		var isStyleModifier = match && match.length > 4 && match[4] && match[4][0] === ':' ? true : false;
		var attr;
		var params;

		if (isStyleModifier) {
			attr = match[4].replace(':', '').split("(");
			var styleModifier = attr[0].split('|').join(' ');
			data['styleModifier'] = styleModifier;
			params = attr.length > 1 ? attr[1].replace(/[\(\)]/g, '') : false;
		} else {
			attr = match && match.length > 4 && match[4].trim().length > 0 ? match[4] : false;
			params = attr ? attr.replace(/[\(\)]/g, '') : false;
		}

		var splitParams = params ? params.split(',') : false;
		if (params) {
			for (var i = 0; i < splitParams.length; i++) {
				var kv = splitParams[i].trim().replace(/:/, '```').split('```');
				data[kv[0].replace(/['"]/g, '')] = kv[1].replace(/['"]/g, '').trim();
			}
		}


		if (partialName) {
			var partialPath = partialName + settings.fileExtension;
			var source = fse.readFileSync(u.getAppPath(settings.paths.src.patterns, partialPath), settings.encode);

			u.log({
				partialName: partialName,
				source: source,
				data: data
			}, 'success');

			return {
				partialName: partialName,
				source: source,
				data: data
			}
		}

		return 'error rendering partial ' + p;
	}

	function setPartial(name, source) {
		handlebars.registerPartial(name, source);
	}

	function getPartialsData(pattern) {
		var regex = /{{\s?(>|render)(.*?)}}/g,
			source = cleanSource(pattern.source),
			match = source.match(regex),
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

	function cleanSource(source) {
		return source.replace(/\r?\n|\r|\t/g, '');
	}

	function resetReverseDependencies () {
		reverseDependencies = {};
	}

	return {
		registeredPartials: registeredPartials,
		reverseDependencies: reverseDependencies,
		hiddenPartials: hiddenPartials,
		getPartialName: getPartialName,
		getPartialsNames: getPartialsNames,
		getPartial: getPartial,
		setPartial: setPartial,
		getPartialsData: getPartialsData,
		getPatternFolder: getPatternFolder,
		isHiddenPartial: isHiddenPartial,
		resetReverseDependencies: resetReverseDependencies
	}
};

module.exports = partials;
