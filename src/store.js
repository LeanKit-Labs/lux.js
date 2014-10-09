/* global configSubscription, luxCh, buildActionList, entries, when, actionCreators, buildActionCreatorFrom */
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
        this.state = options.state || {};
        this.changedKeys = [];
        this.actionHandlers = transformHandlers(this, options.handlers);
        actionCreators[namespace] = buildActionCreatorFrom(Object.keys(options.handlers));
        Object.assign(this, options);
        this.__subscription = {
            dispatch: configSubscription(this, luxCh.subscribe(`dispatch.${namespace}`, this.handlePayload)),
            notify: configSubscription(this, luxCh.subscribe(`notify`, this.flush)).withConstraint(() => this.inDispatch),
            scopedNotify: configSubscription(this, luxCh.subscribe(`notify.${namespace}`, this.flush))
        };
        luxCh.publish("register", {
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
        Object.keys(newState).forEach((key) => {
            this.changedKeys[key] = true;
        });
        return (this.state = Object.assign(this.state, newState));
    }

    replaceState(newState) {
        Object.keys(newState).forEach((key) => {
            this.changedKeys[key] = true;
        });
        return (this.state = newState);
    }

    flush() {
        this.inDispatch = false;
        var changedKeys = Object.keys(this.changedKeys);
        this.changedKeys = {};
        luxCh.publish(`notification.${this.namespace}`, { changedKeys, state: this.state });
    }

    handlePayload(data, envelope) {
        var namespace = this.namespace;
        if (this.actionHandlers.hasOwnProperty(data.actionType)) {
            this.inDispatch = true;
            this.actionHandlers[data.actionType]
                .call(this, data)
                .then(
                    (result) => envelope.reply(null, { result, namespace }),
                    (err) => envelope.reply(err)
                );
        }
    }
}

function removeStore(namespace) {
    stores[namespace].dispose();
}