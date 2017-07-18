'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.render_on_client = render_on_client;
exports.render_on_server = render_on_server;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactRouter = require('react-router');

var _renderOnClient = require('../render on client');

var _renderOnClient2 = _interopRequireDefault(_renderOnClient);

var _renderOnServer = require('../render on server');

var _renderOnServer2 = _interopRequireDefault(_renderOnServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renders `element` React element inside the `to` DOM element.
//
// returns a Promise resolving to the rendered React component.
//
// The following code hasn't been tested.
// Should theoretically work.
// This is not currently being used.
// It's just an example of Redux-less usage.
//
// THIS MODULE IS CURRENTLY NOT USED.
// IT'S JUST HERE AS AN EXAMPLE.

function render_on_client(_ref) {
	var history = _ref.history,
	    routes = _ref.routes,
	    create_page_element = _ref.create_page_element,
	    to = _ref.to;

	routes = typeof routes === 'function' ? routes() : routes;

	var router_element = _react2.default.createElement(_reactRouter.Router, { history: history, routes: routes });

	return create_page_element(router_element).then(function (element) {
		// render the wrapped React page element to DOM
		return (0, _renderOnClient2.default)({
			element: element, // wrapped React page element
			to: to // DOM element containing React markup
		});
	});
}

// returns a Promise resolving to { status, content, redirect }
//
function render_on_server(_ref2) {
	var disable_server_side_rendering = _ref2.disable_server_side_rendering,
	    create_page_element = _ref2.create_page_element,
	    render_webpage_as_react_element = _ref2.render_webpage_as_react_element,
	    routes = _ref2.routes,
	    history = _ref2.history;

	// Maybe no one really needs to `disable_server_side_rendering`
	if (disable_server_side_rendering) {
		// Render the empty <Html/> component into Html markup string
		return _promise2.default.resolve({
			content: (0, _renderOnServer2.default)({ render_webpage_as_react_element: render_webpage_as_react_element })
		});
	}

	// perform React-router routing
	return match_routes_against_location({
		routes: typeof routes === 'function' ? routes() : routes,
		// `react-router` takes the current `location` from `history`
		history: history
	}).then(function (_ref3) {
		var redirect = _ref3.redirect,
		    router_state = _ref3.router_state;

		// In case of a `react-router` `<Redirect/>`
		if (redirect) {
			return { redirect: redirect };
		}

		// Renders the current page React component to a React element
		var page_element = create_page_element(_react2.default.createElement(_reactRouter.Router, router_state));

		// Render the current page's React element to HTML markup
		var content = (0, _renderOnServer2.default)({ render_webpage_as_react_element: render_webpage_as_react_element, page_element: page_element });

		// return HTTP status code and HTML markup
		return { content: content };
	});
}
//# sourceMappingURL=render.js.map