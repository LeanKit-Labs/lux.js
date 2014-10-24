/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.3
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */


( function( root, factory ) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "traceur", "react", "postal", "machina" ], factory );
	} else if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function( postal, machina, React ) {
			return factory(
				require("traceur"),
				React || require("react"),
				postal,
				machina);
		};
	} else {
		throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
	}
}( this, function( traceur, React, postal, machina ) {

	var actionChannel = postal.channel("lux.action");
	var storeChannel = postal.channel("lux.store");
	var dispatcherChannel = postal.channel("lux.dispatcher");
	var stores = {};

	// jshint ignore:start
	function* entries(obj) {
		if(typeof obj !== "object") {
			obj = {};
		}
		for(var k of Object.keys(obj)) {
			yield [k, obj[k]];
		}
	}
	// jshint ignore:end

	function pluck(obj, keys) {
		var res = keys.reduce((accum, key) => {
			accum[key] = obj[key];
			return accum;
		}, {});
		return res;
	}

	function configSubscription(context, subscription) {
		return subscription.withContext(context)
		                   .withConstraint(function(data, envelope){
		                       return !(envelope.hasOwnProperty("originId")) ||
		                          (envelope.originId === postal.instanceId());
		                   });
	}

	function ensureLuxProp(context) {
		var __lux = context.__lux = (context.__lux || {});
		var cleanup = __lux.cleanup = (__lux.cleanup || []);
		var subscriptions = __lux.subscriptions = (__lux.subscriptions || {});
		return __lux;
	}

	



/*********************************************
*                 Store Mixin                *
**********************************************/
function gateKeeper(store, data) {
	var payload = {};
	payload[store] = data;
	var __lux = this.__lux;

	var found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
			payload = Object.assign( {}, ...__lux.heardFrom);
			__lux.heardFrom = [];
			this.stores.onChange.call(this, payload);
		}
	} else {
		this.stores.onChange.call(this, payload);
	}
}

function handlePreNotify( data ) {
	this.__lux.waitFor = data.stores.filter(
		( item ) => this.stores.listenTo.indexOf( item ) > -1
	);
}

var luxStoreMixin = {
	setup: function () {
		var __lux = ensureLuxProp(this);
		var stores = this.stores = (this.stores || {});
		var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
		var genericStateChangeHandler = function(stores) {
			if ( typeof this.setState === "function" ) {
				var newState = {};
				for( var [k,v] of entries(stores) ) {
					newState[ k ] = v.state;
				}
				this.setState( newState );
			}
		};
		__lux.waitFor = [];
		__lux.heardFrom = [];

		stores.onChange = stores.onChange || genericStateChangeHandler;

		listenTo.forEach((store) => {
			__lux.subscriptions[`${store}.changed`] = storeChannel.subscribe(`${store}.changed`, (data) => gateKeeper.call(this, store, data));
		});

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", (data) => handlePreNotify.call(this, data));
	},
	teardown: function () {
		for(var [key, sub] of entries(this.__lux.subscriptions)) {
			var split;
			if(key === "prenotify" || ( split = key.split(".") && split[1] === "changed" )) {
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
*           Action Dispatcher Mixin          *
**********************************************/

var luxActionDispatcherMixin = {
	setup: function () {
		this.getActionsFor = this.getActionsFor || [];
		this.getActions = this.getActions || [];
		this.getActionsFor.forEach(function(store) {
			for(var [k, v] of entries(getActionCreatorFor(store))) {
				if(!this[k]) {
					this[k] = v;
				}
			}
		}.bind(this));
	}
};

var luxActionDispatcherReactMixin = {
	componentWillMount: luxActionDispatcherMixin.setup
};

/*********************************************
*            Action Listener Mixin           *
**********************************************/
var luxActionListenerMixin = function({ handlers, handlerFn, context, channel, topic } = {}) {
	return {
		setup() {
			context = context || this;
			var __lux = ensureLuxProp(context);
			var subs = __lux.subscriptions;
			handlers = handlers || context.handlers;
			channel = channel || actionChannel;
			topic = topic || "execute.*";
			handlerFn = handlerFn || ((data, env) => {
				var handler;
				if(handler = handlers[data.actionType]) {
					handler.apply(context, data.actionArgs);
				}
			});
			if(!handlers || (subs && subs.actionListener)) {
				// TODO: add console warn in debug builds
				// first part of check means no handlers action
				// (but we tried to add the mixin....pointless)
				// second part of check indicates we already
				// ran the mixin on this context
				return;
			}
			subs.actionListener =
				configSubscription(
					context,
					channel.subscribe( topic, handlerFn )
				);
		},
		teardown() {
			this.__lux.subscriptions.actionListener.unsubscribe();
		},
	};
};

/*********************************************
*   React Component Versions of Above Mixin  *
**********************************************/
function createControllerView(options) {
	var opt = {
		mixins: [luxStoreReactMixin, luxActionDispatcherReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}

function createComponent(options) {
	var opt = {
		mixins: [luxActionDispatcherReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}


/*********************************************
*   Generalized Mixin Behavior for non-lux   *
**********************************************/
var luxMixinCleanup = function () {
	this.__lux.cleanup.forEach( (method) => method.call(this) );
	this.__lux.cleanup = undefined;
	delete this.__lux.cleanup;
};

function mixin(context, ...mixins) {
	if(mixins.length === 0) {
		mixins = [luxStoreMixin, luxActionDispatcherMixin, luxActionListenerMixin];
	}

	mixins.forEach((mixin) => {
		if(typeof mixin === "function") {
			mixin = mixin();
		}
		if(mixin.mixin) {
			Object.assign(context, mixin.mixin);
		}
		mixin.setup.call(context);
		context.__lux.cleanup.push( mixin.teardown );
	});
	context.luxCleanup = luxMixinCleanup;
}

mixin.store = luxStoreMixin;
mixin.actionDispatcher = luxActionDispatcherMixin;
mixin.actionListener = luxActionListenerMixin;

	

function buildActionList(handlers) {
	var actionList = [];
	for (var [key, handler] of entries(handlers)) {
		actionList.push({
			actionType: key,
			waitFor: handler.waitFor || []
		});
	}
	return actionList;
}

var actionCreators = {};
var actionGroups = {};

function getActionCreatorFor( group ) {
	return actionGroups[group] ? pluck(actionCreators, actionGroups[group]) : {};
}

function generateActionCreator(actionList) {
	actionList = (typeof actionList === "string") ? [actionList] : actionList;
	actionList.forEach(function(action) {
		if(!actionCreators[action]) {
			actionCreators[action] = function() {
				var args = Array.from(arguments);
				actionChannel.publish({
					topic: `execute.${action}`,
					data: {
						actionType: action,
						actionArgs: args
					}
				});
			};
		}
	});
}

function customActionCreator(action) {
	actionCreators = Object.assign(actionCreators, action);
}

function createActionGroup(groupName, actions) {
	actionGroups[groupName] = actions;
}

	


function transformHandler(store, state, target, key, handler) {
	target[key] = function(...args) {
		var res = handler.apply(store, [state].concat(...args));
	};
}

function transformHandlers(store, state, handlers) {
	var target = {};
	for (var [key, handler] of entries(handlers)) {
		transformHandler(
			store,
			state,
			target,
			key,
			typeof handler === "object" ? handler.handler : handler
		);
	}
	return target;
}

function ensureStoreOptions(options) {
	if(!options.namespace) {
		throw new Error("A lux store must have a namespace value provided");
	}
	if(!options.handlers) {
		throw new Error("A lux store must have action handler methods provided");
	}
}

class Store {

	constructor(options) {
		ensureStoreOptions(options);
		var namespace = options.namespace;
		if (namespace in stores) {
			throw new Error(` The store namespace "${namespace}" already exists.`);
		} else {
			stores[namespace] = this;
		}
		var stateProp = options.stateProp || "state";
		var state = options[stateProp] || {};
		var handlers = transformHandlers( this, state, options.handlers );
		delete options.handlers;
		delete options.state;
		this.changedKeys = [];
		Object.assign(this, options);
		this.inDispatch = false;
		this.hasChanged = false;

		this.getState = function() {
			return state;
		};

		this.flush = function flush() {
			this.inDispatch = false;
			if(true || this.hasChanged) { // TODO - integrated hasChanged
				var changedKeys = Object.keys(this.changedKeys);
				this.changedKeys = {};
				this.hasChanged = false;
				storeChannel.publish(`${this.namespace}.changed`, { changedKeys, state: state });
			} else {
				storeChannel.publish(`${this.namespace}.unchanged`);
			}
		};

		mixin(this, luxActionListenerMixin({
			context: this,
			channel: dispatcherChannel,
			topic: `${namespace}.handle.*`,
			handlers: handlers,
			handlerFn: function(data, envelope) {
				if (handlers.hasOwnProperty(data.actionType)) {
					this.inDispatch = true;
					handlers[data.actionType].call(this, data.actionArgs.concat(data.deps));
					dispatcherChannel.publish(
						`${this.namespace}.handled.${data.actionType}`,
						{ hasChanged: this.hasChanged, namespace: this.namespace }
					);
				}
			}.bind(this)
		}));

		this.__subscription = {
			notify: configSubscription(this, dispatcherChannel.subscribe(`notify`, this.flush)).withConstraint(() => this.inDispatch),
		};

		generateActionCreator(Object.keys(handlers));

		lux.dispatcher.registerStore(
			{
				namespace,
				actions: buildActionList(handlers)
			}
		);
	}

	// Need to build in behavior to remove this store
	// from the dispatcher's actionMap as well!
	dispose() {
		for (var [k, subscription] of entries(this.__subscription)) {
			subscription.unsubscribe();
		}
		delete stores[this.namespace];
	}
}

function removeStore(namespace) {
	stores[namespace].dispose();
}

	


function processGeneration(generation, action) {
	generation.map((store) => {
		var data = Object.assign({
			deps: pluck(this.stores, store.waitFor)
		}, action);
		dispatcherChannel.publish(
			`${store.namespace}.handle.${action.actionType}`,
			data
		);
	});
}
/*
	Example of `config` argument:
	{
		generations: [],
		action : {
			actionType: "",
			actionArgs: []
		}
	}
*/
class ActionCoordinator extends machina.Fsm {
	constructor(config) {
		Object.assign(this, {
			generationIndex: 0,
			stores: {},
			updated: []
		}, config);

		this.__subscriptions = {
			handled: dispatcherChannel.subscribe(
				"*.handled.*",
				(data) => this.handle("action.handled", data)
			)
		};

		super({
			initialState: "uninitialized",
			states: {
				uninitialized: {
					start: "dispatching"
				},
				dispatching: {
					_onEnter() {
						try {
							[for (generation of config.generations) processGeneration.call(this, generation, config.action)];
						} catch(ex) {
							this.err = ex;
							console.log(ex);
							this.transition("failure");
						}
						this.transition("success");
					},
					"action.handled": function(data) {
						this.updated.push(data.namespace);
					},
					_onExit: function() {
						dispatcherChannel.publish("prenotify", { stores: this.updated });
					}
				},
				success: {
					_onEnter: function() {
						dispatcherChannel.publish("notify", {
							action: this.action
						});
						this.emit("success");
					}
				},
				failure: {
					_onEnter: function() {
						dispatcherChannel.publish("notify", {
							action: this.action
						});
						dispatcherChannel.publish("action.failure", {
							action: this.action,
							err: this.err
						});
						this.emit("failure");
					}
				}
			}
		});
	}
	success(fn) {
		this.on("success", fn);
		if (!this._started) {
			setTimeout(() => this.handle("start"), 0);
			this._started = true;
		}
		return this;
	}
	failure(fn) {
		this.on("error", fn);
		if (!this._started) {
			setTimeout(() => this.handle("start"), 0);
			this._started = true;
		}
		return this;
	}
}

	

function calculateGen(store, lookup, gen) {
	gen = gen || 0;
	var calcdGen = gen;
	if (store.waitFor && store.waitFor.length) {
		store.waitFor.forEach(function(dep) {
			var depStore = lookup[dep];
			var thisGen = calculateGen(depStore, lookup, gen + 1);
			if (thisGen > calcdGen) {
				calcdGen = thisGen;
			}
		});
	}
	return calcdGen;
}

function buildGenerations(stores) {
	var tree = [];
	var lookup = {};
	stores.forEach((store) => lookup[store.namespace] = store);
	stores.forEach((store) => store.gen = calculateGen(store, lookup));
	for (var [key, item] of entries(lookup)) {
		tree[item.gen] = tree[item.gen] || [];
		tree[item.gen].push(item);
	}
	return tree;
}

class Dispatcher extends machina.Fsm {
	constructor() {
		super({
			initialState: "ready",
			actionMap: {},
			coordinators: [],
			states: {
				ready: {
					_onEnter: function() {
						this.luxAction = {};
					},
					"action.dispatch": function(actionMeta) {
						this.luxAction = {
							action: actionMeta
						};
						this.transition("preparing");
					},
					"register.store": function(storeMeta) {
						for (var actionDef of storeMeta.actions) {
							var action;
							var actionName = actionDef.actionType;
							var actionMeta = {
								namespace: storeMeta.namespace,
								waitFor: actionDef.waitFor
							};
							action = this.actionMap[actionName] = this.actionMap[actionName] || [];
							action.push(actionMeta);
						}
					}
				},
				preparing: {
					_onEnter: function() {
						var stores = this.luxAction.stores = this.actionMap[this.luxAction.action.actionType] || [];
						this.luxAction.generations = buildGenerations(stores);
						this.transition(this.luxAction.generations.length ? "dispatching" : "ready");
					},
					"*": function() {
						this.deferUntilTransition("ready");
					}
				},
				dispatching: {
					_onEnter: function() {
						var coordinator = this.luxAction.coordinator = new ActionCoordinator({
							generations: this.luxAction.generations,
							action: this.luxAction.action
						});
						coordinator
							.success(() => this.transition("ready"))
							.failure(() => this.transition("ready"));
					},
					"*": function() {
						this.deferUntilTransition("ready");
					}
				},
				stopped: {}
			}
		});
		this.__subscriptions = [
			configSubscription(
				this,
				actionChannel.subscribe(
					"execute.*",
					(data, env) => this.handleActionDispatch(data)
				)
			)
		];
	}

	handleActionDispatch(data, envelope) {
		this.handle("action.dispatch", data);
	}

	registerStore(config) {
		this.handle("register.store", config);
	}

	dispose() {
		this.transition("stopped");
		this.__subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
}

var dispatcher = new Dispatcher();


	// jshint ignore: start
	return {
		ActionCoordinator,
		actionCreators,
		createActionGroup,
		createComponent,
		createControllerView,
		customActionCreator,
		dispatcher,
		getActionCreatorFor,
		mixin: mixin,
		removeStore,
		Store
	};
	// jshint ignore: end

}));
