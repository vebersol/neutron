QRCode = require('../libs/qrcode.min');

var Menu = function () {
	var CodeFrame = require('./codeFrame');
	this.codeFrame = new CodeFrame();
	this.namespace = 'neutronADT';
	this.menuBehaviorNamespace = this.namespace+'menuBehavior';

	this.init();
}

Menu.prototype = {
	init: function () {
		var parent = this;

		Zepto.ajax({
			url: neutronADT.i.assetsPath + 'data/patterns.json',
			dataType: "json",
			success: function(data) {
				var Storage = require('./storage');
				parent.storage = new Storage();
				parent.renderMenu(data);

				parent.menuBehavior = parent.storage.getSettings(parent.menuBehaviorNamespace) || neutronADT.i.menuBehavior;
				parent.changeMenuBehavior(parent.menuBehavior);
				Zepto(neutronADT.i.pcn('.settings--menu-behavior input[type=radio][value='+parent.menuBehavior+']')).attr("checked", true);

				var KeyboardNav = require('./keyboardNav');
				new KeyboardNav();

				var Search = require('./search');
				new Search();

				var Theme = require('./theme');
				new Theme();
			}
		});
	},

	renderMenu: function (data) {
		var menuArr = ['atoms', 'molecules', 'organisms', 'templates', 'pages'],
				menu = Zepto(neutronADT.i.pcn('.menu--items')),
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
				list = Zepto('<li><a href="' + neutronADT.i.patternsPath + data[item].url + '">' + this.toTitle(item) + '</a></li>');
				if (data[item].status) {
					list.find('a').addClass(neutronADT.i.pcn(data[item].status))
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
				qrCodeFrame = Zepto(neutronADT.i.pcn('.qr-code-wrapper')),
				infoFrame = Zepto(neutronADT.i.pcn('.info-wrapper')),
				codeBtn = Zepto(neutronADT.i.pcn('.button--code')),
				menu = Zepto(neutronADT.i.pcn('.menu--items')),
				classList = [neutronADT.i.pcn('.button--start'), neutronADT.i.pcn('.navigation'), neutronADT.i.pcn('.menu')],
				movableFrames = Zepto(classList.join(', '));

		if(parent.menuBehavior === "off-canvas") {
			Zepto('body').on('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', function() {
				if(!Zepto(this).hasClass(neutronADT.i.pcn('off-canvas--active'))) {
					Zepto(this).removeClass(neutronADT.i.pcn('off-canvas--overflow'));
				}
			});
		}

		Zepto(neutronADT.i.pcn('.button--start')).click(function () {
			var element = Zepto(this),
					body = Zepto('body');

			element.toggleClass('active');
			Zepto(neutronADT.i.pcn('.sticky-nav')).toggleClass('active');

			if(parent.menuBehavior === "off-canvas") {
				if (body.hasClass(neutronADT.i.pcn('off-canvas--active'))) {
					body.removeClass(neutronADT.i.pcn('off-canvas--active'));
				} else {
					body.addClass(neutronADT.i.pcn('off-canvas--active'));
					body.addClass(neutronADT.i.pcn('off-canvas--overflow'));
				}
			}

			if (element.hasClass('active')) {
				parent.storage.add('start');
			} else {
				parent.storage.remove('start');
			}
		});

		if (neutronADT.i.patternName.length > 0) {
			codeBtn.click(function () {
				if (!parent.codeFrame.loaded) {
					parent.codeFrame.load();
				}

				Zepto(this).toggleClass('active');
				var frame = Zepto(neutronADT.i.pcn('.code-frame'));

				frame.toggleClass('active');

				if (frame.hasClass('active')) {
					parent.storage.add('code');
					movableFrames.addClass(neutronADT.i.pcn('frame-active'));
				} else {
					parent.storage.remove('code');
					movableFrames.removeClass(neutronADT.i.pcn('frame-active'));
				}
			});
		} else {
			codeBtn.addClass('disabled');
		}

		Zepto(neutronADT.i.pcn('.button--search')).click(function () {
			var searchInput = Zepto(neutronADT.i.pcn('.menu--search input'));
			searchInput.focus();
		});

		var buttonClassPath = [neutronADT.i.pcn('.code-frame--close'), neutronADT.i.pcn('.button--close__link')];

		Zepto(buttonClassPath.join(' ')).on('click', function () {
			var codeFrameClasses = [neutronADT.i.pcn('.code-frame'), neutronADT.i.pcn('.button--code')];
			Zepto(codeFrameClasses.join(', ')).removeClass('active');
			movableFrames.removeClass(neutronADT.i.pcn('frame-active'));
			parent.storage.remove('code');
		});

		qrCodeFrame.find(neutronADT.i.pcn('.button--close__link')).on('click', function () {
			var qrCodeClasses = [neutronADT.i.pcn('.qr-code-wrapper'), neutronADT.i.pcn('.button--qr')];

			Zepto(qrCodeClasses.join(', ')).removeClass('active');
			parent.storage.remove('qr');
		});

		Zepto(neutronADT.i.pcn('.button--qr')).click(function () {
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

				qrCodeFrame.find(neutronADT.i.pcn('.lightbox--content__text span')).html(location.href);

				parent.storage.add('qr');
			}
			else {
				el.removeClass('active');
				qrCodeFrame.removeClass('active');
				parent.storage.remove('qr');
			}
		});

		Zepto(neutronADT.i.pcn('.button--info')).click(function () {
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

		infoFrame.find(neutronADT.i.pcn('.button--close__link')).on('click', function () {
			var infoClasses = [neutronADT.i.pcn('.info-wrapper'), neutronADT.i.pcn('.button--info')];

			Zepto(infoClasses.join(', ')).removeClass('active');
			parent.storage.remove('info');
		});

		Zepto(neutronADT.i.pcn('.settings--menu-behavior input[type=radio]')).on('change', function () {
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
				Zepto(neutronADT.i.pcn('.button--' + btns[i])).click();
			}
		}
	},

	showCurrent: function(menu) {
		var parent = this,
				path = window.location.pathname;

		if(path != '/' && path != '/index.html') {
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
			body.addClass(neutronADT.i.pcn('off-canvas'));

			if(Zepto(neutronADT.i.pcn('.sticky-nav')).hasClass('active')) {
				body.addClass(neutronADT.i.pcn('off-canvas--active'));
				body.addClass(neutronADT.i.pcn('off-canvas--overflow'));
			}
		} else {
			body.removeClass(neutronADT.i.pcn('off-canvas')).removeClass(neutronADT.i.pcn('off-canvas--active')).removeClass(neutronADT.i.pcn('off-canvas--overflow'));
		}

		this.menuBehavior = behavior;
		this.storage.setSettings(this.menuBehaviorNamespace, behavior);
	},

	setStatus: function () {
		var statusTarget = Zepto(neutronADT.i.pcn('#status'));
		var activeMenuItem = Zepto(neutronADT.i.pcn('.menu--items .current a'));
		var status = activeMenuItem.attr('class');

		if (status) {
			statusTarget.find('span')
				.addClass(status)
				.append(neutronADT.i.noPrefix(status).toUpperCase().replace('-', ' '));
		}
		else {
			statusTarget.hide();
		}
	}
}

module.exports = Menu;
