class Main {
	constructor() {
		var Storage = require('./storage');
		this.namespace = 'neutronADT';
		this.themeNamespace = this.namespace + 'Theme';
		this.storage = new Storage();

		var theme = this.storage.getSettings(this.themeNamespace) || neutronADT.i.cssTheme;

		this.preloadStyles(theme, () => {
			this.create();
		});
	}

	preloadStyles(theme, callback) {
		var link = Zepto('<link rel="stylesheet" class="neutron-theme-stylesheet" href="' + neutronADT.i.assetsPath + 'styleguide/modules/navigation/css/' + theme + '.css">');
		link.get(0).onload = function() {
			callback();
			link.get(0).onload = null;
		};

		Zepto('head').append(link);
	}

	create() {
		this.wrapper = Zepto('<aside id="' + neutronADT.i.prefix + '"></aside>');
		Zepto('body').append(this.wrapper);
		this.addPatternsInfo();
	}

	addPatternsInfo() {
		var template = this.getTemplate();

		this.wrapper.append(template);
		this.buildDependenciesList();

		var Menu = require('./menu');
		new Menu();
	}

	buildDependenciesList() {
		var dependencies = neutronADT.i.dependencies;
		var dependenciesTarget = Zepto(neutronADT.i.pcn('#dependencies-list'));
		var reverseDependencies = neutronADT.i.reverseDependencies;
		var reverseDependenciesTarget = Zepto(neutronADT.i.pcn('#reverse-dependencies-list'));

		var d = [];
		var rd = [];

		if (dependencies.length === 0) {
			dependenciesTarget.hide();
		} else {
			for (var i = 0; i < dependencies.length; i++) {
				d.push('<a href="' + neutronADT.i.patternsPath + dependencies[i].path + '">' + dependencies[i].partial + '</a>');
			}
		}

		if (reverseDependencies.length === 0) {
			reverseDependenciesTarget.hide();
		} else {
			for (var i = 0; i < reverseDependencies.length; i++) {
				rd.push('<a href="' + neutronADT.i.patternsPath + reverseDependencies[i].path + '">' + reverseDependencies[i].partial + '</a>');
			}
		}

		dependenciesTarget.find('span').append(d.join(', '));
		reverseDependenciesTarget.find('span').append(rd.join(', '));
	}

	getTemplate() {
		var template = this.translate(NADTJST['index']);

		return template;
	}

	translate(source) {
		var languages = require('../lang/index');
		var I18n = languages[neutronADT.i.language];

		for (var t in I18n) {
			var str = '({{' + t + '}})';
			var regex = new RegExp(str, "g");
			var match = source.match(regex);

			if (match) {
				source = source.replace(regex, I18n[t]);
			}
		}

		return source;
	}
}

module.exports = Main;
