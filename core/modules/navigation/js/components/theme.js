var Theme = function() {
	var Storage = require('./storage');
	this.storage = new Storage();
	this.namespace = 'neutronADT';
	this.themeNamespace = this.namespace+'Theme';

	this.init();
}

Theme.prototype = {
	init: function() {
		this.bind();
		this.setupTheme();
	},

	bind: function() {
		var parent = this;

		Zepto(neutronADT.i.pcn('.settings--theme input[type=radio]')).on('change', function () {
			var el = Zepto(this),
				value = el.val();

			parent.changeTheme(value);
			parent.storage.setSettings(parent.themeNamespace, value);
		});
	},

	changeTheme: function(theme) {
		var stylesheet = Zepto(neutronADT.i.pcn('.theme-stylesheet'));

		stylesheet.attr('href', neutronADT.i.assetsPath+'styleguide/modules/navigation/css/'+theme+'.css');
	},

	setupTheme: function () {
		var theme = this.storage.getSettings(this.themeNamespace) || false;
		if(theme) {
			Zepto(neutronADT.i.pcn('.settings--theme input[type=radio][value='+theme+']')).attr("checked", true);
			/*this.changeTheme(theme);*/
		}
	}
}

module.exports = Theme;
