import _extends from 'babel-runtime/helpers/extends';
import _typeof from 'babel-runtime/helpers/typeof';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';

var _class, _temp;

// https://github.com/ReactTraining/react-router/blob/master/modules/Link.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { preload_action } from './actions';

var Hyperlink = (_temp = _class = function (_Component) {
	_inherits(Hyperlink, _Component);

	function Hyperlink() {
		_classCallCheck(this, Hyperlink);

		var _this = _possibleConstructorReturn(this, (Hyperlink.__proto__ || _Object$getPrototypeOf(Hyperlink)).call(this));

		_this.on_click = _this.on_click.bind(_this);
		return _this;
	}

	_createClass(Hyperlink, [{
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
			store.dispatch(preload_action(resolveToLocation(to, router), undefined, undefined, undefined, instantBack));
		}
	}, {
		key: 'render',
		value: function render() {
			var _props2 = this.props,
			    instantBack = _props2.instantBack,
			    link_props = _objectWithoutProperties(_props2, ['instantBack']);

			var to = link_props.to,
			    target = link_props.target,
			    children = link_props.children,
			    rest_props = _objectWithoutProperties(link_props, ['to', 'target', 'children']);

			var router = this.context.router;

			// Sanity check

			if (!router) {
				throw new Error('<Link>s rendered outside of a router context cannot navigate.');
			}

			// `to` could be a function of the current `location`
			var location = resolveToLocation(to, router);

			// Is it a link to an absolute URL or to a relative (local) URL.
			var is_local_website_link = (typeof location === 'undefined' ? 'undefined' : _typeof(location)) === 'object' || typeof location === 'string' && location && location[0] === '/';

			if (is_local_website_link && !target) {
				return React.createElement(
					Link,
					_extends({}, link_props, { onClick: this.on_click }),
					children
				);
			}

			// External links (or links with `target` specified, like "open in a new tab")
			return React.createElement(
				'a',
				_extends({ href: to, target: target }, rest_props),
				children
			);
		}
	}]);

	return Hyperlink;
}(Component), _class.propTypes = {
	// User may supply his own `onClick(event)` handler
	onClick: PropTypes.func,

	// HTML `<a target={...}>` attribute
	target: PropTypes.string,

	// Link destination
	// (a URL, or a location object,
	//  or a function of the current location)
	to: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]),

	// Set to `true` to disable page `@preload()`ing
	// when navigating "Back"
	instantBack: PropTypes.bool.isRequired,

	// Wrapped components
	children: PropTypes.node
}, _class.defaultProps = {
	instantBack: false
}, _class.contextTypes = {
	// `react-router` context required
	router: PropTypes.object.isRequired,

	// `react-redux` context required
	store: PropTypes.object.isRequired
}, _temp);

// export default withRouter(Hyperlink)

// Is it a left mouse button click

export { Hyperlink as default };
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