module.exports = function(handlebars) {
	return {
		index: function (a, b) {
			return new handlebars.SafeString('<div>Hello! Im a helper fn!</div>')
		}
	};
}
