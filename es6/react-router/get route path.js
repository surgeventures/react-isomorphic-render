// Concatenated `react-router` route string.
// E.g. "/user/:user_id/post/:post_id"
export default function get_route_path(router_state) {
	return router_state.routes.filter(function (route) {
		return route.path;
	}).map(function (route) {
		return route.path.replace(/^\//, '').replace(/\/$/, '');
	}).join('/') || '/';
}
//# sourceMappingURL=get route path.js.map