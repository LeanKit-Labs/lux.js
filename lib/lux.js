/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.4.1
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

/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.4.1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */


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
		var _this = this;
		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this.stores.listenTo.indexOf(item) > -1;
		});
	}

	var luxStoreMixin = {
		setup: function () {
			var _this = this;
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
					return gateKeeper.call(_this, store);
				});
			});

			__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify.call(_this, data);
			});
		},
		teardown: function () {
			for (var _iterator = entries(this.__lux.subscriptions)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
				var _step$value = _slicedToArray(_step.value, 2);

				var key = _step$value[0];
				var sub = _step$value[1];
				var split;
				if (key === "prenotify" || (split = key.split(".")) && split[1] === "changed") {
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
			var _this = this;
			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];

			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}

			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}

			var addActionIfNotPreset = function (k, v) {
				if (!_this[k]) {
					_this[k] = v;
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
		var _this = this;
		this.__lux.cleanup.forEach(function (method) {
			return method.call(_this);
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
		var _this = this;
		generation.map(function (store) {
			var data = Object.assign({
				deps: pluck(_this.stores, store.waitFor)
			}, action);
			dispatcherChannel.publish("" + store.namespace + ".handle." + action.actionType, data);
		});
	}

	var Dispatcher = (function (_machina$BehavioralFsm) {
		function Dispatcher() {
			_classCallCheck(this, Dispatcher);

			this.actionContext = undefined;
			_get(_machina$BehavioralFsm.prototype, "constructor", this).call(this, {
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
					var _this = this;
					if (!this.__subscriptions || !this.__subscriptions.length) {
						this.__subscriptions = [configSubscription(this, actionChannel.subscribe("execute.*", function (data, env) {
							return _this.handleActionDispatch(data);
						})), dispatcherChannel.subscribe("*.handled.*", function (data) {
							return _this.handle(_this.actionContext, "action.handled", data);
						})];
					}
				},
				writable: true,
				configurable: true
			},
			dispose: {
				value: function dispose() {
					this.__subscriptions.forEach(function (subscription) {
						return subscription.unsubscribe();
					});
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
//# sourceMappingURL=data:application/json;base64,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QUUsQ0FBQztJQUNWLENBQUMsQ0FBQztHQUNIO0VBQ0QsQ0FBQzs7OztBQUlELFFBQU87QUFDTixTQUFPLEVBQVAsT0FBTztBQUNQLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsV0FBUyxFQUFULFNBQVM7QUFDVCxnQkFBYyxFQUFkLGNBQWM7QUFDZCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFlBQVUsRUFBVixVQUFVO0FBQ1YsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixlQUFhLEVBQWIsYUFBYTtBQUNiLGdCQUFjLEVBQWQsY0FBYztBQUNkLE9BQUssRUFBRSxLQUFLO0FBQ1osYUFBVyxFQUFYLFdBQVc7QUFDWCxPQUFLLEVBQUwsS0FBSztBQUNMLFFBQU0sRUFBTixNQUFNO0FBQ04sT0FBSyxFQUFMLEtBQUs7RUFDTCxDQUFDOztDQUdGLENBQUMsQ0FBRSIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsdXguanMgLSBGbHV4LWJhc2VkIGFyY2hpdGVjdHVyZSBmb3IgdXNpbmcgUmVhY3RKUyBhdCBMZWFuS2l0XG4gKiBBdXRob3I6IEppbSBDb3dhcnRcbiAqIFZlcnNpb246IHYwLjQuMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJyZWFjdFwiLCBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiwgXCJsb2Rhc2hcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCBsb2Rhc2ggKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwgfHwgcmVxdWlyZShcInBvc3RhbFwiKSxcblx0XHRcdFx0bWFjaGluYSB8fCByZXF1aXJlKFwibWFjaGluYVwiKSxcblx0XHRcdFx0bG9kYXNoIHx8IHJlcXVpcmUoXCJsb2Rhc2hcIikpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgXyApIHtcblxuXHRpZiAoICEoIHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWwgKS5fNnRvNVBvbHlmaWxsICkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGluY2x1ZGUgdGhlIDZ0bzUgcG9seWZpbGwgb24geW91ciBwYWdlIGJlZm9yZSBsdXggaXMgbG9hZGVkLiBTZWUgaHR0cHM6Ly82dG81Lm9yZy9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiKTtcblx0fVxuXG5cdHZhciBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguYWN0aW9uXCIpO1xuXHR2YXIgc3RvcmVDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguc3RvcmVcIik7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmRpc3BhdGNoZXJcIik7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdHZhciBlbnRyaWVzID0gZnVuY3Rpb24qIChvYmopIHtcblx0XHRpZihbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YodHlwZW9mIG9iaikgPT09IC0xKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24uY29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0dmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCAuLi5vcHRpb25zICkge1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzO1xuXHRcdHZhciBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdFx0dmFyIHN0b3JlT2JqID0ge307IC8vIG9iamVjdCB1c2VkIHRvIGhvbGQgaW5pdGlhbFN0YXRlICYgc3RhdGVzIGZyb20gcHJvdG90eXBlIGZvciBpbnN0YW5jZS1sZXZlbCBtZXJnaW5nXG5cdFx0dmFyIGN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdFx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0XHR2YXIgbWl4aW5zID0gW107XG5cdFx0Zm9yKCB2YXIgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdFx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHRcdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHRcdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0XHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdFx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRcdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHRcdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdFx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0c3RvcmUucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcblxuXHRcdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHRcdC8vIGlmIHN1cHBsaWVkLlxuXHRcdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0XHR9XG5cblx0XHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdFx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0XHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRcdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0cmV0dXJuIHN0b3JlO1xuXHR9O1xuXG5cdFxuXG52YXIgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKGFjdGlvbkxpc3QpIHtcblx0YWN0aW9uTGlzdCA9ICh0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIikgPyBbYWN0aW9uTGlzdF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0aWYoIWFjdGlvbnNbYWN0aW9uXSkge1xuXHRcdFx0YWN0aW9uc1thY3Rpb25dID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzW2dyb3VwXSApIHtcblx0XHRyZXR1cm4gcGx1Y2soYWN0aW9ucywgYWN0aW9uR3JvdXBzW2dyb3VwXSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbihhY3Rpb25zLCBhY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKGdyb3VwTmFtZSwgYWN0aW9uTGlzdCkge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXTtcblx0aWYoIWdyb3VwKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pe1xuXHRcdGlmKGdyb3VwLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKGFjdGlvbik7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gdHJ1ZTtcblx0dmFyIF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHR2YXIgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AodGhpcyk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgKTtcblx0XHR9XG5cblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKChzdG9yZSkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1tgJHtzdG9yZX0uY2hhbmdlZGBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZShgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSkpO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IodmFyIFtrZXksIHN1Yl0gb2YgZW50cmllcyh0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMpKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZihrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpKSAmJiBzcGxpdFsxXSA9PT0gXCJjaGFuZ2VkXCIgKSkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2V0ID0gKGssIHYpID0+IHtcblx0XHRcdGlmKCF0aGlzW2tdKSB7XG5cdFx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCgoZ3JvdXApID0+IHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uR3JvdXAoZ3JvdXApKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrLCB2KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmKHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblx0XHRcdFx0dmFyIHZhbCA9IGFjdGlvbnNbIGtleSBdO1xuXHRcdFx0XHRpZiAoIHZhbCApIHtcblx0XHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrZXksIHZhbCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2tleX0nYCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogZnVuY3Rpb24oYWN0aW9uLCAuLi5hcmdzKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogbHV4QWN0aW9uQ3JlYXRvck1peGluLm1peGluLnB1Ymxpc2hBY3Rpb25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9KSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcChjb250ZXh0KTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKChkYXRhLCBlbnYpID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKGhhbmRsZXIgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseShjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmKCFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoaGFuZGxlcnMpLmxlbmd0aCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFjdGlvbiBoYW5kbGVyIGluIHRoZSBoYW5kbGVycyBwcm9wZXJ0eVwiICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIgKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIHNpbmNlIHdlIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0IGFscmVhZHlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9XG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuIClcblx0XHRcdFx0KTtcblx0XHRcdHZhciBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKGhhbmRsZXJzKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihoYW5kbGVyS2V5cyk7XG5cdFx0XHRpZihjb250ZXh0Lm5hbWVzcGFjZSkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gY29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCwgLi4ubWl4aW5zKSB7XG5cdGlmKG1peGlucy5sZW5ndGggPT09IDApIHtcblx0XHRtaXhpbnMgPSBbbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKChtaXhpbikgPT4ge1xuXHRcdGlmKHR5cGVvZiBtaXhpbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKG1peGluLm1peGluKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIG1peGluLm1peGluKTtcblx0XHR9XG5cdFx0bWl4aW4uc2V0dXAuY2FsbChjb250ZXh0KTtcblx0XHRpZihtaXhpbi50ZWFyZG93bikge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKHRhcmdldCkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucywgaGFuZGxlcnMsIHN0b3JlKSB7XG5cdHZhciBuYW1lc3BhY2UgPSAob3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0fVxuXHRpZighbmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoaGFuZGxlcnMpLmxlbmd0aCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGhhbmRsZXJzLCBrZXksIGxpc3RlbmVycyApIHtcblx0cmV0dXJuIHtcblx0XHR3YWl0Rm9yOiBbXSxcblx0XHRoYW5kbGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBjaGFuZ2VkID0gMDtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRsaXN0ZW5lcnNbIGtleSBdLmZvckVhY2goIGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiggc291cmNlLndhaXRGb3IgKXtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKC4uLm9wdGlvbnMpIHtcblx0dmFyIGxpc3RlbmVycyA9IHt9O1xuXHR2YXIgaGFuZGxlcnMgPSB7fTtcblx0dmFyIHN0YXRlID0ge307XG5cdHZhciBvdGhlck9wdHMgPSB7fTtcblx0b3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggbyApIHtcblx0XHR2YXIgb3B0O1xuXHRcdGlmKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZShvKTtcblx0XHRcdF8ubWVyZ2UoIHN0YXRlLCBvcHQuc3RhdGUgKTtcblx0XHRcdGlmKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdHZhciBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGhhbmRsZXJzLCBrZXksIGxpc3RlbmVycyApO1xuXHRcdFx0XHRcdC8vIGVuc3VyZSB0aGF0IHRoZSBoYW5kbGVyIGRlZmluaXRpb24gaGFzIGEgbGlzdCBvZiBhbGwgc3RvcmVzXG5cdFx0XHRcdFx0Ly8gYmVpbmcgd2FpdGVkIHVwb25cblx0XHRcdFx0XHR1cGRhdGVXYWl0Rm9yKCBoYW5kbGVyLCBoYW5kbGVyc1sga2V5IF0gKTtcblx0XHRcdFx0XHQvLyBBZGQgdGhlIG9yaWdpbmFsIGhhbmRsZXIgbWV0aG9kKHMpIHRvIHRoZSBsaXN0ZW5lcnMgcXVldWVcblx0XHRcdFx0XHRhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyIClcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHRcdF8ubWVyZ2UoIG90aGVyT3B0cywgb3B0ICk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIFsgc3RhdGUsIGhhbmRsZXJzLCBvdGhlck9wdHMgXTtcbn1cblxuY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKC4uLm9wdCkge1xuXHRcdHZhciBbIHN0YXRlLCBoYW5kbGVycywgb3B0aW9ucyBdID0gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0ICk7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgdGhpcyApO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZSB8fCB0aGlzLm5hbWVzcGFjZTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHR2YXIgaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHRcdH07XG5cblx0XHR0aGlzLnNldFN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcblx0XHRcdGlmKCFpbkRpc3BhdGNoKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInNldFN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIpO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKHN0YXRlLCBuZXdTdGF0ZSk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmKHRoaXMuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bWl4aW4odGhpcywgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbih7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0XHRcdGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0uaGFuZGxlci5hcHBseSh0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KGRhdGEuZGVwcykpO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IChyZXMgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0XHRcdFx0YCR7dGhpcy5uYW1lc3BhY2V9LmhhbmRsZWQuJHtkYXRhLmFjdGlvblR5cGV9YCxcblx0XHRcdFx0XHRcdHsgaGFzQ2hhbmdlZDogdGhpcy5oYXNDaGFuZ2VkLCBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlIH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkuY29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycylcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0Ly8gTmVlZCB0byBidWlsZCBpbiBiZWhhdmlvciB0byByZW1vdmUgdGhpcyBzdG9yZVxuXHQvLyBmcm9tIHRoZSBkaXNwYXRjaGVyJ3MgYWN0aW9uTWFwIGFzIHdlbGwhXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHRcdGRpc3BhdGNoZXIucmVtb3ZlU3RvcmUodGhpcy5uYW1lc3BhY2UpO1xuXHR9XG59XG5cblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbiwgYWN0aW9uVHlwZSkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHRpZihkZXBTdG9yZSkge1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdFx0fVxuXHRcdFx0fSAvKmVsc2Uge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZS53YXJuIG9uIGRlYnVnIGJ1aWxkXG5cdFx0XHRcdC8vIG5vdGluZyB0aGF0IGEgc3RvcmUgYWN0aW9uIHNwZWNpZmllcyBhbm90aGVyIHN0b3JlXG5cdFx0XHRcdC8vIGFzIGEgZGVwZW5kZW5jeSB0aGF0IGRvZXMgTk9UIHBhcnRpY2lwYXRlIGluIHRoZSBhY3Rpb25cblx0XHRcdFx0Ly8gdGhpcyBpcyB3aHkgYWN0aW9uVHlwZSBpcyBhbiBhcmcgaGVyZS4uLi5cblx0XHRcdH0qL1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUpKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuQmVoYXZpb3JhbEZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IGx1eEFjdGlvbjtcblx0XHRcdFx0XHRcdGlmKGx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0WyBmb3IgKCBnZW5lcmF0aW9uIG9mIGx1eEFjdGlvbi5nZW5lcmF0aW9ucyApXG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICkgXTtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oIGx1eEFjdGlvbiwgZGF0YSApIHtcblx0XHRcdFx0XHRcdGlmKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGhhbmRsZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoIGFjdGlvblR5cGUgKSB7XG5cdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLmNyZWF0ZVN1YnNjcmliZXJzKCk7XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApIHtcblx0XHR2YXIgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHR9O1xuXHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gfHwgW107XG5cdFx0XHRhY3Rpb24ucHVzaCggYWN0aW9uTWV0YSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdFx0dmFyIGlzVGhpc05hbWVTcGFjZSA9IGZ1bmN0aW9uKCBtZXRhICkge1xuXHRcdFx0cmV0dXJuIG1ldGEubmFtZXNwYWNlID09PSBuYW1lc3BhY2U7XG5cdFx0fTtcblx0XHRmb3IoIHZhciBbIGssIHYgXSBvZiBlbnRyaWVzKCB0aGlzLmFjdGlvbk1hcCApICkge1xuXHRcdFx0dmFyIGlkeCA9IHYuZmluZEluZGV4KCBpc1RoaXNOYW1lU3BhY2UgKTtcblx0XHRcdGlmKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0aWYoIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0dGhpcyxcblx0XHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0XHQoIGRhdGEsIGVudiApID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKGFjdGlvbk5hbWUpIHtcblx0dmFyIGdyb3VwcyA9IFtdO1xuXHRmb3IodmFyIFtncm91cCwgbGlzdF0gb2YgZW50cmllcyhhY3Rpb25Hcm91cHMpKSB7XG5cdFx0aWYobGlzdC5pbmRleE9mKGFjdGlvbk5hbWUpID49IDApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKGdyb3VwKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuLy8gTk9URSAtIHRoZXNlIHdpbGwgZXZlbnR1YWxseSBsaXZlIGluIHRoZWlyIG93biBhZGQtb24gbGliIG9yIGluIGEgZGVidWcgYnVpbGQgb2YgbHV4XG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKGFjdGlvbnMpXG5cdFx0XHQubWFwKGZ1bmN0aW9uKHgpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcImFjdGlvbiBuYW1lXCIgOiB4LFxuXHRcdFx0XHRcdFwic3RvcmVzXCIgOiBkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKHgpLnN0b3Jlcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC5uYW1lc3BhY2U7IH0pLmpvaW4oXCIsXCIpLFxuXHRcdFx0XHRcdFwiZ3JvdXBzXCIgOiBnZXRHcm91cHNXaXRoQWN0aW9uKHgpLmpvaW4oXCIsXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdGNvbnNvbGUuZ3JvdXAoXCJDdXJyZW50bHkgUmVjb2duaXplZCBBY3Rpb25zXCIpO1xuXHRcdFx0Y29uc29sZS50YWJsZShhY3Rpb25MaXN0KTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdGNvbnNvbGUubG9nKGFjdGlvbkxpc3QpO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZShhY3Rpb25UeXBlKSB7XG5cdFx0dmFyIHRyZWUgPSBbXTtcblx0XHRhY3Rpb25UeXBlID0gdHlwZW9mIGFjdGlvblR5cGUgPT09IFwic3RyaW5nXCIgPyBbYWN0aW9uVHlwZV0gOiBhY3Rpb25UeXBlO1xuXHRcdGlmKCFhY3Rpb25UeXBlKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoYWN0aW9ucyk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaChmdW5jdGlvbihhdCl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKGF0KVxuXHRcdFx0ICAgIC50cmVlLmZvckVhY2goZnVuY3Rpb24oeCkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoeC5sZW5ndGgpIHtcblx0XHRcdCAgICAgICAgICAgIHZhciB0ID0geC5wb3AoKTtcblx0XHRcdCAgICAgICAgICAgIHRyZWUucHVzaCh7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oXCIsXCIpLFxuXHRcdFx0ICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHQgICAgICAgICAgICB9KTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKHRyZWUpO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRyZWUpO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdFx0YWN0aW9uQ3JlYXRvcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=