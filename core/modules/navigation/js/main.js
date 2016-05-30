democritus.core.main = function () {
	this.init();
};

democritus.core.main.prototype = {
	init: function () {
		this.wrapper = Zepto('#democritus');
		this.addPatternsInfo();
	},

	addPatternsInfo: function () {
		var parent = this;
		Zepto.ajax({
			url: '/styleguide/modules/navigation/template/index.html',
			success: function (data) {
				parent.wrapper.append(data);
				parent.buildDependenciesList();
				parent.bind();
				parent.addCode();
			}
		});
	},

	bind: function () {
		var infoBar = Zepto('.democritus-info-bar');

		Zepto('.democritus-info-bar--close__link').on('click', function () {
			infoBar.removeClass('active');
		});
	},

	addCode: function () {
		var parent = this;
		Zepto.ajax({
			url: '/markups/' + democritus.i.patternName,
			success: function (data) {
				parent.code = parent.wrapper.find('.democritus-code')
				parent.code.append(data);

				parent.code.find('.democritus-code--nav li:first-child').addClass('active');
				parent.code.find('.democritus-code--list li[data-target]:last-child').hide();

				if (Prism) {
					Prism.highlightElement(Zepto('.democritus-code--list li pre code.language-html').get(0));
					Prism.highlightElement(Zepto('.democritus-code--list li pre code.language-handlebars').get(0));
				}

				parent.bindTabs();
			}
		});
	},

	bindTabs: function () {
		var parent = this,
			tabs = this.code.find('.democritus-code--nav li a');

		tabs.each(function () {
			Zepto(this).on('click', function () {
				var element = Zepto(this);
				var list = element.parent();

				tabs.parent().removeClass('active');
				parent.code.find('[data-target]').hide();

				list.addClass('active');
				parent.code.find('.democritus-code--list li[data-target="' + element.attr('href') + '"]').show();
				return false;
			});
		});
	},

	buildDependenciesList: function () {
		var dependencies = democritus.i.dependencies;
		var target = Zepto('#democritus-dependencies-list');
		var d = [];

		console.log(dependencies.length);

		if (dependencies.length === 0) {
			return Zepto('.democritus-info-bar--patterns').hide();
		}

		for (var i = 0; i < dependencies.length; i++) {
			dependencies[i]
			d.push('<a href="' + dependencies[i].path.replace('./', '/patterns/') + '">' + dependencies[i].partial + '</a>');
		}

		target.append(d.join(', '));
	}
}

window.onload = function () {
	new democritus.core.main();
};