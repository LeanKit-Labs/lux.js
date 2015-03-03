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
		define(["react", "postal", "machina", "lodash"], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node, or CommonJS-Like environments
		module.exports = function (React, postal, machina, lodash) {
			return factory(React || require("react"), postal || require("postal"), machina || require("machina"), lodash || require("lodash"));
		};
	} else {
		root.lux = factory(root.React, root.postal, root.machina, root._);
	}
})(undefined, function (React, postal, machina, _) {

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
		var _iterator, _step, k;

		return regeneratorRuntime.wrap(function entries$(context$2$0) {
			while (1) switch (context$2$0.prev = context$2$0.next) {
				case 0:
					if (["object", "function"].indexOf(typeof obj) === -1) {
						obj = {};
					}
					_iterator = Object.keys(obj)[Symbol.iterator]();

				case 2:
					if ((_step = _iterator.next()).done) {
						context$2$0.next = 8;
						break;
					}

					k = _step.value;
					context$2$0.next = 6;
					return [k, obj[k]];

				case 6:
					context$2$0.next = 2;
					break;

				case 8:
				case "end":
					return context$2$0.stop();
			}
		}, entries, this);
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
		for (var _iterator = options[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
			var opt = _step.value;

			mixins.push(_.pick(opt, ["handlers", "state"]));
			delete opt.handlers;
			delete opt.state;
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
		for (var _iterator = entries(handlers)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
			var _step$value = _slicedToArray(_step.value, 2);

			var key = _step$value[0];
			var handler = _step$value[1];

			actionList.push({
				actionType: key,
				waitFor: handler.waitFor || []
			});
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
			for (var _iterator = entries(this.__lux.subscriptions)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
				var _step$value = _slicedToArray(_step.value, 2);

				var key = _step$value[0];
				var sub = _step$value[1];

				var split;
				if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
					sub.unsubscribe();
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
				for (var _iterator = entries(getActionGroup(group))[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
					var _step$value = _slicedToArray(_step.value, 2);

					var k = _step$value[0];
					var v = _step$value[1];

					addActionIfNotPresent(k, v);
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
	function controllerView(options) {
		var opt = {
			mixins: [luxStoreReactMixin, luxActionCreatorReactMixin].concat(options.mixins || [])
		};
		delete options.mixins;
		return React.createClass(Object.assign(opt, options));
	}

	function component(options) {
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
					for (var _iterator = entries(this.__subscription)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
						var _step$value = _slicedToArray(_step.value, 2);

						var k = _step$value[0];
						var subscription = _step$value[1];

						subscription.unsubscribe();
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
		for (var _iterator = entries(lookup)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
			var _step$value = _slicedToArray(_step.value, 2);

			var key = _step$value[0];
			var item = _step$value[1];

			tree[item.gen] = tree[item.gen] || [];
			tree[item.gen].push(item);
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

									for (var _iterator = luxAction.generations[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
										var generation = _step.value;

										_ref.push(processGeneration.call(luxAction, generation, luxAction.action));
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
					for (var _iterator = storeMeta.actions[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
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
				},
				writable: true,
				configurable: true
			},
			removeStore: {
				value: function removeStore(namespace) {
					var isThisNameSpace = function isThisNameSpace(meta) {
						return meta.namespace === namespace;
					};
					for (var _iterator = entries(this.actionMap)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
						var _step$value = _slicedToArray(_step.value, 2);

						var k = _step$value[0];
						var v = _step$value[1];

						var idx = v.findIndex(isThisNameSpace);
						if (idx !== -1) {
							v.splice(idx, 1);
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
		for (var _iterator = entries(actionGroups)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
			var _step$value = _slicedToArray(_step.value, 2);

			var group = _step$value[0];
			var list = _step$value[1];

			if (list.indexOf(actionName) >= 0) {
				groups.push(group);
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
		removeStore: removeStore,
		Store: Store,
		stores: stores,
		utils: utils
	};
	// jshint ignore: end
});
//# sourceMappingURL=data:application/json;base64,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YztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsWUFBVSxFQUFWLFVBQVU7QUFDVixnQkFBYyxFQUFkLGNBQWM7QUFDZCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLGVBQWEsRUFBYixhQUFhO0FBQ2IsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsT0FBSyxFQUFFLEtBQUs7QUFDWixhQUFXLEVBQVgsV0FBVztBQUNYLE9BQUssRUFBTCxLQUFLO0FBQ0wsUUFBTSxFQUFOLE1BQU07QUFDTixPQUFLLEVBQUwsS0FBSztFQUNMLENBQUM7O0NBR0YsQ0FBQyxDQUFFIiwiZmlsZSI6Imx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJyZWFjdFwiLCBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiwgXCJsb2Rhc2hcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCBsb2Rhc2ggKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZSggXCJyZWFjdFwiICksXG5cdFx0XHRcdHBvc3RhbCB8fCByZXF1aXJlKCBcInBvc3RhbFwiICksXG5cdFx0XHRcdG1hY2hpbmEgfHwgcmVxdWlyZSggXCJtYWNoaW5hXCIgKSxcblx0XHRcdFx0bG9kYXNoIHx8IHJlcXVpcmUoIFwibG9kYXNoXCIgKSApO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5sdXggPSBmYWN0b3J5KCByb290LlJlYWN0LCByb290LnBvc3RhbCwgcm9vdC5tYWNoaW5hLCByb290Ll8gKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIF8gKSB7XG5cblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdGlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl9iYWJlbFBvbHlmaWxsICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGluY2x1ZGUgdGhlIGJhYmVsIHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiKTtcblx0fVxuXG5cdHZhciBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmFjdGlvblwiICk7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguc3RvcmVcIiApO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguZGlzcGF0Y2hlclwiICk7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdHZhciBlbnRyaWVzID0gZnVuY3Rpb24qICggb2JqICkge1xuXHRcdGlmKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKCB2YXIgayBvZiBPYmplY3Qua2V5cyggb2JqICkgKSB7XG5cdFx0XHR5aWVsZCBbIGssIG9ialsgayBdIF07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKCBjb250ZXh0LCBzdWJzY3JpcHRpb24gKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi5jb250ZXh0KCBjb250ZXh0IClcblx0XHQgICAgICAgICAgICAgICAgICAgLmNvbnN0cmFpbnQoIGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoIGVudmVsb3BlLmhhc093blByb3BlcnR5KCBcIm9yaWdpbklkXCIgKSApIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoIGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpICk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5zdXJlTHV4UHJvcCggY29udGV4dCApIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKCBjb250ZXh0Ll9fbHV4IHx8IHt9ICk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKCBfX2x1eC5jbGVhbnVwIHx8IFtdICk7XG5cdFx0dmFyIHN1YnNjcmlwdGlvbnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zID0gKCBfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9ICk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0dmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCAuLi5vcHRpb25zICkge1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzO1xuXHRcdHZhciBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdFx0dmFyIHN0b3JlT2JqID0ge307IC8vIG9iamVjdCB1c2VkIHRvIGhvbGQgaW5pdGlhbFN0YXRlICYgc3RhdGVzIGZyb20gcHJvdG90eXBlIGZvciBpbnN0YW5jZS1sZXZlbCBtZXJnaW5nXG5cdFx0dmFyIGN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdFx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0XHR2YXIgbWl4aW5zID0gW107XG5cdFx0Zm9yKCB2YXIgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdFx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHRcdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHRcdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0XHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdFx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRcdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHRcdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdFx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0c3RvcmUucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcblxuXHRcdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHRcdC8vIGlmIHN1cHBsaWVkLlxuXHRcdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0XHR9XG5cblx0XHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdFx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0XHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRcdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0cmV0dXJuIHN0b3JlO1xuXHR9O1xuXG5cdFxuXG52YXIgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICggdmFyIFsga2V5LCBoYW5kbGVyIF0gb2YgZW50cmllcyggaGFuZGxlcnMgKSApIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goIHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ICkge1xuXHRhY3Rpb25MaXN0ID0gKCB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiApID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYoICFhY3Rpb25zWyBhY3Rpb24gXSkge1xuXHRcdFx0YWN0aW9uc1sgYWN0aW9uIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzWyBncm91cCBdICkge1xuXHRcdHJldHVybiBfLnBpY2soIGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0YWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oIGFjdGlvbnMsIGFjdGlvbiApO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKCBncm91cE5hbWUsIGFjdGlvbkxpc3QgKSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF07XG5cdGlmKCAhZ3JvdXAgKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHR2YXIgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiggZGlmZi5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIGZvbGxvd2luZyBhY3Rpb25zIGRvIG5vdCBleGlzdDogJHtkaWZmLmpvaW4oXCIsIFwiKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICl7XG5cdFx0aWYoIGdyb3VwLmluZGV4T2YoIGFjdGlvbiApID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goIGFjdGlvbiApO1xuXHRcdH1cblx0fSk7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIHRoaXMgKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAoIHRoaXMuc3RvcmVzIHx8IHt9ICk7XG5cblx0XHRpZiAoICFzdG9yZXMubGlzdGVuVG8gfHwgIXN0b3Jlcy5saXN0ZW5Uby5sZW5ndGggKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBsaXN0ZW5UbyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHN0b3JlIG5hbWVzcGFjZWAgKTtcblx0XHR9XG5cblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gWyBzdG9yZXMubGlzdGVuVG8gXSA6IHN0b3Jlcy5saXN0ZW5UbztcblxuXHRcdGlmICggIXN0b3Jlcy5vbkNoYW5nZSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgICk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbIGAke3N0b3JlfS5jaGFuZ2VkYCBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZSggYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIHRoaXMsIHN0b3JlICkgKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggdGhpcywgZGF0YSApICk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKCB2YXIgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdHZhciBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiggIXRoaXNbIGsgXSApIHtcblx0XHRcdFx0XHR0aGlzWyBrIF0gPSB2O1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSApICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGssIHYgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuXHRcdFx0XHR2YXIgdmFsID0gYWN0aW9uc1sga2V5IF07XG5cdFx0XHRcdGlmICggdmFsICkge1xuXHRcdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCB2YWwgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gbmFtZWQgJyR7a2V5fSdgICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRwdWJsaXNoQWN0aW9uOiBmdW5jdGlvbiggYWN0aW9uLCAuLi5hcmdzICkge1xuXHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogbHV4QWN0aW9uQ3JlYXRvck1peGluLm1peGluLnB1Ymxpc2hBY3Rpb25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKCB7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSApIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICggKCBkYXRhLCBlbnYgKSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZiggaGFuZGxlciA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXSApIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KCBjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0aWYoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gc2luY2Ugd2UgcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHQgYWxyZWFkeVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdFx0dmFyIGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoIGhhbmRsZXJzICk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGhhbmRsZXJLZXlzICk7XG5cdFx0XHRpZiggY29udGV4dC5uYW1lc3BhY2UgKSB7XG5cdFx0XHRcdGFkZFRvQWN0aW9uR3JvdXAoIGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KCBvcHRpb25zICkge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogWyBsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQoIG9wdGlvbnMgKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBtaXhpbiApID0+IHtcblx0XHRpZiggdHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKCBtaXhpbi5taXhpbiApIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oIGNvbnRleHQsIG1peGluLm1peGluICk7XG5cdFx0fVxuXHRcdGlmKCB0eXBlb2YgbWl4aW4uc2V0dXAgIT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggXCJMdXggbWl4aW5zIHNob3VsZCBoYXZlIGEgc2V0dXAgbWV0aG9kLiBEaWQgeW91IHBlcmhhcHMgcGFzcyB5b3VyIG1peGlucyBhaGVhZCBvZiB5b3VyIHRhcmdldCBpbnN0YW5jZT9cIiApO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYoIG1peGluLnRlYXJkb3duICkge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0dmFyIG5hbWVzcGFjZSA9ICggb3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSApIHx8IHN0b3JlLm5hbWVzcGFjZTtcblx0aWYgKCBuYW1lc3BhY2UgaW4gc3RvcmVzICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gICk7XG5cdH1cblx0aWYoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoYW5nZWQgPSAwO1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICl7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiggc291cmNlLndhaXRGb3IgKXtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHRpb25zICkge1xuXHR2YXIgbGlzdGVuZXJzID0ge307XG5cdHZhciBoYW5kbGVycyA9IHt9O1xuXHR2YXIgc3RhdGUgPSB7fTtcblx0dmFyIG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdHZhciBvcHQ7XG5cdFx0aWYoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHR2YXIgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdFx0Xy5tZXJnZSggb3RoZXJPcHRzLCBvcHQgKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInJlcGxhY2VTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHQvLyB3ZSBwcmVzZXJ2ZSB0aGUgdW5kZXJseWluZyBzdGF0ZSByZWYsIGJ1dCBjbGVhciBpdFxuXHRcdFx0T2JqZWN0LmtleXMoIHN0YXRlICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0ZGVsZXRlIHN0YXRlWyBrZXkgXTtcblx0XHRcdH0gKTtcblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhLCBlbnZlbG9wZSApIHtcblx0XHRcdFx0aWYoIGhhbmRsZXJzLmhhc093blByb3BlcnR5KCBkYXRhLmFjdGlvblR5cGUgKSApIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdLmhhbmRsZXIuYXBwbHkoIHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoIGRhdGEuZGVwcyApICk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKCByZXMgPT09IGZhbHNlICkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24oIHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggYG5vdGlmeWAsIHRoaXMuZmx1c2ggKSApLmNvbnN0cmFpbnQoICgpID0+IGluRGlzcGF0Y2ggKSxcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKCB2YXIgWyBrLCBzdWJzY3JpcHRpb24gXSBvZiBlbnRyaWVzKCB0aGlzLl9fc3Vic2NyaXB0aW9uICkgKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1sgdGhpcy5uYW1lc3BhY2UgXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKCB0aGlzLm5hbWVzcGFjZSApO1xuXHRcdHRoaXMubHV4Q2xlYW51cCgpO1xuXHR9XG59XG5cblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbIGRlcCBdO1xuXHRcdFx0aWYoIGRlcFN0b3JlICkge1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSApO1xuXHRcdFx0XHRpZiAoIHRoaXNHZW4gPiBjYWxjZEdlbiApIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IGxvb2t1cFsgc3RvcmUubmFtZXNwYWNlIF0gPSBzdG9yZSApO1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSApICk7XG5cdGZvciAoIHZhciBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuXHRnZW5lcmF0aW9uLm1hcCggKCBzdG9yZSApID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkJlaGF2aW9yYWxGc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYobHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRbIGZvciAoIGdlbmVyYXRpb24gb2YgbHV4QWN0aW9uLmdlbmVyYXRpb25zIClcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKCBsdXhBY3Rpb24sIGdlbmVyYXRpb24sIGx1eEFjdGlvbi5hY3Rpb24gKSBdO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RpZnlpbmdcIiApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aGFuZGxlZFwiKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYoIGRhdGEuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0XHRcdFx0bHV4QWN0aW9uLnVwZGF0ZWQucHVzaCggZGF0YS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0dmFyIGx1eEFjdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7IGFjdGlvbjogZGF0YSwgZ2VuZXJhdGlvbkluZGV4OiAwLCB1cGRhdGVkOiBbXSB9LFxuXHRcdFx0dGhpcy5nZXRTdG9yZXNIYW5kbGluZyggZGF0YS5hY3Rpb25UeXBlIClcblx0XHQpO1xuXHRcdHRoaXMuaGFuZGxlKCBsdXhBY3Rpb24sIFwiYWN0aW9uLmRpc3BhdGNoXCIgKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoIHN0b3JlTWV0YSApIHtcblx0XHRmb3IgKCB2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zICkge1xuXHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHZhciBpc1RoaXNOYW1lU3BhY2UgPSBmdW5jdGlvbiggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH07XG5cdFx0Zm9yKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0dGhpcyxcblx0XHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0XHQoIGRhdGEsIGVudiApID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpLmNvbnN0cmFpbnQoICgpID0+ICEhdGhpcy5hY3Rpb25Db250ZXh0IClcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRpZiAoIHRoaXMuX19zdWJzY3JpcHRpb25zICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvciggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiggbGlzdC5pbmRleE9mKCBhY3Rpb25OYW1lICkgPj0gMCApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKCBncm91cCApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKCBhY3Rpb25zIClcblx0XHRcdC5tYXAoIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIHggKS5zdG9yZXMubWFwKCBmdW5jdGlvbiggeCApIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9ICkuam9pbiggXCIsXCIgKSxcblx0XHRcdFx0XHRcImdyb3Vwc1wiIDogZ2V0R3JvdXBzV2l0aEFjdGlvbiggeCApLmpvaW4oIFwiLFwiIClcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKCBcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIiApO1xuXHRcdFx0Y29uc29sZS50YWJsZSggYWN0aW9uTGlzdCApO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRjb25zb2xlLmxvZyggYWN0aW9uTGlzdCApO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZSggYWN0aW9uVHlwZSApIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uVHlwZSBdIDogYWN0aW9uVHlwZTtcblx0XHRpZiggIWFjdGlvblR5cGUgKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoIGFjdGlvbnMgKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKCBmdW5jdGlvbiggYXQgKXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoIGF0IClcblx0XHRcdCAgICAuZ2VuZXJhdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIHggKSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICggeC5sZW5ndGggKSB7XG5cdFx0XHQgICAgICAgICAgICB2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHQgICAgICAgICAgICB0cmVlLnB1c2goIHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbiggXCIsXCIgKSxcblx0XHRcdCAgICAgICAgICAgICAgICBnZW5lcmF0aW9uOiB0LmdlblxuXHRcdFx0ICAgICAgICAgICAgfSApO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKCBjb25zb2xlICYmIGNvbnNvbGUudGFibGUgKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoIGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKCB0cmVlICk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoIGNvbnNvbGUgJiYgY29uc29sZS5sb2cgKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgICk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCB0cmVlICk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZSxcblx0XHRzdG9yZXMsXG5cdFx0dXRpbHNcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==