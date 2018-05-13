neutronADT.i.patternsPath = neutronADT.i.assetsPath + 'patterns/';
neutronADT.i.prefix = 'neutron';

/**
 * Add prefix to an usual string. Class or id selectors will also be replaced correctly.
 * Example: neutronADT.i.neutronADT.i.pcn('.button') -> '.neutron-button'
 *
 * @param {String} str
 * @return {String} prefixed str param
 */
neutronADT.i.pcn = str => {
	var prefixed = (neutronADT.i.prefix + '-' + str).replace(/[\.#]/, '');

	if (str[0] === '.' || str[0] === '#') {
		 return str[0] + prefixed;
	}

	return prefixed;
}

neutronADT.i.noPrefix = prefixedString => {
	return prefixedString.replace(neutronADT.i.prefix + '-', '');
}

const Main = require('./components/main');

new Main();
