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
		if (democritus.i.patternName) {
			Zepto.ajax({
				url: '/markups/' + democritus.i.patternName + '.html',
				success: function (data) {
					parent.code = parent.wrapper.find('.democritus-code')
					parent.code.append(data);

					parent.code.find('.democritus-code--nav li:first-child').addClass('active');
					parent.code.find('.democritus-code--list li[data-target]:last-child').hide();


					var codeList = Zepto('.democritus-code--list li');

					if (Prism) {
						Prism.highlightElement(codeList.find('pre code.language-html').get(0));
						Prism.highlightElement(codeList.find('pre code.language-handlebars').get(0));
						
						var documentationItem = parent.code.find('.democritus-code--list li[data-target="#documentation"]');
						var documentationNavItem = parent.code.find('.democritus-code--nav li a[href="#documentation"]');
						if (documentationItem.length > 0) {
							var docsCode = codeList.find('.democritus-code--documentation code');
							docsCode.addClass('language-html');
							if (docsCode.length > 0) {
								Prism.highlightElement(docsCode.get(0));
							}
						} else {
							documentationNavItem.parent().remove();
						}
					}

					parent.bindTabs();
				}
			});
		}
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

		if (dependencies.length === 0) {
			return Zepto('.democritus-info-bar--patterns').hide();
		}

		for (var i = 0; i < dependencies.length; i++) {
			dependencies[i]
			d.push('<a href="' + dependencies[i].path.replace('/', '/patterns/') + '">' + dependencies[i].partial + '</a>');
		}

		target.append(d.join(', '));
	}
}

democritus.core.menu = function () {
	this.init();
}

democritus.core.menu.prototype = {
	init: function () {
		var parent = this;
		Zepto.ajax({
			url: '/data/patterns.json',
			success: function(data) {
				parent.renderMenu(data);
			}
		});
	},

	renderMenu: function (data) {
		var menuArr = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
		var menu = Zepto('<ul></ul>').addClass('democritus-patterns-menu');
		var activationBtn = Zepto('<a href="javascript:;">+</a>').addClass('democritus-patterns-activation');
		Zepto('#democritus').append(activationBtn).append(menu);
		var list;

		menu.append('<li><a href="javascript:;" class="democritus-patterns-deactivation">X</a></li>')

		for (var i = 0; i < menuArr.length; i++) {
			list = Zepto('<li><a href="javascript:;">' + menuArr[i] + '</a></li>').data('item', menuArr[i]);
			submenu = this.createMenuItem(data[menuArr[i]], menuArr[i]);
			list.append(submenu);
			menu.append(list);
		}

		this.bind(menu, activationBtn);
	},

	createMenuItem: function (data, property) {
		var list;
		var objLen;
		var menuItem = Zepto('[data-item="' + property + '"]');
		var ul = Zepto('<ul></ul>');

		for (var item in data) {
			objLen = Object.size(data[item]);

			if (typeof data[item] === 'string') {
				list = Zepto('<li><a href="' + data[item] + '">' + item + '</a></li>');
			} else if (typeof data[item] === 'object' && objLen > 0) {
				list = Zepto('<li><a href="javascript:;">' + item + '</a></li>').data('item', item);
				list.append(this.createMenuItem(data[item], item));
			}

			ul.append(list);
		}

		if (ul.children().length > 0) {
			return ul;
		}

		return false;
	},

	bind: function (menu, activationBtn) {
		var parent = this;
		var path = window.location.pathname;

		menu.find('[data-item] > a').click(function () {
			// menu.find('ul').removeClass('active');
			var subMenu = Zepto(this).parent().children('ul');
			subMenu.toggleClass('active');
		});

		menu.find('a').each(function () {
			var anchor = Zepto(this);
			if (anchor.attr('href') == path) {
				anchor.parent().addClass('current');
				parent.showElement(anchor);
			}
		});

		activationBtn.click(function () {
			menu.addClass('visible');
		});

		Zepto('.democritus-patterns-deactivation').click(function () {
			menu.removeClass('visible');
		});
	},

	showElement: function (element) {
		var uls = element.parents('ul:not(.democritus-patterns-menu)')
		uls.addClass('active');
	}
}

window.onload = function () {
	new democritus.core.main();
	new democritus.core.menu();
};


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
