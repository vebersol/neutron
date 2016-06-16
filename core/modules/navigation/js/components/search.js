var Search = function () {
	this.init();
};

Search.prototype = {
	init: function() {
		this.bindSearch();
	},

	bindSearch: function () {
		var timer,
				input = Zepto('.neutron-menu--search input');

		input.on('keyup', function (ev) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				var value = Zepto(ev.target).val(),
						anchors = Zepto('.neutron-menu--items > li a, .neutron-menu--items > li label');

				Zepto('.neutron-menu--items > li').hide();
				Zepto('.neutron-menu--items li input').prop('checked', false);

				if(value != ''){
					anchors.each(function () {
						var element = Zepto(this),
								text = element.text().toLowerCase();

						if (text.indexOf(value) !== -1) {						
							element.parents('li[data-item]').each(function () {
								Zepto(this).children('input').prop('checked', true);
								Zepto(this).show();
							});
						}									
					});
				} else {
					Zepto('.neutron-menu--items > li')
								.show()
								.children('input').prop('checked', false);
				}
			}, 500);
		});
	}
}
