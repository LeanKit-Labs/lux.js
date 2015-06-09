/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.7.3
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

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
		var Ctor = function Ctor() {}; // placeholder ctor function used to insert level in prototype chain

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
		Ctor.prototype = parent.prototype;
		store.prototype = new Ctor();

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
			}
		};
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
				})
			};

			dispatcher.registerStore({
				namespace: namespace,
				actions: buildActionList(handlers)
			});
		}

		_createClass(Store, {
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
				}
			}
		});

		return Store;
	})();

	Store.extend = extend;

	function removeStore(namespace) {
		stores[namespace].dispose();
	}

	function calculateGen(store, lookup, gen, actionType, namespaces) {
		var calcdGen = gen;
		var _namespaces = namespaces || [];
		if (_namespaces.indexOf(store.namespace) > -1) {
			throw new Error("Circular dependency detected for the \"" + store.namespace + "\" store when participating in the \"" + actionType + "\" action.");
		}
		if (store.waitFor && store.waitFor.length) {
			store.waitFor.forEach(function (dep) {
				var depStore = lookup[dep];
				if (depStore) {
					_namespaces.push(store.namespace);
					var thisGen = calculateGen(depStore, lookup, gen + 1, actionType, _namespaces);
					if (thisGen > calcdGen) {
						calcdGen = thisGen;
					}
				} else {
					console.warn("The \"" + actionType + "\" action in the \"" + store.namespace + "\" store waits for \"" + dep + "\" but a store with that namespace does not participate in this action.");
				}
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
								var _iteratorNormalCompletion = true;
								var _didIteratorError = false;
								var _iteratorError = undefined;

								try {
									for (var _iterator = luxAction.generations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
										var generation = _step.value;

										processGeneration.call(luxAction, generation, luxAction.action);
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

								this.transition(luxAction, "notifying");
							} else {
								this.transition(luxAction, "nothandled");
							}
						},
						"action.handled": function actionHandled(luxAction, data) {
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

		_createClass(Dispatcher, {
			handleActionDispatch: {
				value: function handleActionDispatch(data) {
					var luxAction = Object.assign({ action: data, generationIndex: 0, updated: [] }, this.getStoresHandling(data.actionType));
					this.handle(luxAction, "action.dispatch");
				}
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
				}
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
				}
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
				}
			},
			dispose: {
				value: function dispose() {
					if (this.__subscriptions) {
						this.__subscriptions.forEach(function (subscription) {
							return subscription.unsubscribe();
						});
						this.__subscriptions = null;
					}
				}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsQUFBRSxDQUFBLFVBQVUsSUFBSSxFQUFFLE9BQU8sRUFBRzs7QUFFM0IsS0FBSyxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRzs7QUFFakQsUUFBTSxDQUFFLENBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUUsRUFBRSxPQUFPLENBQUUsQ0FBQztFQUNyRCxNQUFNLElBQUssT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUc7O0FBRTFELFFBQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFFLE9BQU8sQ0FBRSxRQUFRLENBQUUsRUFBRSxPQUFPLENBQUUsU0FBUyxDQUFFLEVBQUUsT0FBTyxDQUFFLFFBQVEsQ0FBRSxDQUFFLENBQUM7RUFDM0YsTUFBTTtBQUNOLE1BQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFFLENBQUM7RUFDeEQ7Q0FDRCxDQUFBLENBQUUsSUFBSSxFQUFFLFVBQVUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUc7O0FBRXZDLEtBQUssQ0FBQyxDQUFFLE9BQU8sTUFBTSxLQUFLLFdBQVcsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFBLENBQUcsY0FBYyxFQUFHO0FBQzFFLFFBQU0sSUFBSSxLQUFLLENBQUUsc0lBQXNJLENBQUUsQ0FBQztFQUMxSjs7QUFFRCxLQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFFLFlBQVksQ0FBRSxDQUFDO0FBQ25ELEtBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUUsV0FBVyxDQUFFLENBQUM7QUFDakQsS0FBSSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFDM0QsS0FBSSxNQUFNLEdBQUcsRUFBRSxDQUFDOzs7QUFHaEIsS0FBSSxPQUFPLDJCQUFHLGlCQUFZLEdBQUc7c0ZBSWxCLENBQUM7Ozs7O0FBSFgsU0FBSyxDQUFFLFFBQVEsRUFBRSxVQUFVLENBQUUsQ0FBQyxPQUFPLENBQUUsT0FBTyxHQUFHLENBQUUsS0FBSyxDQUFDLENBQUMsRUFBRztBQUM1RCxTQUFHLEdBQUcsRUFBRSxDQUFDO01BQ1Q7Ozs7O2lCQUNjLE1BQU0sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFOzs7Ozs7OztBQUF2QixNQUFDOztZQUNKLENBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBRSxDQUFDLENBQUUsQ0FBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUV0QixDQUFBLENBQUM7OztBQUdGLFVBQVMsa0JBQWtCLENBQUUsT0FBTyxFQUFFLFlBQVksRUFBRztBQUNwRCxTQUFPLFlBQVksQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFFLENBQ2xCLFVBQVUsQ0FBRSxVQUFVLElBQUksRUFBRSxRQUFRLEVBQUc7QUFDMUQsVUFBTyxDQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUUsVUFBVSxDQUFFLEFBQUUsSUFDL0MsUUFBUSxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLEFBQUUsQ0FBQztHQUMzQixDQUFFLENBQUM7RUFDdkI7O0FBRUQsVUFBUyxhQUFhLENBQUUsT0FBTyxFQUFHO0FBQ2pDLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUssT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFLEFBQUUsQ0FBQztBQUNwRCxNQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFLLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxBQUFFLENBQUM7QUFDdEQsTUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsR0FBSyxLQUFLLENBQUMsYUFBYSxJQUFJLEVBQUUsQUFBRSxDQUFDO0FBQ3hFLFNBQU8sS0FBSyxDQUFDO0VBQ2I7O0FBRUQsS0FBSSxLQUFLLENBQUM7O0FBRVYsS0FBSSxNQUFNLEdBQUcsa0JBQXVCO29DQUFWLE9BQU87QUFBUCxVQUFPOzs7QUFDaEMsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLE1BQUksS0FBSyxDQUFDO0FBQ1YsTUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLE1BQUksSUFBSSxHQUFHLGdCQUFXLEVBQUUsQ0FBQzs7O0FBR3pCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7Ozs7O0FBQ2hCLHdCQUFpQixPQUFPO1FBQWQsR0FBRzs7QUFDWixVQUFNLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLENBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBRSxDQUFFLENBQUUsQ0FBQztBQUN0RCxXQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDcEIsV0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ2pCOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUUsSUFBSSxFQUFFLENBQUUsRUFBRSxDQUFFLENBQUMsTUFBTSxDQUFFLE9BQU8sQ0FBRSxDQUFFLENBQUM7Ozs7O0FBS2pFLE1BQUssVUFBVSxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUUsYUFBYSxDQUFFLEVBQUc7QUFDL0QsUUFBSyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7R0FDL0IsTUFBTTtBQUNOLFFBQUssR0FBRyxZQUFXO0FBQ2xCLFFBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUUsU0FBUyxDQUFFLENBQUM7QUFDbkMsUUFBSSxDQUFFLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBRSxDQUFDLENBQUUsSUFBSSxFQUFFLENBQUM7QUFDNUIsVUFBTSxDQUFDLEtBQUssQ0FBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFFLENBQUUsQ0FBQztJQUNsRCxDQUFDO0dBQ0Y7O0FBRUQsT0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7OztBQUd0QixHQUFDLENBQUMsS0FBSyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUUsQ0FBQzs7OztBQUl6QixNQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbEMsT0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOzs7O0FBSTdCLE1BQUssVUFBVSxFQUFHO0FBQ2pCLElBQUMsQ0FBQyxNQUFNLENBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUUsQ0FBQztHQUN4Qzs7O0FBR0QsT0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOzs7QUFHcEMsT0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25DLFNBQU8sS0FBSyxDQUFDO0VBQ2IsQ0FBQzs7QUFJSCxLQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ3BDLEtBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQzs7QUFFdEIsVUFBUyxlQUFlLENBQUUsUUFBUSxFQUFHO0FBQ3BDLE1BQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7Ozs7O0FBQ3BCLHdCQUE4QixPQUFPLENBQUUsUUFBUSxDQUFFOzs7UUFBckMsR0FBRztRQUFFLE9BQU87O0FBQ3ZCLGNBQVUsQ0FBQyxJQUFJLENBQUU7QUFDaEIsZUFBVSxFQUFFLEdBQUc7QUFDZixZQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFO0tBQzlCLENBQUUsQ0FBQztJQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsU0FBTyxVQUFVLENBQUM7RUFDbEI7O0FBRUQsVUFBUyxhQUFhLENBQUUsTUFBTSxFQUFZO29DQUFQLElBQUk7QUFBSixPQUFJOzs7QUFDdEMsTUFBSyxPQUFPLENBQUUsTUFBTSxDQUFFLEVBQUc7QUFDeEIsVUFBTyxDQUFFLE1BQU0sT0FBRSxDQUFqQixPQUFPLEVBQWUsSUFBSSxDQUFFLENBQUM7R0FDN0IsTUFBTTtBQUNOLFNBQU0sSUFBSSxLQUFLLGdDQUErQixNQUFNLE9BQUssQ0FBQztHQUMxRDtFQUNEOztBQUVELFVBQVMscUJBQXFCLENBQUUsVUFBVSxFQUFHO0FBQzVDLFlBQVUsR0FBRyxBQUFFLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FBSyxDQUFFLFVBQVUsQ0FBRSxHQUFHLFVBQVUsQ0FBQztBQUM5RSxZQUFVLENBQUMsT0FBTyxDQUFFLFVBQVUsTUFBTSxFQUFHO0FBQ3RDLE9BQUssQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLEVBQUc7QUFDekIsV0FBTyxDQUFFLE1BQU0sQ0FBRSxHQUFHLFlBQVc7QUFDOUIsU0FBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUNuQyxrQkFBYSxDQUFDLE9BQU8sQ0FBRTtBQUN0QixXQUFLLGVBQWEsTUFBTSxBQUFFO0FBQzFCLFVBQUksRUFBRTtBQUNMLGlCQUFVLEVBQUUsTUFBTTtBQUNsQixpQkFBVSxFQUFFLElBQUk7T0FDaEI7TUFDRCxDQUFFLENBQUM7S0FDSixDQUFDO0lBQ0Y7R0FDRCxDQUFFLENBQUM7RUFDSjs7QUFFRCxVQUFTLGNBQWMsQ0FBRSxLQUFLLEVBQUc7QUFDaEMsTUFBSyxZQUFZLENBQUUsS0FBSyxDQUFFLEVBQUc7QUFDNUIsVUFBTyxDQUFDLENBQUMsSUFBSSxDQUFFLE9BQU8sRUFBRSxZQUFZLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztHQUNoRCxNQUFNO0FBQ04sU0FBTSxJQUFJLEtBQUssc0NBQXFDLEtBQUssT0FBSyxDQUFDO0dBQy9EO0VBQ0Q7O0FBRUQsVUFBUyxtQkFBbUIsQ0FBRSxNQUFNLEVBQUc7QUFDdEMsU0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBRSxDQUFDO0VBQzNDOztBQUVELFVBQVMsZ0JBQWdCLENBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRztBQUNsRCxNQUFJLEtBQUssR0FBRyxZQUFZLENBQUUsU0FBUyxDQUFFLENBQUM7QUFDdEMsTUFBSyxDQUFDLEtBQUssRUFBRztBQUNiLFFBQUssR0FBRyxZQUFZLENBQUUsU0FBUyxDQUFFLEdBQUcsRUFBRSxDQUFDO0dBQ3ZDO0FBQ0QsWUFBVSxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FBRyxDQUFFLFVBQVUsQ0FBRSxHQUFHLFVBQVUsQ0FBQztBQUMxRSxNQUFJLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFFLENBQUM7QUFDOUQsTUFBSyxJQUFJLENBQUMsTUFBTSxFQUFHO0FBQ2xCLFNBQU0sSUFBSSxLQUFLLDBDQUF5QyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBRSxDQUFJLENBQUM7R0FDOUU7QUFDRCxZQUFVLENBQUMsT0FBTyxDQUFFLFVBQVUsTUFBTSxFQUFHO0FBQ3RDLE9BQUssS0FBSyxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsS0FBSyxDQUFDLENBQUMsRUFBRztBQUNyQyxTQUFLLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3JCO0dBQ0QsQ0FBRSxDQUFDO0VBQ0o7Ozs7O0FBU0QsVUFBUyxVQUFVLENBQUUsS0FBSyxFQUFFLElBQUksRUFBRztBQUNsQyxNQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsU0FBTyxDQUFFLEtBQUssQ0FBRSxHQUFHLElBQUksQ0FBQztBQUN4QixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUV2QixNQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsQ0FBQzs7QUFFM0MsTUFBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUc7QUFDakIsUUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUUsS0FBSyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ2pDLFFBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDOztBQUVoQyxPQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRztBQUNqQyxTQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQzNDO0dBQ0QsTUFBTTtBQUNOLE9BQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxJQUFJLEVBQUUsT0FBTyxDQUFFLENBQUM7R0FDM0M7RUFDRDs7QUFFRCxVQUFTLGVBQWUsQ0FBRSxJQUFJLEVBQUc7OztBQUNoQyxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FDdEMsVUFBRSxJQUFJO1VBQU0sT0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUUsR0FBRyxDQUFDLENBQUM7R0FBQSxDQUNyRCxDQUFDO0VBQ0Y7O0FBRUQsS0FBSSxhQUFhLEdBQUc7QUFDbkIsT0FBSyxFQUFFLGlCQUFXOzs7QUFDakIsT0FBSSxLQUFLLEdBQUcsYUFBYSxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ2xDLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLEFBQUUsQ0FBQzs7QUFFakQsT0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRztBQUNsRCxVQUFNLElBQUksS0FBSyxzREFBd0QsQ0FBQztJQUN4RTs7QUFFRCxPQUFJLFFBQVEsR0FBRyxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLENBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRTNGLE9BQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFHO0FBQ3ZCLFVBQU0sSUFBSSxLQUFLLGdFQUErRCxRQUFRLDhDQUE0QyxDQUFDO0lBQ25JOztBQUVELFFBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVyQixXQUFRLENBQUMsT0FBTyxDQUFFLFVBQUUsS0FBSyxFQUFNO0FBQzlCLFNBQUssQ0FBQyxhQUFhLE1BQUssS0FBSyxjQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsTUFBSyxLQUFLLGVBQVk7WUFBTSxVQUFVLENBQUMsSUFBSSxTQUFRLEtBQUssQ0FBRTtLQUFBLENBQUUsQ0FBQztJQUMvSCxDQUFFLENBQUM7O0FBRUosUUFBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFFLFdBQVcsRUFBRSxVQUFFLElBQUk7V0FBTSxlQUFlLENBQUMsSUFBSSxTQUFRLElBQUksQ0FBRTtJQUFBLENBQUUsQ0FBQztHQUMzSDtBQUNELFVBQVEsRUFBRSxvQkFBVzs7Ozs7O0FBQ3BCLHlCQUEwQixPQUFPLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUU7OztTQUFqRCxHQUFHO1NBQUUsR0FBRzs7QUFDbkIsU0FBSSxLQUFLLENBQUM7QUFDVixTQUFLLEdBQUcsS0FBSyxXQUFXLElBQU0sQ0FBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBRSxHQUFHLENBQUUsQ0FBQSxJQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxTQUFTLEFBQUUsRUFBRztBQUMzRixTQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7TUFDbEI7S0FDRDs7Ozs7Ozs7Ozs7Ozs7O0dBQ0Q7QUFDRCxPQUFLLEVBQUUsRUFBRTtFQUNULENBQUM7O0FBRUYsS0FBSSxrQkFBa0IsR0FBRztBQUN4QixvQkFBa0IsRUFBRSxhQUFhLENBQUMsS0FBSztBQUN2QyxzQkFBb0IsRUFBRSxhQUFhLENBQUMsUUFBUTtFQUM1QyxDQUFDOzs7Ozs7QUFNRixLQUFJLHFCQUFxQixHQUFHO0FBQzNCLE9BQUssRUFBRSxpQkFBVzs7O0FBQ2pCLE9BQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7QUFDaEQsT0FBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQzs7QUFFeEMsT0FBSyxPQUFPLElBQUksQ0FBQyxjQUFjLEtBQUssUUFBUSxFQUFHO0FBQzlDLFFBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBRSxJQUFJLENBQUMsY0FBYyxDQUFFLENBQUM7SUFDOUM7O0FBRUQsT0FBSyxPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUFHO0FBQzFDLFFBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUFFLENBQUM7SUFDdEM7O0FBRUQsT0FBSSxxQkFBcUIsR0FBRyxVQUFFLENBQUMsRUFBRSxDQUFDLEVBQU07QUFDdkMsUUFBSyxDQUFDLE9BQU0sQ0FBQyxDQUFFLEVBQUc7QUFDakIsWUFBTSxDQUFDLENBQUUsR0FBRyxDQUFDLENBQUM7S0FDZDtJQUNELENBQUM7QUFDRixPQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBRSxVQUFFLEtBQUssRUFBTTs7Ozs7O0FBQ3pDLDBCQUFzQixPQUFPLENBQUUsY0FBYyxDQUFFLEtBQUssQ0FBRSxDQUFFOzs7VUFBNUMsQ0FBQztVQUFFLENBQUM7O0FBQ2YsMkJBQXFCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO01BQzlCOzs7Ozs7Ozs7Ozs7Ozs7SUFDRCxDQUFFLENBQUM7O0FBRUosT0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRztBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBRSxVQUFVLEdBQUcsRUFBRztBQUN4QywwQkFBcUIsQ0FBRSxHQUFHLEVBQUUsWUFBVztBQUN0QyxtQkFBYSxtQkFBRSxHQUFHLHFCQUFLLFNBQVMsR0FBRSxDQUFDO01BQ25DLENBQUUsQ0FBQztLQUNKLENBQUUsQ0FBQztJQUNKO0dBQ0Q7QUFDRCxPQUFLLEVBQUU7QUFDTixnQkFBYSxFQUFFLGFBQWE7R0FDNUI7RUFDRCxDQUFDOztBQUVGLEtBQUksMEJBQTBCLEdBQUc7QUFDaEMsb0JBQWtCLEVBQUUscUJBQXFCLENBQUMsS0FBSztBQUMvQyxlQUFhLEVBQUUsYUFBYTtFQUM1QixDQUFDOzs7OztBQUtGLEtBQUksc0JBQXNCLEdBQUcsa0NBQWtFOzBDQUFMLEVBQUU7O01BQW5ELFFBQVEsUUFBUixRQUFRO01BQUUsU0FBUyxRQUFULFNBQVM7TUFBRSxPQUFPLFFBQVAsT0FBTztNQUFFLE9BQU8sUUFBUCxPQUFPO01BQUUsS0FBSyxRQUFMLEtBQUs7O0FBQ3BGLFNBQU87QUFDTixRQUFLLEVBQUEsaUJBQUc7QUFDUCxXQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQztBQUMxQixRQUFJLEtBQUssR0FBRyxhQUFhLENBQUUsT0FBTyxDQUFFLENBQUM7QUFDckMsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUMvQixZQUFRLEdBQUcsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDeEMsV0FBTyxHQUFHLE9BQU8sSUFBSSxhQUFhLENBQUM7QUFDbkMsU0FBSyxHQUFHLEtBQUssSUFBSSxXQUFXLENBQUM7QUFDN0IsYUFBUyxHQUFHLFNBQVMsSUFBTSxVQUFFLElBQUksRUFBRSxHQUFHLEVBQU07QUFDM0MsU0FBSSxPQUFPLENBQUM7QUFDWixTQUFLLE9BQU8sR0FBRyxRQUFRLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBRSxFQUFHO0FBQzVDLGFBQU8sQ0FBQyxLQUFLLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUUsQ0FBQztNQUMxQztLQUNELEFBQUUsQ0FBQztBQUNKLFFBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDLE1BQU0sRUFBRztBQUNuRCxXQUFNLElBQUksS0FBSyxDQUFFLG9FQUFvRSxDQUFFLENBQUM7S0FDeEYsTUFBTSxJQUFLLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFHOzs7QUFHekMsWUFBTztLQUNQO0FBQ0QsUUFBSSxDQUFDLGNBQWMsR0FDbEIsa0JBQWtCLENBQ2pCLE9BQU8sRUFDUCxPQUFPLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxTQUFTLENBQUUsQ0FDckMsQ0FBQztBQUNILFFBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUUsUUFBUSxDQUFFLENBQUM7QUFDMUMseUJBQXFCLENBQUUsV0FBVyxDQUFFLENBQUM7QUFDckMsUUFBSyxPQUFPLENBQUMsU0FBUyxFQUFHO0FBQ3hCLHFCQUFnQixDQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFFLENBQUM7S0FDbkQ7SUFDRDtBQUNELFdBQVEsRUFBQSxvQkFBRztBQUNWLFFBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0RDtHQUNELENBQUM7RUFDRixDQUFDOzs7OztBQUtGLFVBQVMsV0FBVyxDQUFFLFVBQVUsRUFBRztBQUNsQyxNQUFLLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRztBQUNuQyxTQUFNLElBQUksS0FBSyxDQUFFLDJCQUEyQixHQUFHLFVBQVUsR0FBRyxnREFBZ0QsQ0FBRSxDQUFDO0dBQy9HO0VBQ0Q7O0FBRUQsVUFBUyxjQUFjLENBQUUsT0FBTyxFQUFHO0FBQ2xDLGFBQVcsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO0FBQ2hDLE1BQUksR0FBRyxHQUFHO0FBQ1QsU0FBTSxFQUFFLENBQUUsa0JBQWtCLEVBQUUsMEJBQTBCLENBQUUsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUU7R0FDekYsQ0FBQztBQUNGLFNBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN0QixTQUFPLEtBQUssQ0FBQyxXQUFXLENBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQztFQUMxRDs7QUFFRCxVQUFTLFNBQVMsQ0FBRSxPQUFPLEVBQUc7QUFDN0IsYUFBVyxDQUFFLFdBQVcsQ0FBRSxDQUFDO0FBQzNCLE1BQUksR0FBRyxHQUFHO0FBQ1QsU0FBTSxFQUFFLENBQUUsMEJBQTBCLENBQUUsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUU7R0FDckUsQ0FBQztBQUNGLFNBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN0QixTQUFPLEtBQUssQ0FBQyxXQUFXLENBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFLENBQUUsQ0FBQztFQUMxRDs7Ozs7QUFLRCxLQUFJLGVBQWUsR0FBRywyQkFBVzs7O0FBQ2hDLE1BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxVQUFFLE1BQU07VUFBTSxNQUFNLENBQUMsSUFBSSxRQUFRO0dBQUEsQ0FBRSxDQUFDO0FBQ2hFLE1BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUMvQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0VBQzFCLENBQUM7O0FBRUYsVUFBUyxLQUFLLENBQUUsT0FBTyxFQUFjO29DQUFULE1BQU07QUFBTixTQUFNOzs7QUFDakMsTUFBSyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRztBQUMxQixTQUFNLEdBQUcsQ0FBRSxhQUFhLEVBQUUscUJBQXFCLENBQUUsQ0FBQztHQUNsRDs7QUFFRCxRQUFNLENBQUMsT0FBTyxDQUFFLFVBQUUsS0FBSyxFQUFNO0FBQzVCLE9BQUssT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFHO0FBQ2xDLFNBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztJQUNoQjtBQUNELE9BQUssS0FBSyxDQUFDLEtBQUssRUFBRztBQUNsQixVQUFNLENBQUMsTUFBTSxDQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUM7SUFDdEM7QUFDRCxPQUFLLE9BQU8sS0FBSyxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUc7QUFDeEMsVUFBTSxJQUFJLEtBQUssQ0FBRSx3R0FBd0csQ0FBRSxDQUFDO0lBQzVIO0FBQ0QsUUFBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFFLENBQUM7QUFDNUIsT0FBSyxLQUFLLENBQUMsUUFBUSxFQUFHO0FBQ3JCLFdBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsUUFBUSxDQUFFLENBQUM7SUFDN0M7R0FDRCxDQUFFLENBQUM7QUFDSixTQUFPLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQztBQUNyQyxTQUFPLE9BQU8sQ0FBQztFQUNmOztBQUVELE1BQUssQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO0FBQzVCLE1BQUssQ0FBQyxhQUFhLEdBQUcscUJBQXFCLENBQUM7QUFDNUMsTUFBSyxDQUFDLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQzs7QUFFOUMsS0FBSSxVQUFVLEdBQUc7QUFDaEIsZUFBYSxFQUFFLDBCQUEwQjtBQUN6QyxPQUFLLEVBQUUsa0JBQWtCO0VBQ3pCLENBQUM7O0FBRUYsVUFBUyxjQUFjLENBQUUsTUFBTSxFQUFHO0FBQ2pDLFNBQU8sS0FBSyxDQUFFLE1BQU0sRUFBRSxzQkFBc0IsQ0FBRSxDQUFDO0VBQy9DOztBQUVELFVBQVMsYUFBYSxDQUFFLE1BQU0sRUFBRztBQUNoQyxTQUFPLEtBQUssQ0FBRSxNQUFNLEVBQUUscUJBQXFCLENBQUUsQ0FBQztFQUM5Qzs7QUFFRCxVQUFTLHFCQUFxQixDQUFFLE1BQU0sRUFBRztBQUN4QyxTQUFPLGFBQWEsQ0FBRSxjQUFjLENBQUUsTUFBTSxDQUFFLENBQUUsQ0FBQztFQUNqRDs7QUFLRCxVQUFTLGtCQUFrQixDQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFHO0FBQ3ZELE1BQUksU0FBUyxHQUFHLEFBQUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNwRSxNQUFLLFNBQVMsSUFBSSxNQUFNLEVBQUc7QUFDMUIsU0FBTSxJQUFJLEtBQUssNEJBQTBCLFNBQVMsd0JBQXFCLENBQUM7R0FDeEU7QUFDRCxNQUFLLENBQUMsU0FBUyxFQUFHO0FBQ2pCLFNBQU0sSUFBSSxLQUFLLENBQUUsa0RBQWtELENBQUUsQ0FBQztHQUN0RTtBQUNELE1BQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDLE1BQU0sRUFBRztBQUNuRCxTQUFNLElBQUksS0FBSyxDQUFFLHVEQUF1RCxDQUFFLENBQUM7R0FDM0U7RUFDRDs7QUFFRCxVQUFTLGdCQUFnQixDQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFHO0FBQ3JELFNBQU87QUFDTixVQUFPLEVBQUUsRUFBRTtBQUNYLFVBQU8sRUFBRSxtQkFBVztBQUNuQixRQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUNuQyxhQUFTLENBQUUsR0FBRyxDQUFFLENBQUMsT0FBTyxDQUFFLENBQUEsVUFBVSxRQUFRLEVBQUc7QUFDOUMsWUFBTyxJQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUUsSUFBSSxFQUFFLElBQUksQ0FBRSxLQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxBQUFFLENBQUM7S0FDOUQsQ0FBQSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsQ0FBRSxDQUFDO0FBQ2pCLFdBQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNuQjtHQUNELENBQUM7RUFDRjs7QUFFRCxVQUFTLGFBQWEsQ0FBRSxNQUFNLEVBQUUsYUFBYSxFQUFHO0FBQy9DLE1BQUssTUFBTSxDQUFDLE9BQU8sRUFBRztBQUNyQixTQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxVQUFVLEdBQUcsRUFBRztBQUN2QyxRQUFLLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBRSxLQUFLLENBQUMsQ0FBQyxFQUFHO0FBQ2xELGtCQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBQztLQUNsQztJQUNELENBQUUsQ0FBQztHQUNKO0VBQ0Q7O0FBRUQsVUFBUyxZQUFZLENBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUc7QUFDaEQsV0FBUyxDQUFFLEdBQUcsQ0FBRSxHQUFHLFNBQVMsQ0FBRSxHQUFHLENBQUUsSUFBSSxFQUFFLENBQUM7QUFDMUMsV0FBUyxDQUFFLEdBQUcsQ0FBRSxDQUFDLElBQUksQ0FBRSxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFDO0VBQ3BEOztBQUVELFVBQVMsZ0JBQWdCLEdBQWU7b0NBQVYsT0FBTztBQUFQLFVBQU87OztBQUNwQyxNQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsTUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLE1BQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNuQixTQUFPLENBQUMsT0FBTyxDQUFFLFVBQVUsQ0FBQyxFQUFHO0FBQzlCLE9BQUksR0FBRyxDQUFDO0FBQ1IsT0FBSyxDQUFDLEVBQUc7QUFDUixPQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUNuQixLQUFDLENBQUMsS0FBSyxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUM7QUFDNUIsUUFBSyxHQUFHLENBQUMsUUFBUSxFQUFHO0FBQ25CLFdBQU0sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDLE9BQU8sQ0FBRSxVQUFVLEdBQUcsRUFBRztBQUNwRCxVQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFFLEdBQUcsQ0FBRSxDQUFDOzs7QUFHbEMsY0FBUSxDQUFFLEdBQUcsQ0FBRSxHQUFHLFFBQVEsQ0FBRSxHQUFHLENBQUUsSUFBSSxnQkFBZ0IsQ0FBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBRSxDQUFDOzs7QUFHbEYsbUJBQWEsQ0FBRSxPQUFPLEVBQUUsUUFBUSxDQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUM7O0FBRTFDLGtCQUFZLENBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUUsQ0FBQztNQUN4QyxDQUFFLENBQUM7S0FDSjtBQUNELFdBQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUNwQixXQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDakIsS0FBQyxDQUFDLEtBQUssQ0FBRSxTQUFTLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDMUI7R0FDRCxDQUFFLENBQUM7QUFDSixTQUFPLENBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUUsQ0FBQztFQUN0Qzs7S0FFSyxLQUFLO0FBRUMsV0FGTixLQUFLLEdBRVk7cUNBQU4sR0FBRztBQUFILE9BQUc7Ozt5QkFGZCxLQUFLOztpQ0FHMEIsZ0JBQWdCLGtCQUFLLEdBQUcsQ0FBRTs7OztPQUF2RCxLQUFLO09BQUUsUUFBUTtPQUFFLE9BQU87O0FBQzlCLHFCQUFrQixDQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDOUMsT0FBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxNQUFNLENBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0FBQy9CLFNBQU0sQ0FBRSxTQUFTLENBQUUsR0FBRyxJQUFJLENBQUM7QUFDM0IsT0FBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLE9BQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDOztBQUV4QixPQUFJLENBQUMsUUFBUSxHQUFHLFlBQVc7QUFDMUIsV0FBTyxLQUFLLENBQUM7SUFDYixDQUFDOztBQUVGLE9BQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxRQUFRLEVBQUc7QUFDcEMsUUFBSyxDQUFDLFVBQVUsRUFBRztBQUNsQixXQUFNLElBQUksS0FBSyxDQUFFLGtGQUFrRixDQUFFLENBQUM7S0FDdEc7QUFDRCxTQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBRSxLQUFLLEVBQUUsUUFBUSxDQUFFLENBQUM7SUFDekMsQ0FBQzs7QUFFRixPQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsUUFBUSxFQUFHO0FBQ3hDLFFBQUssQ0FBQyxVQUFVLEVBQUc7QUFDbEIsV0FBTSxJQUFJLEtBQUssQ0FBRSxzRkFBc0YsQ0FBRSxDQUFDO0tBQzFHOztBQUVELFVBQU0sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUMsT0FBTyxDQUFFLFVBQVUsR0FBRyxFQUFHO0FBQzdDLFlBQU8sS0FBSyxDQUFFLEdBQUcsQ0FBRSxDQUFDO0tBQ3BCLENBQUUsQ0FBQztBQUNKLFNBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFFLEtBQUssRUFBRSxRQUFRLENBQUUsQ0FBQztJQUN6QyxDQUFDOztBQUVGLE9BQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxLQUFLLEdBQUc7QUFDN0IsY0FBVSxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFLLElBQUksQ0FBQyxVQUFVLEVBQUc7QUFDdEIsU0FBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDeEIsaUJBQVksQ0FBQyxPQUFPLE1BQUssSUFBSSxDQUFDLFNBQVMsY0FBWSxDQUFDO0tBQ3BEO0lBQ0QsQ0FBQzs7QUFFRixRQUFLLENBQUUsSUFBSSxFQUFFLHNCQUFzQixDQUFFO0FBQ3BDLFdBQU8sRUFBRSxJQUFJO0FBQ2IsV0FBTyxFQUFFLGlCQUFpQjtBQUMxQixTQUFLLE9BQUssU0FBUyxjQUFXO0FBQzlCLFlBQVEsRUFBRSxRQUFRO0FBQ2xCLGFBQVMsRUFBRSxDQUFBLFVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRztBQUNyQyxTQUFLLFFBQVEsQ0FBQyxjQUFjLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBRSxFQUFHO0FBQ2pELGdCQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksR0FBRyxHQUFHLFFBQVEsQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFFLENBQUM7QUFDakcsVUFBSSxDQUFDLFVBQVUsR0FBRyxBQUFFLEdBQUcsS0FBSyxLQUFLLEdBQUssS0FBSyxHQUFHLElBQUksQ0FBQztBQUNuRCx1QkFBaUIsQ0FBQyxPQUFPLE1BQ3JCLElBQUksQ0FBQyxTQUFTLGlCQUFZLElBQUksQ0FBQyxVQUFVLEVBQzVDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FDMUQsQ0FBQztNQUNGO0tBQ0QsQ0FBQSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUU7SUFDZCxDQUFFLENBQUUsQ0FBQzs7QUFFTixPQUFJLENBQUMsY0FBYyxHQUFHO0FBQ3JCLFVBQU0sRUFBRSxrQkFBa0IsQ0FBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxXQUFZLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBRSxDQUFDLFVBQVUsQ0FBRTtZQUFNLFVBQVU7S0FBQSxDQUFFO0lBQ3RILENBQUM7O0FBRUYsYUFBVSxDQUFDLGFBQWEsQ0FDdkI7QUFDQyxhQUFTLEVBQVQsU0FBUztBQUNULFdBQU8sRUFBRSxlQUFlLENBQUUsUUFBUSxDQUFFO0lBQ3BDLENBQ0QsQ0FBQztHQUNGOztlQXJFSSxLQUFLO0FBeUVWLFVBQU87Ozs7O1dBQUEsbUJBQUc7Ozs7OztBQUNULDJCQUFpQyxPQUFPLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBRTs7O1dBQW5ELENBQUM7V0FBRSxZQUFZOztBQUMxQixtQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQzNCOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsWUFBTyxNQUFNLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO0FBQ2hDLGVBQVUsQ0FBQyxXQUFXLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO0FBQ3pDLFNBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNsQjs7OztTQWhGSSxLQUFLOzs7QUFtRlgsTUFBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXRCLFVBQVMsV0FBVyxDQUFFLFNBQVMsRUFBRztBQUNqQyxRQUFNLENBQUUsU0FBUyxDQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDOUI7O0FBSUQsVUFBUyxZQUFZLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRztBQUNuRSxNQUFJLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFDbkIsTUFBSSxXQUFXLEdBQUcsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUNuQyxNQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBRSxHQUFHLENBQUMsQ0FBQyxFQUFHO0FBQ2xELFNBQU0sSUFBSSxLQUFLLDZDQUEyQyxLQUFLLENBQUMsU0FBUyw2Q0FBc0MsVUFBVSxnQkFBYSxDQUFDO0dBQ3ZJO0FBQ0QsTUFBSyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFHO0FBQzVDLFFBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFFLFVBQVUsR0FBRyxFQUFHO0FBQ3RDLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBQztBQUM3QixRQUFLLFFBQVEsRUFBRztBQUNmLGdCQUFXLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBQyxTQUFTLENBQUUsQ0FBQztBQUNwQyxTQUFJLE9BQU8sR0FBRyxZQUFZLENBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUUsQ0FBQztBQUNqRixTQUFLLE9BQU8sR0FBRyxRQUFRLEVBQUc7QUFDekIsY0FBUSxHQUFHLE9BQU8sQ0FBQztNQUNuQjtLQUNELE1BQU07QUFDTixZQUFPLENBQUMsSUFBSSxZQUFVLFVBQVUsMkJBQW9CLEtBQUssQ0FBQyxTQUFTLDZCQUFzQixHQUFHLDZFQUEwRSxDQUFDO0tBQ3ZLO0lBQ0QsQ0FBRSxDQUFDO0dBQ0o7QUFDRCxTQUFPLFFBQVEsQ0FBQztFQUNoQjs7QUFFRCxVQUFTLGdCQUFnQixDQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUc7QUFDL0MsTUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQU0sQ0FBQyxPQUFPLENBQUUsVUFBRSxLQUFLO1VBQU0sTUFBTSxDQUFFLEtBQUssQ0FBQyxTQUFTLENBQUUsR0FBRyxLQUFLO0dBQUEsQ0FBRSxDQUFDO0FBQ2pFLFFBQU0sQ0FBQyxPQUFPLENBQUUsVUFBRSxLQUFLO1VBQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFFO0dBQUEsQ0FBRSxDQUFDOzs7Ozs7QUFDeEYsd0JBQTJCLE9BQU8sQ0FBRSxNQUFNLENBQUU7OztRQUFoQyxHQUFHO1FBQUUsSUFBSTs7QUFDcEIsUUFBSSxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxJQUFJLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxJQUFJLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUUsQ0FBQztJQUM5Qjs7Ozs7Ozs7Ozs7Ozs7OztBQUNELFNBQU8sSUFBSSxDQUFDO0VBQ1o7O0FBRUQsVUFBUyxpQkFBaUIsQ0FBRSxVQUFVLEVBQUUsTUFBTSxFQUFHOzs7QUFDaEQsWUFBVSxDQUFDLEdBQUcsQ0FBRSxVQUFFLEtBQUssRUFBTTtBQUM1QixPQUFJLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFFO0FBQ3pCLFFBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFFLE9BQUssTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUU7SUFDMUMsRUFBRSxNQUFNLENBQUUsQ0FBQztBQUNaLG9CQUFpQixDQUFDLE9BQU8sTUFDckIsS0FBSyxDQUFDLFNBQVMsZ0JBQVcsTUFBTSxDQUFDLFVBQVUsRUFDOUMsSUFBSSxDQUNKLENBQUM7R0FDRixDQUFFLENBQUM7RUFDSjs7S0FFSyxVQUFVO0FBQ0osV0FETixVQUFVLEdBQ0Q7eUJBRFQsVUFBVTs7QUFFZCw4QkFGSSxVQUFVLDZDQUVQO0FBQ04sZ0JBQVksRUFBRSxPQUFPO0FBQ3JCLGFBQVMsRUFBRSxFQUFFO0FBQ2IsVUFBTSxFQUFFO0FBQ1AsVUFBSyxFQUFFO0FBQ04sY0FBUSxFQUFFLG9CQUFXO0FBQ3BCLFdBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO09BQy9CO0FBQ0QsdUJBQWlCLEVBQUUsYUFBYTtNQUNoQztBQUNELGdCQUFXLEVBQUU7QUFDWixjQUFRLEVBQUUsa0JBQVUsU0FBUyxFQUFHO0FBQy9CLFdBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQy9CLFdBQUssU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUc7Ozs7OztBQUNuQyw4QkFBd0IsU0FBUyxDQUFDLFdBQVc7Y0FBbkMsVUFBVTs7QUFDbkIsMkJBQWlCLENBQUMsSUFBSSxDQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBRSxDQUFDO1VBQ2xFOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsWUFBSSxDQUFDLFVBQVUsQ0FBRSxTQUFTLEVBQUUsV0FBVyxDQUFFLENBQUM7UUFDMUMsTUFBTTtBQUNOLFlBQUksQ0FBQyxVQUFVLENBQUUsU0FBUyxFQUFFLFlBQVksQ0FBRSxDQUFDO1FBQzNDO09BQ0Q7QUFDRCxzQkFBZ0IsRUFBRSx1QkFBVSxTQUFTLEVBQUUsSUFBSSxFQUFHO0FBQzdDLFdBQUssSUFBSSxDQUFDLFVBQVUsRUFBRztBQUN0QixpQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO1FBQ3pDO09BQ0Q7QUFDRCxhQUFPLEVBQUUsaUJBQVUsU0FBUyxFQUFHO0FBQzlCLFdBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUc7QUFDL0IseUJBQWlCLENBQUMsT0FBTyxDQUFFLFdBQVcsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUUsQ0FBQztRQUN4RTtPQUNEO01BQ0Q7QUFDRCxjQUFTLEVBQUU7QUFDVixjQUFRLEVBQUUsa0JBQVUsU0FBUyxFQUFHO0FBQy9CLHdCQUFpQixDQUFDLE9BQU8sQ0FBRSxRQUFRLEVBQUU7QUFDcEMsY0FBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1FBQ3hCLENBQUUsQ0FBQztPQUNKO01BQ0Q7QUFDRCxlQUFVLEVBQUUsRUFBRTtLQUNkO0FBQ0QscUJBQWlCLEVBQUEsMkJBQUUsVUFBVSxFQUFHO0FBQy9CLFNBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsVUFBVSxDQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hELFlBQU87QUFDTixZQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFXLEVBQUUsZ0JBQWdCLENBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBRTtNQUNuRCxDQUFDO0tBQ0Y7SUFDRCxFQUFHO0FBQ0osT0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7R0FDekI7O1lBckRJLFVBQVU7O2VBQVYsVUFBVTtBQXVEZix1QkFBb0I7V0FBQSw4QkFBRSxJQUFJLEVBQUc7QUFDNUIsU0FBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDNUIsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUNqRCxJQUFJLENBQUMsaUJBQWlCLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBRSxDQUN6QyxDQUFDO0FBQ0YsU0FBSSxDQUFDLE1BQU0sQ0FBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUUsQ0FBQztLQUM1Qzs7QUFFRCxnQkFBYTtXQUFBLHVCQUFFLFNBQVMsRUFBRzs7Ozs7O0FBQzFCLDJCQUF1QixTQUFTLENBQUMsT0FBTztXQUE5QixTQUFTOztBQUNsQixXQUFJLE1BQU0sQ0FBQztBQUNYLFdBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFDdEMsV0FBSSxVQUFVLEdBQUc7QUFDaEIsaUJBQVMsRUFBRSxTQUFTLENBQUMsU0FBUztBQUM5QixlQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87UUFDMUIsQ0FBQztBQUNGLGFBQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLFVBQVUsQ0FBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsVUFBVSxDQUFFLElBQUksRUFBRSxDQUFDO0FBQzNFLGFBQU0sQ0FBQyxJQUFJLENBQUUsVUFBVSxDQUFFLENBQUM7T0FDMUI7Ozs7Ozs7Ozs7Ozs7OztLQUNEOztBQUVELGNBQVc7V0FBQSxxQkFBRSxTQUFTLEVBQUc7QUFDeEIsU0FBSSxlQUFlLEdBQUcseUJBQVUsSUFBSSxFQUFHO0FBQ3RDLGFBQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUM7TUFDcEMsQ0FBQzs7Ozs7O0FBQ0YsMkJBQXNCLE9BQU8sQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFOzs7V0FBbkMsQ0FBQztXQUFFLENBQUM7O0FBQ2YsV0FBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBRSxlQUFlLENBQUUsQ0FBQztBQUN6QyxXQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRztBQUNqQixTQUFDLENBQUMsTUFBTSxDQUFFLEdBQUcsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUNuQjtPQUNEOzs7Ozs7Ozs7Ozs7Ozs7S0FDRDs7QUFFRCxvQkFBaUI7V0FBQSw2QkFBRzs7O0FBQ25CLFNBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUc7QUFDNUQsVUFBSSxDQUFDLGVBQWUsR0FBRyxDQUN0QixrQkFBa0IsQ0FDakIsSUFBSSxFQUNKLGFBQWEsQ0FBQyxTQUFTLENBQ3RCLFdBQVcsRUFDWCxVQUFFLElBQUksRUFBRSxHQUFHO2NBQU0sT0FBSyxvQkFBb0IsQ0FBRSxJQUFJLENBQUU7T0FBQSxDQUNsRCxDQUNELEVBQ0QsaUJBQWlCLENBQUMsU0FBUyxDQUMxQixhQUFhLEVBQ2IsVUFBRSxJQUFJO2NBQU0sT0FBSyxNQUFNLENBQUUsT0FBSyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFFO09BQUEsQ0FDckUsQ0FBQyxVQUFVLENBQUU7Y0FBTSxDQUFDLENBQUMsT0FBSyxhQUFhO09BQUEsQ0FBRSxDQUMxQyxDQUFDO01BQ0Y7S0FDRDs7QUFFRCxVQUFPO1dBQUEsbUJBQUc7QUFDVCxTQUFLLElBQUksQ0FBQyxlQUFlLEVBQUc7QUFDM0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUUsVUFBRSxZQUFZO2NBQU0sWUFBWSxDQUFDLFdBQVcsRUFBRTtPQUFBLENBQUUsQ0FBQztBQUMvRSxVQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztNQUM1QjtLQUNEOzs7O1NBL0dJLFVBQVU7SUFBUyxPQUFPLENBQUMsYUFBYTs7QUFrSDlDLEtBQUksVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7OztBQUtsQyxVQUFTLG1CQUFtQixDQUFFLFVBQVUsRUFBRztBQUMxQyxNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Ozs7OztBQUNoQix3QkFBNkIsT0FBTyxDQUFFLFlBQVksQ0FBRTs7O1FBQXhDLEtBQUs7UUFBRSxJQUFJOztBQUN0QixRQUFLLElBQUksQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFFLElBQUksQ0FBQyxFQUFHO0FBQ3RDLFdBQU0sQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7S0FDckI7SUFDRDs7Ozs7Ozs7Ozs7Ozs7OztBQUNELFNBQU8sTUFBTSxDQUFDO0VBQ2Q7Ozs7QUFJRCxLQUFJLEtBQUssR0FBRztBQUNYLGNBQVksRUFBQSx3QkFBRztBQUNkLE9BQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFFLENBQ3JDLEdBQUcsQ0FBRSxVQUFVLENBQUMsRUFBRztBQUNuQixXQUFPO0FBQ04sa0JBQWEsRUFBRSxDQUFDO0FBQ2hCLFdBQU0sRUFBRSxVQUFVLENBQUMsaUJBQWlCLENBQUUsQ0FBQyxDQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBRSxVQUFVLENBQUMsRUFBRztBQUNuRSxhQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7TUFDbkIsQ0FBRSxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUU7QUFDZixXQUFNLEVBQUUsbUJBQW1CLENBQUUsQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRTtLQUM1QyxDQUFDO0lBQ0YsQ0FBRSxDQUFDO0FBQ0wsT0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRztBQUMvQixXQUFPLENBQUMsS0FBSyxDQUFFLDhCQUE4QixDQUFFLENBQUM7QUFDaEQsV0FBTyxDQUFDLEtBQUssQ0FBRSxVQUFVLENBQUUsQ0FBQztBQUM1QixXQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsTUFBTSxJQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFHO0FBQ3BDLFdBQU8sQ0FBQyxHQUFHLENBQUUsVUFBVSxDQUFFLENBQUM7SUFDMUI7R0FDRDs7QUFFRCxtQkFBaUIsRUFBQSwyQkFBRSxVQUFVLEVBQUc7QUFDL0IsT0FBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsYUFBVSxHQUFHLE9BQU8sVUFBVSxLQUFLLFFBQVEsR0FBRyxDQUFFLFVBQVUsQ0FBRSxHQUFHLFVBQVUsQ0FBQztBQUMxRSxPQUFLLENBQUMsVUFBVSxFQUFHO0FBQ2xCLGNBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3BDO0FBQ0QsYUFBVSxDQUFDLE9BQU8sQ0FBRSxVQUFVLEVBQUUsRUFBRztBQUNsQyxjQUFVLENBQUMsaUJBQWlCLENBQUUsRUFBRSxDQUFFLENBQzdCLFdBQVcsQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFDLEVBQUc7QUFDdkMsWUFBUSxDQUFDLENBQUMsTUFBTSxFQUFHO0FBQ2xCLFVBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNoQixVQUFJLENBQUMsSUFBSSxDQUFFO0FBQ1Ysb0JBQWEsRUFBRSxFQUFFO0FBQ2pCLHdCQUFpQixFQUFFLENBQUMsQ0FBQyxTQUFTO0FBQzlCLGtCQUFXLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFO0FBQ2xDLGlCQUFVLEVBQUUsQ0FBQyxDQUFDLEdBQUc7T0FDakIsQ0FBRSxDQUFDO01BQ0o7S0FDRyxDQUFFLENBQUM7QUFDUixRQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFHO0FBQy9CLFlBQU8sQ0FBQyxLQUFLLGdDQUErQixFQUFFLENBQUksQ0FBQztBQUNuRCxZQUFPLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ3RCLFlBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuQixNQUFNLElBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUc7QUFDcEMsWUFBTyxDQUFDLEdBQUcsZ0NBQStCLEVBQUUsT0FBSyxDQUFDO0FBQ2xELFlBQU8sQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7S0FDcEI7QUFDRCxRQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBRSxDQUFDO0dBQ0o7RUFDRCxDQUFDOzs7QUFJRCxRQUFPO0FBQ04sU0FBTyxFQUFQLE9BQU87QUFDUCxlQUFhLEVBQWIsYUFBYTtBQUNiLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsV0FBUyxFQUFULFNBQVM7QUFDVCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLGdCQUFjLEVBQWQsY0FBYztBQUNkLE9BQUssRUFBRSxLQUFLO0FBQ1osV0FBUyxFQUFBLG1CQUFFLFNBQVMsRUFBRztBQUN0QixRQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ2xCLFVBQU8sSUFBSSxDQUFDO0dBQ1o7QUFDRCxZQUFVLEVBQVYsVUFBVTtBQUNWLGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0VBQ0wsQ0FBQzs7Q0FFRixDQUFFLENBQUciLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IC0gZG9uJ3QgdGVzdCBVTUQgd3JhcHBlciAqL1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIsIFwibG9kYXNoXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCBcInBvc3RhbFwiICksIHJlcXVpcmUoIFwibWFjaGluYVwiICksIHJlcXVpcmUoIFwibG9kYXNoXCIgKSApO1xuXHR9IGVsc2Uge1xuXHRcdHJvb3QubHV4ID0gZmFjdG9yeSggcm9vdC5wb3N0YWwsIHJvb3QubWFjaGluYSwgcm9vdC5fICk7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEsIF8gKSB7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl9iYWJlbFBvbHlmaWxsICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSBiYWJlbCBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovL2JhYmVsanMuaW8vZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIiApO1xuXHR9XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0dmFyIGVudHJpZXMgPSBmdW5jdGlvbiogKCBvYmogKSB7XG5cdFx0aWYgKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yICggdmFyIGsgb2YgT2JqZWN0LmtleXMoIG9iaiApICkge1xuXHRcdFx0eWllbGQgWyBrLCBvYmpbIGsgXSBdO1xuXHRcdH1cblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oIGNvbnRleHQsIHN1YnNjcmlwdGlvbiApIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNvbnRleHQoIGNvbnRleHQgKVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludCggZnVuY3Rpb24oIGRhdGEsIGVudmVsb3BlICkge1xuXHRcdFx0cmV0dXJuICEoIGVudmVsb3BlLmhhc093blByb3BlcnR5KCBcIm9yaWdpbklkXCIgKSApIHx8XG5cdFx0XHQoIGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpICk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0gKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKSB7XG5cdFx0dmFyIF9fbHV4ID0gY29udGV4dC5fX2x1eCA9ICggY29udGV4dC5fX2x1eCB8fCB7fSApO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9ICggX19sdXguY2xlYW51cCB8fCBbXSApO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9ICggX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSApO1xuXHRcdHJldHVybiBfX2x1eDtcblx0fVxuXG5cdHZhciBSZWFjdDtcblxuXHR2YXIgZXh0ZW5kID0gZnVuY3Rpb24oIC4uLm9wdGlvbnMgKSB7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXM7XG5cdFx0dmFyIHN0b3JlOyAvLyBwbGFjZWhvbGRlciBmb3IgaW5zdGFuY2UgY29uc3RydWN0b3Jcblx0XHR2YXIgc3RvcmVPYmogPSB7fTsgLy8gb2JqZWN0IHVzZWQgdG8gaG9sZCBpbml0aWFsU3RhdGUgJiBzdGF0ZXMgZnJvbSBwcm90b3R5cGUgZm9yIGluc3RhbmNlLWxldmVsIG1lcmdpbmdcblx0XHR2YXIgQ3RvciA9IGZ1bmN0aW9uKCkge307IC8vIHBsYWNlaG9sZGVyIGN0b3IgZnVuY3Rpb24gdXNlZCB0byBpbnNlcnQgbGV2ZWwgaW4gcHJvdG90eXBlIGNoYWluXG5cblx0XHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRcdHZhciBtaXhpbnMgPSBbXTtcblx0XHRmb3IgKCB2YXIgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdFx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHRcdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHRcdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0XHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdFx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRcdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHRcdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdFx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRDdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0c3RvcmUucHJvdG90eXBlID0gbmV3IEN0b3IoKTtcblxuXHRcdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHRcdC8vIGlmIHN1cHBsaWVkLlxuXHRcdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0XHR9XG5cblx0XHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdFx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0XHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRcdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0cmV0dXJuIHN0b3JlO1xuXHR9O1xuXG5cdFxuXG52YXIgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICggdmFyIFsga2V5LCBoYW5kbGVyIF0gb2YgZW50cmllcyggaGFuZGxlcnMgKSApIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goIHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gcHVibGlzaEFjdGlvbiggYWN0aW9uLCAuLi5hcmdzICkge1xuXHRpZiAoIGFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdGFjdGlvbnNbIGFjdGlvbiBdKCAuLi5hcmdzICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2FjdGlvbn0nYCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdCApIHtcblx0YWN0aW9uTGlzdCA9ICggdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgKSA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggIWFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdFx0YWN0aW9uc1sgYWN0aW9uIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApIHtcblx0XHRyZXR1cm4gXy5waWNrKCBhY3Rpb25zLCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gZ3JvdXAgbmFtZWQgJyR7Z3JvdXB9J2AgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKCBhY3Rpb24gKSB7XG5cdGFjdGlvbnMgPSBPYmplY3QuYXNzaWduKCBhY3Rpb25zLCBhY3Rpb24gKTtcbn1cblxuZnVuY3Rpb24gYWRkVG9BY3Rpb25Hcm91cCggZ3JvdXBOYW1lLCBhY3Rpb25MaXN0ICkge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdO1xuXHRpZiAoICFncm91cCApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdHZhciBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmICggZGlmZi5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIGZvbGxvd2luZyBhY3Rpb25zIGRvIG5vdCBleGlzdDogJHtkaWZmLmpvaW4oIFwiLCBcIiApfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYgKCBncm91cC5pbmRleE9mKCBhY3Rpb24gKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKCBhY3Rpb24gKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKCB0aGlzICk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKCB0aGlzLnN0b3JlcyB8fCB7fSApO1xuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvIHx8ICFzdG9yZXMubGlzdGVuVG8ubGVuZ3RoICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgICk7XG5cdFx0fVxuXG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFsgc3RvcmVzLmxpc3RlblRvIF0gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCApO1xuXHRcdH1cblxuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goICggc3RvcmUgKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zWyBgJHtzdG9yZX0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKCB0aGlzLCBzdG9yZSApICk7XG5cdFx0fSApO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoIHZhciBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZiAoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2VudCA9ICggaywgdiApID0+IHtcblx0XHRcdGlmICggIXRoaXNbIGsgXSApIHtcblx0XHRcdFx0dGhpc1sgayBdID0gdjtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCggKCBncm91cCApID0+IHtcblx0XHRcdGZvciAoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSApICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGssIHYgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRpZiAoIHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrZXksIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHB1Ymxpc2hBY3Rpb24oIGtleSwgLi4uYXJndW1lbnRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBwdWJsaXNoQWN0aW9uXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbiggeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30gKSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggY29udGV4dCApO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoICggZGF0YSwgZW52ICkgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYgKCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gc2luY2Ugd2UgcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHQgYWxyZWFkeVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdFx0dmFyIGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoIGhhbmRsZXJzICk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGhhbmRsZXJLZXlzICk7XG5cdFx0XHRpZiAoIGNvbnRleHQubmFtZXNwYWNlICkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKCBjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGVuc3VyZVJlYWN0KCBtZXRob2ROYW1lICkge1xuXHRpZiAoIHR5cGVvZiBSZWFjdCA9PT0gXCJ1bmRlZmluZWRcIiApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IGF0dGVtcHRlZCB0byB1c2UgbHV4LlwiICsgbWV0aG9kTmFtZSArIFwiIHdpdGhvdXQgZmlyc3QgY2FsbGluZyBsdXguaW5pdFJlYWN0KCBSZWFjdCApO1wiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY29udHJvbGxlclZpZXcoIG9wdGlvbnMgKSB7XG5cdGVuc3VyZVJlYWN0KCBcImNvbnRyb2xsZXJWaWV3XCIgKTtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb21wb25lbnRcIiApO1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goICggbWV0aG9kICkgPT4gbWV0aG9kLmNhbGwoIHRoaXMgKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbiggY29udGV4dCwgLi4ubWl4aW5zICkge1xuXHRpZiAoIG1peGlucy5sZW5ndGggPT09IDAgKSB7XG5cdFx0bWl4aW5zID0gWyBsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKCAoIG1peGluICkgPT4ge1xuXHRcdGlmICggdHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmICggbWl4aW4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBtaXhpbi5taXhpbiApO1xuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBtaXhpbi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiAoIG1peGluLnRlYXJkb3duICkge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9ICk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBsdXhBY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbnZhciByZWFjdE1peGluID0ge1xuXHRhY3Rpb25DcmVhdG9yOiBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbixcblx0c3RvcmU6IGx1eFN0b3JlUmVhY3RNaXhpblxufTtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApICk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgc3RvcmUgKSB7XG5cdHZhciBuYW1lc3BhY2UgPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5uYW1lc3BhY2UgKSB8fCBzdG9yZS5uYW1lc3BhY2U7XG5cdGlmICggbmFtZXNwYWNlIGluIHN0b3JlcyApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCApO1xuXHR9XG5cdGlmICggIW5hbWVzcGFjZSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIgKTtcblx0fVxuXHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSAwO1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICkge1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYgKCBzb3VyY2Uud2FpdEZvciApIHtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYgKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKSB7XG5cdGxpc3RlbmVyc1sga2V5IF0gPSBsaXN0ZW5lcnNbIGtleSBdIHx8IFtdO1xuXHRsaXN0ZW5lcnNbIGtleSBdLnB1c2goIGhhbmRsZXIuaGFuZGxlciB8fCBoYW5kbGVyICk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdGlvbnMgKSB7XG5cdHZhciBsaXN0ZW5lcnMgPSB7fTtcblx0dmFyIGhhbmRsZXJzID0ge307XG5cdHZhciBzdGF0ZSA9IHt9O1xuXHR2YXIgb3RoZXJPcHRzID0ge307XG5cdG9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIG8gKSB7XG5cdFx0dmFyIG9wdDtcblx0XHRpZiAoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiAoIG9wdC5oYW5kbGVycyApIHtcblx0XHRcdFx0T2JqZWN0LmtleXMoIG9wdC5oYW5kbGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0dmFyIGhhbmRsZXIgPSBvcHQuaGFuZGxlcnNbIGtleSBdO1xuXHRcdFx0XHRcdC8vIHNldCB1cCB0aGUgYWN0dWFsIGhhbmRsZXIgbWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZFxuXHRcdFx0XHRcdC8vIGFzIHRoZSBzdG9yZSBoYW5kbGVzIGEgZGlzcGF0Y2hlZCBhY3Rpb25cblx0XHRcdFx0XHRoYW5kbGVyc1sga2V5IF0gPSBoYW5kbGVyc1sga2V5IF0gfHwgZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24oIHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggYG5vdGlmeWAsIHRoaXMuZmx1c2ggKSApLmNvbnN0cmFpbnQoICgpID0+IGluRGlzcGF0Y2ggKVxuXHRcdH07XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAoIHZhciBbIGssIHN1YnNjcmlwdGlvbiBdIG9mIGVudHJpZXMoIHRoaXMuX19zdWJzY3JpcHRpb24gKSApIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzWyB0aGlzLm5hbWVzcGFjZSBdO1xuXHRcdGRpc3BhdGNoZXIucmVtb3ZlU3RvcmUoIHRoaXMubmFtZXNwYWNlICk7XG5cdFx0dGhpcy5sdXhDbGVhbnVwKCk7XG5cdH1cbn1cblxuU3RvcmUuZXh0ZW5kID0gZXh0ZW5kO1xuXG5mdW5jdGlvbiByZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRzdG9yZXNbIG5hbWVzcGFjZSBdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUsIG5hbWVzcGFjZXMgKSB7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0dmFyIF9uYW1lc3BhY2VzID0gbmFtZXNwYWNlcyB8fCBbXTtcblx0aWYgKCBfbmFtZXNwYWNlcy5pbmRleE9mKCBzdG9yZS5uYW1lc3BhY2UgKSA+IC0xICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgZm9yIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdoZW4gcGFydGljaXBhdGluZyBpbiB0aGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uLmAgKTtcblx0fVxuXHRpZiAoIHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGggKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwWyBkZXAgXTtcblx0XHRcdGlmICggZGVwU3RvcmUgKSB7XG5cdFx0XHRcdF9uYW1lc3BhY2VzLnB1c2goIHN0b3JlLm5hbWVzcGFjZSApO1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSwgYWN0aW9uVHlwZSwgX25hbWVzcGFjZXMgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oIGBUaGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uIGluIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdhaXRzIGZvciBcIiR7ZGVwfVwiIGJ1dCBhIHN0b3JlIHdpdGggdGhhdCBuYW1lc3BhY2UgZG9lcyBub3QgcGFydGljaXBhdGUgaW4gdGhpcyBhY3Rpb24uYCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IGxvb2t1cFsgc3RvcmUubmFtZXNwYWNlIF0gPSBzdG9yZSApO1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSApICk7XG5cdGZvciAoIHZhciBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuXHRnZW5lcmF0aW9uLm1hcCggKCBzdG9yZSApID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSApO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYgKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSApO1xuXHRcdHRoaXMuY3JlYXRlU3Vic2NyaWJlcnMoKTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhICkge1xuXHRcdHZhciBsdXhBY3Rpb24gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0eyBhY3Rpb246IGRhdGEsIGdlbmVyYXRpb25JbmRleDogMCwgdXBkYXRlZDogW10gfSxcblx0XHRcdHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcoIGRhdGEuYWN0aW9uVHlwZSApXG5cdFx0KTtcblx0XHR0aGlzLmhhbmRsZSggbHV4QWN0aW9uLCBcImFjdGlvbi5kaXNwYXRjaFwiICk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKCBzdG9yZU1ldGEgKSB7XG5cdFx0Zm9yICggdmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucyApIHtcblx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdH07XG5cdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSB8fCBbXTtcblx0XHRcdGFjdGlvbi5wdXNoKCBhY3Rpb25NZXRhICk7XG5cdFx0fVxuXHR9XG5cblx0cmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0XHR2YXIgaXNUaGlzTmFtZVNwYWNlID0gZnVuY3Rpb24oIG1ldGEgKSB7XG5cdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHR9O1xuXHRcdGZvciAoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCB0aGlzLmFjdGlvbk1hcCApICkge1xuXHRcdFx0dmFyIGlkeCA9IHYuZmluZEluZGV4KCBpc1RoaXNOYW1lU3BhY2UgKTtcblx0XHRcdGlmICggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmICggIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gZ2V0R3JvdXBzV2l0aEFjdGlvbiggYWN0aW9uTmFtZSApIHtcblx0dmFyIGdyb3VwcyA9IFtdO1xuXHRmb3IgKCB2YXIgWyBncm91cCwgbGlzdCBdIG9mIGVudHJpZXMoIGFjdGlvbkdyb3VwcyApICkge1xuXHRcdGlmICggbGlzdC5pbmRleE9mKCBhY3Rpb25OYW1lICkgPj0gMCApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKCBncm91cCApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKCBhY3Rpb25zIClcblx0XHRcdC5tYXAoIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIjogeCxcblx0XHRcdFx0XHRzdG9yZXM6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIHggKS5zdG9yZXMubWFwKCBmdW5jdGlvbiggeCApIHtcblx0XHRcdFx0XHRcdHJldHVybiB4Lm5hbWVzcGFjZTtcblx0XHRcdFx0XHR9ICkuam9pbiggXCIsXCIgKSxcblx0XHRcdFx0XHRncm91cHM6IGdldEdyb3Vwc1dpdGhBY3Rpb24oIHggKS5qb2luKCBcIixcIiApXG5cdFx0XHRcdH07XG5cdFx0XHR9ICk7XG5cdFx0aWYgKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKCBcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIiApO1xuXHRcdFx0Y29uc29sZS50YWJsZSggYWN0aW9uTGlzdCApO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggYWN0aW9uTGlzdCApO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZSggYWN0aW9uVHlwZSApIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uVHlwZSBdIDogYWN0aW9uVHlwZTtcblx0XHRpZiAoICFhY3Rpb25UeXBlICkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKCBhY3Rpb25zICk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaCggZnVuY3Rpb24oIGF0ICkge1xuXHRcdFx0ZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyggYXQgKVxuXHRcdFx0ICAgIC5nZW5lcmF0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggeCApIHtcblx0XHRcdFx0d2hpbGUgKCB4Lmxlbmd0aCApIHtcblx0XHRcdFx0XHR2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHRcdFx0dHJlZS5wdXNoKCB7XG5cdFx0XHRcdFx0XHRcImFjdGlvbiB0eXBlXCI6IGF0LFxuXHRcdFx0XHRcdFx0XCJzdG9yZSBuYW1lc3BhY2VcIjogdC5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcIndhaXRzIGZvclwiOiB0LndhaXRGb3Iuam9pbiggXCIsXCIgKSxcblx0XHRcdFx0XHRcdGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cdFx0XHQgICAgfSApO1xuXHRcdFx0aWYgKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKCB0cmVlICk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgICk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCB0cmVlICk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSApO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdHB1Ymxpc2hBY3Rpb24sXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRpbml0UmVhY3QoIHVzZXJSZWFjdCApIHtcblx0XHRcdFJlYWN0ID0gdXNlclJlYWN0O1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHRyZWFjdE1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlLFxuXHRcdHN0b3Jlcyxcblx0XHR1dGlsc1xuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcbn0gKSApO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9