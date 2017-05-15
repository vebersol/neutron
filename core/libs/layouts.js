var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');

var settings = require('./settings');

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
		fse.readdir(u.getAppPath(settings.paths.src.layouts), (err, files) => {
			if (!err) {
				files.forEach(file => {
					if (path.extname(file) === settings.fileExtension) {
						var layoutName = path.basename(file, settings.fileExtension);

						layouts[layoutName] = fse.readFileSync(u.getAppPath(settings.paths.src.layouts, file), settings.encode);
					}
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
