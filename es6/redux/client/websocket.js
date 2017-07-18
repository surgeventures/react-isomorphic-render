import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _extends from 'babel-runtime/helpers/extends';
import RobustWebSocket from '../../robust-websocket';
import CustomEvent from '../../custom event';

// Sets up WebSocket connection.
//
// Legacy `token` option is deprecated and will be removed in any future major release.
//
export default function websocket(_ref) {
	var host = _ref.host,
	    port = _ref.port,
	    secure = _ref.secure,
	    store = _ref.store,
	    token = _ref.token,
	    autoDispatch = _ref.autoDispatch;

	var _websocket = new RobustWebSocket((secure ? 'wss' : 'ws') + '://' + host + ':' + port, undefined, {
		// If a number returned then it's gonna be a delay
		// before reconnect is attempted.
		// If anything else is returned (`null`, `undefined`, `false`)
		// then it means "don't try to reconnect".
		//
		// `event` is either a `CloseEvent`
		// or an online/offline `navigator` event.
		//
		shouldReconnect: function shouldReconnect(event, websocket) {
			// https://github.com/appuri/robust-websocket/issues/8
			//
			// 1011 (500) is not retried by the default shouldReconnect.
			// a 500 will usually either be a big in the server
			// that the code is hitting, and retrying won't help,
			// or the server is down and getting slammed,
			// and retrying will just slam it more.
			// Sure the server will probably eventually come back up
			// so retrying it at a longer interval would be fine.
			//
			// 1008 (400) means the request you formed is bad.
			// If you try the exact same request again, you should always get 400.
			// 400 is not a transient error. If it is, the API is using the wrong status code.
			//
			if (event.code === 1008 || event.code === 1011) {
				// Retry in 30 minutes
				return jitter(30 * 60 * 1000);
			}

			// Exponential backoff, but no less that once in a couple of minutes
			return jitter(Math.min(Math.pow(1.5, websocket.attempts) * 500, 2 * 60 * 1000));
		}
	});

	var websocket = {
		send: function send(message) {
			// Legacy `token` option is deprecated and will be removed in any future major release.
			if (token) {
				message = _extends({}, message, {
					token: token
				});
			}

			return _websocket.send(_JSON$stringify(message));
		},
		close: function close() {
			return _websocket.close();
		},
		listen: function listen(event_name, listener) {
			var enhanced_listener = function enhanced_listener(event) {
				return listener(event, store);
			};

			_websocket.addEventListener(event_name, enhanced_listener);

			// Returns `unlisten()`
			return function () {
				return _websocket.removeEventListener(event_name, enhanced_listener);
			};
		},
		onOpen: function onOpen(listener) {
			return websocket.listen('open', listener);
		},
		onClose: function onClose(listener) {
			return websocket.listen('close', listener);
		},
		onError: function onError(listener) {
			return websocket.listen('error', listener);
		},
		onMessage: function onMessage(listener) {
			return websocket.listen('message', function (event, store) {
				return listener(JSON.parse(event.data), store);
			});
		},


		// For advanced use cases
		socket: _websocket
	};

	if (autoDispatch !== false) {
		websocket.onMessage(function (message, store) {
			if (message.type) {
				store.dispatch(message);
			}
		});
	}

	return window.websocket = websocket;
}

// Returns a value ranging from [value * (1 - amount)] to (value * (1 + amount))
function jitter(value) {
	var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.2;

	return value * (1 - amount + amount * 2 * Math.random());
}
//# sourceMappingURL=websocket.js.map