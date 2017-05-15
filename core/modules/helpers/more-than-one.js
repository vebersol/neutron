"use strict";

module.exports = (arr, block) => {
	if (arr && arr.length && arr.length > 1) {
		return block.fn();
	}

	return "";
};
