/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.7.1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2015 LeanKit
 */
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
})(this, function (postal, machina, _) {

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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUUsQ0FBQztBQUN0QixZQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkIsTUFBTSxJQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFHO0FBQ3BDLFlBQU8sQ0FBQyxHQUFHLGdDQUErQixFQUFFLE9BQUssQ0FBQztBQUNsRCxZQUFPLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBRSxDQUFDO0tBQ3BCO0FBQ0QsUUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQztHQUNIO0VBQ0QsQ0FBQzs7O0FBSUQsUUFBTztBQUNOLFNBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBYSxFQUFiLGFBQWE7QUFDYixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFdBQVMsRUFBVCxTQUFTO0FBQ1QsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixZQUFVLEVBQVYsVUFBVTtBQUNWLGdCQUFjLEVBQWQsY0FBYztBQUNkLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsZUFBYSxFQUFiLGFBQWE7QUFDYixnQkFBYyxFQUFkLGNBQWM7QUFDZCxPQUFLLEVBQUUsS0FBSztBQUNaLFdBQVMsRUFBQSxtQkFBRSxTQUFTLEVBQUc7QUFDdEIsUUFBSyxHQUFHLFNBQVMsQ0FBQztBQUNsQixVQUFPLElBQUksQ0FBQztHQUNaO0FBQ0QsWUFBVSxFQUFWLFVBQVU7QUFDVixhQUFXLEVBQVgsV0FBVztBQUNYLE9BQUssRUFBTCxLQUFLO0FBQ0wsUUFBTSxFQUFOLE1BQU07QUFDTixPQUFLLEVBQUwsS0FBSztFQUNMLENBQUM7O0NBR0YsQ0FBQyxDQUFFIiwiZmlsZSI6Imx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtIGRvbid0IHRlc3QgVU1EIHdyYXBwZXIgKi9cblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwicG9zdGFsXCIsIFwibWFjaGluYVwiLCBcImxvZGFzaFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSggcmVxdWlyZSggXCJwb3N0YWxcIiApLCByZXF1aXJlKCBcIm1hY2hpbmFcIiApLCByZXF1aXJlKCBcImxvZGFzaFwiICkgKTtcblx0fSBlbHNlIHtcblx0XHRyb290Lmx1eCA9IGZhY3RvcnkoIHJvb3QucG9zdGFsLCByb290Lm1hY2hpbmEsIHJvb3QuXyApO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hLCBfICkge1xuXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl9iYWJlbFBvbHlmaWxsICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGluY2x1ZGUgdGhlIGJhYmVsIHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiKTtcblx0fVxuXG5cdHZhciBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmFjdGlvblwiICk7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguc3RvcmVcIiApO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguZGlzcGF0Y2hlclwiICk7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdHZhciBlbnRyaWVzID0gZnVuY3Rpb24qICggb2JqICkge1xuXHRcdGlmKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKCB2YXIgayBvZiBPYmplY3Qua2V5cyggb2JqICkgKSB7XG5cdFx0XHR5aWVsZCBbIGssIG9ialsgayBdIF07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKCBjb250ZXh0LCBzdWJzY3JpcHRpb24gKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi5jb250ZXh0KCBjb250ZXh0IClcblx0XHQgICAgICAgICAgICAgICAgICAgLmNvbnN0cmFpbnQoIGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoIGVudmVsb3BlLmhhc093blByb3BlcnR5KCBcIm9yaWdpbklkXCIgKSApIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoIGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpICk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5zdXJlTHV4UHJvcCggY29udGV4dCApIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKCBjb250ZXh0Ll9fbHV4IHx8IHt9ICk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKCBfX2x1eC5jbGVhbnVwIHx8IFtdICk7XG5cdFx0dmFyIHN1YnNjcmlwdGlvbnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zID0gKCBfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9ICk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblxuXHR2YXIgUmVhY3Q7XG5cblx0dmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCAuLi5vcHRpb25zICkge1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzO1xuXHRcdHZhciBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdFx0dmFyIHN0b3JlT2JqID0ge307IC8vIG9iamVjdCB1c2VkIHRvIGhvbGQgaW5pdGlhbFN0YXRlICYgc3RhdGVzIGZyb20gcHJvdG90eXBlIGZvciBpbnN0YW5jZS1sZXZlbCBtZXJnaW5nXG5cdFx0dmFyIGN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdFx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0XHR2YXIgbWl4aW5zID0gW107XG5cdFx0Zm9yKCB2YXIgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdFx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHRcdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHRcdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0XHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdFx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRcdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHRcdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdFx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0c3RvcmUucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcblxuXHRcdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHRcdC8vIGlmIHN1cHBsaWVkLlxuXHRcdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0XHR9XG5cblx0XHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdFx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0XHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRcdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0cmV0dXJuIHN0b3JlO1xuXHR9O1xuXG5cdFxuXG52YXIgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICggdmFyIFsga2V5LCBoYW5kbGVyIF0gb2YgZW50cmllcyggaGFuZGxlcnMgKSApIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goIHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gcHVibGlzaEFjdGlvbiggYWN0aW9uLCAuLi5hcmdzICkge1xuXHRpZiAoIGFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdGFjdGlvbnNbIGFjdGlvbiBdKCAuLi5hcmdzICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2FjdGlvbn0nYCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdCApIHtcblx0YWN0aW9uTGlzdCA9ICggdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgKSA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmKCAhYWN0aW9uc1sgYWN0aW9uIF0pIHtcblx0XHRcdGFjdGlvbnNbIGFjdGlvbiBdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCgge1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApIHtcblx0XHRyZXR1cm4gXy5waWNrKCBhY3Rpb25zLCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gZ3JvdXAgbmFtZWQgJyR7Z3JvdXB9J2AgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKCBhY3Rpb24gKSB7XG5cdGFjdGlvbnMgPSBPYmplY3QuYXNzaWduKCBhY3Rpb25zLCBhY3Rpb24gKTtcbn1cblxuZnVuY3Rpb24gYWRkVG9BY3Rpb25Hcm91cCggZ3JvdXBOYW1lLCBhY3Rpb25MaXN0ICkge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdO1xuXHRpZiggIWdyb3VwICkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0dmFyIGRpZmYgPSBfLmRpZmZlcmVuY2UoIGFjdGlvbkxpc3QsIE9iamVjdC5rZXlzKCBhY3Rpb25zICkgKTtcblx0aWYoIGRpZmYubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBkbyBub3QgZXhpc3Q6ICR7ZGlmZi5qb2luKFwiLCBcIil9YCApO1xuXHR9XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApe1xuXHRcdGlmKCBncm91cC5pbmRleE9mKCBhY3Rpb24gKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKCBhY3Rpb24gKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoIHN0b3JlLCBkYXRhICkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkWyBzdG9yZSBdID0gdHJ1ZTtcblx0dmFyIF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHR2YXIgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKCB0aGlzICk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKCB0aGlzLnN0b3JlcyB8fCB7fSApO1xuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvIHx8ICFzdG9yZXMubGlzdGVuVG8ubGVuZ3RoICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgICk7XG5cdFx0fVxuXG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFsgc3RvcmVzLmxpc3RlblRvIF0gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCApO1xuXHRcdH1cblxuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goICggc3RvcmUgKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zWyBgJHtzdG9yZX0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKCB0aGlzLCBzdG9yZSApICk7XG5cdFx0fSk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggXCJwcmVub3RpZnlcIiwgKCBkYXRhICkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwoIHRoaXMsIGRhdGEgKSApO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdGZvciggdmFyIFsga2V5LCBzdWIgXSBvZiBlbnRyaWVzKCB0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMgKSApIHtcblx0XHRcdHZhciBzcGxpdDtcblx0XHRcdGlmKCBrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCAoIHNwbGl0ID0ga2V5LnNwbGl0KCBcIi5cIiApICkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkgKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gQ3JlYXRvciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9uR3JvdXAgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gWyB0aGlzLmdldEFjdGlvbkdyb3VwIF07XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zID0gWyB0aGlzLmdldEFjdGlvbnMgXTtcblx0XHR9XG5cblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZW50ID0gKCBrLCB2ICkgPT4ge1xuXHRcdFx0aWYoICF0aGlzWyBrIF0gKSB7XG5cdFx0XHRcdFx0dGhpc1sgayBdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKCAoIGdyb3VwICkgPT4ge1xuXHRcdFx0Zm9yKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkgKSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrLCB2ICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiggdGhpcy5nZXRBY3Rpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrZXksIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRwdWJsaXNoQWN0aW9uKCBrZXksIC4uLmFyZ3VtZW50cyApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBwdWJsaXNoQWN0aW9uXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbiggeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30gKSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggY29udGV4dCApO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoICggZGF0YSwgZW52ICkgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYoIGhhbmRsZXIgPSBoYW5kbGVyc1sgZGF0YS5hY3Rpb25UeXBlIF0gKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseSggY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdGlmKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFjdGlvbiBoYW5kbGVyIGluIHRoZSBoYW5kbGVycyBwcm9wZXJ0eVwiICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIgKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIHNpbmNlIHdlIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0IGFscmVhZHlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9XG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuIClcblx0XHRcdFx0KTtcblx0XHRcdHZhciBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKCBoYW5kbGVycyApO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0aWYoIGNvbnRleHQubmFtZXNwYWNlICkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKCBjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBSZWFjdCBDb21wb25lbnQgVmVyc2lvbnMgb2YgQWJvdmUgTWl4aW4gICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBlbnN1cmVSZWFjdCggbWV0aG9kTmFtZSApIHtcblx0aWYgKCB0eXBlb2YgUmVhY3QgPT09IFwidW5kZWZpbmVkXCIgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBhdHRlbXB0ZWQgdG8gdXNlIGx1eC5cIiArIG1ldGhvZE5hbWUgKyBcIiB3aXRob3V0IGZpcnN0IGNhbGxpbmcgbHV4LmluaXRSZWFjdCggUmVhY3QgKTtcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb250cm9sbGVyVmlld1wiICk7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGx1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gXS5jb25jYXQoIG9wdGlvbnMubWl4aW5zIHx8IFtdIClcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoIE9iamVjdC5hc3NpZ24oIG9wdCwgb3B0aW9ucyApICk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudCggb3B0aW9ucyApIHtcblx0ZW5zdXJlUmVhY3QoIFwiY29tcG9uZW50XCIgKTtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gXS5jb25jYXQoIG9wdGlvbnMubWl4aW5zIHx8IFtdIClcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoIE9iamVjdC5hc3NpZ24oIG9wdCwgb3B0aW9ucyApICk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAoIG1ldGhvZCApID0+IG1ldGhvZC5jYWxsKCB0aGlzICkgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oIGNvbnRleHQsIC4uLm1peGlucyApIHtcblx0aWYoIG1peGlucy5sZW5ndGggPT09IDAgKSB7XG5cdFx0bWl4aW5zID0gWyBsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKCAoIG1peGluICkgPT4ge1xuXHRcdGlmKCB0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYoIG1peGluLm1peGluICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggY29udGV4dCwgbWl4aW4ubWl4aW4gKTtcblx0XHR9XG5cdFx0aWYoIHR5cGVvZiBtaXhpbi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiggbWl4aW4udGVhcmRvd24gKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG5taXhpbi5zdG9yZSA9IGx1eFN0b3JlTWl4aW47XG5taXhpbi5hY3Rpb25DcmVhdG9yID0gbHV4QWN0aW9uQ3JlYXRvck1peGluO1xubWl4aW4uYWN0aW9uTGlzdGVuZXIgPSBsdXhBY3Rpb25MaXN0ZW5lck1peGluO1xuXG52YXIgcmVhY3RNaXhpbiA9IHtcblx0YWN0aW9uQ3JlYXRvcjogbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sXG5cdHN0b3JlOiBsdXhTdG9yZVJlYWN0TWl4aW5cbn07XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgc3RvcmUgKSB7XG5cdHZhciBuYW1lc3BhY2UgPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5uYW1lc3BhY2UgKSB8fCBzdG9yZS5uYW1lc3BhY2U7XG5cdGlmICggbmFtZXNwYWNlIGluIHN0b3JlcyApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCApO1xuXHR9XG5cdGlmKCAhbmFtZXNwYWNlICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIiApO1xuXHR9XG5cdGlmKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGhhbmRsZXJzLCBrZXksIGxpc3RlbmVycyApIHtcblx0cmV0dXJuIHtcblx0XHR3YWl0Rm9yOiBbXSxcblx0XHRoYW5kbGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBjaGFuZ2VkID0gMDtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRsaXN0ZW5lcnNbIGtleSBdLmZvckVhY2goIGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYoIHNvdXJjZS53YWl0Rm9yICl7XG5cdFx0c291cmNlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdGlmKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0dmFyIGxpc3RlbmVycyA9IHt9O1xuXHR2YXIgaGFuZGxlcnMgPSB7fTtcblx0dmFyIHN0YXRlID0ge307XG5cdHZhciBvdGhlck9wdHMgPSB7fTtcblx0b3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggbyApIHtcblx0XHR2YXIgb3B0O1xuXHRcdGlmKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYoIG9wdC5oYW5kbGVycyApIHtcblx0XHRcdFx0T2JqZWN0LmtleXMoIG9wdC5oYW5kbGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0dmFyIGhhbmRsZXIgPSBvcHQuaGFuZGxlcnNbIGtleSBdO1xuXHRcdFx0XHRcdC8vIHNldCB1cCB0aGUgYWN0dWFsIGhhbmRsZXIgbWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZFxuXHRcdFx0XHRcdC8vIGFzIHRoZSBzdG9yZSBoYW5kbGVzIGEgZGlzcGF0Y2hlZCBhY3Rpb25cblx0XHRcdFx0XHRoYW5kbGVyc1sga2V5IF0gPSBoYW5kbGVyc1sga2V5IF0gfHwgZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHRcdF8ubWVyZ2UoIG90aGVyT3B0cywgb3B0ICk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIFsgc3RhdGUsIGhhbmRsZXJzLCBvdGhlck9wdHMgXTtcbn1cblxuY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKCAuLi5vcHQgKSB7XG5cdFx0dmFyIFsgc3RhdGUsIGhhbmRsZXJzLCBvcHRpb25zIF0gPSBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHQgKTtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCB0aGlzICk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlIHx8IHRoaXMubmFtZXNwYWNlO1xuXHRcdE9iamVjdC5hc3NpZ24oIHRoaXMsIG9wdGlvbnMgKTtcblx0XHRzdG9yZXNbIG5hbWVzcGFjZSBdID0gdGhpcztcblx0XHR2YXIgaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHRcdH07XG5cblx0XHR0aGlzLnNldFN0YXRlID0gZnVuY3Rpb24oIG5ld1N0YXRlICkge1xuXHRcdFx0aWYoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJyZXBsYWNlU3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0Ly8gd2UgcHJlc2VydmUgdGhlIHVuZGVybHlpbmcgc3RhdGUgcmVmLCBidXQgY2xlYXIgaXRcblx0XHRcdE9iamVjdC5rZXlzKCBzdGF0ZSApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGRlbGV0ZSBzdGF0ZVsga2V5IF07XG5cdFx0XHR9ICk7XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZiggdGhpcy5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goIGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbiggdGhpcywgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSwgZW52ZWxvcGUgKSB7XG5cdFx0XHRcdGlmKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKCB0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCB0aGlzLmZsdXNoICkgKS5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoICksXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzIClcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0Ly8gTmVlZCB0byBidWlsZCBpbiBiZWhhdmlvciB0byByZW1vdmUgdGhpcyBzdG9yZVxuXHQvLyBmcm9tIHRoZSBkaXNwYXRjaGVyJ3MgYWN0aW9uTWFwIGFzIHdlbGwhXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICggdmFyIFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdHN0b3Jlc1sgbmFtZXNwYWNlIF0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIGdlbiwgYWN0aW9uVHlwZSApIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoIHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGggKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwWyBkZXAgXTtcblx0XHRcdGlmKCBkZXBTdG9yZSApIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oIGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8qZWxzZSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlLndhcm4gb24gZGVidWcgYnVpbGRcblx0XHRcdFx0Ly8gbm90aW5nIHRoYXQgYSBzdG9yZSBhY3Rpb24gc3BlY2lmaWVzIGFub3RoZXIgc3RvcmVcblx0XHRcdFx0Ly8gYXMgYSBkZXBlbmRlbmN5IHRoYXQgZG9lcyBOT1QgcGFydGljaXBhdGUgaW4gdGhlIGFjdGlvblxuXHRcdFx0XHQvLyB0aGlzIGlzIHdoeSBhY3Rpb25UeXBlIGlzIGFuIGFyZyBoZXJlLi4uLlxuXHRcdFx0fSovXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHRmb3IgKCB2YXIgWyBrZXksIGl0ZW0gXSBvZiBlbnRyaWVzKCBsb29rdXAgKSApIHtcblx0XHR0cmVlWyBpdGVtLmdlbiBdID0gdHJlZVsgaXRlbS5nZW4gXSB8fCBbXTtcblx0XHR0cmVlWyBpdGVtLmdlbiBdLnB1c2goIGl0ZW0gKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKCB7XG5cdFx0XHRkZXBzOiBfLnBpY2soIHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yIClcblx0XHR9LCBhY3Rpb24gKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0pO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xuXHRcdHN1cGVyKCB7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IGx1eEFjdGlvbjtcblx0XHRcdFx0XHRcdGlmKGx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0WyBmb3IgKCBnZW5lcmF0aW9uIG9mIGx1eEFjdGlvbi5nZW5lcmF0aW9ucyApXG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICkgXTtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oIGx1eEFjdGlvbiwgZGF0YSApIHtcblx0XHRcdFx0XHRcdGlmKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYoIGx1eEFjdGlvbi51cGRhdGVkLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IGx1eEFjdGlvbi51cGRhdGVkIH0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGlmeWluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aGFuZGxlZDoge31cblx0XHRcdH0sXG5cdFx0XHRnZXRTdG9yZXNIYW5kbGluZyggYWN0aW9uVHlwZSApIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25UeXBlIF0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdGdlbmVyYXRpb25zOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuY3JlYXRlU3Vic2NyaWJlcnMoKTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhICkge1xuXHRcdHZhciBsdXhBY3Rpb24gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0eyBhY3Rpb246IGRhdGEsIGdlbmVyYXRpb25JbmRleDogMCwgdXBkYXRlZDogW10gfSxcblx0XHRcdHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcoIGRhdGEuYWN0aW9uVHlwZSApXG5cdFx0KTtcblx0XHR0aGlzLmhhbmRsZSggbHV4QWN0aW9uLCBcImFjdGlvbi5kaXNwYXRjaFwiICk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKCBzdG9yZU1ldGEgKSB7XG5cdFx0Zm9yICggdmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucyApIHtcblx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdH07XG5cdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSB8fCBbXTtcblx0XHRcdGFjdGlvbi5wdXNoKCBhY3Rpb25NZXRhICk7XG5cdFx0fVxuXHR9XG5cblx0cmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0XHR2YXIgaXNUaGlzTmFtZVNwYWNlID0gZnVuY3Rpb24oIG1ldGEgKSB7XG5cdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHR9O1xuXHRcdGZvciggdmFyIFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHR2YXIgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYoIGlkeCAhPT0gLTEgKSB7XG5cdFx0XHRcdHYuc3BsaWNlKCBpZHgsIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjcmVhdGVTdWJzY3JpYmVycygpIHtcblx0XHRpZiggIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gZ2V0R3JvdXBzV2l0aEFjdGlvbiggYWN0aW9uTmFtZSApIHtcblx0dmFyIGdyb3VwcyA9IFtdO1xuXHRmb3IoIHZhciBbIGdyb3VwLCBsaXN0IF0gb2YgZW50cmllcyggYWN0aW9uR3JvdXBzICkgKSB7XG5cdFx0aWYoIGxpc3QuaW5kZXhPZiggYWN0aW9uTmFtZSApID49IDAgKSB7XG5cdFx0XHRncm91cHMucHVzaCggZ3JvdXAgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuLy8gTk9URSAtIHRoZXNlIHdpbGwgZXZlbnR1YWxseSBsaXZlIGluIHRoZWlyIG93biBhZGQtb24gbGliIG9yIGluIGEgZGVidWcgYnVpbGQgb2YgbHV4XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xudmFyIHV0aWxzID0ge1xuXHRwcmludEFjdGlvbnMoKSB7XG5cdFx0dmFyIGFjdGlvbkxpc3QgPSBPYmplY3Qua2V5cyggYWN0aW9ucyApXG5cdFx0XHQubWFwKCBmdW5jdGlvbiggeCApIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcImFjdGlvbiBuYW1lXCIgOiB4LFxuXHRcdFx0XHRcdFwic3RvcmVzXCIgOiBkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKCB4ICkuc3RvcmVzLm1hcCggZnVuY3Rpb24oIHggKSB7IHJldHVybiB4Lm5hbWVzcGFjZTsgfSApLmpvaW4oIFwiLFwiICksXG5cdFx0XHRcdFx0XCJncm91cHNcIiA6IGdldEdyb3Vwc1dpdGhBY3Rpb24oIHggKS5qb2luKCBcIixcIiApXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRpZiggY29uc29sZSAmJiBjb25zb2xlLnRhYmxlICkge1xuXHRcdFx0Y29uc29sZS5ncm91cCggXCJDdXJyZW50bHkgUmVjb2duaXplZCBBY3Rpb25zXCIgKTtcblx0XHRcdGNvbnNvbGUudGFibGUoIGFjdGlvbkxpc3QgKTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHR9IGVsc2UgaWYgKCBjb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xuXHRcdFx0Y29uc29sZS5sb2coIGFjdGlvbkxpc3QgKTtcblx0XHR9XG5cdH0sXG5cblx0cHJpbnRTdG9yZURlcFRyZWUoIGFjdGlvblR5cGUgKSB7XG5cdFx0dmFyIHRyZWUgPSBbXTtcblx0XHRhY3Rpb25UeXBlID0gdHlwZW9mIGFjdGlvblR5cGUgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvblR5cGUgXSA6IGFjdGlvblR5cGU7XG5cdFx0aWYoICFhY3Rpb25UeXBlICkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKCBhY3Rpb25zICk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaCggZnVuY3Rpb24oIGF0ICl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKCBhdCApXG5cdFx0XHQgICAgLmdlbmVyYXRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoIHgubGVuZ3RoICkge1xuXHRcdFx0ICAgICAgICAgICAgdmFyIHQgPSB4LnBvcCgpO1xuXHRcdFx0ICAgICAgICAgICAgdHJlZS5wdXNoKCB7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oIFwiLFwiICksXG5cdFx0XHQgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdCAgICAgICAgICAgIH0gKTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZiggY29uc29sZSAmJiBjb25zb2xlLnRhYmxlICkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWAgKTtcblx0XHRcdFx0Y29uc29sZS50YWJsZSggdHJlZSApO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKCBjb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyggYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCApO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggdHJlZSApO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdHB1Ymxpc2hBY3Rpb24sXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRpbml0UmVhY3QoIHVzZXJSZWFjdCApIHtcblx0XHRcdFJlYWN0ID0gdXNlclJlYWN0O1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRyZWFjdE1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlLFxuXHRcdHN0b3Jlcyxcblx0XHR1dGlsc1xuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9