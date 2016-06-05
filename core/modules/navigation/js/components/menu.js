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
				path = window.location.pathname,
				qrcode,	
				qrcodeEl = Zepto('#qrcode'),
				codeBtn = Zepto('.neutron-navigation--code');

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
					nav = Zepto('.neutron-navigation'),
					bars = '.neutron-patterns-menu, .neutron-navigation--menu, .neutron-search-wrapper, .neutron-navigation--qr, .neutron-qr-code-frame';

			if (nav.hasClass('active')) {
				element.removeClass('fa-compress');
				Zepto(bars).removeClass('active');
			} else {
				element.addClass('fa-compress');
			}

			nav.toggleClass('active');
		});

		Zepto('.neutron-navigation--menu').click(function () {
			Zepto(this).toggleClass('active');
			menu.toggleClass('active');
			Zepto('.neutron-search-wrapper').toggleClass('active');
		});

		if (patternData.i.patternName.length > 0) {
			codeBtn.click(function () {
				Zepto(this).toggleClass('active');
				var frame = Zepto('.neutron-code-frame');
				var bars = Zepto('.neutron-start-button, .neutron-navigation, .neutron-patterns-menu, .neutron-search-wrapper, .neutron-qr-code-frame');

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
	}	
}
