var fse = require('fs-extra');
var klaw = require('klaw');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');
var object_merge = require('object-merge');
var sort_object = require('sort-object');
var beautify_html = require('js-beautify').html;

var settings = require('./settings');

var u = require('./utilities');
var partials = require('./partials')();
var layoutHandler = require('./layouts')();
var markup = require('./markup')();

var helpers = require(u.getPath(settings.paths.core.helpers))(handlebars);

var engine = function (cb) {
	'use strict';
	var globalData = {};
	var patternFiles = [];
	var patternsData = {};
	var outputCache = [];
	var patternsTree = {
		atoms: {},
		molecules: {},
		organisms: {},
		templates: {},
		pages: {}
	};

	u.log('Neutron: Start render', 'info');

	function init () {
		globalData = JSON.parse(fse.readFileSync(u.getAppPath(settings.paths.src.data, 'global.json'), settings.encode));
		registerHelpers();
		cleanPaths();
		walkPartials();
	}

	/**
	 * Register all base helpers into handlebars
	 * */
	function registerHelpers() {
		handlebars.registerHelper(helpers);
	}

	function onEnd() {
		partials.resetReverseDependencies();
		if (cb) {
			cb();
		}
		console.log('\x1b[32m')
		console.timeEnd(' render duration');
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
		return klaw(u.getAppPath(settings.paths.src.patterns))
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

			if (totalFiles === 0) {
				return onEnd();
			}

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
		var partialData = partials.getPartialsData(pattern);
		var newData = partialData.data;
		var partialsList = partialData.partials;
		var partialName = partials.getPartialName(pattern.file.path);

		newData.cssTheme = settings.cssTheme;
		newData.partialClass = partials.getPatternFolder(partialName);
		newData.patternName = partialName;
		newData.dependencies = addEngineSnippets(partialsList);
		newData.menuBehavior = settings.menuBehavior || "overlay";
		newData.language = settings.language || "en";

		helpers.resetHelpers();
		try {
			var source = handlebars.compile(pattern.source);
			var compiledSource = getHtml(source, newData);

			var fullLayout = layoutHandler.renderLayout(newData, compiledSource);
			var markups = markup.addMarkup(pattern.source, compiledSource, newData);

			var output = {
				partialName: partialName,
				html: fullLayout,
				markup: markups
			};

			outputCache.push(output);

			if (end) {
				saveToDisk();
			}
		} catch(e) {
			u.log('Error in ' + partialName, 'error');
			console.log(e.message)
			process.exit();
		}
	}

	function saveToDisk() {
		outputCache.forEach(function (file, i) {
			var end = i === (outputCache.length - 1);

			if (partials.reverseDependencies.hasOwnProperty(file.partialName)) {
				var dependenciesList = partials.reverseDependencies[file.partialName]
					.sort(function (a, b) {
						return a.partial > b.partial;
					});

				file.html = file.html.replace('reverseDependencies: []', 'reverseDependencies: ' + JSON.stringify(dependenciesList) + '');
			}
			addToTree(file.partialName, end);
			renderFile(file, end);
		});
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
		var filePath = u.getAppPath(settings.paths.public.patterns + partialName, '/index.html');
		var filePathMarkups = u.getAppPath(settings.paths.public.patterns + partialName, '/markups.html');

		fse.outputFileSync(filePath, fileInfo.html);
		fse.outputFileSync(filePathMarkups, fileInfo.markup);

		if (end) {
			onEnd();
		}
	}

	function getHtml(template, data) {
		try {
			var result = template(data);
			if (settings.beautifyHTML) {
				result = beautify_html(result, {
					indent_size: 2,
					type: ['html'],
					brace_style: ['collapse'],
					end_with_newline: true,
					max_preserve_newlines: 1,
					preserve_newlines: true,
					unformatted: [
						"span",
						"img",
						"code",
						"pre",
						"sub",
						"sup",
						"em",
						"strong",
						"b",
						"i",
						"u",
						"strike",
						"big",
						"small",
						"pre",
						"h1",
						"h2",
						"h3",
						"h4",
						"h5",
						"h6",
						"meta"
					]
				});
			}

			return result;
		}
		catch(err) {
			u.log(err.message, 'error');
			return 'ERROR: ' + err.message;
		}
	}

	function cleanPaths() {
		fse.mkdirsSync(u.getAppPath(settings.paths.public.patterns));
		fse.mkdirsSync(u.getAppPath(settings.paths.public.data));
	}

	function addToTree(partial, end) {
		var arr = partial.split('/');
		var url = partials.getPatternFolder(partial) + '/index.html';
		var status = patternsData[partial] &&
			patternsData[partial].hasOwnProperty('_status') ? patternsData[partial]._status : null;

		var tree = arr.reduceRight(function(previousValue, currentValue, currentIndex, array) {
			var obj = {}

			if (array.length - 2 === currentIndex && !obj.hasOwnProperty(currentValue)) {
				obj[currentValue] = {};
			}

			if (array.length - 2 === currentIndex) {
				obj[currentValue][previousValue] = {
					url: url,
					status: status
				}
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
			if (Object.keys(patternsTree[obj]).length > 0) {
				patternsTree[obj] = sort_object(patternsTree[obj], {sortOrder: 'ASC'});
			}
			else {
				delete patternsTree[obj];
			}
		}

		fse.outputFileSync(u.getAppPath(settings.paths.public.data, 'patterns.json'), JSON.stringify(patternsTree));

		renderTemplate();
	}

	function walkPartials() {
		return klaw(u.getAppPath(settings.paths.src.patterns))
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

						if (partials.isHiddenPartial(partialName)) {
							partialName = partialName.replace('/_', '/');
							partials.hiddenPartials.push(partialName);
						}

						partials.setPartial(partialName, source);

						if (i === totalPartials - 1) {
							getPatterns();
						}
					}
				});
			});
		} else {
			getPatterns();
		}

		return renderData();

	}

	function renderTemplate() {
		var indexSource = fse.readFileSync(u.getPath(settings.paths.core.templates, 'index' + settings.fileExtension), settings.encode);

		helpers.resetHelpers();

		var indexTemplate = handlebars.compile(indexSource);

		var indexHTML = layoutHandler.renderLayout({
			partialClass: 'neutron-welcome-page',
			assetsPath: '',
			cssTheme: settings.cssTheme,
			dependencies: '[]',
			menuBehavior: settings.menuBehavior || 'overlay',
			language: settings.language || 'en'
		}, indexTemplate());

		fse.outputFileSync(u.getAppPath(settings.paths.public.root, 'index.html'), indexHTML);
	}

	function isTemplate(partial) {
		var regex = /^(template)/;
		return regex.test(partial);
	}

	function wrapWithComments(html, patternName) {
		var output = "";

		output += "<!-- start " + patternName + " -->\n";
		output += html;
		output += "\n<!-- end " + patternName + " -->\n";

		return output;
	}

	function setRenderHelper() {
		handlebars.registerHelper('render', function (partial, params) {
			var data;
			var partialArr = partial.split(':');
			var partialName = partialArr[0];
			var styleModifier = partialArr.length > 1 ? partialArr[1] : null;
			var hasHash = params.hasOwnProperty('hash');
			var partialData = !isTemplate(partial) && patternsData.hasOwnProperty(partialName) ? patternsData[partialName] : {};

			var source = '{{> '+ partialName + '}}';

			if (this && hasHash) {
				data = Object.assign({}, partialData, this, params.hash);
			}

			if (styleModifier) {
				data.styleModifier = styleModifier;
			}

			var template = handlebars.compile(source);
			var result = template(data);

			if (settings.htmlComments) {
				result = wrapWithComments(result, partialName);
			}

			return new handlebars.SafeString(result);
		});
	}

	console.time(' render duration');
	init();

	return true;
}

module.exports = engine;
