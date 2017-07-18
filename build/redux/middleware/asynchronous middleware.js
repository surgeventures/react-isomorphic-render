'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.default = asynchronous_middleware;

var _helpers = require('../../helpers');

var _actions = require('../actions');

var _location = require('../../location');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Asynchronous middleware (e.g. for HTTP Ajax calls).
//
// Takes effect only if the `dispatch`ed action has 
// `promise` function and `events` (or `event`) property.
//
// `dispatch()` call will return a `Promise`.
//
function asynchronous_middleware(http_client, asynchronous_action_event_naming, server, on_error, get_history) {
	return function (_ref) {
		var dispatch = _ref.dispatch,
		    getState = _ref.getState;

		// Can cancel previous actions of the same `type` (if configured).
		// E.g. for an AJAX autocomplete.
		var cancellable_promises = new _map2.default();

		return function (next) {
			return function (action) {
				var promise = action.promise,
				    event = action.event,
				    events = action.events,
				    cancelPrevious = action.cancelPrevious,
				    rest = (0, _objectWithoutProperties3.default)(action, ['promise', 'event', 'events', 'cancelPrevious']);

				// If the dispatched action doesn't have a `promise` function property then do nothing

				if (typeof promise !== 'function') {
					return next(action);
				}

				// Generate the three event names automatically based on a base event name
				if (!events && typeof event === 'string') {
					events = asynchronous_action_event_naming(event);
				}

				// Validate `events` property
				if (!events || events.length !== 3) {
					throw new Error('"events" property must be an array of 3 event names: e.g. [\'pending\', \'success\', \'error\']');
				}

				// event names

				var _events = events,
				    _events2 = (0, _slicedToArray3.default)(_events, 3),
				    Request = _events2[0],
				    Success = _events2[1],
				    Failure = _events2[2];

				// dispatch the `pending` event to the Redux store


				dispatch((0, _extends3.default)({}, rest, { type: Request }));

				// Run the asychronous action (e.g. an HTTP request)
				var promised = promise(http_client);

				// Validate that `promise()` actually returned a `Promise`
				if (!promised || typeof promised.then !== 'function') {
					throw new Error('"promise" function must return a Promise. Got:', promised);
				}

				// Is the action promise cancellable
				var cancellable = !server && cancelPrevious && typeof promised.cancel === 'function';

				// Cancel previous action of the same `type` (if configured).
				// E.g. for an AJAX autocomplete.
				if (cancellable) {
					if (cancellable_promises.has(Request)) {
						cancellable_promises.get(Request).cancel();
					}

					cancellable_promises.set(Request, promised);
				}

				return promised.then(
				// If the Promise resolved
				// (e.g. an HTTP request succeeded)
				function (result) {
					// The default `Promise` implementation has no `.finally()`
					if (cancellable) {
						cancellable_promises.delete(Request);
					}

					// Dispatch the `success` event to the Redux store
					dispatch((0, _extends3.default)({}, rest, {
						result: result,
						type: Success
					}));

					// The Promise returned from `dispatch()` call
					// is resolved with the `promise` resolved value.
					return result;
				},
				// if the Http request failed
				//
				// (Http status !== 20x
				//  or the Http response JSON object has an `error` field)
				function (error) {
					// The default `Promise` implementation has no `.finally()`
					if (cancellable) {
						cancellable_promises.delete(Request);
					}

					// Transform Javascript `Error` instance into a plain JSON object
					// because the meaning of the `error` action is different
					// from what `Error` class is: it should only carry info like
					// `status`, `message` and possible other values (e.g. `code`),
					// without any stack traces, line numbers, etc.
					// I.e. the `error` action should be a plain javascript object,
					// not an instance of an `Error` class, because it's Redux (stateless).

					// `error` is an `Error` instance thrown by `http client.js`.
					// It has `.data` JSON object set to HTTP response data
					// in case of an `application/json` response.
					var error_data = (0, _helpers.is_object)(error.data) ? error.data : {};

					if (!(0, _helpers.exists)(error_data.message)) {
						error_data.message = error.message;
					}

					if (!(0, _helpers.exists)(error_data.status)) {
						error_data.status = error.status;
					}

					// Dispatch the `failure` event to the Redux store
					dispatch((0, _extends3.default)({}, rest, {
						error: error_data,
						type: Failure
					}));

					// The Promise returned from `dispatch()` call
					// is rejected with this error.

					// if (error.data)
					// {
					// 	delete error.data
					// }
					//
					// for (let key of Object.keys(error_data))
					// {
					// 	error[key] = error_data[key]
					// }

					// Only checks `http` calls which are not part of `@preload()`
					// so that they don't get "error handled" twice
					// (doesn't affect anything, just a minor optimization).
					// Also only checks `http` calls on client side
					// because on server side `http` calls can be
					// either part of `@preload` of part of `initialize`
					// which are already "error handled".
					// On the client side though, an `http` call
					// may be performed via some user input,
					// so it needs this separate case "error handler".
					if (!server && on_error && !action.preloading) {
						var location = get_history().getCurrentLocation();

						// Report the error
						// (for example, redirect to a login page
						//  if a JWT "access token" expired)
						on_error(error, {
							path: location.pathname,
							url: (0, _location.location_url)(location),
							// Using `goto` instead of `redirect` here
							// because it's not part of `@preload()`
							// and is therefore part of some kind of an HTTP request
							// triggered by user input (e.g. form submission)
							// which means it is convenient to be able to
							// go "Back" to the page on which the error originated.
							redirect: function redirect(to) {
								return dispatch((0, _actions.goto_action)(to));
							},
							dispatch: dispatch,
							getState: getState,
							server: server
						});
					}

					throw error;
				});
			};
		};
	};
}
//# sourceMappingURL=asynchronous middleware.js.map