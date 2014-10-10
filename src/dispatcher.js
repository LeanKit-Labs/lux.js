/* global entries, machina, ActionCoordinator, configSubscription, luxCh */
/* jshint -W098 */
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
				luxCh.subscribe(
					"action",
					function(data, env) {
						this.handleActionDispatch(data);
					}
				)
			),
			configSubscription(
				this,
				luxCh.subscribe(
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
