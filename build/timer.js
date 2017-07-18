'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = timer;
// Measures time taken in milliseconds
function timer() {
	var started_at = void 0;

	// System nanosecond high-precision time
	if (typeof process.hrtime === 'function') {
		started_at = process.hrtime();
	}
	// Usual millisecond time
	else {
			started_at = Date.now();
		}

	// Stops the timer
	return function stop() {
		// System nanosecond high-precision time
		if (typeof process.hrtime === 'function') {
			var stopped_at = process.hrtime();

			var seconds = stopped_at[0] - started_at[0];
			var nanos = stopped_at[1] - started_at[1];

			// Convert time to milliseconds
			return seconds * 1000 + nanos / 1000000;
		}

		// Usual millisecond time
		return Date.now() - started_at;
	};
}
//# sourceMappingURL=timer.js.map