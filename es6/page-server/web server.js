import _extends from 'babel-runtime/helpers/extends';
import _getIterator from 'babel-runtime/core-js/get-iterator';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import koa from 'koa';

import render_page from './render';
import { get_preferred_locales } from './locale';
import render_stack_trace from './html stack trace';

import timer from '../timer';

export default function start_webpage_rendering_server(settings, options) {
	var _this = this;

	var assets = options.assets,
	    localize = options.localize,
	    application = options.application,
	    authentication = options.authentication,
	    render = options.render,
	    loading = options.loading,
	    stats = options.stats,
	    html = options.html,
	    initialize = options.initialize;


	var web = new koa();

	// Handles errors
	web.use(function () {
		var _ref = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(ctx, next) {
			var _render_stack_trace, response_status, response_body;

			return _regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.prev = 0;
							_context.next = 3;
							return next();

						case 3:
							_context.next = 25;
							break;

						case 5:
							_context.prev = 5;
							_context.t0 = _context['catch'](0);

							if (!(process.env.NODE_ENV !== 'production')) {
								_context.next = 21;
								break;
							}

							_context.prev = 8;
							_render_stack_trace = render_stack_trace(_context.t0, options.print_error), response_status = _render_stack_trace.response_status, response_body = _render_stack_trace.response_body;

							if (!response_body) {
								_context.next = 15;
								break;
							}

							ctx.status = response_status || 500;
							ctx.body = response_body;
							ctx.type = 'html';

							return _context.abrupt('return');

						case 15:
							_context.next = 21;
							break;

						case 17:
							_context.prev = 17;
							_context.t1 = _context['catch'](8);

							console.log('(couldn\'t render error stack trace)');
							console.log(_context.t1.stack || _context.t1);

						case 21:

							// log the error
							console.log('[react-isomorphic-render] Webpage rendering server error');

							if (options.log) {
								options.log.error(_context.t0);
							}

							ctx.status = typeof _context.t0.status === 'number' ? _context.t0.status : 500;
							ctx.message = _context.t0.message || 'Internal error';

						case 25:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, _this, [[0, 5], [8, 17]]);
		}));

		return function (_x, _x2) {
			return _ref.apply(this, arguments);
		};
	}());

	// Custom Koa middleware extension point
	// (if someone ever needs this)
	if (options.middleware) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = _getIterator(options.middleware), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var middleware = _step.value;

				web.use(middleware);
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
	}

	// Isomorphic rendering
	web.use(function () {
		var _ref2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(ctx) {
			var url, total_timer, _ref3, status, content, redirect, route, time, afterwards;

			return _regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							// Trims a question mark in the end (just in case)
							url = ctx.request.originalUrl.replace(/\?$/, '');
							total_timer = timer();
							_context2.next = 4;
							return render_page(settings, {
								application: application,
								assets: assets,
								initialize: initialize,
								localize: localize ? function (parameters) {
									return localize(parameters, get_preferred_locales(ctx));
								} : undefined,
								render: render,
								loading: loading,
								html: html,
								authentication: authentication,

								// The original HTTP request can be required
								// for inspecting cookies in `preload` function
								request: ctx.req,

								// Cookies for protected cookie value retrieval
								cookies: ctx.cookies
							});

						case 4:
							_ref3 = _context2.sent;
							status = _ref3.status;
							content = _ref3.content;
							redirect = _ref3.redirect;
							route = _ref3.route;
							time = _ref3.time;
							afterwards = _ref3.afterwards;


							// Can add `Set-Cookie` headers, for example.
							if (afterwards) {
								afterwards(ctx);
							}

							if (!redirect) {
								_context2.next = 14;
								break;
							}

							return _context2.abrupt('return', ctx.redirect(redirect));

						case 14:

							if (status) {
								ctx.status = status;
							}

							ctx.body = content;

							if (stats) {
								stats({
									url: ctx.path + (ctx.querystring ? '?' + ctx.querystring : ''),
									route: route,
									time: _extends({}, time, {
										total: total_timer()
									})
								});
							}

						case 17:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, _this);
		}));

		return function (_x3) {
			return _ref2.apply(this, arguments);
		};
	}());

	return web;
}
//# sourceMappingURL=web server.js.map