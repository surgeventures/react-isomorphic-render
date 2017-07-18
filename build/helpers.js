'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.exists = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.is_object = is_object;
exports.extend = extend;
exports.merge = merge;
exports.clone = clone;
exports.convert_from_camel_case = convert_from_camel_case;
exports.replace_all = replace_all;
exports.starts_with = starts_with;
exports.ends_with = ends_with;
exports.is_empty = is_empty;
exports.not_empty = not_empty;
exports.repeat = repeat;
exports.is_blank = is_blank;
exports.zip = zip;
exports.get_language_from_locale = get_language_from_locale;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// // if the variable is defined
var exists = exports.exists = function exists(what) {
	return typeof what !== 'undefined';
};

// used for JSON object type checking
var object_constructor = {}.constructor;

// detects a JSON object
function is_object(object) {
	return exists(object) && object !== null && object.constructor === object_constructor;
}

// extends the first object with 
/* istanbul ignore next: some weird transpiled code, not testable */
function extend() {
	for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
		objects[_key] = arguments[_key];
	}

	objects = objects.filter(function (x) {
		return exists(x);
	});

	if (objects.length === 0) {
		return;
	}

	if (objects.length === 1) {
		return objects[0];
	}

	var to = objects[0];
	var from = objects[1];

	if (objects.length > 2) {
		var last = objects.pop();
		var intermediary_result = extend.apply(this, objects);
		return extend(intermediary_result, last);
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(from)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var key = _step.value;

			if (is_object(from[key])) {
				if (!is_object(to[key])) {
					to[key] = {};
				}

				extend(to[key], from[key]);
			} else if (Array.isArray(from[key])) {
				if (!Array.isArray(to[key])) {
					to[key] = [];
				}

				to[key] = to[key].concat(clone(from[key]));
			} else {
				to[key] = from[key];
			}
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

	return to;
}

function merge() {
	var parameters = Array.prototype.slice.call(arguments, 0);
	parameters.unshift({});
	return extend.apply(this, parameters);
}

function clone(object) {
	if (is_object(object)) {
		return merge({}, object);
	} else if (Array.isArray(object)) {
		return object.map(function (x) {
			return clone(x);
		});
	} else {
		return object;
	}
}

// creates camelCased aliases for all the keys of an object
function convert_from_camel_case(object) {
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = (0, _getIterator3.default)((0, _keys2.default)(object)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var key = _step2.value;

			if (/[A-Z]/.test(key))
				// if (key.indexOf('_') >= 0)
				{
					// const camel_cased_key = key.replace(/_(.)/g, function(match, group_1)
					// {
					// 	return group_1.toUpperCase()
					// })

					// if (!exists(object[camel_cased_key]))
					// {
					// 	object[camel_cased_key] = object[key]
					// 	delete object[key]
					// }

					var lo_dashed_key = key.replace(/([A-Z])/g, function (match, group_1) {
						return '_' + group_1.toLowerCase();
					});

					if (!exists(object[lo_dashed_key])) {
						object[lo_dashed_key] = object[key];
						delete object[key];
					}
				}
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	return object;
}

function escape_regexp(string) {
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", 'g');
	return string.replace(specials, "\\$&");
}

function replace_all(where, what, with_what) {
	var regexp = new RegExp(escape_regexp(what), 'g');
	return where.replace(regexp, with_what);
}

function starts_with(string, substring) {
	return string.indexOf(substring) === 0;
}

function ends_with(string, substring) {
	var i = string.length;
	var j = substring.length;

	if (j > i) {
		return false;
	}

	while (j > 0) {
		i--;
		j--;

		if (string[i] !== substring[j]) {
			return false;
		}
	}

	return true;

	// const index = string.lastIndexOf(substring)
	// return index >= 0 && index === string.length - substring.length
}

function is_empty(array) {
	return array.length === 0;
}

function not_empty(array) {
	return array.length > 0;
}

// repeat string N times
function repeat(what, times) {
	var result = '';
	while (times > 0) {
		result += what;
		times--;
	}
	return result;
}

// if the text is blank
function is_blank(text) {
	return !exists(text) || !text.replace(/\s/g, '');
}

// zips two arrays
function zip(a, b) {
	return a.map(function (_, index) {
		return [a[index], b[index]];
	});
}

function get_language_from_locale(locale) {
	var dash_index = locale.indexOf('-');
	if (dash_index >= 0) {
		return locale.substring(0, dash_index);
	}
	return locale;
}
//# sourceMappingURL=helpers.js.map