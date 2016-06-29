var htmlEscape = require('html-escape');
var handlebars = require('handlebars');
var docs = require('./documentation');

var markup = function () {
	var documentationHandler = docs();

	function addMarkup(source, compiled, data, documentation) {
		var documentation = documentationHandler.getDocs(source);
		var html = [];

		html.push('<ul class="neutron-code--list">');

		html.push('<li data-target="#html"><pre><code class="language-html">');
		html.push(htmlEscape(compiled))
		html.push('</code></pre></li>');

		html.push('<li data-target="#handlebars"><pre><code class="language-handlebars">');
		html.push(htmlEscape(source))
		html.push('</code></pre></li>');

		if (documentation) {
			html.push('<li data-target="#documentation"><div class="neutron-code--documentation">');
			html.push(documentation);
			html.push('</div></li>');
		}

		html.push('</ul>');

		return html.join('');
	}

	return {
		addMarkup: addMarkup
	}
}

module.exports = markup;
