'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = render_on_client;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRouterScroll = require('react-router-scroll');

var _renderOnClient = require('../../render on client');

var _renderOnClient2 = _interopRequireDefault(_renderOnClient);

var _location = require('../../location');

var _actions = require('../actions');

var _match = require('../../react-router/match');

var _match2 = _interopRequireDefault(_match);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renders the current page React element inside the `to` DOM element.
//
// Returns a `Promise` resolving to `{ store, component }`,
// where `component` is the rendered React component
// and `store` is the Redux store.
//
function render_on_client(_ref) {
	var history = _ref.history,
	    devtools = _ref.devtools,
	    create_page_element = _ref.create_page_element,
	    routes = _ref.routes,
	    store = _ref.store,
	    to = _ref.to;

	// Performs `react-router` asynchronous match for current location
	// (is required for asynchonous routes to work).
	return (0, _match2.default)({
		// `react-router` `match()` internally uses this `history` to get current location.
		// Could have just used `document.location` here,
		// but what if, for example, `basename` feature of `history` is being used.
		history: history,
		routes: typeof routes === 'function' ? routes(store) : routes
	}).then(function (_ref2) {
		var redirect = _ref2.redirect,
		    router_state = _ref2.router_state;

		// In case of a `react-router` `<Redirect/>`
		if (redirect) {
			return store.dispatch((0, _actions.redirect_action)(redirect));
		}

		var router_element = _react2.default.createElement(_reactRouter.Router, (0, _extends3.default)({}, router_state, {
			createElement: create_route_element,
			history: history,
			render: (0, _reactRouter.applyRouterMiddleware)((0, _reactRouterScroll.useScroll)(should_scroll)) }));

		// Wraps <Router/> with arbitrary React components (e.g. Redux <Provider/>),
		// loads internationalization messages,
		// and then renders the wrapped React page element to DOM
		return create_page_element(router_element, { store: store }).then(function (element) {
			// Render the wrapped React page element to DOM
			var component = (0, _renderOnClient2.default)({
				element: element, // wrapped React page element
				to: to // DOM element to which React markup will be rendered
			}).component;

			var result = {
				component: component,
				store: store

				// If Redux-devtools aren't enabled, then just return the rendered page component
				// (if Redux-devtools are installed as a web browser extension
				//  then no need to do the second render pass too)
			};if (process.env.NODE_ENV === 'production' || !devtools || window.devToolsExtension) {
				return result;
			}

			// Dev tools should be rendered after initial client render to prevent warning
			// "React attempted to reuse markup in a container but the checksum was invalid"

			// React JSX syntax can't detect lowercase elements
			var DevTools = devtools.component;

			// This element will contain
			// React page element and Redux-devtools.
			//
			// Since `DevTools` are inserted
			// outside of the `<Provider/>`,
			// provide the `store` manually.
			//
			element = _react2.default.createElement(
				'div',
				null,
				element,
				_react2.default.createElement(DevTools, { store: store })
			);

			// Render the wrapped React page element to DOM
			result.component = (0, _renderOnClient2.default)({
				element: element, // wrapped React page element
				to: to, // DOM element to which React markup will be rendered
				subsequent_render: true // Prevents "Server-side React render was discarded" warning
			}).component;

			return result;
		});
	});
}

function should_scroll(previous_router_properties, new_router_properties) {
	var location = new_router_properties.location;


	if (location.scroll === false) {
		return false;
	}

	return true;
}

// Fixes `react-router` bug by forcing 
// `<Route/>` `component` remount on any URL change.
// https://github.com/ReactTraining/react-router/issues/1982
function create_route_element(component, props) {
	var _props = props,
	    location = _props.location,
	    routes = _props.routes;

	// Is this the last React component in the route components chain

	var is_page_component = component === routes[routes.length - 1].component;

	// If it is then remount this page component
	if (is_page_component) {
		// Unless explicitly told not to remount
		if (location.remount !== false) {
			window._react_router_page_element_key = '' + location.pathname + location.search;
		}

		// Force `<Route/>` `component` remount on any URL change via `key` property.
		props = (0, _extends3.default)({}, props, { key: window._react_router_page_element_key });
	}

	// Default behaviour
	return _react2.default.createElement(component, props);
}
//# sourceMappingURL=render.js.map