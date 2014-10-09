/* global luxCh, React, getActionCreatorFor, entries */
/* jshint -W098 */

var luxMixinCleanup = function () {
	this.__luxCleanup.forEach( (method) => method.call(this) );
	this.__luxCleanup = undefined;
	delete this.__luxCleanup;
};

function gateKeeper(store, data) {
	var payload = {};
	payload[store] = data;
	this.stores.onChange.call(this, payload);
}

var luxStoreMixin = {
	setup: function () {
		var stores = this.stores = (this.stores || {});
		var immediate = stores.immediate;
		var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
		var genericStateChangeHandler = function(stores) {
		    this.setState(stores);
		};
		this.__subscriptions = this.__subscriptions || [];
		var handler = stores.onChange || genericStateChangeHandler;
		listenTo.forEach((store) => this.__subscriptions.push(
	        luxCh.subscribe(`notification.${store}`, (data) => gateKeeper.call(this, store, data))
	    ));
		if(immediate) {
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
			if(!stores.length) {
			    stores = this.stores.listenTo;
			}
			stores.forEach((store) => luxCh.publish(`notify.${store}`));
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
		luxStoreMixin.setup.call( context );
		Object.assign(context, luxStoreMixin.mixin);
		context.__luxCleanup.push( luxStoreMixin.teardown );
	}

	if ( context.getActionsFor ) {
		luxActionMixin.setup.call( context );
	}

	context.luxCleanup = luxMixinCleanup;
}
