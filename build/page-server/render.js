'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _createMemoryHistory = require('react-router/lib/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

var _normalize = require('../redux/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _timer = require('../timer');

var _timer2 = _interopRequireDefault(_timer);

var _history = require('../history');

var _history2 = _interopRequireDefault(_history);

var _location = require('../location');

var _server3 = require('../redux/server/server');

var _server4 = _interopRequireDefault(_server3);

var _render = require('../react-router/render');

var _actions = require('../redux/actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// isomorphic (universal) rendering (middleware).
// will be used in web_application.use(...)
exports.default = function () {
	var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(settings, _ref2) {
		var initialize = _ref2.initialize,
		    localize = _ref2.localize,
		    assets = _ref2.assets,
		    application = _ref2.application,
		    request = _ref2.request,
		    render = _ref2.render,
		    loading = _ref2.loading,
		    _ref2$html = _ref2.html,
		    html = _ref2$html === undefined ? {} : _ref2$html,
		    cookies = _ref2.cookies,
		    beforeRender = _ref2.beforeRender;

		var _settings, routes, wrapper, authentication, error_handler, render_page, protected_cookie_value, history, get_history, initialize_timer, initialize_result, extension_javascript, afterwards, parameters, normalize_result, location, path, initialize_time, locale, messages, messagesJSON, _result, result, _result2, error_handler_parameters;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						settings = (0, _normalize2.default)(settings);

						_settings = settings, routes = _settings.routes, wrapper = _settings.wrapper, authentication = _settings.authentication;
						error_handler = settings.error;

						// If Redux is being used, then render for Redux.
						// Else render for pure React.

						render_page = _server4.default;

						// Read protected cookie value (if configured)

						protected_cookie_value = void 0;

						if (authentication && authentication.protectedCookie) {
							protected_cookie_value = cookies.get(authentication.protectedCookie);
						}

						// `history` is created after the `store`.
						// At the same time, `store` needs the `history` later during navigation.
						// And `history` might need store for things like `react-router-redux`.
						// Hence the getter instead of a simple variable
						history = void 0;

						get_history = function get_history() {
							return history;
						};

						initialize_timer = (0, _timer2.default)();

						// These `parameters` are used for `assets`, `html` modifiers
						// and also for `localize()` call.

						_context.next = 11;
						return (0, _server3.initialize)(settings, {
							protected_cookie_value: protected_cookie_value,
							application: application,
							request: request,
							cookies: cookies,
							initialize: initialize,
							get_history: get_history
						});

					case 11:
						initialize_result = _context.sent;
						extension_javascript = initialize_result.extension_javascript, afterwards = initialize_result.afterwards, parameters = (0, _objectWithoutProperties3.default)(initialize_result, ['extension_javascript', 'afterwards']);

						normalize_result = function normalize_result(result) {
							return _normalize_result(result, afterwards, settings);
						};

						// Create `history` (`true` indicates server-side usage).
						// Koa `request.url` is not really a URL,
						// it's a URL without the `origin` (scheme, host, port).


						history = (0, _history2.default)(_createMemoryHistory2.default, request.url, settings.history, parameters, true);

						location = history.getCurrentLocation();
						path = location.pathname;

						// The above code (server-side `initialize()` method call) is not included
						// in this `try/catch` block because:
						//
						//  * `parameters` are used inside `.error()`
						//
						//  * even if an error was caught inside `initialize()`
						//    and a redirection was performed, say, to an `/error` page
						//    then it would fail again because `initialize()` would get called again,
						//    so wrapping `initialize()` with `try/catch` wouldn't help anyway.
						//

						_context.prev = 17;
						initialize_time = initialize_timer();

						// Internationalization

						locale = void 0;
						messages = void 0;
						messagesJSON = void 0;

						if (!localize) {
							_context.next = 31;
							break;
						}

						// `localize()` should normally be a synchronous function.
						// It could be asynchronous though for cases when it's taking
						// messages not from a JSON file but rather from an
						// "admin" user editable database.
						// If the rountrip time (ping) from the rendering service
						// to the database is small enough then it theoretically
						// won't introduce any major page rendering latency
						// (the database will surely cache such a hot query).
						// On the other hand, if a developer fights for each millisecond
						// then `localize()` should just return `messages` from memory.

						_result = localize(parameters);

						// If `localize()` returned a `Promise` then wait for it

						if (!(typeof _result.then === 'function')) {
							_context.next = 28;
							break;
						}

						_context.next = 27;
						return _result;

					case 27:
						_result = _context.sent;

					case 28:

						locale = _result.locale;
						messages = _result.messages;

						// A tiny optimization to avoid calculating
						// `JSON.stringify(messages)` for each rendered page:
						// `localize()` can return a cached `messagesJSON` string
						// instead of `messages` JSON object
						// to further reduce internationalization-induced latency
						// by an extra millisecond or so (benchmark if interested)
						// by not stringifying `messages` JSON object for each page rendered.
						messagesJSON = _result.messagesJSON || (0, _stringify2.default)(messages);

					case 31:
						_context.next = 33;
						return render_page((0, _extends3.default)({}, parameters, {
							disable_server_side_rendering: render === false,
							history: history,
							routes: routes,
							before_render: beforeRender,

							create_page_element: function create_page_element(child_element, props) {
								if (localize) {
									props.locale = locale;
									props.messages = messages;
								}

								return _react2.default.createElement(wrapper, props, child_element);
							},

							render_webpage: function render_webpage(content) {
								// Render page content
								content = render === false ? normalize_markup(loading) : content && _server2.default.renderToString(content);

								// `html` modifiers

								var head = html.head;
								// camelCase support for those who prefer it

								var body_start = html.body_start || html.bodyStart;
								var body_end = html.body_end || html.bodyEnd;

								// Normalize `html` parameters
								head = normalize_markup(typeof head === 'function' ? head(path, parameters) : head);
								body_start = normalize_markup(typeof body_start === 'function' ? body_start(path, parameters) : body_start);
								body_end = normalize_markup(typeof body_end === 'function' ? body_end(path, parameters) : body_end);

								// Normalize assets
								assets = typeof assets === 'function' ? assets(path, parameters) : assets;

								// Sanity check
								if (!assets.entries) {
									throw new Error('"assets.entries" array parameter is required as of version 10.1.0. E.g. "{ ... entries: [\'main\'] ... }"');
								}

								// Render the HTML
								return (0, _html2.default)((0, _extends3.default)({}, parameters, {
									extension_javascript: typeof extension_javascript === 'function' ? extension_javascript() : extension_javascript,
									assets: assets,
									locale: locale,
									locale_messages_json: messagesJSON,
									head: head,
									body_start: body_start,
									body_end: body_end,
									protected_cookie_value: protected_cookie_value,
									content: content
								}));
							}
						}));

					case 33:
						result = _context.sent;


						if (result.time) {
							result.time.initialize = initialize_time;
						}

						return _context.abrupt('return', normalize_result(result));

					case 38:
						_context.prev = 38;
						_context.t0 = _context['catch'](17);

						if (!_context.t0._redirect) {
							_context.next = 42;
							break;
						}

						return _context.abrupt('return', normalize_result({ redirect: _context.t0._redirect }));

					case 42:
						if (!error_handler) {
							_context.next = 49;
							break;
						}

						_result2 = {};
						error_handler_parameters = {
							path: path,
							url: (0, _location.location_url)(location),
							redirect: function redirect(to) {
								return _result2.redirect = (0, _location.parse_location)(to);
							},
							server: true

							// Special case for Redux
						};
						if (parameters.store) {
							error_handler_parameters.dispatch = redirecting_dispatch(parameters.store.dispatch, error_handler_parameters.redirect);
							error_handler_parameters.getState = parameters.store.getState;
						}

						error_handler(_context.t0, error_handler_parameters);

						// Either redirects or throws the error

						if (!_result2.redirect) {
							_context.next = 49;
							break;
						}

						return _context.abrupt('return', normalize_result(_result2));

					case 49:
						throw _context.t0;

					case 50:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[17, 38]]);
	}));

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();

// Converts React.Elements to Strings


// https://github.com/ReactTraining/react-router/issues/4023
// Also adds `useBasename` and `useQueries`
// produces wrong line numbers:
// import 'source-map-support/register'

function normalize_markup(anything) {
	if (!anything) {
		return '';
	}

	if (typeof anything === 'function') {
		return anything;
	}

	if (typeof anything === 'string') {
		return anything;
	}

	if (Array.isArray(anything)) {
		return anything.map(normalize_markup).join('');
	}

	return _server2.default.renderToString(anything);
}

// A special flavour of `dispatch` which `throw`s for redirects on the server side.
function redirecting_dispatch(dispatch, redirect) {
	return function (event) {
		switch (event.type) {
			// In case of navigation from @preload()
			case _actions.Preload:
				// `throw`s a special `Error` on server side
				return redirect(event.location);

			default:
				// Proceed with the original
				return dispatch(event);
		}
	};
}

function _normalize_result(result, afterwards, settings) {
	// Stringify `redirect` location
	if (result.redirect) {
		// Prepend `basename` to relative URLs for server-side redirect.
		result.redirect = (0, _location.location_url)(result.redirect, { basename: settings.history.options.basename });
	}

	// Add `afterwards`
	result.afterwards = afterwards;

	return result;
}
//# sourceMappingURL=render.js.map