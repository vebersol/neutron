var Main = function () {
	this.namespace = 'neutronADT';
	this.themeNamespace = this.namespace+'Theme';
	this.storage = new Storage();

	this.init();
};

Main.prototype = {
	init: function () {
		var theme = this.storage.getSettings(this.themeNamespace) || cssTheme;

		Zepto('head').append('<link rel="stylesheet" class="neutron-theme-stylesheet" href="'+patternData.i.assetsPath+'styleguide/modules/navigation/css/'+theme+'.css">')

		this.wrapper = Zepto('<aside id="' + PREFIX + '"></aside>');
		Zepto('body').append(this.wrapper);
		this.addPatternsInfo();
	},

	addPatternsInfo: function () {
		var template = this.getTemplate();

		this.wrapper.append(template);
		this.buildDependenciesList();

		new Menu();
	},

	buildDependenciesList: function () {
		var dependencies = patternData.i.dependencies;
		var dependenciesTarget = Zepto(pcn('#dependencies-list'));
		var reverseDependencies = patternData.i.reverseDependencies;
		var reverseDependenciesTarget = Zepto(pcn('#reverse-dependencies-list'));

		var d = [];
		var rd = [];

		if (dependencies.length === 0) {
			dependenciesTarget.hide();
		} else {
			for (var i = 0; i < dependencies.length; i++) {
				d.push('<a href="' + PATTERNS_PATH + dependencies[i].path + '">' + dependencies[i].partial + '</a>');
			}
		}

		if (reverseDependencies.length === 0) {
			reverseDependenciesTarget.hide();
		} else {
			for (var i = 0; i < reverseDependencies.length; i++) {
				rd.push('<a href="' + PATTERNS_PATH + reverseDependencies[i].path + '">' + reverseDependencies[i].partial + '</a>');
			}
		}

		dependenciesTarget.find('span').append(d.join(', '));
		reverseDependenciesTarget.find('span').append(rd.join(', '));
	},

	getTemplate: function () {
		var template = this.translate(NADTJST['index.html']());

		return template;
	},

	translate: function (source) {
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
