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
						anchors = Zepto('.neutron-menu--items > li a');

				Zepto('.neutron-menu--items li').hide();
				anchors.each(function () {
					var element = Zepto(this),
							text = element.text().toLowerCase();

					if (text.indexOf(value) !== -1) {
						element.parent().show();
						element.parents('li').each(function () {
							Zepto(this).show();
						});
					}
				});
			}, 500);
		});
	}
}
