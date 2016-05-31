//TODO: Improve javascript structure and transform the two components in one
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
				parent.addCode();
			}
		});
	},

	addCode: function () {
		var parent = this;
		Zepto.ajax({
			url: '/markups/' + democritus.i.patternName + '.html',
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

		if (dependencies.length === 0) {
			return Zepto('.democritus-code-frame--patterns').hide();
		}

		for (var i = 0; i < dependencies.length; i++) {
			dependencies[i]
			d.push('<a href="' + dependencies[i].path.replace('./', '/patterns/') + '">' + dependencies[i].partial + '</a>');
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
		var menuArr = ['atoms', 'molecules', 'organisms', 'templates', 'pages'],
				menu = Zepto('<ul></ul>').addClass('democritus-patterns-menu'),
				list;		

		for (var i = 0; i < menuArr.length; i++) {
			list = Zepto('<li><a href="javascript:;">' + menuArr[i] + '</a></li>').data('item', menuArr[i]);
			submenu = this.createMenuItem(data[menuArr[i]], menuArr[i]);
			list.append(submenu);
			menu.append(list);
		}		

		Zepto('.democritus-sticky-nav').append(menu);
		
		this.bind(menu);
		this.bindSearch();
	},

	createMenuItem: function (data, property) {
		var list,
				objLen,
				menuItem = Zepto('[data-item="' + property + '"]'),
				ul = Zepto('<ul></ul>');

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

	bind: function (menu) {
		var parent = this,
				path = window.location.pathname;

		menu.find('[data-item] > a').click(function () {			
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
		
		Zepto('.democritus-start-button').click(function () {						
			var element = Zepto(this),
					nav = Zepto('.democritus-navigation');			

			if (nav.hasClass('active')) {
				element.removeClass('fa-compress');
				Zepto('.democritus-patterns-menu, .democritus-navigation--menu').removeClass('active');
			} else {
				element.addClass('fa-compress');
			}

			nav.toggleClass('active');
		});

		Zepto('.democritus-navigation--menu').click(function () {
			Zepto(this).toggleClass('active');
			menu.toggleClass('active');
		});

		Zepto('.democritus-navigation--search').click(function () {			
			Zepto(this).toggleClass('active');
			Zepto('.democritus-patterns-menu').toggleClass('search-active');
			Zepto('.democritus-search-wrapper').toggleClass('active');
		});

		Zepto('.democritus-navigation--code').click(function () {
			Zepto(this).toggleClass('active');
			var frame = Zepto('.democritus-code-frame');
			var bars = Zepto('.democritus-start-button, .democritus-navigation, .democritus-patterns-menu');

			frame.toggleClass('active');

			if (frame.hasClass('active')) {
				bars.addClass('democritus-frame-active');
			} else {
				bars.removeClass('democritus-frame-active');
			}
		});

		Zepto('.democritus-code-frame--close__link').on('click', function () {
			var	bars = Zepto('.democritus-start-button, .democritus-navigation, .democritus-patterns-menu');

			Zepto('.democritus-code-frame, .democritus-navigation--code').removeClass('active');
			bars.removeClass('democritus-frame-active');
		});
	},

	showElement: function (element) {
		var uls = element.parents('ul:not(.democritus-patterns-menu)')
		uls.addClass('active');
	},

	bindSearch: function () {
		var timer;
		var input = Zepto('.democritus-search-wrapper input');

		input.blur();

		input.on('keyup', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val();
				var anchors = Zepto('.democritus-patterns-menu > li a');
				console.log(anchors)
				Zepto('.democritus-patterns-menu li').hide();				
				anchors.each(function () {
					var element = Zepto(this);
					var text = element.text().toLowerCase();
					if (text.indexOf(value) !== -1) {
						element.parent().show();
						element.parents('li').each(function () {
							$(this).show();
						});
					}
				});
			}, 500);
		});
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

