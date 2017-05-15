"use strict";

const path = require('path');
const u = require('../core/libs/utilities');
const currentDir = u.getAppPath(process.cwd());
const settings = require(u.getPath('core/libs', '/settings'));
const sass = require('node-sass');
const fse = require('fs-extra');
const jst = require('universal-jst');
const browserify = require('browserify');

let cb;

const init = (callback) => {

	cb = callback || null;

	u.log('Start navigation build', 'title');
	u.log('');

	renderTemplate();
}

const getStyles = () => {
	let filesArr = [];

	fse.walk(u.getPath(settings.paths.core.root, 'modules/navigation/scss/'))
		.on('data', function (file) {
			if (path.extname(file.path) && path.basename(file.path)[0] !== '_') {
				filesArr.push(file);
			}
		})
		.on('end', () => {
			filesArr.forEach((file, index) => {
				let fileContents = fse.readFileSync(file.path, settings.encode);
				renderStyles(file, index, filesArr.length);
			});
		});
}

const renderStyles = (file, index, totalFiles) => {
	let fileName = path.basename(file.path);
	let cssFile = fileName ? fileName.replace('scss', 'css') : null;
	let cssPath = u.getAppPath(settings.paths.public.styleguides, 'modules/navigation/css');
	let pathToOutput = u.getAppPath(cssPath, '/' + cssFile);

	fse.mkdirsSync(cssPath);

	if (cssFile) {
		sass.render({
			file: file.path,
			outFile: pathToOutput,
			outputStyle: 'compressed'
		}, (err, result) => {
			if (err) {
				return u.log(err, 'error');
			}

			u.log((index + 1) + '/' + totalFiles + ' => ' + cssFile);

			fse.writeFile(pathToOutput, result.css, function(err) {
				if (!err) {

					if (totalFiles - 1 == index) {
						u.log('');
						u.log('Stylesheets successfully written', 'success');
						u.log('');

						if (cb) {
							cb();
						}
					}
				} else {
					u.log(err, 'error');
				}
			});
		});
	}
}

const renderTemplate = () => {
	u.log("Start HTML conversion to javascript.\n", 'info');

	let jsOutputPath = u.getPath(settings.paths.core.root, 'modules/navigation/js/');
	let templateSourcePath = u.getPath(settings.paths.core.root, 'modules/navigation/template/');

	jst.string(templateSourcePath, function(err, data) {
		if (err) {
			return u.log(err, 'error');
		}

		let output = data.join('\n').replace(/(JST)/g, 'NADTJST');

		fse.writeFileSync(jsOutputPath + '/templates.js', output, settings.encode);

		u.log("HTML conversion to javascript successfully done!.\n", 'success');
		writeJS();
	});
}

const writeJS = () => {
	u.log("Start javascript concatenation.\n", 'info');
	let language = settings.language || 'en';
	let b = browserify();
	let jsSourcePath = u.getPath(settings.paths.core.root, 'modules/navigation/js/');
	let jsOutputPath = u.getAppPath(settings.paths.public.styleguides, 'modules/navigation/js/');

	fse.mkdirsSync(jsOutputPath);

	b.add(jsSourcePath + '/index.js');

	// b.plugin('minifyify', {map: false});

	b.bundle(function (err, response) {
		fse.writeFileSync(jsOutputPath + '/scripts.min.js', response);

		u.log("End javascript concatenation.\n", 'success');

		getStyles();
	});
};

module.exports = init;
