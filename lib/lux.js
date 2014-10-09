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
  var $__10 = $traceurRuntime.initGeneratorFunction(entries);
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
    }, $__10, this);
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
      var $__8 = $__6.value,
          key = $__8[0],
          handler = $__8[1];
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
  function transformHandler(store, target, key, handler) {
    target[key] = function(data) {
      return when(handler.apply(store, data.actionArgs.concat([data.deps]))).then(function(x) {
        return [null, x];
      }, function(err) {
        return [err];
      }).then(function(values) {
        var result = values[1];
        var error = values[0];
        if (error && typeof store.handleActionError === "function") {
          return when.join(error, result, store.handleActionError(key, error));
        } else {
          return when.join(error, result);
        }
      }).then(function(values) {
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
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__8 = $__6.value,
          key = $__8[0],
          handler = $__8[1];
      {
        transformHandler(store, target, key, typeof handler === "object" ? handler.handler : handler);
      }
    }
    return target;
  }
  function ensureStoreOptions(options) {
    if (!options.namespace) {
      throw new Error("A lux store must have a namespace value provided");
    }
    if (!options.handlers) {
      throw new Error("A lux store must have action handler methods provided");
    }
  }
  var stores = {};
  var Store = function Store(options) {
    "use strict";
    var $__0 = this;
    ensureStoreOptions(options);
    var namespace = options.namespace;
    if (namespace in stores) {
      throw new Error((" The store namespace \"" + namespace + "\" already exists."));
    } else {
      stores[namespace] = this;
    }
    this.state = options.state || {};
    this.changedKeys = [];
    this.actionHandlers = transformHandlers(this, options.handlers);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(options.handlers));
    Object.assign(this, options);
    this.__subscription = {
      dispatch: configSubscription(this, luxCh.subscribe(("dispatch." + namespace), this.handlePayload)),
      notify: configSubscription(this, luxCh.subscribe("notify", this.flush)).withConstraint((function() {
        return $__0.inDispatch;
      })),
      scopedNotify: configSubscription(this, luxCh.subscribe(("notify." + namespace), this.flush))
    };
    luxCh.publish("register", {
      namespace: namespace,
      actions: buildActionList(options.handlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {
    dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__8 = $__6.value,
            k = $__8[0],
            subscription = $__8[1];
        {
          subscription.unsubscribe();
        }
      }
      delete stores[this.namespace];
    },
    getState: function() {
      "use strict";
      return this.state;
    },
    setState: function(newState) {
      "use strict";
      var $__0 = this;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = Object.assign(this.state, newState));
    },
    replaceState: function(newState) {
      "use strict";
      var $__0 = this;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = newState);
    },
    flush: function() {
      "use strict";
      this.inDispatch = false;
      var changedKeys = Object.keys(this.changedKeys);
      this.changedKeys = {};
      luxCh.publish(("notification." + this.namespace), {
        changedKeys: changedKeys,
        state: this.state
      });
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
  function removeStore(namespace) {
    stores[namespace].dispose();
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
                  $__7 = 0; $__7 < arguments.length; $__7++)
                results[$__7] = arguments[$__7];
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
      var $__8 = $__6.value,
          key = $__8[0],
          item = $__8[1];
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
      var $__9;
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
        ($__9 = this).loadState.apply($__9, $traceurRuntime.spread(immediate));
      }
    },
    teardown: function() {
      this.__subscriptions.forEach((function(sub) {
        return sub.unsubscribe();
      }));
    },
    mixin: {loadState: function() {
        for (var stores = [],
            $__7 = 0; $__7 < arguments.length; $__7++)
          stores[$__7] = arguments[$__7];
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
          var $__8 = $__6.value,
              k = $__8[0],
              v = $__8[1];
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
    Store: Store,
    createControllerView: createControllerView,
    createComponent: createComponent,
    removeStore: removeStore,
    dispatcher: dispatcher,
    mixin: mixin,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: getActionCreatorFor
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDcEIsQ0FBQztBQUdILENBQUMsQ0FBQyxDQUFDO0FBQUEiLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZShcInRyYWNldXJcIiksIFxuICAgICAgICByZXF1aXJlKFwicmVhY3RcIiksIFxuICAgICAgICBwb3N0YWwsIFxuICAgICAgICBtYWNoaW5hLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW5cIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcbiAgXG4gIHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG4gIHZhciBzdG9yZXMgPSB7fTtcblxuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cbiAgLy8ganNoaW50IGlnbm9yZTplbmRcblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgXG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICAgIHZhciBhY3Rpb25MaXN0ID0gW107XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgYWN0aW9uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IGtleSxcbiAgICAgICAgICAgIHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICAgIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIHRvcGljOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG4gIFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHgpeyByZXR1cm4gW251bGwsIHhdOyB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7IHJldHVybiBbZXJyXTsgfVxuICAgICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgaWYoZXJyb3IgJiYgdHlwZW9mIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCwgc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3Ioa2V5LCBlcnJvcikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IHZhbHVlc1sxXTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiByZXMsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdG9yZS5nZXRTdGF0ZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge307XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgdHJhbnNmb3JtSGFuZGxlcihcbiAgICAgICAgICAgIHN0b3JlLFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcbiAgICB9XG4gICAgaWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG4gICAgfVxufVxuXG52YXIgc3RvcmVzID0ge307XG5cbmNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuICAgICAgICBpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBvcHRpb25zLnN0YXRlIHx8IHt9O1xuICAgICAgICB0aGlzLmNoYW5nZWRLZXlzID0gW107XG4gICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBvcHRpb25zLmhhbmRsZXJzKTtcbiAgICAgICAgYWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuICAgICAgICAgICAgbm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcbiAgICAgICAgICAgIHNjb3BlZE5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5LiR7bmFtZXNwYWNlfWAsIHRoaXMuZmx1c2gpKVxuICAgICAgICB9O1xuICAgICAgICBsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuICAgICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgICAgYWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KG9wdGlvbnMuaGFuZGxlcnMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuICAgIH1cblxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSkpO1xuICAgIH1cblxuICAgIHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlID0gbmV3U3RhdGUpO1xuICAgIH1cblxuICAgIGZsdXNoKCkge1xuICAgICAgICB0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcbiAgICAgICAgdmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcbiAgICAgICAgbHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgeyBjaGFuZ2VkS2V5cywgc3RhdGU6IHRoaXMuc3RhdGUgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLCBkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCB7IHJlc3VsdCwgbmFtZXNwYWNlIH0pLFxuICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG4gICAgc3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuICBcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG4gICAgICAgIGFjY3VtW2tleV0gPSAob2JqW2tleV0gJiYgb2JqW2tleV0ucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIGFjY3VtO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHBhcmFsbGVsKFxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuICAgICAgICAgICAgICAgICAgICB9LCBhY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbHV4Q2gucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0ucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuICAgIH1cbiAgICAvKlxuICAgIFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcbiAgICBcdHtcbiAgICBcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuICAgIFx0XHRhY3Rpb24gOiB7XG4gICAgXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcbiAgICBcdFx0XHRhY3Rpb25BcmdzOiBbXVxuICAgIFx0XHR9XG4gICAgXHR9XG4gICAgKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIGdlbmVyYXRpb25JbmRleDogMCxcbiAgICAgICAgICAgIHN0b3Jlczoge31cbiAgICAgICAgfSwgY29uZmlnKTtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHVuaW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXIoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZWxpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnIgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfb25FeGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwiZGlzcGF0Y2hDeWNsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycjogdGhpcy5lcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1Y2Nlc3MoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZmFpbHVyZShmbikge1xuICAgICAgICB0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4gIFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG4gICAgZ2VuID0gZ2VuIHx8IDA7XG4gICAgdmFyIGNhbGNkR2VuID0gZ2VuO1xuICAgIGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG4gICAgICAgIHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuICAgICAgICAgICAgdmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG4gICAgICAgICAgICBpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG4gICAgICAgICAgICAgICAgY2FsY2RHZW4gPSB0aGlzR2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuICAgIHZhciB0cmVlID0gW107XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG4gICAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuICAgIGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG4gICAgICAgICAgICBhY3Rpb25NYXA6IHt9LFxuICAgICAgICAgICAgY29vcmRpbmF0b3JzOiBbXSxcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHJlYWR5OiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge307XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uTWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uTWV0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJlcGFyaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcygoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiKlwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RvcHBlZDoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcInJlZ2lzdGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIGVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICBcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdG9yZXMgPSB0aGlzLnN0b3JlcyB8fCBbXTtcblx0XHR0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgPSB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgfHwge307XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0ICAgIHRoaXMuc2V0U3RhdGUoZGF0YS5zdGF0ZSB8fCBkYXRhKTtcblx0XHR9O1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG5cdFx0dmFyIGltbWVkaWF0ZSA9IFtdO1xuXHRcdHRoaXMuc3RvcmVzLmZvckVhY2goZnVuY3Rpb24oc3QpIHtcblx0XHQgICAgdmFyIHN0b3JlID0gc3Quc3RvcmUgfHwgc3Q7XG5cdFx0ICAgIHZhciBoYW5kbGVyID0gc3QuaGFuZGxlciB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXHRcdCAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdCAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFwibm90aWZpY2F0aW9uLlwiICsgc3RvcmUsIChkYXRhKSA9PiBoYW5kbGVyLmNhbGwodGhpcywgZGF0YSkpXG5cdFx0ICAgICk7XG5cdFx0ICAgIGlmKHN0LmltbWVkaWF0ZSkge1xuXHRcdCAgICAgICAgaW1tZWRpYXRlLnB1c2goc3RvcmUpO1xuXHRcdCAgICB9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRpZihpbW1lZGlhdGUubGVuZ3RoKSB7XG5cdFx0ICAgIHRoaXMubG9hZFN0YXRlKC4uLmltbWVkaWF0ZSk7XG5cdFx0fVxuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YikgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuXHR9LFxuXHRtaXhpbjoge1xuXHRcdGxvYWRTdGF0ZTogZnVuY3Rpb24gKC4uLnN0b3Jlcykge1xuXHRcdFx0aWYoIXN0b3Jlcy5sZW5ndGgpIHtcblx0XHRcdCAgICBzdG9yZXMgPSB0aGlzLnN0b3Jlcy5tYXAoKHN0KSA9PiBzdC5zdG9yZSApO1xuXHRcdFx0fVxuXHRcdFx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsdXhDaC5wdWJsaXNoKGBub3RpZnkuJHtzdG9yZX1gKSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuICAgIGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcbiAgICBsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG52YXIgbHV4QWN0aW9uTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuICAgICAgICB0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaChmdW5jdGlvbihzdG9yZSkge1xuICAgICAgICAgICAgZm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2tdID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG59O1xuXG52YXIgbHV4QWN0aW9uUmVhY3RNaXhpbiA9IHtcbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbk1peGluLnNldHVwXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG4gICAgdmFyIG9wdCA9IHtcbiAgICAgICAgbWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG4gICAgfTtcbiAgICBkZWxldGUgb3B0aW9ucy5taXhpbnM7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG4gICAgdmFyIG9wdCA9IHtcbiAgICAgICAgbWl4aW5zOiBbbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQpIHtcblx0Y29udGV4dC5fX2x1eENsZWFudXAgPSBbXTtcblxuXHRpZiAoIGNvbnRleHQuc3RvcmVzICkge1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbHV4U3RvcmVNaXhpbi5taXhpbik7XG5cdFx0Y29udGV4dC5fX2x1eENsZWFudXAucHVzaCggbHV4U3RvcmVNaXhpbi50ZWFyZG93biApO1xuXHR9XG5cblx0aWYgKCBjb250ZXh0LmdldEFjdGlvbnNGb3IgKSB7XG5cdFx0bHV4QWN0aW9uTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHR9XG5cblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xufVxuXG5cbiAgLy8ganNoaW50IGlnbm9yZTogc3RhcnRcbiAgcmV0dXJuIHtcbiAgICBjaGFubmVsOiBsdXhDaCxcbiAgICBTdG9yZSxcbiAgICBjcmVhdGVDb250cm9sbGVyVmlldyxcbiAgICBjcmVhdGVDb21wb25lbnQsXG4gICAgcmVtb3ZlU3RvcmUsXG4gICAgZGlzcGF0Y2hlcixcbiAgICBtaXhpbjogbWl4aW4sXG4gICAgQWN0aW9uQ29vcmRpbmF0b3IsXG4gICAgZ2V0QWN0aW9uQ3JlYXRvckZvclxuICB9O1xuICAvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpOyIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=