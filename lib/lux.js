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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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QUUsRUFBSSxFQUNOLE1BQUssQ0FBRyxDQUFBLENBQUMsUUFBTyxDQUFHLFVBQVEsQ0FBQyxPQUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDN0QsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN6RDtBQUFBLEFBRUEsU0FBUyxnQkFBYyxDQUFFLE9BQU0sQ0FBRztBQUM5QixBQUFJLE1BQUEsQ0FBQSxHQUFFLEVBQUksRUFDTixNQUFLLENBQUcsQ0FBQSxDQUFDLFNBQVEsQ0FBQyxPQUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDbkQsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN6RDtBQUFBLEFBR0UsT0FBTztBQUNMLFVBQU0sQ0FBRyxNQUFJO0FBQ2IsU0FBSyxDQUFMLE9BQUs7QUFDTCxjQUFVLENBQVYsWUFBVTtBQUNWLHVCQUFtQixDQUFuQixxQkFBbUI7QUFDbkIsa0JBQWMsQ0FBZCxnQkFBYztBQUNkLGNBQVUsQ0FBVixZQUFVO0FBQ1YsYUFBUyxDQUFULFdBQVM7QUFDVCxvQkFBZ0IsQ0FBaEIsa0JBQWdCO0FBQ2hCLHNCQUFrQixDQUFsQixvQkFBa0I7QUFBQSxFQUNwQixDQUFDO0FBR0gsQ0FBQyxDQUFDLENBQUM7QUFBQSIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG4gIGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiLCBcIndoZW5cIiwgXCJ3aGVuLnBpcGVsaW5lXCIsIFwid2hlbi5wYXJhbGxlbFwiIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KFxuICAgICAgICByZXF1aXJlKFwidHJhY2V1clwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJyZWFjdFwiKSwgXG4gICAgICAgIHBvc3RhbCwgXG4gICAgICAgIG1hY2hpbmEsIFxuICAgICAgICByZXF1aXJlKFwid2hlblwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW4vcGFyYWxsZWxcIikpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuICB9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgd2hlbiwgcGlwZWxpbmUsIHBhcmFsbGVsICkge1xuICBcbiAgdmFyIGx1eENoID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4XCIgKTtcbiAgdmFyIHN0b3JlcyA9IHt9O1xuXG4gIC8vIGpzaGludCBpZ25vcmU6c3RhcnRcbiAgZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG4gICAgZm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgIHlpZWxkIFtrLCBvYmpba11dO1xuICAgIH1cbiAgfVxuICAvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4gIGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gIH1cblxuICBcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG4gICAgdmFyIGFjdGlvbkxpc3QgPSBbXTtcbiAgICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgICAgICBhY3Rpb25MaXN0LnB1c2goe1xuICAgICAgICAgICAgYWN0aW9uVHlwZToga2V5LFxuICAgICAgICAgICAgd2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuICAgIHJldHVybiBhY3Rpb25DcmVhdG9yc1tzdG9yZV07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oYWN0aW9uTGlzdCkge1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0ge307XG4gICAgYWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuICAgICAgICAgICAgbHV4Q2gucHVibGlzaCh7XG4gICAgICAgICAgICAgICAgdG9waWM6IFwiYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkFyZ3M6IGFyZ3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn1cbiAgXG5cblxuY2xhc3MgTWVtb3J5U3RvcmFnZSB7XG4gICAgY29uc3RydWN0b3Ioc3RhdGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgICAgICB0aGlzLmNoYW5nZWRLZXlzID0gW107XG4gICAgfVxuXG4gICAgZ2V0U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5zdGF0ZSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpO1xuICAgIH1cblxuICAgIHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xuICAgIH1cblxuICAgIGZsdXNoKCkge1xuICAgICAgICB2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkS2V5cyA9IHt9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hhbmdlZEtleXMsXG4gICAgICAgICAgICBzdGF0ZTogdGhpcy5zdGF0ZVxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcbiAgICB0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHJlcyA9IGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKTtcbiAgICAgICAgaWYgKHJlcyBpbnN0YW5jZW9mIFByb21pc2UgfHwgKHJlcyAmJiB0eXBlb2YgcmVzLnRoZW4gPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge307XG4gICAgaWYgKCEoXCJnZXRTdGF0ZVwiIGluIGhhbmRsZXJzKSkge1xuICAgICAgICBoYW5kbGVycy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlKC4uLmFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgICAgICB0cmFuc2Zvcm1IYW5kbGVyKFxuICAgICAgICAgICAgc3RvcmUsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICB0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuY2xhc3MgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWVzcGFjZSwgaGFuZGxlcnMsIHN0b3JhZ2VTdHJhdGVneSkge1xuICAgICAgICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZVN0cmF0ZWd5O1xuICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgaGFuZGxlcnMpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuICAgICAgICAgICAgbm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSlcbiAgICAgICAgfTtcbiAgICAgICAgbHV4Q2gucHVibGlzaChcInJlZ2lzdGVyXCIsIHtcbiAgICAgICAgICAgIG5hbWVzcGFjZSxcbiAgICAgICAgICAgIGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgZm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTdGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlLnNldFN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHJlcGxhY2VTdGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2UucmVwbGFjZVN0YXRlKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIGZsdXNoKCkge1xuICAgICAgICBsdXhDaC5wdWJsaXNoKGBub3RpZmljYXRpb24uJHt0aGlzLm5hbWVzcGFjZX1gLCB0aGlzLnN0b3JhZ2UuZmx1c2goKSk7XG4gICAgfVxuXG4gICAgaGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXVxuICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMsIGRhdGEpXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHsgcmVzdWx0LCBuYW1lc3BhY2UgfSksXG4gICAgICAgICAgICAgICAgICAgIChlcnIpID0+IGVudmVsb3BlLnJlcGx5KGVycilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHsgbmFtZXNwYWNlLCBoYW5kbGVycyA9IHt9LCBzdG9yYWdlU3RyYXRlZ3kgPSBuZXcgTWVtb3J5U3RvcmFnZSgpIH0pIHtcbiAgICBpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgfVxuXG4gICAgdmFyIHN0b3JlID0gbmV3IFN0b3JlKG5hbWVzcGFjZSwgaGFuZGxlcnMsIHN0b3JhZ2VTdHJhdGVneSk7XG4gICAgYWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcbiAgICByZXR1cm4gc3RvcmU7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG4gICAgc3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xuICAgIGRlbGV0ZSBzdG9yZXNbbmFtZXNwYWNlXTtcbn1cbiAgXG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuICAgIHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuICAgICAgICBhY2N1bVtrZXldID0gKG9ialtrZXldICYmIG9ialtrZXldLnJlc3VsdCk7XG4gICAgICAgIHJldHVybiBhY2N1bTtcbiAgICB9LCB7fSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBwYXJhbGxlbChcbiAgICAgICAgICAgIGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcbiAgICAgICAgICAgICAgICAgICAgfSwgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGx1eENoLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9waWM6IGBkaXNwYXRjaC4ke3N0b3JlLm5hbWVzcGFjZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gfHwge307XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdLnJlc3VsdCA9IHJlc3BvbnNlLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcbiAgICB9XG4gICAgLypcbiAgICBcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG4gICAgXHR7XG4gICAgXHRcdGdlbmVyYXRpb25zOiBbXSxcbiAgICBcdFx0YWN0aW9uIDoge1xuICAgIFx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG4gICAgXHRcdFx0YWN0aW9uQXJnczogW11cbiAgICBcdFx0fVxuICAgIFx0fVxuICAgICovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICBnZW5lcmF0aW9uSW5kZXg6IDAsXG4gICAgICAgICAgICBzdG9yZXM6IHt9XG4gICAgICAgIH0sIGNvbmZpZyk7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG4gICAgICAgICAgICBzdGF0ZXM6IHtcbiAgICAgICAgICAgICAgICB1bmluaXRpYWxpemVkOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVsaW5lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oLi4ucmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyID0gZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX29uRXhpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImRpc3BhdGNoQ3ljbGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmFpbHVyZToge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJmYWlsdXJlLmFjdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnI6IHRoaXMuZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdWNjZXNzKGZuKSB7XG4gICAgICAgIHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGZhaWx1cmUoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcImVycm9yXCIsIGZuKTtcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuICBcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbikge1xuICAgIGdlbiA9IGdlbiB8fCAwO1xuICAgIHZhciBjYWxjZEdlbiA9IGdlbjtcbiAgICBpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuICAgICAgICBzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG4gICAgICAgICAgICB2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcbiAgICAgICAgICAgIHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuICAgICAgICAgICAgaWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuICAgICAgICAgICAgICAgIGNhbGNkR2VuID0gdGhpc0dlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcbiAgICB2YXIgdHJlZSA9IFtdO1xuICAgIHZhciBsb29rdXAgPSB7fTtcbiAgICBzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcbiAgICBmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcbiAgICAgICAgdHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuICAgICAgICAgICAgYWN0aW9uTWFwOiB7fSxcbiAgICAgICAgICAgIGNvb3JkaW5hdG9yczogW10sXG4gICAgICAgICAgICBzdGF0ZXM6IHtcbiAgICAgICAgICAgICAgICByZWFkeToge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGFjdGlvbk1ldGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk1ldGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByZXBhcmluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCIqXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwYXRjaGluZzoge1xuICAgICAgICAgICAgICAgICAgICBfb25FbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZhaWx1cmUoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0b3BwZWQ6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJhY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSwgZW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGNvbmZpZ1N1YnNjcmlwdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGx1eENoLnN1YnNjcmliZShcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3RlclwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG4gICAgfVxuXG4gICAgaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcbiAgICAgICAgdGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgXG5cbnZhciBsdXhTdG9yZSA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0b3JlcyA9IHRoaXMuc3RvcmVzIHx8IFtdO1xuICAgICAgICB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgPSB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgfHwge307XG4gICAgICAgIHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShkYXRhLnN0YXRlIHx8IGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdO1xuICAgICAgICB0aGlzLnN0b3Jlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0KSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBzdC5zdG9yZSB8fCBzdDtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gc3QuaGFuZGxlciB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuICAgICAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXCJub3RpZmljYXRpb24uXCIgKyBzdG9yZSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgfSkud2l0aENvbnRleHQodGhpcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICAgICBzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIGx1eEFjdGlvbiA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG4gICAgICAgIHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uc1tzdG9yZV0gPSBnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG4gICAgdmFyIG9wdCA9IHtcbiAgICAgICAgbWl4aW5zOiBbbHV4U3RvcmUsIGx1eEFjdGlvbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eEFjdGlvbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG4gIC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gIHJldHVybiB7XG4gICAgY2hhbm5lbDogbHV4Q2gsXG4gICAgc3RvcmVzLFxuICAgIGNyZWF0ZVN0b3JlLFxuICAgIGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudCxcbiAgICByZW1vdmVTdG9yZSxcbiAgICBkaXNwYXRjaGVyLFxuICAgIEFjdGlvbkNvb3JkaW5hdG9yLFxuICAgIGdldEFjdGlvbkNyZWF0b3JGb3JcbiAgfTtcbiAgLy8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTsiLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiLCIoJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMS4kX19wbGFjZWhvbGRlcl9fMikgPT09IHZvaWQgMCA/XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18zIDogJF9fcGxhY2Vob2xkZXJfXzQiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9