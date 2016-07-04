var KeyboardNav = function () {
	this.init();
}

KeyboardNav.prototype = {
	init: function (buttons) {
		var parent = this;

		this.buttons = buttons;
		this.bar = Zepto(pcn('.sticky-nav'));
		this.startBtn = Zepto(pcn('.button--start'));
		this.infoBtn = Zepto(pcn('.button--code'));
		this.qrCodeBtn = Zepto(pcn('.button--qr'));
		this.searchBtn = Zepto(pcn('.button--search'));

		Zepto(document).on('keyup', function (ev) {
			parent.keyUp(ev);
		});
	},

	keyUp: function (ev) {
		if (!Zepto(ev.target).is('input')) {
			ev.preventDefault();

			if (this.isKey(ev, 'c')) {
				this.openInfoBar();
			} else if (this.isKey(ev, 'q')) {
				this.openQRCodeBar();
			} else if (this.isKey(ev, 'n')) {
				this.toggleBar();
			} else if (this.isKey(ev, 'f')) {
				this.toggleSearch();
			}
		}
	},

	isKey: function (ev, key) {
		return (ev.code == 'Key' + key.toUpperCase() || ev.key == key)
	},

	openInfoBar: function () {
		this.infoBtn = Zepto(pcn('.button--code'));

		this.infoBtn.click();
		this.checkStartBtn();
	},

	openQRCodeBar: function () {
		this.qrCodeBtn = Zepto(pcn('.button--qr'));

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
	}
}
