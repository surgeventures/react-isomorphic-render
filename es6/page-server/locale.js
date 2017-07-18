var locale_key = 'locale';

// Based on `koa-locale`
// https://github.com/koa-modules/locale/blob/master/index.js
export function get_preferred_locales(ctx) {
	var locales = [];

	var locale_from_query = getLocaleFromQuery(ctx);
	if (locale_from_query) {
		locales.push(locale_from_query);
	}

	var locale_from_cookie = getLocaleFromCookie(ctx);
	if (locale_from_cookie) {
		locales.push(locale_from_cookie);
	}

	locales = locales.concat(getLocalesFromHeader(ctx));

	return locales;
}

// From query, `locale=en`
function getLocaleFromQuery(ctx) {
	return ctx.query[locale_key];
}

// From accept-language, `Accept-Language: zh-CN`
function getLocalesFromHeader(ctx) {
	var accepts = ctx.acceptsLanguages() || '';

	// E.g. "Accept-Language": "da, en-gb;q=0.8, en;q=0.7"
	var regular_expression = /(^|,\s*)(?:([a-z]{1,8})(-[A-z]{1,8})?)/g;

	var locales = [];

	var match = void 0;
	// Terminates at 10 preferred locales max
	// (to protect from a possible overflow attack)
	while (locales.length < 10 && (match = regular_expression.exec(accepts))) {
		var locale = match[2];

		if (match.length > 3 && match[3]) {
			locale += match[3].toUpperCase();
		}

		locales.push(locale);
	}

	return locales;
}

// From cookie, `locale=zh-CN`
function getLocaleFromCookie(ctx) {
	return ctx.cookies.get(locale_key);
}
//# sourceMappingURL=locale.js.map