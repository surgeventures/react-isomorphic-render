'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = RobustWebSocket;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://github.com/appuri/robust-websocket/blob/master/robust-websocket.js
// A copy from January 25th 2017.
// 
// Rewriting with a proper ES6 export
// https://github.com/appuri/robust-websocket/issues/9

function RobustWebSocket(url, protocols, userOptions) {
  var realWs = { close: function close() {} },
      connectTimeout,
      self = this,
      attempts = 0,
      reconnects = -1,
      reconnectWhenOnlineAgain = false,
      explicitlyClosed = false,
      pendingReconnect,
      opts = (0, _assign2.default)({}, RobustWebSocket.defaultOptions, typeof userOptions === 'function' ? { shouldReconnect: userOptions } : userOptions);

  if (typeof opts.timeout !== 'number') {
    throw new Error('timeout must be the number of milliseconds to timeout a connection attempt');
  }

  if (typeof opts.shouldReconnect !== 'function') {
    throw new Error('shouldReconnect must be a function that returns the number of milliseconds to wait for a reconnect attempt, or null or undefined to not reconnect.');
  }

  ['bufferedAmount', 'url', 'readyState', 'protocol', 'extensions'].forEach(function (readOnlyProp) {
    (0, _defineProperty2.default)(self, readOnlyProp, {
      get: function get() {
        return realWs[readOnlyProp];
      }
    });
  });

  function clearPendingReconnectIfNeeded() {
    if (pendingReconnect) {
      pendingReconnect = null;
      clearTimeout(pendingReconnect);
    }
  }

  var ononline = function ononline(event) {
    if (reconnectWhenOnlineAgain) {
      clearPendingReconnectIfNeeded();
      reconnect(event);
    }
  },
      onoffline = function onoffline() {
    reconnectWhenOnlineAgain = true;
    realWs.close(1000);
  },
      connectivityEventsAttached = false;

  function detachConnectivityEvents() {
    if (connectivityEventsAttached) {
      window.removeEventListener('online', ononline);
      window.removeEventListener('offline', onoffline);
      connectivityEventsAttached = false;
    }
  }

  function attachConnectivityEvents() {
    if (!connectivityEventsAttached) {
      window.addEventListener('online', ononline);
      window.addEventListener('offline', onoffline);
      connectivityEventsAttached = true;
    }
  }

  self.send = function () {
    return realWs.send.apply(realWs, arguments);
  };

  self.close = function (code, reason) {
    if (typeof code !== 'number') {
      reason = code;
      code = 1000;
    }

    clearPendingReconnectIfNeeded();
    reconnectWhenOnlineAgain = false;
    explicitlyClosed = true;
    detachConnectivityEvents();

    return realWs.close(code, reason);
  };

  self.open = function () {
    if (realWs.readyState !== WebSocket.OPEN && realWs.readyState !== WebSocket.CONNECTING) {
      clearPendingReconnectIfNeeded();
      reconnectWhenOnlineAgain = false;
      explicitlyClosed = false;

      newWebSocket();
    }
  };

  function reconnect(event) {
    if (event.code === 1000 || explicitlyClosed) {
      attempts = 0;
      return;
    }
    if (navigator.onLine === false) {
      reconnectWhenOnlineAgain = true;
      return;
    }

    var delay = opts.shouldReconnect(event, self);
    if (typeof delay === 'number') {
      pendingReconnect = setTimeout(newWebSocket, delay);
    }
  }

  Object.defineProperty(self, 'listeners', {
    value: {
      open: [function (event) {
        if (connectTimeout) {
          clearTimeout(connectTimeout);
          connectTimeout = null;
        }
        event.reconnects = ++reconnects;
        event.attempts = attempts;
        attempts = 0;
        reconnectWhenOnlineAgain = false;
      }],
      close: [reconnect]
    }
  });

  Object.defineProperty(self, 'attempts', {
    get: function get() {
      return attempts;
    },
    enumerable: true
  });

  Object.defineProperty(self, 'reconnects', {
    get: function get() {
      return reconnects;
    },
    enumerable: true
  });

  function newWebSocket() {
    pendingReconnect = null;
    realWs = new WebSocket(url, protocols);
    realWs.binaryType = self.binaryType;

    attempts++;
    self.dispatchEvent((0, _assign2.default)(new CustomEvent('connecting'), {
      attempts: attempts,
      reconnects: reconnects
    }));

    connectTimeout = setTimeout(function () {
      connectTimeout = null;
      detachConnectivityEvents();
      self.dispatchEvent((0, _assign2.default)(new CustomEvent('timeout'), {
        attempts: attempts,
        reconnects: reconnects
      }));
    }, opts.timeout);['open', 'close', 'message', 'error'].forEach(function (stdEvent) {
      realWs.addEventListener(stdEvent, function (event) {
        self.dispatchEvent(event);

        var cb = self['on' + stdEvent];
        if (typeof cb === 'function') {
          return cb.apply(self, arguments);
        }
      });
    });

    attachConnectivityEvents();
  }

  if (opts.automaticOpen) {
    newWebSocket();
  }
}

RobustWebSocket.defaultOptions = {
  // the time to wait before a successful connection
  // before the attempt is considered to have timed out
  timeout: 4000,
  // Given a CloseEvent or OnlineEvent and the RobustWebSocket state,
  // should a reconnect be attempted? Return the number of milliseconds to wait
  // to reconnect (or null or undefined to not), rather than true or false
  shouldReconnect: function shouldReconnect(event, ws) {
    if (event.code === 1008 || event.code === 1011) return;
    return [0, 3000, 10000][ws.attempts];
  },

  // Create and connect the WebSocket when the instance is instantiated.
  // Defaults to true to match standard WebSocket behavior
  automaticOpen: true
};

RobustWebSocket.prototype.binaryType = 'blob';

// Taken from MDN https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
RobustWebSocket.prototype.addEventListener = function (type, callback) {
  if (!(type in this.listeners)) {
    this.listeners[type] = [];
  }
  this.listeners[type].push(callback);
};

RobustWebSocket.prototype.removeEventListener = function (type, callback) {
  if (!(type in this.listeners)) {
    return;
  }
  var stack = this.listeners[type];
  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback) {
      stack.splice(i, 1);
      return;
    }
  }
};

RobustWebSocket.prototype.dispatchEvent = function (event) {
  if (!(event.type in this.listeners)) {
    return;
  }
  // https://github.com/appuri/robust-websocket/issues/10
  // event.currentTarget = this
  var stack = this.listeners[event.type];
  for (var i = 0, l = stack.length; i < l; i++) {
    stack[i].call(this, event);
  }
};
//# sourceMappingURL=robust-websocket.js.map