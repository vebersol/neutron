var KeyboardNav = function () {
	this.init();
}

KeyboardNav.prototype = {
	init: function (buttons) {
		var parent = this;

		this.buttons = buttons;
		this.bar = Zepto(neutronADT.i.pcn('.sticky-nav'));
		this.startBtn = Zepto(neutronADT.i.pcn('.button--start'));
		this.infoBtn = Zepto(neutronADT.i.pcn('.button--code'));
		this.qrCodeBtn = Zepto(neutronADT.i.pcn('.button--qr'));
		this.settingsBtn = Zepto(neutronADT.i.pcn('.button--info'));
		this.searchBtn = Zepto(neutronADT.i.pcn('.button--search'));

		Zepto(document).on('keyup', function (ev) {
			parent.keyUp(ev);
		});
	},

	keyUp: function (ev) {
		if (!Zepto(ev.target).is('input, textarea')) {
			ev.preventDefault();

			if (this.isKey(ev, 'c')) {
				this.openInfoBar();
			} else if (this.isKey(ev, 'q')) {
				this.openQRCodeBar();
			} else if (this.isKey(ev, 'n')) {
				this.toggleBar();
			} else if (this.isKey(ev, 'f')) {
				this.toggleSearch();
			} else if (this.isKey(ev, 's')) {
				this.openSettings();
			} else if (this.isKey(ev, 'm')) {
				if(!this.bar.hasClass('active')) {
					this.toggleBar();
				}

				var menu = Zepto(neutronADT.i.pcn('.menu--items'));
				var firstItem = menu.children().find('input').first();
				firstItem.focus().prop('checked', true);
			}
		}
	},

	isKey: function (ev, key) {
		if (ev.ctrlKey === true || ev.shiftKey === true) {
			return false;
		}

		return (ev.code == 'Key' + key.toUpperCase() || ev.key == key)
	},

	openInfoBar: function () {
		this.infoBtn.click();
		this.checkStartBtn();
	},

	openQRCodeBar: function () {
		this.qrCodeBtn.click();
		this.checkStartBtn();
	},

	toggleBar: function () {
		this.startBtn.click();
	},

	checkStartBtn: function () {
		if (!this.startBtn.hasClass('active')) {
			this.startBtn.addClass('active');
		}
	},

	toggleSearch: function () {
		if(!this.bar.hasClass('active')) {
			this.toggleBar();
		}
		this.checkStartBtn();
		this.searchBtn.click();
	},

	openSettings: function () {
		this.checkStartBtn();
		this.settingsBtn.click();
	},
}

module.exports = KeyboardNav;
