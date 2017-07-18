'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var snapshot = function () {
	var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(host, port, pages, output, tick) {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, page, page_contents;

		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						// Clear the output folder
						_fsExtra2.default.removeSync(output);

						// Snapshot every page and put it into the output folder
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context2.prev = 4;
						_iterator = (0, _getIterator3.default)(pages);

					case 6:
						if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
							_context2.next = 16;
							break;
						}

						page = _step.value;
						_context2.next = 10;
						return (0, _download2.default)('http://' + host + ':' + port + page);

					case 10:
						page_contents = _context2.sent;

						_fsExtra2.default.outputFileSync(_path2.default.join(output, page, '/index.html'), page_contents);
						tick();

					case 13:
						_iteratorNormalCompletion = true;
						_context2.next = 6;
						break;

					case 16:
						_context2.next = 22;
						break;

					case 18:
						_context2.prev = 18;
						_context2.t0 = _context2['catch'](4);
						_didIteratorError = true;
						_iteratorError = _context2.t0;

					case 22:
						_context2.prev = 22;
						_context2.prev = 23;

						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}

					case 25:
						_context2.prev = 25;

						if (!_didIteratorError) {
							_context2.next = 28;
							break;
						}

						throw _iteratorError;

					case 28:
						return _context2.finish(25);

					case 29:
						return _context2.finish(22);

					case 30:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this, [[4, 18, 22, 30], [23,, 25, 29]]);
	}));

	return function snapshot(_x2, _x3, _x4, _x5, _x6) {
		return _ref3.apply(this, arguments);
	};
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _download = require('./download');

var _download2 = _interopRequireDefault(_download);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Snapshots all pages (URLs)
exports.default = function () {
	var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
		var host = _ref2.host,
		    port = _ref2.port,
		    pages = _ref2.pages,
		    output = _ref2.output;
		var snapshot_progress;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						// Add the main ("home") page
						pages.unshift('');

						// The progress meter for the website snapshotting process
						snapshot_progress = new _progress2.default(' Snapshotting [:bar] :total :percent :etas', {
							width: 50,
							total: pages.length
						});

						// Start the website snapshotting process

						_context.next = 4;
						return snapshot(host, port, pages, output, function progress_tick() {
							snapshot_progress.tick();
						});

					case 4:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	function snapshot_website(_x) {
		return _ref.apply(this, arguments);
	}

	return snapshot_website;
}();
//# sourceMappingURL=snapshot.js.map