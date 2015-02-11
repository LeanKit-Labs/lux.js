/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.5.4
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
	/* istanbul ignore if */
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
//# sourceMappingURL=data:application/json;base64,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QUNKLENBQUMsQ0FBQztBQUNKLFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUc7QUFDakMsWUFBTyxDQUFDLEtBQUssZ0NBQStCLEVBQUUsQ0FBSSxDQUFDO0FBQ25ELFlBQU8sQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFFLENBQUM7QUFDdEIsWUFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ25CLE1BQU0sSUFBSyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRztBQUNwQyxZQUFPLENBQUMsR0FBRyxnQ0FBK0IsRUFBRSxPQUFLLENBQUM7QUFDbEQsWUFBTyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUNwQjtBQUNELFFBQUksR0FBRyxFQUFFLENBQUM7SUFDVixDQUFDLENBQUM7R0FDSDtFQUNELENBQUM7Ozs7QUFJRCxRQUFPO0FBQ04sU0FBTyxFQUFQLE9BQU87QUFDUCxrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFdBQVMsRUFBVCxTQUFTO0FBQ1QsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixZQUFVLEVBQVYsVUFBVTtBQUNWLGdCQUFjLEVBQWQsY0FBYztBQUNkLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsZUFBYSxFQUFiLGFBQWE7QUFDYixnQkFBYyxFQUFkLGNBQWM7QUFDZCxPQUFLLEVBQUUsS0FBSztBQUNaLGFBQVcsRUFBWCxXQUFXO0FBQ1gsT0FBSyxFQUFMLEtBQUs7QUFDTCxRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0VBQ0wsQ0FBQzs7Q0FHRixDQUFDLENBQUUiLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiLCBcImxvZGFzaFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIGxvZGFzaCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRSZWFjdCB8fCByZXF1aXJlKCBcInJlYWN0XCIgKSxcblx0XHRcdFx0cG9zdGFsIHx8IHJlcXVpcmUoIFwicG9zdGFsXCIgKSxcblx0XHRcdFx0bWFjaGluYSB8fCByZXF1aXJlKCBcIm1hY2hpbmFcIiApLFxuXHRcdFx0XHRsb2Rhc2ggfHwgcmVxdWlyZSggXCJsb2Rhc2hcIiApICk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIgKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIF8gKSB7XG5cblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdGlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl82dG81UG9seWZpbGwgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgaW5jbHVkZSB0aGUgNnRvNSBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovLzZ0bzUub3JnL2RvY3MvdXNhZ2UvcG9seWZpbGwvIGZvciBtb3JlIGRldGFpbHMuXCIpO1xuXHR9XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0dmFyIGVudHJpZXMgPSBmdW5jdGlvbiogKCBvYmogKSB7XG5cdFx0aWYoIFsgXCJvYmplY3RcIiwgXCJmdW5jdGlvblwiIF0uaW5kZXhPZiggdHlwZW9mIG9iaiApID09PSAtMSApIHtcblx0XHRcdG9iaiA9IHt9O1xuXHRcdH1cblx0XHRmb3IoIHZhciBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHRcdHlpZWxkIFsgaywgb2JqWyBrIF0gXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oIGNvbnRleHQsIHN1YnNjcmlwdGlvbiApIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLmNvbnRleHQoIGNvbnRleHQgKVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludCggZnVuY3Rpb24oIGRhdGEsIGVudmVsb3BlICl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gISggZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoIFwib3JpZ2luSWRcIiApICkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICggZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkgKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0XHR2YXIgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHR2YXIgZXh0ZW5kID0gZnVuY3Rpb24oIC4uLm9wdGlvbnMgKSB7XG5cdFx0dmFyIHBhcmVudCA9IHRoaXM7XG5cdFx0dmFyIHN0b3JlOyAvLyBwbGFjZWhvbGRlciBmb3IgaW5zdGFuY2UgY29uc3RydWN0b3Jcblx0XHR2YXIgc3RvcmVPYmogPSB7fTsgLy8gb2JqZWN0IHVzZWQgdG8gaG9sZCBpbml0aWFsU3RhdGUgJiBzdGF0ZXMgZnJvbSBwcm90b3R5cGUgZm9yIGluc3RhbmNlLWxldmVsIG1lcmdpbmdcblx0XHR2YXIgY3RvciA9IGZ1bmN0aW9uKCkge307IC8vIHBsYWNlaG9sZGVyIGN0b3IgZnVuY3Rpb24gdXNlZCB0byBpbnNlcnQgbGV2ZWwgaW4gcHJvdG90eXBlIGNoYWluXG5cblx0XHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRcdHZhciBtaXhpbnMgPSBbXTtcblx0XHRmb3IoIHZhciBvcHQgb2Ygb3B0aW9ucyApIHtcblx0XHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdH1cblxuXHRcdHZhciBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0XHQvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG5cdFx0Ly8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG5cdFx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRcdGlmICggcHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCBcImNvbnN0cnVjdG9yXCIgKSApIHtcblx0XHRcdHN0b3JlID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3Rvcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YXJnc1sgMCBdID0gYXJnc1sgMCBdIHx8IHt9O1xuXHRcdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0XHQvLyBJbmhlcml0IGNsYXNzIChzdGF0aWMpIHByb3BlcnRpZXMgZnJvbSBwYXJlbnQuXG5cdFx0Xy5tZXJnZSggc3RvcmUsIHBhcmVudCApO1xuXG5cdFx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0XHQvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuXHRcdGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xuXG5cdFx0Ly8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG5cdFx0Ly8gaWYgc3VwcGxpZWQuXG5cdFx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdFx0Xy5leHRlbmQoIHN0b3JlLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyApO1xuXHRcdH1cblxuXHRcdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0XHRzdG9yZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdG9yZTtcblxuXHRcdC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWQgbGF0ZXIuXG5cdFx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0XHRyZXR1cm4gc3RvcmU7XG5cdH07XG5cblx0XG5cbnZhciBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzICkge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCB2YXIgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiggIWFjdGlvbnNbIGFjdGlvbiBdKSB7XG5cdFx0XHRhY3Rpb25zWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvciggYWN0aW9uICkge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYoICFncm91cCApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdHZhciBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmKCBkaWZmLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgZm9sbG93aW5nIGFjdGlvbnMgZG8gbm90IGV4aXN0OiAke2RpZmYuam9pbihcIiwgXCIpfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKXtcblx0XHRpZiggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IoIHZhciBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZigga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2VudCA9ICggaywgdiApID0+IHtcblx0XHRcdGlmKCAhdGhpc1sgayBdICkge1xuXHRcdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCggKCBncm91cCApID0+IHtcblx0XHRcdGZvciggdmFyIFsgaywgdiBdIG9mIGVudHJpZXMoIGdldEFjdGlvbkdyb3VwKCBncm91cCApICkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCggaywgdiApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYoIHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBhY3Rpb25zWyBrZXkgXTtcblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrZXksIHZhbCApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHtrZXl9J2AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IGZ1bmN0aW9uKCBhY3Rpb24sIC4uLmFyZ3MgKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4ubWl4aW4ucHVibGlzaEFjdGlvblxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oIHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9ICkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBzaW5jZSB3ZSByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dCBhbHJlYWR5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHR2YXIgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyggaGFuZGxlcnMgKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggaGFuZGxlcktleXMgKTtcblx0XHRcdGlmKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gY29udHJvbGxlclZpZXcoIG9wdGlvbnMgKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGx1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gXS5jb25jYXQoIG9wdGlvbnMubWl4aW5zIHx8IFtdIClcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoIE9iamVjdC5hc3NpZ24oIG9wdCwgb3B0aW9ucyApICk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudCggb3B0aW9ucyApIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gXS5jb25jYXQoIG9wdGlvbnMubWl4aW5zIHx8IFtdIClcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoIE9iamVjdC5hc3NpZ24oIG9wdCwgb3B0aW9ucyApICk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAoIG1ldGhvZCApID0+IG1ldGhvZC5jYWxsKCB0aGlzICkgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oIGNvbnRleHQsIC4uLm1peGlucyApIHtcblx0aWYoIG1peGlucy5sZW5ndGggPT09IDAgKSB7XG5cdFx0bWl4aW5zID0gWyBsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKCAoIG1peGluICkgPT4ge1xuXHRcdGlmKCB0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYoIG1peGluLm1peGluICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggY29udGV4dCwgbWl4aW4ubWl4aW4gKTtcblx0XHR9XG5cdFx0aWYoIHR5cGVvZiBtaXhpbi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiggbWl4aW4udGVhcmRvd24gKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG5taXhpbi5zdG9yZSA9IGx1eFN0b3JlTWl4aW47XG5taXhpbi5hY3Rpb25DcmVhdG9yID0gbHV4QWN0aW9uQ3JlYXRvck1peGluO1xubWl4aW4uYWN0aW9uTGlzdGVuZXIgPSBsdXhBY3Rpb25MaXN0ZW5lck1peGluO1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHN0b3JlICkge1xuXHR2YXIgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiggIW5hbWVzcGFjZSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIgKTtcblx0fVxuXHRpZiggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKSB7XG5cdHJldHVybiB7XG5cdFx0d2FpdEZvcjogW10sXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgY2hhbmdlZCA9IDA7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKXtcblx0XHRcdFx0Y2hhbmdlZCArPSAoIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICkgPT09IGZhbHNlID8gMCA6IDEgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0XHRyZXR1cm4gY2hhbmdlZCA+IDA7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYoIHNvdXJjZS53YWl0Rm9yICl7XG5cdFx0c291cmNlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdGlmKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0dmFyIGxpc3RlbmVycyA9IHt9O1xuXHR2YXIgaGFuZGxlcnMgPSB7fTtcblx0dmFyIHN0YXRlID0ge307XG5cdHZhciBvdGhlck9wdHMgPSB7fTtcblx0b3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggbyApIHtcblx0XHR2YXIgb3B0O1xuXHRcdGlmKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYoIG9wdC5oYW5kbGVycyApIHtcblx0XHRcdFx0T2JqZWN0LmtleXMoIG9wdC5oYW5kbGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0dmFyIGhhbmRsZXIgPSBvcHQuaGFuZGxlcnNbIGtleSBdO1xuXHRcdFx0XHRcdC8vIHNldCB1cCB0aGUgYWN0dWFsIGhhbmRsZXIgbWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZFxuXHRcdFx0XHRcdC8vIGFzIHRoZSBzdG9yZSBoYW5kbGVzIGEgZGlzcGF0Y2hlZCBhY3Rpb25cblx0XHRcdFx0XHRoYW5kbGVyc1sga2V5IF0gPSBoYW5kbGVyc1sga2V5IF0gfHwgZ2V0SGFuZGxlck9iamVjdCggaGFuZGxlcnMsIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdFx0Xy5tZXJnZSggb3RoZXJPcHRzLCBvcHQgKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZiggdGhpcy5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goIGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbiggdGhpcywgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSwgZW52ZWxvcGUgKSB7XG5cdFx0XHRcdGlmKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKCB0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCB0aGlzLmZsdXNoICkgKS5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoICksXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzIClcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0Ly8gTmVlZCB0byBidWlsZCBpbiBiZWhhdmlvciB0byByZW1vdmUgdGhpcyBzdG9yZVxuXHQvLyBmcm9tIHRoZSBkaXNwYXRjaGVyJ3MgYWN0aW9uTWFwIGFzIHdlbGwhXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICggdmFyIFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdHN0b3Jlc1sgbmFtZXNwYWNlIF0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIGdlbiwgYWN0aW9uVHlwZSApIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoIHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGggKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwWyBkZXAgXTtcblx0XHRcdGlmKCBkZXBTdG9yZSApIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oIGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8qZWxzZSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlLndhcm4gb24gZGVidWcgYnVpbGRcblx0XHRcdFx0Ly8gbm90aW5nIHRoYXQgYSBzdG9yZSBhY3Rpb24gc3BlY2lmaWVzIGFub3RoZXIgc3RvcmVcblx0XHRcdFx0Ly8gYXMgYSBkZXBlbmRlbmN5IHRoYXQgZG9lcyBOT1QgcGFydGljaXBhdGUgaW4gdGhlIGFjdGlvblxuXHRcdFx0XHQvLyB0aGlzIGlzIHdoeSBhY3Rpb25UeXBlIGlzIGFuIGFyZyBoZXJlLi4uLlxuXHRcdFx0fSovXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHRmb3IgKCB2YXIgWyBrZXksIGl0ZW0gXSBvZiBlbnRyaWVzKCBsb29rdXAgKSApIHtcblx0XHR0cmVlWyBpdGVtLmdlbiBdID0gdHJlZVsgaXRlbS5nZW4gXSB8fCBbXTtcblx0XHR0cmVlWyBpdGVtLmdlbiBdLnB1c2goIGl0ZW0gKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKCB7XG5cdFx0XHRkZXBzOiBfLnBpY2soIHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yIClcblx0XHR9LCBhY3Rpb24gKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0pO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xuXHRcdHN1cGVyKCB7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IGx1eEFjdGlvbjtcblx0XHRcdFx0XHRcdGlmKGx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0WyBmb3IgKCBnZW5lcmF0aW9uIG9mIGx1eEFjdGlvbi5nZW5lcmF0aW9ucyApXG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICkgXTtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIik7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oIGx1eEFjdGlvbiwgZGF0YSApIHtcblx0XHRcdFx0XHRcdGlmKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IGx1eEFjdGlvbi51cGRhdGVkIH0gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGlmeWluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aGFuZGxlZDoge31cblx0XHRcdH0sXG5cdFx0XHRnZXRTdG9yZXNIYW5kbGluZyggYWN0aW9uVHlwZSApIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25UeXBlIF0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdGdlbmVyYXRpb25zOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuY3JlYXRlU3Vic2NyaWJlcnMoKTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhICkge1xuXHRcdHZhciBsdXhBY3Rpb24gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0eyBhY3Rpb246IGRhdGEsIGdlbmVyYXRpb25JbmRleDogMCwgdXBkYXRlZDogW10gfSxcblx0XHRcdHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcoIGRhdGEuYWN0aW9uVHlwZSApXG5cdFx0KTtcblx0XHR0aGlzLmhhbmRsZSggbHV4QWN0aW9uLCBcImFjdGlvbi5kaXNwYXRjaFwiICk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKCBzdG9yZU1ldGEgKSB7XG5cdFx0Zm9yICggdmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucyApIHtcblx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdH07XG5cdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSB8fCBbXTtcblx0XHRcdGFjdGlvbi5wdXNoKCBhY3Rpb25NZXRhICk7XG5cdFx0fVxuXHR9XG5cblx0cmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0XHR2YXIgaXNUaGlzTmFtZVNwYWNlID0gZnVuY3Rpb24oIG1ldGEgKSB7XG5cdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHR9O1xuXHRcdGZvciggdmFyIFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHR2YXIgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYoIGlkeCAhPT0gLTEgKSB7XG5cdFx0XHRcdHYuc3BsaWNlKCBpZHgsIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjcmVhdGVTdWJzY3JpYmVycygpIHtcblx0XHRpZiggIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbmZ1bmN0aW9uIGdldEdyb3Vwc1dpdGhBY3Rpb24oIGFjdGlvbk5hbWUgKSB7XG5cdHZhciBncm91cHMgPSBbXTtcblx0Zm9yKCB2YXIgWyBncm91cCwgbGlzdCBdIG9mIGVudHJpZXMoIGFjdGlvbkdyb3VwcyApICkge1xuXHRcdGlmKCBsaXN0LmluZGV4T2YoIGFjdGlvbk5hbWUgKSA+PSAwICkge1xuXHRcdFx0Z3JvdXBzLnB1c2goIGdyb3VwICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxudmFyIHV0aWxzID0ge1xuXHRwcmludEFjdGlvbnMoKSB7XG5cdFx0dmFyIGFjdGlvbkxpc3QgPSBPYmplY3Qua2V5cyggYWN0aW9ucyApXG5cdFx0XHQubWFwKCBmdW5jdGlvbiggeCApIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcImFjdGlvbiBuYW1lXCIgOiB4LFxuXHRcdFx0XHRcdFwic3RvcmVzXCIgOiBkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKCB4ICkuc3RvcmVzLm1hcCggZnVuY3Rpb24oIHggKSB7IHJldHVybiB4Lm5hbWVzcGFjZTsgfSApLmpvaW4oIFwiLFwiICksXG5cdFx0XHRcdFx0XCJncm91cHNcIiA6IGdldEdyb3Vwc1dpdGhBY3Rpb24oIHggKS5qb2luKCBcIixcIiApXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRpZiggY29uc29sZSAmJiBjb25zb2xlLnRhYmxlICkge1xuXHRcdFx0Y29uc29sZS5ncm91cCggXCJDdXJyZW50bHkgUmVjb2duaXplZCBBY3Rpb25zXCIgKTtcblx0XHRcdGNvbnNvbGUudGFibGUoIGFjdGlvbkxpc3QgKTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHR9IGVsc2UgaWYgKCBjb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xuXHRcdFx0Y29uc29sZS5sb2coIGFjdGlvbkxpc3QgKTtcblx0XHR9XG5cdH0sXG5cblx0cHJpbnRTdG9yZURlcFRyZWUoIGFjdGlvblR5cGUgKSB7XG5cdFx0dmFyIHRyZWUgPSBbXTtcblx0XHRhY3Rpb25UeXBlID0gdHlwZW9mIGFjdGlvblR5cGUgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvblR5cGUgXSA6IGFjdGlvblR5cGU7XG5cdFx0aWYoICFhY3Rpb25UeXBlICkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKCBhY3Rpb25zICk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaCggZnVuY3Rpb24oIGF0ICl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKCBhdCApXG5cdFx0XHQgICAgLmdlbmVyYXRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCB4ICkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoIHgubGVuZ3RoICkge1xuXHRcdFx0ICAgICAgICAgICAgdmFyIHQgPSB4LnBvcCgpO1xuXHRcdFx0ICAgICAgICAgICAgdHJlZS5wdXNoKCB7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oIFwiLFwiICksXG5cdFx0XHQgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdCAgICAgICAgICAgIH0gKTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZiggY29uc29sZSAmJiBjb25zb2xlLnRhYmxlICkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKCBgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWAgKTtcblx0XHRcdFx0Y29uc29sZS50YWJsZSggdHJlZSApO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKCBjb25zb2xlICYmIGNvbnNvbGUubG9nICkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyggYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCApO1xuXHRcdFx0XHRjb25zb2xlLmxvZyggdHJlZSApO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdFx0YWN0aW9uQ3JlYXRvcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=