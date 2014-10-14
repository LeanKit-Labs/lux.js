/* global parallel,luxCh, machina, pipeline, LUX_CHANNEL */
/* jshint -W117, -W098 */
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
					return luxCh.request({
						topic: `dispatch.${store.namespace}`,
						replyChannel: LUX_CHANNEL,
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
							luxCh.publish("prenotify", { stores: this.updated });
						}
				},
				success: {
					_onEnter: function() {
						luxCh.publish("notify", {
							action: this.action
						});
						this.emit("success");
					}
				},
				failure: {
					_onEnter: function() {
						luxCh.publish("notify", {
							action: this.action
						});
						luxCh.publish("failure.action", {
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
