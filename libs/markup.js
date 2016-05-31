var htmlEscape = require('html-escape');
var handlebars = require('handlebars');

var markup = function () {
	function addMarkup(source, data) {
		var html = [];
		html.push('<ul class="democritus-code--list">');
		html.push('<li data-target="#html"><pre><code class="language-html">');
		html.push(htmlEscape(handlebars.compile(source)(data)))
		html.push('</code></pre></li>');
		html.push('<li data-target="#handlebars"><pre><code class="language-handlebars">');
		html.push(htmlEscape(source))
		html.push('</code></pre></li>');
		html.push('</ul>');

		return html.join('');
	}

	return {
		addMarkup: addMarkup
	}
}

module.exports = markup;
