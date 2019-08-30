var fse = require('fs-extra');
var klawSync = require('klaw-sync')
var u = require('./utilities');
var settings = require('./settings');
var handlebars = require('handlebars');
var path = require('path');

module.exports = (function() {
	'use strict';
	let importedHelpers = {};

	if (fse.existsSync(u.getAppPath(settings.paths.src.helpers))) {
		let paths = klawSync(u.getAppPath(settings.paths.src.helpers))

		paths.forEach(file => {
			if (path.extname(file.path) === '.js') {
				importedHelpers = Object.assign(require(file.path)(handlebars), importedHelpers);
			}
		});
	}


	let nativeHelpers = {
		contentFor(name, options) {
			var blocks = this._blocks || (this._blocks = {});
			var block = blocks[name] || (blocks[name] = []);

			block.push(options.fn(this));
		},

		outputFor(name) {
			var blocks = this._blocks;
			var content = blocks && blocks[name];
			var html = content ? content.join('\n') : '';

			if (content) {
				delete this._blocks[name];
			}

			return new handlebars.SafeString(html);
		},

		resetHelpers() {
			this._blocks = {};
		}
	};

	return Object.assign(importedHelpers, nativeHelpers);
})();
