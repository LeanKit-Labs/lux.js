/* global configSubscription, luxCh, buildActionList, entries, stores, when */
/* jshint -W098 */

class InMemoryTransport {
    constructor(state) {
        this.state = state || {};
        this.changedKeys = [];
    }

    getState() {
        return new Promise(
            function(resolve, reject) {
                resolve(this.state);
            }.bind(this)
        );
    }

    setState(newState) {
        Object.keys(newState).forEach((key) => {
            this.changedKeys[key] = true;
        });
        this.state = Object.assign(this.state, newState);
    }

    replaceState(newState) {
        Object.keys(newState).forEach((key) => {
            this.changedKeys[key] = true;
        });
        this.state = newState;
    }

    flush() {
        var changedKeys = Object.keys(this.changedKeys);
        this.changedKeys = {};
        return {
            changedKeys,
            state: this.state
        };
    }
}

function transformHandler(store, target, key, handler) {
    target[key] = function(data) {
        var res = handler.apply(store, data.actionArgs.concat([data.deps]));
        return when.join(
            when(res).catch(function(err) { return err; }),
            store.getState()
        ).then(function(values){
            return when({
                result: values[0],
                state: values[1]
            });
        });
    };
}

function transformHandlers(store, handlers) {
    var target = {};
    if (!("getState" in handlers)) {
        handlers.getState = function(...args) {
            return this.getState(...args);
        };
    }
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

class Store {
    constructor(namespace, handlers, transportStrategy) {
        this.namespace = namespace;
        this.transport = transportStrategy;
        this.actionHandlers = transformHandlers(this, handlers);
        this.__subscription = {
            dispatch: configSubscription(this, luxCh.subscribe(`dispatch.${namespace}`, this.handlePayload)),
            notify: configSubscription(this, luxCh.subscribe(`notify`, this.flush)).withConstraint(() => this.inDispatch)
        };
        luxCh.publish("register", {
            namespace,
            actions: buildActionList(handlers)
        });
    }

    dispose() {
        for (var [k, subscription] of entries(this.__subscription)) {
            subscription.unsubscribe();
        }
    }

    getState(...args) {
        return this.transport.getState(...args);
    }

    setState(...args) {
        return this.transport.setState(...args);
    }

    replaceState(...args) {
        return this.transport.replaceState(...args);
    }

    flush() {
        this.inDispatch = false;
        luxCh.publish(`notification.${this.namespace}`, this.transport.flush());
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

/* jshint ignore:start */
function createStore({ namespace, handlers = {}, transportStrategy = new InMemoryTransport() }) {
    if (namespace in stores) {
        throw new Error(` The store namespace "${namespace}" already exists.`);
    }

    var store = new Store(namespace, handlers, transportStrategy);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(handlers));
    return store;
}
/* jshint ignore:end */

function removeStore(namespace) {
    stores[namespace].dispose();
    delete stores[namespace];
}