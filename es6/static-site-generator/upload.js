import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import progress from 'progress';

export default (function () {
	var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(output, upload) {
		var upload_progress;
		return _regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						upload_progress = void 0;
						_context.next = 3;
						return upload(output, {
							started: function started(total) {
								upload_progress = new progress('  Uploading [:bar] :percent :etas', {
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
})();
//# sourceMappingURL=upload.js.map