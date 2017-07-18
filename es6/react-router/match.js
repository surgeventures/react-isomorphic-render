import _Promise from 'babel-runtime/core-js/promise';
import { match } from 'react-router';

import { location_url } from '../location';

// Matches a `location` (or a `url`) agains the `routes`
// (to a hierarchy of React-router `<Route/>`s).
//
// If no `location` is passed but `history` was passed
// then `location` is taken from the `history`'s current location.
//
// If no `history` is passed then an in-memory history is created.
// (server side usage)
//
// Returns a Promise resolving to an object:
//
//   redirect    - in case of an HTTP redirect
//
//   router_state - the "next Router state":
//
//       components - matched hierarchy of React-router `<Route/>`s
//       location   - ...
//       params     - ...
//
export default function match_routes_against_location(_ref) {
	var routes = _ref.routes,
	    location = _ref.location,
	    history = _ref.history;

	// (not using `promisify()` helper here 
	//  to avoid introducing dependency on `bluebird` Promise library)
	//
	return new _Promise(function (resolve, reject) {
		// Perform routing for this `location`
		match({ routes: routes, location: location, history: history }, function (error, redirect_location, router_state) {
			// If routing process failed
			if (error) {
				return reject(error);
			}

			// If a decision to perform a redirect was made 
			// during the routing process (e.g. `<Redirect/>`),
			// then redirect to another URL
			if (redirect_location) {
				return resolve({
					redirect: redirect_location
				});
			}

			// In case some weird stuff happened
			if (!router_state) {
				return reject(new Error('No <Route/> matches URL "' + location_url(location || history.getCurrentLocation()) + '"'));
			}

			return resolve({ router_state: router_state });
		});
	});
}
//# sourceMappingURL=match.js.map