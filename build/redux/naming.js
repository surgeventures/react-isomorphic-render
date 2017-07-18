'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.underscoredToCamelCase = underscoredToCamelCase;
exports.event_name = event_name;
// Converts `UNDERSCORED_NAMES` to `camelCasedNames`
function underscoredToCamelCase(string) {
	return string.split('_').map(function (word, i) {
		var firstLetter = word.slice(0, 1);
		var rest = word.slice(1);

		if (i === 0) {
			firstLetter = firstLetter.toLowerCase();
		} else {
			firstLetter = firstLetter.toUpperCase();
		}

		return firstLetter + rest.toLowerCase();
	}).join('');
}

// Converts `namespace` and `event` into a namespaced event name
function event_name(namespace, event) {
	if (!namespace) {
		return event;
	}

	return namespace + ': ' + event;
}
//# sourceMappingURL=naming.js.map