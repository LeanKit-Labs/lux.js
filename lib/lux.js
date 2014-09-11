/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.0.1
 * Url: 
 * License(s): MIT
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
  var MemoryStorage = function MemoryStorage(state) {
    "use strict";
    this.state = state || {};
    this.changedKeys = [];
  };
  ($traceurRuntime.createClass)(MemoryStorage, {
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
      handlers.getState = function() {
        var $__15;
        for (var args = [],
            $__7 = 0; $__7 < arguments.length; $__7++)
          args[$__7] = arguments[$__7];
        return ($__15 = this).getState.apply($__15, $traceurRuntime.spread(args));
      };
    }
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
  var Store = function Store(namespace, handlers, storageStrategy) {
    "use strict";
    this.namespace = namespace;
    this.storage = storageStrategy;
    this.actionHandlers = transformHandlers(this, handlers);
    this.__subscription = {
      dispatch: configSubscription(this, luxCh.subscribe(("dispatch." + namespace), this.handlePayload)),
      notify: configSubscription(this, luxCh.subscribe("notify", this.flush))
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
      return ($__15 = this.storage).getState.apply($__15, $traceurRuntime.spread(args));
    },
    setState: function() {
      "use strict";
      var $__15;
      for (var args = [],
          $__8 = 0; $__8 < arguments.length; $__8++)
        args[$__8] = arguments[$__8];
      return ($__15 = this.storage).setState.apply($__15, $traceurRuntime.spread(args));
    },
    replaceState: function() {
      "use strict";
      var $__15;
      for (var args = [],
          $__9 = 0; $__9 < arguments.length; $__9++)
        args[$__9] = arguments[$__9];
      return ($__15 = this.storage).replaceState.apply($__15, $traceurRuntime.spread(args));
    },
    flush: function() {
      "use strict";
      luxCh.publish(("notification." + this.namespace), this.storage.flush());
    },
    handlePayload: function(data, envelope) {
      "use strict";
      var namespace = this.namespace;
      if (this.actionHandlers.hasOwnProperty(data.actionType)) {
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
        storageStrategy = ($__14 = $__12.storageStrategy) === void 0 ? new MemoryStorage() : $__14;
    if (namespace in stores) {
      throw new Error((" The store namespace \"" + namespace + "\" already exists."));
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
              console.log("ZE RESULTS");
              console.log(results);
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
        this.__subscriptions.push(luxCh.subscribe("notification." + store, function(data) {
          handler.call(this, data);
        }).withContext(this));
      }.bind(this));
    },
    componentWillUnmount: function() {
      this.__subscriptions.forEach(function(sub) {
        sub.unsubscribe();
      });
    }
  };
  var luxAction = {componentWillMount: function() {
      this.actions = this.actions || {};
      this.getActionsFor = this.getActionsFor || [];
      this.getActionsFor.forEach(function(store) {
        this.actions[store] = getActionCreatorFor(store);
      }.bind(this));
    }};
  function createControllerView(options) {
    var opt = {mixins: [luxStore, luxAction].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function createComponent(options) {
    var opt = {mixins: [luxAction].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  return {
    channel: luxCh,
    stores: stores,
    createStore: createStore,
    createControllerView: createControllerView,
    createComponent: createComponent,
    removeStore: removeStore,
    dispatcher: dispatcher,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: getActionCreatorFor
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE1IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE2IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE0IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE3IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLEFBQUUsU0FBVSxJQUFHLENBQUcsQ0FBQSxPQUFNLENBQUk7QUFDMUIsS0FBSyxNQUFPLE9BQUssQ0FBQSxHQUFNLFdB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RUFBSSxFQUNOLE1BQUssQ0FBRyxDQUFBLENBQUMsUUFBTyxDQUFHLFVBQVEsQ0FBQyxPQUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDN0QsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN6RDtBQUFBLEFBRUEsU0FBUyxnQkFBYyxDQUFFLE9BQU0sQ0FBRztBQUM5QixBQUFJLE1BQUEsQ0FBQSxHQUFFLEVBQUksRUFDTixNQUFLLENBQUcsQ0FBQSxDQUFDLFNBQVEsQ0FBQyxPQUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDbkQsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN6RDtBQUFBLEFBR0UsT0FBTztBQUNMLFVBQU0sQ0FBRyxNQUFJO0FBQ2IsU0FBSyxDQUFMLE9BQUs7QUFDTCxjQUFVLENBQVYsWUFBVTtBQUNWLHVCQUFtQixDQUFuQixxQkFBbUI7QUFDbkIsa0JBQWMsQ0FBZCxnQkFBYztBQUNkLGNBQVUsQ0FBVixZQUFVO0FBQ1YsYUFBUyxDQUFULFdBQVM7QUFDVCxvQkFBZ0IsQ0FBaEIsa0JBQWdCO0FBQ2hCLHNCQUFrQixDQUFsQixvQkFBa0I7QUFBQSxFQUNwQixDQUFDO0FBR0gsQ0FBQyxDQUFDLENBQUM7QUFBQSIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsLnJlcXVlc3QtcmVzcG9uc2VcIiwgXCJtYWNoaW5hXCIsIFwid2hlblwiLCBcIndoZW4ucGlwZWxpbmVcIiwgXCJ3aGVuLnBhcmFsbGVsXCIgXSwgZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoXG4gICAgICAgIHJlcXVpcmUoXCJ0cmFjZXVyXCIpLCBcbiAgICAgICAgcmVxdWlyZShcInJlYWN0XCIpLCBcbiAgICAgICAgcG9zdGFsLCBcbiAgICAgICAgbWFjaGluYSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuXCIpLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW4vcGlwZWxpbmVcIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9wYXJhbGxlbFwiKSk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG4gIH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCB3aGVuLCBwaXBlbGluZSwgcGFyYWxsZWwgKSB7XG4gIFxuICB2YXIgbHV4Q2ggPSBwb3N0YWwuY2hhbm5lbCggXCJsdXhcIiApO1xuICB2YXIgc3RvcmVzID0ge307XG5cbiAgLy8ganNoaW50IGlnbm9yZTpzdGFydFxuICBmdW5jdGlvbiogZW50cmllcyhvYmopIHtcbiAgICBmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgICAgeWllbGQgW2ssIG9ialtrXV07XG4gICAgfVxuICB9XG4gIC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cbiAgZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuICAgIHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgfVxuXG4gIFxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcbiAgICB2YXIgYWN0aW9uTGlzdCA9IFtdO1xuICAgIGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgICAgIGFjdGlvbkxpc3QucHVzaCh7XG4gICAgICAgICAgICBhY3Rpb25UeXBlOiBrZXksXG4gICAgICAgICAgICB3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG52YXIgYWN0aW9uQ3JlYXRvcnMgPSB7fTtcblxuZnVuY3Rpb24gZ2V0QWN0aW9uQ3JlYXRvckZvciggc3RvcmUgKSB7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3JzW3N0b3JlXTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShhY3Rpb25MaXN0KSB7XG4gICAgdmFyIGFjdGlvbkNyZWF0b3IgPSB7fTtcbiAgICBhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIGFjdGlvbkNyZWF0b3JbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBsdXhDaC5wdWJsaXNoKHtcbiAgICAgICAgICAgICAgICB0b3BpYzogXCJhY3Rpb25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvblR5cGU6IGFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uQXJnczogYXJnc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBhY3Rpb25DcmVhdG9yO1xufVxuICBcblxuXG5jbGFzcyBNZW1vcnlTdG9yYWdlIHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0ZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgZmx1c2goKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuICAgICAgICB0aGlzLmNoYW5nZWRLZXlzID0ge307XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFuZ2VkS2V5cyxcbiAgICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuICAgIHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzID0gaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChbZGF0YS5kZXBzXSkpO1xuICAgICAgICBpZiAocmVzIGluc3RhbmNlb2YgUHJvbWlzZSB8fCAocmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuICAgIHZhciB0YXJnZXQgPSB7fTtcbiAgICBpZiAoIShcImdldFN0YXRlXCIgaW4gaGFuZGxlcnMpKSB7XG4gICAgICAgIGhhbmRsZXJzLmdldFN0YXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgICAgIHRyYW5zZm9ybUhhbmRsZXIoXG4gICAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG5jbGFzcyBTdG9yZSB7XG4gICAgY29uc3RydWN0b3IobmFtZXNwYWNlLCBoYW5kbGVycywgc3RvcmFnZVN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlU3RyYXRlZ3k7XG4gICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBoYW5kbGVycyk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICBkaXNwYXRjaDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkKSksXG4gICAgICAgICAgICBub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKVxuICAgICAgICB9O1xuICAgICAgICBsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuICAgICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgICAgYWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5nZXRTdGF0ZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2Uuc2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5yZXBsYWNlU3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgZmx1c2goKSB7XG4gICAgICAgIGx1eENoLnB1Ymxpc2goYG5vdGlmaWNhdGlvbi4ke3RoaXMubmFtZXNwYWNlfWAsIHRoaXMuc3RvcmFnZS5mbHVzaCgpKTtcbiAgICB9XG5cbiAgICBoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG4gICAgICAgICAgICAgICAgLmNhbGwodGhpcywgZGF0YSlcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgeyByZXN1bHQsIG5hbWVzcGFjZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGVycikgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoeyBuYW1lc3BhY2UsIGhhbmRsZXJzID0ge30sIHN0b3JhZ2VTdHJhdGVneSA9IG5ldyBNZW1vcnlTdG9yYWdlKCkgfSkge1xuICAgIGlmIChuYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICB9XG5cbiAgICB2YXIgc3RvcmUgPSBuZXcgU3RvcmUobmFtZXNwYWNlLCBoYW5kbGVycywgc3RvcmFnZVN0cmF0ZWd5KTtcbiAgICBhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuICAgIHJldHVybiBzdG9yZTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcbiAgICBzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG4gICAgZGVsZXRlIHN0b3Jlc1tuYW1lc3BhY2VdO1xufVxuICBcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG4gICAgICAgIGFjY3VtW2tleV0gPSAob2JqW2tleV0gJiYgb2JqW2tleV0ucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIGFjY3VtO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHBhcmFsbGVsKFxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuICAgICAgICAgICAgICAgICAgICB9LCBhY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbHV4Q2gucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0ucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuICAgIH1cbiAgICAvKlxuICAgIFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcbiAgICBcdHtcbiAgICBcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuICAgIFx0XHRhY3Rpb24gOiB7XG4gICAgXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcbiAgICBcdFx0XHRhY3Rpb25BcmdzOiBbXVxuICAgIFx0XHR9XG4gICAgXHR9XG4gICAgKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIGdlbmVyYXRpb25JbmRleDogMCxcbiAgICAgICAgICAgIHN0b3Jlczoge31cbiAgICAgICAgfSwgY29uZmlnKTtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHVuaW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXIoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZWxpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiWkUgUkVTVUxUU1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnIgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfb25FeGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwiZGlzcGF0Y2hDeWNsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJmYWlsdXJlLmFjdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnI6IHRoaXMuZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdWNjZXNzKGZuKSB7XG4gICAgICAgIHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZhaWx1cmUoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcImVycm9yXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuICBcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbikge1xuICAgIGdlbiA9IGdlbiB8fCAwO1xuICAgIHZhciBjYWxjZEdlbiA9IGdlbjtcbiAgICBpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuICAgICAgICBzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcbiAgICAgICAgICAgIHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuICAgICAgICAgICAgaWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuICAgICAgICAgICAgICAgIGNhbGNkR2VuID0gdGhpc0dlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcbiAgICB2YXIgdHJlZSA9IFtdO1xuICAgIHZhciBsb29rdXAgPSB7fTtcbiAgICBzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcbiAgICBmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuICAgICAgICAgICAgYWN0aW9uTWFwOiB7fSxcbiAgICAgICAgICAgIGNvb3JkaW5hdG9yczogW10sXG4gICAgICAgICAgICBzdGF0ZXM6IHtcbiAgICAgICAgICAgICAgICByZWFkeToge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbk1ldGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk1ldGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByZXBhcmluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCIqXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZhaWx1cmUoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0b3BwZWQ6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJhY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSwgZW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3RlclwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG4gICAgfVxuXG4gICAgaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgXG5cbnZhciBsdXhTdG9yZSA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0b3JlcyA9IHRoaXMuc3RvcmVzIHx8IFtdO1xuICAgICAgICB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgPSB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgfHwge307XG4gICAgICAgIHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShkYXRhLnN0YXRlIHx8IGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdO1xuICAgICAgICB0aGlzLnN0b3Jlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0KSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBzdC5zdG9yZSB8fCBzdDtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gc3QuaGFuZGxlciB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXCJub3RpZmljYXRpb24uXCIgKyBzdG9yZSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSkud2l0aENvbnRleHQodGhpcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICAgICBzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIGx1eEFjdGlvbiA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG4gICAgICAgIHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uc1tzdG9yZV0gPSBnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG4gICAgdmFyIG9wdCA9IHtcbiAgICAgICAgbWl4aW5zOiBbbHV4U3RvcmUsIGx1eEFjdGlvbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eEFjdGlvbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG4gIC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gIHJldHVybiB7XG4gICAgY2hhbm5lbDogbHV4Q2gsXG4gICAgc3RvcmVzLFxuICAgIGNyZWF0ZVN0b3JlLFxuICAgIGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudCxcbiAgICByZW1vdmVTdG9yZSxcbiAgICBkaXNwYXRjaGVyLFxuICAgIEFjdGlvbkNvb3JkaW5hdG9yLFxuICAgIGdldEFjdGlvbkNyZWF0b3JGb3JcbiAgfTtcbiAgLy8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTsiLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiLCIoJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMS4kX19wbGFjZWhvbGRlcl9fMikgPT09IHZvaWQgMCA/XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18zIDogJF9fcGxhY2Vob2xkZXJfXzQiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9