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
	var patternsData = {};

	var init = function () {
		layouts.getLayouts();
		cleanPaths(function () {
			getPatterns();
		});
	};

	var getPatterns = function () {
		fse.walk(u.settings.patternsDir)
			.on('data', function(file) {
				if (path.extname(file.path) === u.settings.fileExtension) {
					try {
						getData(file.path, function (data) {
							fse.readFile(file.path, u.settings.encode, function(err, source) {
								if (source) {
									handlePattern({
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
			})
			.on('end', function () {
				u.log('Files rendered', 'success');
			});
	}

	var handlePattern = function (pattern) {
		var partialData = partials.getPartialsData(pattern.source, pattern.data ? pattern.data : {}, patternsData);
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path);
		var registerPartial = partials.setPartial(partialName, pattern.source);
		var layout = layouts.addLayout(pattern.source, newData.layout);

		newData.democritusData = buildDemocritusCodes({
			html: layout,
			partials: partialsList
		});

		var template = handlebars.compile(layout);
		var result = getHtml(template, newData);

		var output = {
			partialName: partialName,
			html: result
		};

		renderFile(output);
	}

	var buildDemocritusCodes = function (options) {
		var dependencies = [];
		options.partials.forEach(function (k, i) {
			dependencies.push({
				partial: k,
				path: u.settings.webPath + k + '.html'
			});
		});

		return '<script> var dependencies = ' + JSON.stringify(dependencies) + '</script>';
	}

	var getData = function (fileName, callback) {
		var jsonFile = fileName.replace(u.settings.fileExtension, '.json');

		fse.stat(jsonFile, function(err, stat) {
			var jsonData;
			if (!err) {
				delete require.cache[require.resolve(jsonFile)];
				jsonData = require(jsonFile);
				patternsData[partials.getPartialName(fileName)] = jsonData;
			}

			if (callback) {
				callback(jsonData);
			}
		});
	}

	var renderFile = function (fileInfo, file) {
		var partialName = path.sep !== '/' ? fileInfo.partialName.replace(/\//g, '\\') : partialName;
		var filePath = u.rootPath + path.sep + 'public' + path.sep + 'patterns' + path.sep + partialName + '.html';
		fileArr = filePath.split(path.sep);
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		var pathX = fileArr.join(path.sep);

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

	var getHtml = function (template, data) {
		try {
			return template(data);
		}
		catch(err) {
			u.log(err.message, 'error');
			return 'ERROR: ' + err.message;
		}
	}

	var cleanPaths = function (callback) {
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

	init();
}

module.exports.democritus = democritus();