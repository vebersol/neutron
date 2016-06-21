var Search = function () {
	this.init();
};

Search.prototype = {
	init: function() {
		this.bindSearch();
	},

	bindSearch: function () {
		var timer,
				input = Zepto('.neutron-menu--search input'),
				menu = Zepto('.neutron-menu--items');

		input.on('keyup', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val(),
						anchors = Zepto('.neutron-menu--items > li a, .neutron-menu--items > li label');

				Zepto('.neutron-menu--items li[data-item], .neutron-menu--items li a').hide();
				Zepto('.neutron-menu--items li input').prop('checked', false);

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
					Zepto('.neutron-menu--items li[data-item], .neutron-menu--items li a').show();
				}
			}, 500);
		});
	}
}
