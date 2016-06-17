var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var object_merge = require('object-merge');
var sort_object = require('sort-object');

var settings = require('../neutron.json');

var u = require('./utilities');
var partials = require('./partials')();
var layoutHandler = require('./layouts')();
var markup = require('./markup')();

var helpers = require(path.resolve(settings.paths.core.helpers))(handlebars);

var engine = function (cb) {
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

	console.log('\x1b[42m' + 'Start render' + '\x1b[0m');

	function init () {
		layoutHandler.getLayouts();
		globalData = JSON.parse(fse.readFileSync(u.getPath(settings.paths.src.data, 'global.json'), settings.encode));
		header = fse.readFileSync(u.getPath(settings.paths.core.templates, 'header.html'), settings.encode);
		footer = fse.readFileSync(u.getPath(settings.paths.core.templates, 'footer.html'), settings.encode);
		registerHelpers();
		registerEnginePartials();
		cleanPaths();
		walkPartials();
	}

	/**
	 * Register all base helpers into handlebars
	 * */
	function registerHelpers() {
		handlebars.registerHelper(helpers);
	}

	function registerEnginePartials() {
		handlebars.registerPartial('engineHeader', header);
		handlebars.registerPartial('engineFooter', footer);
	}

	function onEnd() {
		if (cb) {
			cb();
		}
		console.log('\x1b[42m')
		console.timeEnd('render duration');
		console.log('\x1b[0m')
	}

	/**
	 * Returns true when extension is a pattern extension
	 * @return Boolean
	*/
	function isPatternExtension(extension) {
		return extension === settings.fileExtension;
	}

	function getPatterns() {
		setRenderHelper();
		return fse.walk(settings.paths.src.patterns)
			.on('data', function (file) {
				if (isPatternExtension(path.extname(file.path))) {
					patternFiles.push(file);
				}
			})
			.on('end', writeFiles);
	}

	/**
	 * Return true when the file path should be ignored for render
	 * @partam path file path
	 * @return Boolen
	 */
	function shouldIgnoreFile(path) {
		return path[0] === "_";
	}

	function writeFiles() {
		try {
			var totalFiles = patternFiles.length;

			patternFiles.forEach(function (file, i) {
				getData(file.path, function (data) {
					fse.readFile(file.path, settings.encode, function(err, source) {
						if (source) {
							var extendedData = Object.assign({}, globalData, data);

							if (shouldIgnoreFile(path.basename(file.path))) {
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
		var partialData = partials.getPartialsData(pattern.source, pattern.data ? pattern.data : {});
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path)
		var layout = layoutHandler.addLayout(pattern.source, newData.layout);

		newData.partialClass = partials.getPatternFolder(partialName);
		newData.patternName = partialName;
		newData.dependencies = addEngineSnippets(partialsList);

		helpers.resetHelpers();
		try {
			var template = handlebars.compile(layout);
			var markups = markup.addMarkup(pattern.source, newData);
			var result = getHtml(template, newData);

			var output = {
				partialName: partialName,
				html: result,
				markup: markups
			};

			addToTree(partialName, end);
			renderFile(output, end);
		} catch(e) {
			u.log('Error in ' + partialName, 'error');
			console.log(e.message)
			process.exit()
		}
	}

	function addEngineSnippets(partialsArr) {
		if (!partialsArr) {
			return [];
		}

		var dependencies = [];

		partialsArr.forEach(function (k, i) {
			dependencies.push({
				partial: k,
				path: partials.getPatternFolder(k) + '/index.html'
			});
		});

		return JSON.stringify(dependencies);
	}

	function getData(fileName, callback) {
		var jsonFile = fileName.replace(settings.fileExtension, '.json');

		fse.stat(jsonFile, function(err, stat) {
			var jsonData;
			var partialName = partials.getPartialName(fileName);
			if (!err) {
				delete require.cache[require.resolve(jsonFile)];
				try {
					jsonData = require(jsonFile);
					patternsData[partialName] = jsonData;
				}
				catch(e) {
					u.log('JSON error: ' + partialName, 'error');
					console.log(e.message)
				}
			}

			if (callback) {
				callback(jsonData);
			}
		});
	}

	function renderFile(fileInfo, end) {
		var DS = path.sep;
		var partialName = partials.getPatternFolder(fileInfo.partialName);
		var filePath = u.getPath(settings.paths.public.patterns + partialName, '/index.html');
		var filePathMarkups = u.getPath(settings.paths.public.patterns + partialName, '/markups.html');

		fse.outputFileSync(filePath, fileInfo.html);
		fse.outputFileSync(filePathMarkups, fileInfo.markup);

		if (end) {
			onEnd();
		}
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

	function cleanPaths() {
		fse.mkdirsSync(settings.paths.public.patterns);
		fse.mkdirsSync(settings.paths.public.data);
	}

	function addToTree(partial, end) {
		var arr = partial.split('/');
		var url = partials.getPatternFolder(partial) + '/index.html';

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

		fse.outputFileSync(u.getPath(settings.paths.public.data, 'patterns.json'), JSON.stringify(patternsTree));

		renderTemplate();
	}

	function walkPartials() {
		return fse.walk(u.getPath(settings.paths.src.patterns))
			.on('data', function (file) {
				if (isPatternExtension(path.extname(file.path))) {
					partials.registeredPartials.push(file);
				}
			})
			.on('end', registerPartials);
	};

	function registerPartials() {
		var totalPartials = partials.registeredPartials.length;

		if (totalPartials > 0) {
			return partials.registeredPartials.forEach(function (file, i) {
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

		return renderData();

	}

	function renderTemplate() {
		var indexSource = fse.readFileSync(u.getPath(settings.paths.core.templates, 'index' + settings.fileExtension), settings.encode);

		helpers.resetHelpers();
		var indexTemplate = handlebars.compile(indexSource);

		var indexHTML = indexTemplate({
			assetsPath: settings.assetsPath,
			dependencies: '[]'
		});

		fse.outputFileSync(u.getPath(settings.paths.public.root, 'index.html'), indexHTML);
	}

	function setRenderHelper() {
		handlebars.registerHelper('render', function (partial, params) {
			var data;
			var partialArr = partial.split(':');
			var partialName = partialArr[0];
			var styleModifier = partialArr.length > 1 ? partialArr[1] : null;
			var hasHash = params.hasOwnProperty('hash');
			var partialData = patternsData.hasOwnProperty(partialName) ? patternsData[partialName] : {};

			var source = '{{> '+ partialName + '}}';

			if (this && hasHash) {
				data = Object.assign({}, partialData, this, params.hash);
			}

			if (styleModifier) {
				data.styleModifier = styleModifier;
			}


			var template = handlebars.compile(source);
			var result = template(data);

			return new handlebars.SafeString(result);
		});
	}

	console.time('render duration');
	init();

	return true;
}

module.exports = engine;
