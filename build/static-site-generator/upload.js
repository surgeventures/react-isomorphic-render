'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
	var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(output, upload) {
		var upload_progress;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						upload_progress = void 0;
						_context.next = 3;
						return upload(output, {
							started: function started(total) {
								upload_progress = new _progress2.default('  Uploading [:bar] :percent :etas', {
									width: 50,
									total: total
								});
							},
							progress: function progress(value) {
								upload_progress.update(value);
							}
						});

					case 3:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	function upload_website(_x, _x2) {
		return _ref.apply(this, arguments);
	}

	return upload_website;
}();
//# sourceMappingURL=upload.js.map