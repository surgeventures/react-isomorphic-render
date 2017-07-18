import { parse_location } from '../location';

export var Redirect = '@@react-isomorphic-render/redirect';
export var GoTo = '@@react-isomorphic-render/goto';
export var Navigated = '@@react-isomorphic-render/navigated';
export var Preload = '@@react-isomorphic-render/preload';
export var LoadState = '@@react-isomorphic-render/redux/state/replace';

// Before page preloading started
export var redirect_action = function redirect_action(location) {
	return preload_action(location, true);
};

// Before page preloading started
export var goto_action = function goto_action(location) {
	return preload_action(location);
};

// After page preloading finished
export var navigated_action = function navigated_action(location) {
	return {
		type: Navigated,
		location: parse_location(location)
	};
};

// Starts `location` page preloading.
//
// If `redirect` is `true` then will perform
// `history.replace()` instead of `history.push()`.
//
// If `navigate` is `false` then the actual navigation won't take place.
// This is used for the server side.
//
// If `initial_client_side_preload` is `true`
// then just client-side-only `@preload()`s will be executed.
//
export var preload_action = function preload_action(location, redirect) {
	var navigate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	var initial_client_side_preload = arguments[3];
	var instant_back = arguments[4];
	return {
		type: Preload,
		location: parse_location(location),
		redirect: redirect,
		navigate: navigate,
		initial: initial_client_side_preload,
		instant_back: instant_back
	};
};

// After page preloading finished
export var history_redirect_action = function history_redirect_action(location) {
	return {
		type: Redirect,
		location: parse_location(location)
	};
};

// After page preloading finished
export var history_goto_action = function history_goto_action(location) {
	return {
		type: GoTo,
		location: parse_location(location)
	};
};

// Replaces Redux state (e.g. for instant "Back" button feature)
export var load_state_action = function load_state_action(state) {
	return {
		type: LoadState,
		state: state
	};
};
//# sourceMappingURL=actions.js.map