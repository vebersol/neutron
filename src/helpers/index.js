module.exports = function(handlebars) {
	return {
		testHelper(a, b) {
			return new handlebars.SafeString('<div>Hello, Im testHelper!</div>');
		}
	};
};
