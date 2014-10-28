/* global entries, mixin, luxActionListenerMixin, storeChannel, dispatcherChannel, configSubscription, lux, buildActionList, stores, generateActionCreator */
/* jshint -W098 */

function transformHandler(store, state, target, key, handler) {
	target[key] = function(...args) {
		return handler.apply(store, [state].concat(...args));
	};
}

function transformHandlers(store, state, handlers) {
	var target = {};
	for (var [key, handler] of entries(handlers)) {
		transformHandler(
			store,
			state,
			target,
			key,
			typeof handler === "object" ? handler.handler : handler
		);
	}
	return target;
}

function ensureStoreOptions(options) {
	if (options.namespace in stores) {
		throw new Error(` The store namespace "${options.namespace}" already exists.`);
	}
	if(!options.namespace) {
		throw new Error("A lux store must have a namespace value provided");
	}
	if(!options.handlers) {
		throw new Error("A lux store must have action handler methods provided");
	}
}

class Store {

	constructor(options) {
		ensureStoreOptions(options);
		var namespace = options.namespace;
		var stateProp = options.stateProp || "state";
		var state = options[stateProp] || {};
		var handlers = transformHandlers( this, state, options.handlers );
		stores[namespace] = this;
		delete options.handlers;
		delete options.state;
		Object.assign(this, options);
		this.inDispatch = false;
		this.hasChanged = false;

		this.getState = function() {
			return state;
		};

		this.flush = function flush() {
			this.inDispatch = false;
			if(this.hasChanged) {
				this.hasChanged = false;
				storeChannel.publish(`${this.namespace}.changed`);
			}
		};

		mixin(this, luxActionListenerMixin({
			context: this,
			channel: dispatcherChannel,
			topic: `${namespace}.handle.*`,
			handlers: handlers,
			handlerFn: function(data, envelope) {
				if (handlers.hasOwnProperty(data.actionType)) {
					this.inDispatch = true;
					var res = handlers[data.actionType].call(this, data.actionArgs.concat(data.deps));
					this.hasChanged = (res === false) ? false : true;
					dispatcherChannel.publish(
						`${this.namespace}.handled.${data.actionType}`,
						{ hasChanged: this.hasChanged, namespace: this.namespace }
					);
				}
			}.bind(this)
		}));

		this.__subscription = {
			notify: configSubscription(this, dispatcherChannel.subscribe(`notify`, this.flush)).withConstraint(() => this.inDispatch),
		};

		generateActionCreator(Object.keys(handlers));

		lux.dispatcher.registerStore(
			{
				namespace,
				actions: buildActionList(handlers)
			}
		);
	}

	// Need to build in behavior to remove this store
	// from the dispatcher's actionMap as well!
	dispose() {
		for (var [k, subscription] of entries(this.__subscription)) {
			subscription.unsubscribe();
		}
		delete stores[this.namespace];
	}
}

function removeStore(namespace) {
	stores[namespace].dispose();
}
