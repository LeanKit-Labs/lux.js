/* global luxCh, React, getActionCreatorFor */
/* jshint -W098 */
var luxStore = {
    componentWillMount: function() {
        this.stores = this.stores || [];
        this.stateChangeHandlers = this.stateChangeHandlers || {};
        var genericStateChangeHandler = function(data) {
            this.setState(data.state || data);
        };
        this.__subscriptions = this.__subscriptions || [];
        this.stores.forEach(function(st) {
            var store = st.store || st;
            var handler = st.handler || genericStateChangeHandler;
            this.__subscriptions.push(
                luxCh.subscribe("notification." + store, function(data) {
                    handler.call(this, data);
                }).withContext(this)
            );
        }.bind(this));
    },
    componentWillUnmount: function() {
        this.__subscriptions.forEach(function(sub) {
            sub.unsubscribe();
        });
    }
};

var luxAction = {
    componentWillMount: function() {
        this.actions = this.actions || {};
        this.getActionsFor = this.getActionsFor || [];
        this.getActionsFor.forEach(function(store) {
            this.actions[store] = getActionCreatorFor(store);
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