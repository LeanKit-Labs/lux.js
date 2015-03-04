/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.6.1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _slice = Array.prototype.slice;

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function (root, factory) {
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

	/* istanbul ignore if */
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
	function initReact(userReact) {
		React = userReact;
	}

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
		var _this3 = this;

		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this3.stores.listenTo.indexOf(item) > -1;
		});
	}

	var luxStoreMixin = {
		setup: function setup() {
			var _this3 = this;

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
					return gateKeeper.call(_this3, store);
				});
			});

			__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify.call(_this3, data);
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
		loadState: luxStoreMixin.mixin.loadState,
		componentWillUnmount: luxStoreMixin.teardown
	};

	/*********************************************
 *           Action Creator Mixin          *
 **********************************************/

	var luxActionCreatorMixin = {
		setup: function setup() {
			var _this3 = this;

			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];

			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}

			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}

			var addActionIfNotPresent = function (k, v) {
				if (!_this3[k]) {
					_this3[k] = v;
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
		var _this3 = this;

		this.__lux.cleanup.forEach(function (method) {
			return method.call(_this3);
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
		var _this3 = this;

		generation.map(function (store) {
			var data = Object.assign({
				deps: _.pick(_this3.stores, store.waitFor)
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
							dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
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
					var _this3 = this;

					if (!this.__subscriptions || !this.__subscriptions.length) {
						this.__subscriptions = [configSubscription(this, actionChannel.subscribe("execute.*", function (data, env) {
							return _this3.handleActionDispatch(data);
						})), dispatcherChannel.subscribe("*.handled.*", function (data) {
							return _this3.handle(_this3.actionContext, "action.handled", data);
						}).constraint(function () {
							return !!_this3.actionContext;
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
		initReact: initReact,
		reactMixin: reactMixin,
		removeStore: removeStore,
		Store: Store,
		stores: stores,
		utils: utils
	};
	// jshint ignore: end
});
//# sourceMappingURL=data:application/json;base64,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LENBQUksQ0FBQztBQUNuRCxZQUFPLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ3RCLFlBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuQixNQUFNLElBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUc7QUFDcEMsWUFBTyxDQUFDLEdBQUcsZ0NBQStCLEVBQUUsT0FBSyxDQUFDO0FBQ2xELFlBQU8sQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7S0FDcEI7QUFDRCxRQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBQyxDQUFDO0dBQ0g7RUFDRCxDQUFDOzs7QUFJRCxRQUFPO0FBQ04sU0FBTyxFQUFQLE9BQU87QUFDUCxlQUFhLEVBQWIsYUFBYTtBQUNiLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsV0FBUyxFQUFULFNBQVM7QUFDVCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLGdCQUFjLEVBQWQsY0FBYztBQUNkLE9BQUssRUFBRSxLQUFLO0FBQ1osV0FBUyxFQUFULFNBQVM7QUFDVCxZQUFVLEVBQVYsVUFBVTtBQUNWLGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0VBQ0wsQ0FBQzs7Q0FHRixDQUFDLENBQUUiLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiwgXCJsb2Rhc2hcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoIHJlcXVpcmUoIFwicG9zdGFsXCIgKSwgcmVxdWlyZSggXCJtYWNoaW5hXCIgKSwgcmVxdWlyZSggXCJsb2Rhc2hcIiApICk7XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5sdXggPSBmYWN0b3J5KCByb290LnBvc3RhbCwgcm9vdC5tYWNoaW5hLCByb290Ll8gKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgXyApIHtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCAhKCB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsICkuX2JhYmVsUG9seWZpbGwgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgaW5jbHVkZSB0aGUgYmFiZWwgcG9seWZpbGwgb24geW91ciBwYWdlIGJlZm9yZSBsdXggaXMgbG9hZGVkLiBTZWUgaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvdXNhZ2UvcG9seWZpbGwvIGZvciBtb3JlIGRldGFpbHMuXCIpO1xuXHR9XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0dmFyIGVudHJpZXMgPSBmdW5jdGlvbiogKCBvYmogKSB7XG5cdFx0aWYoIFsgXCJvYmplY3RcIiwgXCJmdW5jdGlvblwiIF0uaW5kZXhPZiggdHlwZW9mIG9iaiApID09PSAtMSApIHtcblx0XHRcdG9iaiA9IHt9O1xuXHRcdH1cblx0XHRmb3IoIHZhciBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHRcdHlpZWxkIFsgaywgb2JqWyBrIF0gXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oIGNvbnRleHQsIHN1YnNjcmlwdGlvbiApIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNvbnRleHQoIGNvbnRleHQgKVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludCggZnVuY3Rpb24oIGRhdGEsIGVudmVsb3BlICl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gISggZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoIFwib3JpZ2luSWRcIiApICkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICggZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkgKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0XHR2YXIgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXG5cdHZhciBSZWFjdDtcblx0ZnVuY3Rpb24gaW5pdFJlYWN0KCB1c2VyUmVhY3QgKSB7XG5cdFx0UmVhY3QgPSB1c2VyUmVhY3Q7XG5cdH1cblxuXHR2YXIgZXh0ZW5kID0gZnVuY3Rpb24oIC4uLm9wdGlvbnMgKSB7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXM7XG5cdFx0dmFyIHN0b3JlOyAvLyBwbGFjZWhvbGRlciBmb3IgaW5zdGFuY2UgY29uc3RydWN0b3Jcblx0XHR2YXIgc3RvcmVPYmogPSB7fTsgLy8gb2JqZWN0IHVzZWQgdG8gaG9sZCBpbml0aWFsU3RhdGUgJiBzdGF0ZXMgZnJvbSBwcm90b3R5cGUgZm9yIGluc3RhbmNlLWxldmVsIG1lcmdpbmdcblx0XHR2YXIgY3RvciA9IGZ1bmN0aW9uKCkge307IC8vIHBsYWNlaG9sZGVyIGN0b3IgZnVuY3Rpb24gdXNlZCB0byBpbnNlcnQgbGV2ZWwgaW4gcHJvdG90eXBlIGNoYWluXG5cblx0XHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRcdHZhciBtaXhpbnMgPSBbXTtcblx0XHRmb3IoIHZhciBvcHQgb2Ygb3B0aW9ucyApIHtcblx0XHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdH1cblxuXHRcdHZhciBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0XHQvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG5cdFx0Ly8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG5cdFx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRcdGlmICggcHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCBcImNvbnN0cnVjdG9yXCIgKSApIHtcblx0XHRcdHN0b3JlID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3Rvcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YXJnc1sgMCBdID0gYXJnc1sgMCBdIHx8IHt9O1xuXHRcdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0XHQvLyBJbmhlcml0IGNsYXNzIChzdGF0aWMpIHByb3BlcnRpZXMgZnJvbSBwYXJlbnQuXG5cdFx0Xy5tZXJnZSggc3RvcmUsIHBhcmVudCApO1xuXG5cdFx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0XHQvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuXHRcdGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xuXG5cdFx0Ly8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG5cdFx0Ly8gaWYgc3VwcGxpZWQuXG5cdFx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdFx0Xy5leHRlbmQoIHN0b3JlLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyApO1xuXHRcdH1cblxuXHRcdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0XHRzdG9yZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdG9yZTtcblxuXHRcdC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWQgbGF0ZXIuXG5cdFx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRyZXR1cm4gc3RvcmU7XG5cdH07XG5cblx0XG5cbnZhciBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzICkge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCB2YXIgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBwdWJsaXNoQWN0aW9uKCBhY3Rpb24sIC4uLmFyZ3MgKSB7XG5cdGlmICggYWN0aW9uc1sgYWN0aW9uIF0gKSB7XG5cdFx0YWN0aW9uc1sgYWN0aW9uIF0oIC4uLmFyZ3MgKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gbmFtZWQgJyR7YWN0aW9ufSdgICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ICkge1xuXHRhY3Rpb25MaXN0ID0gKCB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiApID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYoICFhY3Rpb25zWyBhY3Rpb24gXSkge1xuXHRcdFx0YWN0aW9uc1sgYWN0aW9uIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzWyBncm91cCBdICkge1xuXHRcdHJldHVybiBfLnBpY2soIGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0YWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oIGFjdGlvbnMsIGFjdGlvbiApO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKCBncm91cE5hbWUsIGFjdGlvbkxpc3QgKSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF07XG5cdGlmKCAhZ3JvdXAgKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHR2YXIgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiggZGlmZi5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIGZvbGxvd2luZyBhY3Rpb25zIGRvIG5vdCBleGlzdDogJHtkaWZmLmpvaW4oXCIsIFwiKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICl7XG5cdFx0aWYoIGdyb3VwLmluZGV4T2YoIGFjdGlvbiApID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goIGFjdGlvbiApO1xuXHRcdH1cblx0fSk7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIHRoaXMgKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAoIHRoaXMuc3RvcmVzIHx8IHt9ICk7XG5cblx0XHRpZiAoICFzdG9yZXMubGlzdGVuVG8gfHwgIXN0b3Jlcy5saXN0ZW5Uby5sZW5ndGggKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBsaXN0ZW5UbyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHN0b3JlIG5hbWVzcGFjZWAgKTtcblx0XHR9XG5cblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gWyBzdG9yZXMubGlzdGVuVG8gXSA6IHN0b3Jlcy5saXN0ZW5UbztcblxuXHRcdGlmICggIXN0b3Jlcy5vbkNoYW5nZSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgICk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbIGAke3N0b3JlfS5jaGFuZ2VkYCBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZSggYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIHRoaXMsIHN0b3JlICkgKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggdGhpcywgZGF0YSApICk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKCB2YXIgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdHZhciBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiggIXRoaXNbIGsgXSApIHtcblx0XHRcdFx0XHR0aGlzWyBrIF0gPSB2O1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSApICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGssIHYgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGtleSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHB1Ymxpc2hBY3Rpb24oIGtleSwgLi4uYXJndW1lbnRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRwdWJsaXNoQWN0aW9uOiBwdWJsaXNoQWN0aW9uXG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXAsXG5cdHB1Ymxpc2hBY3Rpb246IHB1Ymxpc2hBY3Rpb25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKCB7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSApIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICggKCBkYXRhLCBlbnYgKSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZiggaGFuZGxlciA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXSApIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KCBjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0aWYoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gc2luY2Ugd2UgcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHQgYWxyZWFkeVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdFx0dmFyIGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoIGhhbmRsZXJzICk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGhhbmRsZXJLZXlzICk7XG5cdFx0XHRpZiggY29udGV4dC5uYW1lc3BhY2UgKSB7XG5cdFx0XHRcdGFkZFRvQWN0aW9uR3JvdXAoIGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGVuc3VyZVJlYWN0KCBtZXRob2ROYW1lICkge1xuXHRpZiAoIHR5cGVvZiBSZWFjdCA9PT0gXCJ1bmRlZmluZWRcIiApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IGF0dGVtcHRlZCB0byB1c2UgbHV4LlwiICsgbWV0aG9kTmFtZSArIFwiIHdpdGhvdXQgZmlyc3QgY2FsbGluZyBsdXguaW5pdFJlYWN0KCBSZWFjdCApO1wiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY29udHJvbGxlclZpZXcoIG9wdGlvbnMgKSB7XG5cdGVuc3VyZVJlYWN0KCBcImNvbnRyb2xsZXJWaWV3XCIgKTtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb21wb25lbnRcIiApO1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goICggbWV0aG9kICkgPT4gbWV0aG9kLmNhbGwoIHRoaXMgKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbiggY29udGV4dCwgLi4ubWl4aW5zICkge1xuXHRpZiggbWl4aW5zLmxlbmd0aCA9PT0gMCApIHtcblx0XHRtaXhpbnMgPSBbIGx1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiBdO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goICggbWl4aW4gKSA9PiB7XG5cdFx0aWYoIHR5cGVvZiBtaXhpbiA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZiggbWl4aW4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBtaXhpbi5taXhpbiApO1xuXHRcdH1cblx0XHRpZiggdHlwZW9mIG1peGluLnNldHVwICE9PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiTHV4IG1peGlucyBzaG91bGQgaGF2ZSBhIHNldHVwIG1ldGhvZC4gRGlkIHlvdSBwZXJoYXBzIHBhc3MgeW91ciBtaXhpbnMgYWhlYWQgb2YgeW91ciB0YXJnZXQgaW5zdGFuY2U/XCIgKTtcblx0XHR9XG5cdFx0bWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdGlmKCBtaXhpbi50ZWFyZG93biApIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBtaXhpbi50ZWFyZG93biApO1xuXHRcdH1cblx0fSk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBsdXhBY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbnZhciByZWFjdE1peGluID0ge1xuXHRhY3Rpb25DcmVhdG9yOiBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbixcblx0c3RvcmU6IGx1eFN0b3JlUmVhY3RNaXhpblxufTtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0dmFyIG5hbWVzcGFjZSA9ICggb3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSApIHx8IHN0b3JlLm5hbWVzcGFjZTtcblx0aWYgKCBuYW1lc3BhY2UgaW4gc3RvcmVzICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gICk7XG5cdH1cblx0aWYoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSAwO1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICl7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiggc291cmNlLndhaXRGb3IgKXtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHRpb25zICkge1xuXHR2YXIgbGlzdGVuZXJzID0ge307XG5cdHZhciBoYW5kbGVycyA9IHt9O1xuXHR2YXIgc3RhdGUgPSB7fTtcblx0dmFyIG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdHZhciBvcHQ7XG5cdFx0aWYoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHR2YXIgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdFx0Xy5tZXJnZSggb3RoZXJPcHRzLCBvcHQgKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInJlcGxhY2VTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHQvLyB3ZSBwcmVzZXJ2ZSB0aGUgdW5kZXJseWluZyBzdGF0ZSByZWYsIGJ1dCBjbGVhciBpdFxuXHRcdFx0T2JqZWN0LmtleXMoIHN0YXRlICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0ZGVsZXRlIHN0YXRlWyBrZXkgXTtcblx0XHRcdH0gKTtcblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApIHtcblx0XHRcdFx0aWYoIGhhbmRsZXJzLmhhc093blByb3BlcnR5KCBkYXRhLmFjdGlvblR5cGUgKSApIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdLmhhbmRsZXIuYXBwbHkoIHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoIGRhdGEuZGVwcyApICk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKCByZXMgPT09IGZhbHNlICkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24oIHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggYG5vdGlmeWAsIHRoaXMuZmx1c2ggKSApLmNvbnN0cmFpbnQoICgpID0+IGluRGlzcGF0Y2ggKSxcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKCB2YXIgWyBrLCBzdWJzY3JpcHRpb24gXSBvZiBlbnRyaWVzKCB0aGlzLl9fc3Vic2NyaXB0aW9uICkgKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1sgdGhpcy5uYW1lc3BhY2UgXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKCB0aGlzLm5hbWVzcGFjZSApO1xuXHRcdHRoaXMubHV4Q2xlYW51cCgpO1xuXHR9XG59XG5cblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbIGRlcCBdO1xuXHRcdFx0aWYoIGRlcFN0b3JlICkge1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSApO1xuXHRcdFx0XHRpZiAoIHRoaXNHZW4gPiBjYWxjZEdlbiApIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IGxvb2t1cFsgc3RvcmUubmFtZXNwYWNlIF0gPSBzdG9yZSApO1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSApICk7XG5cdGZvciAoIHZhciBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuXHRnZW5lcmF0aW9uLm1hcCggKCBzdG9yZSApID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkJlaGF2aW9yYWxGc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYobHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRbIGZvciAoIGdlbmVyYXRpb24gb2YgbHV4QWN0aW9uLmdlbmVyYXRpb25zIClcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKCBsdXhBY3Rpb24sIGdlbmVyYXRpb24sIGx1eEFjdGlvbi5hY3Rpb24gKSBdO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RpZnlpbmdcIiApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aGFuZGxlZFwiKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYoIGRhdGEuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0XHRcdFx0bHV4QWN0aW9uLnVwZGF0ZWQucHVzaCggZGF0YS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0dmFyIGx1eEFjdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7IGFjdGlvbjogZGF0YSwgZ2VuZXJhdGlvbkluZGV4OiAwLCB1cGRhdGVkOiBbXSB9LFxuXHRcdFx0dGhpcy5nZXRTdG9yZXNIYW5kbGluZyggZGF0YS5hY3Rpb25UeXBlIClcblx0XHQpO1xuXHRcdHRoaXMuaGFuZGxlKCBsdXhBY3Rpb24sIFwiYWN0aW9uLmRpc3BhdGNoXCIgKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoIHN0b3JlTWV0YSApIHtcblx0XHRmb3IgKCB2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zICkge1xuXHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHZhciBpc1RoaXNOYW1lU3BhY2UgPSBmdW5jdGlvbiggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH07XG5cdFx0Zm9yKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0dGhpcyxcblx0XHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0XHQoIGRhdGEsIGVudiApID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpLmNvbnN0cmFpbnQoICgpID0+ICEhdGhpcy5hY3Rpb25Db250ZXh0IClcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRpZiAoIHRoaXMuX19zdWJzY3JpcHRpb25zICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvciggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiggbGlzdC5pbmRleE9mKCBhY3Rpb25OYW1lICkgPj0gMCApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKCBncm91cCApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKCBhY3Rpb25zIClcblx0XHRcdC5tYXAoIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIHggKS5zdG9yZXMubWFwKCBmdW5jdGlvbiggeCApIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9ICkuam9pbiggXCIsXCIgKSxcblx0XHRcdFx0XHRcImdyb3Vwc1wiIDogZ2V0R3JvdXBzV2l0aEFjdGlvbiggeCApLmpvaW4oIFwiLFwiIClcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKCBcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIiApO1xuXHRcdFx0Y29uc29sZS50YWJsZSggYWN0aW9uTGlzdCApO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggYWN0aW9uTGlzdCApO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZSggYWN0aW9uVHlwZSApIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uVHlwZSBdIDogYWN0aW9uVHlwZTtcblx0XHRpZiggIWFjdGlvblR5cGUgKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKCBmdW5jdGlvbiggYXQgKXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIGF0IClcblx0XHRcdCAgICAuZ2VuZXJhdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIHggKSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICggeC5sZW5ndGggKSB7XG5cdFx0XHQgICAgICAgICAgICB2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHQgICAgICAgICAgICB0cmVlLnB1c2goIHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbiggXCIsXCIgKSxcblx0XHRcdCAgICAgICAgICAgICAgICBnZW5lcmF0aW9uOiB0LmdlblxuXHRcdFx0ICAgICAgICAgICAgfSApO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKCB0cmVlICk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgICk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCB0cmVlICk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0cHVibGlzaEFjdGlvbixcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRcdGFjdGlvbkNyZWF0b3IsXG5cdFx0YWN0aW9uTGlzdGVuZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdGluaXRSZWFjdCxcblx0XHRyZWFjdE1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlLFxuXHRcdHN0b3Jlcyxcblx0XHR1dGlsc1xuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9