'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.load_state_action = exports.history_goto_action = exports.history_redirect_action = exports.preload_action = exports.navigated_action = exports.goto_action = exports.redirect_action = exports.LoadState = exports.Preload = exports.Navigated = exports.GoTo = exports.Redirect = undefined;

var _location = require('../location');

var Redirect = exports.Redirect = '@@react-isomorphic-render/redirect';
var GoTo = exports.GoTo = '@@react-isomorphic-render/goto';
var Navigated = exports.Navigated = '@@react-isomorphic-render/navigated';
var Preload = exports.Preload = '@@react-isomorphic-render/preload';
var LoadState = exports.LoadState = '@@react-isomorphic-render/redux/state/replace';

// Before page preloading started
var redirect_action = exports.redirect_action = function redirect_action(location) {
	return preload_action(location, true);
};

// Before page preloading started
var goto_action = exports.goto_action = function goto_action(location) {
	return preload_action(location);
};

// After page preloading finished
var navigated_action = exports.navigated_action = function navigated_action(location) {
	return {
		type: Navigated,
		location: (0, _location.parse_location)(location)
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
var preload_action = exports.preload_action = function preload_action(location, redirect) {
	var navigate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	var initial_client_side_preload = arguments[3];
	var instant_back = arguments[4];
	return {
		type: Preload,
		location: (0, _location.parse_location)(location),
		redirect: redirect,
		navigate: navigate,
		initial: initial_client_side_preload,
		instant_back: instant_back
	};
};

// After page preloading finished
var history_redirect_action = exports.history_redirect_action = function history_redirect_action(location) {
	return {
		type: Redirect,
		location: (0, _location.parse_location)(location)
	};
};

// After page preloading finished
var history_goto_action = exports.history_goto_action = function history_goto_action(location) {
	return {
		type: GoTo,
		location: (0, _location.parse_location)(location)
	};
};

// Replaces Redux state (e.g. for instant "Back" button feature)
var load_state_action = exports.load_state_action = function load_state_action(state) {
	return {
		type: LoadState,
		state: state
	};
};
//# sourceMappingURL=actions.js.map