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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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QUFFLEVBQUksRUFDTixNQUFLLENBQUcsQ0FBQSxDQUFDLFFBQU8sQ0FBRyxVQUFRLENBQUMsT0FBTyxBQUFDLENBQUMsT0FBTSxPQUFPLEdBQUssR0FBQyxDQUFDLENBQzdELENBQUM7QUFDRCxTQUFPLFFBQU0sT0FBTyxDQUFDO0FBQ3JCLFNBQU8sQ0FBQSxLQUFJLFlBQVksQUFBQyxDQUFDLE1BQUssT0FBTyxBQUFDLENBQUMsR0FBRSxDQUFHLFFBQU0sQ0FBQyxDQUFDLENBQUM7RUFDekQ7QUFBQSxBQUVBLFNBQVMsZ0JBQWMsQ0FBRSxPQUFNLENBQUc7QUFDOUIsQUFBSSxNQUFBLENBQUEsR0FBRSxFQUFJLEVBQ04sTUFBSyxDQUFHLENBQUEsQ0FBQyxTQUFRLENBQUMsT0FBTyxBQUFDLENBQUMsT0FBTSxPQUFPLEdBQUssR0FBQyxDQUFDLENBQ25ELENBQUM7QUFDRCxTQUFPLFFBQU0sT0FBTyxDQUFDO0FBQ3JCLFNBQU8sQ0FBQSxLQUFJLFlBQVksQUFBQyxDQUFDLE1BQUssT0FBTyxBQUFDLENBQUMsR0FBRSxDQUFHLFFBQU0sQ0FBQyxDQUFDLENBQUM7RUFDekQ7QUFBQSxBQUdFLE9BQU87QUFDTCxVQUFNLENBQUcsTUFBSTtBQUNiLFNBQUssQ0FBTCxPQUFLO0FBQ0wsY0FBVSxDQUFWLFlBQVU7QUFDVix1QkFBbUIsQ0FBbkIscUJBQW1CO0FBQ25CLGtCQUFjLENBQWQsZ0JBQWM7QUFDZCxjQUFVLENBQVYsWUFBVTtBQUNWLGFBQVMsQ0FBVCxXQUFTO0FBQ1Qsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDcEIsQ0FBQztBQUdILENBQUMsQ0FBQyxDQUFDO0FBQUEiLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZShcInRyYWNldXJcIiksIFxuICAgICAgICByZXF1aXJlKFwicmVhY3RcIiksIFxuICAgICAgICBwb3N0YWwsIFxuICAgICAgICBtYWNoaW5hLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW5cIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcbiAgXG4gIHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG4gIHZhciBzdG9yZXMgPSB7fTtcblxuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cbiAgLy8ganNoaW50IGlnbm9yZTplbmRcblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgXG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICAgIHZhciBhY3Rpb25MaXN0ID0gW107XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgYWN0aW9uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IGtleSxcbiAgICAgICAgICAgIHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICAgIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIHRvcGljOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG4gIFxuXG5cbmNsYXNzIE1lbW9yeVN0b3JhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkS2V5cyA9IFtdO1xuICAgIH1cblxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKTtcbiAgICB9XG5cbiAgICByZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgdmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoYW5nZWRLZXlzLFxuICAgICAgICAgICAgc3RhdGU6IHRoaXMuc3RhdGVcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXMgPSBoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KFtkYXRhLmRlcHNdKSk7XG4gICAgICAgIGlmIChyZXMgaW5zdGFuY2VvZiBQcm9taXNlIHx8IChyZXMgJiYgdHlwZW9mIHJlcy50aGVuID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9O1xuICAgIGlmICghKFwiZ2V0U3RhdGVcIiBpbiBoYW5kbGVycykpIHtcbiAgICAgICAgaGFuZGxlcnMuZ2V0U3RhdGUgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgdHJhbnNmb3JtSGFuZGxlcihcbiAgICAgICAgICAgIHN0b3JlLFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lc3BhY2UsIGhhbmRsZXJzLCBzdG9yYWdlU3RyYXRlZ3kpIHtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2VTdHJhdGVneTtcbiAgICAgICAgdGhpcy5hY3Rpb25IYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKHRoaXMsIGhhbmRsZXJzKTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBkaXNwYXRjaC4ke25hbWVzcGFjZX1gLCB0aGlzLmhhbmRsZVBheWxvYWQpKSxcbiAgICAgICAgICAgIG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpXG4gICAgICAgIH07XG4gICAgICAgIGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG4gICAgICAgICAgICBuYW1lc3BhY2UsXG4gICAgICAgICAgICBhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlLmdldFN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHNldFN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5zZXRTdGF0ZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICByZXBsYWNlU3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlLnJlcGxhY2VTdGF0ZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgbHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgdGhpcy5zdG9yYWdlLmZsdXNoKCkpO1xuICAgIH1cblxuICAgIGhhbmRsZVBheWxvYWQoZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuICAgICAgICBpZiAodGhpcy5hY3Rpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLCBkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCB7IHJlc3VsdCwgbmFtZXNwYWNlIH0pLFxuICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSh7IG5hbWVzcGFjZSwgaGFuZGxlcnMgPSB7fSwgc3RvcmFnZVN0cmF0ZWd5ID0gbmV3IE1lbW9yeVN0b3JhZ2UoKSB9KSB7XG4gICAgaWYgKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuICAgIH1cblxuICAgIHZhciBzdG9yZSA9IG5ldyBTdG9yZShuYW1lc3BhY2UsIGhhbmRsZXJzLCBzdG9yYWdlU3RyYXRlZ3kpO1xuICAgIGFjdGlvbkNyZWF0b3JzW25hbWVzcGFjZV0gPSBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG4gICAgcmV0dXJuIHN0b3JlO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuICAgIHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbiAgICBkZWxldGUgc3RvcmVzW25hbWVzcGFjZV07XG59XG4gIFxuXG5mdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcbiAgICB2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcbiAgICAgICAgYWNjdW1ba2V5XSA9IChvYmpba2V5XSAmJiBvYmpba2V5XS5yZXN1bHQpO1xuICAgICAgICByZXR1cm4gYWNjdW07XG4gICAgfSwge30pO1xuICAgIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuICAgICAgICByZXR1cm4gKCkgPT4gcGFyYWxsZWwoXG4gICAgICAgICAgICBnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG4gICAgICAgICAgICAgICAgICAgIH0sIGFjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gPSB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXS5yZXN1bHQgPSByZXNwb25zZS5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbigoKSA9PiB0aGlzLnN0b3Jlcyk7XG4gICAgfVxuICAgIC8qXG4gICAgXHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuICAgIFx0e1xuICAgIFx0XHRnZW5lcmF0aW9uczogW10sXG4gICAgXHRcdGFjdGlvbiA6IHtcbiAgICBcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuICAgIFx0XHRcdGFjdGlvbkFyZ3M6IFtdXG4gICAgXHRcdH1cbiAgICBcdH1cbiAgICAqL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgZ2VuZXJhdGlvbkluZGV4OiAwLFxuICAgICAgICAgICAgc3RvcmVzOiB7fVxuICAgICAgICB9LCBjb25maWcpO1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuICAgICAgICAgICAgc3RhdGVzOiB7XG4gICAgICAgICAgICAgICAgdW5pbml0aWFsaXplZDoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogXCJkaXNwYXRjaGluZ1wiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaXBlbGluZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKC4uLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJaRSBSRVNVTFRTXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVyciA9IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJkaXNwYXRjaEN5Y2xlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2Vzczoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycjogdGhpcy5lcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1Y2Nlc3MoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZmFpbHVyZShmbikge1xuICAgICAgICB0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4gIFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG4gICAgZ2VuID0gZ2VuIHx8IDA7XG4gICAgdmFyIGNhbGNkR2VuID0gZ2VuO1xuICAgIGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG4gICAgICAgIHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuICAgICAgICAgICAgdmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG4gICAgICAgICAgICBpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG4gICAgICAgICAgICAgICAgY2FsY2RHZW4gPSB0aGlzR2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuICAgIHZhciB0cmVlID0gW107XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG4gICAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuICAgIGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG4gICAgICAgICAgICBhY3Rpb25NYXA6IHt9LFxuICAgICAgICAgICAgY29vcmRpbmF0b3JzOiBbXSxcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHJlYWR5OiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge307XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uTWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uTWV0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJlcGFyaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcygoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiKlwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RvcHBlZDoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcInJlZ2lzdGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIGVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICBcblxudmFyIGx1eFN0b3JlID0ge1xuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RvcmVzID0gdGhpcy5zdG9yZXMgfHwgW107XG4gICAgICAgIHRoaXMuc3RhdGVDaGFuZ2VIYW5kbGVycyA9IHRoaXMuc3RhdGVDaGFuZ2VIYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKGRhdGEuc3RhdGUgfHwgZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG4gICAgICAgIHRoaXMuc3RvcmVzLmZvckVhY2goZnVuY3Rpb24oc3QpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IHN0LnN0b3JlIHx8IHN0O1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBzdC5oYW5kbGVyIHx8IGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXI7XG4gICAgICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcIm5vdGlmaWNhdGlvbi5cIiArIHN0b3JlLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9KS53aXRoQ29udGV4dCh0aGlzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgICAgIHN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG52YXIgbHV4QWN0aW9uID0ge1xuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuICAgICAgICB0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaChmdW5jdGlvbihzdG9yZSkge1xuICAgICAgICAgICAgdGhpcy5hY3Rpb25zW3N0b3JlXSA9IGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0ID0ge1xuICAgICAgICBtaXhpbnM6IFtsdXhTdG9yZSwgbHV4QWN0aW9uXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG4gICAgfTtcbiAgICBkZWxldGUgb3B0aW9ucy5taXhpbnM7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG4gICAgdmFyIG9wdCA9IHtcbiAgICAgICAgbWl4aW5zOiBbbHV4QWN0aW9uXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG4gICAgfTtcbiAgICBkZWxldGUgb3B0aW9ucy5taXhpbnM7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbiAgLy8ganNoaW50IGlnbm9yZTogc3RhcnRcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiBsdXhDaCxcbiAgICBzdG9yZXMsXG4gICAgY3JlYXRlU3RvcmUsXG4gICAgY3JlYXRlQ29udHJvbGxlclZpZXcsXG4gICAgY3JlYXRlQ29tcG9uZW50LFxuICAgIHJlbW92ZVN0b3JlLFxuICAgIGRpc3BhdGNoZXIsXG4gICAgQWN0aW9uQ29vcmRpbmF0b3IsXG4gICAgZ2V0QWN0aW9uQ3JlYXRvckZvclxuICB9O1xuICAvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpOyIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=