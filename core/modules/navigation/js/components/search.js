class Search {
	constructor() {
		this.bindSearch();
		this.firstSearch = true;
	}

	bindSearch() {
		var parent = this,
			timer,
			input = Zepto(neutronADT.i.pcn('.menu--search input')),
			clearBtn = Zepto(neutronADT.i.pcn('.menu--search__clear')),
			menu = Zepto(neutronADT.i.pcn('.menu--items'));

		input.on('keyup blur', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val().toLowerCase(),
					anchorsList = [neutronADT.i.pcn('.menu--items > li a'), neutronADT.i.pcn('.menu--items > li label')],
					anchors = Zepto(anchorsList.join(', ')),
					itemsList = [neutronADT.i.pcn('.menu--items li[data-item]'), neutronADT.i.pcn('.menu--items li a')];

				if(parent.firstSearch) {
					parent.opened = Zepto(neutronADT.i.pcn('.menu--items input:checked'));
					parent.firstSearch = false;
				}

				Zepto(itemsList.join(', ')).hide();
				Zepto(neutronADT.i.pcn('.menu--items li input')).prop('checked', false);

				if(value != ''){
					anchors.each(function () {
						var element = Zepto(this),
								text = element.text().toLowerCase(),
								elementTag = element.prop('tagName');

						if (text.indexOf(value) !== -1) {
							element.show();

							element.parents('li[data-item]').each(function () {
								Zepto(this).children('input').prop('checked', true);
								Zepto(this).show();
							});

							if (elementTag === 'LABEL') {
								element
									.next()
									.children()
									.show()
									.find('a')
									.show();
							}
						}
					});
				} else {
					Zepto(itemsList.join(', ')).show();
					parent.opened.prop('checked', true);
					parent.firstSearch = true;
					parent.opened = Zepto(neutronADT.i.pcn('.menu--items input:checked'));
				}
			}, 500);
		});

		input.on('focus', function () {
			Zepto(this).closest(neutronADT.i.pcn('.menu--search')).addClass(neutronADT.i.pcn('menu--search__opened'))
		});

		input.on('blur', function () {
			var input = Zepto(this);
			var value = input.val();

			if (value.length === 0) {
				input.closest(neutronADT.i.pcn('.menu--search')).removeClass(neutronADT.i.pcn('menu--search__opened'))
			}
		});

		clearBtn.on('click', function () {
			input.prop('value', '')
			input.blur();
			Zepto(neutronADT.i.pcn('.menu--search')).removeClass(neutronADT.i.pcn('menu--search__opened'));
		});
	}
}

module.exports = Search;
