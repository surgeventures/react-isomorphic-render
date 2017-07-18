import _Promise from 'babel-runtime/core-js/promise';
// THIS MODULE IS CURRENTLY NOT USED.
// IT'S JUST HERE AS AN EXAMPLE.

import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Router, RouterContext } from 'react-router';

import react_render_on_client from '../render on client';
import react_render_on_server from '../render on server';

// Renders `element` React element inside the `to` DOM element.
//
// returns a Promise resolving to the rendered React component.
//
// The following code hasn't been tested.
// Should theoretically work.
// This is not currently being used.
// It's just an example of Redux-less usage.
//
export function render_on_client(_ref) {
	var history = _ref.history,
	    routes = _ref.routes,
	    create_page_element = _ref.create_page_element,
	    to = _ref.to;

	routes = typeof routes === 'function' ? routes() : routes;

	var router_element = React.createElement(Router, { history: history, routes: routes });

	return create_page_element(router_element).then(function (element) {
		// render the wrapped React page element to DOM
		return react_render_on_client({
			element: element, // wrapped React page element
			to: to // DOM element containing React markup
		});
	});
}

// returns a Promise resolving to { status, content, redirect }
//
export function render_on_server(_ref2) {
	var disable_server_side_rendering = _ref2.disable_server_side_rendering,
	    create_page_element = _ref2.create_page_element,
	    render_webpage_as_react_element = _ref2.render_webpage_as_react_element,
	    routes = _ref2.routes,
	    history = _ref2.history;

	// Maybe no one really needs to `disable_server_side_rendering`
	if (disable_server_side_rendering) {
		// Render the empty <Html/> component into Html markup string
		return _Promise.resolve({
			content: react_render_on_server({ render_webpage_as_react_element: render_webpage_as_react_element })
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
		var page_element = create_page_element(React.createElement(Router, router_state));

		// Render the current page's React element to HTML markup
		var content = react_render_on_server({ render_webpage_as_react_element: render_webpage_as_react_element, page_element: page_element });

		// return HTTP status code and HTML markup
		return { content: content };
	});
}
//# sourceMappingURL=render.js.map