'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = IndexLink;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Link = require('./Link');

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function IndexLink(props) {
	return _react2.default.createElement(_Link2.default, (0, _extends3.default)({}, props, { onlyActiveOnIndex: true }));
}
//# sourceMappingURL=IndexLink.js.map