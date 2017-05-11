var CodeFrame = function() {
	this.wrapper = Zepto('#' + neutronADT.i.prefix);
	this.loaded = false;
}

CodeFrame.prototype =  {
	load: function () {
		this.loaded = true;
		this.addCode();
	},

	addCode: function () {
		var parent = this;
		if (neutronADT.i.patternName) {
			this.code = parent.wrapper.find(neutronADT.i.pcn('.code'));
			Zepto.ajax({
				url: neutronADT.i.patternsPath + neutronADT.i.patternName.replace(/\//g, '-') + '/markups.html',
				success: function (data) {
					parent.code.append(data);

					parent.code.find(neutronADT.i.pcn('.code--nav li:first-child')).addClass('active');
					parent.code.find(neutronADT.i.pcn('.code--list li[data-target]')).slice(1).hide();

					var codeList = Zepto(neutronADT.i.pcn('.code--list li'));

					if (Prism) {
						Prism.highlightElement(codeList.find('pre code.language-html').get(0));
						Prism.highlightElement(codeList.find('pre code.language-handlebars').get(0));

						var documentationItem = parent.code.find(neutronADT.i.pcn('.code--list li[data-target="#documentation"]'));
						var documentationNavItem = parent.code.find(neutronADT.i.pcn('.code--nav li a[href="#documentation"]'));
						if (documentationItem.length > 0) {
							var docsCode = codeList.find(neutronADT.i.pcn('.code--documentation code'));
							docsCode.addClass('language-html');
							if (docsCode.length > 0) {
								Prism.highlightElement(docsCode.get(0));
							}
						} else {
							documentationNavItem.parent().remove();
						}
					}

					parent.loaderWrapper.remove();

					parent.bindTabs();
				},
				beforeSend: function () {
					parent.loaderWrapper = Zepto('<div class="neutron-code-loader-wrapper"><div class="neutron-loader"></div></div>');
					parent.code.append(parent.loaderWrapper);
				}
			});
		}
	},

	bindTabs: function () {
		var parent = this,
			tabs = this.code.find(neutronADT.i.pcn('.code--nav li a'));

		tabs.each(function () {
			Zepto(this).on('click', function () {
				var element = Zepto(this);
				var list = element.parent();

				tabs.parent().removeClass('active');
				parent.code.find('[data-target]').hide();

				list.addClass('active');
				parent.code.find(neutronADT.i.pcn('.code--list li[data-target="' + element.attr('href') + '"]')).show();
				return false;
			});
		});
	}
}

module.exports = CodeFrame;
