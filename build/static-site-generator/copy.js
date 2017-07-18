'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = copy;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copies a file or a folder
function copy(from, to) {
	return new _promise2.default(function (resolve, reject) {
		_fsExtra2.default.copy(from, to, function (error) {
			if (error) {
				return reject(error);
			}

			resolve();
		});
	});
}
//# sourceMappingURL=copy.js.map