/* global dispatcherChannel, machina */
/* jshint -W117, -W098 */

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

class ActionCoordinator extends machina.BehavioralFsm {
	constructor() {
		this.actionContext = {};

		this.__subscriptions = {
			handled: dispatcherChannel.subscribe(
				"*.handled.*",
				( data ) => this.handle( this.actionContext, "action.handled", data )
			)
		};

		super({
			initialState: "uninitialized",
			states: {
				uninitialized: {
					start: "dispatching",
					_onExit: function( client ) {
						this.actionContext = client;
					}
				},
				dispatching: {
					_onEnter( client ) {
						try {
							[for ( generation of client.generations ) processGeneration.call( client, generation, client.action )];
							this.transition( client, "success" );
						} catch( ex ) {
							client.err = ex;
							this.transition( client, "failure" );
						}
					},
					"action.handled": function( client, data ) {
						if( data.hasChanged ) {
							client.updated.push( data.namespace );
						}
					},
					_onExit: function( client ) {
						dispatcherChannel.publish("prenotify", { stores: client.updated });
						this.actionContext = undefined;
					}
				},
				success: {
					_onEnter: function( client ) {
						dispatcherChannel.publish( "notify", {
							action: client.action
						});
						this.emit( "success" );
					}
				},
				failure: {
					_onEnter: function( client ) {
						dispatcherChannel.publish( "notify", {
							action: client.action
						});
						dispatcherChannel.publish( "action.failure", {
							action: client.action,
							err: client.err
						});
						this.emit( "failure" );
					}
				}
			}
		});
	}

	start( client ) {
		this.handle( client, "start" );
	}
}
