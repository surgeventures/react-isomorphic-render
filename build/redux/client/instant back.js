'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.add_instant_back = add_instant_back;
exports.is_instant_transition = is_instant_transition;
exports.reset_instant_back = reset_instant_back;

var _historyStore = require('./history store');

function add_instant_back(next_location, previous_location) {
	var instant_back = (0, _historyStore.get_from_history)('instant-back', '');

	if (instant_back) {
		var previous_location_index = instant_back.indexOf(get_location_key(previous_location));

		if (previous_location_index < 0) {
			console.error('[react-isomorphic-render] Error: previous location not found in an already existing instant back navigation chain', get_location_key(previous_location), instant_back);
			return reset_instant_back();
		}

		instant_back = instant_back.slice(0, previous_location_index + 1);
	} else {
		instant_back = [get_location_key(previous_location)];
	}

	instant_back.push(get_location_key(next_location));

	(0, _historyStore.store_in_history)('instant-back', '', instant_back);
}

function is_instant_transition(from_location, to_location) {
	var instant_back = (0, _historyStore.get_from_history)('instant-back', '') || [];

	return instant_back.indexOf(get_location_key(from_location)) >= 0 && instant_back.indexOf(get_location_key(to_location)) >= 0;
}

function reset_instant_back() {
	(0, _historyStore.store_in_history)('instant-back', '', undefined);
}

// The initial `location` (page) has no `key`
function get_location_key(location) {
	return location.key ? location.key : 'initial';
}
//# sourceMappingURL=instant back.js.map