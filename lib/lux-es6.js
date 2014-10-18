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
		define( [ "traceur", "react", "postal.request-response", "machina", "when", "when.pipeline", "when.parallel" ], factory );
	} else if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function( postal, machina ) {
			return factory(
				require("traceur"),
				require("react"),
				postal,
				machina,
				require("when"),
				require("when/pipeline"),
				require("when/parallel"));
		};
	} else {
		throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
	}
}( this, function( traceur, React, postal, machina, when, pipeline, parallel ) {

	// We need to tell postal how to get a deferred instance from when.js
	postal.configuration.promise.createDeferred = function() {
		return when.defer();
	};
	// We need to tell postal how to get a "public-facing"/safe promise instance
	postal.configuration.promise.getPromise = function( dfd ) {
		return dfd.promise;
	};

	var actionChannel = postal.channel("lux.action");
	var storeChannel = postal.channel("lux.store");
	var dispatcherChannel = postal.channel("lux.dispatcher");

	// jshint ignore:start
	function* entries(obj) {
		for(var k of Object.keys(obj)) {
			yield [k, obj[k]];
		}
	}
	// jshint ignore:end

	function configSubscription(context, subscription) {
		return subscription.withContext(context)
		                   .withConstraint(function(data, envelope){
		                       return !(envelope.hasOwnProperty("originId")) ||
		                          (envelope.originId === postal.instanceId());
		                   });
	}

	

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

function getActionCreatorFor( store ) {
	return actionCreators[store];
}

function buildActionCreatorFrom(actionList) {
	var actionCreator = {};
	actionList.forEach(function(action) {
		actionCreator[action] = function() {
			var args = Array.from(arguments);
			actionChannel.publish({
				topic: `execute.${action}`,
				data: {
					actionType: action,
					actionArgs: args,
					component: this.constructor && this.constructor.displayName,
					rootNodeID: this._rootNodeID
				}
			});
		};
	});
	return actionCreator;
}

	


function transformHandler(store, target, key, handler) {
	target[key] = function(data) {
		return when(handler.apply(store, data.actionArgs.concat([data.deps])))
			.then(
				function(x){ return [null, x]; },
				function(err){ return [err]; }
			).then(function(values){
				var result = values[1];
				var error = values[0];
				if(error && typeof store.handleActionError === "function") {
					return when.join( error, result, store.handleActionError(key, error));
				} else {
					return when.join( error, result );
				}
			}).then(function(values){
				var res = values[1];
				var err = values[0];
				return when({
					hasChanged: store.hasChanged,
					result: res,
					error: err,
					state: store.getState()
				});
			});
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
	if(!options.namespace) {
		throw new Error("A lux store must have a namespace value provided");
	}
	if(!options.handlers) {
		throw new Error("A lux store must have action handler methods provided");
	}
}

var stores = {};

class Store {
	constructor(options) {
		ensureStoreOptions(options);
		var namespace = options.namespace;
		if (namespace in stores) {
			throw new Error(` The store namespace "${namespace}" already exists.`);
		} else {
			stores[namespace] = this;
		}
		this.changedKeys = [];
		this.actionHandlers = transformHandlers(this, options.handlers);
		actionCreators[namespace] = buildActionCreatorFrom(Object.keys(options.handlers));
		Object.assign(this, options);
		this.inDispatch = false;
		this.hasChanged = false;
		this.state = options.state || {};
		this.__subscription = {
			dispatch: configSubscription(this, dispatcherChannel.subscribe(`${namespace}.handle.*`, this.handlePayload)),
			notify: configSubscription(this, dispatcherChannel.subscribe(`notify`, this.flush)).withConstraint(() => this.inDispatch),
			getState: configSubscription(
				this,
				storeChannel.subscribe(
					`${namespace}.state`,
					(data, env) => env.reply(null, { changedKeys: [], state: this.state })
				)
			)
		};
		storeChannel.publish("register", {
			namespace,
			actions: buildActionList(options.handlers)
		});
	}

	dispose() {
		for (var [k, subscription] of entries(this.__subscription)) {
			subscription.unsubscribe();
		}
		delete stores[this.namespace];
	}

	getState() {
		return this.state;
	}

	setState(newState) {
		this.hasChanged = true;
		Object.keys(newState).forEach((key) => {
			this.changedKeys[key] = true;
		});
		return (this.state = Object.assign(this.state, newState));
	}

	replaceState(newState) {
		this.hasChanged = true;
		Object.keys(newState).forEach((key) => {
			this.changedKeys[key] = true;
		});
		return (this.state = newState);
	}

	flush() {
		this.inDispatch = false;
		if(this.hasChanged) {
			var changedKeys = Object.keys(this.changedKeys);
			this.changedKeys = {};
			this.hasChanged = false;
			storeChannel.publish(`${this.namespace}.changed`, { changedKeys, state: this.state });
		} else {
			storeChannel.publish(`${this.namespace}.unchanged`);
		}

	}

	handlePayload(data, envelope) {
		var namespace = this.namespace;
		if (this.actionHandlers.hasOwnProperty(data.actionType)) {
			this.inDispatch = true;
			this.actionHandlers[data.actionType]
				.call(this, data)
				.then(
					(result) => envelope.reply(null, result),
					(err) => envelope.reply(err)
				);
		}
	}
}

function removeStore(namespace) {
	stores[namespace].dispose();
}

	

function pluck(obj, keys) {
	var res = keys.reduce((accum, key) => {
		accum[key] = obj[key];
		return accum;
	}, {});
	return res;
}

function processGeneration(generation, action) {
		return () => parallel(
			generation.map((store) => {
				return () => {
					var data = Object.assign({
						deps: pluck(this.stores, store.waitFor)
					}, action);
					return dispatcherChannel.request({
						topic: `${store.namespace}.handle.${action.actionType}`,
						replyChannel: dispatcherChannel.channel,
						data: data
					}).then((response) => {
						this.stores[store.namespace] = response;
						if(response.hasChanged) {
							this.updated.push(store.namespace);
						}
					});
				};
			})).then(() => this.stores);
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
		super({
			initialState: "uninitialized",
			states: {
				uninitialized: {
					start: "dispatching"
				},
				dispatching: {
					_onEnter() {
							pipeline(
								[for (generation of config.generations) processGeneration.call(this, generation, config.action)]
							).then(function(...results) {
								this.transition("success");
							}.bind(this), function(err) {
								this.err = err;
								this.transition("failure");
							}.bind(this));
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
						var stores = this.actionMap[this.luxAction.action.actionType];
						this.luxAction.stores = stores;
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
					function(data, env) {
						this.handleActionDispatch(data);
					}
				)
			),
			configSubscription(
				this,
				storeChannel.subscribe(
					"register",
					function(data, env) {
						this.handleStoreRegistration(data);
					}
				)
			)
		];
	}

	handleActionDispatch(data, envelope) {
		this.handle("action.dispatch", data);
	}

	handleStoreRegistration(data, envelope) {
		this.handle("register.store", data);
	}

	dispose() {
		this.transition("stopped");
		this.__subscriptions.forEach((subscription) => subscription.unsubscribe());
	}
}

var dispatcher = new Dispatcher();

	



var luxMixinCleanup = function () {
	this.__luxCleanup.forEach( (method) => method.call(this) );
	this.__luxCleanup = undefined;
	delete this.__luxCleanup;
};

function gateKeeper(store, data) {
	var payload = {};
	payload[store] = data;

	var found = this.__luxWaitFor.indexOf( store );

	if ( found > -1 ) {
		this.__luxWaitFor.splice( found, 1 );
		this.__luxHeardFrom.push( payload );

		if ( this.__luxWaitFor.length === 0 ) {
			payload = Object.assign( {}, ...this.__luxHeardFrom);
			this.__luxHeardFrom = [];
			this.stores.onChange.call(this, payload);
		}
	} else {
		this.stores.onChange.call(this, payload);
	}
}

function handlePreNotify( data ) {
	this.__luxWaitFor = data.stores.filter(
		( item ) => this.stores.listenTo.indexOf( item ) > -1
	);
}

var luxStoreMixin = {
	setup: function () {
		var stores = this.stores = (this.stores || {});
		var immediate = stores.hasOwnProperty("immediate") ? stores.immediate : true;
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
		this.__luxWaitFor = [];
		this.__luxHeardFrom = [];
		this.__subscriptions = this.__subscriptions || [];

		stores.onChange = stores.onChange || genericStateChangeHandler;

		listenTo.forEach((store) => this.__subscriptions.push(
			storeChannel.subscribe(`${store}.changed`, (data) => gateKeeper.call(this, store, data))
		));
		this.__subscriptions.push(
			dispatcherChannel.subscribe("prenotify", (data) => handlePreNotify.call(this, data))
		);
		// immediate can either be a bool, or an array of store namespaces
		// first check is for truthy
		if(immediate) {
			// second check is for strict bool equality
			if(immediate === true) {
				this.loadState();
			} else {
				this.loadState(...immediate);
			}
		}
	},
	teardown: function () {
		this.__subscriptions.forEach((sub) => sub.unsubscribe());
	},
	mixin: {
		loadState: function (...stores) {
			var listenTo;
			if(!stores.length) {
				listenTo = this.stores.listenTo;
				stores = typeof listenTo === "string" ? [listenTo] : listenTo;
			}
			this.__luxWaitFor = [...stores];
			stores.forEach(
				(store) => storeChannel.request({
					topic: `${store}.state`,
					replyChannel: storeChannel.channel,
					data: {
						component: this.constructor && this.constructor.displayName,
						rootNodeID: this._rootNodeID
					}
				}).then((data) => gateKeeper.call(this, store, data))
			);
		}
	}
};

var luxStoreReactMixin = {
	componentWillMount: luxStoreMixin.setup,
	loadState: luxStoreMixin.mixin.loadState,
	componentWillUnmount: luxStoreMixin.teardown
};

var luxActionMixin = {
	setup: function () {
		this.actions = this.actions || {};
		this.getActionsFor = this.getActionsFor || [];
		this.getActionsFor.forEach(function(store) {
			for(var [k, v] of entries(getActionCreatorFor(store))) {
				this[k] = v;
			}
		}.bind(this));
	}
};

var luxActionReactMixin = {
	componentWillMount: luxActionMixin.setup
};

function createControllerView(options) {
	var opt = {
		mixins: [luxStoreReactMixin, luxActionReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}

function createComponent(options) {
	var opt = {
		mixins: [luxActionReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}


function mixin(context) {
	context.__luxCleanup = [];

	if ( context.stores ) {
		Object.assign(context, luxStoreMixin.mixin);
		luxStoreMixin.setup.call( context );
		context.__luxCleanup.push( luxStoreMixin.teardown );
	}

	if ( context.getActionsFor ) {
		luxActionMixin.setup.call( context );
	}

	context.luxCleanup = luxMixinCleanup;
}


	// jshint ignore: start
	return {
		Store,
		createControllerView,
		createComponent,
		removeStore,
		dispatcher,
		mixin: mixin,
		ActionCoordinator,
		getActionCreatorFor
	};
	// jshint ignore: end

}));
