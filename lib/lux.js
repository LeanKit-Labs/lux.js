(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["traceur", "react", "postal.request-response", "machina"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = function(postal, machina) {
      return factory(require("traceur"), require("react"), postal, machina, this);
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}(this, function(traceur, React, postal, machina, global, undefined) {
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
  function transformHandler(store, target, key, handler) {
    target[key] = function(data) {
      var res = handler.apply(store, data.actionArgs);
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
            $__10 = 0; $__10 < arguments.length; $__10++)
          args[$__10] = arguments[$__10];
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
  function processGeneration(generation, action) {
    var $__0 = this;
    return Promise.all((function() {
      var $__2 = 0,
          $__3 = [];
      for (var $__5 = generation[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var store = $__6.value;
        $__3[$__2++] = luxCh.request({
          topic: ("dispatch." + store.namespace),
          data: action
        });
      }
      return $__3;
    }())).then((function(responses) {
      for (var $__5 = responses[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var response = $__6.value;
        {
          $__0.stores[response.namespace] = $__0.stores[response.namespace] || {};
          $__0.stores[response.namespace].result = response.result;
        }
      }
    }));
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
            Promise.all((function() {
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
    calcdGen = gen;
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
              var action = $__6.value;
              {
                var action;
                var actionName = action.actionType;
                var actionMeta = {
                  namespace: storeMeta.namespace,
                  waitFor: action.waitFor
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
        this.actions[store] = lux.getActionCreatorFor(store);
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
    Dispatcher: Dispatcher,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: function(store) {
      return actionCreators[store];
    }
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE1IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE2IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE0IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE3IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEFBQUUsU0FBVSxJQUFHLENBQUcsQ0FBQSxPQUFNLENBQUk7QUFDMUIsS0FBSyxNQUFPLE9BQUssQ0FBQSxHQUFNLFdB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QUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULG9CQUFnQixDQUFoQixrQkFBZ0I7QUFDaEIsc0JBQWtCLENBQWxCLFVBQXFCLEtBQUksQ0FBSTtBQUMzQixXQUFPLENBQUEsY0FBYSxDQUFFLEtBQUksQ0FBQyxDQUFDO0lBQzlCO0FBQUEsRUFDRixDQUFDO0FBRUgsQ0FBQyxDQUFDLENBQUM7QUFBQSIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggcmVxdWlyZShcInRyYWNldXJcIiksIHJlcXVpcmUoXCJyZWFjdFwiKSwgcG9zdGFsLCBtYWNoaW5hLCB0aGlzICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIGdsb2JhbCwgdW5kZWZpbmVkICkge1xuICBcbiAgdmFyIGx1eENoID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4XCIgKTtcbiAgdmFyIHN0b3JlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcbiAgdmFyIGFjdGlvbkxpc3QgPSBbXTtcbiAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICBhY3Rpb25MaXN0LnB1c2goe1xuICAgICAgYWN0aW9uVHlwZToga2V5LFxuICAgICAgd2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdIFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKCBhY3Rpb25MaXN0ICkge1xuICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICBhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKXtcbiAgICBhY3Rpb25DcmVhdG9yWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcbiAgICAgIGx1eENoLnB1Ymxpc2goIHtcbiAgICAgICAgdG9waWM6IFwiYWN0aW9uXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb24sXG4gICAgICAgICAgYWN0aW9uQXJnczogYXJnc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn0gXG4gIGNsYXNzIE1lbW9yeVN0b3JhZ2Uge1xuICBjb25zdHJ1Y3RvcihzdGF0ZSkge1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICB0aGlzLmNoYW5nZWRLZXlzID0gW107XG4gIH1cblxuICBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnN0YXRlKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG4gICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG4gIH1cblxuICBmbHVzaCgpIHtcbiAgICB2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcbiAgICB0aGlzLmNoYW5nZWRLZXlzID0ge307XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYW5nZWRLZXlzLFxuICAgICAgc3RhdGUgOiB0aGlzLnN0YXRlXG4gICAgfTtcbiAgfVxufVxuXG5jbGFzcyBTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKCBuYW1lc3BhY2UsIGhhbmRsZXJzLCBzdG9yYWdlU3RyYXRlZ3kgKSB7XG5cdFx0dGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZVN0cmF0ZWd5O1xuICAgIHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBoYW5kbGVycyk7XG4gICAgdGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcbiAgICAgIGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKCBgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkICkpLFxuICAgICAgbm90aWZ5ICA6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoIGBub3RpZnlgLCB0aGlzLmZsdXNoICkpXG4gICAgfTtcbiAgICBsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuICAgICAgbmFtZXNwYWNlLFxuICAgICAgYWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBmb3IodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldFN0YXRlKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldFN0YXRlKC4uLmFyZ3MpO1xuICB9XG5cbiAgc2V0U3RhdGUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2Uuc2V0U3RhdGUoLi4uYXJncyk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UucmVwbGFjZVN0YXRlKC4uLmFyZ3MpO1xuICB9XG5cbiAgZmx1c2goKSB7XG4gICAgbHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgdGhpcy5zdG9yYWdlLmZsdXNoKCkpO1xuICB9XG5cbiAgaGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuICAgIHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICBpZih0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcbiAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXVxuICAgICAgICAuY2FsbCggdGhpcywgZGF0YSApXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgIChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHsgcmVzdWx0LCBuYW1lc3BhY2UgfSksXG4gICAgICAgICAgKGVycikgICAgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuICAgICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuICB0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcmVzID0gaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzKTtcbiAgICBpZihyZXMgaW5zdGFuY2VvZiBQcm9taXNlIHx8ICggcmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcbiAgdmFyIHRhcmdldCA9IHt9O1xuICBpZighKFwiZ2V0U3RhdGVcIiBpbiBoYW5kbGVycykpIHtcbiAgICBoYW5kbGVycy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgIHRyYW5zZm9ybUhhbmRsZXIoXG4gICAgICBzdG9yZSxcbiAgICAgIHRhcmdldCxcbiAgICAgIGtleSxcbiAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoeyBuYW1lc3BhY2UsIGhhbmRsZXJzPXt9LCBzdG9yYWdlU3RyYXRlZ3k9bmV3IE1lbW9yeVN0b3JhZ2UoKSB9KSB7XG4gIGlmKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG4gIH1cbiAgXG4gIHZhciBzdG9yZSA9IG5ldyBTdG9yZShuYW1lc3BhY2UsIGhhbmRsZXJzLCBzdG9yYWdlU3RyYXRlZ3kpO1xuICBhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuICByZXR1cm4gc3RvcmU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuICBzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG4gIGRlbGV0ZSBzdG9yZXNbbmFtZXNwYWNlXTtcbn1cbiAgZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgW1xuICAgICAgZm9yICggc3RvcmUgb2YgZ2VuZXJhdGlvbiApIGx1eENoLnJlcXVlc3QoIHtcbiAgICAgICAgdG9waWM6IGBkaXNwYXRjaC4ke3N0b3JlLm5hbWVzcGFjZX1gLFxuICAgICAgICBkYXRhOiBhY3Rpb25cbiAgICAgIH0gKSBdICkudGhlbihcbiAgICAoIHJlc3BvbnNlcyApID0+IHtcbiAgICAgIGZvciAoIHZhciByZXNwb25zZSBvZiByZXNwb25zZXMgKSB7XG4gICAgICAgIHRoaXMuc3RvcmVzWyByZXNwb25zZS5uYW1lc3BhY2UgXSA9IHRoaXMuc3RvcmVzWyByZXNwb25zZS5uYW1lc3BhY2UgXSB8fCB7fTtcbiAgICAgICAgdGhpcy5zdG9yZXNbIHJlc3BvbnNlLm5hbWVzcGFjZSBdLnJlc3VsdCA9IHJlc3BvbnNlLnJlc3VsdDtcbiAgICAgIH1cbiAgICB9ICk7XG59XG4vKlxuXHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuXHR7XG5cdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdGFjdGlvbiA6IHtcblx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdH1cblx0fVxuKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICBjb25zdHJ1Y3RvciggY29uZmlnICkge1xuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIHtcbiAgICAgIGdlbmVyYXRpb25JbmRleDogMCxcbiAgICAgIHN0b3Jlczoge31cbiAgICB9LCBjb25maWcgKTtcbiAgICBzdXBlcigge1xuICAgICAgaW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcbiAgICAgIHN0YXRlczoge1xuICAgICAgICB1bmluaXRpYWxpemVkOiB7XG4gICAgICAgICAgc3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgIF9vbkVudGVyKCkge1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgXHRcdFx0WyBmb3IgKCBnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucyApIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwoIHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24gKSBdXG4gICAgICAgXHRcdCkudGhlbiggZnVuY3Rpb24oIC4uLnJlc3VsdHMgKSB7XG4gICAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbiggXCJzdWNjZXNzXCIgKTtcbiAgICAgICAgICAgIH0uYmluZCggdGhpcyApLCBmdW5jdGlvbiggZXJyICkge1xuICAgICAgICAgICAgICB0aGlzLmVyciA9IGVycjtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKCBcImZhaWx1cmVcIiApO1xuICAgICAgICAgICAgfS5iaW5kKCB0aGlzICkgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbHV4Q2gucHVibGlzaCggXCJkaXNwYXRjaEN5Y2xlXCIgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2Vzczoge1xuICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcbiAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCBcInN1Y2Nlc3NcIiApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZmFpbHVyZToge1xuICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goIFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgICBlcnI6IHRoaXMuZXJyXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoIFwiZmFpbHVyZVwiICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG4gIHN1Y2Nlc3MoIGZuICkge1xuICAgIHRoaXMub24oIFwic3VjY2Vzc1wiLCBmbiApO1xuICAgIGlmICggIXRoaXMuX3N0YXJ0ZWQgKSB7XG4gICAgICBzZXRUaW1lb3V0KCAoKSA9PiB0aGlzLmhhbmRsZSggXCJzdGFydFwiICksIDAgKTtcbiAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBmYWlsdXJlKCBmbiApIHtcbiAgICB0aGlzLm9uKCBcImVycm9yXCIsIGZuICk7XG4gICAgaWYgKCAhdGhpcy5fc3RhcnRlZCApIHtcbiAgICAgIHNldFRpbWVvdXQoICgpID0+IHRoaXMuaGFuZGxlKCBcInN0YXJ0XCIgKSwgMCApO1xuICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuICkge1xuICBnZW4gPSBnZW4gfHwgMDtcbiAgY2FsY2RHZW4gPSBnZW47XG4gIGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcbiAgICBzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG4gICAgICB2YXIgZGVwU3RvcmUgPSBsb29rdXBbIGRlcCBdO1xuICAgICAgdmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oIGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEgKTtcbiAgICAgIGlmICggdGhpc0dlbiA+IGNhbGNkR2VuICkge1xuICAgICAgICBjYWxjZEdlbiA9IHRoaXNHZW47XG4gICAgICB9XG4gICAgfSApO1xuICB9XG4gIHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzICkge1xuICB2YXIgdHJlZSA9IFtdO1xuICB2YXIgbG9va3VwID0ge307XG4gIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwWyBzdG9yZS5uYW1lc3BhY2UgXSA9IHN0b3JlKTtcbiAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAgKSk7XG4gIGZvcih2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG4gIFx0dHJlZVsgaXRlbS5nZW4gXSA9IHRyZWVbIGl0ZW0uZ2VuIF0gfHwgW107XG4gICAgdHJlZVsgaXRlbS5nZW4gXS5wdXNoKCBpdGVtICk7XG4gIH1cbiAgcmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7IGFjdGlvbiA6IGFjdGlvbk1ldGEgfTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIiA6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBhY3Rpb24gb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb24uYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7IG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSwgd2FpdEZvcjogYWN0aW9uLndhaXRGb3IgfTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImFjdGlvblwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKCBkYXRhLCBlbnYgKSB7IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7IH1cblx0XHRcdFx0KVxuXHRcdFx0KSxcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwicmVnaXN0ZXJcIixcblx0XHRcdFx0XHRmdW5jdGlvbiggZGF0YSwgZW52ICkgeyB0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpOyB9XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRdO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZSggXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSApO1xuXHR9XG5cblx0aGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZSggXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuICB2YXIgbHV4U3RvcmUgPSB7XG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdG9yZXMgPSB0aGlzLnN0b3JlcyB8fCBbXTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgPSB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgfHwge307XG4gICAgdmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gIFx0XHR0aGlzLnNldFN0YXRlKGRhdGEuc3RhdGUgfHwgZGF0YSk7XG4gIFx0fTtcbiAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdXG4gICAgdGhpcy5zdG9yZXMuZm9yRWFjaCggZnVuY3Rpb24oIHN0ICkge1xuICAgIFx0dmFyIHN0b3JlID0gc3Quc3RvcmUgfHwgc3Q7XG4gICAgXHR2YXIgaGFuZGxlciA9IHN0LmhhbmRsZXIgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcbiAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICBcdGx1eENoLnN1YnNjcmliZSggXCJub3RpZmljYXRpb24uXCIgKyBzdG9yZSwgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICBcdFx0aGFuZGxlci5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgICAgIH0pLndpdGhDb250ZXh0KCB0aGlzIClcbiAgICAgIFx0KVxuICAgIH0uYmluZCh0aGlzKSApO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gIFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpe1xuICBcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG4gIFx0fSk7XG4gIH1cbn07XG5cbnZhciBsdXhBY3Rpb24gPSB7XG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHt9O1xuICAgIHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcbiAgICB0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaCggZnVuY3Rpb24oIHN0b3JlICkge1xuICAgICAgdGhpcy5hY3Rpb25zWyBzdG9yZSBdID0gbHV4LmdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICk7XG4gICAgfS5iaW5kKHRoaXMpICk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHsgbWl4aW5zOiBbbHV4U3RvcmUsIGx1eEFjdGlvbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKSB9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0geyBtaXhpbnM6IFtsdXhBY3Rpb25dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSkgfTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6IGx1eENoLFxuICAgIHN0b3JlcyxcbiAgICBjcmVhdGVTdG9yZSxcbiAgICBjcmVhdGVDb250cm9sbGVyVmlldyxcbiAgICBjcmVhdGVDb21wb25lbnQsXG4gICAgcmVtb3ZlU3RvcmUsXG4gICAgRGlzcGF0Y2hlcixcbiAgICBBY3Rpb25Db29yZGluYXRvcixcbiAgICBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICAgIHJldHVybiBhY3Rpb25DcmVhdG9yc1tzdG9yZV07XG4gICAgfVxuICB9O1xuXG59KSk7IiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==