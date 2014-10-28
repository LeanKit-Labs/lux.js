
/* global storeChannel, pluck, actionCreators, ensureLuxProp, actionChannel, dispatcherChannel, React, getActionCreatorFor, entries, configSubscription, luxActionChannel */
/* jshint -W098 */

/*********************************************
*                 Store Mixin                *
**********************************************/
function gateKeeper(store, data) {
	var payload = {};
	payload[store] = true;
	var __lux = this.__lux;

	var found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
			__lux.heardFrom = [];
			this.stores.onChange.call(this, payload);
		}
	} else {
		this.stores.onChange.call(this, payload);
	}
}

function handlePreNotify( data ) {
	this.__lux.waitFor = data.stores.filter(
		( item ) => this.stores.listenTo.indexOf( item ) > -1
	);
}

var luxStoreMixin = {
	setup: function () {
		var __lux = ensureLuxProp(this);
		var stores = this.stores = (this.stores || {});
		var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
		var noChangeHandlerImplemented = function() {
			throw new Error(`A component was told to listen to the following store(s): ${listenTo} but no onChange handler was implemented`);
		};
		__lux.waitFor = [];
		__lux.heardFrom = [];

		stores.onChange = stores.onChange || noChangeHandlerImplemented;

		listenTo.forEach((store) => {
			__lux.subscriptions[`${store}.changed`] = storeChannel.subscribe(`${store}.changed`, () => gateKeeper.call(this, store));
		});

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", (data) => handlePreNotify.call(this, data));
	},
	teardown: function () {
		for(var [key, sub] of entries(this.__lux.subscriptions)) {
			var split;
			if(key === "prenotify" || ( split = key.split(".") && split[1] === "changed" )) {
				sub.unsubscribe();
			}
		}
	},
	mixin: {}
};

var luxStoreReactMixin = {
	componentWillMount: luxStoreMixin.setup,
	loadState: luxStoreMixin.mixin.loadState,
	componentWillUnmount: luxStoreMixin.teardown
};

/*********************************************
*           Action Dispatcher Mixin          *
**********************************************/

var luxActionDispatcherMixin = {
	setup: function () {
		this.getActionsFor = this.getActionsFor || [];
		this.getActions = this.getActions || [];
		var addActionIfNotPreset = (k, v) => {
			if(!this[k]) {
					this[k] = v;
				}
		};
		this.getActionsFor.forEach((group) => {
			for(var [k, v] of entries(getActionCreatorFor(group))) {
				addActionIfNotPreset(k, v);
			}
		});
		if(this.getActions.length) {
			for(var [key, val] of entries(pluck(actionCreators, this.getActions))) {
				addActionIfNotPreset(key, val);
			}
		}
	}
};

var luxActionDispatcherReactMixin = {
	componentWillMount: luxActionDispatcherMixin.setup
};

/*********************************************
*            Action Listener Mixin           *
**********************************************/
var luxActionListenerMixin = function({ handlers, handlerFn, context, channel, topic } = {}) {
	return {
		setup() {
			context = context || this;
			var __lux = ensureLuxProp(context);
			var subs = __lux.subscriptions;
			handlers = handlers || context.handlers;
			channel = channel || actionChannel;
			topic = topic || "execute.*";
			handlerFn = handlerFn || ((data, env) => {
				var handler;
				if(handler = handlers[data.actionType]) {
					handler.apply(context, data.actionArgs);
				}
			});
			if(!handlers || (subs && subs.actionListener)) {
				// TODO: add console warn in debug builds
				// first part of check means no handlers action
				// (but we tried to add the mixin....pointless)
				// second part of check indicates we already
				// ran the mixin on this context
				return;
			}
			subs.actionListener =
				configSubscription(
					context,
					channel.subscribe( topic, handlerFn )
				);
		},
		teardown() {
			this.__lux.subscriptions.actionListener.unsubscribe();
		},
	};
};

/*********************************************
*   React Component Versions of Above Mixin  *
**********************************************/
function createControllerView(options) {
	var opt = {
		mixins: [luxStoreReactMixin, luxActionDispatcherReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}

function createComponent(options) {
	var opt = {
		mixins: [luxActionDispatcherReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}


/*********************************************
*   Generalized Mixin Behavior for non-lux   *
**********************************************/
var luxMixinCleanup = function () {
	this.__lux.cleanup.forEach( (method) => method.call(this) );
	this.__lux.cleanup = undefined;
	delete this.__lux.cleanup;
};

function mixin(context, ...mixins) {
	if(mixins.length === 0) {
		mixins = [luxStoreMixin, luxActionDispatcherMixin, luxActionListenerMixin];
	}

	mixins.forEach((mixin) => {
		if(typeof mixin === "function") {
			mixin = mixin();
		}
		if(mixin.mixin) {
			Object.assign(context, mixin.mixin);
		}
		mixin.setup.call(context);
		context.__lux.cleanup.push( mixin.teardown );
	});
	context.luxCleanup = luxMixinCleanup;
}

mixin.store = luxStoreMixin;
mixin.actionDispatcher = luxActionDispatcherMixin;
mixin.actionListener = luxActionListenerMixin;
