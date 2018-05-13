class CodeFrame {
	constructor() {
		this.wrapper = Zepto('#' + neutronADT.i.prefix);
		this.loaded = false;
	}

	load() {
		this.loaded = true;
		this.addCode();
	}

	addCode() {
		if (neutronADT.i.patternName) {
			this.code = this.wrapper.find(neutronADT.i.pcn('.code'));

			Zepto.ajax({
				url: neutronADT.i.patternsPath + neutronADT.i.patternName.replace(/\//g, '-') + '/markups.html',
				success: data => {
					this.code.append(data);

					this.code.find(neutronADT.i.pcn('.code--nav li:first-child')).addClass('active');
					this.code.find(neutronADT.i.pcn('.code--list li[data-target]')).slice(1).hide();

					const codeList = Zepto(neutronADT.i.pcn('.code--list li'));

					if (Prism) {
						Prism.highlightElement(codeList.find('pre code.language-html').get(0));
						Prism.highlightElement(codeList.find('pre code.language-handlebars').get(0));

						const documentationItem = this.code.find(neutronADT.i.pcn('.code--list li[data-target="#documentation"]'));
						const documentationNavItem = this.code.find(neutronADT.i.pcn('.code--nav li a[href="#documentation"]'));
						if (documentationItem.length > 0) {
							const docsCode = codeList.find(neutronADT.i.pcn('.code--documentation code'));
							docsCode.addClass('language-html');
							if (docsCode.length > 0) {
								Prism.highlightElement(docsCode.get(0));
							}
						} else {
							documentationNavItem.parent().remove();
						}
					}

					this.loaderWrapper.remove();

					this.bindTabs();
				},
				beforeSend: () => {
					this.loaderWrapper = Zepto('<div class="neutron-code-loader-wrapper"><div class="neutron-loader"></div></div>');
					this.code.append(this.loaderWrapper);
				}
			});
		}
	}

	bindTabs() {
		const tabs = this.code.find(neutronADT.i.pcn('.code--nav li a'));

		tabs.each((_, el) => {
			Zepto(el).on('click', ev => {
				const element = Zepto(ev.currentTarget);
				const list = element.parent();

				tabs.parent().removeClass('active');
				this.code.find('[data-target]').hide();

				list.addClass('active');
				this.code.find(neutronADT.i.pcn('.code--list li[data-target="' + element.attr('href') + '"]')).show();

				return false;
			});
		});
	}
}

module.exports = CodeFrame;
