var KeyboardNav = function () {
	this.init();
}

KeyboardNav.prototype = {
	init: function (buttons) {
		var parent = this;
		
		this.buttons = buttons;
		this.startBtn = Zepto('.neutron-button--start');
		this.navBar = Zepto('.neutron-navigation');
		this.menuBtn = Zepto('.neutron-button--menu');
		this.infoBtn = Zepto('.neutron-button--code');
		this.qrCodeBtn = Zepto('.neutron-button--qr');

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
		this.menuBtn = Zepto('.neutron-button--menu');

		if (!this.navBar.hasClass('active')) {
			this.navBar.addClass('active');
		}

		this.menuBtn.click();
		this.checkStartBtn();
	},

	openInfoBar: function () {
		this.infoBtn = Zepto('.neutron-button--code');

		if (!this.navBar.hasClass('active')) {
			this.navBar.addClass('active');
		}

		this.infoBtn.click();
		this.checkStartBtn();
	},

	openQRCodeBar: function () {
		this.qrCodeBtn = Zepto('.neutron-button--qr');

		if (!this.navBar.hasClass('active')) {
			this.navBar.addClass('active');
		}

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
	}
}
