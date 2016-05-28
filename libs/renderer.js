var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var object_merge = require('object-merge');

var u = require('./utilities');
var pa = require('./partials');
var lh = require('./layouts');
var mkp = require('./markup');

var engine = function () {
	'use strict';
	var template;
	var patternFiles = [];
	var patternsData = {};
	var patternsTree = {};
	var partials = new pa();
	var markup = new mkp();
	var layoutHandler = new lh();

	function init () {
		layoutHandler.getLayouts();
		template = fse.readFileSync(path.resolve(u.rootPath + '/core/script-template.html'), 'utf8');
		cleanPaths(getPatterns);
	}

	function getPatterns() {

		return fse.walk(u.settings.patternsDir)
			.on('data', function (file) {
				if (path.extname(file.path) === u.settings.fileExtension) {
					patternFiles.push(file);
				}
			})
			.on('end', function () {
				writeFiles();
			});
	}

	function writeFiles() {
		try {
			var totalFIles = patternFiles.length;

			patternFiles.forEach(function (file, i) {
				getData(file.path, function (data) {
					fse.readFile(file.path, u.settings.encode, function(err, source) {
						if (source) {
							handlePattern({
								file: file,
								source: source,
								data: data
							}, i === totalFIles - 1);
						}
					});
				});

			});
		} catch (e) {
			u.log(e, 'error');
		}
	}

	function handlePattern(pattern, end) {
		var partialData = partials.getPartialsData(pattern.source, pattern.data ? pattern.data : {}, patternsData);
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path)
		var registerPartial = partials.setPartial(partialName, pattern.source);
		var layout = layoutHandler.addLayout(pattern.source, newData.layout);

		newData.engineData = addEngineSnippets({
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


		addToTree(partialName, end);
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

		var newTemplate = template.replace('#{dependencies}', JSON.stringify(dependencies));
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

		fse.mkdirs(patternPath, function (err) {
			fse.open(filePath, 'w', function(err, fd) {
				fse.writeFile(filePath, fileInfo.html, u.settings.encode, function (err) {
					if (err) {
						u.log(err, 'error');
					}
				});
			});
		});

		fse.mkdirs(patternPath.replace(patterns, markups), function (err) {
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
		fse.removeSync(u.settings.publicPatternsPath);
		fse.mkdirsSync(u.settings.publicPatternsPath);
		fse.removeSync(u.settings.publicMarkupsPath);
		fse.mkdirsSync(u.settings.publicMarkupsPath);
		fse.removeSync(u.settings.publicDataPath);
		fse.mkdirsSync(u.settings.publicDataPath);
		callback();
	}

	function addToTree(partial, end) {
		var arr = partial.split('/');
		var tree = arr.reduceRight(function(previousValue, currentValue, currentIndex, array) {
			var obj = {}
			if (array.length - 2 === currentIndex && !obj.hasOwnProperty(currentValue)) {
				obj[currentValue] = {};
			}

			if (array.length - 2 === currentIndex) {
				obj[currentValue][previousValue] = true;
			}
			else {
				obj[currentValue] = previousValue;
			}
			return obj;
		});

		patternsTree = object_merge(patternsTree, tree);

		if (end) {
			renderData();
		}
	}

	function renderData() {
		fse.writeFile(u.settings.publicDataPath + u.DS +  'patterns.json', JSON.stringify(patternsTree), function(err, data) {
			if (err) {
				return console.log(err);
			}
			u.log('Files rendered', 'success');
			console.timeEnd('render duration');
		});
	}

	console.time('render duration');
	init();
}

module.exports.engine = engine();
