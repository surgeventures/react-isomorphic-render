// uses 'react-document-meta'.
// 'react-helmet' can be used interchangeably.
// import DocumentMeta from 'react-document-meta'
import Helmet from 'react-helmet';
import React from 'react';
import PropTypes from 'prop-types';

// Sets webpage title
export function Title(_ref) {
	var children = _ref.children;

	// // Replaces only webpage title
	// return <DocumentMeta title={ children } extend/>

	return React.createElement(
		Helmet,
		null,
		React.createElement(
			'title',
			null,
			children
		)
	);
}

Title.propTypes = {
	children: PropTypes.string.isRequired

	// // Sets webpage title, description and meta
	// // (resets title, description and meta prior to doing that)
	// export function webpage_head({ title, meta })
	// {
	// 	// // doesn't `extend`, rewrites all these three completely
	// 	// return <DocumentMeta title={ title } description={ description } meta={ meta }/>
	//
	// 	return <Helmet title={ title } meta={ meta }/>
	// }

	// adds webpage meta tags
};export function Meta(_ref2) {
	var children = _ref2.children;

	// return <DocumentMeta meta={ children } extend/>

	if (!children) {
		return null;
	}

	var the_old_way = false;

	if (Array.isArray(children)) {
		var not_empty_children = children.filter(function (child) {
			return child;
		});

		if (not_empty_children.length > 0 && !not_empty_children[0].props) {
			the_old_way = true;
		}
	}

	// The old way (deprecated)
	if (the_old_way) {
		return React.createElement(Helmet, { meta: children });
	}

	// The new way
	return React.createElement(
		Helmet,
		null,
		children
	);
}

Meta.propTypes = {
	children: PropTypes.arrayOf(PropTypes.object).isRequired

	// Server-side rendering.
	// Will only work with the standard single-threaded React renderer.
	// Will not work with ansynchronous (e.g. streamed) alternative React renderers.
	// https://github.com/gaearon/react-document-title/issues/7
};export function server_side_generated_webpage_head() {
	// return DocumentMeta.renderAsReact()

	return Helmet.renderStatic();
}
//# sourceMappingURL=webpage head.js.map