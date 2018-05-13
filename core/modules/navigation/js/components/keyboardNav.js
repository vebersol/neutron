class KeyboardNav {
	constructor (buttons) {
		this.buttons = buttons;
		this.bar = Zepto(neutronADT.i.pcn('.sticky-nav'));
		this.startBtn = Zepto(neutronADT.i.pcn('.button--start'));
		this.infoBtn = Zepto(neutronADT.i.pcn('.button--code'));
		this.qrCodeBtn = Zepto(neutronADT.i.pcn('.button--qr'));
		this.settingsBtn = Zepto(neutronADT.i.pcn('.button--info'));
		this.searchBtn = Zepto(neutronADT.i.pcn('.button--search'));

		Zepto(document).on('keyup', ev => {
			this.keyUp(ev);
		});
	}

	keyUp (ev) {
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

				const menu = Zepto(neutronADT.i.pcn('.menu--items'));
				const firstItem = menu.children().find('input').first();

				firstItem.focus().prop('checked', true);
			}
		}
	}

	isKey (ev, key) {
		if (ev.ctrlKey === true || ev.shiftKey === true) {
			return false;
		}

		return (ev.code == 'Key' + key.toUpperCase() || ev.key == key)
	}

	openInfoBar () {
		this.infoBtn.click();
		this.checkStartBtn();
	}

	openQRCodeBar () {
		this.qrCodeBtn.click();
		this.checkStartBtn();
	}

	toggleBar () {
		this.startBtn.click();
	}

	checkStartBtn () {
		if (!this.startBtn.hasClass('active')) {
			this.startBtn.addClass('active');
		}
	}

	toggleSearch () {
		if(!this.bar.hasClass('active')) {
			this.toggleBar();
		}
		this.checkStartBtn();
		this.searchBtn.click();
	}

	openSettings () {
		this.checkStartBtn();
		this.settingsBtn.click();
	}
}

module.exports = KeyboardNav;
