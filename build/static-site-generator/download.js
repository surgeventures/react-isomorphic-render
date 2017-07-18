'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = download;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Downloads a URL resolving to its text contents
function download(url) {
	return new _promise2.default(function (resolve, reject) {
		var request = (url.indexOf('https://') === 0 ? _https2.default : _http2.default).request(url, function (response) {
			response.setEncoding('utf8');

			var response_body = '';
			response.on('data', function (chunk) {
				return response_body += chunk;
			});
			response.on('end', function () {
				return resolve(response_body);
			});
		});

		request.on('error', reject);
		request.end();
	});
}
//# sourceMappingURL=download.js.map