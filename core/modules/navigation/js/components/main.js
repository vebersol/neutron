const  Storage = require('./storage');

class Main {
	constructor() {
		this.namespace = 'neutronADT';
		this.themeNamespace = this.namespace + 'Theme';
		this.storage = new Storage();

		const  theme = this.storage.getSettings(this.themeNamespace) || neutronADT.i.cssTheme;

		this.preloadStyles(theme, () => {
			this.create();
		});
	}

	preloadStyles(theme, callback) {
		const  link = Zepto(`<link rel="stylesheet" class="neutron-theme-stylesheet" href="${neutronADT.i.assetsPath}styleguide/modules/navigation/css/${theme}.css">`);

		link.get(0).onload = function() {
			callback();
			link.get(0).onload = null;
		};

		Zepto('head').append(link);
	}

	create() {
		this.wrapper = Zepto(`<aside id="${neutronADT.i.prefix}"></aside>`);
		Zepto('body').append(this.wrapper);
		this.addPatternsInfo();
	}

	addPatternsInfo() {
		const template = this.getTemplate();

		this.wrapper.append(template);
		this.buildDependenciesList();

		const Menu = require('./menu');
		new Menu();
	}

	buildDependenciesList() {
		const dependencies = neutronADT.i.dependencies;
		const dependenciesTarget = Zepto(neutronADT.i.pcn('#dependencies-list'));
		const reverseDependencies = neutronADT.i.reverseDependencies;
		const reverseDependenciesTarget = Zepto(neutronADT.i.pcn('#reverse-dependencies-list'));

		let d = [];
		let rd = [];

		if (dependencies.length === 0) {
			dependenciesTarget.hide();
		} else {
			for (let i = 0; i < dependencies.length; i++) {
				d.push(`<a href="${neutronADT.i.patternsPath + dependencies[i].path}">${dependencies[i].partial}</a>`);
			}
		}

		if (reverseDependencies.length === 0) {
			reverseDependenciesTarget.hide();
		} else {
			for (let i = 0; i < reverseDependencies.length; i++) {
				rd.push(`<a href="${neutronADT.i.patternsPath + reverseDependencies[i].path}">${reverseDependencies[i].partial}</a>`);
			}
		}

		dependenciesTarget.find('span').append(d.join(', '));
		reverseDependenciesTarget.find('span').append(rd.join(', '));
	}

	getTemplate() {
		return this.translate(NADTJST['index']);
	}

	translate(source) {
		const languages = require('../lang/index');
		const I18n = languages[neutronADT.i.language];

		for (let t in I18n) {
			const str = `({{${t}}})`;
			const regex = new RegExp(str, "g");
			const match = source.match(regex);

			if (match) {
				source = source.replace(regex, I18n[t]);
			}
		}

		return source;
	}
}

module.exports = Main;
