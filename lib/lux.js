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
            if (!this.hasOwnProperty(k)) {
              this[k] = v;
            }
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
      for (var k in luxStoreMixin.mixin) {
        if (!luxStoreMixin.mixin.hasOwnProperty(k)) {
          context[k] = luxStoreMixin.mixin[k];
        }
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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O0FBQ2hCLHNCQUFrQixDQUFsQixvQkFBa0I7QUFBQSxFQUNwQixDQUFDO0FBR0gsQ0FBQyxDQUFDLENBQUM7QUFBQSIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG4gIGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiLCBcIndoZW5cIiwgXCJ3aGVuLnBpcGVsaW5lXCIsIFwid2hlbi5wYXJhbGxlbFwiIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KFxuICAgICAgICByZXF1aXJlKFwidHJhY2V1clwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJyZWFjdFwiKSwgXG4gICAgICAgIHBvc3RhbCwgXG4gICAgICAgIG1hY2hpbmEsIFxuICAgICAgICByZXF1aXJlKFwid2hlblwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW4vcGFyYWxsZWxcIikpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuICB9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgd2hlbiwgcGlwZWxpbmUsIHBhcmFsbGVsICkge1xuICBcbiAgdmFyIGx1eENoID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4XCIgKTtcbiAgdmFyIHN0b3JlcyA9IHt9O1xuXG4gIC8vIGpzaGludCBpZ25vcmU6c3RhcnRcbiAgZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG4gICAgZm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgIHlpZWxkIFtrLCBvYmpba11dO1xuICAgIH1cbiAgfVxuICAvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG4gIGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gIH1cblxuICBcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG4gICAgdmFyIGFjdGlvbkxpc3QgPSBbXTtcbiAgICBmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuICAgICAgICBhY3Rpb25MaXN0LnB1c2goe1xuICAgICAgICAgICAgYWN0aW9uVHlwZToga2V5LFxuICAgICAgICAgICAgd2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuICAgIHJldHVybiBhY3Rpb25DcmVhdG9yc1tzdG9yZV07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oYWN0aW9uTGlzdCkge1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0ge307XG4gICAgYWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgICBhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuICAgICAgICAgICAgbHV4Q2gucHVibGlzaCh7XG4gICAgICAgICAgICAgICAgdG9waWM6IFwiYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkFyZ3M6IGFyZ3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn1cbiAgXG5cblxuY2xhc3MgSW5NZW1vcnlUcmFuc3BvcnQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICAgICAgdGhpcy5jaGFuZ2VkS2V5cyA9IFtdO1xuICAgIH1cblxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKTtcbiAgICB9XG5cbiAgICByZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgdmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNoYW5nZWRLZXlzLFxuICAgICAgICAgICAgc3RhdGU6IHRoaXMuc3RhdGVcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciByZXMgPSBoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KFtkYXRhLmRlcHNdKSk7XG4gICAgICAgIHJldHVybiB3aGVuLmpvaW4oXG4gICAgICAgICAgICB3aGVuKHJlcykudGhlbihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbih4KXsgcmV0dXJuIFtudWxsLCB4XTsgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpeyByZXR1cm4gW2Vycl07IH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBzdG9yZS5nZXRTdGF0ZSgpXG4gICAgICAgICkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICAgICAgdmFyIHJlcyA9IHZhbHVlc1swXVsxXTtcbiAgICAgICAgICAgIHZhciBlcnIgPSB2YWx1ZXNbMF1bMF07XG4gICAgICAgICAgICByZXR1cm4gd2hlbih7XG4gICAgICAgICAgICAgICAgcmVzdWx0OiByZXMsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICBzdGF0ZTogdmFsdWVzWzFdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9O1xuICAgIGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG4gICAgICAgIHRyYW5zZm9ybUhhbmRsZXIoXG4gICAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG5jbGFzcyBTdG9yZSB7XG4gICAgY29uc3RydWN0b3IobmFtZXNwYWNlLCBoYW5kbGVycywgdHJhbnNwb3J0U3RyYXRlZ3kpIHtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0ID0gdHJhbnNwb3J0U3RyYXRlZ3k7XG4gICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBoYW5kbGVycyk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICBkaXNwYXRjaDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkKSksXG4gICAgICAgICAgICBub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiB0aGlzLmluRGlzcGF0Y2gpLFxuICAgICAgICAgICAgc2NvcGVkTm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnkuJHtuYW1lc3BhY2V9YCwgdGhpcy5mbHVzaCkpXG4gICAgICAgIH07XG4gICAgICAgIGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG4gICAgICAgICAgICBuYW1lc3BhY2UsXG4gICAgICAgICAgICBhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuZ2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUoLi4uYXJncykge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0U3RhdGUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgcmVwbGFjZVN0YXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGxhY2VTdGF0ZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBmbHVzaCgpIHtcbiAgICAgICAgdGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBsdXhDaC5wdWJsaXNoKGBub3RpZmljYXRpb24uJHt0aGlzLm5hbWVzcGFjZX1gLCB0aGlzLnRyYW5zcG9ydC5mbHVzaCgpKTtcbiAgICB9XG5cbiAgICBoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuICAgICAgICAgICAgdGhpcy5pbkRpc3BhdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9uSGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXVxuICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMsIGRhdGEpXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHsgcmVzdWx0LCBuYW1lc3BhY2UgfSksXG4gICAgICAgICAgICAgICAgICAgIChlcnIpID0+IGVudmVsb3BlLnJlcGx5KGVycilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHsgbmFtZXNwYWNlLCBoYW5kbGVycyA9IHt9LCB0cmFuc3BvcnRTdHJhdGVneSA9IG5ldyBJbk1lbW9yeVRyYW5zcG9ydCgpIH0pIHtcbiAgICBpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgfVxuXG4gICAgdmFyIHN0b3JlID0gbmV3IFN0b3JlKG5hbWVzcGFjZSwgaGFuZGxlcnMsIHRyYW5zcG9ydFN0cmF0ZWd5KTtcbiAgICBhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuICAgIHJldHVybiBzdG9yZTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcbiAgICBzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG4gICAgZGVsZXRlIHN0b3Jlc1tuYW1lc3BhY2VdO1xufVxuICBcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG4gICAgICAgIGFjY3VtW2tleV0gPSAob2JqW2tleV0gJiYgb2JqW2tleV0ucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIGFjY3VtO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHBhcmFsbGVsKFxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuICAgICAgICAgICAgICAgICAgICB9LCBhY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbHV4Q2gucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0ucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuICAgIH1cbiAgICAvKlxuICAgIFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcbiAgICBcdHtcbiAgICBcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuICAgIFx0XHRhY3Rpb24gOiB7XG4gICAgXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcbiAgICBcdFx0XHRhY3Rpb25BcmdzOiBbXVxuICAgIFx0XHR9XG4gICAgXHR9XG4gICAgKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIGdlbmVyYXRpb25JbmRleDogMCxcbiAgICAgICAgICAgIHN0b3Jlczoge31cbiAgICAgICAgfSwgY29uZmlnKTtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHVuaW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXIoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZWxpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnIgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfb25FeGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwiZGlzcGF0Y2hDeWNsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycjogdGhpcy5lcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1Y2Nlc3MoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZmFpbHVyZShmbikge1xuICAgICAgICB0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4gIFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG4gICAgZ2VuID0gZ2VuIHx8IDA7XG4gICAgdmFyIGNhbGNkR2VuID0gZ2VuO1xuICAgIGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG4gICAgICAgIHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuICAgICAgICAgICAgdmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG4gICAgICAgICAgICBpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG4gICAgICAgICAgICAgICAgY2FsY2RHZW4gPSB0aGlzR2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuICAgIHZhciB0cmVlID0gW107XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG4gICAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuICAgIGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG4gICAgICAgICAgICBhY3Rpb25NYXA6IHt9LFxuICAgICAgICAgICAgY29vcmRpbmF0b3JzOiBbXSxcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHJlYWR5OiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge307XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uTWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uTWV0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJlcGFyaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcygoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiKlwiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RvcHBlZDoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhLCBlbnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgY29uZmlnU3Vic2NyaXB0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFxuICAgICAgICAgICAgICAgICAgICBcInJlZ2lzdGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIGVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcbiAgICB9XG5cbiAgICBoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG4gICAgICAgIHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICBcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdG9yZXMgPSB0aGlzLnN0b3JlcyB8fCBbXTtcblx0XHR0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgPSB0aGlzLnN0YXRlQ2hhbmdlSGFuZGxlcnMgfHwge307XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0ICAgIHRoaXMuc2V0U3RhdGUoZGF0YS5zdGF0ZSB8fCBkYXRhKTtcblx0XHR9O1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG5cdFx0dmFyIGltbWVkaWF0ZSA9IFtdO1xuXHRcdHRoaXMuc3RvcmVzLmZvckVhY2goZnVuY3Rpb24oc3QpIHtcblx0XHQgICAgdmFyIHN0b3JlID0gc3Quc3RvcmUgfHwgc3Q7XG5cdFx0ICAgIHZhciBoYW5kbGVyID0gc3QuaGFuZGxlciB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXHRcdCAgICB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdCAgICAgICAgbHV4Q2guc3Vic2NyaWJlKFwibm90aWZpY2F0aW9uLlwiICsgc3RvcmUsIChkYXRhKSA9PiBoYW5kbGVyLmNhbGwodGhpcywgZGF0YSkpXG5cdFx0ICAgICk7XG5cdFx0ICAgIGlmKHN0LmltbWVkaWF0ZSkge1xuXHRcdCAgICAgICAgaW1tZWRpYXRlLnB1c2goc3RvcmUpO1xuXHRcdCAgICB9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRpZihpbW1lZGlhdGUubGVuZ3RoKSB7XG5cdFx0ICAgIHRoaXMubG9hZFN0YXRlKC4uLmltbWVkaWF0ZSk7XG5cdFx0fVxuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YikgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuXHR9LFxuXHRtaXhpbjoge1xuXHRcdGxvYWRTdGF0ZTogZnVuY3Rpb24gKC4uLnN0b3Jlcykge1xuXHRcdFx0aWYoIXN0b3Jlcy5sZW5ndGgpIHtcblx0XHRcdCAgICBzdG9yZXMgPSB0aGlzLnN0b3Jlcy5tYXAoKHN0KSA9PiBzdC5zdG9yZSApO1xuXHRcdFx0fVxuXHRcdFx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsdXhDaC5wdWJsaXNoKGBub3RpZnkuJHtzdG9yZX1gKSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuICAgIGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcbiAgICBsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG52YXIgbHV4QWN0aW9uTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuICAgICAgICB0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaChmdW5jdGlvbihzdG9yZSkge1xuICAgICAgICAgICAgZm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKSkpIHtcbiAgICAgICAgICAgICAgICBpZighdGhpcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2tdID0gdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxufTtcblxudmFyIGx1eEFjdGlvblJlYWN0TWl4aW4gPSB7XG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuICAgIH07XG4gICAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuICAgIHZhciBvcHQgPSB7XG4gICAgICAgIG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcbiAgICB9O1xuICAgIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRsdXhTdG9yZU1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRmb3IgKCB2YXIgayBpbiBsdXhTdG9yZU1peGluLm1peGluICkge1xuXHRcdFx0aWYoIWx1eFN0b3JlTWl4aW4ubWl4aW4uaGFzT3duUHJvcGVydHkoaykpIHtcblx0XHRcdFx0Y29udGV4dFsgayBdID0gbHV4U3RvcmVNaXhpbi5taXhpblsgayBdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb250ZXh0Ll9fbHV4Q2xlYW51cC5wdXNoKCBsdXhTdG9yZU1peGluLnRlYXJkb3duICk7XG5cdH1cblxuXHRpZiAoIGNvbnRleHQuZ2V0QWN0aW9uc0ZvciApIHtcblx0XHRsdXhBY3Rpb25NaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdH1cblxuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cblxuICAvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6IGx1eENoLFxuICAgIHN0b3JlcyxcbiAgICBjcmVhdGVTdG9yZSxcbiAgICBjcmVhdGVDb250cm9sbGVyVmlldyxcbiAgICBjcmVhdGVDb21wb25lbnQsXG4gICAgcmVtb3ZlU3RvcmUsXG4gICAgZGlzcGF0Y2hlcixcbiAgICBtaXhpbjogbWl4aW4sXG4gICAgQWN0aW9uQ29vcmRpbmF0b3IsXG4gICAgZ2V0QWN0aW9uQ3JlYXRvckZvclxuICB9O1xuICAvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpOyIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=