"use strict";

module.exports = (n, block) => {
	let content = "";

	for (let i = 0; i < n; ++i) {
		content += block.fn(i);
	}

	return content;
};
