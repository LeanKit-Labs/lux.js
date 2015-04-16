/* global entries, machina, ActionCoordinator, configSubscription, actionChannel, storeChannel */
/* jshint -W098 */
function calculateGen( store, lookup, gen, actionType, namespaces ) {
	var calcdGen = gen;
	var _namespaces = namespaces || [];
	if ( _namespaces.indexOf( store.namespace ) > -1 ) {
		throw new Error( `Circular dependency detected for the "${store.namespace}" store when participating in the "${actionType}" action.` );
	}
	if ( store.waitFor && store.waitFor.length ) {
		store.waitFor.forEach( function( dep ) {
			var depStore = lookup[ dep ];
			if( depStore ) {
				_namespaces.push( store.namespace );
				var thisGen = calculateGen( depStore, lookup, gen + 1, actionType, _namespaces );
				if ( thisGen > calcdGen ) {
					calcdGen = thisGen;
				}
			} else {
				console.warn( `The "${actionType}" action in the "${store.namespace}" store waits for "${dep}" but a store with that namespace does not participate in this action.` );
			}
		} );
	}
	return calcdGen;
}

function buildGenerations( stores, actionType ) {
	var tree = [];
	var lookup = {};
	stores.forEach( ( store ) => lookup[ store.namespace ] = store );
	stores.forEach( ( store ) => store.gen = calculateGen( store, lookup, 0, actionType ) );
	for ( var [ key, item ] of entries( lookup ) ) {
		tree[ item.gen ] = tree[ item.gen ] || [];
		tree[ item.gen ].push( item );
	}
	return tree;
}

function processGeneration( generation, action ) {
	generation.map( ( store ) => {
		var data = Object.assign( {
			deps: _.pick( this.stores, store.waitFor )
		}, action );
		dispatcherChannel.publish(
			`${store.namespace}.handle.${action.actionType}`,
			data
		);
	});
}

class Dispatcher extends machina.BehavioralFsm {
	constructor() {
		super( {
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
							for ( var generation of luxAction.generations ) {
								processGeneration.call( luxAction, generation, luxAction.action );
							}
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
						if( luxAction.updated.length ) {
							dispatcherChannel.publish( "prenotify", { stores: luxAction.updated } );
						}
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
		var luxAction = Object.assign(
			{ action: data, generationIndex: 0, updated: [] },
			this.getStoresHandling( data.actionType )
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
		if( !this.__subscriptions || !this.__subscriptions.length ) {
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
				).constraint( () => !!this.actionContext )
			];
		}
	}

	dispose() {
		if ( this.__subscriptions ) {
			this.__subscriptions.forEach( ( subscription ) => subscription.unsubscribe() );
			this.__subscriptions = null;
		}
	}
}

var dispatcher = new Dispatcher();
