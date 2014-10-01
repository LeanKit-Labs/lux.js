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
      return when.join(when(res).catch(function(err) {
        return err;
      }), store.getState()).then(function(values) {
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
      }))
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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QWtCO0FBQUEsRUFDcEIsQ0FBQztBQUdILENBQUMsQ0FBQyxDQUFDO0FBQUEiLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZShcInRyYWNldXJcIiksIFxuICAgICAgICByZXF1aXJlKFwicmVhY3RcIiksIFxuICAgICAgICBwb3N0YWwsIFxuICAgICAgICBtYWNoaW5hLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW5cIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcbiAgXG4gIHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG4gIHZhciBzdG9yZXMgPSB7fTtcblxuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cbiAgLy8ganNoaW50IGlnbm9yZTplbmRcblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgXG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICAgIHZhciBhY3Rpb25MaXN0ID0gW107XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgYWN0aW9uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IGtleSxcbiAgICAgICAgICAgIHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICAgIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIHRvcGljOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG4gIFxuXG5cbmNsYXNzIEluTWVtb3J5VHJhbnNwb3J0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0ZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgZmx1c2goKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuICAgICAgICB0aGlzLmNoYW5nZWRLZXlzID0ge307XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFuZ2VkS2V5cyxcbiAgICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuICAgIHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcmVzID0gaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChbZGF0YS5kZXBzXSkpO1xuICAgICAgICByZXR1cm4gd2hlbi5qb2luKFxuICAgICAgICAgICAgd2hlbihyZXMpLmNhdGNoKGZ1bmN0aW9uKGVycikgeyByZXR1cm4gZXJyOyB9KSxcbiAgICAgICAgICAgIHN0b3JlLmdldFN0YXRlKClcbiAgICAgICAgKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgICAgICByZXR1cm4gd2hlbih7XG4gICAgICAgICAgICAgICAgcmVzdWx0OiB2YWx1ZXNbMF0sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHZhbHVlc1sxXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuICAgIHZhciB0YXJnZXQgPSB7fTtcbiAgICBpZiAoIShcImdldFN0YXRlXCIgaW4gaGFuZGxlcnMpKSB7XG4gICAgICAgIGhhbmRsZXJzLmdldFN0YXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgICAgIHRyYW5zZm9ybUhhbmRsZXIoXG4gICAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG5jbGFzcyBTdG9yZSB7XG4gICAgY29uc3RydWN0b3IobmFtZXNwYWNlLCBoYW5kbGVycywgdHJhbnNwb3J0U3RyYXRlZ3kpIHtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0ID0gdHJhbnNwb3J0U3RyYXRlZ3k7XG4gICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBoYW5kbGVycyk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICBkaXNwYXRjaDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkKSksXG4gICAgICAgICAgICBub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiB0aGlzLmluRGlzcGF0Y2gpXG4gICAgICAgIH07XG4gICAgICAgIGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG4gICAgICAgICAgICBuYW1lc3BhY2UsXG4gICAgICAgICAgICBhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGxhY2VTdGF0ZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgdGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG4gICAgICAgIGx1eENoLnB1Ymxpc2goYG5vdGlmaWNhdGlvbi4ke3RoaXMubmFtZXNwYWNlfWAsIHRoaXMudHJhbnNwb3J0LmZsdXNoKCkpO1xuICAgIH1cblxuICAgIGhhbmRsZVBheWxvYWQoZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuICAgICAgICBpZiAodGhpcy5hY3Rpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmluRGlzcGF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG4gICAgICAgICAgICAgICAgLmNhbGwodGhpcywgZGF0YSlcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgeyByZXN1bHQsIG5hbWVzcGFjZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGVycikgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoeyBuYW1lc3BhY2UsIGhhbmRsZXJzID0ge30sIHRyYW5zcG9ydFN0cmF0ZWd5ID0gbmV3IEluTWVtb3J5VHJhbnNwb3J0KCkgfSkge1xuICAgIGlmIChuYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICB9XG5cbiAgICB2YXIgc3RvcmUgPSBuZXcgU3RvcmUobmFtZXNwYWNlLCBoYW5kbGVycywgdHJhbnNwb3J0U3RyYXRlZ3kpO1xuICAgIGFjdGlvbkNyZWF0b3JzW25hbWVzcGFjZV0gPSBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG4gICAgcmV0dXJuIHN0b3JlO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuICAgIHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbiAgICBkZWxldGUgc3RvcmVzW25hbWVzcGFjZV07XG59XG4gIFxuXG5mdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcbiAgICB2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcbiAgICAgICAgYWNjdW1ba2V5XSA9IChvYmpba2V5XSAmJiBvYmpba2V5XS5yZXN1bHQpO1xuICAgICAgICByZXR1cm4gYWNjdW07XG4gICAgfSwge30pO1xuICAgIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuICAgICAgICByZXR1cm4gKCkgPT4gcGFyYWxsZWwoXG4gICAgICAgICAgICBnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG4gICAgICAgICAgICAgICAgICAgIH0sIGFjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gPSB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXS5yZXN1bHQgPSByZXNwb25zZS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbigoKSA9PiB0aGlzLnN0b3Jlcyk7XG4gICAgfVxuICAgIC8qXG4gICAgXHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuICAgIFx0e1xuICAgIFx0XHRnZW5lcmF0aW9uczogW10sXG4gICAgXHRcdGFjdGlvbiA6IHtcbiAgICBcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuICAgIFx0XHRcdGFjdGlvbkFyZ3M6IFtdXG4gICAgXHRcdH1cbiAgICBcdH1cbiAgICAqL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgZ2VuZXJhdGlvbkluZGV4OiAwLFxuICAgICAgICAgICAgc3RvcmVzOiB7fVxuICAgICAgICB9LCBjb25maWcpO1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuICAgICAgICAgICAgc3RhdGVzOiB7XG4gICAgICAgICAgICAgICAgdW5pbml0aWFsaXplZDoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogXCJkaXNwYXRjaGluZ1wiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaXBlbGluZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKC4uLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVyciA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJkaXNwYXRjaEN5Y2xlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2Vzczoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyOiB0aGlzLmVyclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3VjY2Vzcyhmbikge1xuICAgICAgICB0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG4gICAgICAgIGlmICghdGhpcy5fc3RhcnRlZCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmYWlsdXJlKGZuKSB7XG4gICAgICAgIHRoaXMub24oXCJlcnJvclwiLCBmbik7XG4gICAgICAgIGlmICghdGhpcy5fc3RhcnRlZCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiAgXG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4pIHtcbiAgICBnZW4gPSBnZW4gfHwgMDtcbiAgICB2YXIgY2FsY2RHZW4gPSBnZW47XG4gICAgaWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcbiAgICAgICAgc3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuICAgICAgICAgICAgdmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG4gICAgICAgICAgICB2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcbiAgICAgICAgICAgIGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcbiAgICAgICAgICAgICAgICBjYWxjZEdlbiA9IHRoaXNHZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKSB7XG4gICAgdmFyIHRyZWUgPSBbXTtcbiAgICB2YXIgbG9va3VwID0ge307XG4gICAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcbiAgICBzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG4gICAgZm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG4gICAgICAgIHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG4gICAgICAgIHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcbiAgICAgICAgICAgIGFjdGlvbk1hcDoge30sXG4gICAgICAgICAgICBjb29yZGluYXRvcnM6IFtdLFxuICAgICAgICAgICAgc3RhdGVzOiB7XG4gICAgICAgICAgICAgICAgcmVhZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sdXhBY3Rpb24gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sdXhBY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb25NZXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb25NZXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmVwYXJpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW3RoaXMubHV4QWN0aW9uLmFjdGlvbi5hY3Rpb25UeXBlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zID0gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCA/IFwiZGlzcGF0Y2hpbmdcIiA6IFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiKlwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCIqXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdG9wcGVkOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG4gICAgICAgICAgICBjb25maWdTdWJzY3JpcHRpb24oXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIGVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBjb25maWdTdWJzY3JpcHRpb24oXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgIFwicmVnaXN0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSwgZW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuICAgIH1cblxuICAgIGhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgZGF0YSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gIFxuXG52YXIgbHV4U3RvcmUgPSB7XG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdG9yZXMgPSB0aGlzLnN0b3JlcyB8fCBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzID0gdGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzIHx8IHt9O1xuICAgICAgICB2YXIgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoZGF0YS5zdGF0ZSB8fCBkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgdGhpcy5zdG9yZXMuZm9yRWFjaChmdW5jdGlvbihzdCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gc3Quc3RvcmUgfHwgc3Q7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHN0LmhhbmRsZXIgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcbiAgICAgICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFwibm90aWZpY2F0aW9uLlwiICsgc3RvcmUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pLndpdGhDb250ZXh0KHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnZhciBsdXhBY3Rpb24gPSB7XG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG4gICAgICAgIHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbnNbc3RvcmVdID0gZ2V0QWN0aW9uQ3JlYXRvckZvcihzdG9yZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eFN0b3JlLCBsdXhBY3Rpb25dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcbiAgICB9O1xuICAgIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0ID0ge1xuICAgICAgICBtaXhpbnM6IFtsdXhBY3Rpb25dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcbiAgICB9O1xuICAgIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuICAvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6IGx1eENoLFxuICAgIHN0b3JlcyxcbiAgICBjcmVhdGVTdG9yZSxcbiAgICBjcmVhdGVDb250cm9sbGVyVmlldyxcbiAgICBjcmVhdGVDb21wb25lbnQsXG4gICAgcmVtb3ZlU3RvcmUsXG4gICAgZGlzcGF0Y2hlcixcbiAgICBBY3Rpb25Db29yZGluYXRvcixcbiAgICBnZXRBY3Rpb25DcmVhdG9yRm9yXG4gIH07XG4gIC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7IiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==