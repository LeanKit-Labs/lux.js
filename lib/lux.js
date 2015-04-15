/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.7.1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2015 LeanKit
 */
"use strict";

// istanbul ignore next

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

// istanbul ignore next
var _slice = Array.prototype.slice;
// istanbul ignore next

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

// istanbul ignore next

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

// istanbul ignore next

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

// istanbul ignore next

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function (root, factory) {
	/* istanbul ignore next - don't test UMD wrapper */
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["postal", "machina", "lodash"], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node, or CommonJS-Like environments
		module.exports = factory(require("postal"), require("machina"), require("lodash"));
	} else {
		root.lux = factory(root.postal, root.machina, root._);
	}
})(undefined, function (postal, machina, _) {

	/* istanbul ignore next */
	if (!(typeof global === "undefined" ? window : global)._babelPolyfill) {
		throw new Error("You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details.");
	}

	var actionChannel = postal.channel("lux.action");
	var storeChannel = postal.channel("lux.store");
	var dispatcherChannel = postal.channel("lux.dispatcher");
	var stores = {};

	// jshint ignore:start
	var entries = regeneratorRuntime.mark(function entries(obj) {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, k;

		return regeneratorRuntime.wrap(function entries$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (["object", "function"].indexOf(typeof obj) === -1) {
						obj = {};
					}
					_iteratorNormalCompletion = true;
					_didIteratorError = false;
					_iteratorError = undefined;
					context$2$0.prev = 4;
					_iterator = Object.keys(obj)[Symbol.iterator]();

				case 6:
					if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
						context$2$0.next = 13;
						break;
					}

					k = _step.value;
					context$2$0.next = 10;
					return [k, obj[k]];

				case 10:
					_iteratorNormalCompletion = true;
					context$2$0.next = 6;
					break;

				case 13:
					context$2$0.next = 19;
					break;

				case 15:
					context$2$0.prev = 15;
					context$2$0.t0 = context$2$0["catch"](4);
					_didIteratorError = true;
					_iteratorError = context$2$0.t0;

				case 19:
					context$2$0.prev = 19;
					context$2$0.prev = 20;

					if (!_iteratorNormalCompletion && _iterator["return"]) {
						_iterator["return"]();
					}

				case 22:
					context$2$0.prev = 22;

					if (!_didIteratorError) {
						context$2$0.next = 25;
						break;
					}

					throw _iteratorError;

				case 25:
					return context$2$0.finish(22);

				case 26:
					return context$2$0.finish(19);

				case 27:
				case "end":
					return context$2$0.stop();
			}
		}, entries, this, [[4, 15, 19, 27], [20,, 22, 26]]);
	});
	// jshint ignore:end

	function configSubscription(context, subscription) {
		return subscription.context(context).constraint(function (data, envelope) {
			return !envelope.hasOwnProperty("originId") || envelope.originId === postal.instanceId();
		});
	}

	function ensureLuxProp(context) {
		var __lux = context.__lux = context.__lux || {};
		var cleanup = __lux.cleanup = __lux.cleanup || [];
		var subscriptions = __lux.subscriptions = __lux.subscriptions || {};
		return __lux;
	}

	var React;

	var extend = function extend() {
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}

		var parent = this;
		var store; // placeholder for instance constructor
		var storeObj = {}; // object used to hold initialState & states from prototype for instance-level merging
		var ctor = function ctor() {}; // placeholder ctor function used to insert level in prototype chain

		// First - separate mixins from prototype props
		var mixins = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var opt = _step.value;

				mixins.push(_.pick(opt, ["handlers", "state"]));
				delete opt.handlers;
				delete opt.state;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		var protoProps = _.merge.apply(this, [{}].concat(options));

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty("constructor")) {
			store = protoProps.constructor;
		} else {
			store = function () {
				var args = Array.from(arguments);
				args[0] = args[0] || {};
				parent.apply(this, store.mixins.concat(args));
			};
		}

		store.mixins = mixins;

		// Inherit class (static) properties from parent.
		_.merge(store, parent);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		store.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) {
			_.extend(store.prototype, protoProps);
		}

		// Correctly set child's `prototype.constructor`.
		store.prototype.constructor = store;

		// Set a convenience property in case the parent's prototype is needed later.
		store.__super__ = parent.prototype;
		return store;
	};

	var actions = Object.create(null);
	var actionGroups = {};

	function buildActionList(handlers) {
		var actionList = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = entries(handlers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);

				var key = _step$value[0];
				var handler = _step$value[1];

				actionList.push({
					actionType: key,
					waitFor: handler.waitFor || []
				});
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return actionList;
	}

	function publishAction(action) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		if (actions[action]) {
			actions[action].apply(actions, args);
		} else {
			throw new Error("There is no action named '" + action + "'");
		}
	}

	function generateActionCreator(actionList) {
		actionList = typeof actionList === "string" ? [actionList] : actionList;
		actionList.forEach(function (action) {
			if (!actions[action]) {
				actions[action] = function () {
					var args = Array.from(arguments);
					actionChannel.publish({
						topic: "execute." + action,
						data: {
							actionType: action,
							actionArgs: args
						}
					});
				};
			}
		});
	}

	function getActionGroup(group) {
		if (actionGroups[group]) {
			return _.pick(actions, actionGroups[group]);
		} else {
			throw new Error("There is no action group named '" + group + "'");
		}
	}

	function customActionCreator(action) {
		actions = Object.assign(actions, action);
	}

	function addToActionGroup(groupName, actionList) {
		var group = actionGroups[groupName];
		if (!group) {
			group = actionGroups[groupName] = [];
		}
		actionList = typeof actionList === "string" ? [actionList] : actionList;
		var diff = _.difference(actionList, Object.keys(actions));
		if (diff.length) {
			throw new Error("The following actions do not exist: " + diff.join(", "));
		}
		actionList.forEach(function (action) {
			if (group.indexOf(action) === -1) {
				group.push(action);
			}
		});
	}

	/*********************************************
 *                 Store Mixin                *
 **********************************************/
	function gateKeeper(store, data) {
		var payload = {};
		payload[store] = true;
		var __lux = this.__lux;

		var found = __lux.waitFor.indexOf(store);

		if (found > -1) {
			__lux.waitFor.splice(found, 1);
			__lux.heardFrom.push(payload);

			if (__lux.waitFor.length === 0) {
				__lux.heardFrom = [];
				this.stores.onChange.call(this, payload);
			}
		} else {
			this.stores.onChange.call(this, payload);
		}
	}

	function handlePreNotify(data) {
		var _this4 = this;

		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this4.stores.listenTo.indexOf(item) > -1;
		});
	}

	var luxStoreMixin = {
		setup: function setup() {
			var _this4 = this;

			var __lux = ensureLuxProp(this);
			var stores = this.stores = this.stores || {};

			if (!stores.listenTo || !stores.listenTo.length) {
				throw new Error("listenTo must contain at least one store namespace");
			}

			var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;

			if (!stores.onChange) {
				throw new Error("A component was told to listen to the following store(s): " + listenTo + " but no onChange handler was implemented");
			}

			__lux.waitFor = [];
			__lux.heardFrom = [];

			listenTo.forEach(function (store) {
				__lux.subscriptions["" + store + ".changed"] = storeChannel.subscribe("" + store + ".changed", function () {
					return gateKeeper.call(_this4, store);
				});
			});

			__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify.call(_this4, data);
			});
		},
		teardown: function teardown() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = entries(this.__lux.subscriptions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2);

					var key = _step$value[0];
					var sub = _step$value[1];

					var split;
					if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
						sub.unsubscribe();
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator["return"]) {
						_iterator["return"]();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		},
		mixin: {}
	};

	var luxStoreReactMixin = {
		componentWillMount: luxStoreMixin.setup,
		componentWillUnmount: luxStoreMixin.teardown
	};

	/*********************************************
 *           Action Creator Mixin          *
 **********************************************/

	var luxActionCreatorMixin = {
		setup: function setup() {
			var _this4 = this;

			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];

			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}

			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}

			var addActionIfNotPresent = function (k, v) {
				if (!_this4[k]) {
					_this4[k] = v;
				}
			};
			this.getActionGroup.forEach(function (group) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = entries(getActionGroup(group))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _step$value = _slicedToArray(_step.value, 2);

						var k = _step$value[0];
						var v = _step$value[1];

						addActionIfNotPresent(k, v);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator["return"]) {
							_iterator["return"]();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			});

			if (this.getActions.length) {
				this.getActions.forEach(function (key) {
					addActionIfNotPresent(key, function () {
						publishAction.apply(undefined, [key].concat(_slice.call(arguments)));
					});
				});
			}
		},
		mixin: {
			publishAction: publishAction
		}
	};

	var luxActionCreatorReactMixin = {
		componentWillMount: luxActionCreatorMixin.setup,
		publishAction: publishAction
	};

	/*********************************************
 *            Action Listener Mixin           *
 **********************************************/
	var luxActionListenerMixin = function luxActionListenerMixin() {
		var _ref = arguments[0] === undefined ? {} : arguments[0];

		var handlers = _ref.handlers;
		var handlerFn = _ref.handlerFn;
		var context = _ref.context;
		var channel = _ref.channel;
		var topic = _ref.topic;

		return {
			setup: function setup() {
				context = context || this;
				var __lux = ensureLuxProp(context);
				var subs = __lux.subscriptions;
				handlers = handlers || context.handlers;
				channel = channel || actionChannel;
				topic = topic || "execute.*";
				handlerFn = handlerFn || function (data, env) {
					var handler;
					if (handler = handlers[data.actionType]) {
						handler.apply(context, data.actionArgs);
					}
				};
				if (!handlers || !Object.keys(handlers).length) {
					throw new Error("You must have at least one action handler in the handlers property");
				} else if (subs && subs.actionListener) {
					// TODO: add console warn in debug builds
					// since we ran the mixin on this context already
					return;
				}
				subs.actionListener = configSubscription(context, channel.subscribe(topic, handlerFn));
				var handlerKeys = Object.keys(handlers);
				generateActionCreator(handlerKeys);
				if (context.namespace) {
					addToActionGroup(context.namespace, handlerKeys);
				}
			},
			teardown: function teardown() {
				this.__lux.subscriptions.actionListener.unsubscribe();
			} };
	};

	/*********************************************
 *   React Component Versions of Above Mixin  *
 **********************************************/
	function ensureReact(methodName) {
		if (typeof React === "undefined") {
			throw new Error("You attempted to use lux." + methodName + " without first calling lux.initReact( React );");
		}
	}

	function controllerView(options) {
		ensureReact("controllerView");
		var opt = {
			mixins: [luxStoreReactMixin, luxActionCreatorReactMixin].concat(options.mixins || [])
		};
		delete options.mixins;
		return React.createClass(Object.assign(opt, options));
	}

	function component(options) {
		ensureReact("component");
		var opt = {
			mixins: [luxActionCreatorReactMixin].concat(options.mixins || [])
		};
		delete options.mixins;
		return React.createClass(Object.assign(opt, options));
	}

	/*********************************************
 *   Generalized Mixin Behavior for non-lux   *
 **********************************************/
	var luxMixinCleanup = function luxMixinCleanup() {
		var _this4 = this;

		this.__lux.cleanup.forEach(function (method) {
			return method.call(_this4);
		});
		this.__lux.cleanup = undefined;
		delete this.__lux.cleanup;
	};

	function mixin(context) {
		for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			mixins[_key - 1] = arguments[_key];
		}

		if (mixins.length === 0) {
			mixins = [luxStoreMixin, luxActionCreatorMixin];
		}

		mixins.forEach(function (mixin) {
			if (typeof mixin === "function") {
				mixin = mixin();
			}
			if (mixin.mixin) {
				Object.assign(context, mixin.mixin);
			}
			if (typeof mixin.setup !== "function") {
				throw new Error("Lux mixins should have a setup method. Did you perhaps pass your mixins ahead of your target instance?");
			}
			mixin.setup.call(context);
			if (mixin.teardown) {
				context.__lux.cleanup.push(mixin.teardown);
			}
		});
		context.luxCleanup = luxMixinCleanup;
		return context;
	}

	mixin.store = luxStoreMixin;
	mixin.actionCreator = luxActionCreatorMixin;
	mixin.actionListener = luxActionListenerMixin;

	var reactMixin = {
		actionCreator: luxActionCreatorReactMixin,
		store: luxStoreReactMixin
	};

	function actionListener(target) {
		return mixin(target, luxActionListenerMixin);
	}

	function actionCreator(target) {
		return mixin(target, luxActionCreatorMixin);
	}

	function actionCreatorListener(target) {
		return actionCreator(actionListener(target));
	}

	function ensureStoreOptions(options, handlers, store) {
		var namespace = options && options.namespace || store.namespace;
		if (namespace in stores) {
			throw new Error("The store namespace \"" + namespace + "\" already exists.");
		}
		if (!namespace) {
			throw new Error("A lux store must have a namespace value provided");
		}
		if (!handlers || !Object.keys(handlers).length) {
			throw new Error("A lux store must have action handler methods provided");
		}
	}

	function getHandlerObject(handlers, key, listeners) {
		return {
			waitFor: [],
			handler: function handler() {
				var changed = 0;
				var args = Array.from(arguments);
				listeners[key].forEach((function (listener) {
					changed += listener.apply(this, args) === false ? 0 : 1;
				}).bind(this));
				return changed > 0;
			}
		};
	}

	function updateWaitFor(source, handlerObject) {
		if (source.waitFor) {
			source.waitFor.forEach(function (dep) {
				if (handlerObject.waitFor.indexOf(dep) === -1) {
					handlerObject.waitFor.push(dep);
				}
			});
		}
	}

	function addListeners(listeners, key, handler) {
		listeners[key] = listeners[key] || [];
		listeners[key].push(handler.handler || handler);
	}

	function processStoreArgs() {
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}

		var listeners = {};
		var handlers = {};
		var state = {};
		var otherOpts = {};
		options.forEach(function (o) {
			var opt;
			if (o) {
				opt = _.clone(o);
				_.merge(state, opt.state);
				if (opt.handlers) {
					Object.keys(opt.handlers).forEach(function (key) {
						var handler = opt.handlers[key];
						// set up the actual handler method that will be executed
						// as the store handles a dispatched action
						handlers[key] = handlers[key] || getHandlerObject(handlers, key, listeners);
						// ensure that the handler definition has a list of all stores
						// being waited upon
						updateWaitFor(handler, handlers[key]);
						// Add the original handler method(s) to the listeners queue
						addListeners(listeners, key, handler);
					});
				}
				delete opt.handlers;
				delete opt.state;
				_.merge(otherOpts, opt);
			}
		});
		return [state, handlers, otherOpts];
	}

	var Store = (function () {
		function Store() {
			for (var _len = arguments.length, opt = Array(_len), _key = 0; _key < _len; _key++) {
				opt[_key] = arguments[_key];
			}

			_classCallCheck(this, Store);

			var _processStoreArgs$apply = processStoreArgs.apply(undefined, opt);

			var _processStoreArgs$apply2 = _slicedToArray(_processStoreArgs$apply, 3);

			var state = _processStoreArgs$apply2[0];
			var handlers = _processStoreArgs$apply2[1];
			var options = _processStoreArgs$apply2[2];

			ensureStoreOptions(options, handlers, this);
			var namespace = options.namespace || this.namespace;
			Object.assign(this, options);
			stores[namespace] = this;
			var inDispatch = false;
			this.hasChanged = false;

			this.getState = function () {
				return state;
			};

			this.setState = function (newState) {
				if (!inDispatch) {
					throw new Error("setState can only be called during a dispatch cycle from a store action handler.");
				}
				state = Object.assign(state, newState);
			};

			this.replaceState = function (newState) {
				if (!inDispatch) {
					throw new Error("replaceState can only be called during a dispatch cycle from a store action handler.");
				}
				// we preserve the underlying state ref, but clear it
				Object.keys(state).forEach(function (key) {
					delete state[key];
				});
				state = Object.assign(state, newState);
			};

			this.flush = function flush() {
				inDispatch = false;
				if (this.hasChanged) {
					this.hasChanged = false;
					storeChannel.publish("" + this.namespace + ".changed");
				}
			};

			mixin(this, luxActionListenerMixin({
				context: this,
				channel: dispatcherChannel,
				topic: "" + namespace + ".handle.*",
				handlers: handlers,
				handlerFn: (function (data, envelope) {
					if (handlers.hasOwnProperty(data.actionType)) {
						inDispatch = true;
						var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
						this.hasChanged = res === false ? false : true;
						dispatcherChannel.publish("" + this.namespace + ".handled." + data.actionType, { hasChanged: this.hasChanged, namespace: this.namespace });
					}
				}).bind(this)
			}));

			this.__subscription = {
				notify: configSubscription(this, dispatcherChannel.subscribe("notify", this.flush)).constraint(function () {
					return inDispatch;
				}) };

			dispatcher.registerStore({
				namespace: namespace,
				actions: buildActionList(handlers)
			});
		}

		_prototypeProperties(Store, null, {
			dispose: {

				// Need to build in behavior to remove this store
				// from the dispatcher's actionMap as well!

				value: function dispose() {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = entries(this.__subscription)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var _step$value = _slicedToArray(_step.value, 2);

							var k = _step$value[0];
							var subscription = _step$value[1];

							subscription.unsubscribe();
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator["return"]) {
								_iterator["return"]();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					delete stores[this.namespace];
					dispatcher.removeStore(this.namespace);
					this.luxCleanup();
				},
				writable: true,
				configurable: true
			}
		});

		return Store;
	})();

	Store.extend = extend;

	function removeStore(namespace) {
		stores[namespace].dispose();
	}

	function calculateGen(store, lookup, gen, actionType) {
		var calcdGen = gen;
		if (store.waitFor && store.waitFor.length) {
			store.waitFor.forEach(function (dep) {
				var depStore = lookup[dep];
				if (depStore) {
					var thisGen = calculateGen(depStore, lookup, gen + 1);
					if (thisGen > calcdGen) {
						calcdGen = thisGen;
					}
				} /*else {
      // TODO: add console.warn on debug build
      // noting that a store action specifies another store
      // as a dependency that does NOT participate in the action
      // this is why actionType is an arg here....
      }*/
			});
		}
		return calcdGen;
	}

	function buildGenerations(stores, actionType) {
		var tree = [];
		var lookup = {};
		stores.forEach(function (store) {
			return lookup[store.namespace] = store;
		});
		stores.forEach(function (store) {
			return store.gen = calculateGen(store, lookup, 0, actionType);
		});
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = entries(lookup)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);

				var key = _step$value[0];
				var item = _step$value[1];

				tree[item.gen] = tree[item.gen] || [];
				tree[item.gen].push(item);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return tree;
	}

	function processGeneration(generation, action) {
		var _this4 = this;

		generation.map(function (store) {
			var data = Object.assign({
				deps: _.pick(_this4.stores, store.waitFor)
			}, action);
			dispatcherChannel.publish("" + store.namespace + ".handle." + action.actionType, data);
		});
	}

	var Dispatcher = (function (_machina$BehavioralFsm) {
		function Dispatcher() {
			_classCallCheck(this, Dispatcher);

			this.actionContext = undefined;
			_get(Object.getPrototypeOf(Dispatcher.prototype), "constructor", this).call(this, {
				initialState: "ready",
				actionMap: {},
				states: {
					ready: {
						_onEnter: function _onEnter() {
							this.actionContext = undefined;
						},
						"action.dispatch": "dispatching"
					},
					dispatching: {
						_onEnter: function _onEnter(luxAction) {
							this.actionContext = luxAction;
							if (luxAction.generations.length) {
								(function () {
									var _ref = [];
									var _iteratorNormalCompletion = true;
									var _didIteratorError = false;
									var _iteratorError = undefined;

									try {
										for (var _iterator = luxAction.generations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
											var generation = _step.value;

											_ref.push(processGeneration.call(luxAction, generation, luxAction.action));
										}
									} catch (err) {
										_didIteratorError = true;
										_iteratorError = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion && _iterator["return"]) {
												_iterator["return"]();
											}
										} finally {
											if (_didIteratorError) {
												throw _iteratorError;
											}
										}
									}

									return _ref;
								})();
								this.transition(luxAction, "notifying");
							} else {
								this.transition(luxAction, "nothandled");
							}
						},
						"action.handled": function (luxAction, data) {
							if (data.hasChanged) {
								luxAction.updated.push(data.namespace);
							}
						},
						_onExit: function _onExit(luxAction) {
							if (luxAction.updated.length) {
								dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
							}
						}
					},
					notifying: {
						_onEnter: function _onEnter(luxAction) {
							dispatcherChannel.publish("notify", {
								action: luxAction.action
							});
						}
					},
					nothandled: {}
				},
				getStoresHandling: function getStoresHandling(actionType) {
					var stores = this.actionMap[actionType] || [];
					return {
						stores: stores,
						generations: buildGenerations(stores, actionType)
					};
				}
			});
			this.createSubscribers();
		}

		_inherits(Dispatcher, _machina$BehavioralFsm);

		_prototypeProperties(Dispatcher, null, {
			handleActionDispatch: {
				value: function handleActionDispatch(data) {
					var luxAction = Object.assign({ action: data, generationIndex: 0, updated: [] }, this.getStoresHandling(data.actionType));
					this.handle(luxAction, "action.dispatch");
				},
				writable: true,
				configurable: true
			},
			registerStore: {
				value: function registerStore(storeMeta) {
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = storeMeta.actions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var actionDef = _step.value;

							var action;
							var actionName = actionDef.actionType;
							var actionMeta = {
								namespace: storeMeta.namespace,
								waitFor: actionDef.waitFor
							};
							action = this.actionMap[actionName] = this.actionMap[actionName] || [];
							action.push(actionMeta);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator["return"]) {
								_iterator["return"]();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				},
				writable: true,
				configurable: true
			},
			removeStore: {
				value: function removeStore(namespace) {
					var isThisNameSpace = function isThisNameSpace(meta) {
						return meta.namespace === namespace;
					};
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = entries(this.actionMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var _step$value = _slicedToArray(_step.value, 2);

							var k = _step$value[0];
							var v = _step$value[1];

							var idx = v.findIndex(isThisNameSpace);
							if (idx !== -1) {
								v.splice(idx, 1);
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator["return"]) {
								_iterator["return"]();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				},
				writable: true,
				configurable: true
			},
			createSubscribers: {
				value: function createSubscribers() {
					var _this4 = this;

					if (!this.__subscriptions || !this.__subscriptions.length) {
						this.__subscriptions = [configSubscription(this, actionChannel.subscribe("execute.*", function (data, env) {
							return _this4.handleActionDispatch(data);
						})), dispatcherChannel.subscribe("*.handled.*", function (data) {
							return _this4.handle(_this4.actionContext, "action.handled", data);
						}).constraint(function () {
							return !!_this4.actionContext;
						})];
					}
				},
				writable: true,
				configurable: true
			},
			dispose: {
				value: function dispose() {
					if (this.__subscriptions) {
						this.__subscriptions.forEach(function (subscription) {
							return subscription.unsubscribe();
						});
						this.__subscriptions = null;
					}
				},
				writable: true,
				configurable: true
			}
		});

		return Dispatcher;
	})(machina.BehavioralFsm);

	var dispatcher = new Dispatcher();

	/* istanbul ignore next */
	function getGroupsWithAction(actionName) {
		var groups = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = entries(actionGroups)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);

				var group = _step$value[0];
				var list = _step$value[1];

				if (list.indexOf(actionName) >= 0) {
					groups.push(group);
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return groups;
	}

	// NOTE - these will eventually live in their own add-on lib or in a debug build of lux
	/* istanbul ignore next */
	var utils = {
		printActions: function printActions() {
			var actionList = Object.keys(actions).map(function (x) {
				return {
					"action name": x,
					stores: dispatcher.getStoresHandling(x).stores.map(function (x) {
						return x.namespace;
					}).join(","),
					groups: getGroupsWithAction(x).join(",")
				};
			});
			if (console && console.table) {
				console.group("Currently Recognized Actions");
				console.table(actionList);
				console.groupEnd();
			} else if (console && console.log) {
				console.log(actionList);
			}
		},

		printStoreDepTree: function printStoreDepTree(actionType) {
			var tree = [];
			actionType = typeof actionType === "string" ? [actionType] : actionType;
			if (!actionType) {
				actionType = Object.keys(actions);
			}
			actionType.forEach(function (at) {
				dispatcher.getStoresHandling(at).generations.forEach(function (x) {
					while (x.length) {
						var t = x.pop();
						tree.push({
							"action type": at,
							"store namespace": t.namespace,
							"waits for": t.waitFor.join(","),
							generation: t.gen
						});
					}
				});
				if (console && console.table) {
					console.group("Store Dependency List for " + at);
					console.table(tree);
					console.groupEnd();
				} else if (console && console.log) {
					console.log("Store Dependency List for " + at + ":");
					console.log(tree);
				}
				tree = [];
			});
		}
	};

	// jshint ignore: start
	return {
		actions: actions,
		publishAction: publishAction,
		addToActionGroup: addToActionGroup,
		component: component,
		controllerView: controllerView,
		customActionCreator: customActionCreator,
		dispatcher: dispatcher,
		getActionGroup: getActionGroup,
		actionCreatorListener: actionCreatorListener,
		actionCreator: actionCreator,
		actionListener: actionListener,
		mixin: mixin,
		initReact: function initReact(userReact) {
			React = userReact;
			return this;
		},
		reactMixin: reactMixin,
		removeStore: removeStore,
		Store: Store,
		stores: stores,
		utils: utils
	};
	// jshint ignore: end
});
//# sourceMappingURL=data:application/json;base64,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LENBQUM7QUFDdEIsWUFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ25CLE1BQU0sSUFBSyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRztBQUNwQyxZQUFPLENBQUMsR0FBRyxnQ0FBK0IsRUFBRSxPQUFLLENBQUM7QUFDbEQsWUFBTyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUNwQjtBQUNELFFBQUksR0FBRyxFQUFFLENBQUM7SUFDVixDQUFDLENBQUM7R0FDSDtFQUNELENBQUM7OztBQUlELFFBQU87QUFDTixTQUFPLEVBQVAsT0FBTztBQUNQLGVBQWEsRUFBYixhQUFhO0FBQ2Isa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixXQUFTLEVBQVQsU0FBUztBQUNULGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsWUFBVSxFQUFWLFVBQVU7QUFDVixnQkFBYyxFQUFkLGNBQWM7QUFDZCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLGVBQWEsRUFBYixhQUFhO0FBQ2IsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsT0FBSyxFQUFFLEtBQUs7QUFDWixXQUFTLEVBQUEsbUJBQUUsU0FBUyxFQUFHO0FBQ3RCLFFBQUssR0FBRyxTQUFTLENBQUM7QUFDbEIsVUFBTyxJQUFJLENBQUM7R0FDWjtBQUNELFlBQVUsRUFBVixVQUFVO0FBQ1YsYUFBVyxFQUFYLFdBQVc7QUFDWCxPQUFLLEVBQUwsS0FBSztBQUNMLFFBQU0sRUFBTixNQUFNO0FBQ04sT0FBSyxFQUFMLEtBQUs7RUFDTCxDQUFDOztDQUdGLENBQUMsQ0FBRSIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgLSBkb24ndCB0ZXN0IFVNRCB3cmFwcGVyICovXG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiwgXCJsb2Rhc2hcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoIHJlcXVpcmUoIFwicG9zdGFsXCIgKSwgcmVxdWlyZSggXCJtYWNoaW5hXCIgKSwgcmVxdWlyZSggXCJsb2Rhc2hcIiApICk7XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5sdXggPSBmYWN0b3J5KCByb290LnBvc3RhbCwgcm9vdC5tYWNoaW5hLCByb290Ll8gKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgXyApIHtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRpZiAoICEoIHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWwgKS5fYmFiZWxQb2x5ZmlsbCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSBiYWJlbCBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovL2JhYmVsanMuaW8vZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIik7XG5cdH1cblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5hY3Rpb25cIiApO1xuXHR2YXIgc3RvcmVDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LnN0b3JlXCIgKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmRpc3BhdGNoZXJcIiApO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHR2YXIgZW50cmllcyA9IGZ1bmN0aW9uKiAoIG9iaiApIHtcblx0XHRpZiggWyBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIgXS5pbmRleE9mKCB0eXBlb2Ygb2JqICkgPT09IC0xICkge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvciggdmFyIGsgb2YgT2JqZWN0LmtleXMoIG9iaiApICkge1xuXHRcdFx0eWllbGQgWyBrLCBvYmpbIGsgXSBdO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbiggY29udGV4dCwgc3Vic2NyaXB0aW9uICkge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24uY29udGV4dCggY29udGV4dCApXG5cdFx0ICAgICAgICAgICAgICAgICAgIC5jb25zdHJhaW50KCBmdW5jdGlvbiggZGF0YSwgZW52ZWxvcGUgKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKCBlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eSggXCJvcmlnaW5JZFwiICkgKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKCBlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSApO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKSB7XG5cdFx0dmFyIF9fbHV4ID0gY29udGV4dC5fX2x1eCA9ICggY29udGV4dC5fX2x1eCB8fCB7fSApO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9ICggX19sdXguY2xlYW51cCB8fCBbXSApO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9ICggX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSApO1xuXHRcdHJldHVybiBfX2x1eDtcblx0fVxuXG5cblx0dmFyIFJlYWN0O1xuXG5cdHZhciBleHRlbmQgPSBmdW5jdGlvbiggLi4ub3B0aW9ucyApIHtcblx0XHR2YXIgcGFyZW50ID0gdGhpcztcblx0XHR2YXIgc3RvcmU7IC8vIHBsYWNlaG9sZGVyIGZvciBpbnN0YW5jZSBjb25zdHJ1Y3RvclxuXHRcdHZhciBzdG9yZU9iaiA9IHt9OyAvLyBvYmplY3QgdXNlZCB0byBob2xkIGluaXRpYWxTdGF0ZSAmIHN0YXRlcyBmcm9tIHByb3RvdHlwZSBmb3IgaW5zdGFuY2UtbGV2ZWwgbWVyZ2luZ1xuXHRcdHZhciBjdG9yID0gZnVuY3Rpb24oKSB7fTsgLy8gcGxhY2Vob2xkZXIgY3RvciBmdW5jdGlvbiB1c2VkIHRvIGluc2VydCBsZXZlbCBpbiBwcm90b3R5cGUgY2hhaW5cblxuXHRcdC8vIEZpcnN0IC0gc2VwYXJhdGUgbWl4aW5zIGZyb20gcHJvdG90eXBlIHByb3BzXG5cdFx0dmFyIG1peGlucyA9IFtdO1xuXHRcdGZvciggdmFyIG9wdCBvZiBvcHRpb25zICkge1xuXHRcdFx0bWl4aW5zLnB1c2goIF8ucGljayggb3B0LCBbIFwiaGFuZGxlcnNcIiwgXCJzdGF0ZVwiIF0gKSApO1xuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0fVxuXG5cdFx0dmFyIHByb3RvUHJvcHMgPSBfLm1lcmdlLmFwcGx5KCB0aGlzLCBbIHt9IF0uY29uY2F0KCBvcHRpb25zICkgKTtcblxuXHRcdC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3Vcblx0XHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0XHQvLyBieSB1cyB0byBzaW1wbHkgY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IuXG5cdFx0aWYgKCBwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuaGFzT3duUHJvcGVydHkoIFwiY29uc3RydWN0b3JcIiApICkge1xuXHRcdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRcdHBhcmVudC5hcHBseSggdGhpcywgc3RvcmUubWl4aW5zLmNvbmNhdCggYXJncyApICk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHN0b3JlLm1peGlucyA9IG1peGlucztcblxuXHRcdC8vIEluaGVyaXQgY2xhc3MgKHN0YXRpYykgcHJvcGVydGllcyBmcm9tIHBhcmVudC5cblx0XHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0XHQvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuXHRcdC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG5cdFx0Y3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHN0b3JlLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7XG5cblx0XHQvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgKGluc3RhbmNlIHByb3BlcnRpZXMpIHRvIHRoZSBzdWJjbGFzcyxcblx0XHQvLyBpZiBzdXBwbGllZC5cblx0XHRpZiAoIHByb3RvUHJvcHMgKSB7XG5cdFx0XHRfLmV4dGVuZCggc3RvcmUucHJvdG90eXBlLCBwcm90b1Byb3BzICk7XG5cdFx0fVxuXG5cdFx0Ly8gQ29ycmVjdGx5IHNldCBjaGlsZCdzIGBwcm90b3R5cGUuY29uc3RydWN0b3JgLlxuXHRcdHN0b3JlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN0b3JlO1xuXG5cdFx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0XHRzdG9yZS5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHJldHVybiBzdG9yZTtcblx0fTtcblxuXHRcblxudmFyIGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAoIHZhciBbIGtleSwgaGFuZGxlciBdIG9mIGVudHJpZXMoIGhhbmRsZXJzICkgKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKCB7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9ICk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hBY3Rpb24oIGFjdGlvbiwgLi4uYXJncyApIHtcblx0aWYgKCBhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRhY3Rpb25zWyBhY3Rpb24gXSggLi4uYXJncyApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHthY3Rpb259J2AgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiggIWFjdGlvbnNbIGFjdGlvbiBdKSB7XG5cdFx0XHRhY3Rpb25zWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvciggYWN0aW9uICkge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYoICFncm91cCApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdHZhciBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmKCBkaWZmLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgZm9sbG93aW5nIGFjdGlvbnMgZG8gbm90IGV4aXN0OiAke2RpZmYuam9pbihcIiwgXCIpfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKXtcblx0XHRpZiggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyB8fCAhc3RvcmVzLmxpc3RlblRvLmxlbmd0aCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IoIHZhciBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZigga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2VudCA9ICggaywgdiApID0+IHtcblx0XHRcdGlmKCAhdGhpc1sgayBdICkge1xuXHRcdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCggKCBncm91cCApID0+IHtcblx0XHRcdGZvciggdmFyIFsgaywgdiBdIG9mIGVudHJpZXMoIGdldEFjdGlvbkdyb3VwKCBncm91cCApICkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCggaywgdiApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYoIHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cHVibGlzaEFjdGlvbigga2V5LCAuLi5hcmd1bWVudHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IHB1Ymxpc2hBY3Rpb25cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oIHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9ICkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBzaW5jZSB3ZSByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dCBhbHJlYWR5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHR2YXIgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyggaGFuZGxlcnMgKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggaGFuZGxlcktleXMgKTtcblx0XHRcdGlmKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZW5zdXJlUmVhY3QoIG1ldGhvZE5hbWUgKSB7XG5cdGlmICggdHlwZW9mIFJlYWN0ID09PSBcInVuZGVmaW5lZFwiICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgYXR0ZW1wdGVkIHRvIHVzZSBsdXguXCIgKyBtZXRob2ROYW1lICsgXCIgd2l0aG91dCBmaXJzdCBjYWxsaW5nIGx1eC5pbml0UmVhY3QoIFJlYWN0ICk7XCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyggb3B0aW9ucyApIHtcblx0ZW5zdXJlUmVhY3QoIFwiY29udHJvbGxlclZpZXdcIiApO1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQoIG9wdGlvbnMgKSB7XG5cdGVuc3VyZVJlYWN0KCBcImNvbXBvbmVudFwiICk7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBtaXhpbiApID0+IHtcblx0XHRpZiggdHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKCBtaXhpbi5taXhpbiApIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oIGNvbnRleHQsIG1peGluLm1peGluICk7XG5cdFx0fVxuXHRcdGlmKCB0eXBlb2YgbWl4aW4uc2V0dXAgIT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggXCJMdXggbWl4aW5zIHNob3VsZCBoYXZlIGEgc2V0dXAgbWV0aG9kLiBEaWQgeW91IHBlcmhhcHMgcGFzcyB5b3VyIG1peGlucyBhaGVhZCBvZiB5b3VyIHRhcmdldCBpbnN0YW5jZT9cIiApO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYoIG1peGluLnRlYXJkb3duICkge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxudmFyIHJlYWN0TWl4aW4gPSB7XG5cdGFjdGlvbkNyZWF0b3I6IGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluLFxuXHRzdG9yZTogbHV4U3RvcmVSZWFjdE1peGluXG59O1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHN0b3JlICkge1xuXHR2YXIgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiggIW5hbWVzcGFjZSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIgKTtcblx0fVxuXHRpZiggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKSB7XG5cdHJldHVybiB7XG5cdFx0d2FpdEZvcjogW10sXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgY2hhbmdlZCA9IDA7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKXtcblx0XHRcdFx0Y2hhbmdlZCArPSAoIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICkgPT09IGZhbHNlID8gMCA6IDEgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0XHRyZXR1cm4gY2hhbmdlZCA+IDA7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVXYWl0Rm9yKCBzb3VyY2UsIGhhbmRsZXJPYmplY3QgKSB7XG5cdGlmKCBzb3VyY2Uud2FpdEZvciApe1xuXHRcdHNvdXJjZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRpZiggaGFuZGxlck9iamVjdC53YWl0Rm9yLmluZGV4T2YoIGRlcCApID09PSAtMSApIHtcblx0XHRcdFx0aGFuZGxlck9iamVjdC53YWl0Rm9yLnB1c2goIGRlcCApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKSB7XG5cdGxpc3RlbmVyc1sga2V5IF0gPSBsaXN0ZW5lcnNbIGtleSBdIHx8IFtdO1xuXHRsaXN0ZW5lcnNbIGtleSBdLnB1c2goIGhhbmRsZXIuaGFuZGxlciB8fCBoYW5kbGVyICk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdGlvbnMgKSB7XG5cdHZhciBsaXN0ZW5lcnMgPSB7fTtcblx0dmFyIGhhbmRsZXJzID0ge307XG5cdHZhciBzdGF0ZSA9IHt9O1xuXHR2YXIgb3RoZXJPcHRzID0ge307XG5cdG9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIG8gKSB7XG5cdFx0dmFyIG9wdDtcblx0XHRpZiggbyApIHtcblx0XHRcdG9wdCA9IF8uY2xvbmUoIG8gKTtcblx0XHRcdF8ubWVyZ2UoIHN0YXRlLCBvcHQuc3RhdGUgKTtcblx0XHRcdGlmKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdHZhciBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGhhbmRsZXJzLCBrZXksIGxpc3RlbmVycyApO1xuXHRcdFx0XHRcdC8vIGVuc3VyZSB0aGF0IHRoZSBoYW5kbGVyIGRlZmluaXRpb24gaGFzIGEgbGlzdCBvZiBhbGwgc3RvcmVzXG5cdFx0XHRcdFx0Ly8gYmVpbmcgd2FpdGVkIHVwb25cblx0XHRcdFx0XHR1cGRhdGVXYWl0Rm9yKCBoYW5kbGVyLCBoYW5kbGVyc1sga2V5IF0gKTtcblx0XHRcdFx0XHQvLyBBZGQgdGhlIG9yaWdpbmFsIGhhbmRsZXIgbWV0aG9kKHMpIHRvIHRoZSBsaXN0ZW5lcnMgcXVldWVcblx0XHRcdFx0XHRhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBbIHN0YXRlLCBoYW5kbGVycywgb3RoZXJPcHRzIF07XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvciggLi4ub3B0ICkge1xuXHRcdHZhciBbIHN0YXRlLCBoYW5kbGVycywgb3B0aW9ucyBdID0gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0ICk7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgdGhpcyApO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZSB8fCB0aGlzLm5hbWVzcGFjZTtcblx0XHRPYmplY3QuYXNzaWduKCB0aGlzLCBvcHRpb25zICk7XG5cdFx0c3RvcmVzWyBuYW1lc3BhY2UgXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInNldFN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMucmVwbGFjZVN0YXRlID0gZnVuY3Rpb24oIG5ld1N0YXRlICkge1xuXHRcdFx0aWYoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYoIHRoaXMuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKCBgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGAgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bWl4aW4oIHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oIHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oIGRhdGEsIGVudmVsb3BlICkge1xuXHRcdFx0XHRpZiggaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoIGRhdGEuYWN0aW9uVHlwZSApICkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1sgZGF0YS5hY3Rpb25UeXBlIF0uaGFuZGxlci5hcHBseSggdGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdCggZGF0YS5kZXBzICkgKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAoIHJlcyA9PT0gZmFsc2UgKSA/IGZhbHNlIDogdHJ1ZTtcblx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0XHRcdFx0YCR7dGhpcy5uYW1lc3BhY2V9LmhhbmRsZWQuJHtkYXRhLmFjdGlvblR5cGV9YCxcblx0XHRcdFx0XHRcdHsgaGFzQ2hhbmdlZDogdGhpcy5oYXNDaGFuZ2VkLCBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlIH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbiggdGhpcywgZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBgbm90aWZ5YCwgdGhpcy5mbHVzaCApICkuY29uc3RyYWludCggKCkgPT4gaW5EaXNwYXRjaCApLFxuXHRcdH07XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAoIHZhciBbIGssIHN1YnNjcmlwdGlvbiBdIG9mIGVudHJpZXMoIHRoaXMuX19zdWJzY3JpcHRpb24gKSApIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzWyB0aGlzLm5hbWVzcGFjZSBdO1xuXHRcdGRpc3BhdGNoZXIucmVtb3ZlU3RvcmUoIHRoaXMubmFtZXNwYWNlICk7XG5cdFx0dGhpcy5sdXhDbGVhbnVwKCk7XG5cdH1cbn1cblxuU3RvcmUuZXh0ZW5kID0gZXh0ZW5kO1xuXG5mdW5jdGlvbiByZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRzdG9yZXNbIG5hbWVzcGFjZSBdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUgKSB7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKCBzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoICkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiggZGVwU3RvcmUgKSB7XG5cdFx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKCBkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxICk7XG5cdFx0XHRcdGlmICggdGhpc0dlbiA+IGNhbGNkR2VuICkge1xuXHRcdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdFx0fVxuXHRcdFx0fSAvKmVsc2Uge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZS53YXJuIG9uIGRlYnVnIGJ1aWxkXG5cdFx0XHRcdC8vIG5vdGluZyB0aGF0IGEgc3RvcmUgYWN0aW9uIHNwZWNpZmllcyBhbm90aGVyIHN0b3JlXG5cdFx0XHRcdC8vIGFzIGEgZGVwZW5kZW5jeSB0aGF0IGRvZXMgTk9UIHBhcnRpY2lwYXRlIGluIHRoZSBhY3Rpb25cblx0XHRcdFx0Ly8gdGhpcyBpcyB3aHkgYWN0aW9uVHlwZSBpcyBhbiBhcmcgaGVyZS4uLi5cblx0XHRcdH0qL1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKCAoIHN0b3JlICkgPT4gbG9va3VwWyBzdG9yZS5uYW1lc3BhY2UgXSA9IHN0b3JlICk7XG5cdHN0b3Jlcy5mb3JFYWNoKCAoIHN0b3JlICkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlICkgKTtcblx0Zm9yICggdmFyIFsga2V5LCBpdGVtIF0gb2YgZW50cmllcyggbG9va3VwICkgKSB7XG5cdFx0dHJlZVsgaXRlbS5nZW4gXSA9IHRyZWVbIGl0ZW0uZ2VuIF0gfHwgW107XG5cdFx0dHJlZVsgaXRlbS5nZW4gXS5wdXNoKCBpdGVtICk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKCBnZW5lcmF0aW9uLCBhY3Rpb24gKSB7XG5cdGdlbmVyYXRpb24ubWFwKCAoIHN0b3JlICkgPT4ge1xuXHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbigge1xuXHRcdFx0ZGVwczogXy5waWNrKCB0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvciApXG5cdFx0fSwgYWN0aW9uICk7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuQmVoYXZpb3JhbEZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRzdXBlcigge1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSBsdXhBY3Rpb247XG5cdFx0XHRcdFx0XHRpZihsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFsgZm9yICggZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKVxuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwoIGx1eEFjdGlvbiwgZ2VuZXJhdGlvbiwgbHV4QWN0aW9uLmFjdGlvbiApIF07XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGlmeWluZ1wiICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RoYW5kbGVkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5oYW5kbGVkXCI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24sIGRhdGEgKSB7XG5cdFx0XHRcdFx0XHRpZiggZGF0YS5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHRcdFx0XHRsdXhBY3Rpb24udXBkYXRlZC5wdXNoKCBkYXRhLm5hbWVzcGFjZSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGlmKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGhhbmRsZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoIGFjdGlvblR5cGUgKSB7XG5cdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmNyZWF0ZVN1YnNjcmliZXJzKCk7XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApIHtcblx0XHR2YXIgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHR9O1xuXHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gfHwgW107XG5cdFx0XHRhY3Rpb24ucHVzaCggYWN0aW9uTWV0YSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdFx0dmFyIGlzVGhpc05hbWVTcGFjZSA9IGZ1bmN0aW9uKCBtZXRhICkge1xuXHRcdFx0cmV0dXJuIG1ldGEubmFtZXNwYWNlID09PSBuYW1lc3BhY2U7XG5cdFx0fTtcblx0XHRmb3IoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCB0aGlzLmFjdGlvbk1hcCApICkge1xuXHRcdFx0dmFyIGlkeCA9IHYuZmluZEluZGV4KCBpc1RoaXNOYW1lU3BhY2UgKTtcblx0XHRcdGlmKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0aWYoICF0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFx0XCJleGVjdXRlLipcIixcblx0XHRcdFx0XHRcdCggZGF0YSwgZW52ICkgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCIqLmhhbmRsZWQuKlwiLFxuXHRcdFx0XHRcdCggZGF0YSApID0+IHRoaXMuaGFuZGxlKCB0aGlzLmFjdGlvbkNvbnRleHQsIFwiYWN0aW9uLmhhbmRsZWRcIiwgZGF0YSApXG5cdFx0XHRcdCkuY29uc3RyYWludCggKCkgPT4gISF0aGlzLmFjdGlvbkNvbnRleHQgKVxuXHRcdFx0XTtcblx0XHR9XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdGlmICggdGhpcy5fX3N1YnNjcmlwdGlvbnMgKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKCAoIHN1YnNjcmlwdGlvbiApID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpICk7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG5cdFx0fVxuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdldEdyb3Vwc1dpdGhBY3Rpb24oIGFjdGlvbk5hbWUgKSB7XG5cdHZhciBncm91cHMgPSBbXTtcblx0Zm9yKCB2YXIgWyBncm91cCwgbGlzdCBdIG9mIGVudHJpZXMoIGFjdGlvbkdyb3VwcyApICkge1xuXHRcdGlmKCBsaXN0LmluZGV4T2YoIGFjdGlvbk5hbWUgKSA+PSAwICkge1xuXHRcdFx0Z3JvdXBzLnB1c2goIGdyb3VwICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciB1dGlscyA9IHtcblx0cHJpbnRBY3Rpb25zKCkge1xuXHRcdHZhciBhY3Rpb25MaXN0ID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKVxuXHRcdFx0Lm1hcCggZnVuY3Rpb24oIHggKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XCJhY3Rpb24gbmFtZVwiIDogeCxcblx0XHRcdFx0XHRcInN0b3Jlc1wiIDogZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyggeCApLnN0b3Jlcy5tYXAoIGZ1bmN0aW9uKCB4ICkgeyByZXR1cm4geC5uYW1lc3BhY2U7IH0gKS5qb2luKCBcIixcIiApLFxuXHRcdFx0XHRcdFwiZ3JvdXBzXCIgOiBnZXRHcm91cHNXaXRoQWN0aW9uKCB4ICkuam9pbiggXCIsXCIgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0aWYoIGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSApIHtcblx0XHRcdGNvbnNvbGUuZ3JvdXAoIFwiQ3VycmVudGx5IFJlY29nbml6ZWQgQWN0aW9uc1wiICk7XG5cdFx0XHRjb25zb2xlLnRhYmxlKCBhY3Rpb25MaXN0ICk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0fSBlbHNlIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdGNvbnNvbGUubG9nKCBhY3Rpb25MaXN0ICk7XG5cdFx0fVxuXHR9LFxuXG5cdHByaW50U3RvcmVEZXBUcmVlKCBhY3Rpb25UeXBlICkge1xuXHRcdHZhciB0cmVlID0gW107XG5cdFx0YWN0aW9uVHlwZSA9IHR5cGVvZiBhY3Rpb25UeXBlID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25UeXBlIF0gOiBhY3Rpb25UeXBlO1xuXHRcdGlmKCAhYWN0aW9uVHlwZSApIHtcblx0XHRcdGFjdGlvblR5cGUgPSBPYmplY3Qua2V5cyggYWN0aW9ucyApO1xuXHRcdH1cblx0XHRhY3Rpb25UeXBlLmZvckVhY2goIGZ1bmN0aW9uKCBhdCApe1xuXHRcdFx0ZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyggYXQgKVxuXHRcdFx0ICAgIC5nZW5lcmF0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggeCApIHtcblx0XHRcdCAgICAgICAgd2hpbGUgKCB4Lmxlbmd0aCApIHtcblx0XHRcdCAgICAgICAgICAgIHZhciB0ID0geC5wb3AoKTtcblx0XHRcdCAgICAgICAgICAgIHRyZWUucHVzaCgge1xuXHRcdFx0ICAgICAgICAgICAgXHRcImFjdGlvbiB0eXBlXCIgOiBhdCxcblx0XHRcdCAgICAgICAgICAgICAgICBcInN0b3JlIG5hbWVzcGFjZVwiIDogdC5uYW1lc3BhY2UsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJ3YWl0cyBmb3JcIiA6IHQud2FpdEZvci5qb2luKCBcIixcIiApLFxuXHRcdFx0ICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHQgICAgICAgICAgICB9ICk7XG5cdFx0XHQgICAgICAgIH1cblx0XHRcdCAgICB9KTtcblx0XHQgICAgaWYoIGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSApIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cCggYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH1gICk7XG5cdFx0XHRcdGNvbnNvbGUudGFibGUoIHRyZWUgKTtcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdFx0fSBlbHNlIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdFx0Y29uc29sZS5sb2coIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9OmAgKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHRyZWUgKTtcblx0XHRcdH1cblx0XHRcdHRyZWUgPSBbXTtcblx0XHR9KTtcblx0fVxufTtcblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0YWN0aW9ucyxcblx0XHRwdWJsaXNoQWN0aW9uLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdFx0YWN0aW9uQ3JlYXRvcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0aW5pdFJlYWN0KCB1c2VyUmVhY3QgKSB7XG5cdFx0XHRSZWFjdCA9IHVzZXJSZWFjdDtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0cmVhY3RNaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZSxcblx0XHRzdG9yZXMsXG5cdFx0dXRpbHNcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==