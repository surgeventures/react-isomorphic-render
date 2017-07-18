import _regeneratorRuntime from 'babel-runtime/regenerator';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _extends from 'babel-runtime/helpers/extends';
import UglifyJS from 'uglify-js';

import { ISO_date_regexp } from '../../date parser';
import { safe_json_stringify } from '../../page-server/html';
import render from './render';
import create_store from '../store';
import create_http_client from '../http client';

export default function _render(options) {
	return render(_extends({}, options, {
		routes: typeof options.routes === 'function' ? options.routes(store) : options.routes
	}));
}

export var initialize = function () {
	var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(settings, _ref2) {
		var protected_cookie_value = _ref2.protected_cookie_value,
		    application = _ref2.application,
		    request = _ref2.request,
		    cookies = _ref2.cookies,
		    initialize = _ref2.initialize,
		    get_history = _ref2.get_history;
		var store, http_client, store_data, extension_javascript, afterwards;
		return _regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						afterwards = function afterwards(ctx) {
							var _iteratorNormalCompletion = true;
							var _didIteratorError = false;
							var _iteratorError = undefined;

							try {
								for (var _iterator = _getIterator(http_client.set_cookies), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									var cookie = _step.value;

									ctx.set('Set-Cookie', cookie);
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
						};

						extension_javascript = function extension_javascript() {
							var extension_javascript = '';

							// JSON Date deserializer
							if (settings.parse_dates) {
								extension_javascript += '<script>' + define_json_date_parser + '</script>';
							}

							var store_state = store.getState();
							// Remove `redux-router` data from store
							delete store_state.router;

							// Store data will be reloaded into the store on the client-side.
							// All forward slashes are escaped to prevent XSS attacks.
							// Another solution would be replacing with `\uxxxx` sequences.
							// https://medium.com/node-security/the-most-common-xss-vulnerability-in-react-js-applications-2bdffbcc1fa0
							extension_javascript += '<script>';
							extension_javascript += 'window._redux_state = JSON.parse(' + _JSON$stringify(safe_json_stringify(store_state)) + (settings.parse_dates ? ', JSON.date_parser' : '') + ')';
							extension_javascript += '</script>';

							return extension_javascript;
						};

						// Redux store
						store = void 0;

						// Create HTTP client (Redux action creator `http` utility)

						http_client = create_http_client(settings, function () {
							return store;
						}, protected_cookie_value, {
							host: application ? application.host : undefined,
							port: application ? application.port : undefined,
							secure: application ? application.secure : false,
							clone_request: request,
							cookies: cookies
						});

						// Create Redux store

						// Initial store data

						store_data = {};

						// Supports custom preloading before the page is rendered
						// (for example to authenticate the user and retrieve user selected language)

						if (!initialize) {
							_context.next = 9;
							break;
						}

						_context.next = 8;
						return initialize(http_client, { request: request });

					case 8:
						store_data = _context.sent;

					case 9:

						// Create Redux store
						store = create_store(settings, store_data, get_history, http_client, {
							server: true
						});

						return _context.abrupt('return', { store: store, extension_javascript: extension_javascript, afterwards: afterwards });

					case 11:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function initialize(_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();

// JSON date deserializer
// use as the second, 'reviver' argument to JSON.parse(json, JSON.date_parser);
//
// http://stackoverflow.com/questions/14488745/javascript-json-date-deserialization/23691273#23691273
//
var define_json_date_parser = UglifyJS.minify('\nif (!JSON.date_parser)\n{\n\tJSON.date_parser = function(key, value)\n\t{\n\t\tif (typeof value === \'string\' && /^' + ISO_date_regexp + '$/.test(value))\n\t\t{\n\t\t\treturn new Date(value)\n\t\t}\n\n\t\treturn value\n\t}\n}\n', { fromString: true }).code;

// Just to be extra safe from XSS attacks
if (define_json_date_parser.indexOf('</') !== -1) {
	throw new Error('JSON Date parser XSS vulnerability detected');
}
//# sourceMappingURL=server.js.map