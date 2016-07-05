var patternData = neutronADT,
	PREFIX = 'neutron',
	PATTERNS_PATH = patternData.i.assetsPath + 'patterns/',
	menuBehavior = patternData.i.menuBehavior,
	cssTheme = patternData.i.cssTheme;

/**
 * Add prefix to an usual string. Class or id selectors will also be replaced correctly.
 * Example: pcn('.button') -> '.neutron-button'
 *
 * @param {String} str
 * @return {String} prefixed str param
 */
function pcn(str) {
	var prefixed = (PREFIX + '-' + str).replace(/[\.#]/, '');

	if (str[0] === '.' || str[0] === '#') {
		return str[0] + prefixed;
	}

	return prefixed;
}

new Main();
