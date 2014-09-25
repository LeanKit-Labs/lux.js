

( function( root, factory ) {
  if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( [ "traceur", "react", "postal.request-response", "machina", "when", "when.pipeline", "when.parallel" ], factory );
  } else if ( typeof module === "object" && module.exports ) {
    // Node, or CommonJS-Like environments
    module.exports = function( postal, machina ) {
      return factory(
        require("traceur"), 
        require("react"), 
        postal, 
        machina, 
        require("when"), 
        require("when/pipeline"), 
        require("when/parallel"));
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}( this, function( traceur, React, postal, machina, when, pipeline, parallel ) {
  
  var luxCh = postal.channel( "lux" );
  var stores = {};

  // jshint ignore:start
  function* entries(obj) {
    for(var k of Object.keys(obj)) {
      yield [k, obj[k]];
    }
  }
  // jshint ignore:end

  function configSubscription(context, subscription) {
    return subscription.withContext(context)
                       .withConstraint(function(data, envelope){
                          return !(envelope.hasOwnProperty("originId")) || 
                           (envelope.originId === postal.instanceId());
                       });
  }

  

function buildActionList(handlers) {
    var actionList = [];
    for (var [key, handler] of entries(handlers)) {
        actionList.push({
            actionType: key,
            waitFor: handler.waitFor || []
        });
    }
    return actionList;
}

var actionCreators = {};

function getActionCreatorFor( store ) {
    return actionCreators[store];
}

function buildActionCreatorFrom(actionList) {
    var actionCreator = {};
    actionList.forEach(function(action) {
        actionCreator[action] = function() {
            var args = Array.from(arguments);
            luxCh.publish({
                topic: "action",
                data: {
                    actionType: action,
                    actionArgs: args
                }
            });
        };
    });
    return actionCreator;
}
  


class MemoryStorage {
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
        if (res instanceof Promise || (res && typeof res.then === "function")) {
            return res;
        } else {
            return new Promise(function(resolve, reject) {
                resolve(res);
            });
        }
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
    constructor(namespace, handlers, storageStrategy) {
        this.namespace = namespace;
        this.storage = storageStrategy;
        this.actionHandlers = transformHandlers(this, handlers);
        this.__subscription = {
            dispatch: configSubscription(this, luxCh.subscribe(`dispatch.${namespace}`, this.handlePayload)),
            notify: configSubscription(this, luxCh.subscribe(`notify`, this.flush))
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
        return this.storage.getState(...args);
    }

    setState(...args) {
        return this.storage.setState(...args);
    }

    replaceState(...args) {
        return this.storage.replaceState(...args);
    }

    flush() {
        luxCh.publish(`notification.${this.namespace}`, this.storage.flush());
    }

    handlePayload(data, envelope) {
        var namespace = this.namespace;
        if (this.actionHandlers.hasOwnProperty(data.actionType)) {
            this.actionHandlers[data.actionType]
                .call(this, data)
                .then(
                    (result) => envelope.reply(null, { result, namespace }),
                    (err) => envelope.reply(err)
                );
        }
    }
}


function createStore({ namespace, handlers = {}, storageStrategy = new MemoryStorage() }) {
    if (namespace in stores) {
        throw new Error(` The store namespace "${namespace}" already exists.`);
    }

    var store = new Store(namespace, handlers, storageStrategy);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(handlers));
    return store;
}


function removeStore(namespace) {
    stores[namespace].dispose();
    delete stores[namespace];
}
  

function pluck(obj, keys) {
    var res = keys.reduce((accum, key) => {
        accum[key] = (obj[key] && obj[key].result);
        return accum;
    }, {});
    return res;
}

function processGeneration(generation, action) {
        return () => parallel(
            generation.map((store) => {
                return () => {
                    var data = Object.assign({
                        deps: pluck(this.stores, store.waitFor)
                    }, action);
                    return luxCh.request({
                        topic: `dispatch.${store.namespace}`,
                        data: data
                    }).then((response) => {
                        this.stores[store.namespace] = this.stores[store.namespace] || {};
                        this.stores[store.namespace].result = response.result;
                    });
                };
            })).then(() => this.stores);
    }
    /*
    	Example of `config` argument:
    	{
    		generations: [],
    		action : {
    			actionType: "",
    			actionArgs: []
    		}
    	}
    */
class ActionCoordinator extends machina.Fsm {
    constructor(config) {
        Object.assign(this, {
            generationIndex: 0,
            stores: {}
        }, config);
        super({
            initialState: "uninitialized",
            states: {
                uninitialized: {
                    start: "dispatching"
                },
                dispatching: {
                    _onEnter() {
                            pipeline(
                                [
                                    for (generation of config.generations) processGeneration.call(this, generation, config.action)
                                ]
                            ).then(function(...results) {
                                this.results = results;
                                this.transition("success");
                            }.bind(this), function(err) {
                                this.err = err;
                                this.transition("failure");
                            }.bind(this));
                        },
                        _onExit: function() {
                            luxCh.publish("dispatchCycle");
                        }
                },
                success: {
                    _onEnter: function() {
                        luxCh.publish("notify", {
                            action: this.action
                        });
                        this.emit("success");
                    }
                },
                failure: {
                    _onEnter: function() {
                        luxCh.publish("notify", {
                            action: this.action
                        });
                        luxCh.publish("failure.action", {
                            action: this.action,
                            err: this.err
                        });
                        this.emit("failure");
                    }
                }
            }
        });
    }
    success(fn) {
        this.on("success", fn);
        if (!this._started) {
            setTimeout(() => this.handle("start"), 0);
            this._started = true;
        }
        return this;
    }
    failure(fn) {
        this.on("error", fn);
        if (!this._started) {
            setTimeout(() => this.handle("start"), 0);
            this._started = true;
        }
        return this;
    }
}
  

function calculateGen(store, lookup, gen) {
    gen = gen || 0;
    var calcdGen = gen;
    if (store.waitFor && store.waitFor.length) {
        store.waitFor.forEach(function(dep) {
            var depStore = lookup[dep];
            var thisGen = calculateGen(depStore, lookup, gen + 1);
            if (thisGen > calcdGen) {
                calcdGen = thisGen;
            }
        });
    }
    return calcdGen;
}

function buildGenerations(stores) {
    var tree = [];
    var lookup = {};
    stores.forEach((store) => lookup[store.namespace] = store);
    stores.forEach((store) => store.gen = calculateGen(store, lookup));
    for (var [key, item] of entries(lookup)) {
        tree[item.gen] = tree[item.gen] || [];
        tree[item.gen].push(item);
    }
    return tree;
}

class Dispatcher extends machina.Fsm {
    constructor() {
        super({
            initialState: "ready",
            actionMap: {},
            coordinators: [],
            states: {
                ready: {
                    _onEnter: function() {
                        this.luxAction = {};
                    },
                    "action.dispatch": function(actionMeta) {
                        this.luxAction = {
                            action: actionMeta
                        };
                        this.transition("preparing");
                    },
                    "register.store": function(storeMeta) {
                        for (var actionDef of storeMeta.actions) {
                            var action;
                            var actionName = actionDef.actionType;
                            var actionMeta = {
                                namespace: storeMeta.namespace,
                                waitFor: actionDef.waitFor
                            };
                            action = this.actionMap[actionName] = this.actionMap[actionName] || [];
                            action.push(actionMeta);
                        }
                    }
                },
                preparing: {
                    _onEnter: function() {
                        var stores = this.actionMap[this.luxAction.action.actionType];
                        this.luxAction.generations = buildGenerations(stores);
                        this.transition(this.luxAction.generations.length ? "dispatching" : "ready");
                    },
                    "*": function() {
                        this.deferUntilTransition("ready");
                    }
                },
                dispatching: {
                    _onEnter: function() {
                        var coordinator = this.luxAction.coordinator = new ActionCoordinator({
                            generations: this.luxAction.generations,
                            action: this.luxAction.action
                        });
                        coordinator
                            .success(() => this.transition("ready"))
                            .failure(() => this.transition("ready"));
                    },
                    "*": function() {
                        this.deferUntilTransition("ready");
                    }
                },
                stopped: {}
            }
        });
        this.__subscriptions = [
            configSubscription(
                this,
                luxCh.subscribe(
                    "action",
                    function(data, env) {
                        this.handleActionDispatch(data);
                    }
                )
            ),
            configSubscription(
                this,
                luxCh.subscribe(
                    "register",
                    function(data, env) {
                        this.handleStoreRegistration(data);
                    }
                )
            )
        ];
    }

    handleActionDispatch(data, envelope) {
        this.handle("action.dispatch", data);
    }

    handleStoreRegistration(data, envelope) {
        this.handle("register.store", data);
    }

    dispose() {
        this.transition("stopped");
        this.__subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}

var dispatcher = new Dispatcher();
  

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

  // jshint ignore: start
  return {
    channel: luxCh,
    stores,
    createStore,
    createControllerView,
    createComponent,
    removeStore,
    dispatcher,
    ActionCoordinator,
    getActionCreatorFor
  };
  // jshint ignore: end

}));