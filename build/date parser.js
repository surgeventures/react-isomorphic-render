'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ISO_date_matcher = exports.ISO_date_regexp = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.default = parse_dates;

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ISO 8601 date regular expression
// Adapted from: http://stackoverflow.com/a/14322189/970769

var hours = '([01]\\d|2[0-3])';
var minutes = '[0-5]\\d';
var midnight_weird = '24\\:00';
var seconds = '[0-5]\\d';
var milliseconds = '\\d+';
var time = '(' + hours + '\\:' + minutes + '|' + midnight_weird + ')\\:' + seconds + '([\\.,]' + milliseconds + ')?';

var timezone_hours = '([01]\\d|2[0-3])';
var timezone_minutes = '[0-5]\\d';
var timezone = '([zZ]|([\\+-])' + timezone_hours + '\\:?(' + timezone_minutes + ')?)';

var year = '\\d{4}';
var month = '(0[1-9]|1[0-2])';
var day = '([12]\\d|0[1-9]|3[01])';

var ISO_date_regexp = exports.ISO_date_regexp = year + '-' + month + '-' + day + 'T' + time + timezone;
var ISO_date_matcher = exports.ISO_date_matcher = new RegExp('^' + ISO_date_regexp + '$');

// JSON date deserializer.
//
// Automatically converts ISO serialized `Date`s
// in JSON responses for Ajax HTTP requests.
//
// Without it the developer would have to convert
// `Date` strings to `Date`s in Ajax HTTP responses manually.
//
// Use as the second, 'reviver' argument to `JSON.parse`: `JSON.parse(json, JSON.date_parser)`
//
// http://stackoverflow.com/questions/14488745/javascript-json-date-deserialization/23691273#23691273

// Walks JSON object tree
function parse_dates(object) {
	// If it's a date in an ISO string format, then parse it
	if (typeof object === 'string' && ISO_date_matcher.test(object)) {
		return new Date(object);
	}
	// If an array is encountered, 
	// proceed recursively with each element of this array.
	else if (object instanceof Array) {
			var i = 0;
			while (i < object.length) {
				object[i] = parse_dates(object[i]);
				i++;
			}
		}
		// If a child JSON object is encountered,
		// convert all of its `Date` string values to `Date`s,
		// and proceed recursively for all of its properties.
		else if ((0, _helpers.is_object)(object)) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(object)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var key = _step.value;

						// proceed recursively
						object[key] = parse_dates(object[key]);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}

	// Dates have been converted for this JSON object
	return object;
}
//# sourceMappingURL=date parser.js.map