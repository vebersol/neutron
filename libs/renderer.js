var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var u = require('./utilities');
var partials = require('./partials');
var layouts = require('./layouts');

var democritus = function () {
	var _self = this;
	this.patternsData = {};

	this.init = function () {
		layouts.getLayouts();
		this.cleanPaths(this.getPatterns);
	};

	this.getPatterns = function () {
		return fse.walk(u.settings.patternsDir)
			.on('data', _self.openPattern)
			.on('end', _self.walkEnded);
	}

	this.openPattern = function (file) {
		if (path.extname(file.path) === u.settings.fileExtension) {
			try {
				_self.getData(file.path, function (data) {
					fse.readFile(file.path, u.settings.encode, function(err, source) {
						if (source) {
							_self.handlePattern({
								file: file,
								source: source,
								data: data
							});
						}
					});
				});
			} catch (e) {
				u.log(e, 'error');
			}
		}
	}

	this.handlePattern = function (pattern) {
		var partialData = partials.getPartialsData(pattern.source, pattern.data ? pattern.data : {}, _self.patternsData);
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path)
		var registerPartial = partials.setPartial(partialName, pattern.source);
		var layout = layouts.addLayout(pattern.source, newData.layout);

		newData.democritusData = _self.buildDemocritusCodes({
			html: layout,
			partials: partialsList
		});

		var template = handlebars.compile(layout);
		var result = _self.getHtml(template, newData);

		var output = {
			partialName: partialName,
			html: result
		};

		_self.renderFile(output);
	}

	this.walkEnded = function () {
		u.log('Files rendered', 'success');
	}

	this.buildDemocritusCodes = function (options) {
		var dependencies = [];
		options.partials.forEach(function (k, i) {
			dependencies.push({
				partial: k,
				path: u.settings.webPath + k + '.html'
			});
		});

		return '<script> var dependencies = ' + JSON.stringify(dependencies) + '</script>';
	}

	this.getData = function (fileName, callback) {
		var jsonFile = fileName.replace(u.settings.fileExtension, '.json');

		fse.stat(jsonFile, function(err, stat) {
			var jsonData;
			if (!err) {
				delete require.cache[require.resolve(jsonFile)];
				jsonData = require(jsonFile);
				_self.patternsData[partials.getPartialName(fileName)] = jsonData;
			}

			if (callback) {
				callback(jsonData);
			}
		});
	}

	this.renderFile = function (fileInfo, file) {
		var partialName = u.DS !== '/' ? fileInfo.partialName.replace(/\//g, '\\') : partialName;
		var filePath = u.rootPath + u.DS + 'public' + u.DS + 'patterns' + u.DS + partialName + '.html';
		fileArr = filePath.split(u.DS);
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		var pathX = fileArr.join(u.DS);

		mkdirp(pathX, function (err) {
			fse.open(filePath, 'w', function(err, fd) {
				fse.writeFile(filePath, fileInfo.html, u.settings.encode, function (err) {
					if (err) {
						u.log(err, 'error');
					}
				});
			});
		});
	}

	this.getHtml = function (template, data) {
		try {
			return template(data);
		}
		catch(err) {
			u.log(err.message, 'error');
			return 'ERROR: ' + err.message;
		}
	}

	this.cleanPaths = function (callback) {
		rimraf(u.settings.publicPatternsPath, function () {
			u.log('cleaning up patterns folder before recreate');
			mkdirp(u.settings.publicPatternsPath, function(err) {
				if (err) {
					u.log(err, 'error');
				}

				callback();
			});
		});
	}

	this.init();

	return this;
}

module.exports.democritus = new democritus();