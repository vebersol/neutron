var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');

var settings = require('../neutron.json');

var u = require('./utilities');

var layoutHandler = function () {
	var layouts = {};
	var header;
	var footer;

	function init() {
		header = fse.readFileSync(u.getPath(settings.paths.core.templates, 'header.html'), settings.encode);
		footer = fse.readFileSync(u.getPath(settings.paths.core.templates, 'footer.html'), settings.encode);

		setHelpers();
		getLayouts();
	}

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
		// $ for helpers
		handlebars.registerHelper('$yield', function (partial, data) {
			return new handlebars.SafeString(this._yield);
		});

		// $$ for partials
		handlebars.registerPartial('$$engineHeader', header);
		handlebars.registerPartial('$$engineFooter', footer);
	}

	function renderLayout(data, compiledPattern) {
		var layoutName = data.layout ? data.layout : 'application';

		var layout = layouts[layoutName];
		var template = handlebars.compile(layout);
		data._yield = compiledPattern;

		return template(data);
	}

	init();

	return {
		getLayouts: getLayouts,
		renderLayout: renderLayout
	}
}

module.exports = layoutHandler;
