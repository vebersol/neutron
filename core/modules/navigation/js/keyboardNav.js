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
		ev.preventDefault();

		var ctrlAlt = ev.ctrlKey && ev.altKey;

		if (ctrlAlt && this.isKey(ev, 'm')) {
			this.openMenu();
		} else if (ctrlAlt && this.isKey(ev, 'c')) {
			this.openInfoBar();
		} else if (ctrlAlt && this.isKey(ev, 'f')) {
			this.openSearchBar();
		} else if (ctrlAlt && this.isKey(ev, 'e')) {
			this.openQRCodeBar();
		} else if (ctrlAlt && this.isKey(ev, 'z')) {
			this.toggleBar();
		}
	},

	isKey: function (ev, key) {
		return (ev.code == 'Key' + key.toUpperCase() || ev.key == key)	
	},

	openMenu: function () {
		var barElement = Zepto('.neutron-navigation');
		var menuBtn = Zepto('.neutron-navigation--menu');
		
		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}
		
		menuBtn.click();
	},

	openInfoBar: function () {
		var barElement = Zepto('.neutron-navigation');
		var infoBtn = Zepto('.neutron-navigation--code');
		
		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		infoBtn.click();
	},

	openSearchBar: function () {
		var barElement = Zepto('.neutron-navigation');
		var searchBtn = Zepto('.neutron-navigation--search');
		
		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		searchBtn.click();
	},

	openQRCodeBar: function () {
		var barElement = Zepto('.neutron-navigation');
		var qrCodeBtn = Zepto('.neutron-navigation--qr');
		
		if (!barElement.hasClass('active')) {
			barElement.addClass('active');
		}

		qrCodeBtn.click();
	},

	toggleBar: function () {
		var startBtn = Zepto('.neutron-start-button');

		startBtn.click();
	}
}