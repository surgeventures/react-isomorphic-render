'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = render_on_client;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renders `element` React element inside the `to` DOM element.
//
// Returns React component for the rendered `element`.
//
function render_on_client(_ref) {
	var element = _ref.element,
	    to = _ref.to,
	    subsequent_render = _ref.subsequent_render;

	// Render the React element to `to` DOM node
	var component = _reactDom2.default.render(element, to);

	// In dev mode, check that server-side rendering works correctly
	if (process.env.NODE_ENV !== 'production' && !subsequent_render) {
		window.React = _react2.default; // enable debugger

		// if (!to || !to.firstChild || !to.firstChild.attributes || !to.firstChild.attributes['data-react-checksum'])
		// {
		// 	console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.')
		// }
	}

	return { component: component };
}
//# sourceMappingURL=render on client.js.map