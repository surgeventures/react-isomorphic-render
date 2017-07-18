'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.get_cookie_in_a_browser = get_cookie_in_a_browser;
// https://learn.javascript.ru/cookie
function get_cookie_in_a_browser(name) {
	var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));

	if (matches) {
		return decodeURIComponent(matches[1]);
	}
}
//# sourceMappingURL=cookies.js.map