var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var handlebars = require('handlebars');

var democritusRenderer = function (settings) {
	var patterns = [];

	var getSettings = function (settings) {
		var defaultSettings = {
			patternsDir: './src/patterns',
			allowedPatterns: ['atoms', 'molecules'],
			fileExtension: '.handlebars',
			encode: 'utf8'
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
						fse.readFile(file.path, settings.encode, function(err, source) {
							if (source) {
								var helperName = getHelperName(file);
								var registerHelper = setHelper(helperName, source);
								var template = handlebars.compile(source);
								var data = {text: "lorem ipsum"}
								var result = template(data);

								var object = {
									helperName: helperName,
									html: result 
								};

								renderFile(object);
							}
						});
					} catch (e) {
						console.log("\x1b[41m", e, "\x1b[0m");
					}
				}
			});
	}

	var renderFile = function (fileInfo, file) {
		var filePath = rootPath + '/public/patterns/' + fileInfo.helperName + '.html';
		fileArr = filePath.split('/');
		fileName = fileArr[fileArr.length - 1];
		fileArr.pop();
		path = fileArr.join('/');
		
		if (!fse.statSync(path).isDirectory()) {
			fse.mkdirSync(path);
		}
		
		fse.open(filePath, 'w', function(err, fd) {
			fse.writeFile(filePath, fileInfo.html, settings.encode, function (err) {
				console.log('test', err);
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

	var settings = getSettings(settings);
	var rootPath = getRootPath();

	getPatterns();
}

democritusRenderer();