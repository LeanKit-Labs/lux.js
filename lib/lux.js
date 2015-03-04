/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.6.1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

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
					var val = actions[key];
					if (val) {
						addActionIfNotPresent(key, val);
					} else {
						throw new Error("There is no action named '" + key + "'");
					}
				});
			}
		},
		mixin: {
			publishAction: function publishAction(action) {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}

				actionChannel.publish({
					topic: "execute." + action,
					data: {
						actionType: action,
						actionArgs: args
					}
				});
			}
		}
	};

	var luxActionCreatorReactMixin = {
		componentWillMount: luxActionCreatorMixin.setup,
		publishAction: luxActionCreatorMixin.mixin.publishAction
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
		removeStore: removeStore,
		Store: Store,
		stores: stores,
		utils: utils
	};
	// jshint ignore: end
});
//# sourceMappingURL=data:application/json;base64,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QUFDLEtBQUssQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUN0QixZQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkIsTUFBTSxJQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFHO0FBQ3BDLFlBQU8sQ0FBQyxHQUFHLGdDQUErQixFQUFFLE9BQUssQ0FBQztBQUNsRCxZQUFPLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO0tBQ3BCO0FBQ0QsUUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQztHQUNIO0VBQ0QsQ0FBQzs7O0FBSUQsUUFBTztBQUNOLFNBQU8sRUFBUCxPQUFPO0FBQ1Asa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixXQUFTLEVBQVQsU0FBUztBQUNULGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsWUFBVSxFQUFWLFVBQVU7QUFDVixnQkFBYyxFQUFkLGNBQWM7QUFDZCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLGVBQWEsRUFBYixhQUFhO0FBQ2IsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsT0FBSyxFQUFFLEtBQUs7QUFDWixXQUFTLEVBQVQsU0FBUztBQUNULGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0VBQ0wsQ0FBQzs7Q0FHRixDQUFDLENBQUUiLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiwgXCJsb2Rhc2hcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoIHJlcXVpcmUoIFwicG9zdGFsXCIgKSwgcmVxdWlyZSggXCJtYWNoaW5hXCIgKSwgcmVxdWlyZSggXCJsb2Rhc2hcIiApICk7XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5sdXggPSBmYWN0b3J5KCByb290LnBvc3RhbCwgcm9vdC5tYWNoaW5hLCByb290Ll8gKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgXyApIHtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCAhKCB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsICkuX2JhYmVsUG9seWZpbGwgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgaW5jbHVkZSB0aGUgYmFiZWwgcG9seWZpbGwgb24geW91ciBwYWdlIGJlZm9yZSBsdXggaXMgbG9hZGVkLiBTZWUgaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvdXNhZ2UvcG9seWZpbGwvIGZvciBtb3JlIGRldGFpbHMuXCIpO1xuXHR9XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0dmFyIGVudHJpZXMgPSBmdW5jdGlvbiogKCBvYmogKSB7XG5cdFx0aWYoIFsgXCJvYmplY3RcIiwgXCJmdW5jdGlvblwiIF0uaW5kZXhPZiggdHlwZW9mIG9iaiApID09PSAtMSApIHtcblx0XHRcdG9iaiA9IHt9O1xuXHRcdH1cblx0XHRmb3IoIHZhciBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHRcdHlpZWxkIFsgaywgb2JqWyBrIF0gXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oIGNvbnRleHQsIHN1YnNjcmlwdGlvbiApIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNvbnRleHQoIGNvbnRleHQgKVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludCggZnVuY3Rpb24oIGRhdGEsIGVudmVsb3BlICl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gISggZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoIFwib3JpZ2luSWRcIiApICkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICggZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkgKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0XHR2YXIgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXG5cdHZhciBSZWFjdDtcblx0ZnVuY3Rpb24gaW5pdFJlYWN0KCB1c2VyUmVhY3QgKSB7XG5cdFx0UmVhY3QgPSB1c2VyUmVhY3Q7XG5cdH1cblxuXHR2YXIgZXh0ZW5kID0gZnVuY3Rpb24oIC4uLm9wdGlvbnMgKSB7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXM7XG5cdFx0dmFyIHN0b3JlOyAvLyBwbGFjZWhvbGRlciBmb3IgaW5zdGFuY2UgY29uc3RydWN0b3Jcblx0XHR2YXIgc3RvcmVPYmogPSB7fTsgLy8gb2JqZWN0IHVzZWQgdG8gaG9sZCBpbml0aWFsU3RhdGUgJiBzdGF0ZXMgZnJvbSBwcm90b3R5cGUgZm9yIGluc3RhbmNlLWxldmVsIG1lcmdpbmdcblx0XHR2YXIgY3RvciA9IGZ1bmN0aW9uKCkge307IC8vIHBsYWNlaG9sZGVyIGN0b3IgZnVuY3Rpb24gdXNlZCB0byBpbnNlcnQgbGV2ZWwgaW4gcHJvdG90eXBlIGNoYWluXG5cblx0XHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRcdHZhciBtaXhpbnMgPSBbXTtcblx0XHRmb3IoIHZhciBvcHQgb2Ygb3B0aW9ucyApIHtcblx0XHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdH1cblxuXHRcdHZhciBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0XHQvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG5cdFx0Ly8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG5cdFx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRcdGlmICggcHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCBcImNvbnN0cnVjdG9yXCIgKSApIHtcblx0XHRcdHN0b3JlID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3Rvcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YXJnc1sgMCBdID0gYXJnc1sgMCBdIHx8IHt9O1xuXHRcdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0XHQvLyBJbmhlcml0IGNsYXNzIChzdGF0aWMpIHByb3BlcnRpZXMgZnJvbSBwYXJlbnQuXG5cdFx0Xy5tZXJnZSggc3RvcmUsIHBhcmVudCApO1xuXG5cdFx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0XHQvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuXHRcdGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xuXG5cdFx0Ly8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG5cdFx0Ly8gaWYgc3VwcGxpZWQuXG5cdFx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdFx0Xy5leHRlbmQoIHN0b3JlLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyApO1xuXHRcdH1cblxuXHRcdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0XHRzdG9yZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdG9yZTtcblxuXHRcdC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWQgbGF0ZXIuXG5cdFx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRyZXR1cm4gc3RvcmU7XG5cdH07XG5cblx0XG5cbnZhciBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzICkge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCB2YXIgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiggIWFjdGlvbnNbIGFjdGlvbiBdKSB7XG5cdFx0XHRhY3Rpb25zWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvciggYWN0aW9uICkge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYoICFncm91cCApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdHZhciBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmKCBkaWZmLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgZm9sbG93aW5nIGFjdGlvbnMgZG8gbm90IGV4aXN0OiAke2RpZmYuam9pbihcIiwgXCIpfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKXtcblx0XHRpZiggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyB8fCAhc3RvcmVzLmxpc3RlblRvLmxlbmd0aCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IoIHZhciBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZigga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2VudCA9ICggaywgdiApID0+IHtcblx0XHRcdGlmKCAhdGhpc1sgayBdICkge1xuXHRcdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCggKCBncm91cCApID0+IHtcblx0XHRcdGZvciggdmFyIFsgaywgdiBdIG9mIGVudHJpZXMoIGdldEFjdGlvbkdyb3VwKCBncm91cCApICkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCggaywgdiApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYoIHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBhY3Rpb25zWyBrZXkgXTtcblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrZXksIHZhbCApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHtrZXl9J2AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IGZ1bmN0aW9uKCBhY3Rpb24sIC4uLmFyZ3MgKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4ubWl4aW4ucHVibGlzaEFjdGlvblxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oIHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9ICkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBzaW5jZSB3ZSByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dCBhbHJlYWR5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHR2YXIgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyggaGFuZGxlcnMgKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggaGFuZGxlcktleXMgKTtcblx0XHRcdGlmKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZW5zdXJlUmVhY3QoIG1ldGhvZE5hbWUgKSB7XG5cdGlmICggdHlwZW9mIFJlYWN0ID09PSBcInVuZGVmaW5lZFwiICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgYXR0ZW1wdGVkIHRvIHVzZSBsdXguXCIgKyBtZXRob2ROYW1lICsgXCIgd2l0aG91dCBmaXJzdCBjYWxsaW5nIGx1eC5pbml0UmVhY3QoIFJlYWN0ICk7XCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyggb3B0aW9ucyApIHtcblx0ZW5zdXJlUmVhY3QoIFwiY29udHJvbGxlclZpZXdcIiApO1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQoIG9wdGlvbnMgKSB7XG5cdGVuc3VyZVJlYWN0KCBcImNvbXBvbmVudFwiICk7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBtaXhpbiApID0+IHtcblx0XHRpZiggdHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKCBtaXhpbi5taXhpbiApIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oIGNvbnRleHQsIG1peGluLm1peGluICk7XG5cdFx0fVxuXHRcdGlmKCB0eXBlb2YgbWl4aW4uc2V0dXAgIT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggXCJMdXggbWl4aW5zIHNob3VsZCBoYXZlIGEgc2V0dXAgbWV0aG9kLiBEaWQgeW91IHBlcmhhcHMgcGFzcyB5b3VyIG1peGlucyBhaGVhZCBvZiB5b3VyIHRhcmdldCBpbnN0YW5jZT9cIiApO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYoIG1peGluLnRlYXJkb3duICkge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0dmFyIG5hbWVzcGFjZSA9ICggb3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSApIHx8IHN0b3JlLm5hbWVzcGFjZTtcblx0aWYgKCBuYW1lc3BhY2UgaW4gc3RvcmVzICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gICk7XG5cdH1cblx0aWYoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSAwO1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICl7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiggc291cmNlLndhaXRGb3IgKXtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHRpb25zICkge1xuXHR2YXIgbGlzdGVuZXJzID0ge307XG5cdHZhciBoYW5kbGVycyA9IHt9O1xuXHR2YXIgc3RhdGUgPSB7fTtcblx0dmFyIG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdHZhciBvcHQ7XG5cdFx0aWYoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHR2YXIgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdFx0Xy5tZXJnZSggb3RoZXJPcHRzLCBvcHQgKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInJlcGxhY2VTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHQvLyB3ZSBwcmVzZXJ2ZSB0aGUgdW5kZXJseWluZyBzdGF0ZSByZWYsIGJ1dCBjbGVhciBpdFxuXHRcdFx0T2JqZWN0LmtleXMoIHN0YXRlICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0ZGVsZXRlIHN0YXRlWyBrZXkgXTtcblx0XHRcdH0gKTtcblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApIHtcblx0XHRcdFx0aWYoIGhhbmRsZXJzLmhhc093blByb3BlcnR5KCBkYXRhLmFjdGlvblR5cGUgKSApIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdLmhhbmRsZXIuYXBwbHkoIHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoIGRhdGEuZGVwcyApICk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKCByZXMgPT09IGZhbHNlICkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24oIHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggYG5vdGlmeWAsIHRoaXMuZmx1c2ggKSApLmNvbnN0cmFpbnQoICgpID0+IGluRGlzcGF0Y2ggKSxcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKCB2YXIgWyBrLCBzdWJzY3JpcHRpb24gXSBvZiBlbnRyaWVzKCB0aGlzLl9fc3Vic2NyaXB0aW9uICkgKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1sgdGhpcy5uYW1lc3BhY2UgXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKCB0aGlzLm5hbWVzcGFjZSApO1xuXHRcdHRoaXMubHV4Q2xlYW51cCgpO1xuXHR9XG59XG5cblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbIGRlcCBdO1xuXHRcdFx0aWYoIGRlcFN0b3JlICkge1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSApO1xuXHRcdFx0XHRpZiAoIHRoaXNHZW4gPiBjYWxjZEdlbiApIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IGxvb2t1cFsgc3RvcmUubmFtZXNwYWNlIF0gPSBzdG9yZSApO1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSApICk7XG5cdGZvciAoIHZhciBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuXHRnZW5lcmF0aW9uLm1hcCggKCBzdG9yZSApID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkJlaGF2aW9yYWxGc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYobHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRbIGZvciAoIGdlbmVyYXRpb24gb2YgbHV4QWN0aW9uLmdlbmVyYXRpb25zIClcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKCBsdXhBY3Rpb24sIGdlbmVyYXRpb24sIGx1eEFjdGlvbi5hY3Rpb24gKSBdO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RpZnlpbmdcIiApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aGFuZGxlZFwiKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYoIGRhdGEuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0XHRcdFx0bHV4QWN0aW9uLnVwZGF0ZWQucHVzaCggZGF0YS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0dmFyIGx1eEFjdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7IGFjdGlvbjogZGF0YSwgZ2VuZXJhdGlvbkluZGV4OiAwLCB1cGRhdGVkOiBbXSB9LFxuXHRcdFx0dGhpcy5nZXRTdG9yZXNIYW5kbGluZyggZGF0YS5hY3Rpb25UeXBlIClcblx0XHQpO1xuXHRcdHRoaXMuaGFuZGxlKCBsdXhBY3Rpb24sIFwiYWN0aW9uLmRpc3BhdGNoXCIgKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoIHN0b3JlTWV0YSApIHtcblx0XHRmb3IgKCB2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zICkge1xuXHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHZhciBpc1RoaXNOYW1lU3BhY2UgPSBmdW5jdGlvbiggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH07XG5cdFx0Zm9yKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0dGhpcyxcblx0XHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0XHQoIGRhdGEsIGVudiApID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpLmNvbnN0cmFpbnQoICgpID0+ICEhdGhpcy5hY3Rpb25Db250ZXh0IClcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRpZiAoIHRoaXMuX19zdWJzY3JpcHRpb25zICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvciggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiggbGlzdC5pbmRleE9mKCBhY3Rpb25OYW1lICkgPj0gMCApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKCBncm91cCApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKCBhY3Rpb25zIClcblx0XHRcdC5tYXAoIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIHggKS5zdG9yZXMubWFwKCBmdW5jdGlvbiggeCApIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9ICkuam9pbiggXCIsXCIgKSxcblx0XHRcdFx0XHRcImdyb3Vwc1wiIDogZ2V0R3JvdXBzV2l0aEFjdGlvbiggeCApLmpvaW4oIFwiLFwiIClcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKCBcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIiApO1xuXHRcdFx0Y29uc29sZS50YWJsZSggYWN0aW9uTGlzdCApO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggYWN0aW9uTGlzdCApO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZSggYWN0aW9uVHlwZSApIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uVHlwZSBdIDogYWN0aW9uVHlwZTtcblx0XHRpZiggIWFjdGlvblR5cGUgKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKCBmdW5jdGlvbiggYXQgKXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIGF0IClcblx0XHRcdCAgICAuZ2VuZXJhdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIHggKSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICggeC5sZW5ndGggKSB7XG5cdFx0XHQgICAgICAgICAgICB2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHQgICAgICAgICAgICB0cmVlLnB1c2goIHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbiggXCIsXCIgKSxcblx0XHRcdCAgICAgICAgICAgICAgICBnZW5lcmF0aW9uOiB0LmdlblxuXHRcdFx0ICAgICAgICAgICAgfSApO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKCB0cmVlICk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgICk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCB0cmVlICk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRpbml0UmVhY3QsXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=