var fse = require('fs-extra');
var u = require('./utilities');

module.exports.libTemplates = function () {
	var _self = this;
	this.loadTemplate = function () {
		return fse.readFile(__dirname + '/lib-template.html', u.settings.encode, function(err, data) {
			if (err) {
				u.log(err, 'error');
			}
			_self.template = data;
		});
	}

	this.getTemplate = function () {
		return this.template;
	}

	this.loadTemplate();

	return this;
}