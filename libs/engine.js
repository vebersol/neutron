var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var object_merge = require('object-merge');
var sort_object = require('sort-object');

var settings = require('../democritus.json');

var u = require('./utilities');
var pa = require('./partials');
var lh = require('./layouts');
var mkp = require('./markup');

var engine = function () {
	'use strict';
	var globalData = {};
	var header;
	var footer;
	var patternFiles = [];
	var patternsData = {};
	var patternsTree = {
		atoms: {},
		molecules: {},
		organisms: {},
		templates: {},
		pages: {}
	};
	var partials = pa();
	var markup = mkp();
	var layoutHandler = lh();

	function init () {
		layoutHandler.getLayouts();
		globalData = JSON.parse(fse.readFileSync(u.getPath(settings.paths.src.data, 'global.json'), settings.encode));
		header = fse.readFileSync(u.getPath(settings.paths.core.templates, 'header.html'), settings.encode);
		footer = fse.readFileSync(u.getPath(settings.paths.core.templates, 'footer.html'), settings.encode);
		cleanPaths(walkPartials);
	}

	function getPatterns() {
		return fse.walk(settings.paths.src.patterns)
			.on('data', function (file) {
				if (path.extname(file.path) === settings.fileExtension) {
					patternFiles.push(file);
				}
			})
			.on('end', function () {
				writeFiles();
			});
	}

	function writeFiles() {

		try {
			var totalFiles = patternFiles.length;

			patternFiles.forEach(function (file, i) {
				getData(file.path, function (data) {
					fse.readFile(file.path, settings.encode, function(err, source) {
						if (source) {
							var extendedData = Object.assign({}, globalData, data);

							// do not render filenames starting with _
							if (path.basename(file.path)[0] === "_") {
								return true;
							}

							handlePattern({
								file: file,
								source: source,
								data: extendedData
							}, i === totalFiles - 1);
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

		addToTree(partialName, end);
		renderFile(output);
	}

	function addEngineSnippets(options) {
		var dependencies = [];
		options.partials.forEach(function (k, i) {
			dependencies.push({
				partial: k,
				path: settings.http.root + k + '.html'
			});
		});

		var newTemplate = footer.replace('#{dependencies}', JSON.stringify(dependencies));
		newTemplate = newTemplate.replace('#{patternName}', options.partialName);

		return newTemplate;
	}

	function getData(fileName, callback) {
		var jsonFile = fileName.replace(settings.fileExtension, '.json');

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
		var DS = path.sep;
		var partialName = DS !== '/' ? fileInfo.partialName.replace(/\//g, '\\') : fileInfo.partialName;
		var filePath = u.getPath(settings.paths.public.patterns, partialName + '.html');
		var fileArr = filePath.split(DS);
		var fileName = fileArr[fileArr.length - 1];

		fileArr.pop();

		var patternPath = fileArr.join(DS);
		var patterns = DS + 'patterns' + DS;
		var markups = DS + 'markups' + DS;

		fse.mkdirs(patternPath, function (err) {
			fse.outputFile(filePath, fileInfo.html, function (err) {
				if (err) {
					u.log(err, 'error');
				}
			});
		});

		fse.mkdirs(patternPath.replace(patterns, markups), function (err) {
			fse.outputFile(filePath.replace(patterns, markups), fileInfo.markup, function (err) {
				if (err) {
					u.log(err, 'error');
				}
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
		fse.mkdirsSync(settings.paths.public.patterns);
		fse.mkdirsSync(settings.paths.public.markups);
		fse.mkdirsSync(settings.paths.public.data);
		callback();
	}

	function addToTree(partial, end) {
		var arr = partial.split('/');
		var url = settings.http.patterns + partial + '.html';
		var tree = arr.reduceRight(function(previousValue, currentValue, currentIndex, array) {
			var obj = {}
			if (array.length - 2 === currentIndex && !obj.hasOwnProperty(currentValue)) {
				obj[currentValue] = {};
			}

			if (array.length - 2 === currentIndex) {
				obj[currentValue][previousValue] = url;
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
		for (var obj in patternsTree) {
			patternsTree[obj] = sort_object(patternsTree[obj], {sortOrder: 'ASC'});
		}

		fse.writeFile(u.getPath(settings.paths.public.data, 'patterns.json'), JSON.stringify(patternsTree), function(err, data) {
			if (err) {
				return console.log(err);
			}
			u.log('Files rendered', 'success');
			console.timeEnd('render duration');
		});

		renderTemplate();
	}

	function walkPartials() {
		return fse.walk(u.getPath(settings.paths.src.patterns))
			.on('data', function (file) {
				if (path.extname(file.path) === settings.fileExtension) {
					partials.registeredPartials.push(file);
				}
			})
			.on('end', function () {
				registerPartials();
			});
	};

	function registerPartials() {
		var totalPartials = partials.registeredPartials.length;

		partials.registeredPartials.forEach(function (file, i) {
			fse.readFile(file.path, settings.encode, function(err, source) {
				if (source) {
					var partialName = partials.getPartialName(file.path);
					partials.setPartial(partialName, source);

					if (i === totalPartials - 1) {
						getPatterns();
					}
				}
			});
		});
	}

	function renderTemplate() {
		var indexSource = fse.readFileSync(u.getPath(settings.paths.core.templates, 'index.handlebars'), settings.encode);
		var indexTemplate = handlebars.compile(indexSource);

		var engineFooter = addEngineSnippets({
			partials: [],
			partialName: ''
		});

		var indexHTML = indexTemplate({engineHeader: header, engineFooter: engineFooter});

		fse.outputFile(u.getPath(settings.paths.public.root, 'index.html'), indexHTML, function (err) {
			if (err) {
				u.log(err, 'error');
			}
		});
	}

	console.time('render duration');
	init();
}

module.exports = engine;
