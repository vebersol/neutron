var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');

var settings = require('../neutron.json');

var u = require('./utilities');

var layoutHandler = function () {
	var layouts = {};

	function getLayouts() {
		fse.walk(settings.paths.src.layouts)
			.on('data', function(file) {
				if (path.extname(file.path) === settings.fileExtension) {
					var layoutName = path.basename(file.path, settings.fileExtension);
					fse.readFile(file.path, settings.encode, function(err, layoutSource) {
						layouts[layoutName] = layoutSource;
					});
				}
			});

			return true;
	}

	function setHelpers() {
		handlebars.registerHelper('$yield', function (partial, data) {
			return new handlebars.SafeString(this._yield);
		});
	}

	function renderLayout(data, compiledPattern) {
		var layoutName = data.layout ? data.layout : 'application';

		var layout = layouts[layoutName];
		var template = handlebars.compile(layout);
		data._yield = compiledPattern;

		return template(data);
	}

	setHelpers();

	return {
		getLayouts: getLayouts,
		renderLayout: renderLayout
	}
}

module.exports = layoutHandler;
