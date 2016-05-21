var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var democritusRenderer = function (settings) {
	var patternsData = {};

	var init = function () {
		cleanPaths(function () {
			getPatterns();
		});
	};
	var getSettings = function (settings) {
		var defaultSettings = {
			patternsDir: rootPath + '/src/patterns',
			allowedPatterns: ['atoms', 'molecules'],
			fileExtension: '.handlebars',
			encode: 'utf8',
			publicPatternsPath: rootPath + '/public/patterns'
		};
		
		return util._extend(defaultSettings, settings);
	}

	var getRootPath = function () {
		var rootPath = path.dirname(require.main.filename).replace('/libs', '');
		return rootPath;
	}

	var getPatterns = function () {
		fse.walk(settings.patternsDir)
			.on('data', function(file) {
				if (path.extname(file.path) === settings.fileExtension) {
					try {
						getData(file.path, function (data) {
							fse.readFile(file.path, settings.encode, function(err, source) {
								if (source) {
									var newData = getPartialsData(source, data ? data : {});
									var partialName = getPartialName(file.path);
									var registerPartial = setPartial(partialName, source);
									var template = handlebars.compile(source);
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
						log(e, 'error');
					}
				}
			})
			.on('end', function () {
				log('Files rendered', 'success');
			});
	}

	var getData = function (fileName, callback) {
		var jsonFile = fileName.replace(settings.fileExtension, '.json');

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
		var filePath = rootPath + '/public/patterns/' + fileInfo.partialName + '.html';
		fileArr = filePath.split('/');
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		var path = fileArr.join('/');

		mkdirp(path, function (err) {
			fse.open(filePath, 'w', function(err, fd) {
				fse.writeFile(filePath, fileInfo.html, settings.encode, function (err) {
					if (err) {
						log(err, 'error');
					}
				});
			});
		});
	}

	var getPartialName = function (filePath) {
		return filePath.replace(rootPath + '/src/patterns/', '')
			.replace(settings.fileExtension, '');
	}

	var setPartial = function (name, source) {
		handlebars.registerPartial(name, source);
	}

	var getHtml = function (template, data) {
		try {
			return template(data);
		}
		catch(err) {
			log(err.message, 'error');
			return 'ERROR: ' + err.message;
		}
	}

	var cleanPaths = function (callback) {
		rimraf(settings.publicPatternsPath, function () {
			log('cleaning up patterns folder before recreate');
			mkdirp(settings.publicPatternsPath, function(err) {
				if (err) {
					console.log(err, 'error');
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

	var rootPath = getRootPath();
	var settings = getSettings(settings);

	init();
}

democritusRenderer();

var log = function (message, type) {
	var types = {
			error: '\x1b[41m',
			success: '\x1b[42m'
		},
		reset = '\x1b[0m',
		color = reset;

	if (type) {
		color = types[type];
	}

	console.log(color, message, reset);
}