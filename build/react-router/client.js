'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = set_up_and_render;

var _render = require('./render');

var _helpers = require('../helpers');

var _client = require('../client');

var _client2 = _interopRequireDefault(_client);

var _normalize = require('../redux/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _history = require('../history');

var _history2 = _interopRequireDefault(_history);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Performs client-side rendering
// along with varios stuff like loading localized messages.
//
// This function is what's gonna be called from the project's code on the client-side.
//
// The following code hasn't been tested.
// Should theoretically work.
// This is not currently being used.
// It's just an example of Redux-less usage.
//
function set_up_and_render(settings) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	settings = (0, _normalize2.default)(settings);

	var translation = options.translation;

	// Create `react-router` `history`

	var history = (0, _history2.default)(document.location, settings.history);

	// Render the page
	return (0, _client2.default)({
		translation: translation,
		wrapper: common.wrapper,
		render: _render.render_on_client,
		render_parameters: {
			history: history,
			routes: common.routes
		}
	});
} // THIS MODULE IS CURRENTLY NOT USED.
// IT'S JUST HERE AS AN EXAMPLE.
//# sourceMappingURL=client.js.map