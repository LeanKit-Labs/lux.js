/* global configSubscription, storeChannel, dispatcherChannel, buildActionList, entries, when, actionCreators, buildActionCreatorFrom */
/* jshint -W098 */

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
