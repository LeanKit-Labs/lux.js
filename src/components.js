/* global luxCh, React, getActionCreatorFor, entries */
/* jshint -W098 */
var luxStore = {
    componentWillMount: function() {
        this.stores = this.stores || [];
        this.stateChangeHandlers = this.stateChangeHandlers || {};
        var genericStateChangeHandler = function(data) {
            this.setState(data.state || data);
        };
        this.__subscriptions = this.__subscriptions || [];
        var immediate = [];
        this.stores.forEach(function(st) {
            var store = st.store || st;
            var handler = st.handler || genericStateChangeHandler;
            this.__subscriptions.push(
                luxCh.subscribe("notification." + store, (data) => handler.call(this, data))
            );
            if(st.immediate) {
                immediate.push(store);
            }
        }.bind(this));
        if(immediate.length) {
            this.loadState(...immediate);
        }
    },

    loadState: function(...stores) {
        if(!stores.length) {
            stores = this.stores.map((st) => st.store );
        }
        stores.forEach((store) => luxCh.publish(`notify.${store}`));
    },

    componentWillUnmount: function() {
        this.__subscriptions.forEach((sub) => sub.unsubscribe());
    }
};

var luxAction = {
    componentWillMount: function() {
        this.actions = this.actions || {};
        this.getActionsFor = this.getActionsFor || [];
        this.getActionsFor.forEach(function(store) {
            for(var [k, v] of entries(getActionCreatorFor(store))) {
                if(!this.hasOwnProperty(k)) {
                    this[k] = v;
                }
            }
        }.bind(this));
    }
};

function createControllerView(options) {
    var opt = {
        mixins: [luxStore, luxAction].concat(options.mixins || [])
    };
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
}

function createComponent(options) {
    var opt = {
        mixins: [luxAction].concat(options.mixins || [])
    };
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
}