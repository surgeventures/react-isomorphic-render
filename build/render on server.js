'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = render_on_server;

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Renders React page content element
// (wrapping it with the <Html/> component)
// to the resulting Html markup code
// (returns a string containing the final html markup)
//
function render_on_server(_ref) {
	var render_webpage = _ref.render_webpage,
	    page_element = _ref.page_element;

	return '<!doctype html>\n' + render_webpage(page_element);
}
//# sourceMappingURL=render on server.js.map