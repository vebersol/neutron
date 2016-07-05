var Theme = function() {
	this.storage = new Storage();
	this.init();
}

Theme.prototype = {
	init: function() {
		this.bind();
		this.setupTheme();
	},

	bind: function() {
		var parent = this;

		Zepto(pcn('.button--theme')).click(function () {
			var themeInput = Zepto(pcn('.menu--theme select'));
			themeInput.focus();
		});

		Zepto(pcn('.menu--theme__select select')).on('change', function () {
			var el = Zepto(this),
				value = el.val();

			parent.changeTheme(value);
			parent.storage.setTheme(value);
		});

		Zepto(pcn('.menu--theme__select select')).on('focus', function () {
			Zepto(this).closest(pcn('.menu--theme')).addClass(pcn('menu--theme__opened'))
		});

		Zepto(pcn('.menu--theme__select select')).on('blur', function () {
			var input = Zepto(this);

			input.closest(pcn('.menu--theme')).removeClass(pcn('menu--theme__opened'));
		});
	},

	changeTheme: function(theme) {
		var stylesheet = Zepto(pcn('.theme-stylesheet')),
			path = window.location.pathname,
			assetsPath = (path === '/') ? '' : '../../';

		stylesheet.attr('href', assetsPath+'styleguide/modules/navigation/css/'+theme+'.css');
	},

	setupTheme: function () {
		var theme = this.storage.getTheme() || false;
		if(theme) {
			Zepto(pcn('.menu--theme__select select')).val(this.storage.getTheme());
			this.changeTheme(theme);
		}
	}
}
