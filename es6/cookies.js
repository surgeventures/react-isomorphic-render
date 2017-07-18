// https://learn.javascript.ru/cookie
export function get_cookie_in_a_browser(name) {
	var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));

	if (matches) {
		return decodeURIComponent(matches[1]);
	}
}
//# sourceMappingURL=cookies.js.map