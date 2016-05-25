var htmlEscape = require('html-escape');
var handlebars = require('handlebars');

var markup = function () {};

markup.prototype = {
	addMarkup: function (source, data) {
		var html = [];
		html.push('<ul>');
		html.push('<li data-target="#html"><pre>');
		html.push(htmlEscape(handlebars.compile(source)(data)))
		html.push('</pre></li>');
		html.push('<li data-target="#handlebars"><pre>');
		html.push(htmlEscape(source))
		html.push('</pre></li>');
		html.push('</ul>');

		return html.join('');
	}
}

module.exports = markup;
