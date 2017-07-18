'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Title = Title;
exports.Meta = Meta;
exports.server_side_generated_webpage_head = server_side_generated_webpage_head;

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Sets webpage title
function Title(_ref) {
	var children = _ref.children;

	// // Replaces only webpage title
	// return <DocumentMeta title={ children } extend/>

	return _react2.default.createElement(
		_reactHelmet2.default,
		null,
		_react2.default.createElement(
			'title',
			null,
			children
		)
	);
} // uses 'react-document-meta'.
// 'react-helmet' can be used interchangeably.
// import DocumentMeta from 'react-document-meta'


Title.propTypes = {
	children: _propTypes2.default.string.isRequired

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
};function Meta(_ref2) {
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
		return _react2.default.createElement(_reactHelmet2.default, { meta: children });
	}

	// The new way
	return _react2.default.createElement(
		_reactHelmet2.default,
		null,
		children
	);
}

Meta.propTypes = {
	children: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired

	// Server-side rendering.
	// Will only work with the standard single-threaded React renderer.
	// Will not work with ansynchronous (e.g. streamed) alternative React renderers.
	// https://github.com/gaearon/react-document-title/issues/7
};function server_side_generated_webpage_head() {
	// return DocumentMeta.renderAsReact()

	return _reactHelmet2.default.renderStatic();
}
//# sourceMappingURL=webpage head.js.map