'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = create_history;
exports.get_location = get_location;
exports.server_redirect = server_redirect;

var _location = require('./location');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates `history`
function create_history(createHistory, location, history_settings, parameters, server) {
	var history_options = history_settings.options;

	// Create `history`.
	//
	// https://github.com/ReactTraining/react-router/blob/master/docs/guides/Histories.md#customize-your-history-further
	//
	// `entries` is used in `MemoryHistory` only (i.e. on server side)
	// https://github.com/ReactTraining/history/blob/v3.x/modules/createMemoryHistory.js
	//
	var history = createHistory((0, _extends3.default)({}, history_options, { entries: [location] }));

	// Because History API won't work on the server side for navigation,
	// instrument it with custom redirection handlers.
	if (server) {
		// Instrument `history`
		// (which was earlier passed to `preloading_middleware`)
		history.replace = server_side_redirect(history_options && history_options.basename);
		history.push = history.replace;
	}

	// For custom `history` wrappers, like `syncHistoryWithStore` from `react-router-redux`.
	if (history_settings.wrap) {
		// `parameters` is `{ store }` for Redux use case
		history = history_settings.wrap(history, parameters);
	}

	// Return `history`
	return history;
}

// A hacky way but it should work
// for calling `redirect` from anywhere
// inside `@preload()` function argument.
function server_side_redirect() {
	return function (location) {
		// Sanity check
		if (!location) {
			throw new Error('location parameter is required for redirect() or goto()');
		}

		// Construct a special "Error" used for aborting and redirecting
		server_redirect(location);
	};
}

function get_location(history) {
	// v4
	if (history.location) {
		return history.location;
	}

	// v3
	if (history.getCurrentLocation) {
		return history.getCurrentLocation();
	}

	// v2
	var location = void 0;
	var unlisten = history.listen(function (x) {
		return location = x;
	});
	unlisten();
	return location;
}

// `location` does not include `basename`.
// `basename` will be prepended when this error is caught
// as part of server-side rendering.
function server_redirect(location) {
	// Just in case
	// (though I don't know if it is even possible,
	//  I didn't check <Redirect/> pseudo route case)
	if (location.basename) {
		location = (0, _extends3.default)({}, location, {
			basename: undefined
		});
	}

	var error = new Error('Redirecting to ' + location.pathname + ' (this is not an error)');
	error._redirect = location;
	throw error;
}
//# sourceMappingURL=history.js.map