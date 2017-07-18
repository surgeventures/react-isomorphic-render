'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = client_side_render;
exports.get_protected_cookie_value = get_protected_cookie_value;
exports.create_history = create_history;
exports.should_instrument_history_pop_state_listeners = should_instrument_history_pop_state_listeners;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _LocationUtils = require('history/lib/LocationUtils');

var _DOMStateStorage = require('history/lib/DOMStateStorage');

var _reactRouter = require('react-router');

var _useBeforeUnload = require('history/lib/useBeforeUnload');

var _useBeforeUnload2 = _interopRequireDefault(_useBeforeUnload);

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Performs client-side rendering
// along with varios stuff like loading localized messages.
//
// This function is intended to be wrapped by another function
// which (in turn) is gonna be called from the project's code on the client-side.
//
function client_side_render(_ref) {
	var history = _ref.history,
	    render = _ref.render,
	    _ref$render_parameter = _ref.render_parameters,
	    render_parameters = _ref$render_parameter === undefined ? {} : _ref$render_parameter,
	    wrapper = _ref.wrapper,
	    translation = _ref.translation;

	var protected_cookie_value = get_protected_cookie_value();
	// Erase the protected cookie value global variable
	// (so that it's less likely to be stolen via an XSS attack)
	delete window._protected_cookie_value;

	// Initialize locale
	var locale = window._locale;
	if (locale) {
		delete window._locale;
	}

	// Localized messages
	var messages = window._locale_messages;
	if (messages) {
		delete window._locale_messages;
	}

	// renders current React page.
	// returns the rendered React page component.
	function render_page() {
		var _this = this;

		// Returns a Promise for React component.
		//
		return render((0, _extends3.default)({}, render_parameters, {
			to: document.getElementById('react'),
			create_page_element: function () {
				var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(element) {
					var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					return _regenerator2.default.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									if (locale) {
										_context.next = 2;
										break;
									}

									return _context.abrupt('return', _react2.default.createElement(wrapper, props, element));

								case 2:
									if (!translation) {
										_context.next = 6;
										break;
									}

									_context.next = 5;
									return translation(locale);

								case 5:
									messages = _context.sent;

								case 6:

									// Load translations and then create page element

									props.locale = locale;
									props.messages = messages;

									// Create React page element
									return _context.abrupt('return', _react2.default.createElement(wrapper, props, element));

								case 9:
								case 'end':
									return _context.stop();
							}
						}
					}, _callee, _this);
				}));

				return function create_page_element(_x) {
					return _ref2.apply(this, arguments);
				};
			}()
		}));
	}

	// Render page (on the client side).
	//
	// Client side code can then rerender the page any time
	// through obtaining the `rerender()` function from the result object.
	//
	return render_page().then(function (result) {
		result.rerender = render_page;
		result.protectedCookie = protected_cookie_value;
		return result;
	});
}

// Reads protected cookie value from a global variable
// and then erases that global variable
function get_protected_cookie_value() {
	return window._protected_cookie_value;
}

// Create `react-router` `history`
function create_history(location, settings, parameters) {
	// Adds `useBasename` and `useQueries`
	return (0, _history2.default)((0, _reactRouter.useRouterHistory)((0, _useBeforeUnload2.default)(_createBrowserHistory2.default)), location, settings, parameters);
}

// When a `popstate` event occurs (e.g. via "Back" browser button)
// it `@preload()`s the page first and only then renders the page.
function should_instrument_history_pop_state_listeners(call_listener) {
	// A list of tracked instrumented `popstate` listeners
	var pop_state_listeners = [];

	// The initial page URL won't have any `event.state` on `popstate`
	// therefore keep it in case the user decides to go "Back" to the very start.
	var initial_location = window.location;

	var addEventListener = window.addEventListener;
	window.addEventListener = function (type, listener, flag) {
		// Modify `popstate` listener so that it's called
		// after the `popstate`d page finishes `@preload()`ing.
		if (type === 'popstate') {
			var original_listener = listener;

			listener = function listener(event) {
				call_listener(original_listener, event, get_history_pop_state_location(event, initial_location));
			};

			pop_state_listeners.push({
				original: original_listener,
				istrumented: listener
			});
		}

		// Proceed normally
		return addEventListener(type, listener, flag);
	};

	var removeEventListener = window.removeEventListener;
	window.removeEventListener = function (type, listener) {
		// Untrack the instrumented `popstate` listener being removed
		// and "uninstrument" the listener (restore the original listener).
		if (type === 'popstate') {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(pop_state_listeners), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var pop_state_listener = _step.value;

					if (pop_state_listener.original === listener) {
						// Restore the original listener
						listener = pop_state_listener.istrumented;

						// Remove the instrumented `popstate` listener from the list
						pop_state_listeners.splice(pop_state_listeners.indexOf(pop_state_listener), 1);
						break;
					}
				}
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
		}

		// Proceed normally
		return removeEventListener.apply(this, arguments);
	};
}

// Get the `location` of the page being `popstate`d
function get_history_pop_state_location(event, initial_location) {
	// `event.state` is empty when the user
	// decides to go "Back" up to the initial page.
	if (event.state) {
		return get_history_state_location(event.state);
	}

	return initial_location;
}

// Gets `location` from a `popstate`d history entry `state`.
// https://github.com/mjackson/history/blob/v3.x/modules/BrowserProtocol.js
function get_history_state_location(history_state) {
	var key = history_state && history_state.key;

	return (0, _LocationUtils.createLocation)({
		pathname: window.location.pathname,
		search: window.location.search,
		hash: window.location.hash,
		state: key ? (0, _DOMStateStorage.readState)(key) : undefined
	}, undefined, key);
}
//# sourceMappingURL=client.js.map