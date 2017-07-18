'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = Html;
exports.safe_json_stringify = safe_json_stringify;

var _nunjucks = require('nunjucks');

var _nunjucks2 = _interopRequireDefault(_nunjucks);

var _webpageHead = require('../webpage head');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_nunjucks2.default.configure({ autoescape: true });

function Html(options) {
	var assets = options.assets;


	var style_urls = [];
	var javascript_urls = [];

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = (0, _getIterator3.default)(assets.entries), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var entry = _step.value;

			if (assets.styles && assets.styles[entry]) {
				style_urls.push(assets.styles[entry]);
			}

			if (assets.javascript && assets.javascript[entry]) {
				javascript_urls.push(assets.javascript[entry]);
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var webpage_head = (0, _webpageHead.server_side_generated_webpage_head)();

	return template.render((0, _extends3.default)({}, options, {
		webpage_head: webpage_head,
		style_urls: style_urls,
		javascript_urls: javascript_urls,
		get_language_from_locale: _helpers.get_language_from_locale,
		safe_json_stringify: safe_json_stringify,
		JSON: JSON
	}));
}

function safe_json_stringify(json) {
	// The default javascript JSON.stringify doesn't escape forward slashes,
	// but it is allowed by the JSON specification, so we manually do it here.
	// (and javascript regular expressions don't support "negative lookbehind"
	//  so it's simply replacing all forward slashes with escaped ones,
	//  but also make sure to not call it twice on the same JSON)
	return (0, _stringify2.default)(json).replace(/\//g, '\\/');
}

var template = _nunjucks2.default.compile('\n\t<html {{ webpage_head.htmlAttributes.toString() }} {% if locale %} lang="{{get_language_from_locale(locale)}}" {% endif %}>\n\t\t<head>\n\t\t\t{# "react-helmet" stuff #}\n\t\t\t{{ webpage_head.title.toString() | safe }}\n\t\t\t{{ webpage_head.meta.toString()  | safe }}\n\t\t\t{{ webpage_head.link.toString()  | safe }}\n\n\t\t\t{#\n\t\t\t\t(will be done only in production mode\n\t\t\t\t with webpack extract text plugin) \n\t\t\t\tMount CSS stylesheets for all entry points (e.g. "main")\n\t\t\t#}\n\t\t\t{% for style_url in style_urls %}\n\t\t\t\t<link\n\t\t\t\t\thref="{{ style_url | safe }}"\n\t\t\t\t\trel="stylesheet"\n\t\t\t\t\ttype="text/css"\n\t\t\t\t\tcharset="UTF-8"/>\n\t\t\t{% endfor %}\n\n\t\t\t{# Custom <head/> markup #}\n\t\t\t{{ head | safe }}\n\n\t\t\t{# Site icon #}\n\t\t\t{% if assets.icon %}\n\t\t\t\t<link rel="shortcut icon" href="{{ assets.icon | safe }}"/>\n\t\t\t{% endif %}\n\t\t</head>\n\n\t\t<body>\n\t\t\t{# Supports adding arbitrary markup to <body/> start #}\n\t\t\t{{ body_start | safe }}\n\n\t\t\t{# \n\t\t\t\tReact page content.\n\t\t\t\t(most of the possible XSS attack scripts are executed here,\n\t\t\t\t before the global protected cookie value variable is set,\n\t\t\t\t so they\'re unlikely to even be able to hijack it)\n\t\t\t#}\n\t\t\t<div id="react">\n\t\t\t\t{{- content | safe -}}\n\t\t\t</div>\n\n\t\t\t{#\n\t\t\t\tLocale for international messages\n\t\t\t\t(is only used in client-side Ajax "translate"\n\t\t\t\t the existence of which is questionable).\n\t\t\t#}\n\t\t\t{% if locale %}\n\t\t\t\t<script>\n\t\t\t\t\twindow._locale = {{ safe_json_stringify(locale) | safe }}\n\t\t\t\t</script>\n\t\t\t{% endif %}\n\n\t\t\t{#\n\t\t\t\tLocalized messages.\n\t\t\t\tThe value must be XSS-safe.\n\t\t\t#}\n\t\t\t{% if locale %}\n\t\t\t\t<script>\n\t\t\t\t\twindow._locale_messages = {{ locale_messages_json | safe }}\n\t\t\t\t</script>\n\t\t\t{% endif %}\n\n\t\t\t{# Custom javascript. Must be XSS-safe. #}\n\t\t\t{# e.g. Redux stuff goes here (Redux state, Date parser) #}\n\t\t\t{% if extension_javascript %}\n\t\t\t\t{{ extension_javascript | safe }}\n\t\t\t{% endif %}\n\n\t\t\t{# javascripts #}\n\n\t\t\t{#\n\t\t\t\tMake protected cookie value visible to the client-side code\n\t\t\t\tto set up the "http" utility used inside Redux actions.\n\t\t\t\t(the client-side React initialization code will\n\t\t\t\t automatically erase this protected cookie value global variable\n\t\t\t\t to protect the user from session hijacking via an XSS attack)\n\t\t\t#}\n\t\t\t{% if protected_cookie_value %}\n\t\t\t\t<script data-protected-cookie>\n\t\t\t\t\twindow._protected_cookie_value={{ safe_json_stringify(protected_cookie_value) | safe }}\n\t\t\t\t</script>\n\t\t\t{% endif %}\n\n\t\t\t{#\n\t\t\t\tRemove the <script/> tag above as soon as it executes\n\t\t\t\tto prevent potentially exposing protected cookie value during an XSS attack.\n\t\t\t#}\n\t\t\t{% if protected_cookie_value %}\n\t\t\t\t<script>\n\t\t\t\t\tdocument.body.removeChild(document.querySelector(\'script[data-protected-cookie]\'))\n\t\t\t\t</script>\n\t\t\t{% endif %}\n\n\t\t\t{#\n\t\t\t\tInclude all required "entry" points javascript\n\t\t\t\t(e.g. "common", "main")\n\t\t\t#}\n\t\t\t{% for javascript_url in javascript_urls %}\n\t\t\t\t<script src="{{ javascript_url | safe }}" charset="UTF-8"></script>\n\t\t\t{% endfor %}\n\n\t\t\t{# Supports adding arbitrary markup to <body/> end #}\n\t\t\t{{ body_end | safe }}\n\t\t</body>\n\t</html>\n'.replace(/\t/g, ''));
//# sourceMappingURL=html.js.map