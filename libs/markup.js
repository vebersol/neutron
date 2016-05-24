var htmlEscape = require('html-escape');
var handlebars = require('handlebars');

module.exports = {
	addMarkup: function (source, data) {
		var html = [];
		html.push('<ul>');
		html.push('<li><pre>');
		html.push(htmlEscape(handlebars.compile(source)(data)))
		html.push('</pre></li>');
		html.push('<li><pre>');
		html.push(htmlEscape(source))
		html.push('</pre></li>');
		html.push('</ul>');

		return html.join('');
	}
}
