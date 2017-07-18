'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = S3Uploader;

var _s = require('s3');

var _s2 = _interopRequireDefault(_s);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function S3Uploader(_ref) {
	var accessKeyId = _ref.accessKeyId,
	    secretAccessKey = _ref.secretAccessKey,
	    region = _ref.region,
	    bucket = _ref.bucket;

	return function upload(directory, _ref2) {
		var started = _ref2.started,
		    progress = _ref2.progress;

		var params = {
			localDir: directory,
			deleteRemoved: true, // default false, whether to remove s3 objects
			s3Params: {
				Bucket: bucket
			}
		};

		var s3Client = _s2.default.createClient({
			maxAsyncS3: 20, // this is the default
			s3RetryCount: 3, // this is the default
			s3RetryDelay: 1000, // this is the default
			multipartUploadThreshold: 20971520, // this is the default (20 MB)
			multipartUploadSize: 15728640, // this is the default (15 MB)
			s3Options: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
				region: region
			}
		});

		var uploader = s3Client.uploadDir(params);

		var initialized = false;

		uploader.on('progress', function () {
			if (!initialized && uploader.progressMd5Total) {
				started(uploader.progressMd5Total);
				initialized = true;
			}
			if (initialized) {
				progress(uploader.progressMd5Amount / uploader.progressMd5Total);
			}
		});

		return new _promise2.default(function (resolve, reject) {
			uploader.on('end', resolve);
			uploader.on('error', reject);
		});
	};
}
//# sourceMappingURL=s3.js.map