/* global entries, dispatcher, mixin, luxActionListenerMixin, storeChannel, dispatcherChannel, configSubscription, lux, buildActionList, stores, generateActionCreator, merge, extend */
/* jshint -W098 */

function ensureStoreOptions(options, handlers, store) {
	var namespace = (options && options.namespace) || store.namespace;
	if (namespace in stores) {
		throw new Error(` The store namespace "${namespace}" already exists.`);
	}
	if(!namespace) {
		throw new Error("A lux store must have a namespace value provided");
	}
	if(!handlers || !Object.keys(handlers).length) {
		throw new Error("A lux store must have action handler methods provided");
	}
}

function getHandlerObject( handlers, key, listeners ) {
	return {
		waitFor: [],
		handler: function() {
			var changed = 0;
			var args = Array.from( arguments );
			listeners[ key ].forEach( function( listener ){
				changed += ( listener.apply( this, args ) === false ? 0 : 1 );
			}.bind( this ) );
			return changed > 0;
		}
	}
}

function updateWaitFor( source, handlerObject ) {
	if( source.waitFor ){
		source.waitFor.forEach( function( dep ) {
			if( handlerObject.waitFor.indexOf( dep ) === -1 ) {
				handlerObject.waitFor.push( dep );
			}
		});
	}
}

function addListeners( listeners, key, handler ) {
	listeners[ key ] = listeners[ key ] || [];
	listeners[ key ].push( handler.handler || handler );
}

function processStoreArgs(...options) {
	var listeners = {};
	var handlers = {};
	var state = {};
	var otherOpts = {};
	options.forEach( function( opt ) {
		if( opt ) {
			_.merge( state, opt.state );
			if( opt.handlers ) {
				Object.keys( opt.handlers ).forEach( function( key ) {
					var handler = opt.handlers[ key ];
					// set up the actual handler method that will be executed
					// as the store handles a dispatched action
					handlers[ key ] = handlers[ key ] || getHandlerObject( handlers, key, listeners );
					// ensure that the handler definition has a list of all stores
					// being waited upon
					updateWaitFor( handler, handlers[ key ] );
					// Add the original handler method(s) to the listeners queue
					addListeners( listeners, key, handler )
				});
			}
			delete opt.handlers;
			delete opt.state;
			_.merge( otherOpts, opt );
		}
	});
	return [ state, handlers, otherOpts ];
}

class Store {

	constructor(...opt) {
		var [ state, handlers, options ] = processStoreArgs( ...opt );
		ensureStoreOptions( options, handlers, this );
		var namespace = options.namespace || this.namespace;
		Object.assign(this, options);
		stores[namespace] = this;
		var inDispatch = false;
		this.hasChanged = false;

		this.getState = function() {
			return state;
		};

		this.setState = function(newState) {
			if(!inDispatch) {
				throw new Error("setState can only be called during a dispatch cycle from a store action handler.");
			}
			state = Object.assign(state, newState);
		};

		this.flush = function flush() {
			inDispatch = false;
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
					inDispatch = true;
					var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
					this.hasChanged = (res === false) ? false : true;
					dispatcherChannel.publish(
						`${this.namespace}.handled.${data.actionType}`,
						{ hasChanged: this.hasChanged, namespace: this.namespace }
					);
				}
			}.bind(this)
		}));

		this.__subscription = {
			notify: configSubscription(this, dispatcherChannel.subscribe(`notify`, this.flush)).constraint(() => inDispatch),
		};

		dispatcher.registerStore(
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
		dispatcher.removeStore(this.namespace);
	}
}

Store.extend = extend;

function removeStore(namespace) {
	stores[namespace].dispose();
}
