"use strict";

const path = require('path');
const settings = require('../neutron.json');
const u = require('../core/libs/utilities');
const sass = require('node-sass');
const glob = require('glob');
const fse = require('fs-extra');
const jst = require('universal-jst');
const browserify = require('browserify');

const init = () => {
	u.log('Start navigation build', 'title');
	u.log('');

	renderTemplate();
}

const getStyles = () => {
	const files = glob(u.getPath(settings.paths.core.root, 'modules/navigation/scss/[^_]*.scss'), (err, matches) => {
		u.log("Start rendering Stylesheets\n", 'info');
		matches.forEach((file, index) => {
			renderStyles(file, index, matches.length);
		});
	});
}

const renderStyles = (file, index, totalFiles) => {
	let fileName = file.match(/([\w\d_\-\s\.]+\.[\w\d]+)[^\\]/g);
	let cssFile = fileName[0] ? fileName[0].replace('scss', 'css') : null;
	let cssPath = u.getPath(settings.paths.public.styleguides, 'modules/navigation/css');
	let pathToOutput = cssPath + '/' + cssFile;

	fse.mkdirsSync(cssPath);

	if (cssFile) {
		sass.render({
			file: file,
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
	let jsOutputPath = u.getPath(settings.paths.public.styleguides, 'modules/navigation/js/');

	fse.mkdirsSync(jsOutputPath);

	b.add(jsSourcePath + '/index.js');

	b.plugin('minifyify', {map: false});

	b.bundle(function (err, response) {
		fse.writeFileSync(jsOutputPath + '/scripts.min.js', response);

		u.log("End javascript concatenation.\n", 'success');

		getStyles();
	});
};

init();
