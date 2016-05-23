var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var u = require('./utilities');

var democritus = function () {
	var patternsData = {};
	var layouts = {};

	var init = function () {
		getLayouts();
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
									var newData = getPartialsData(source, data ? data : {});
									var partialName = getPartialName(file.path);
									var registerPartial = setPartial(partialName, source);
									var layout = addLayout(source, newData.layout);
									var template = handlebars.compile(layout);
									var result = getHtml(template, newData);

									var object = {
										partialName: partialName,
										html: result
									};

									renderFile(object);
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

	var getData = function (fileName, callback) {
		var jsonFile = fileName.replace(u.settings.fileExtension, '.json');

		fse.stat(jsonFile, function(err, stat) {
			var jsonData;
			if (!err) {
				delete require.cache[require.resolve(jsonFile)];
				jsonData = require(jsonFile);
				patternsData[getPartialName(fileName)] = jsonData;
			}

			if (callback) {
				callback(jsonData);
			}
		});
	}

	var renderFile = function (fileInfo, file) {
		var filePath = u.rootPath + '/public/patterns/' + fileInfo.partialName + '.html';
		fileArr = filePath.split('/');
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		var path = fileArr.join('/');

		mkdirp(path, function (err) {
			fse.open(filePath, 'w', function(err, fd) {
				fse.writeFile(filePath, fileInfo.html, u.settings.encode, function (err) {
					if (err) {
						u.log(err, 'error');
					}
				});
			});
		});
	}

	var getPartialName = function (filePath) {
		return filePath.replace(u.rootPath + '/src/patterns/', '')
			.replace(u.settings.fileExtension, '');
	}

	var setPartial = function (name, source) {
		handlebars.registerPartial(name, source);
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

	var getPartialsData = function (source, data) {
		var regex = /{{>(.*?)}}/g,
			match = source.match(regex),
			newData = data;

		var partialNames = getPartialsNames(match);
		var totalPartials = partialNames.length;

		for (var i = 0; i < totalPartials; i++) {
			if (patternsData.hasOwnProperty(partialNames[i])) {
				newData = Object.assign(patternsData[partialNames[i]], newData);
			}
		}

		return newData;
	}

	var getPartialsNames = function (match) {
		var partialNames = [];

		if (match) {
			match.forEach(function (k, v) {
				var cleanString = k.replace('{{>', '').replace('}}').trim();
				var partialName = cleanString.split(' ')[0];

				partialNames.push(partialName);
			});
		}

		return partialNames;
	}

	var getLayouts = function (source, layout) {
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

	var addLayout = function (source, layout) {
		var layoutName = layout ? layout : 'application';
		var layout = layouts[layoutName];

		return layout.replace('{{> yield }}', source);
	}

	var layoutCache = {};

	init();
}

module.exports.democritus = democritus();