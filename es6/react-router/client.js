// THIS MODULE IS CURRENTLY NOT USED.
// IT'S JUST HERE AS AN EXAMPLE.

import { render_on_client as render } from './render';
import { exists } from '../helpers';

import client_side_render from '../client';
import normalize_common_settings from '../redux/normalize';
import create_history from '../history';

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
export default function set_up_and_render(settings) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	settings = normalize_common_settings(settings);

	var translation = options.translation;

	// Create `react-router` `history`

	var history = create_history(document.location, settings.history);

	// Render the page
	return client_side_render({
		translation: translation,
		wrapper: common.wrapper,
		render: render,
		render_parameters: {
			history: history,
			routes: common.routes
		}
	});
}
//# sourceMappingURL=client.js.map