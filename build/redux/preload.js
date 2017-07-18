'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = function (preload, options) {
	return function (Wrapped) {
		var Preload = function (_Component) {
			(0, _inherits3.default)(Preload, _Component);

			function Preload() {
				(0, _classCallCheck3.default)(this, Preload);
				return (0, _possibleConstructorReturn3.default)(this, (Preload.__proto__ || (0, _getPrototypeOf2.default)(Preload)).apply(this, arguments));
			}

			(0, _createClass3.default)(Preload, [{
				key: 'render',
				value: function render() {
					return _react2.default.createElement(Wrapped, this.props);
				}
			}]);
			return Preload;
		}(_react.Component);

		Preload[_preloadingMiddleware.Preload_method_name] = preload;
		Preload[_preloadingMiddleware.Preload_options_name] = options;

		Preload.displayName = 'Preload(' + get_display_name(Wrapped) + ')';

		return (0, _hoistNonReactStatics2.default)(Preload, Wrapped);
	};
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _preloadingMiddleware = require('./middleware/preloading middleware');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get_display_name(Wrapped) {
	return Wrapped.displayName || Wrapped.name || 'Component';
}

// `@preload()` decorator.
//
// `preload` function must return a `Promise`.
// `function preload({ dispatch, getState, location, parameters, server })`.
//
// The decorator also receives `options`:
//
// * `blocking` — if `false` then child `<Route/>` `@preload()`s
//                will not wait for this `@preload()` to finish first
//
// * `client` — if `true` then this `@preload()` will be executed only on the client side
//              including the moment when the page is initially loaded.
//
//# sourceMappingURL=preload.js.map