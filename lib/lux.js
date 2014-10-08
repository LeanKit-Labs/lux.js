/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.1.0
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["traceur", "react", "postal.request-response", "machina", "when", "when.pipeline", "when.parallel"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = function(postal, machina) {
      return factory(require("traceur"), require("react"), postal, machina, require("when"), require("when/pipeline"), require("when/parallel"));
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}(this, function(traceur, React, postal, machina, when, pipeline, parallel) {
  var $__16 = $traceurRuntime.initGeneratorFunction(entries);
  var luxCh = postal.channel("lux");
  var stores = {};
  function entries(obj) {
    var $__5,
        $__6,
        k;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__5 = Object.keys(obj)[Symbol.iterator]();
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = (!($__6 = $__5.next()).done) ? 5 : -2;
            break;
          case 5:
            k = $__6.value;
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return [k, obj[k]];
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          default:
            return $ctx.end();
        }
    }, $__16, this);
  }
  function configSubscription(context, subscription) {
    return subscription.withContext(context).withConstraint(function(data, envelope) {
      return !(envelope.hasOwnProperty("originId")) || (envelope.originId === postal.instanceId());
    });
  }
  function buildActionList(handlers) {
    var actionList = [];
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__11 = $__6.value,
          key = $__11[0],
          handler = $__11[1];
      {
        actionList.push({
          actionType: key,
          waitFor: handler.waitFor || []
        });
      }
    }
    return actionList;
  }
  var actionCreators = {};
  function getActionCreatorFor(store) {
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
  var InMemoryTransport = function InMemoryTransport(state) {
    "use strict";
    this.state = state || {};
    this.changedKeys = [];
  };
  ($traceurRuntime.createClass)(InMemoryTransport, {
    getState: function() {
      "use strict";
      return new Promise(function(resolve, reject) {
        resolve(this.state);
      }.bind(this));
    },
    setState: function(newState) {
      "use strict";
      var $__0 = this;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      this.state = Object.assign(this.state, newState);
    },
    replaceState: function(newState) {
      "use strict";
      var $__0 = this;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      this.state = newState;
    },
    flush: function() {
      "use strict";
      var changedKeys = Object.keys(this.changedKeys);
      this.changedKeys = {};
      return {
        changedKeys: changedKeys,
        state: this.state
      };
    }
  }, {});
  function transformHandler(store, target, key, handler) {
    target[key] = function(data) {
      var res = handler.apply(store, data.actionArgs.concat([data.deps]));
      return when.join(when(res).then(function(x) {
        return [null, x];
      }, function(err) {
        return [err];
      }), store.getState()).then(function(values) {
        var res = values[0][1];
        var err = values[0][0];
        return when({
          result: res,
          error: err,
          state: values[1]
        });
      });
    };
  }
  function transformHandlers(store, handlers) {
    var target = {};
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__11 = $__6.value,
          key = $__11[0],
          handler = $__11[1];
      {
        transformHandler(store, target, key, typeof handler === "object" ? handler.handler : handler);
      }
    }
    return target;
  }
  var Store = function Store(namespace, handlers, transportStrategy) {
    "use strict";
    var $__0 = this;
    this.namespace = namespace;
    this.transport = transportStrategy;
    this.actionHandlers = transformHandlers(this, handlers);
    this.__subscription = {
      dispatch: configSubscription(this, luxCh.subscribe(("dispatch." + namespace), this.handlePayload)),
      notify: configSubscription(this, luxCh.subscribe("notify", this.flush)).withConstraint((function() {
        return $__0.inDispatch;
      })),
      scopedNotify: configSubscription(this, luxCh.subscribe(("notify." + namespace), this.flush))
    };
    luxCh.publish("register", {
      namespace: namespace,
      actions: buildActionList(handlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {
    dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__11 = $__6.value,
            k = $__11[0],
            subscription = $__11[1];
        {
          subscription.unsubscribe();
        }
      }
    },
    getState: function() {
      "use strict";
      var $__15;
      for (var args = [],
          $__7 = 0; $__7 < arguments.length; $__7++)
        args[$__7] = arguments[$__7];
      return ($__15 = this.transport).getState.apply($__15, $traceurRuntime.spread(args));
    },
    setState: function() {
      "use strict";
      var $__15;
      for (var args = [],
          $__8 = 0; $__8 < arguments.length; $__8++)
        args[$__8] = arguments[$__8];
      return ($__15 = this.transport).setState.apply($__15, $traceurRuntime.spread(args));
    },
    replaceState: function() {
      "use strict";
      var $__15;
      for (var args = [],
          $__9 = 0; $__9 < arguments.length; $__9++)
        args[$__9] = arguments[$__9];
      return ($__15 = this.transport).replaceState.apply($__15, $traceurRuntime.spread(args));
    },
    flush: function() {
      "use strict";
      this.inDispatch = false;
      luxCh.publish(("notification." + this.namespace), this.transport.flush());
    },
    handlePayload: function(data, envelope) {
      "use strict";
      var namespace = this.namespace;
      if (this.actionHandlers.hasOwnProperty(data.actionType)) {
        this.inDispatch = true;
        this.actionHandlers[data.actionType].call(this, data).then((function(result) {
          return envelope.reply(null, {
            result: result,
            namespace: namespace
          });
        }), (function(err) {
          return envelope.reply(err);
        }));
      }
    }
  }, {});
  function createStore($__11) {
    var $__13,
        $__14;
    var $__12 = $__11,
        namespace = $__12.namespace,
        handlers = ($__13 = $__12.handlers) === void 0 ? {} : $__13,
        transportStrategy = ($__14 = $__12.transportStrategy) === void 0 ? new InMemoryTransport() : $__14;
    if (namespace in stores) {
      throw new Error((" The store namespace \"" + namespace + "\" already exists."));
    }
    var store = new Store(namespace, handlers, transportStrategy);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(handlers));
    return store;
  }
  function removeStore(namespace) {
    stores[namespace].dispose();
    delete stores[namespace];
  }
  function pluck(obj, keys) {
    var res = keys.reduce((function(accum, key) {
      accum[key] = (obj[key] && obj[key].result);
      return accum;
    }), {});
    return res;
  }
  function processGeneration(generation, action) {
    var $__0 = this;
    return (function() {
      return parallel(generation.map((function(store) {
        return (function() {
          var data = Object.assign({deps: pluck($__0.stores, store.waitFor)}, action);
          return luxCh.request({
            topic: ("dispatch." + store.namespace),
            data: data
          }).then((function(response) {
            $__0.stores[store.namespace] = $__0.stores[store.namespace] || {};
            $__0.stores[store.namespace].result = response.result;
          }));
        });
      }))).then((function() {
        return $__0.stores;
      }));
    });
  }
  var ActionCoordinator = function ActionCoordinator(config) {
    "use strict";
    Object.assign(this, {
      generationIndex: 0,
      stores: {}
    }, config);
    $traceurRuntime.superCall(this, $ActionCoordinator.prototype, "constructor", [{
      initialState: "uninitialized",
      states: {
        uninitialized: {start: "dispatching"},
        dispatching: {
          _onEnter: function() {
            var $__4 = this;
            pipeline((function() {
              var $__2 = 0,
                  $__3 = [];
              for (var $__5 = config.generations[Symbol.iterator](),
                  $__6; !($__6 = $__5.next()).done; ) {
                var generation = $__6.value;
                $__3[$__2++] = processGeneration.call($__4, generation, config.action);
              }
              return $__3;
            }())).then(function() {
              for (var results = [],
                  $__10 = 0; $__10 < arguments.length; $__10++)
                results[$__10] = arguments[$__10];
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
        success: {_onEnter: function() {
            luxCh.publish("notify", {action: this.action});
            this.emit("success");
          }},
        failure: {_onEnter: function() {
            luxCh.publish("notify", {action: this.action});
            luxCh.publish("failure.action", {
              action: this.action,
              err: this.err
            });
            this.emit("failure");
          }}
      }
    }]);
  };
  var $ActionCoordinator = ActionCoordinator;
  ($traceurRuntime.createClass)(ActionCoordinator, {
    success: function(fn) {
      "use strict";
      var $__0 = this;
      this.on("success", fn);
      if (!this._started) {
        setTimeout((function() {
          return $__0.handle("start");
        }), 0);
        this._started = true;
      }
      return this;
    },
    failure: function(fn) {
      "use strict";
      var $__0 = this;
      this.on("error", fn);
      if (!this._started) {
        setTimeout((function() {
          return $__0.handle("start");
        }), 0);
        this._started = true;
      }
      return this;
    }
  }, {}, machina.Fsm);
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
    stores.forEach((function(store) {
      return lookup[store.namespace] = store;
    }));
    stores.forEach((function(store) {
      return store.gen = calculateGen(store, lookup);
    }));
    for (var $__5 = entries(lookup)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__11 = $__6.value,
          key = $__11[0],
          item = $__11[1];
      {
        tree[item.gen] = tree[item.gen] || [];
        tree[item.gen].push(item);
      }
    }
    return tree;
  }
  var Dispatcher = function Dispatcher() {
    "use strict";
    $traceurRuntime.superCall(this, $Dispatcher.prototype, "constructor", [{
      initialState: "ready",
      actionMap: {},
      coordinators: [],
      states: {
        ready: {
          _onEnter: function() {
            this.luxAction = {};
          },
          "action.dispatch": function(actionMeta) {
            this.luxAction = {action: actionMeta};
            this.transition("preparing");
          },
          "register.store": function(storeMeta) {
            for (var $__5 = storeMeta.actions[Symbol.iterator](),
                $__6; !($__6 = $__5.next()).done; ) {
              var actionDef = $__6.value;
              {
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
            var $__0 = this;
            var coordinator = this.luxAction.coordinator = new ActionCoordinator({
              generations: this.luxAction.generations,
              action: this.luxAction.action
            });
            coordinator.success((function() {
              return $__0.transition("ready");
            })).failure((function() {
              return $__0.transition("ready");
            }));
          },
          "*": function() {
            this.deferUntilTransition("ready");
          }
        },
        stopped: {}
      }
    }]);
    this.__subscriptions = [configSubscription(this, luxCh.subscribe("action", function(data, env) {
      this.handleActionDispatch(data);
    })), configSubscription(this, luxCh.subscribe("register", function(data, env) {
      this.handleStoreRegistration(data);
    }))];
  };
  var $Dispatcher = Dispatcher;
  ($traceurRuntime.createClass)(Dispatcher, {
    handleActionDispatch: function(data, envelope) {
      "use strict";
      this.handle("action.dispatch", data);
    },
    handleStoreRegistration: function(data, envelope) {
      "use strict";
      this.handle("register.store", data);
    },
    dispose: function() {
      "use strict";
      this.transition("stopped");
      this.__subscriptions.forEach((function(subscription) {
        return subscription.unsubscribe();
      }));
    }
  }, {}, machina.Fsm);
  var dispatcher = new Dispatcher();
  var luxMixinCleanup = function() {
    var $__0 = this;
    this.__luxCleanup.forEach((function(method) {
      return method.call($__0);
    }));
    this.__luxCleanup = undefined;
    delete this.__luxCleanup;
  };
  var luxStoreMixin = {
    setup: function() {
      var $__15;
      this.stores = this.stores || [];
      this.stateChangeHandlers = this.stateChangeHandlers || {};
      var genericStateChangeHandler = function(data) {
        this.setState(data.state || data);
      };
      this.__subscriptions = this.__subscriptions || [];
      var immediate = [];
      this.stores.forEach(function(st) {
        var $__0 = this;
        var store = st.store || st;
        var handler = st.handler || genericStateChangeHandler;
        this.__subscriptions.push(luxCh.subscribe("notification." + store, (function(data) {
          return handler.call($__0, data);
        })));
        if (st.immediate) {
          immediate.push(store);
        }
      }.bind(this));
      if (immediate.length) {
        ($__15 = this).loadState.apply($__15, $traceurRuntime.spread(immediate));
      }
    },
    teardown: function() {
      this.__subscriptions.forEach((function(sub) {
        return sub.unsubscribe();
      }));
    },
    mixin: {loadState: function() {
        for (var stores = [],
            $__10 = 0; $__10 < arguments.length; $__10++)
          stores[$__10] = arguments[$__10];
        if (!stores.length) {
          stores = this.stores.map((function(st) {
            return st.store;
          }));
        }
        stores.forEach((function(store) {
          return luxCh.publish(("notify." + store));
        }));
      }}
  };
  var luxStoreReactMixin = {
    componentWillMount: luxStoreMixin.setup,
    loadState: luxStoreMixin.mixin.loadState,
    componentWillUnmount: luxStoreMixin.teardown
  };
  var luxActionMixin = {setup: function() {
      this.actions = this.actions || {};
      this.getActionsFor = this.getActionsFor || [];
      this.getActionsFor.forEach(function(store) {
        for (var $__5 = entries(getActionCreatorFor(store))[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var $__11 = $__6.value,
              k = $__11[0],
              v = $__11[1];
          {
            this[k] = v;
          }
        }
      }.bind(this));
    }};
  var luxActionReactMixin = {componentWillMount: luxActionMixin.setup};
  function createControllerView(options) {
    var opt = {mixins: [luxStoreReactMixin, luxActionReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function createComponent(options) {
    var opt = {mixins: [luxActionReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function mixin(context) {
    context.__luxCleanup = [];
    if (context.stores) {
      luxStoreMixin.setup.call(context);
      Object.assign(context, luxStoreMixin.mixin);
      context.__luxCleanup.push(luxStoreMixin.teardown);
    }
    if (context.getActionsFor) {
      luxActionMixin.setup.call(context);
    }
    context.luxCleanup = luxMixinCleanup;
  }
  return {
    channel: luxCh,
    stores: stores,
    createStore: createStore,
    createControllerView: createControllerView,
    createComponent: createComponent,
    removeStore: removeStore,
    dispatcher: dispatcher,
    mixin: mixin,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: getActionCreatorFor
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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QUFPLFFBQU0sT0FBTyxDQUFDO0FBQ3JCLFNBQU8sQ0FBQSxLQUFJLFlBQVksQUFBQyxDQUFDLE1BQUssT0FBTyxBQUFDLENBQUMsR0FBRSxDQUFHLFFBQU0sQ0FBQyxDQUFDLENBQUM7RUFDekQ7QUFBQSxBQUdBLFNBQVMsTUFBSSxDQUFFLE9BQU0sQ0FBRztBQUN2QixVQUFNLGFBQWEsRUFBSSxHQUFDLENBQUM7QUFFekIsT0FBSyxPQUFNLE9BQU8sQ0FBSTtBQUNyQixrQkFBWSxNQUFNLEtBQUssQUFBQyxDQUFFLE9BQU0sQ0FBRSxDQUFDO0FBQ25DLFdBQUssT0FBTyxBQUFDLENBQUMsT0FBTSxDQUFHLENBQUEsYUFBWSxNQUFNLENBQUMsQ0FBQztBQUMzQyxZQUFNLGFBQWEsS0FBSyxBQUFDLENBQUUsYUFBWSxTQUFTLENBQUUsQ0FBQztJQUNwRDtBQUFBLEFBRUEsT0FBSyxPQUFNLGNBQWMsQ0FBSTtBQUM1QixtQkFBYSxNQUFNLEtBQUssQUFBQyxDQUFFLE9BQU0sQ0FBRSxDQUFDO0lBQ3JDO0FBQUEsQUFFQSxVQUFNLFdBQVcsRUFBSSxnQkFBYyxDQUFDO0VBQ3JDO0FBQUEsQUFJRSxPQUFPO0FBQ0wsVUFBTSxDQUFHLE1BQUk7QUFDYixTQUFLLENBQUwsT0FBSztBQUNMLGNBQVUsQ0FBVixZQUFVO0FBQ1YsdUJBQW1CLENBQW5CLHFCQUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULFFBQUksQ0FBRyxNQUFJO0FBQ1gsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDcEIsQ0FBQztBQUdILENBQUMsQ0FBQyxDQUFDO0FBQUEiLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZShcInRyYWNldXJcIiksIFxuICAgICAgICByZXF1aXJlKFwicmVhY3RcIiksIFxuICAgICAgICBwb3N0YWwsIFxuICAgICAgICBtYWNoaW5hLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW5cIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcbiAgXG4gIHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG4gIHZhciBzdG9yZXMgPSB7fTtcblxuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cbiAgLy8ganNoaW50IGlnbm9yZTplbmRcblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgXG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICAgIHZhciBhY3Rpb25MaXN0ID0gW107XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgYWN0aW9uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IGtleSxcbiAgICAgICAgICAgIHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICAgIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIHRvcGljOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG4gIFxuXG5cbmNsYXNzIEluTWVtb3J5VHJhbnNwb3J0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0ZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgZmx1c2goKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuICAgICAgICB0aGlzLmNoYW5nZWRLZXlzID0ge307XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFuZ2VkS2V5cyxcbiAgICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuICAgIHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzID0gaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChbZGF0YS5kZXBzXSkpO1xuICAgICAgICByZXR1cm4gd2hlbi5qb2luKFxuICAgICAgICAgICAgd2hlbihyZXMpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oeCl7IHJldHVybiBbbnVsbCwgeF07IH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXsgcmV0dXJuIFtlcnJdOyB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgc3RvcmUuZ2V0U3RhdGUoKVxuICAgICAgICApLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgICAgIHZhciByZXMgPSB2YWx1ZXNbMF1bMV07XG4gICAgICAgICAgICB2YXIgZXJyID0gdmFsdWVzWzBdWzBdO1xuICAgICAgICAgICAgcmV0dXJuIHdoZW4oe1xuICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgICAgICAgICAgc3RhdGU6IHZhbHVlc1sxXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuICAgIHZhciB0YXJnZXQgPSB7fTtcbiAgICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgICAgICB0cmFuc2Zvcm1IYW5kbGVyKFxuICAgICAgICAgICAgc3RvcmUsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuY2xhc3MgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWVzcGFjZSwgaGFuZGxlcnMsIHRyYW5zcG9ydFN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICB0aGlzLnRyYW5zcG9ydCA9IHRyYW5zcG9ydFN0cmF0ZWd5O1xuICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgaGFuZGxlcnMpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuICAgICAgICAgICAgbm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcbiAgICAgICAgICAgIHNjb3BlZE5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5LiR7bmFtZXNwYWNlfWAsIHRoaXMuZmx1c2gpKVxuICAgICAgICB9O1xuICAgICAgICBsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuICAgICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgICAgYWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LmdldFN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHNldFN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNldFN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHJlcGxhY2VTdGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBsYWNlU3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgZmx1c2goKSB7XG4gICAgICAgIHRoaXMuaW5EaXNwYXRjaCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgbHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgdGhpcy50cmFuc3BvcnQuZmx1c2goKSk7XG4gICAgfVxuXG4gICAgaGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLCBkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCB7IHJlc3VsdCwgbmFtZXNwYWNlIH0pLFxuICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSh7IG5hbWVzcGFjZSwgaGFuZGxlcnMgPSB7fSwgdHJhbnNwb3J0U3RyYXRlZ3kgPSBuZXcgSW5NZW1vcnlUcmFuc3BvcnQoKSB9KSB7XG4gICAgaWYgKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuICAgIH1cblxuICAgIHZhciBzdG9yZSA9IG5ldyBTdG9yZShuYW1lc3BhY2UsIGhhbmRsZXJzLCB0cmFuc3BvcnRTdHJhdGVneSk7XG4gICAgYWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcbiAgICByZXR1cm4gc3RvcmU7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG4gICAgc3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xuICAgIGRlbGV0ZSBzdG9yZXNbbmFtZXNwYWNlXTtcbn1cbiAgXG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuICAgIHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuICAgICAgICBhY2N1bVtrZXldID0gKG9ialtrZXldICYmIG9ialtrZXldLnJlc3VsdCk7XG4gICAgICAgIHJldHVybiBhY2N1bTtcbiAgICB9LCB7fSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBwYXJhbGxlbChcbiAgICAgICAgICAgIGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcbiAgICAgICAgICAgICAgICAgICAgfSwgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGx1eENoLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9waWM6IGBkaXNwYXRjaC4ke3N0b3JlLm5hbWVzcGFjZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gfHwge307XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdLnJlc3VsdCA9IHJlc3BvbnNlLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcbiAgICB9XG4gICAgLypcbiAgICBcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG4gICAgXHR7XG4gICAgXHRcdGdlbmVyYXRpb25zOiBbXSxcbiAgICBcdFx0YWN0aW9uIDoge1xuICAgIFx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG4gICAgXHRcdFx0YWN0aW9uQXJnczogW11cbiAgICBcdFx0fVxuICAgIFx0fVxuICAgICovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBnZW5lcmF0aW9uSW5kZXg6IDAsXG4gICAgICAgICAgICBzdG9yZXM6IHt9XG4gICAgICAgIH0sIGNvbmZpZyk7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG4gICAgICAgICAgICBzdGF0ZXM6IHtcbiAgICAgICAgICAgICAgICB1bmluaXRpYWxpemVkOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVsaW5lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oLi4ucmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX29uRXhpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImRpc3BhdGNoQ3ljbGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmFpbHVyZToge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJmYWlsdXJlLmFjdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnI6IHRoaXMuZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdWNjZXNzKGZuKSB7XG4gICAgICAgIHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZhaWx1cmUoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcImVycm9yXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuICBcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbikge1xuICAgIGdlbiA9IGdlbiB8fCAwO1xuICAgIHZhciBjYWxjZEdlbiA9IGdlbjtcbiAgICBpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuICAgICAgICBzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcbiAgICAgICAgICAgIHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuICAgICAgICAgICAgaWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuICAgICAgICAgICAgICAgIGNhbGNkR2VuID0gdGhpc0dlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcbiAgICB2YXIgdHJlZSA9IFtdO1xuICAgIHZhciBsb29rdXAgPSB7fTtcbiAgICBzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcbiAgICBmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuICAgICAgICAgICAgYWN0aW9uTWFwOiB7fSxcbiAgICAgICAgICAgIGNvb3JkaW5hdG9yczogW10sXG4gICAgICAgICAgICBzdGF0ZXM6IHtcbiAgICAgICAgICAgICAgICByZWFkeToge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbk1ldGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk1ldGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByZXBhcmluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCIqXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZhaWx1cmUoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0b3BwZWQ6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJhY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSwgZW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3RlclwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG4gICAgfVxuXG4gICAgaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgXG5cblxudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eENsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eENsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4Q2xlYW51cDtcbn07XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RvcmVzID0gdGhpcy5zdG9yZXMgfHwgW107XG5cdFx0dGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzID0gdGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzIHx8IHt9O1xuXHRcdHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdCAgICB0aGlzLnNldFN0YXRlKGRhdGEuc3RhdGUgfHwgZGF0YSk7XG5cdFx0fTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdO1xuXHRcdHZhciBpbW1lZGlhdGUgPSBbXTtcblx0XHR0aGlzLnN0b3Jlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0KSB7XG5cdFx0ICAgIHZhciBzdG9yZSA9IHN0LnN0b3JlIHx8IHN0O1xuXHRcdCAgICB2YXIgaGFuZGxlciA9IHN0LmhhbmRsZXIgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcblx0XHQgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcblx0XHQgICAgICAgIGx1eENoLnN1YnNjcmliZShcIm5vdGlmaWNhdGlvbi5cIiArIHN0b3JlLCAoZGF0YSkgPT4gaGFuZGxlci5jYWxsKHRoaXMsIGRhdGEpKVxuXHRcdCAgICApO1xuXHRcdCAgICBpZihzdC5pbW1lZGlhdGUpIHtcblx0XHQgICAgICAgIGltbWVkaWF0ZS5wdXNoKHN0b3JlKTtcblx0XHQgICAgfVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0aWYoaW1tZWRpYXRlLmxlbmd0aCkge1xuXHRcdCAgICB0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHQgICAgc3RvcmVzID0gdGhpcy5zdG9yZXMubWFwKChzdCkgPT4gc3Quc3RvcmUgKTtcblx0XHRcdH1cblx0XHRcdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbHV4Q2gucHVibGlzaChgbm90aWZ5LiR7c3RvcmV9YCkpO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG4gICAgbG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxudmFyIGx1eEFjdGlvbk1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG4gICAgICAgIHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcbiAgICAgICAgICAgIGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uQ3JlYXRvckZvcihzdG9yZSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpc1trXSA9IHY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufTtcblxudmFyIGx1eEFjdGlvblJlYWN0TWl4aW4gPSB7XG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcbiAgICB9O1xuICAgIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRsdXhTdG9yZU1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIGx1eFN0b3JlTWl4aW4ubWl4aW4pO1xuXHRcdGNvbnRleHQuX19sdXhDbGVhbnVwLnB1c2goIGx1eFN0b3JlTWl4aW4udGVhcmRvd24gKTtcblx0fVxuXG5cdGlmICggY29udGV4dC5nZXRBY3Rpb25zRm9yICkge1xuXHRcdGx1eEFjdGlvbk1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxuXG4gIC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gIHJldHVybiB7XG4gICAgY2hhbm5lbDogbHV4Q2gsXG4gICAgc3RvcmVzLFxuICAgIGNyZWF0ZVN0b3JlLFxuICAgIGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudCxcbiAgICByZW1vdmVTdG9yZSxcbiAgICBkaXNwYXRjaGVyLFxuICAgIG1peGluOiBtaXhpbixcbiAgICBBY3Rpb25Db29yZGluYXRvcixcbiAgICBnZXRBY3Rpb25DcmVhdG9yRm9yXG4gIH07XG4gIC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7IiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==