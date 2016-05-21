var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

var democritusRenderer = function (settings) {
	var init = function () {
		cleanPaths(function () {
			getPatterns();
		});
	};
	var getSettings = function (settings) {
		var defaultSettings = {
			patternsDir: './src/patterns',
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
									var helperName = getHelperName(file);
									var registerHelper = setHelper(helperName, source);
									var template = handlebars.compile(source);
									var result = getHtml(template, data);

									var object = {
										helperName: helperName,
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
			}

			callback(jsonData);
		});
	}

	var renderFile = function (fileInfo, file) {
		var filePath = rootPath + '/public/patterns/' + fileInfo.helperName + '.html';
		fileArr = filePath.split('/');
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		path = fileArr.join('/');

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

	var getHelperName = function (file) {
		return file.path.replace(rootPath + '/src/patterns/', '')
			.replace(settings.fileExtension, '');
	}

	var setHelper = function (name, source) {
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