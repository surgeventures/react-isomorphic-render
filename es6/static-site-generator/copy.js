import _Promise from 'babel-runtime/core-js/promise';
import fs from 'fs-extra';

// Copies a file or a folder
export default function copy(from, to) {
	return new _Promise(function (resolve, reject) {
		fs.copy(from, to, function (error) {
			if (error) {
				return reject(error);
			}

			resolve();
		});
	});
}
//# sourceMappingURL=copy.js.map