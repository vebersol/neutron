var Main = function () {
	this.init();
};

Main.prototype = {
	init: function () {
		this.wrapper = Zepto('<aside id="' + PREFIX + '"></aside>');
		Zepto('body').append(this.wrapper);
		this.addPatternsInfo();
	},

	addPatternsInfo: function () {
		var parent = this;
		var template = NADTJST['index.html']();

		parent.wrapper.append(template);
		parent.buildDependenciesList();

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
	}
}
