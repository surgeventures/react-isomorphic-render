'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = set_up_and_render;
exports.getState = getState;
exports.getHttpClient = getHttpClient;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _client = require('../../client');

var _client2 = _interopRequireDefault(_client);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

var _httpClient = require('../http client');

var _httpClient2 = _interopRequireDefault(_httpClient);

var _normalize = require('../normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _store = require('../store');

var _store2 = _interopRequireDefault(_store);

var _actions = require('../actions');

var _instantBack = require('./instant back');

var _location = require('../../location');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This function is what's gonna be called from the project's code on the client-side.

// import { load_state_action } from '../actions'
function set_up_and_render(settings) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	settings = (0, _normalize2.default)(settings);

	var devtools = options.devtools,
	    translation = options.translation,
	    stats = options.stats;

	// camelCase aliasing

	var on_navigate = options.on_navigate || options.onNavigate;

	// Redux store (is used in history `popstate` listener)
	var store = void 0;

	// Create HTTP client (Redux action creator `http` utility)
	var http_client = (0, _httpClient2.default)(settings, function () {
		return store;
	}, (0, _client.get_protected_cookie_value)());
	// E.g. for WebSocket message handlers, since they only run on the client side.
	window._react_isomorphic_render_http_client = http_client;

	// Reset "instant back" on page reload
	// since Redux state is cleared.
	(0, _instantBack.reset_instant_back)();

	// Will intercept `popstate` DOM event to preload pages before showing them.
	// This hook is placed before `history` is initialized because it taps on `popstate`.
	(0, _client.should_instrument_history_pop_state_listeners)(function (listener, event, location) {
		// This idea was discarded because state JSON could be very large.
		// // Store the current Redux state in history
		// // before performing the "Back"/"Forward" navigation.
		// store_in_history('redux/state', get_current_location().key, store.getState())
		//
		// const redux_state = get_from_history('redux/state', event.state.key)
		//
		// if (redux_state)
		// {
		// 	// Won't preload the page again but will instead use
		// 	// the Redux state that was relevant at the time
		// 	// the page was navigated from.
		// 	store.dispatch(load_state_action(redux_state))
		//
		// 	// Navigate to the page
		// 	listener(event)
		// 	return
		// }

		// "from location" means before the `popstate` transition.
		var from_location = get_current_location();
		var to_location = { key: event.state ? event.state.key : undefined

			// If it's an instant "Back"/"Forward" navigation
		};if ((0, _instantBack.is_instant_transition)(from_location, to_location)) {
			// Navigate to the page without preloading it
			// (has been previously preloaded and is in Redux state)
			return listener(event);
		}

		// Preload the page but don't navigate to it just yet
		store.dispatch((0, _actions.preload_action)(location, undefined, false)).then(function (result) {
			// Navigate to the page
			listener(event);
		}, function (error) {
			// Log the error
			console.error(error);
		});
	});

	// `history` is created after the `store`.
	// At the same time, `store` needs the `history` later during navigation.
	// And `history` might need store for things like `react-router-redux`.
	// Hence the getter instead of a simple variable
	var history = void 0;
	var get_history = function get_history() {
		return history;
	};

	// Create Redux store
	store = (0, _store2.default)(settings, getState(true), get_history, http_client, {
		devtools: devtools,
		stats: stats,
		on_navigate: on_navigate
	});

	// For example, client-side-only applications
	// may capture this `store` as `window.store`
	// to call `bindActionCreators()` for all actions (globally).
	//
	// onStoreCreated: store => window.store = store
	//
	// import { bindActionCreators } from 'redux'
	// import actionCreators from './actions'
	// const boundActionCreators = bindActionCreators(actionCreators, window.store.dispatch)
	// export default boundActionCreators
	//
	if (options.onStoreCreated) {
		options.onStoreCreated(store);
	}

	// Create `react-router` `history`
	history = (0, _client.create_history)(document.location, settings.history, { store: store });

	// When `popstate` event listener is fired,
	// `history.getCurrentLocation()` is already
	// the `pop`ped one (for some unknown reason),
	// therefore the "previous location" could be obtained
	// using this listener.

	var current_location = history.getCurrentLocation();
	var get_current_location = function get_current_location() {
		return current_location;
	};

	history.listen(function (location) {
		current_location = location;
	});

	// Call `onNavigate` on initial page load
	if (on_navigate) {
		on_navigate((0, _location.location_url)(current_location), current_location);
	}

	// Render the page
	return (0, _client2.default)({
		translation: translation,
		wrapper: settings.wrapper,
		render: _render2.default,
		render_parameters: {
			history: history,
			routes: settings.routes,
			store: store,
			devtools: devtools
		}
	}).then(function (result) {
		// Execute all client-side-only `@preload()`s.
		return store.dispatch((0, _actions.preload_action)(current_location, undefined, false, true)).then(function () {
			return result;
		});
	});
}

// Gets Redux store state before "rehydration".
// In case someone needs to somehow modify
// Redux state before client-side render.
// (because the variable could be potentially renamed in future)
function getState(erase) {
	var state = window._redux_state;

	if (erase) {
		delete window._redux_state;
	}

	return state;
}

// Returns `http` utility on the client side.
// Can be used in WebSocket message handlers,
// since they only run on the client side.
function getHttpClient() {
	return window._react_isomorphic_render_http_client;
}
//# sourceMappingURL=client.js.map