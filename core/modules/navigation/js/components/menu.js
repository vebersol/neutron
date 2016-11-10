var Menu = function () {
	this.codeFrame = new CodeFrame();
	this.namespace = 'neutronADT';
	this.menuBehaviorNamespace = this.namespace+'menuBehavior';

	this.init();
}

Menu.prototype = {
	init: function () {
		var parent = this;

		Zepto.ajax({
			url: patternData.i.assetsPath + 'data/patterns.json',
			dataType: "json",
			success: function(data) {
				parent.storage = new Storage();
				parent.renderMenu(data);

				parent.menuBehavior = parent.storage.getSettings(parent.menuBehaviorNamespace) || menuBehavior;
				parent.changeMenuBehavior(parent.menuBehavior);
				Zepto(pcn('.settings--menu-behavior input[type=radio][value='+parent.menuBehavior+']')).attr("checked", true);

				new KeyboardNav();
				new Search();
				new Theme();
			}
		});
	},

	renderMenu: function (data) {
		var menuArr = ['atoms', 'molecules', 'organisms', 'templates', 'pages'],
				menu = Zepto(pcn('.menu--items')),
				list;

		for (var i = 0; i < menuArr.length; i++) {
			if (data.hasOwnProperty(menuArr[i])) {
				list = Zepto('<li><input type="checkbox" id="'+menuArr[i]+'" /><label for="'+menuArr[i]+'">' + this.toTitle(menuArr[i]) + '</label></li>').data('item', menuArr[i]);
				submenu = this.createMenuItem(data[menuArr[i]], menuArr[i]);
				list.append(submenu);
				menu.append(list);
			}
		}

		this.bind();
		this.setupButtons();
		this.setStatus();
	},

	createMenuItem: function (data, property) {
		var list,
				objLen,
				menuItem = Zepto('[data-item="' + property + '"]'),
				ul = Zepto('<ul></ul>');

		for (var item in data) {
			objLen = this.getObjectSize(data[item]);

			if (data[item].hasOwnProperty('status') && data[item].hasOwnProperty('url')) {
				list = Zepto('<li><a href="' + PATTERNS_PATH + data[item].url + '">' + this.toTitle(item) + '</a></li>');
				if (data[item].status) {
					list.find('a').addClass(pcn(data[item].status))
				}
			} else if (typeof data[item] === 'object' && objLen > 0) {
				list = Zepto('<li><input type="checkbox" id="'+item+'-'+property+'" /><label for="'+item+'-'+property+'">' + this.toTitle(item) + '</label></li>').data('item', item);
				list.append(this.createMenuItem(data[item], item));
			}

			ul.append(list);
		}

		if (ul.children().length > 0) {
			return ul;
		}

		return "";
	},

	bind: function () {
		var parent = this,
				qrcode,
				qrcodeEl = Zepto('#qrcode'),
				qrCodeFrame = Zepto(pcn('.qr-code-wrapper')),
				infoFrame = Zepto(pcn('.info-wrapper')),
				codeBtn = Zepto(pcn('.button--code')),
				menu = Zepto(pcn('.menu--items')),
				classList = [pcn('.button--start'), pcn('.navigation'), pcn('.menu')],
				movableFrames = Zepto(classList.join(', '));

		if(parent.menuBehavior === "off-canvas") {
			Zepto('body').on('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function() {
				if(!Zepto(this).hasClass(pcn('off-canvas--active'))) {
					Zepto(this).removeClass(pcn('off-canvas--overflow'));
				}
			});
		}

		Zepto(pcn('.button--start')).click(function () {
			var element = Zepto(this),
					body = Zepto('body');

			element.toggleClass('active');
			Zepto(pcn('.sticky-nav')).toggleClass('active');

			if(parent.menuBehavior === "off-canvas") {
				if (body.hasClass(pcn('off-canvas--active'))) {
					body.removeClass(pcn('off-canvas--active'));
				} else {
					body.addClass(pcn('off-canvas--active'));
					body.addClass(pcn('off-canvas--overflow'));
				}
			}

			if (element.hasClass('active')) {
				parent.storage.add('start');
			} else {
				parent.storage.remove('start');
			}
		});

		if (patternData.i.patternName.length > 0) {
			codeBtn.click(function () {
				if (!parent.codeFrame.loaded) {
					parent.codeFrame.load();
				}

				Zepto(this).toggleClass('active');
				var frame = Zepto(pcn('.code-frame'));

				frame.toggleClass('active');

				if (frame.hasClass('active')) {
					parent.storage.add('code');
					movableFrames.addClass(pcn('frame-active'));
				} else {
					parent.storage.remove('code');
					movableFrames.removeClass(pcn('frame-active'));
				}
			});
		} else {
			codeBtn.addClass('disabled');
		}

		Zepto(pcn('.button--search')).click(function () {
			var searchInput = Zepto(pcn('.menu--search input'));
			searchInput.focus();
		});

		var buttonClassPath = [pcn('.code-frame--close'), pcn('.button--close__link')];

		Zepto(buttonClassPath.join(' ')).on('click', function () {
			var codeFrameClasses = [pcn('.code-frame'), pcn('.button--code')];
			Zepto(codeFrameClasses.join(', ')).removeClass('active');
			movableFrames.removeClass(pcn('frame-active'));
			parent.storage.remove('code');
		});

		qrCodeFrame.find(pcn('.button--close__link')).on('click', function () {
			var qrCodeClasses = [pcn('.qr-code-wrapper'), pcn('.button--qr')];

			Zepto(qrCodeClasses.join(', ')).removeClass('active');
			parent.storage.remove('qr');
		});

		Zepto(pcn('.button--qr')).click(function () {
			var el = Zepto(this);

			if (!qrCodeFrame.hasClass('active')) {
				qrcodeEl.html('');
				el.addClass('active');
				qrCodeFrame.addClass('active');
				qrcode = new QRCode(qrcodeEl.get(0), {
					text: location.href,
					width: 256,
					height: 256
				});

				qrCodeFrame.find(pcn('.lightbox--content__text span')).html(location.href);

				parent.storage.add('qr');
			}
			else {
				el.removeClass('active');
				qrCodeFrame.removeClass('active');
				parent.storage.remove('qr');
			}
		});

		Zepto(pcn('.button--info')).click(function () {
			var el = Zepto(this);

			if (!infoFrame.hasClass('active')) {
				el.addClass('active');
				infoFrame.addClass('active');
				parent.storage.add('info');
			}
			else {
				el.removeClass('active');
				infoFrame.removeClass('active');
				parent.storage.remove('info');
			}
		});

		infoFrame.find(pcn('.button--close__link')).on('click', function () {
			var infoClasses = [pcn('.info-wrapper'), pcn('.button--info')];

			Zepto(infoClasses.join(', ')).removeClass('active');
			parent.storage.remove('info');
		});

		Zepto(pcn('.settings--menu-behavior input[type=radio]')).on('change', function () {
			var el = Zepto(this),
				value = el.val();

			parent.changeMenuBehavior(value);
		});

		parent.showCurrent(menu);
	},

	showElement: function (element) {
		var checkboxes = element.parents('li[data-item]').children('input');
		checkboxes.prop('checked', true);
	},

	toTitle: function (slug) {
		var words = slug.split('-');

		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			words[i] = word.charAt(0).toUpperCase() + word.slice(1);
		}

		return words.join(' ');
	},

	getObjectSize: function(obj) {
		var size = 0,
			key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	},

	setupButtons: function () {
		if (!this.storage.privateMode) {
			var btns = this.storage.data.split(',');

			for (var i = 0; i < btns.length; i++) {
				Zepto(pcn('.button--' + btns[i])).click();
			}
		}
	},

	showCurrent: function(menu) {
		var parent = this,
				path = window.location.pathname;

		if(path !== '/') {
			menu.find('a').each(function () {
				var anchor = Zepto(this);
				if (anchor.attr('href').match(path)) {
					anchor.parent().addClass('current');
					parent.showElement(anchor);
				}
			});
		}
	},

	changeMenuBehavior: function(behavior) {
		var body = Zepto('body');

		if(behavior === "off-canvas") {
			body.addClass(pcn('off-canvas'));

			if(Zepto(pcn('.sticky-nav')).hasClass('active')) {
				body.addClass(pcn('off-canvas--active'));
				body.addClass(pcn('off-canvas--overflow'));
			}
		} else {
			body.removeClass(pcn('off-canvas')).removeClass(pcn('off-canvas--active')).removeClass(pcn('off-canvas--overflow'));
		}

		this.menuBehavior = behavior;
		this.storage.setSettings(this.menuBehaviorNamespace, behavior);
	},

	setStatus: function () {
		var statusTarget = Zepto(pcn('#status'));
		var activeMenuItem = Zepto(pcn('.menu--items .current a'));
		var status = activeMenuItem.attr('class');

		if (status) {
			statusTarget.find('span')
				.addClass(status)
				.append(noPrefix(status).toUpperCase().replace('-', ' '));
		}
		else {
			statusTarget.hide();
		}
	}
}
