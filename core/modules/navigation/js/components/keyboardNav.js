var KeyboardNav = function () {
	this.init();
}

KeyboardNav.prototype = {
	init: function (buttons) {
		var parent = this;
		this.buttons = buttons;
		Zepto(document).on('keyup', function (ev) {
			parent.keyUp(ev);
		});
	},

	keyUp: function (ev) {
		if (!Zepto(ev.target).is('input')) {
			ev.preventDefault();

			if (this.isKey(ev, 'm')) {
				this.openMenu();
			} else if (this.isKey(ev, 'c')) {
				this.openInfoBar();
			} else if (this.isKey(ev, 'q')) {
				this.openQRCodeBar();
			} else if (this.isKey(ev, 'n')) {
				this.toggleBar();
			}
		}
	},

	isKey: function (ev, key) {
		return (ev.code == 'Key' + key.toUpperCase() || ev.key == key)
	},

	openMenu: function () {
		var barElement = Zepto('.neutron-navigation');
		var menuBtn = Zepto('.neutron-button--menu');

		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		menuBtn.click();
	},

	openInfoBar: function () {
		var barElement = Zepto('.neutron-navigation');
		var infoBtn = Zepto('.neutron-button--code');

		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		infoBtn.click();
	},

	openQRCodeBar: function () {
		var barElement = Zepto('.neutron-navigation');
		var qrCodeBtn = Zepto('.neutron-button--qr');

		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		qrCodeBtn.click();
	},

	toggleBar: function () {
		var startBtn = Zepto('.neutron-button--start');

		startBtn.click();
	}
}
