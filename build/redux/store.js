'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = create_store;

var _redux = require('redux');

var _asynchronousMiddleware = require('./middleware/asynchronous middleware');

var _asynchronousMiddleware2 = _interopRequireDefault(_asynchronousMiddleware);

var _preloadingMiddleware = require('./middleware/preloading middleware');

var _preloadingMiddleware2 = _interopRequireDefault(_preloadingMiddleware);

var _historyMiddleware = require('./middleware/history middleware');

var _historyMiddleware2 = _interopRequireDefault(_historyMiddleware);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function create_store(settings, data, get_history, http_client, options) {
	var reducer = settings.reducer,
	    routes = settings.routes,
	    redux_middleware = settings.redux_middleware,
	    redux_store_enhancers = settings.redux_store_enhancers,
	    asynchronous_action_event_naming = settings.asynchronous_action_event_naming,
	    preload = settings.preload,
	    http = settings.http;
	var server = options.server,
	    devtools = options.devtools,
	    stats = options.stats,
	    on_navigate = options.on_navigate;

	// Redux middleware

	var middleware = [];

	// User may supply his own Redux middleware
	if (redux_middleware) {
		middleware.push.apply(middleware, (0, _toConsumableArray3.default)(redux_middleware()));
	}

	// Built-in middleware
	middleware.push(
	// Asynchronous middleware (e.g. for HTTP Ajax calls).
	(0, _asynchronousMiddleware2.default)(http_client, asynchronous_action_event_naming, server, http.error, get_history),

	// Makes @preload() decorator work.
	(0, _preloadingMiddleware2.default)(server, settings.error, preload && preload.helpers, routes, get_history, settings.history.options.basename, stats, on_navigate),

	// Performs `redirect` and `goto` actions on `history`
	(0, _historyMiddleware2.default)(get_history));

	// Redux "store enhancers"
	var store_enhancers = [
	// Redux middleware are applied in reverse order
	// (which is counter-intuitive)
	_redux.applyMiddleware.apply(undefined, middleware)];

	// User may supply his own Redux store enhancers
	if (redux_store_enhancers) {
		store_enhancers.push.apply(store_enhancers, (0, _toConsumableArray3.default)(redux_store_enhancers()));
	}

	// Add Redux DevTools (if they're enabled)
	if (process.env.NODE_ENV !== 'production' && !server && devtools) {
		store_enhancers.push(
		// Provides support for DevTools
		window.devToolsExtension ? window.devToolsExtension() : devtools.component.instrument(),
		// Lets you write ?debug_session=<name> in address bar to persist debug sessions
		devtools.persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)));
	}

	// Create Redux store
	var store = _redux.compose.apply(undefined, store_enhancers)(_redux.createStore)(create_reducer(reducer), data);

	// On the client side, add `hotReload()` function to the `store`.
	// (could just add this function to `window` but adding it to the `store` fits more)
	if (!server) {
		// `hot_reload` helper function gives the web application means to hot reload its Redux reducers
		store.hot_reload = function (reducer) {
			return store.replaceReducer(create_reducer(reducer));
		};
		// Add camelCase alias
		store.hotReload = store.hot_reload;
	}

	// Return the Redux store
	return store;
}

function create_reducer(reducers) {
	return replaceable_state((0, _redux.combineReducers)(reducers), _actions.LoadState);
}

function replaceable_state(reducer, event) {
	return function (state, action) {
		switch (action.type) {
			case event:
				return reducer(action.state, action);
			default:
				return reducer(state, action);
		}
	};
}
//# sourceMappingURL=store.js.map