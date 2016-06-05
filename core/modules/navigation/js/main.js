var patternData = neutronADT;

//TODO: Improve javascript structure and transform the two components in one
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
		if (patternData.i.patternName) {
			Zepto.ajax({
				url: '/patterns/' + patternData.i.patternName.replace(/\//g, '-') + '/markups.html',
				success: function (data) {
					parent.code = parent.wrapper.find('.neutron-code')
					parent.code.append(data);

					parent.code.find('.neutron-code--nav li:first-child').addClass('active');
					parent.code.find('.neutron-code--list li[data-target]:last-child').hide();


					var codeList = Zepto('.neutron-code--list li');

					if (Prism) {
						Prism.highlightElement(codeList.find('pre code.language-html').get(0));
						Prism.highlightElement(codeList.find('pre code.language-handlebars').get(0));

						var documentationItem = parent.code.find('.neutron-code--list li[data-target="#documentation"]');
						var documentationNavItem = parent.code.find('.neutron-code--nav li a[href="#documentation"]');
						if (documentationItem.length > 0) {
							var docsCode = codeList.find('.neutron-code--documentation code');
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
			tabs = this.code.find('.neutron-code--nav li a');

		tabs.each(function () {
			Zepto(this).on('click', function () {
				var element = Zepto(this);
				var list = element.parent();

				tabs.parent().removeClass('active');
				parent.code.find('[data-target]').hide();

				list.addClass('active');
				parent.code.find('.neutron-code--list li[data-target="' + element.attr('href') + '"]').show();
				return false;
			});
		});
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

var Menu = function () {
	this.init();
}

Menu.prototype = {
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
				menu = Zepto('<ul></ul>').addClass('neutron-patterns-menu'),
				list;

		for (var i = 0; i < menuArr.length; i++) {
			list = Zepto('<li><a href="javascript:;">' + menuArr[i] + '</a></li>').data('item', menuArr[i]);
			submenu = this.createMenuItem(data[menuArr[i]], menuArr[i]);
			list.append(submenu);
			menu.append(list);
		}

		Zepto('.neutron-sticky-nav').append(menu);

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
		Zepto('.neutron-start-button').click(function () {
			var element = Zepto(this),
					nav = Zepto('.neutron-navigation');

			if (nav.hasClass('active')) {
				element.removeClass('fa-compress');
				Zepto('.neutron-patterns-menu, .neutron-navigation--menu').removeClass('active');
			} else {
				element.addClass('fa-compress');
			}

			nav.toggleClass('active');
		});

		Zepto('.neutron-navigation--menu').click(function () {
			Zepto(this).toggleClass('active');
			menu.toggleClass('active');
		});

		Zepto('.neutron-navigation--search').click(function () {
			Zepto(this).toggleClass('active');
			Zepto('.neutron-patterns-menu').toggleClass('search-active');
			Zepto('.neutron-search-wrapper').toggleClass('active');
		});

		var codeBtn = Zepto('.neutron-navigation--code');

		if (patternData.i.patternName.length > 0) {
			codeBtn.click(function () {
				Zepto(this).toggleClass('active');
				var frame = Zepto('.neutron-code-frame');
				var bars = Zepto('.neutron-start-button, .neutron-navigation, .neutron-patterns-menu');

				frame.toggleClass('active');

				if (frame.hasClass('active')) {
					bars.addClass('neutron-frame-active');
				} else {
					bars.removeClass('neutron-frame-active');
				}
			});
		} else {
			codeBtn.addClass('disabled');
		}

		Zepto('.neutron-code-frame--close__link').on('click', function () {
			var	bars = Zepto('.neutron-start-button, .neutron-navigation, .neutron-patterns-menu');

			Zepto('.neutron-code-frame, .neutron-navigation--code').removeClass('active');
			bars.removeClass('neutron-frame-active');
		});

		var qrcode;
		var qrcodeEl = Zepto('#qrcode');
		Zepto('.neutron-navigation--qr').click(function () {
			var el = Zepto(this);

			var qrCodeFrame = Zepto('.neutron-qr-code-frame');
			if (!qrCodeFrame.hasClass('active')) {
				el.addClass('active');
				qrCodeFrame.addClass('active');
				qrcode = new QRCode(qrcodeEl.get(0), {
					text: location.href,
					width: 143,
					height: 143
				});
			}
			else {
				el.removeClass('active');
				qrCodeFrame.removeClass('active');
				setTimeout(function () {
					qrcodeEl.html('');
				}, 500)
			}
		});
	},

	showElement: function (element) {
		var uls = element.parents('ul:not(.neutron-patterns-menu)')
		uls.addClass('active');
	},

	bindSearch: function () {
		var timer,
				input = Zepto('.neutron-search-wrapper input');

		input.blur();

		input.on('keyup', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val(),
						anchors = Zepto('.neutron-patterns-menu > li a');

				Zepto('.neutron-patterns-menu li').hide();
				anchors.each(function () {
					var element = Zepto(this),
							text = element.text().toLowerCase();

					if (text.indexOf(value) !== -1) {
						element.parent().show();
						element.parents('li').each(function () {
							Zepto(this).show();
						});
					}
				});
			}, 500);
		});
	}
}

window.onload = function () {
	new Main();
	new Menu();
	new KeyboardNav();
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

