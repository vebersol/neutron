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

				new KeyboardNav();
				new Search();
			}
		});
	},

	renderMenu: function (data) {
		var menuArr = ['atoms', 'molecules', 'organisms', 'templates', 'pages'],
				menu = Zepto('.neutron-menu--items'),
				list;

		for (var i = 0; i < menuArr.length; i++) {
			list = Zepto('<li><a href="javascript:;">' + this.toTitle(menuArr[i]) + '</a></li>').data('item', menuArr[i]);
			submenu = this.createMenuItem(data[menuArr[i]], menuArr[i]);
			list.append(submenu);
			menu.append(list);
		}

		this.bind();
	},

	createMenuItem: function (data, property) {
		var list,
				objLen,
				menuItem = Zepto('[data-item="' + property + '"]'),
				ul = Zepto('<ul></ul>');

		for (var item in data) {
			objLen = Object.size(data[item]);

			if (typeof data[item] === 'string') {
				list = Zepto('<li><a href="' + data[item] + '">' + this.toTitle(item) + '</a></li>');
			} else if (typeof data[item] === 'object' && objLen > 0) {
				list = Zepto('<li><a href="javascript:;">' + this.toTitle(item) + '</a></li>').data('item', item);
				list.append(this.createMenuItem(data[item], item));
			}

			ul.append(list);
		}

		if (ul.children().length > 0) {
			return ul;
		}

		return false;
	},

	bind: function () {
		var parent = this,
				path = window.location.pathname,
				qrcode,
				qrcodeEl = Zepto('#qrcode'),
				qrCodeFrame = Zepto('.neutron-qr-code-frame'),
				codeBtn = Zepto('.neutron-button--code'),
				menu = Zepto('.neutron-menu--items'),
				selectors = [
					'.neutron-menu', '.neutron-button--menu',
					'.neutron-button--code', '.neutron-button--qr',
					'.neutron-qr-code-frame', '.neutron-code-frame'
				],
				bars = Zepto(selectors.join(', ')),
				movableFrames = Zepto('.neutron-button--start, .neutron-navigation, .neutron-menu, .neutron-qr-code-frame');

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

		Zepto('.neutron-button--start').click(function () {
			var element = Zepto(this),
					nav = Zepto('.neutron-navigation');

			if (nav.hasClass('active')) {
				element.removeClass('active');
				bars.removeClass('active');
				movableFrames.removeClass('neutron-frame-active')
			} else {
				element.addClass('active');
			}

			nav.toggleClass('active');
		});

		Zepto('.neutron-button--menu').click(function () {
			Zepto(this).toggleClass('active');
			menu.parent().toggleClass('active');
		});

		if (patternData.i.patternName.length > 0) {
			codeBtn.click(function () {
				Zepto(this).toggleClass('active');
				var frame = Zepto('.neutron-code-frame');

				frame.toggleClass('active');

				if (frame.hasClass('active')) {
					movableFrames.addClass('neutron-frame-active');
				} else {
					movableFrames.removeClass('neutron-frame-active');
				}
			});
		} else {
			codeBtn.addClass('disabled');
		}

		Zepto('.neutron-code-frame--close__link').on('click', function () {
			Zepto('.neutron-code-frame, .neutron-button--code').removeClass('active');
			movableFrames.removeClass('neutron-frame-active');
		});

		Zepto('.neutron-button--qr').click(function () {
			var el = Zepto(this);

			if (!qrCodeFrame.hasClass('active')) {
				qrcodeEl.html('');
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
			}
		});
	},

	showElement: function (element) {
		var uls = element.parents('ul:not(.neutron-menu--items)')
		uls.addClass('active');
	},

	toTitle: function (slug) {
		var words = slug.split('-');

		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			words[i] = word.charAt(0).toUpperCase() + word.slice(1);
		}

		return words.join(' ');
	}
}
