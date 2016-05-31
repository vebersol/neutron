var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var u = require('./utilities');

var layoutHandler = function () {
	var layouts = {};

	function getLayouts(source, layout) {
		var layoutName = layout ? layout : u.settings.defaultLayoutName;

		fse.walk(u.settings.layoutsDir)
			.on('data', function(file) {
				if (path.extname(file.path) === u.settings.fileExtension) {
					fse.readFile(file.path, u.settings.encode, function(err, layoutSource) {
						layouts[layoutName] = layoutSource;
					});
				}
			});

			return true;
	}

	function addLayout(source, layout) {
		var layoutName = layout ? layout : 'application';
		var layout = layouts[layoutName];

		return layout.replace('{{> yield }}', source);
	}

	return {
		addLayout: addLayout,
		getLayouts: getLayouts
	}
}

module.exports = layoutHandler;
