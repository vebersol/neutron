module.exports = function(Handlebars) {
	var docCache = {};

	return {
		testHelper: function (a, b) {
			return new Handlebars.SafeString('<div>Hello, Im testHelper!</div>')
		},

		contentFor(name, options) {
			var blocks = this._blocks || (this._blocks = {});
			var block  = blocks[name] || (blocks[name] = []);

			block.push(options.fn(this));
		},

		outputFor(name) {
			var blocks  = this._blocks;
			var content = blocks && blocks[name];
			var html = content ? content.join('\n') : '';

			if(content) {
				delete this._blocks[name];
			}

			return new Handlebars.SafeString(html);
		},

		doc(docOrKey, doc) {
			if(doc) {
				docCache[this.patternName] = docOrKey;
				return;
			}
			return docCache[docOrKey];
		},

		resetHelpers() {
			this._blocks = {};
		}
	};
}
