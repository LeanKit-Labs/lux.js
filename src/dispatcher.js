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

class Dispatcher extends machina.BehavioralFsm {
	constructor() {
		this.actionContext = undefined;
		super({
			initialState: "ready",
			actionMap: {},
			states: {
				ready: {
					_onEnter: function() {
						this.actionContext = undefined;
					},
					"action.dispatch": "dispatching"
				},
				dispatching: {
					_onEnter: function( luxAction ) {
						this.actionContext = luxAction;
						if(luxAction.generations.length) {
							[ for ( generation of luxAction.generations )
								processGeneration.call( luxAction, generation, luxAction.action ) ];
							this.transition( luxAction, "notifying" );
						} else {
							this.transition( luxAction, "nothandled");
						}

					},
					"action.handled": function( luxAction, data ) {
						if( data.hasChanged ) {
							luxAction.updated.push( data.namespace );
						}
					},
					_onExit: function( luxAction ) {
						dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
					}
				},
				notifying: {
					_onEnter: function( luxAction ) {
						dispatcherChannel.publish( "notify", {
							action: luxAction.action
						});
					}
				},
				nothandled: {}
			},
			getStoresHandling( actionType ) {
				var stores = this.actionMap[ actionType ] || [];
				return {
					stores,
					generations: buildGenerations( stores, actionType )
				};
			}
		});
		this.createSubscribers();
	}

	handleActionDispatch( data ) {
		var stuff = _.pick( this.getStoresHandling( data.actionType ), [ "stores", "generations" ]);
		var luxAction = Object.assign(
			{ action: data, generationIndex: 0, updated: [] },
			stuff
		);
		this.handle( luxAction, "action.dispatch" );
	}

	registerStore( storeMeta ) {
		for ( var actionDef of storeMeta.actions ) {
			var action;
			var actionName = actionDef.actionType;
			var actionMeta = {
				namespace: storeMeta.namespace,
				waitFor: actionDef.waitFor
			};
			action = this.actionMap[ actionName ] = this.actionMap[ actionName ] || [];
			action.push( actionMeta );
		}
	}

	removeStore( namespace ) {
		var isThisNameSpace = function( meta ) {
			return meta.namespace === namespace;
		};
		for( var [ k, v ] of entries( this.actionMap ) ) {
			var idx = v.findIndex( isThisNameSpace );
			if( idx !== -1 ) {
				v.splice( idx, 1 );
			}
		}
	}

	createSubscribers() {
		if(!this.__subscriptions || !this.__subscriptions.length) {
			this.__subscriptions = [
				configSubscription(
					this,
					actionChannel.subscribe(
						"execute.*",
						( data, env ) => this.handleActionDispatch( data )
					)
				),
				dispatcherChannel.subscribe(
					"*.handled.*",
					( data ) => this.handle( this.actionContext, "action.handled", data )
				)
			];
		}
	}

	dispose() {
		this.__subscriptions.forEach( ( subscription ) => subscription.unsubscribe() );
	}
}

var dispatcher = new Dispatcher();
