
/* global storeChannel, dispatcherChannel, React, getActionCreatorFor, entries */
/* jshint -W098 */

var luxMixinCleanup = function () {
	this.__luxCleanup.forEach( (method) => method.call(this) );
	this.__luxCleanup = undefined;
	delete this.__luxCleanup;
};

function gateKeeper(store, data) {
	var payload = {};
	payload[store] = data;

	var found = this.__luxWaitFor.indexOf( store );

	if ( found > -1 ) {
		this.__luxWaitFor.splice( found, 1 );
		this.__luxHeardFrom.push( payload );

		if ( this.__luxWaitFor.length === 0 ) {
			payload = Object.assign( {}, ...this.__luxHeardFrom);
			this.__luxHeardFrom = [];
			this.stores.onChange.call(this, payload);
		}
	} else {
		this.stores.onChange.call(this, payload);
	}
}

function handlePreNotify( data ) {
	this.__luxWaitFor = data.stores.filter(
		( item ) => this.stores.listenTo.indexOf( item ) > -1
	);
}

var luxStoreMixin = {
	setup: function () {
		var stores = this.stores = (this.stores || {});
		var immediate = stores.hasOwnProperty("immediate") ? stores.immediate : true;
		var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
		var genericStateChangeHandler = function(stores) {
			if ( typeof this.setState === "function" ) {
				var newState = {};
				for( var [k,v] of entries(stores) ) {
					newState[ k ] = v.state;
				}
				this.setState( newState );
			}
		};
		this.__luxWaitFor = [];
		this.__luxHeardFrom = [];
		this.__subscriptions = this.__subscriptions || [];

		stores.onChange = stores.onChange || genericStateChangeHandler;

		listenTo.forEach((store) => this.__subscriptions.push(
			storeChannel.subscribe(`${store}.changed`, (data) => gateKeeper.call(this, store, data))
		));
		this.__subscriptions.push(
			dispatcherChannel.subscribe("prenotify", (data) => handlePreNotify.call(this, data))
		);
		// immediate can either be a bool, or an array of store namespaces
		// first check is for truthy
		if(immediate) {
			// second check is for strict bool equality
			if(immediate === true) {
				this.loadState();
			} else {
				this.loadState(...immediate);
			}
		}
	},
	teardown: function () {
		this.__subscriptions.forEach((sub) => sub.unsubscribe());
	},
	mixin: {
		loadState: function (...stores) {
			var listenTo;
			if(!stores.length) {
				listenTo = this.stores.listenTo;
				stores = typeof listenTo === "string" ? [listenTo] : listenTo;
			}
			this.__luxWaitFor = [...stores];
			stores.forEach(
				(store) => storeChannel.request({
					topic: `${store}.state`,
					replyChannel: storeChannel.channel,
					data: {
						component: this.constructor && this.constructor.displayName,
						rootNodeID: this._rootNodeID
					}
				}).then((data) => gateKeeper.call(this, store, data))
			);
		}
	}
};

var luxStoreReactMixin = {
	componentWillMount: luxStoreMixin.setup,
	loadState: luxStoreMixin.mixin.loadState,
	componentWillUnmount: luxStoreMixin.teardown
};

var luxActionMixin = {
	setup: function () {
		this.actions = this.actions || {};
		this.getActionsFor = this.getActionsFor || [];
		this.getActionsFor.forEach(function(store) {
			for(var [k, v] of entries(getActionCreatorFor(store))) {
				this[k] = v;
			}
		}.bind(this));
	}
};

var luxActionReactMixin = {
	componentWillMount: luxActionMixin.setup
};

function createControllerView(options) {
	var opt = {
		mixins: [luxStoreReactMixin, luxActionReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}

function createComponent(options) {
	var opt = {
		mixins: [luxActionReactMixin].concat(options.mixins || [])
	};
	delete options.mixins;
	return React.createClass(Object.assign(opt, options));
}


function mixin(context) {
	context.__luxCleanup = [];

	if ( context.stores ) {
		Object.assign(context, luxStoreMixin.mixin);
		luxStoreMixin.setup.call( context );
		context.__luxCleanup.push( luxStoreMixin.teardown );
	}

	if ( context.getActionsFor ) {
		luxActionMixin.setup.call( context );
	}

	context.luxCleanup = luxMixinCleanup;
}
