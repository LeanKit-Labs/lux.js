"use strict";
import _ from "lodash";
import { dispatcherChannel, actionChannel } from "./bus";
import { entries } from "./utils";
import machina from "machina";

function calculateGen( store, lookup, gen, actionType, namespaces ) {
	let calcdGen = gen;
	const _namespaces = namespaces || [];
	if ( _namespaces.indexOf( store.namespace ) > -1 ) {
		throw new Error( `Circular dependency detected for the "${store.namespace}" store when participating in the "${actionType}" action.` );
	}
	if ( store.waitFor && store.waitFor.length ) {
		store.waitFor.forEach( function( dep ) {
			const depStore = lookup[ dep ];
			if ( depStore ) {
				_namespaces.push( store.namespace );
				const thisGen = calculateGen( depStore, lookup, gen + 1, actionType, _namespaces );
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
	const tree = [];
	const lookup = {};
	stores.forEach( ( store ) => lookup[ store.namespace ] = store );
	stores.forEach( ( store ) => store.gen = calculateGen( store, lookup, 0, actionType ) );
	/*eslint-disable */
	for ( let [ key, item ] of entries( lookup ) ) {
		tree[ item.gen ] = tree[ item.gen ] || [];
		tree[ item.gen ].push( item );
	}
	/*eslint-enable */
	return tree;
}

function processGeneration( generation, action ) {
	generation.map( ( store ) => {
		const data = Object.assign( {
			deps: _.pick( this.stores, store.waitFor )
		}, action );
		dispatcherChannel.publish(
			`${store.namespace}.handle.${action.actionType}`,
			data
		);
	} );
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
						if ( luxAction.generations.length ) {
							for ( var generation of luxAction.generations ) {
								processGeneration.call( luxAction, generation, luxAction.action );
							}
							this.transition( luxAction, "notifying" );
						} else {
							this.transition( luxAction, "nothandled" );
						}
					},
					"action.handled": function( luxAction, data ) {
						if ( data.hasChanged ) {
							luxAction.updated.push( data.namespace );
						}
					},
					_onExit: function( luxAction ) {
						if ( luxAction.updated.length ) {
							dispatcherChannel.publish( "prenotify", { stores: luxAction.updated } );
						}
					}
				},
				notifying: {
					_onEnter: function( luxAction ) {
						dispatcherChannel.publish( "notify", {
							action: luxAction.action
						} );
					}
				},
				nothandled: {}
			},
			getStoresHandling( actionType ) {
				const stores = this.actionMap[ actionType ] || [];
				return {
					stores,
					generations: buildGenerations( stores, actionType )
				};
			}
		} );
		this.createSubscribers();
	}

	handleActionDispatch( data ) {
		const luxAction = Object.assign(
			{ action: data, generationIndex: 0, updated: [] },
			this.getStoresHandling( data.actionType )
		);
		this.handle( luxAction, "action.dispatch" );
	}

	registerStore( storeMeta ) {
		for ( let actionDef of storeMeta.actions ) {
			let action;
			const actionName = actionDef.actionType;
			const actionMeta = {
				namespace: storeMeta.namespace,
				waitFor: actionDef.waitFor
			};
			action = this.actionMap[ actionName ] = this.actionMap[ actionName ] || [];
			action.push( actionMeta );
		}
	}

	removeStore( namespace ) {
		function isThisNameSpace( meta ) {
			return meta.namespace === namespace;
		}
		/*eslint-disable */
		for ( let [ k, v ] of entries( this.actionMap ) ) {
			let idx = v.findIndex( isThisNameSpace );
			if ( idx !== -1 ) {
				v.splice( idx, 1 );
			}
		}
		/*eslint-enable */
	}

	createSubscribers() {
		if ( !this.__subscriptions || !this.__subscriptions.length ) {
			this.__subscriptions = [
				actionChannel.subscribe(
					"execute.*",
					( data, env ) => this.handleActionDispatch( data )
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

export default new Dispatcher();

