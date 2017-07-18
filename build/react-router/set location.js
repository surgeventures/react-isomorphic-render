'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.replace_location = replace_location;
exports.push_location = push_location;

var _DOMStateStorage = require('history/lib/DOMStateStorage');

var _Actions = require('history/lib/Actions');

// https://github.com/taion/react-router-scroll/blob/master/src/StateStorage.js
var SCROLL_STATE_KEY_PREFIX = '@@scroll|';

// Replaces the current URL in the browser address bar (and in the history)
function replace_location(location, history) {
	return set_location(location, history, _Actions.REPLACE);
}

// Replaces the current URL in the browser address bar (pushing it to the history)
function push_location(location, history) {
	return set_location(location, history, _Actions.PUSH);
}

// Replaces the current URL in the browser address bar (pushing it to the history)
function set_location(location, history, method) {
	// A little bit of a fight with `scroll-behavior` here
	var key = history.createKey();
	// Save the correct `scroll-behavior`'s scroll position
	// in this new history entry `scroll-behavior` state.
	(0, _DOMStateStorage.saveState)('' + SCROLL_STATE_KEY_PREFIX + key, get_scroll());
	// Set the new `location` `key`
	location = history.createLocation(location, method, key);
	// Prevent `scroll-behavior` from messing
	// with scroll on this location transition
	location.scroll = false;
	// Prevent `react-router` from remounting page component
	location.remount = false;
	// Transition to the new location
	history.transitionTo(location);
}

// Gets window scroll position
function get_scroll() {
	// Works in IE 10+
	return [window.pageXOffset, window.pageYOffset];
}

// // https://github.com/mjackson/history/blob/v3.x/modules/createHistory.js
// function createKey()
// {
// 	return Math.random().toString(36).substr(2, 6)
// }
//# sourceMappingURL=set location.js.map