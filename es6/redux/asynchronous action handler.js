import _getIterator from 'babel-runtime/core-js/get-iterator';
import _slicedToArray from 'babel-runtime/helpers/slicedToArray';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _extends from 'babel-runtime/helpers/extends';
import { event_name } from './naming';
import normalize_common_settings from './normalize';

// Returns Redux action creator.
// `promise` is for backwards compatibility:
// it has been renamed to `action` since `9.0.8`.
export function action(options, handler) {
	var _this = this;

	// Sanity check
	if (!handler) {
		throw new Error('You must pass "handler" as the second argument of "action()"');
	}

	var type = options.type,
	    namespace = options.namespace,
	    _promise = options.promise,
	    action = options.action,
	    cancelPrevious = options.cancelPrevious;
	var event = options.event,
	    payload = options.payload,
	    result = options.result;

	// For those who still prefer `type` over `event`

	if (!event && type) {
		event = type;
	}

	// If `result` is a property name,
	// then add that property to the `connector`.
	if (typeof result === 'string') {
		handler.add_state_properties(result);
	}

	// Default "on result" handler
	result = result || function (state) {
		return state;
	};

	// Asynchronous action
	if (_promise || action) {
		// Normalize `result` reducer into a function
		if (typeof result === 'string') {
			var property = result;
			result = function result(state, _result) {
				return _extends({}, state, _defineProperty({}, property, _result));
			};
		}

		// Adds Redux reducers handling events:
		//
		//   * pending
		//   * success
		//   * error
		//
		create_redux_handlers(handler, namespace, event, result);

		// Redux "action creator"
		return function () {
			for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
				parameters[_key] = arguments[_key];
			}

			return {
				event: event_name(namespace, event),
				promise: function promise(http) {
					return (action || _promise).apply(_this, parameters.concat(http));
				},
				cancelPrevious: cancelPrevious
			};
		};
	}

	// Synchronous action

	// Normalize `result` reducer into a function
	if (typeof result === 'string') {
		payload = function payload(parameter) {
			return { parameter: parameter };
		};

		var _property = result;
		result = function result(state, action) {
			return _extends({}, state, _defineProperty({}, _property, action.parameter));
		};
	}

	// Reducer
	handler.handle(event_name(namespace, event), result);

	// Redux "action creator"
	return function () {
		for (var _len2 = arguments.length, parameters = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			parameters[_key2] = arguments[_key2];
		}

		return _extends({
			type: event_name(namespace, event)
		}, payload ? payload.apply(_this, parameters) : undefined);
	};
}

// Creates Redux handler object
// (which will eventually be transformed into a reducer)
export function create_handler(settings) {
	settings = normalize_common_settings(settings, { full: false });

	var handlers = {};
	var registered_state_properties = [];

	var result = {
		settings: settings,

		handle: function handle(event, handler) {
			handlers[event] = handler;
		},
		reducer: function reducer() {
			var initial_state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			// applies a handler based on the action type
			// (is copy & paste'd for all action response handlers)
			return function () {
				var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initial_state;
				var action_data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				var handler = handlers[action_data.type];

				if (!handler) {
					return state;
				}

				var handler_argument = action_data;

				// if (action_data.result !== undefined)
				if (Object.prototype.hasOwnProperty.call(action_data, 'result')) {
					handler_argument = action_data.result;
				} else if (action_data.error !== undefined) {
					handler_argument = action_data.error;
				}
				// This proved to be not that convenient
				// // When only `type` of a Redux "action" is set
				// else if (Object.keys(action_data).length === 1)
				// {
				// 	handler_argument = undefined
				// }

				// For some strange reason Redux didn't report
				// these errors to the console, hence the manual `console.error`.
				try {
					return handler(state, handler_argument);
				} catch (error) {
					console.error(error);
					throw error;
				}
			};
		},


		registered_state_properties: registered_state_properties,

		add_state_properties: function add_state_properties() {
			registered_state_properties.push.apply(registered_state_properties, arguments);
		}
	};

	result.addStateProperties = result.add_state_properties;

	return result;
}

// Adds handlers for:
//
//   * pending
//   * done
//   * failed
//   * reset error
//
function create_redux_handlers(handler, namespace, event, on_result) {
	if (!handler.settings.asynchronous_action_event_naming) {
		throw new Error("`asynchronousActionEventNaming` function parameter was not passed");
	}

	if (!handler.settings.asynchronous_action_handler_state_property_naming) {
		throw new Error("`asynchronousActionHandlerStatePropertyNaming` function parameter was not passed");
	}

	var _handler$settings$asy = handler.settings.asynchronous_action_event_naming(event),
	    _handler$settings$asy2 = _slicedToArray(_handler$settings$asy, 3),
	    pending_event_name = _handler$settings$asy2[0],
	    success_event_name = _handler$settings$asy2[1],
	    error_event_name = _handler$settings$asy2[2];

	var pending_property_name = handler.settings.asynchronous_action_handler_state_property_naming(pending_event_name);
	var error_property_name = handler.settings.asynchronous_action_handler_state_property_naming(error_event_name);

	// This info will be used in `storeConnector`
	handler.add_state_properties(pending_property_name, error_property_name);

	// When Promise is created,
	// clear `error`,
	// set `pending` flag.
	handler.handle(event_name(namespace, pending_event_name), function (state, result) {
		var _extends4;

		return _extends({}, state, (_extends4 = {}, _defineProperty(_extends4, pending_property_name, true), _defineProperty(_extends4, error_property_name, undefined), _extends4));
	});

	// When Promise succeeds
	handler.handle(event_name(namespace, success_event_name), function (state, result) {
		// This will be the new Redux state
		var new_state = on_result(state, result);

		// Clear `pending` flag
		new_state[pending_property_name] = false;

		// Return the new Redux state
		return new_state;
	});

	// When Promise fails, clear `pending` flag and set `error`.
	// Can also clear `error` when no `error` is passed as part of an action.
	handler.handle(event_name(namespace, error_event_name), function (state, error) {
		var _extends5;

		return _extends({}, state, (_extends5 = {}, _defineProperty(_extends5, pending_property_name, false), _defineProperty(_extends5, error_property_name, error), _extends5));
	});
}

// Returns Redux action creator for resetting error.
export function reset_error(_ref, handler) {
	var namespace = _ref.namespace,
	    event = _ref.event;

	var _handler$settings$asy3 = handler.settings.asynchronous_action_event_naming(event),
	    _handler$settings$asy4 = _slicedToArray(_handler$settings$asy3, 3),
	    pending_event_name = _handler$settings$asy4[0],
	    success_event_name = _handler$settings$asy4[1],
	    error_event_name = _handler$settings$asy4[2];

	// Redux "action creator"


	return function () {
		return {
			type: event_name(namespace, error_event_name),
			error: null
		};
	};
}

// A little helper for Redux `@connect()`
export function state_connector(handler) {
	return function connect_state(state) {
		var result = {};

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = _getIterator(handler.registered_state_properties), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var property_name = _step.value;

				result[property_name] = state[property_name];
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

		return result;
	};
}
//# sourceMappingURL=asynchronous action handler.js.map