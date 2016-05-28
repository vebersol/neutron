var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var u = require('./utilities');

var layoutHandler = function () {
	this.layouts = {};
}

layoutHandler.prototype = {
	getLayouts: function (source, layout) {
		var layoutName = layout ? layout : u.settings.defaultLayoutName;
		var parent = this;

		fse.walk(u.settings.layoutsDir)
			.on('data', function(file) {
				if (path.extname(file.path) === u.settings.fileExtension) {
					fse.readFile(file.path, u.settings.encode, function(err, layoutSource) {
						parent.layouts[layoutName] = layoutSource;
					});
				}
			});

			return true;
	},

	addLayout: function (source, layout) {
		var layoutName = layout ? layout : 'application';
		var layout = this.layouts[layoutName];

		return layout.replace('{{> yield }}', source);
	}
}

module.exports = layoutHandler;
