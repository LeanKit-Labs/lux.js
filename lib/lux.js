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
				subs.actionListener = channel.subscribe(topic, handlerFn).context(context);
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
			var _this4 = this;

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
				notify: dispatcherChannel.subscribe("notify", function () {
					return _this4.flush();
				}).constraint(function () {
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
						this.__subscriptions = [actionChannel.subscribe("execute.*", function (data, env) {
							return _this4.handleActionDispatch(data);
						}), dispatcherChannel.subscribe("*.handled.*", function (data) {
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRSxDQUFDO0FBQ3RCLFlBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuQixNQUFNLElBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUc7QUFDcEMsWUFBTyxDQUFDLEdBQUcsZ0NBQStCLEVBQUUsT0FBSyxDQUFDO0FBQ2xELFlBQU8sQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFFLENBQUM7S0FDcEI7QUFDRCxRQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBRSxDQUFDO0dBQ0o7RUFDRCxDQUFDOzs7QUFJRCxRQUFPO0FBQ04sU0FBTyxFQUFQLE9BQU87QUFDUCxlQUFhLEVBQWIsYUFBYTtBQUNiLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsV0FBUyxFQUFULFNBQVM7QUFDVCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLGdCQUFjLEVBQWQsY0FBYztBQUNkLE9BQUssRUFBRSxLQUFLO0FBQ1osV0FBUyxFQUFBLG1CQUFFLFNBQVMsRUFBRztBQUN0QixRQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ2xCLFVBQU8sSUFBSSxDQUFDO0dBQ1o7QUFDRCxZQUFVLEVBQVYsVUFBVTtBQUNWLGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0VBQ0wsQ0FBQzs7Q0FFRixDQUFFLENBQUciLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IC0gZG9uJ3QgdGVzdCBVTUQgd3JhcHBlciAqL1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIsIFwibG9kYXNoXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCBcInBvc3RhbFwiICksIHJlcXVpcmUoIFwibWFjaGluYVwiICksIHJlcXVpcmUoIFwibG9kYXNoXCIgKSApO1xuXHR9IGVsc2Uge1xuXHRcdHJvb3QubHV4ID0gZmFjdG9yeSggcm9vdC5wb3N0YWwsIHJvb3QubWFjaGluYSwgcm9vdC5fICk7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEsIF8gKSB7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl9iYWJlbFBvbHlmaWxsICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSBiYWJlbCBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovL2JhYmVsanMuaW8vZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIiApO1xuXHR9XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0dmFyIGVudHJpZXMgPSBmdW5jdGlvbiogKCBvYmogKSB7XG5cdFx0aWYgKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yICggdmFyIGsgb2YgT2JqZWN0LmtleXMoIG9iaiApICkge1xuXHRcdFx0eWllbGQgWyBrLCBvYmpbIGsgXSBdO1xuXHRcdH1cblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0XHR2YXIgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHR2YXIgUmVhY3Q7XG5cblx0dmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCAuLi5vcHRpb25zICkge1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzO1xuXHRcdHZhciBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdFx0dmFyIHN0b3JlT2JqID0ge307IC8vIG9iamVjdCB1c2VkIHRvIGhvbGQgaW5pdGlhbFN0YXRlICYgc3RhdGVzIGZyb20gcHJvdG90eXBlIGZvciBpbnN0YW5jZS1sZXZlbCBtZXJnaW5nXG5cdFx0dmFyIEN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdFx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0XHR2YXIgbWl4aW5zID0gW107XG5cdFx0Zm9yICggdmFyIG9wdCBvZiBvcHRpb25zICkge1xuXHRcdFx0bWl4aW5zLnB1c2goIF8ucGljayggb3B0LCBbIFwiaGFuZGxlcnNcIiwgXCJzdGF0ZVwiIF0gKSApO1xuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0fVxuXG5cdFx0dmFyIHByb3RvUHJvcHMgPSBfLm1lcmdlLmFwcGx5KCB0aGlzLCBbIHt9IF0uY29uY2F0KCBvcHRpb25zICkgKTtcblxuXHRcdC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3Vcblx0XHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0XHQvLyBieSB1cyB0byBzaW1wbHkgY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IuXG5cdFx0aWYgKCBwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuaGFzT3duUHJvcGVydHkoIFwiY29uc3RydWN0b3JcIiApICkge1xuXHRcdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRcdHBhcmVudC5hcHBseSggdGhpcywgc3RvcmUubWl4aW5zLmNvbmNhdCggYXJncyApICk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHN0b3JlLm1peGlucyA9IG1peGlucztcblxuXHRcdC8vIEluaGVyaXQgY2xhc3MgKHN0YXRpYykgcHJvcGVydGllcyBmcm9tIHBhcmVudC5cblx0XHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0XHQvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuXHRcdC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG5cdFx0Q3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHN0b3JlLnByb3RvdHlwZSA9IG5ldyBDdG9yKCk7XG5cblx0XHQvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgKGluc3RhbmNlIHByb3BlcnRpZXMpIHRvIHRoZSBzdWJjbGFzcyxcblx0XHQvLyBpZiBzdXBwbGllZC5cblx0XHRpZiAoIHByb3RvUHJvcHMgKSB7XG5cdFx0XHRfLmV4dGVuZCggc3RvcmUucHJvdG90eXBlLCBwcm90b1Byb3BzICk7XG5cdFx0fVxuXG5cdFx0Ly8gQ29ycmVjdGx5IHNldCBjaGlsZCdzIGBwcm90b3R5cGUuY29uc3RydWN0b3JgLlxuXHRcdHN0b3JlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN0b3JlO1xuXG5cdFx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0XHRzdG9yZS5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHJldHVybiBzdG9yZTtcblx0fTtcblxuXHRcblxudmFyIGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAoIHZhciBbIGtleSwgaGFuZGxlciBdIG9mIGVudHJpZXMoIGhhbmRsZXJzICkgKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKCB7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9ICk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2hBY3Rpb24oIGFjdGlvbiwgLi4uYXJncyApIHtcblx0aWYgKCBhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRhY3Rpb25zWyBhY3Rpb24gXSggLi4uYXJncyApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHthY3Rpb259J2AgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiAoICFhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRcdGFjdGlvbnNbIGFjdGlvbiBdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCgge1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvciggYWN0aW9uICkge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYgKCAhZ3JvdXAgKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHR2YXIgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiAoIGRpZmYubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBkbyBub3QgZXhpc3Q6ICR7ZGlmZi5qb2luKCBcIiwgXCIgKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9ICk7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyB8fCAhc3RvcmVzLmxpc3RlblRvLmxlbmd0aCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0gKTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggdGhpcywgZGF0YSApICk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKCB2YXIgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYgKCBrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCAoIHNwbGl0ID0ga2V5LnNwbGl0KCBcIi5cIiApICkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkgKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gQ3JlYXRvciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdHZhciBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiAoICF0aGlzWyBrIF0gKSB7XG5cdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IgKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkgKSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrLCB2ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0aWYgKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRwdWJsaXNoQWN0aW9uKCBrZXksIC4uLmFyZ3VtZW50cyApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IHB1Ymxpc2hBY3Rpb25cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oIHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9ICkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmICggaGFuZGxlciA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXSApIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KCBjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFjdGlvbiBoYW5kbGVyIGluIHRoZSBoYW5kbGVycyBwcm9wZXJ0eVwiICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIgKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIHNpbmNlIHdlIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0IGFscmVhZHlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9IGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuICkuY29udGV4dCggY29udGV4dCApO1xuXHRcdFx0dmFyIGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoIGhhbmRsZXJzICk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGhhbmRsZXJLZXlzICk7XG5cdFx0XHRpZiAoIGNvbnRleHQubmFtZXNwYWNlICkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKCBjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGVuc3VyZVJlYWN0KCBtZXRob2ROYW1lICkge1xuXHRpZiAoIHR5cGVvZiBSZWFjdCA9PT0gXCJ1bmRlZmluZWRcIiApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IGF0dGVtcHRlZCB0byB1c2UgbHV4LlwiICsgbWV0aG9kTmFtZSArIFwiIHdpdGhvdXQgZmlyc3QgY2FsbGluZyBsdXguaW5pdFJlYWN0KCBSZWFjdCApO1wiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY29udHJvbGxlclZpZXcoIG9wdGlvbnMgKSB7XG5cdGVuc3VyZVJlYWN0KCBcImNvbnRyb2xsZXJWaWV3XCIgKTtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb21wb25lbnRcIiApO1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goICggbWV0aG9kICkgPT4gbWV0aG9kLmNhbGwoIHRoaXMgKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbiggY29udGV4dCwgLi4ubWl4aW5zICkge1xuXHRpZiAoIG1peGlucy5sZW5ndGggPT09IDAgKSB7XG5cdFx0bWl4aW5zID0gWyBsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKCAoIG1peGluICkgPT4ge1xuXHRcdGlmICggdHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmICggbWl4aW4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBtaXhpbi5taXhpbiApO1xuXHRcdH1cblx0XHRpZiAoIHR5cGVvZiBtaXhpbi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiAoIG1peGluLnRlYXJkb3duICkge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9ICk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBsdXhBY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbnZhciByZWFjdE1peGluID0ge1xuXHRhY3Rpb25DcmVhdG9yOiBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbixcblx0c3RvcmU6IGx1eFN0b3JlUmVhY3RNaXhpblxufTtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApICk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgc3RvcmUgKSB7XG5cdHZhciBuYW1lc3BhY2UgPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5uYW1lc3BhY2UgKSB8fCBzdG9yZS5uYW1lc3BhY2U7XG5cdGlmICggbmFtZXNwYWNlIGluIHN0b3JlcyApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCApO1xuXHR9XG5cdGlmICggIW5hbWVzcGFjZSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIgKTtcblx0fVxuXHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSAwO1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICkge1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYgKCBzb3VyY2Uud2FpdEZvciApIHtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYgKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKSB7XG5cdGxpc3RlbmVyc1sga2V5IF0gPSBsaXN0ZW5lcnNbIGtleSBdIHx8IFtdO1xuXHRsaXN0ZW5lcnNbIGtleSBdLnB1c2goIGhhbmRsZXIuaGFuZGxlciB8fCBoYW5kbGVyICk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdGlvbnMgKSB7XG5cdHZhciBsaXN0ZW5lcnMgPSB7fTtcblx0dmFyIGhhbmRsZXJzID0ge307XG5cdHZhciBzdGF0ZSA9IHt9O1xuXHR2YXIgb3RoZXJPcHRzID0ge307XG5cdG9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIG8gKSB7XG5cdFx0dmFyIG9wdDtcblx0XHRpZiAoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiAoIG9wdC5oYW5kbGVycyApIHtcblx0XHRcdFx0T2JqZWN0LmtleXMoIG9wdC5oYW5kbGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0dmFyIGhhbmRsZXIgPSBvcHQuaGFuZGxlcnNbIGtleSBdO1xuXHRcdFx0XHRcdC8vIHNldCB1cCB0aGUgYWN0dWFsIGhhbmRsZXIgbWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZFxuXHRcdFx0XHRcdC8vIGFzIHRoZSBzdG9yZSBoYW5kbGVzIGEgZGlzcGF0Y2hlZCBhY3Rpb25cblx0XHRcdFx0XHRoYW5kbGVyc1sga2V5IF0gPSBoYW5kbGVyc1sga2V5IF0gfHwgZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCAoKSA9PiB0aGlzLmZsdXNoKCkgKVxuXHRcdFx0XHRcdC5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoIClcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKCB2YXIgWyBrLCBzdWJzY3JpcHRpb24gXSBvZiBlbnRyaWVzKCB0aGlzLl9fc3Vic2NyaXB0aW9uICkgKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1sgdGhpcy5uYW1lc3BhY2UgXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKCB0aGlzLm5hbWVzcGFjZSApO1xuXHRcdHRoaXMubHV4Q2xlYW51cCgpO1xuXHR9XG59XG5cblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlLCBuYW1lc3BhY2VzICkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdHZhciBfbmFtZXNwYWNlcyA9IG5hbWVzcGFjZXMgfHwgW107XG5cdGlmICggX25hbWVzcGFjZXMuaW5kZXhPZiggc3RvcmUubmFtZXNwYWNlICkgPiAtMSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIGZvciB0aGUgXCIke3N0b3JlLm5hbWVzcGFjZX1cIiBzdG9yZSB3aGVuIHBhcnRpY2lwYXRpbmcgaW4gdGhlIFwiJHthY3Rpb25UeXBlfVwiIGFjdGlvbi5gICk7XG5cdH1cblx0aWYgKCBzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoICkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiAoIGRlcFN0b3JlICkge1xuXHRcdFx0XHRfbmFtZXNwYWNlcy5wdXNoKCBzdG9yZS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oIGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEsIGFjdGlvblR5cGUsIF9uYW1lc3BhY2VzICk7XG5cdFx0XHRcdGlmICggdGhpc0dlbiA+IGNhbGNkR2VuICkge1xuXHRcdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCBgVGhlIFwiJHthY3Rpb25UeXBlfVwiIGFjdGlvbiBpbiB0aGUgXCIke3N0b3JlLm5hbWVzcGFjZX1cIiBzdG9yZSB3YWl0cyBmb3IgXCIke2RlcH1cIiBidXQgYSBzdG9yZSB3aXRoIHRoYXQgbmFtZXNwYWNlIGRvZXMgbm90IHBhcnRpY2lwYXRlIGluIHRoaXMgYWN0aW9uLmAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHRmb3IgKCB2YXIgWyBrZXksIGl0ZW0gXSBvZiBlbnRyaWVzKCBsb29rdXAgKSApIHtcblx0XHR0cmVlWyBpdGVtLmdlbiBdID0gdHJlZVsgaXRlbS5nZW4gXSB8fCBbXTtcblx0XHR0cmVlWyBpdGVtLmdlbiBdLnB1c2goIGl0ZW0gKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKCB7XG5cdFx0XHRkZXBzOiBfLnBpY2soIHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yIClcblx0XHR9LCBhY3Rpb24gKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0gKTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuQmVoYXZpb3JhbEZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCB7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IGx1eEFjdGlvbjtcblx0XHRcdFx0XHRcdGlmICggbHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGdlbmVyYXRpb24gb2YgbHV4QWN0aW9uLmdlbmVyYXRpb25zICkge1xuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwoIGx1eEFjdGlvbiwgZ2VuZXJhdGlvbiwgbHV4QWN0aW9uLmFjdGlvbiApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGlmeWluZ1wiICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RoYW5kbGVkXCIgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oIGx1eEFjdGlvbiwgZGF0YSApIHtcblx0XHRcdFx0XHRcdGlmICggZGF0YS5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHRcdFx0XHRsdXhBY3Rpb24udXBkYXRlZC5wdXNoKCBkYXRhLm5hbWVzcGFjZSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGlmICggbHV4QWN0aW9uLnVwZGF0ZWQubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aGFuZGxlZDoge31cblx0XHRcdH0sXG5cdFx0XHRnZXRTdG9yZXNIYW5kbGluZyggYWN0aW9uVHlwZSApIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25UeXBlIF0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdGdlbmVyYXRpb25zOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0XHR0aGlzLmNyZWF0ZVN1YnNjcmliZXJzKCk7XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApIHtcblx0XHR2YXIgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHR9O1xuXHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gfHwgW107XG5cdFx0XHRhY3Rpb24ucHVzaCggYWN0aW9uTWV0YSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdFx0dmFyIGlzVGhpc05hbWVTcGFjZSA9IGZ1bmN0aW9uKCBtZXRhICkge1xuXHRcdFx0cmV0dXJuIG1ldGEubmFtZXNwYWNlID09PSBuYW1lc3BhY2U7XG5cdFx0fTtcblx0XHRmb3IgKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiAoIGlkeCAhPT0gLTEgKSB7XG5cdFx0XHRcdHYuc3BsaWNlKCBpZHgsIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjcmVhdGVTdWJzY3JpYmVycygpIHtcblx0XHRpZiAoICF0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpLmNvbnN0cmFpbnQoICgpID0+ICEhdGhpcy5hY3Rpb25Db250ZXh0IClcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRpZiAoIHRoaXMuX19zdWJzY3JpcHRpb25zICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvciAoIHZhciBbIGdyb3VwLCBsaXN0IF0gb2YgZW50cmllcyggYWN0aW9uR3JvdXBzICkgKSB7XG5cdFx0aWYgKCBsaXN0LmluZGV4T2YoIGFjdGlvbk5hbWUgKSA+PSAwICkge1xuXHRcdFx0Z3JvdXBzLnB1c2goIGdyb3VwICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciB1dGlscyA9IHtcblx0cHJpbnRBY3Rpb25zKCkge1xuXHRcdHZhciBhY3Rpb25MaXN0ID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKVxuXHRcdFx0Lm1hcCggZnVuY3Rpb24oIHggKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XCJhY3Rpb24gbmFtZVwiOiB4LFxuXHRcdFx0XHRcdHN0b3JlczogZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyggeCApLnN0b3Jlcy5tYXAoIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHgubmFtZXNwYWNlO1xuXHRcdFx0XHRcdH0gKS5qb2luKCBcIixcIiApLFxuXHRcdFx0XHRcdGdyb3VwczogZ2V0R3JvdXBzV2l0aEFjdGlvbiggeCApLmpvaW4oIFwiLFwiIClcblx0XHRcdFx0fTtcblx0XHRcdH0gKTtcblx0XHRpZiAoIGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSApIHtcblx0XHRcdGNvbnNvbGUuZ3JvdXAoIFwiQ3VycmVudGx5IFJlY29nbml6ZWQgQWN0aW9uc1wiICk7XG5cdFx0XHRjb25zb2xlLnRhYmxlKCBhY3Rpb25MaXN0ICk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0fSBlbHNlIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdGNvbnNvbGUubG9nKCBhY3Rpb25MaXN0ICk7XG5cdFx0fVxuXHR9LFxuXG5cdHByaW50U3RvcmVEZXBUcmVlKCBhY3Rpb25UeXBlICkge1xuXHRcdHZhciB0cmVlID0gW107XG5cdFx0YWN0aW9uVHlwZSA9IHR5cGVvZiBhY3Rpb25UeXBlID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25UeXBlIF0gOiBhY3Rpb25UeXBlO1xuXHRcdGlmICggIWFjdGlvblR5cGUgKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKCBmdW5jdGlvbiggYXQgKSB7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKCBhdCApXG5cdFx0XHQgICAgLmdlbmVyYXRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHR3aGlsZSAoIHgubGVuZ3RoICkge1xuXHRcdFx0XHRcdHZhciB0ID0geC5wb3AoKTtcblx0XHRcdFx0XHR0cmVlLnB1c2goIHtcblx0XHRcdFx0XHRcdFwiYWN0aW9uIHR5cGVcIjogYXQsXG5cdFx0XHRcdFx0XHRcInN0b3JlIG5hbWVzcGFjZVwiOiB0Lm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFwid2FpdHMgZm9yXCI6IHQud2FpdEZvci5qb2luKCBcIixcIiApLFxuXHRcdFx0XHRcdFx0Z2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblx0XHRcdCAgICB9ICk7XG5cdFx0XHRpZiAoIGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSApIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cCggYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH1gICk7XG5cdFx0XHRcdGNvbnNvbGUudGFibGUoIHRyZWUgKTtcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdFx0fSBlbHNlIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcblx0XHRcdFx0Y29uc29sZS5sb2coIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9OmAgKTtcblx0XHRcdFx0Y29uc29sZS5sb2coIHRyZWUgKTtcblx0XHRcdH1cblx0XHRcdHRyZWUgPSBbXTtcblx0XHR9ICk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0cHVibGlzaEFjdGlvbixcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRcdGFjdGlvbkNyZWF0b3IsXG5cdFx0YWN0aW9uTGlzdGVuZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdGluaXRSZWFjdCggdXNlclJlYWN0ICkge1xuXHRcdFx0UmVhY3QgPSB1c2VyUmVhY3Q7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdHJlYWN0TWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxufSApICk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=