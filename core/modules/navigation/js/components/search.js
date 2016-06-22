var Search = function () {
	this.init();
};

Search.prototype = {
	init: function() {
		this.bindSearch();
	},

	bindSearch: function () {
		var timer,
				input = Zepto(pcn('.menu--search input')),
				menu = Zepto(pcn('.menu--items'));

		input.on('keyup', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val().toLowerCase(),
					anchorsList = [pcn('.menu--items > li a'), pcn('.menu--items > li label')],
					anchors = Zepto(anchorsList.join(', ')),
					itemsList = [pcn('.menu--items li[data-item]'), pcn('.menu--items li a')];

				Zepto(itemsList.join(', ')).hide();
				Zepto(pcn('.menu--items li input')).prop('checked', false);

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
				}
			}, 500);
		});
	}
}
