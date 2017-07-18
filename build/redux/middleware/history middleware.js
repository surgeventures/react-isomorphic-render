'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = history_middleware;

var _actions = require('../actions');

function history_middleware(get_history) {
	return function (_ref) {
		var getState = _ref.getState,
		    dispatch = _ref.dispatch;

		return function (next) {
			return function (action) {
				// After page preloading finished
				if (action.type === _actions.Redirect) {
					dispatch((0, _actions.navigated_action)(action.location));
					return get_history().replace(action.location);
				}

				// After page preloading finished
				if (action.type === _actions.GoTo) {
					dispatch((0, _actions.navigated_action)(action.location));
					return get_history().push(action.location);
				}

				return next(action);
			};
		};
	};
}
//# sourceMappingURL=history middleware.js.map