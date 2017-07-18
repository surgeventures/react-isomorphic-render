'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.get_from_history = get_from_history;
exports.store_in_history = store_in_history;
exports.compute_key = compute_key;

var _DOMStateStorage = require('history/lib/DOMStateStorage');

var STATE_KEY_PREFIX = '@@react-isomorphic-render/';

function get_from_history(prefix, key) {
	return (0, _DOMStateStorage.readState)(compute_key(prefix, key));
}

function store_in_history(prefix, key, data) {
	return (0, _DOMStateStorage.saveState)(compute_key(prefix, key), data);
}

function compute_key(prefix, key) {
	return '' + STATE_KEY_PREFIX + prefix + '|' + key;
}
//# sourceMappingURL=history store.js.map