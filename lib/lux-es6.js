/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.3.0
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

	

var actions = Object.create(null);
var actionGroups = {};

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

function generateActionCreator(actionList) {
	actionList = (typeof actionList === "string") ? [actionList] : actionList;
	actionList.forEach(function(action) {
		if(!actions[action]) {
			actions[action] = function() {
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

function getActionGroup( group ) {
	if ( actionGroups[group] ) {
		return pluck(actions, actionGroups[group]);
	} else {
		throw new Error( `There is no action group named '${group}'`);
	}
}

function customActionCreator(action) {
	actions = Object.assign(actions, action);
}

function addToActionGroup(groupName, actionList) {
	var group = actionGroups[groupName];
	if(!group) {
		group = actionGroups[groupName] = [];
	}
	actionList = typeof actionList === "string" ? [actionList] : actionList;
	actionList.forEach(function(action){
		if(group.indexOf(action) === -1 ) {
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

	var found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
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

		if ( !stores.listenTo ) {
			throw new Error(`listenTo must contain at least one store namespace`);
		}

		var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;

		if ( !stores.onChange ) {
			throw new Error(`A component was told to listen to the following store(s): ${listenTo} but no onChange handler was implemented`);
		}

		__lux.waitFor = [];
		__lux.heardFrom = [];

		listenTo.forEach((store) => {
			__lux.subscriptions[`${store}.changed`] = storeChannel.subscribe(`${store}.changed`, () => gateKeeper.call(this, store));
		});

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", (data) => handlePreNotify.call(this, data));
	},
	teardown: function () {
		for(var [key, sub] of entries(this.__lux.subscriptions)) {
			var split;
			if(key === "prenotify" || (( split = key.split(".")) && split[1] === "changed" )) {
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
		this.getActionGroup = this.getActionGroup || [];
		this.getActions = this.getActions || [];

		if ( typeof this.getActionGroup === "string" ) {
			this.getActionGroup = [ this.getActionGroup ];
		}

		if ( typeof this.getActions === "string" ) {
			this.getActions = [ this.getActions ];
		}

		var addActionIfNotPreset = (k, v) => {
			if(!this[k]) {
					this[k] = v;
				}
		};
		this.getActionGroup.forEach((group) => {
			for(var [k, v] of entries(getActionGroup(group))) {
				addActionIfNotPreset(k, v);
			}
		});

		if(this.getActions.length) {
			this.getActions.forEach( function ( key ) {
				var val = actions[ key ];
				if ( val ) {
					addActionIfNotPreset(key, val);
				} else {
					throw new Error( `There is no action named '${key}'` );
				}
			});
		}
	},
	mixin: {
		publishAction: function(action, ...args) {
			actionChannel.publish({
				topic: `execute.${action}`,
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
			if(!handlers || !Object.keys(handlers).length ) {
				throw new Error( "You must have at least one action handler in the handlers property" );
			} else if ( subs && subs.actionListener ) {
				// TODO: add console warn in debug builds
				// since we ran the mixin on this context already
				return;
			}
			subs.actionListener =
				configSubscription(
					context,
					channel.subscribe( topic, handlerFn )
				);
			var handlerKeys = Object.keys(handlers);
			generateActionCreator(handlerKeys);
			if(context.namespace) {
				addToActionGroup(context.namespace, handlerKeys);
			}
		},
		teardown() {
			this.__lux.subscriptions.actionListener.unsubscribe();
		},
	};
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
	this.__lux.cleanup.forEach( (method) => method.call(this) );
	this.__lux.cleanup = undefined;
	delete this.__lux.cleanup;
};

function mixin(context, ...mixins) {
	if(mixins.length === 0) {
		mixins = [luxStoreMixin, luxActionCreatorMixin];
	}

	mixins.forEach((mixin) => {
		if(typeof mixin === "function") {
			mixin = mixin();
		}
		if(mixin.mixin) {
			Object.assign(context, mixin.mixin);
		}
		mixin.setup.call(context);
		if(mixin.teardown) {
			context.__lux.cleanup.push( mixin.teardown );
		}
	});
	context.luxCleanup = luxMixinCleanup;
	return context;
}

mixin.store = luxStoreMixin;
mixin.actionCreator = luxActionCreatorMixin;
mixin.actionListener = luxActionListenerMixin;

function actionListener(target) {
	return mixin( target, luxActionListenerMixin );
}

function actionCreator(target) {
	return mixin( target, luxActionCreatorMixin );
}

function actionCreatorListener(target) {
	return actionCreator( actionListener( target ));
}

	


function transformHandler(store, target, key, handler) {
	target[key] = function(...args) {
		return handler.apply(store, ...args);
	};
}

function transformHandlers(store, handlers) {
	var target = {};
	for (var [key, handler] of entries(handlers)) {
		transformHandler(
			store,
			target,
			key,
			typeof handler === "object" ? handler.handler : handler
		);
	}
	return target;
}

function ensureStoreOptions(options) {
	if (options.namespace in stores) {
		throw new Error(` The store namespace "${options.namespace}" already exists.`);
	}
	if(!options.namespace) {
		throw new Error("A lux store must have a namespace value provided");
	}
	if(!options.handlers || !Object.keys(options.handlers).length) {
		throw new Error("A lux store must have action handler methods provided");
	}
}

class Store {

	constructor(options) {
		ensureStoreOptions(options);
		var namespace = options.namespace;
		var stateProp = options.stateProp || "state";
		var state = options[stateProp] || {};
		var origHandlers = options.handlers;
		delete options.handlers;
		delete options[ stateProp ];
		Object.assign(this, options);
		var handlers = transformHandlers( this, origHandlers );
		stores[namespace] = this;
		var inDispatch = false;
		this.hasChanged = false;

		this.getState = function() {
			return state;
		};

		this.setState = function(newState) {
			if(!inDispatch) {
				throw new Error("setState can only be called during a dispatch cycle from a store action handler.");
			}
			state = Object.assign(state, newState);
		};

		this.flush = function flush() {
			inDispatch = false;
			if(this.hasChanged) {
				this.hasChanged = false;
				storeChannel.publish(`${this.namespace}.changed`);
			}
		};

		mixin(this, luxActionListenerMixin({
			context: this,
			channel: dispatcherChannel,
			topic: `${namespace}.handle.*`,
			handlers: handlers,
			handlerFn: function(data, envelope) {
				if (handlers.hasOwnProperty(data.actionType)) {
					inDispatch = true;
					var res = handlers[data.actionType].call(this, data.actionArgs.concat(data.deps));
					this.hasChanged = (res === false) ? false : true;
					dispatcherChannel.publish(
						`${this.namespace}.handled.${data.actionType}`,
						{ hasChanged: this.hasChanged, namespace: this.namespace }
					);
				}
			}.bind(this)
		}));

		this.__subscription = {
			notify: configSubscription(this, dispatcherChannel.subscribe(`notify`, this.flush)).withConstraint(() => inDispatch),
		};

		dispatcher.registerStore(
			{
				namespace,
				actions: buildActionList(origHandlers)
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
		dispatcher.removeStore(this.namespace);
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
							this.transition("success");
						} catch(ex) {
							this.err = ex;
							this.transition("failure");
						}
					},
					"action.handled": function(data) {
						if(data.hasChanged) {
							this.updated.push(data.namespace);
						}
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

	start() {
		this.handle("start");
	}
}

	

function calculateGen(store, lookup, gen, actionType) {
	var calcdGen = gen;
	if (store.waitFor && store.waitFor.length) {
		store.waitFor.forEach(function(dep) {
			var depStore = lookup[dep];
			if(depStore) {
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

function buildGenerations( stores, actionType ) {
	var tree = [];
	var lookup = {};
	stores.forEach((store) => lookup[store.namespace] = store);
	stores.forEach((store) => store.gen = calculateGen(store, lookup, 0, actionType));
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
					},
					"remove.store" : function(namespace) {
						var isThisNameSpace = function(meta) {
							return meta.namespace === namespace;
						};
						for(var [k, v] of entries(this.actionMap)) {
							var idx = v.findIndex(isThisNameSpace);
							if(idx !== -1) {
								v.splice(idx, 1);
							}
						}
					}
				},
				preparing: {
					_onEnter: function() {
						var handling = this.getStoresHandling(this.luxAction.action.actionType);
						this.luxAction.stores = handling.stores;
						this.luxAction.generations = handling.tree;
						this.transition(this.luxAction.generations.length ? "dispatching" : "ready");
					},
					"*": function() {
						this.deferUntilTransition("ready");
					}
				},
				dispatching: {
					_onEnter: function() {
						// This is all sync...hence the transition call below.
						var coordinator = new ActionCoordinator({
							generations: this.luxAction.generations,
							action: this.luxAction.action
						});
						coordinator.start();
						this.transition("ready");
					},
					"*": function() {
						this.deferUntilTransition("ready");
					}
				},
				stopped: {}
			},
			getStoresHandling(actionType) {
				var stores = this.actionMap[actionType] || [];
				return {
					stores,
					tree: buildGenerations( stores, actionType )
				};
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

	removeStore( namespace ) {
		this.handle("remove.store", namespace);
	}

	dispose() {
		this.transition("stopped");
		this.__subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
}

var dispatcher = new Dispatcher();

	


function getGroupsWithAction(actionName) {
	var groups = [];
	for(var [group, list] of entries(actionGroups)) {
		if(list.indexOf(actionName) >= 0) {
			groups.push(group);
		}
	}
	return groups;
}

// NOTE - these will eventually live in their own add-on lib or in a debug build of lux
var utils = {
	printActions() {
		var actionList = Object.keys(actions)
			.map(function(x) {
				return {
					"action name" : x,
					"stores" : dispatcher.getStoresHandling(x).stores.map(function(x) { return x.namespace; }).join(","),
					"groups" : getGroupsWithAction(x).join(",")
				};
			});
		if(console && console.table) {
			console.group("Currently Recognized Actions");
			console.table(actionList);
			console.groupEnd();
		} else if (console && console.log) {
			console.log(actionList);
		}
	},

	printStoreDepTree(actionType) {
		var tree = [];
		actionType = typeof actionType === "string" ? [actionType] : actionType;
		if(!actionType) {
			actionType = Object.keys(actions);
		}
		actionType.forEach(function(at){
			dispatcher.getStoresHandling(at)
			    .tree.forEach(function(x) {
			        while (x.length) {
			            var t = x.pop();
			            tree.push({
			            	"action type" : at,
			                "store namespace" : t.namespace,
			                "waits for" : t.waitFor.join(","),
			                generation: t.gen
			            });
			        }
			    });
		    if(console && console.table) {
				console.group(`Store Dependency List for ${at}`);
				console.table(tree);
				console.groupEnd();
			} else if (console && console.log) {
				console.log(`Store Dependency List for ${at}:`);
				console.log(tree);
			}
			tree = [];
		});
	}
};


	// jshint ignore: start
	return {
		actions,
		addToActionGroup,
		component,
		controllerView,
		customActionCreator,
		dispatcher,
		getActionGroup,
		actionCreatorListener,
		actionCreator,
		actionListener,
		mixin: mixin,
		removeStore,
		Store,
		stores,
		utils
	};
	// jshint ignore: end

}));
