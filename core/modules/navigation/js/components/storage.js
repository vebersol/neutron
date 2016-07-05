var Storage = function () {
	this.namespace = 'neutronADT';
	this.themeNamespace = this.namespace+'Theme';
	this.privateMode = false;
	this.data = window.localStorage.getItem(this.namespace);

	this.init();
};

Storage.prototype = {
	init: function () {
		if (!this.data) {
			return this.setData();
		}
	},

	setData: function () {
		var layers = this.getOpenedLayers();
		var store = this.setItemsToStore(layers);

		// ✔ TODO: check an alternative solution to store in private mode
		try {
			window.localStorage.setItem(this.namespace, store);
			this.data = window.localStorage.getItem(this.namespace);
		} catch(e) {
			this.privateMode = true;
		}
	},

	getOpenedLayers: function () {
		var wrapper = Zepto(pcn('.sticky-nav'));
		var btnClass = pcn('button--');
		var buttons = wrapper.find('[class*="' + btnClass + '"]');
		var openedLayers = [];

		for (var i = 0; i < buttons.length; i++) {
			if (Zepto(buttons[i]).hasClass('active')) {
				openedLayers.push(buttons[i].replace(btnClass, ''));
			}
		}

		return openedLayers;
	},

	add: function (name) {
		if (this.privateMode) {
			return false;
		}
		var dataArr = this.data.split(',');

		if (name !== 'start' && Zepto.inArray('start', dataArr) === -1) {
			dataArr.push('start');
		}

		if(Zepto.inArray(name, dataArr) === -1) {
			dataArr.push(name);

			dataArr = dataArr.filter(function(n){
				return n != ""
			});

			this.data = dataArr.join(',');
			window.localStorage.setItem(this.namespace, this.data);

			return true;
		}

		return false;
	},

	remove: function (name) {
		if (this.privateMode) {
			return false;
		}
		var dataArr = this.data.split(',');

		if(Zepto.inArray(name, dataArr) > -1) {
			dataArr = dataArr.filter(function(n){
				return n != "" && n != name;
			});

			this.data = dataArr.join(',');
			window.localStorage.setItem(this.namespace, this.data);

			return true;
		}

		return false;
	},

	setItemsToStore: function (items) {
		if (items.length > 0) {
			return items.join(',');
		}

		return "";
	},

	setTheme: function (theme) {
		window.localStorage.setItem(this.themeNamespace, theme);
	},

	getTheme: function () {
		return window.localStorage.getItem(this.themeNamespace);
	}
}
