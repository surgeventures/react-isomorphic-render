import { readState, saveState } from 'history/lib/DOMStateStorage';

var STATE_KEY_PREFIX = '@@react-isomorphic-render/';

export function get_from_history(prefix, key) {
	return readState(compute_key(prefix, key));
}

export function store_in_history(prefix, key, data) {
	return saveState(compute_key(prefix, key), data);
}

export function compute_key(prefix, key) {
	return '' + STATE_KEY_PREFIX + prefix + '|' + key;
}
//# sourceMappingURL=history store.js.map