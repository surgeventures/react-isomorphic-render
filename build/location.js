'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.location_url = location_url;
exports.parse_location = parse_location;
exports.strip_basename = strip_basename;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Not part of package.json
// import querystring from 'query-string'
// import deep_equal from 'deep-equal'

function location_url(location) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (typeof location === 'string') {
		return location;
	}

	var origin = location.origin || '';
	var pathname = location.pathname;
	var search = location.search || '';
	var hash = location.hash || '';

	// Append `basename` only to relative URLs
	var basename = !origin && options.basename ? options.basename : '';

	return '' + origin + basename + pathname + search + hash;
}

// Doesn't construct `query` though
function parse_location(location) {
	if (typeof location !== 'string') {
		return location;
	}

	var origin = void 0;
	var pathname = void 0;

	if (location === '') {
		pathname = '/';
	} else if (location[0] === '/') {
		pathname = location;
	} else {
		var pathname_starts_at = location.indexOf('/', location.indexOf('//') + '//'.length);

		if (pathname_starts_at > 0) {
			origin = location.slice(0, pathname_starts_at);
			pathname = location.slice(pathname_starts_at);
		} else {
			origin = location;
			pathname = '/';
		}
	}

	var search = '';
	var hash = '';

	var search_index = pathname.indexOf('?');
	if (search_index >= 0) {
		search = pathname.slice(search_index);
		pathname = pathname.slice(0, search_index);
	}

	var hash_index = search.indexOf('#');
	if (hash_index >= 0) {
		hash = search.slice(hash_index);
		search = search.slice(0, hash_index);
	}

	return { origin: origin, pathname: pathname, search: search, hash: hash };
}

// Copy-pasted `addBasename()` (wrong name) function from `history`:
// https://github.com/ReactTraining/history/blob/v3/modules/useBasename.js
function strip_basename(location, basename) {
	if (!location) {
		return location;
	}

	if (basename && typeof location.basename !== 'string') {
		var starts_with_basename = location.pathname.toLowerCase().indexOf(basename.toLowerCase()) === 0;

		location = (0, _extends3.default)({}, location, {
			basename: basename,
			// If `location.pathname` starts with `basename` then strip it
			pathname: starts_with_basename ? location.pathname.substring(basename.length) || '/' : location.pathname
		});
	}

	return location;
}
//# sourceMappingURL=location.js.map