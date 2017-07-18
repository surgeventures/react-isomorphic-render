'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// Polyfill for creating CustomEvents on IE9/10/11

var CustomEvent = typeof window !== 'undefined' ? window.CustomEvent : undefined;

try {
	var event = new CustomEvent('test');
	event.preventDefault();
	if (event.defaultPrevented !== true) {
		// IE has problems with .preventDefault() on custom events
		// http://stackoverflow.com/questions/23349191
		throw new Error('Could not prevent default');
	}
} catch (error) {
	// If `CustomEvent` misbehaves (or is absent)
	// then create it from scratch.
	CustomEvent = function CustomEvent(event_name, options) {
		options = options || {
			bubbles: false,
			cancelable: false,
			detail: undefined

			// IE 11 way of creating a `CustomEvent`
		};var event = document.createEvent('CustomEvent');
		event.initCustomEvent(event_name, options.bubbles, options.cancelable, options.detail);

		// Add `defaultPrevented` flag to the event
		var preventDefault = event.preventDefault;
		event.preventDefault = function () {
			preventDefault.call(this);

			try {
				Object.defineProperty(this, 'defaultPrevented', {
					get: function get() {
						return true;
					}
				});
			} catch (error) {
				this.defaultPrevented = true;
			}
		};

		return event;
	};

	if (typeof window !== 'undefined') {
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
}

exports.default = CustomEvent;
//# sourceMappingURL=custom event.js.map