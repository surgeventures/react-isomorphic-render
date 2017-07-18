'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Preload_failed = exports.Preload_finished = exports.Preload_started = exports.Preload_options_name = exports.Preload_method_name = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = preloading_middleware;

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _getRouteParams = require('react-router/lib/getRouteParams');

var _getRouteParams2 = _interopRequireDefault(_getRouteParams);

var _location = require('../../location');

var _history = require('../../history');

var _actions = require('../actions');

var _match = require('../../react-router/match');

var _match2 = _interopRequireDefault(_match);

var _getRoutePath = require('../../react-router/get route path');

var _getRoutePath2 = _interopRequireDefault(_getRoutePath);

var _instantBack = require('../client/instant back');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Makes @preload() decorator work.
// (preloads data required for displaying a page before actually navigating to it)

var Preload_method_name = exports.Preload_method_name = '__preload__';
var Preload_options_name = exports.Preload_options_name = '__preload_options__';

var Preload_started = exports.Preload_started = '@@react-isomorphic-render/redux/preload started';
var Preload_finished = exports.Preload_finished = '@@react-isomorphic-render/redux/preload finished';
var Preload_failed = exports.Preload_failed = '@@react-isomorphic-render/redux/preload failed';

function preloading_middleware(server, error_handler, preload_helpers, routes, get_history, basename, report_stats, on_navigate) {
	return function (_ref) {
		var getState = _ref.getState,
		    dispatch = _ref.dispatch;
		return function (next) {
			return function (action) {
				// Handle only `Preload` actions
				if (action.type !== _actions.Preload) {
					// Do nothing
					return next(action);
				}

				// If `dispatch(redirect(...))` is called, for example,
				// then the location doesn't contain `basename`,
				// so set `basename` here.
				// And, say, when a `<Link to="..."/>` is clicked
				// then `basename` is not set too, so setting it here too.
				action.location = (0, _location.strip_basename)(action.location, basename);

				// `previous_location` is the location before the transition.
				// Is used for `instantBack`.
				var previous_location = get_history().getCurrentLocation();

				// This idea was discarded because state JSON could be very large.
				// // If navigation to a new page is taking place
				// // then store the current Redux state in history.
				// if (!server && action.navigate)
				// {
				// 	store_in_history('redux/state', get_history().getCurrentLocation().key, getState())
				// }

				// A special flavour of `dispatch` which `throw`s for redirects on the server side.
				dispatch = preloading_middleware_dispatch(dispatch, server);

				// Navigation event triggered
				if (on_navigate && !action.initial) {
					on_navigate((0, _location.location_url)(action.location), action.location);
				}

				// Preload status object.
				// `preloading` holds the cancellation flag for this navigation process.
				// (e.g. preloading `Promise` chain could be cancelled in case of a redirect)
				var preloading = {};

				// Can cancel previous preloading (on the client side)
				var previous_preloading = void 0;
				if (!server) {
					previous_preloading = window.__preloading_page;
					window.__preloading_page = preloading;
				}

				function report_preload_stats(time, route) {
					// preloading.time = time

					// This preloading time will be longer then
					// the server-side one, say, by 10 milliseconds, 
					// probably because the web browser making
					// an asynchronous HTTP request is slower
					// than the Node.js server making a regular HTTP request.
					// Also this includes network latency
					// for a particular website user, etc.
					// So this `preload` time doesn't actually describe
					// the server-side performance.
					if (report_stats) {
						report_stats({
							url: (0, _location.location_url)(action.location),
							route: route,
							time: {
								preload: time
							}
						});
					}
				}

				return (0, _match2.default)({
					routes: typeof routes === 'function' ? routes({ dispatch: dispatch, getState: getState }) : routes,
					history: get_history(),
					location: action.location
				}).then(function (_ref2) {
					var redirect = _ref2.redirect,
					    router_state = _ref2.router_state;

					// In case of a `react-router` `<Redirect/>`
					if (redirect) {
						// Shouldn't happen on the server-side in the current setup,
						// but just in case.
						if (server) {
							(0, _history.server_redirect)(redirect);
						}

						// Perform client side redirect
						// (with target page preloading)
						dispatch((0, _actions.redirect_action)(redirect));
						// Explicitly return `undefined`
						// (not `false` by accident)
						return;
					}

					// Measures time taken (on the client side)
					var started_at = void 0;

					if (!server) {
						// Measures time taken (on the client side)
						started_at = Date.now();

						// If on the client side, then store the current pending navigation,
						// so that it can be cancelled when a new navigation process takes place
						// before the current navigation process finishes.

						// If there's preceeding navigation pending,
						// then cancel that previous navigation.
						if (previous_preloading && previous_preloading.pending && !previous_preloading.cancelled) {
							previous_preloading.cancel();
							// Page loading indicator could listen for this event
							dispatch({ type: Preload_finished });
						}
					}

					// Concatenated `react-router` route string.
					// E.g. "/user/:user_id/post/:post_id"
					var route = (0, _getRoutePath2.default)(router_state);

					// `react-router` matched route "state"
					var routes = router_state.routes,
					    components = router_state.components,
					    location = router_state.location,
					    params = router_state.params;

					// Preload all the required data for this route (page)

					var preload = preloader(action.initial, server, routes, components, getState, preloader_dispatch(dispatch, preloading), get_history(), location, params, preload_helpers, preloading);

					// If nothing to preload, just move to the next middleware
					if (!preload) {
						// Trigger `react-router` navigation on client side
						// (and do nothing on server side)
						proceed_with_navigation(dispatch, action, server, get_history, previous_location);
						// Explicitly return `undefined`
						// (not `false` by accident)
						return;
					}

					// Page loading indicator could listen for this event
					dispatch({ type: Preload_started });

					// Preload the new page.
					// (the Promise returned is only used in server-side rendering,
					//  client-side rendering never uses this Promise)
					var promise = preload();

					preloading.pending = true;

					// Preloading process cancellation
					preloading.cancel = function () {
						preloading.cancelled = true;

						// If `bluebird` is used,
						// and promise cancellation has been set up,
						// then cancel the `Promise`.
						// http://bluebirdjs.com/docs/api/cancellation.html
						if (promise.cancel) {
							// `.catch()` is to suppress "Uncaught promise rejection" errors
							promise.catch(function () {
								return {};
							}).cancel();
						}
					};

					return promise
					// Navigate to the new page
					.then(function () {
						preloading.pending = false;

						// If this navigation process was cancelled
						// before @preload() finished its work,
						// then don't take any further steps on this cancelled navigation.
						if (preloading.cancelled) {
							// Return `false` out of the `Promise`
							// indicating that the navigation was cancelled.
							return false;
						}

						// Page loading indicator could listen for this event
						dispatch({ type: Preload_finished });

						// Report preloading time
						report_preload_stats(Date.now() - started_at, route);

						// Trigger `react-router` navigation on client side
						// (and do nothing on server side)
						proceed_with_navigation(dispatch, action, server, get_history, previous_location);
					}, function (error) {
						// If this navigation process was cancelled
						// before @preload() finished its work,
						// then don't take any further steps on this cancelled navigation.
						if (!preloading.cancelled) {
							if (!server) {
								preloading.error = error;
							}

							// Page loading indicator could listen for this event
							dispatch({ type: Preload_failed, error: error });
						}

						throw error;
					});
				}).catch(function (error) {
					// Update preload status object
					preloading.pending = false;
					// preloading.error = error

					// If the error was a redirection exception (not a error),
					// then just exit and do nothing.
					// (happens only on server side)
					if (server && error._redirect) {
						// No need to emit `Preload_finished`
						// since the current page is simply discarded.
						throw error;
					}

					// Possibly handle the error (for example, redirect to an error page)
					error_handler(error, {
						path: action.location.pathname,
						url: (0, _location.location_url)(action.location),
						// Using `redirect_action` instead of `goto_action` here
						// so that the user can't go "Back" to the page being preloaded
						// in case of an error because it would be in inconsistent state
						// due to `@preload()` being interrupted.
						redirect: function redirect(to) {
							return dispatch((0, _actions.redirect_action)(to));
						},
						dispatch: dispatch,
						getState: getState,
						server: server
					});

					// If redirect happened on the server side
					// then a special redirection error was thrown.
					// Otherwise just rethrow the error
					// (always the case on the client side).
					//
					// This error will be handled in `web server` `catch` clause
					// if this code is being run on the server side.
					// On the client side it just outputs errors to console.
					//
					throw error;
				});
			};
		};
	};
}

// Trigger `react-router` navigation on client side
// (and do nothing on server side).
// `previous_location` is the location before the transition.
function proceed_with_navigation(dispatch, action, server, get_history, previous_location) {
	if (server) {
		return;
	}

	if (action.navigate) {
		if (action.redirect) {
			dispatch((0, _actions.history_redirect_action)(action.location));
		} else {
			dispatch((0, _actions.history_goto_action)(action.location));
		}
	}

	if (action.instant_back) {
		(0, _instantBack.add_instant_back)(get_history().getCurrentLocation(), previous_location);
	}
	// Deactivate "instant back" for the current page
	// if this new transition is not "instant back" too.
	// Only "instant back" chain navigation preserves
	// the ability to instantly navigate "Back".
	else {
			(0, _instantBack.reset_instant_back)();
		}
}

// Returns function returning a Promise 
// which resolves when all the required preload()s are resolved.
//
// If no preloading is needed, then returns nothing.
//
var preloader = function preloader(initial_client_side_preload, server, routes, components, getState, dispatch, history, location, parameters, preload_helpers, preloading) {
	var preload_arguments = { dispatch: dispatch, getState: getState, history: history, location: location, parameters: parameters };

	if (preload_helpers) {
		preload_arguments = (0, _extends3.default)({}, preload_arguments, preload_helpers);
	}

	// A minor optimization for skipping `@preload()`s
	// for those parent `<Route/>`s which haven't changed
	// as a result of a client-side navigation.
	//
	// On the client side:
	//
	// Take the previous route components
	// (along with their parameters) 
	// and the next route components
	// (along with their parameters),
	// and compare them side-by-side
	// filtering out the same top level components
	// (both having the same component classes
	//  and having the same parameters).
	//
	// Therefore @preload() methods could be skipped
	// for those top level components which remain
	// the same (and in the same state).
	// This would be an optimization.
	//
	// (e.g. the main <Route/> could be @preload()ed only once - on the server side)
	//
	// At the same time, at least one component should be preloaded:
	// even if navigating to the same page it still kinda makes sense to reload it.
	// (assuming it's not an "anchor" hyperlink navigation)
	//
	// Parameters for each `<Route/>` component can be found using this helper method:
	// https://github.com/ReactTraining/react-router/blob/master/modules/getRouteParams.js
	//
	// Also, GET query parameters would also need to be compared, I guess.
	// But, I guess, it would make sense to assume that GET parameters
	// only affect the last <Route/> component in the chain.
	// And, in general, GET query parameters should be avoided,
	// but that's not the case for example with search forms.
	// So here we assume that GET query parameters only
	// influence the last <Route/> component in the chain
	// which is gonna be reloaded anyway.
	//
	if (!server) {
		if (window._previous_routes) {
			var previous_routes = window._previous_routes;
			var previous_parameters = window._previous_route_parameters;

			var i = 0;
			while (i < routes.length - 1 && previous_routes[i].component === routes[i].component && (0, _deepEqual2.default)((0, _getRouteParams2.default)(previous_routes[i], previous_parameters), (0, _getRouteParams2.default)(routes[i], parameters))) {
				i++;
			}

			components = components.slice(i);
		}

		window._previous_routes = routes;
		window._previous_route_parameters = parameters;
	}

	// finds all `preload` (or `preload_deferred`) methods 
	// (they will be executed in parallel)
	function get_preloaders() {
		// find all `preload` methods on the React-Router component chain
		return components.filter(function (component) {
			return component && component[Preload_method_name];
		}).map(function (component) {
			return {
				preload: function preload() {
					try {
						// `preload()` returns a Promise
						var promise = component[Preload_method_name](preload_arguments);

						// Convert `array`s into `Promise.all(array)`
						if (Array.isArray(promise)) {
							promise = _promise2.default.all(promise);
						}

						// Sanity check
						if (!promise || typeof promise.then !== 'function') {
							return _promise2.default.reject('Preload function must return a Promise. Got:', promise);
						}

						return promise;
					} catch (error) {
						return _promise2.default.reject(error);
					}
				},
				options: component[Preload_options_name] || {}
			};
		});
	}

	// Get all `preload` methods on the React-Router component chain
	var preloads = get_preloaders();

	// Construct `preload` chain

	var chain = [];
	var parallel = [];

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(get_preloaders()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _preloader = _step.value;

			// Don't execute client-side-only `@preload()`s on server side
			if (_preloader.options.client && server) {
				continue;
			}

			// If it's initial client side preload (after the page has been loaded),
			// then only execute those `@preload()`s marked as "client-side-only".
			if (initial_client_side_preload && !_preloader.options.client) {
				continue;
			}

			if (_preloader.options.blocking === false) {
				parallel.push(_preloader.preload);
				continue;
			}

			// Copy-pasta
			if (parallel.length > 0) {
				parallel.push(_preloader.preload);
				chain.push(parallel);
				parallel = [];
			} else {
				chain.push(_preloader.preload);
			}
		}

		// Finalize trailing parallel `preload`s
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	if (parallel.length > 0) {
		chain.push(parallel.length > 1 ? parallel : parallel[0]);
	}

	// Convert `preload` chain into `Promise` chain

	if (chain.length === 0) {
		return;
	}

	return function () {
		return chain.reduce(function (promise, link) {
			if (Array.isArray(link)) {
				return promise.then(function () {
					if (preloading.cancelled) {
						return;
					}

					return _promise2.default.all(link.map(function (thread) {
						return thread();
					}));
				});
			}

			return promise.then(function () {
				if (preloading.cancelled) {
					return;
				}

				return link();
			});
		}, _promise2.default.resolve());
	};
};

// A special flavour of `dispatch` which `throw`s for redirects on the server side.
function preloading_middleware_dispatch(dispatch, server) {
	return function (event) {
		switch (event.type) {
			// In case of navigation from @preload()
			case _actions.Preload:
				// `throw`s a special `Error` on server side
				if (server) {
					(0, _history.server_redirect)(event.location);
				}
		}

		// Proceed with the original
		return dispatch(event);
	};
}

// A special flavour of `dispatch` for `@preload()` arguments.
// It detects redirection or navigation and cancels the current preload.
function preloader_dispatch(dispatch, preloading) {
	return function (event) {
		switch (event.type) {
			// In case of navigation from @preload()
			case _actions.Preload:
				// Discard the currently ongoing preloading
				preloading.cancel();
				// Page loading indicator could listen for this event
				dispatch({ type: Preload_finished });
		}

		// Mark `http` calls so that they don't get "error handled" twice
		// (doesn't affect anything, just a minor optimization)
		if (typeof event.promise === 'function') {
			event.preloading = true;
		}

		// Proceed with the original
		return dispatch(event);
	};
}
//# sourceMappingURL=preloading middleware.js.map