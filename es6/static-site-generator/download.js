import _Promise from 'babel-runtime/core-js/promise';
import http from 'http';
import https from 'https';

// Downloads a URL resolving to its text contents
export default function download(url) {
	return new _Promise(function (resolve, reject) {
		var request = (url.indexOf('https://') === 0 ? https : http).request(url, function (response) {
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