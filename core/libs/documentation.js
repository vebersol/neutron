var marked = require('marked');
marked.setOptions({
	breaks: true
});

var documentationHandler = function () {
	function getDocs(partial) {
		var regex = /{{!!([\s\S]*?)}}/;
		var match = partial.match(regex);

		if (match instanceof Array && match.length > 1) {
			return marked(match[1]);
		}

		return null
	}

	return {
		getDocs: getDocs
	}
}

module.exports = documentationHandler;