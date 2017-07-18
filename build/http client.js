'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _helpers = require('./helpers');

var _dateParser = require('./date parser');

var _dateParser2 = _interopRequireDefault(_dateParser);

var _cookies = require('./cookies');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is an isomorphic (universal) HTTP client
// which works both on Node.js and in the web browser,
// and therefore can be used in Redux actions (for HTTP requests)
var http_client = function () {

	// Constructs a new instance of Http client.
	// Optionally takes an Http Request as a reference to mimic
	// (in this case, cookies, to make authentication work on the server-side).
	function http_client() {
		var _this = this;

		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		(0, _classCallCheck3.default)(this, http_client);
		this.set_cookies = new _set2.default();
		var secure = options.secure,
		    host = options.host,
		    port = options.port,
		    headers = options.headers,
		    clone_request = options.clone_request,
		    cookies = options.cookies,
		    protected_cookie = options.protected_cookie,
		    protected_cookie_value = options.protected_cookie_value,
		    authentication_token_header = options.authentication_token_header,
		    on_before_send = options.on_before_send,
		    catch_to_retry = options.catch_to_retry,
		    get_access_token = options.get_access_token;


		var parse_json_dates = options.parse_dates !== false;

		// The default `format_url` gives protection against XSS attacks
		// in a way that `Authorization: Bearer {token}` HTTP header
		// is only exposed (sent) to local URLs, therefore an attacker
		// theoretically won't be able to hijack that authentication token.
		//
		// An XSS attacker is assumed to be unable to set his own
		// `options.format_url` because the rendered page content
		// is placed before the `options` are even defined (inside webpack bundle).
		//
		// Once `http_client` instance is created, the `protected_cookie_value` variable
		// is erased from everywhere except the closures of HTTP methods defined below,
		// and the protected cookie value is therefore unable to be read directly by an attacker.
		//
		// The `format_url` function also resided in the closures of HTTP methods defined below,
		// so it's also unable to be changed by an attacker.
		//
		// The only thing an attacker is left to do is to send malicious requests
		// to the server on behalf of the user, and those requests would be executed,
		// but the attacker won't be able to hijack the protected cookie value.
		//
		var format_url = options.format_url || this.format_url.bind(this);

		// Clone HTTP request cookies on the server-side
		// (to make authentication work)
		if (clone_request) {
			this.server = true;
			this.cookies_raw = clone_request.headers.cookie;
		}

		this.host = host;
		this.port = port || 80;
		this.secure = secure;

		var http_methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

		// "Get cookie value by name" helper (works both on client and server)
		var getCookie = this.server ? function (name) {
			// If this cookie was set dynamically then return it
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(_this.set_cookies), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var cookie_raw = _step.value;

					if (cookie_raw.indexOf(name + '=') === 0) {
						var key_value = cookie_raw_key_value(cookie_raw).split('=');
						return key_value[1];
					}
				}

				// Return the original request cookie
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

			return cookies.get(name);
		} : function (name) {
			// "httpOnly" cookies can't be read by a web browser
			if (name === protected_cookie) {
				return protected_cookie_value;
			}

			// A regular cookie which can be read by a web browser
			return (0, _cookies.get_cookie_in_a_browser)(name);
		};

		// `superagent` doesn't save cookies by default on the server side.
		// Therefore calling `.agent()` explicitly to enable setting cookies.
		var agent = this.server ? _superagent2.default.agent() : _superagent2.default;

		// Define HTTP methods on this `http` utility instance
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			var _loop = function _loop() {
				var method = _step2.value;

				_this[method] = function (path, data) {
					var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

					// `url` will be absolute for server-side
					var url = format_url(path, _this.server);

					// Is incremented on each retry
					var retry_count = -1;

					// Performs an HTTP request to the given `url`.
					// Can retry itself.
					var perform_http_request = function perform_http_request() {
						// Create Http request
						var request = new Http_request(method, url, data, {
							agent: agent,
							parse_json_dates: parse_json_dates,
							headers: (0, _extends3.default)({}, headers, options.headers),
							new_cookies: function new_cookies(_new_cookies) {
								if (_this.server) {
									// Cookies will be duplicated here
									// because `superagent.agent()` persists
									// `Set-Cookie`s between subsequent requests
									// (i.e. for the same `http_client` instance).
									// Therefore using a `Set` instead of an array.
									var _iteratorNormalCompletion3 = true;
									var _didIteratorError3 = false;
									var _iteratorError3 = undefined;

									try {
										for (var _iterator3 = (0, _getIterator3.default)(_new_cookies), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
											var cookie = _step3.value;

											_this.set_cookies.add(cookie);
										}
									} catch (err) {
										_didIteratorError3 = true;
										_iteratorError3 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion3 && _iterator3.return) {
												_iterator3.return();
											}
										} finally {
											if (_didIteratorError3) {
												throw _iteratorError3;
											}
										}
									}
								}
							}
						});

						// Sets `Authorization: Bearer ${token}` in HTTP request header
						request.add_authentication(authentication_token_header, options.authentication, get_access_token, getCookie);

						// Server side only
						// (copies user authentication cookies to retain session specific data)
						if (_this.server && is_relative_url(path)) {
							request.add_cookies(_this.cookies_raw, _this.set_cookies);
						}

						// Allows customizing HTTP requests
						// (for example, setting some HTTP headers)
						if (on_before_send) {
							on_before_send(request.request);
						}

						// File upload progress metering
						// https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
						if (options.progress) {
							request.progress(options.progress);
						}

						// If using `bluebird` and `Promise` cancellation is configured
						// http://bluebirdjs.com/docs/api/cancellation.html
						return new _promise2.default(function (resolve, reject, onCancel) {
							// Send HTTP request
							request.send().then(resolve, reject);

							// If using `bluebird` and `Promise` cancellation is configured
							// http://bluebirdjs.com/docs/api/cancellation.html
							// https://github.com/petkaantonov/bluebird/issues/1323
							if (_promise2.default.version && onCancel) {
								onCancel(function () {
									return request.request.abort();
								});
							}

							// // One could store the `request` to later `.abort()` it.
							// // https://github.com/halt-hammerzeit/react-isomorphic-render/issues/46
							// if (options.onRequest)
							// {
							// 	options.onRequest(request.request)
							// }
						}).then(function (response) {
							return response;
						}, function (error) {
							// `superagent` would have already output the error to console
							// console.error(error.stack)

							// (legacy)
							//
							// this turned out to be a lame way of handling cookies,
							// because cookies are sent in request 
							// with no additional parameters
							// such as `path`, `httpOnly` and `expires`,
							// so there were cookie duplication issues.
							//
							// if (response)
							// {
							// 	if (response.get('set-cookie'))
							// 	{
							// 		this.cookies_raw = response.get('set-cookie')
							// 	}
							// }

							// Can optionally retry an HTTP request in case of an error
							// (e.g. if an Auth0 access token expired and has to be refreshed).
							// https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
							if (catch_to_retry) {
								retry_count++;

								return catch_to_retry(error, retry_count, {
									getCookie: getCookie,
									this: _this
								}).then(perform_http_request);
							}

							// HTTP request failed with an `error`
							return _promise2.default.reject(error);
						});
					};

					return perform_http_request();
				};
			};

			for (var _iterator2 = (0, _getIterator3.default)(http_methods), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				_loop();
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	}

	// Validates the requested URL,
	// and also prepends host and port to it on the server side.

	// `Set-Cookie` HTTP headers
	// (in case any cookies are set)


	(0, _createClass3.default)(http_client, [{
		key: 'format_url',
		value: function format_url(path, server) {
			// Rejects URLs of form "//www.google.ru/search",
			// and verifies that the `path` is an internal URL.
			// This check is performed to avoid leaking cookies to a third party.
			if (!is_relative_url(path)) {
				throw new Error('Only internal URLs (e.g. "/api/item?id=1") are allowed for the "http" utility. Got an external url "' + path + '". A developer can allow absolute URLs by supplying a custom (looser) "http.url" parameter function (see the README).');
			}

			// Prepend host and port on the server side
			if (server) {
				var protocol = this.secure ? 'https' : 'http';
				return protocol + '://' + this.host + ':' + this.port + path;
			}

			return path;
		}
	}]);
	return http_client;
}();

exports.default = http_client;


function is_relative_url(path) {
	return (0, _helpers.starts_with)(path, '/') && !(0, _helpers.starts_with)(path, '//');
}

function has_binary_data(data) {
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = (0, _getIterator3.default)((0, _keys2.default)(data)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var key = _step4.value;

			var parameter = data[key];

			if (typeof HTMLInputElement !== 'undefined' && parameter instanceof HTMLInputElement) {
				return true;
			}

			if (typeof FileList !== 'undefined' && parameter instanceof FileList) {
				return true;
			}

			// `File` is a subclass of `Blob`
			// https://developer.mozilla.org/en-US/docs/Web/API/Blob
			if (typeof Blob !== 'undefined' && parameter instanceof Blob) {
				return true;
			}
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}
}

function construct_form_data(data) {
	// Just in case (who knows)
	if (typeof FormData === 'undefined') {
		// Silent fallback
		return data;
	}

	var form_data = new FormData();

	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(data)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			var key = _step5.value;

			var parameter = data[key];

			// For an `<input type="file"/>` DOM element just take its `.files`
			if (typeof HTMLInputElement !== 'undefined' && parameter instanceof HTMLInputElement) {
				parameter = parameter.files;
			}

			// For a `FileList` parameter (e.g. `multiple` file upload),
			// iterate the `File`s in the `FileList`
			// and add them to the form data as a `[File]` array.
			if (typeof FileList !== 'undefined' && parameter instanceof FileList) {
				var i = 0;
				while (i < parameter.length) {
					form_data.append(key, parameter[i]);
					i++;
				}
				continue;
			}

			form_data.append(key, parameter);
		}
	} catch (err) {
		_didIteratorError5 = true;
		_iteratorError5 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion5 && _iterator5.return) {
				_iterator5.return();
			}
		} finally {
			if (_didIteratorError5) {
				throw _iteratorError5;
			}
		}
	}

	return form_data;
}

var Http_request = function () {
	function Http_request(method, url, data, options) {
		(0, _classCallCheck3.default)(this, Http_request);
		var agent = options.agent,
		    headers = options.headers,
		    parse_json_dates = options.parse_json_dates,
		    new_cookies = options.new_cookies;


		this.new_cookies = new_cookies;

		// Create Http request.
		this.request = agent[method](url);

		// Attach data to the outgoing HTTP request
		if (data) {
			switch (method) {
				case 'get':
					this.request.query(data);
					break;

				case 'post':
				case 'put':
				case 'patch':
				case 'head':
				case 'options':
					this.request.send(has_binary_data(data) ? construct_form_data(data) : data);
					break;

				case 'delete':
					throw new Error('"data" supplied for HTTP DELETE request: ' + (0, _stringify2.default)(data));

				default:
					throw new Error('Unknown HTTP method: ' + method);
			}
		}

		// Apply HTTP headers
		this.request.set(headers);

		// `true`/`false`
		this.parse_json_dates = parse_json_dates;
	}

	// Sets `Authorization: Bearer ${token}` in HTTP request header


	(0, _createClass3.default)(Http_request, [{
		key: 'add_authentication',
		value: function add_authentication(authentication_token_header, authentication, get_access_token, getCookie) {
			var token = void 0;

			if (typeof authentication === 'string') {
				token = authentication;
			} else if (get_access_token) {
				token = get_access_token(getCookie);
			}

			if (token && authentication !== false) {
				this.request.set(authentication_token_header || 'Authorization', 'Bearer ' + token);
			}
		}

		// Server side only
		// (copies user authentication cookies to retain session specific data)

	}, {
		key: 'add_cookies',
		value: function add_cookies() {
			var cookies_raw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var set_cookies = arguments[1];

			// Merge `cookies_raw` and `set_cookies` (a `Set`)
			if (set_cookies.size > 0) {
				var cookies = {};

				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = (0, _getIterator3.default)(cookies_raw.split(';')), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var key_value = _step6.value;

						key_value = key_value.trim().split('=');
						cookies[key_value[0]] = key_value[1];
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = (0, _getIterator3.default)(set_cookies), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var cookie_raw = _step7.value;

						var _key_value = cookie_raw_key_value(cookie_raw).split('=');
						cookies[_key_value[0]] = _key_value[1];
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}

				cookies_raw = (0, _keys2.default)(cookies).map(function (key) {
					return key + '=' + cookies[key];
				}).join(';');
			}

			if (cookies_raw) {
				this.request.set('cookie', cookies_raw);
			}
		}

		// File upload progress metering
		// https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

	}, {
		key: 'progress',
		value: function progress(_progress) {
			this.request.on('progress', function (event) {
				if (event.direction !== 'upload') {
					// Only interested in file upload progress metering
					return;
				}

				if (!event.lengthComputable) {
					// Unable to compute progress information since the total size is unknown
					return;
				}

				_progress(event.percent, event);
			});
		}
	}, {
		key: 'send',
		value: function send() {
			var _this2 = this;

			return new _promise2.default(function (resolve, reject) {
				_this2.request.end(function (error, response) {
					// If any cookies were set then track them (for later)
					if (response && response.headers['set-cookie']) {
						_this2.new_cookies(response.headers['set-cookie']);
					}

					if (error) {
						// Infer additional `error` properties from the HTTP response
						if (response) {
							_this2.populate_error_data(error, response);
						}

						return reject(error);
					}

					// If HTTP response status is "204 - No content"
					// (e.g. PUT, DELETE)
					// then resolve with an empty result.
					if (response.statusCode === 204) {
						return resolve(response.headers);
					}

					resolve(_this2.get_response_data(response));
				});
			});
		}
	}, {
		key: 'populate_error_data',
		value: function populate_error_data(error, response) {
			// Set `error.status` to HTTP response status code
			error.status = response.statusCode;

			var response_data = this.get_response_data(response);

			switch (response.type) {
				// Set error `data` from response body,
				case 'application/json':
				// http://jsonapi.org/
				case 'application/vnd.api+json':
					error.data = response_data;

					// Set the more meaningful message for the error (if available)
					if (error.data.message) {
						error.message = error.data.message;
					}

					break;

				// If the HTTP response was not a JSON object,
				// but rather a text or an HTML page,
				// then include that information in the `error`
				// for future reference (e.g. easier debugging).

				case 'text/plain':
					error.message = response_data;
					break;

				case 'text/html':
					error.html = response_data;

					// Recover the original error message (if any)
					if (response.headers['x-error-message']) {
						error.message = response.headers['x-error-message'];
					}

					// Recover the original error stack trace (if any)
					if (response.headers['x-error-stack-trace']) {
						error.stack = JSON.parse(response.headers['x-error-stack-trace']);
					}

					break;
			}
		}
	}, {
		key: 'get_response_data',
		value: function get_response_data(response) {
			switch (response.type) {
				case 'application/json':
				// http://jsonapi.org/
				case 'application/vnd.api+json':
					if (this.parse_json_dates) {
						return (0, _dateParser2.default)(response.body);
					}
					return response.body;

				// case 'text/plain':
				// case 'text/html':
				default:
					return response.text;
			}
		}
	}]);
	return Http_request;
}();

// Leaves just `key=value` from the cookie string


function cookie_raw_key_value(cookie_raw) {
	var semicolon_index = cookie_raw.indexOf(';');

	if (semicolon_index >= 0) {
		cookie_raw = cookie_raw.slice(0, semicolon_index);
	}

	return cookie_raw.trim();
}
//# sourceMappingURL=http client.js.map