var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var u = require('./utilities');
var pa = require('./partials');
var lh = require('./layouts');
var mkp = require('./markup');

var engine = function () {
	'use strict';
	var header;
	var footer;
	var patternsData = {};
	var partials = new pa();
	var markup = new mkp();
	var layoutHandler = new lh();

	function init () {
		layoutHandler.getLayouts();
		header = fse.readFileSync(path.resolve(u.rootPath + '/core/header.html'), 'utf8');
		footer = fse.readFileSync(path.resolve(u.rootPath + '/core/footer.html'), 'utf8');
		cleanPaths(getPatterns);
	}

	function getPatterns() {
		return fse.walk(u.settings.patternsDir)
			.on('data', function (file) {
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

	function handlePattern(pattern) {
		var partialData = partials.getPartialsData(pattern.source, pattern.data ? pattern.data : {}, patternsData);
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path)
		var registerPartial = partials.setPartial(partialName, pattern.source);
		var layout = layoutHandler.addLayout(pattern.source, newData.layout);

		newData.engineHeader = header;

		newData.engineFooter = addEngineSnippets({
			html: layout,
			partials: partialsList,
			partialName: partialName
		});

		var markups = markup.addMarkup(pattern.source, newData);
		var template = handlebars.compile(layout);
		var result = getHtml(template, newData);

		var output = {
			partialName: partialName,
			html: result,
			markup: markups
		};

		renderFile(output);
	}

	function addEngineSnippets(options) {
		var dependencies = [];
		options.partials.forEach(function (k, i) {
			dependencies.push({
				partial: k,
				path: u.settings.webPath + k + '.html'
			});
		});

		var newTemplate = footer.replace('#{dependencies}', JSON.stringify(dependencies));
		newTemplate = newTemplate.replace('#{patternName}', options.partialName);

		return newTemplate;
	}

	function getData(fileName, callback) {
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

	function renderFile(fileInfo, file) {
		var partialName = u.DS !== '/' ? fileInfo.partialName.replace(/\//g, '\\') : fileInfo.partialName;
		var filePath = u.rootPath + u.DS + 'public' + u.DS + 'patterns' + u.DS + partialName + '.html';
		var fileArr = filePath.split(u.DS);
		var fileName = fileArr[fileArr.length - 1];

		fileArr.pop();

		var patternPath = fileArr.join(u.DS);
		var patterns = u.DS + 'patterns' + u.DS;
		var markups = u.DS + 'markups' + u.DS;

		mkdirp(patternPath, function (err) {
			fse.open(filePath, 'w', function(err, fd) {
				fse.writeFile(filePath, fileInfo.html, u.settings.encode, function (err) {
					if (err) {
						u.log(err, 'error');
					}
				});
			});
		});

		mkdirp(patternPath.replace(patterns, markups), function (err) {
			fse.open(filePath.replace(patterns, markups), 'w', function(err, fd) {
				fse.writeFile(filePath.replace(patterns, markups), fileInfo.markup, u.settings.encode, function (err) {
					if (err) {
						u.log(err, 'error');
					}
				});
			});
		});
	}

	function getHtml(template, data) {
		try {
			return template(data);
		}
		catch(err) {
			u.log(err.message, 'error');
			return 'ERROR: ' + err.message;
		}
	}

	function cleanPaths(callback) {

		rimraf(u.settings.publicPatternsPath, function () {
			u.log('cleaning up patterns folder before recreate');
			rimraf(u.settings.publicMarkupsPath, function () {
				u.log('cleaning up markups folder before recreate');
				mkdirp(u.settings.publicMarkupsPath, function(err) {
					if (err) {
						u.log(err, 'error');
					}
					mkdirp(u.settings.publicPatternsPath, function(err) {
						if (err) {
							u.log(err, 'error');
						}

						callback();
					});
				});
			});
		});
	}

	init();
}

module.exports.engine = engine();
