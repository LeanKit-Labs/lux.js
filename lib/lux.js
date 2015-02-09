/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.5.3
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } };

var _toArray = function (arr) { return Array.isArray(arr) ? arr : Array.from(arr); };

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
		throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
	}
})(undefined, function (React, postal, machina, _) {
	if (!(typeof global === "undefined" ? window : global)._6to5Polyfill) {
		throw new Error("You must include the 6to5 polyfill on your page before lux is loaded. See https://6to5.org/docs/usage/polyfill/ for more details.");
	}

	var actionChannel = postal.channel("lux.action");
	var storeChannel = postal.channel("lux.store");
	var dispatcherChannel = postal.channel("lux.dispatcher");
	var stores = {};

	// jshint ignore:start
	var entries = regeneratorRuntime.mark(function callee$1$0(obj) {
		var _iterator, _step, k;
		return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
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
		}, callee$1$0, this);
	});
	// jshint ignore:end

	function pluck(obj, keys) {
		var res = keys.reduce(function (accum, key) {
			accum[key] = obj[key];
			return accum;
		}, {});
		return res;
	}

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

	var extend = function () {
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}

		var parent = this;
		var store; // placeholder for instance constructor
		var storeObj = {}; // object used to hold initialState & states from prototype for instance-level merging
		var ctor = function () {}; // placeholder ctor function used to insert level in prototype chain

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
			return pluck(actions, actionGroups[group]);
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
		setup: function () {
			var _this3 = this;
			var __lux = ensureLuxProp(this);
			var stores = this.stores = this.stores || {};

			if (!stores.listenTo) {
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
		teardown: function () {
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
		setup: function () {
			var _this3 = this;
			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];

			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}

			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}

			var addActionIfNotPreset = function (k, v) {
				if (!_this3[k]) {
					_this3[k] = v;
				}
			};
			this.getActionGroup.forEach(function (group) {
				for (var _iterator = entries(getActionGroup(group))[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
					var _step$value = _slicedToArray(_step.value, 2);

					var k = _step$value[0];
					var v = _step$value[1];
					addActionIfNotPreset(k, v);
				}
			});

			if (this.getActions.length) {
				this.getActions.forEach(function (key) {
					var val = actions[key];
					if (val) {
						addActionIfNotPreset(key, val);
					} else {
						throw new Error("There is no action named '" + key + "'");
					}
				});
			}
		},
		mixin: {
			publishAction: function (action) {
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
	var luxActionListenerMixin = function () {
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
	var luxMixinCleanup = function () {
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
			throw new Error(" The store namespace \"" + namespace + "\" already exists.");
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
			handler: function () {
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

			var _processStoreArgs$apply = processStoreArgs.apply(undefined, _toArray(opt));

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
				deps: pluck(_this3.stores, store.waitFor)
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
						_onEnter: function () {
							this.actionContext = undefined;
						},
						"action.dispatch": "dispatching"
					},
					dispatching: {
						_onEnter: function (luxAction) {
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
						_onExit: function (luxAction) {
							dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
						}
					},
					notifying: {
						_onEnter: function (luxAction) {
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
					var isThisNameSpace = function (meta) {
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
				dispatcher.getStoresHandling(at).tree.forEach(function (x) {
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
//# sourceMappingURL=data:application/json;base64,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LEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQixZQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkIsTUFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2xDLFlBQU8sQ0FBQyxHQUFHLGdDQUE4QixFQUFFLE9BQUksQ0FBQztBQUNoRCxZQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xCO0FBQ0QsUUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQztHQUNIO0VBQ0QsQ0FBQzs7OztBQUlELFFBQU87QUFDTixTQUFPLEVBQVAsT0FBTztBQUNQLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsV0FBUyxFQUFULFNBQVM7QUFDVCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLGdCQUFjLEVBQWQsY0FBYztBQUNkLE9BQUssRUFBRSxLQUFLO0FBQ1osYUFBVyxFQUFYLFdBQVc7QUFDWCxPQUFLLEVBQUwsS0FBSztBQUNMLFFBQU0sRUFBTixNQUFNO0FBQ04sT0FBSyxFQUFMLEtBQUs7RUFDTCxDQUFDOztDQUdGLENBQUMsQ0FBRSIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwicmVhY3RcIiwgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIsIFwibG9kYXNoXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgbG9kYXNoICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdFJlYWN0IHx8IHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsIHx8IHJlcXVpcmUoXCJwb3N0YWxcIiksXG5cdFx0XHRcdG1hY2hpbmEgfHwgcmVxdWlyZShcIm1hY2hpbmFcIiksXG5cdFx0XHRcdGxvZGFzaCB8fCByZXF1aXJlKFwibG9kYXNoXCIpKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIF8gKSB7XG5cblx0aWYgKCAhKCB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsICkuXzZ0bzVQb2x5ZmlsbCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSA2dG81IHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vNnRvNS5vcmcvZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIik7XG5cdH1cblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHR2YXIgZW50cmllcyA9IGZ1bmN0aW9uKiAob2JqKSB7XG5cdFx0aWYoWyBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIgXS5pbmRleE9mKHR5cGVvZiBvYmopID09PSAtMSkge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0XHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7fSk7XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLmNvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZW5zdXJlTHV4UHJvcChjb250ZXh0KSB7XG5cdFx0dmFyIF9fbHV4ID0gY29udGV4dC5fX2x1eCA9IChjb250ZXh0Ll9fbHV4IHx8IHt9KTtcblx0XHR2YXIgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoX19sdXguY2xlYW51cCB8fCBbXSk7XG5cdFx0dmFyIHN1YnNjcmlwdGlvbnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zID0gKF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30pO1xuXHRcdHJldHVybiBfX2x1eDtcblx0fVxuXG5cdHZhciBleHRlbmQgPSBmdW5jdGlvbiggLi4ub3B0aW9ucyApIHtcblx0XHR2YXIgcGFyZW50ID0gdGhpcztcblx0XHR2YXIgc3RvcmU7IC8vIHBsYWNlaG9sZGVyIGZvciBpbnN0YW5jZSBjb25zdHJ1Y3RvclxuXHRcdHZhciBzdG9yZU9iaiA9IHt9OyAvLyBvYmplY3QgdXNlZCB0byBob2xkIGluaXRpYWxTdGF0ZSAmIHN0YXRlcyBmcm9tIHByb3RvdHlwZSBmb3IgaW5zdGFuY2UtbGV2ZWwgbWVyZ2luZ1xuXHRcdHZhciBjdG9yID0gZnVuY3Rpb24oKSB7fTsgLy8gcGxhY2Vob2xkZXIgY3RvciBmdW5jdGlvbiB1c2VkIHRvIGluc2VydCBsZXZlbCBpbiBwcm90b3R5cGUgY2hhaW5cblxuXHRcdC8vIEZpcnN0IC0gc2VwYXJhdGUgbWl4aW5zIGZyb20gcHJvdG90eXBlIHByb3BzXG5cdFx0dmFyIG1peGlucyA9IFtdO1xuXHRcdGZvciggdmFyIG9wdCBvZiBvcHRpb25zICkge1xuXHRcdFx0bWl4aW5zLnB1c2goIF8ucGljayggb3B0LCBbIFwiaGFuZGxlcnNcIiwgXCJzdGF0ZVwiIF0gKSApO1xuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0fVxuXG5cdFx0dmFyIHByb3RvUHJvcHMgPSBfLm1lcmdlLmFwcGx5KCB0aGlzLCBbIHt9IF0uY29uY2F0KCBvcHRpb25zICkgKTtcblxuXHRcdC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3Vcblx0XHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0XHQvLyBieSB1cyB0byBzaW1wbHkgY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IuXG5cdFx0aWYgKCBwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuaGFzT3duUHJvcGVydHkoIFwiY29uc3RydWN0b3JcIiApICkge1xuXHRcdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRcdHBhcmVudC5hcHBseSggdGhpcywgc3RvcmUubWl4aW5zLmNvbmNhdCggYXJncyApICk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHN0b3JlLm1peGlucyA9IG1peGlucztcblxuXHRcdC8vIEluaGVyaXQgY2xhc3MgKHN0YXRpYykgcHJvcGVydGllcyBmcm9tIHBhcmVudC5cblx0XHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0XHQvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuXHRcdC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG5cdFx0Y3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHN0b3JlLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7XG5cblx0XHQvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgKGluc3RhbmNlIHByb3BlcnRpZXMpIHRvIHRoZSBzdWJjbGFzcyxcblx0XHQvLyBpZiBzdXBwbGllZC5cblx0XHRpZiAoIHByb3RvUHJvcHMgKSB7XG5cdFx0XHRfLmV4dGVuZCggc3RvcmUucHJvdG90eXBlLCBwcm90b1Byb3BzICk7XG5cdFx0fVxuXG5cdFx0Ly8gQ29ycmVjdGx5IHNldCBjaGlsZCdzIGBwcm90b3R5cGUuY29uc3RydWN0b3JgLlxuXHRcdHN0b3JlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN0b3JlO1xuXG5cdFx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0XHRzdG9yZS5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXHRcdHJldHVybiBzdG9yZTtcblx0fTtcblxuXHRcblxudmFyIGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihhY3Rpb25MaXN0KSB7XG5cdGFjdGlvbkxpc3QgPSAodHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIpID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGlmKCFhY3Rpb25zW2FjdGlvbl0pIHtcblx0XHRcdGFjdGlvbnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1tncm91cF0gKSB7XG5cdFx0cmV0dXJuIHBsdWNrKGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1tncm91cF0pO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvcihhY3Rpb24pIHtcblx0YWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oYWN0aW9ucywgYWN0aW9uKTtcbn1cblxuZnVuY3Rpb24gYWRkVG9BY3Rpb25Hcm91cChncm91cE5hbWUsIGFjdGlvbkxpc3QpIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzW2dyb3VwTmFtZV07XG5cdGlmKCFncm91cCkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzW2dyb3VwTmFtZV0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbYWN0aW9uTGlzdF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKXtcblx0XHRpZihncm91cC5pbmRleE9mKGFjdGlvbikgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaChhY3Rpb24pO1xuXHRcdH1cblx0fSk7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKHRoaXMpO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cblx0XHRpZiAoICFzdG9yZXMubGlzdGVuVG8gKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCk7XG5cdFx0fVxuXG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICgoIHNwbGl0ID0ga2V5LnNwbGl0KFwiLlwiKSkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkpIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdHZhciBhZGRBY3Rpb25JZk5vdFByZXNldCA9IChrLCB2KSA9PiB7XG5cdFx0XHRpZighdGhpc1trXSkge1xuXHRcdFx0XHRcdHRoaXNba10gPSB2O1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goKGdyb3VwKSA9PiB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkdyb3VwKGdyb3VwKSkpIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoaywgdik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZih0aGlzLmdldEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBhY3Rpb25zWyBrZXkgXTtcblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoa2V5LCB2YWwpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHtrZXl9J2AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbiwgLi4uYXJncykge1xuXHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXAsXG5cdHB1Ymxpc2hBY3Rpb246IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5taXhpbi5wdWJsaXNoQWN0aW9uXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbih7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoY29udGV4dCk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICgoZGF0YSwgZW52KSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZihoYW5kbGVyID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXSkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZighaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKGhhbmRsZXJzKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBzaW5jZSB3ZSByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dCBhbHJlYWR5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHR2YXIgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyhoYW5kbGVycyk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoaGFuZGxlcktleXMpO1xuXHRcdFx0aWYoY29udGV4dC5uYW1lc3BhY2UpIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cChjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQsIC4uLm1peGlucykge1xuXHRpZihtaXhpbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0bWl4aW5zID0gW2x1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JNaXhpbl07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcblx0XHRpZih0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZihtaXhpbi5taXhpbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBtaXhpbi5taXhpbik7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoY29udGV4dCk7XG5cdFx0aWYobWl4aW4udGVhcmRvd24pIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBtaXhpbi50ZWFyZG93biApO1xuXHRcdH1cblx0fSk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBsdXhBY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKHRhcmdldCkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKHRhcmdldCkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lcih0YXJnZXQpIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSkge1xuXHR2YXIgbmFtZXNwYWNlID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5uYW1lc3BhY2UpIHx8IHN0b3JlLm5hbWVzcGFjZTtcblx0aWYgKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG5cdH1cblx0aWYoIW5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKGhhbmRsZXJzKS5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKSB7XG5cdHJldHVybiB7XG5cdFx0d2FpdEZvcjogW10sXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgY2hhbmdlZCA9IDA7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKXtcblx0XHRcdFx0Y2hhbmdlZCArPSAoIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICkgPT09IGZhbHNlID8gMCA6IDEgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0XHRyZXR1cm4gY2hhbmdlZCA+IDA7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYoIHNvdXJjZS53YWl0Rm9yICl7XG5cdFx0c291cmNlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdGlmKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyguLi5vcHRpb25zKSB7XG5cdHZhciBsaXN0ZW5lcnMgPSB7fTtcblx0dmFyIGhhbmRsZXJzID0ge307XG5cdHZhciBzdGF0ZSA9IHt9O1xuXHR2YXIgb3RoZXJPcHRzID0ge307XG5cdG9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIG8gKSB7XG5cdFx0dmFyIG9wdDtcblx0XHRpZiggbyApIHtcblx0XHRcdG9wdCA9IF8uY2xvbmUobyk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHR2YXIgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBbIHN0YXRlLCBoYW5kbGVycywgb3RoZXJPcHRzIF07XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvciguLi5vcHQpIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0XHRpZighaW5EaXNwYXRjaCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oe1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdLmhhbmRsZXIuYXBwbHkodGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChkYXRhLmRlcHMpKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAocmVzID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLmNvbnN0cmFpbnQoKCkgPT4gaW5EaXNwYXRjaCksXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKHRoaXMubmFtZXNwYWNlKTtcblx0fVxufVxuXG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUpIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0aWYoZGVwU3RvcmUpIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG5cdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHR9LCBhY3Rpb24pO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkJlaGF2aW9yYWxGc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSBsdXhBY3Rpb247XG5cdFx0XHRcdFx0XHRpZihsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFsgZm9yICggZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKVxuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwoIGx1eEFjdGlvbiwgZ2VuZXJhdGlvbiwgbHV4QWN0aW9uLmFjdGlvbiApIF07XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGlmeWluZ1wiICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RoYW5kbGVkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5oYW5kbGVkXCI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24sIGRhdGEgKSB7XG5cdFx0XHRcdFx0XHRpZiggZGF0YS5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHRcdFx0XHRsdXhBY3Rpb24udXBkYXRlZC5wdXNoKCBkYXRhLm5hbWVzcGFjZSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IGx1eEFjdGlvbi51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0dmFyIGx1eEFjdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7IGFjdGlvbjogZGF0YSwgZ2VuZXJhdGlvbkluZGV4OiAwLCB1cGRhdGVkOiBbXSB9LFxuXHRcdFx0dGhpcy5nZXRTdG9yZXNIYW5kbGluZyggZGF0YS5hY3Rpb25UeXBlIClcblx0XHQpO1xuXHRcdHRoaXMuaGFuZGxlKCBsdXhBY3Rpb24sIFwiYWN0aW9uLmRpc3BhdGNoXCIgKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoIHN0b3JlTWV0YSApIHtcblx0XHRmb3IgKCB2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zICkge1xuXHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHZhciBpc1RoaXNOYW1lU3BhY2UgPSBmdW5jdGlvbiggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH07XG5cdFx0Zm9yKCB2YXIgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmICggIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbmZ1bmN0aW9uIGdldEdyb3Vwc1dpdGhBY3Rpb24oYWN0aW9uTmFtZSkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvcih2YXIgW2dyb3VwLCBsaXN0XSBvZiBlbnRyaWVzKGFjdGlvbkdyb3VwcykpIHtcblx0XHRpZihsaXN0LmluZGV4T2YoYWN0aW9uTmFtZSkgPj0gMCkge1xuXHRcdFx0Z3JvdXBzLnB1c2goZ3JvdXApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbnZhciB1dGlscyA9IHtcblx0cHJpbnRBY3Rpb25zKCkge1xuXHRcdHZhciBhY3Rpb25MaXN0ID0gT2JqZWN0LmtleXMoYWN0aW9ucylcblx0XHRcdC5tYXAoZnVuY3Rpb24oeCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoeCkuc3RvcmVzLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4Lm5hbWVzcGFjZTsgfSkuam9pbihcIixcIiksXG5cdFx0XHRcdFx0XCJncm91cHNcIiA6IGdldEdyb3Vwc1dpdGhBY3Rpb24oeCkuam9pbihcIixcIilcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0Y29uc29sZS5ncm91cChcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIik7XG5cdFx0XHRjb25zb2xlLnRhYmxlKGFjdGlvbkxpc3QpO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0Y29uc29sZS5sb2coYWN0aW9uTGlzdCk7XG5cdFx0fVxuXHR9LFxuXG5cdHByaW50U3RvcmVEZXBUcmVlKGFjdGlvblR5cGUpIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25UeXBlXSA6IGFjdGlvblR5cGU7XG5cdFx0aWYoIWFjdGlvblR5cGUpIHtcblx0XHRcdGFjdGlvblR5cGUgPSBPYmplY3Qua2V5cyhhY3Rpb25zKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKGZ1bmN0aW9uKGF0KXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoYXQpXG5cdFx0XHQgICAgLnRyZWUuZm9yRWFjaChmdW5jdGlvbih4KSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICh4Lmxlbmd0aCkge1xuXHRcdFx0ICAgICAgICAgICAgdmFyIHQgPSB4LnBvcCgpO1xuXHRcdFx0ICAgICAgICAgICAgdHJlZS5wdXNoKHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbihcIixcIiksXG5cdFx0XHQgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdCAgICAgICAgICAgIH0pO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCk7XG5cdFx0XHRcdGNvbnNvbGUudGFibGUodHJlZSk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgKTtcblx0XHRcdFx0Y29uc29sZS5sb2codHJlZSk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZSxcblx0XHRzdG9yZXMsXG5cdFx0dXRpbHNcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==