/* global entries, machina, ActionCoordinator, configSubscription, actionChannel, storeChannel */
/* jshint -W098 */
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
