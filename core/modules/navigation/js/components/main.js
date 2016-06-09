var Main = function () {
	this.init();
};

Main.prototype = {
	init: function () {
		this.wrapper = Zepto('#neutron');
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
		var target = Zepto('#neutron-dependencies-list');
		var d = [];

		if (dependencies.length === 0) {
			return Zepto('.neutron-code-frame--patterns').hide();
		}

		for (var i = 0; i < dependencies.length; i++) {
			dependencies[i]
			d.push('<a href="' + dependencies[i].path.replace('/', '/patterns/') + '">' + dependencies[i].partial + '</a>');
		}

		target.append(d.join(', '));
	}
}