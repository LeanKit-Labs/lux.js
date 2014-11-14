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
							this.transition("failure");
						}
						this.transition("success");
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
