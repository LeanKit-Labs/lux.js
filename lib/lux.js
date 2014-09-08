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
    dispatcher: dispatcher,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: function(store) {
      return actionCreators[store];
    }
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE1IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE2IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE0IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzE3IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEFBQUUsU0FBVSxJQUFHLENBQUcsQ0FBQSxPQUFNLENBQUk7QUFDMUIsS0FBSyxNQUFPLE9BQUssQ0FBQSxHQUFNLFdB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LFNBQUssQ0FBTCxPQUFLO0FBQ0wsY0FBVSxDQUFWLFlBQVU7QUFDVix1QkFBbUIsQ0FBbkIscUJBQW1CO0FBQ25CLGtCQUFjLENBQWQsZ0JBQWM7QUFDZCxjQUFVLENBQVYsWUFBVTtBQUNWLGFBQVMsQ0FBVCxXQUFTO0FBQ1Qsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsVUFBcUIsS0FBSSxDQUFJO0FBQzNCLFdBQU8sQ0FBQSxjQUFhLENBQUUsS0FBSSxDQUFDLENBQUM7SUFDOUI7QUFBQSxFQUNGLENBQUM7QUFFSCxDQUFDLENBQUMsQ0FBQztBQUFBIiwiZmlsZSI6Imx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG4gIGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCByZXF1aXJlKFwidHJhY2V1clwiKSwgcmVxdWlyZShcInJlYWN0XCIpLCBwb3N0YWwsIG1hY2hpbmEsIHRoaXMgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuICB9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgZ2xvYmFsLCB1bmRlZmluZWQgKSB7XG4gIFxuICB2YXIgbHV4Q2ggPSBwb3N0YWwuY2hhbm5lbCggXCJsdXhcIiApO1xuICB2YXIgc3RvcmVzID0ge307XG5cbiAgZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG4gICAgZm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgIHlpZWxkIFtrLCBvYmpba11dO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKVxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICB2YXIgYWN0aW9uTGlzdCA9IFtdO1xuICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgIGFjdGlvbkxpc3QucHVzaCh7XG4gICAgICBhY3Rpb25UeXBlOiBrZXksXG4gICAgICB3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW10gXG4gICAgfSlcbiAgfVxuICByZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oIGFjdGlvbkxpc3QgKSB7XG4gIHZhciBhY3Rpb25DcmVhdG9yID0ge307XG4gIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pe1xuICAgIGFjdGlvbkNyZWF0b3JbIGFjdGlvbiBdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuICAgICAgbHV4Q2gucHVibGlzaCgge1xuICAgICAgICB0b3BpYzogXCJhY3Rpb25cIixcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGlvblR5cGU6IGFjdGlvbixcbiAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhY3Rpb25DcmVhdG9yO1xufSBcbiAgY2xhc3MgTWVtb3J5U3RvcmFnZSB7XG4gIGNvbnN0cnVjdG9yKHN0YXRlKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgIHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcbiAgfVxuXG4gIGdldFN0YXRlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZXNvbHZlKHRoaXMuc3RhdGUpO1xuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIHNldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcbiAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuc3RhdGUgPSBuZXdTdGF0ZTtcbiAgfVxuXG4gIGZsdXNoKCkge1xuICAgIHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuICAgIHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcbiAgICByZXR1cm4ge1xuICAgICAgY2hhbmdlZEtleXMsXG4gICAgICBzdGF0ZSA6IHRoaXMuc3RhdGVcbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIFN0b3JlIHtcbiAgY29uc3RydWN0b3IoIG5hbWVzcGFjZSwgaGFuZGxlcnMsIHN0b3JhZ2VTdHJhdGVneSApIHtcblx0XHR0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlU3RyYXRlZ3k7XG4gICAgdGhpcy5hY3Rpb25IYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKHRoaXMsIGhhbmRsZXJzKTtcbiAgICB0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuICAgICAgZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoIGBkaXNwYXRjaC4ke25hbWVzcGFjZX1gLCB0aGlzLmhhbmRsZVBheWxvYWQgKSksXG4gICAgICBub3RpZnkgIDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZSggYG5vdGlmeWAsIHRoaXMuZmx1c2ggKSlcbiAgICB9O1xuICAgIGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG4gICAgICBuYW1lc3BhY2UsXG4gICAgICBhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGZvcih2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdGUoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2UuZ2V0U3RhdGUoLi4uYXJncyk7XG4gIH1cblxuICBzZXRTdGF0ZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5zZXRTdGF0ZSguLi5hcmdzKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5yZXBsYWNlU3RhdGUoLi4uYXJncyk7XG4gIH1cblxuICBmbHVzaCgpIHtcbiAgICBsdXhDaC5wdWJsaXNoKGBub3RpZmljYXRpb24uJHt0aGlzLm5hbWVzcGFjZX1gLCB0aGlzLnN0b3JhZ2UuZmx1c2goKSk7XG4gIH1cblxuICBoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgdmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuICAgIGlmKHRoaXMuYWN0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuICAgICAgdGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG4gICAgICAgIC5jYWxsKCB0aGlzLCBkYXRhIClcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgKHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgeyByZXN1bHQsIG5hbWVzcGFjZSB9KSxcbiAgICAgICAgICAoZXJyKSAgICA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG4gICAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG4gIHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciByZXMgPSBoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MpO1xuICAgIGlmKHJlcyBpbnN0YW5jZW9mIFByb21pc2UgfHwgKCByZXMgJiYgdHlwZW9mIHJlcy50aGVuID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuICB2YXIgdGFyZ2V0ID0ge307XG4gIGlmKCEoXCJnZXRTdGF0ZVwiIGluIGhhbmRsZXJzKSkge1xuICAgIGhhbmRsZXJzLmdldFN0YXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgdHJhbnNmb3JtSGFuZGxlcihcbiAgICAgIHN0b3JlLFxuICAgICAgdGFyZ2V0LFxuICAgICAga2V5LFxuICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG4gICAgKTtcbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSh7IG5hbWVzcGFjZSwgaGFuZGxlcnM9e30sIHN0b3JhZ2VTdHJhdGVneT1uZXcgTWVtb3J5U3RvcmFnZSgpIH0pIHtcbiAgaWYobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuICAgIHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgfVxuICBcbiAgdmFyIHN0b3JlID0gbmV3IFN0b3JlKG5hbWVzcGFjZSwgaGFuZGxlcnMsIHN0b3JhZ2VTdHJhdGVneSk7XG4gIGFjdGlvbkNyZWF0b3JzW25hbWVzcGFjZV0gPSBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG4gIHJldHVybiBzdG9yZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG4gIHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbiAgZGVsZXRlIHN0b3Jlc1tuYW1lc3BhY2VdO1xufVxuICBmdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICBbXG4gICAgICBmb3IgKCBzdG9yZSBvZiBnZW5lcmF0aW9uICkgbHV4Q2gucmVxdWVzdCgge1xuICAgICAgICB0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG4gICAgICAgIGRhdGE6IGFjdGlvblxuICAgICAgfSApIF0gKS50aGVuKFxuICAgICggcmVzcG9uc2VzICkgPT4ge1xuICAgICAgZm9yICggdmFyIHJlc3BvbnNlIG9mIHJlc3BvbnNlcyApIHtcbiAgICAgICAgdGhpcy5zdG9yZXNbIHJlc3BvbnNlLm5hbWVzcGFjZSBdID0gdGhpcy5zdG9yZXNbIHJlc3BvbnNlLm5hbWVzcGFjZSBdIHx8IHt9O1xuICAgICAgICB0aGlzLnN0b3Jlc1sgcmVzcG9uc2UubmFtZXNwYWNlIF0ucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgfVxuICAgIH0gKTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG4gIGNvbnN0cnVjdG9yKCBjb25maWcgKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywge1xuICAgICAgZ2VuZXJhdGlvbkluZGV4OiAwLFxuICAgICAgc3RvcmVzOiB7fVxuICAgIH0sIGNvbmZpZyApO1xuICAgIHN1cGVyKCB7XG4gICAgICBpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuICAgICAgc3RhdGVzOiB7XG4gICAgICAgIHVuaW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICBzdGFydDogXCJkaXNwYXRjaGluZ1wiXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgX29uRW50ZXIoKSB7XG4gICAgICAgICAgICBQcm9taXNlLmFsbChcbiAgICAgICBcdFx0XHRbIGZvciAoIGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zICkgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggdGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbiApIF1cbiAgICAgICBcdFx0KS50aGVuKCBmdW5jdGlvbiggLi4ucmVzdWx0cyApIHtcbiAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uKCBcInN1Y2Nlc3NcIiApO1xuICAgICAgICAgICAgfS5iaW5kKCB0aGlzICksIGZ1bmN0aW9uKCBlcnIgKSB7XG4gICAgICAgICAgICAgIHRoaXMuZXJyID0gZXJyO1xuICAgICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24oIFwiZmFpbHVyZVwiICk7XG4gICAgICAgICAgICB9LmJpbmQoIHRoaXMgKSApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgX29uRXhpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsdXhDaC5wdWJsaXNoKCBcImRpc3BhdGNoQ3ljbGVcIiApXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiB7XG4gICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbHV4Q2gucHVibGlzaCggXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoIFwic3VjY2Vzc1wiICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbHV4Q2gucHVibGlzaCggXCJmYWlsdXJlLmFjdGlvblwiLCB7XG4gICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb24sXG4gICAgICAgICAgICAgIGVycjogdGhpcy5lcnJcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdCggXCJmYWlsdXJlXCIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cbiAgc3VjY2VzcyggZm4gKSB7XG4gICAgdGhpcy5vbiggXCJzdWNjZXNzXCIsIGZuICk7XG4gICAgaWYgKCAhdGhpcy5fc3RhcnRlZCApIHtcbiAgICAgIHNldFRpbWVvdXQoICgpID0+IHRoaXMuaGFuZGxlKCBcInN0YXJ0XCIgKSwgMCApO1xuICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGZhaWx1cmUoIGZuICkge1xuICAgIHRoaXMub24oIFwiZXJyb3JcIiwgZm4gKTtcbiAgICBpZiAoICF0aGlzLl9zdGFydGVkICkge1xuICAgICAgc2V0VGltZW91dCggKCkgPT4gdGhpcy5oYW5kbGUoIFwic3RhcnRcIiApLCAwICk7XG4gICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiAgZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4gKSB7XG4gIGdlbiA9IGdlbiB8fCAwO1xuICBjYWxjZEdlbiA9IGdlbjtcbiAgaWYgKCBzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoICkge1xuICAgIHN0b3JlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcbiAgICAgIHZhciBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG4gICAgICB2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSApO1xuICAgICAgaWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG4gICAgICAgIGNhbGNkR2VuID0gdGhpc0dlbjtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cbiAgcmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMgKSB7XG4gIHZhciB0cmVlID0gW107XG4gIHZhciBsb29rdXAgPSB7fTtcbiAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUpO1xuICBzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCApKTtcbiAgZm9yKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcbiAgXHR0cmVlWyBpdGVtLmdlbiBdID0gdHJlZVsgaXRlbS5nZW4gXSB8fCBbXTtcbiAgICB0cmVlWyBpdGVtLmdlbiBdLnB1c2goIGl0ZW0gKTtcbiAgfVxuICByZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHsgYWN0aW9uIDogYWN0aW9uTWV0YSB9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiIDogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IodmFyIGFjdGlvbiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHsgbmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLCB3YWl0Rm9yOiBhY3Rpb24ud2FpdEZvciB9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3RvcHBlZDoge31cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiYWN0aW9uXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oIGRhdGEsIGVudiApIHsgdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTsgfVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJyZWdpc3RlclwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKCBkYXRhLCBlbnYgKSB7IHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7IH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKCBcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhICk7XG5cdH1cblxuXHRoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKCBcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgdmFyIGx1eFN0b3JlID0ge1xuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RvcmVzID0gdGhpcy5zdG9yZXMgfHwgW107XG4gICAgdGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzID0gdGhpcy5zdGF0ZUNoYW5nZUhhbmRsZXJzIHx8IHt9O1xuICAgIHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICBcdFx0dGhpcy5zZXRTdGF0ZShkYXRhLnN0YXRlIHx8IGRhdGEpO1xuICBcdH07XG4gICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXVxuICAgIHRoaXMuc3RvcmVzLmZvckVhY2goIGZ1bmN0aW9uKCBzdCApIHtcbiAgICBcdHZhciBzdG9yZSA9IHN0LnN0b3JlIHx8IHN0O1xuICAgIFx0dmFyIGhhbmRsZXIgPSBzdC5oYW5kbGVyIHx8IGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXI7XG4gICAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuICAgICAgXHRsdXhDaC5zdWJzY3JpYmUoIFwibm90aWZpY2F0aW9uLlwiICsgc3RvcmUsIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgXHRcdGhhbmRsZXIuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICB9KS53aXRoQ29udGV4dCggdGhpcyApXG4gICAgICBcdClcbiAgICB9LmJpbmQodGhpcykgKTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICBcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24oc3ViKXtcbiAgXHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuICBcdH0pO1xuICB9XG59O1xuXG52YXIgbHV4QWN0aW9uID0ge1xuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG4gICAgdGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goIGZ1bmN0aW9uKCBzdG9yZSApIHtcbiAgICAgIHRoaXMuYWN0aW9uc1sgc3RvcmUgXSA9IGx1eC5nZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApO1xuICAgIH0uYmluZCh0aGlzKSApO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7IG1peGluczogW2x1eFN0b3JlLCBsdXhBY3Rpb25dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSkgfTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHsgbWl4aW5zOiBbbHV4QWN0aW9uXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pIH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiBsdXhDaCxcbiAgICBzdG9yZXMsXG4gICAgY3JlYXRlU3RvcmUsXG4gICAgY3JlYXRlQ29udHJvbGxlclZpZXcsXG4gICAgY3JlYXRlQ29tcG9uZW50LFxuICAgIHJlbW92ZVN0b3JlLFxuICAgIGRpc3BhdGNoZXIsXG4gICAgQWN0aW9uQ29vcmRpbmF0b3IsXG4gICAgZ2V0QWN0aW9uQ3JlYXRvckZvciggc3RvcmUgKSB7XG4gICAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xuICAgIH1cbiAgfTtcblxufSkpOyIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=