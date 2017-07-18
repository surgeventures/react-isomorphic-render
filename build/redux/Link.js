'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var _class, _temp; // https://github.com/ReactTraining/react-router/blob/master/modules/Link.js

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hyperlink = (_temp = _class = function (_Component) {
	(0, _inherits3.default)(Hyperlink, _Component);

	function Hyperlink() {
		(0, _classCallCheck3.default)(this, Hyperlink);

		var _this = (0, _possibleConstructorReturn3.default)(this, (Hyperlink.__proto__ || (0, _getPrototypeOf2.default)(Hyperlink)).call(this));

		_this.on_click = _this.on_click.bind(_this);
		return _this;
	}

	(0, _createClass3.default)(Hyperlink, [{
		key: 'on_click',
		value: function on_click(event) {
			var _props = this.props,
			    onClick = _props.onClick,
			    to = _props.to,
			    instantBack = _props.instantBack;
			var _context = this.context,
			    router = _context.router,
			    store = _context.store;

			// Sanity check

			if (!router) {
				throw new Error('<Link>s rendered outside of a router context cannot navigate.');
			}

			// Sanity check
			if (!store) {
				throw new Error('<Link>s rendered outside of a Redux context cannot navigate.');
			}

			// User may have supplied his own `onClick` handler
			if (onClick) {
				onClick(event);
			}

			// `onClick` could call `event.preventDefault()`
			// to intercept `react-router` navigation.
			if (event.defaultPrevented) {
				return;
			}

			// Only process left mouse button clicks without modifier keys pressed
			if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
				return;
			}

			// Cancel `react-router` navigation inside its own `<Link/>`
			event.preventDefault();

			// Firt preload the new page, then `history.push()` will be called,
			// and `react-router` will detect that performing the route transition.
			store.dispatch((0, _actions.preload_action)(resolveToLocation(to, router), undefined, undefined, undefined, instantBack));
		}
	}, {
		key: 'render',
		value: function render() {
			var _props2 = this.props,
			    instantBack = _props2.instantBack,
			    link_props = (0, _objectWithoutProperties3.default)(_props2, ['instantBack']);
			var to = link_props.to,
			    target = link_props.target,
			    children = link_props.children,
			    rest_props = (0, _objectWithoutProperties3.default)(link_props, ['to', 'target', 'children']);
			var router = this.context.router;

			// Sanity check

			if (!router) {
				throw new Error('<Link>s rendered outside of a router context cannot navigate.');
			}

			// `to` could be a function of the current `location`
			var location = resolveToLocation(to, router);

			// Is it a link to an absolute URL or to a relative (local) URL.
			var is_local_website_link = (typeof location === 'undefined' ? 'undefined' : (0, _typeof3.default)(location)) === 'object' || typeof location === 'string' && location && location[0] === '/';

			if (is_local_website_link && !target) {
				return _react2.default.createElement(
					_reactRouter.Link,
					(0, _extends3.default)({}, link_props, { onClick: this.on_click }),
					children
				);
			}

			// External links (or links with `target` specified, like "open in a new tab")
			return _react2.default.createElement(
				'a',
				(0, _extends3.default)({ href: to, target: target }, rest_props),
				children
			);
		}
	}]);
	return Hyperlink;
}(_react.Component), _class.propTypes = {
	// User may supply his own `onClick(event)` handler
	onClick: _propTypes2.default.func,

	// HTML `<a target={...}>` attribute
	target: _propTypes2.default.string,

	// Link destination
	// (a URL, or a location object,
	//  or a function of the current location)
	to: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.func]),

	// Set to `true` to disable page `@preload()`ing
	// when navigating "Back"
	instantBack: _propTypes2.default.bool.isRequired,

	// Wrapped components
	children: _propTypes2.default.node
}, _class.defaultProps = {
	instantBack: false
}, _class.contextTypes = {
	// `react-router` context required
	router: _propTypes2.default.object.isRequired,

	// `react-redux` context required
	store: _propTypes2.default.object.isRequired
}, _temp);

// export default withRouter(Hyperlink)

// Is it a left mouse button click

exports.default = Hyperlink;
function isLeftClickEvent(event) {
	return event.button === 0;
}

// Was a modifier key pressed during the event
function isModifiedEvent(event) {
	return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

// `to` could be a function of the current `location`
function resolveToLocation(to, router) {
	return typeof to === 'function' ? to(router.location) : to;
}
//# sourceMappingURL=Link.js.map