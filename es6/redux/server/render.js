import React from 'react';
import { Router } from 'react-router';

import react_render_on_server from '../../render on server';
import { location_url } from '../../location';
import { get_location } from '../../history';
import timer from '../../timer';
import { preload_action } from '../actions';
import match_routes_against_location from '../../react-router/match';
import get_route_path from '../../react-router/get route path';

function timed_react_render_on_server(named_arguments) {
	var render_timer = timer();
	var markup = react_render_on_server(named_arguments);
	var result = {
		content: markup,
		time: render_timer()
	};
	return result;
}

// Returns a Promise resolving to { status, content, redirect }.
//
export default function render_on_server(_ref) {
	var history = _ref.history,
	    disable_server_side_rendering = _ref.disable_server_side_rendering,
	    create_page_element = _ref.create_page_element,
	    render_webpage = _ref.render_webpage,
	    store = _ref.store,
	    routes = _ref.routes,
	    before_render = _ref.before_render;

	// Routing only takes a couple of milliseconds
	// const routing_timer = timer()

	// Perform routing for this URL
	return match_routes_against_location({
		history: history,
		routes: routes
	}).then(function (_ref2) {
		var redirect = _ref2.redirect,
		    router_state = _ref2.router_state;

		// routing_timer()

		// In case of a `react-router` `<Redirect/>`
		if (redirect) {
			return { redirect: redirect };
		}

		// Http response status code
		var http_status_code = get_http_response_status_code_for_the_route(router_state.routes);

		// Concatenated `react-router` route string.
		// E.g. "/user/:user_id/post/:post_id"
		var route = get_route_path(router_state);

		// Profiling
		var time = {};

		var preload_timer = timer();

		// After the page has finished preloading, render it
		return store.dispatch(preload_action(get_location(history))).then(function () {
			time.preload = preload_timer();

			if (before_render) {
				return before_render(store);
			}
		}).then(function () {
			if (disable_server_side_rendering) {
				// Render the empty <Html/> component into Html markup string
				var _rendered = timed_react_render_on_server({ render_webpage: render_webpage });
				time.render = _rendered.time;

				// return  HTML markup
				return { content: _rendered.content, route: route, time: time };
			}

			// Renders the current page React component to a React element.
			// Passing `store` as part of `props` to the `wrapper`.
			var page_element = create_page_element(React.createElement(Router, router_state), { store: store });

			// Render the current page's React element to HTML markup
			var rendered = timed_react_render_on_server({ render_webpage: render_webpage, page_element: page_element });

			// Rendering a complex React page (having more than 1000 components)
			// takes about 100ms (`time.render`).
			// This is quite slow but that's how React Server Side Rendering currently is.
			time.render = rendered.time;

			// return HTTP status code and HTML markup
			return { status: http_status_code, content: rendered.content, route: route, time: time };
		});
	}).catch(function (error) {
		// If an HTTP redirect is required, then abort all further actions.
		// That's a hacky way to implement redirects but it seems to work.
		if (error._redirect) {
			return { redirect: error._redirect };
		}

		// Otherwise, throw this error up the call stack.
		throw error;
	});
}

// One can set a `status` prop for a react-router `Route`
// to be returned as an Http response status code (404, etc)
function get_http_response_status_code_for_the_route(matched_routes) {
	return matched_routes.reduce(function (previous, current) {
		return current && current.status || previous && current.status;
	});
}
//# sourceMappingURL=render.js.map