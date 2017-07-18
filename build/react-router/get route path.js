'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = get_route_path;
// Concatenated `react-router` route string.
// E.g. "/user/:user_id/post/:post_id"
function get_route_path(router_state) {
	return router_state.routes.filter(function (route) {
		return route.path;
	}).map(function (route) {
		return route.path.replace(/^\//, '').replace(/\/$/, '');
	}).join('/') || '/';
}
//# sourceMappingURL=get route path.js.map