import { Redirect, GoTo, navigated_action } from '../actions';

export default function history_middleware(get_history) {
	return function (_ref) {
		var getState = _ref.getState,
		    dispatch = _ref.dispatch;

		return function (next) {
			return function (action) {
				// After page preloading finished
				if (action.type === Redirect) {
					dispatch(navigated_action(action.location));
					return get_history().replace(action.location);
				}

				// After page preloading finished
				if (action.type === GoTo) {
					dispatch(navigated_action(action.location));
					return get_history().push(action.location);
				}

				return next(action);
			};
		};
	};
}
//# sourceMappingURL=history middleware.js.map