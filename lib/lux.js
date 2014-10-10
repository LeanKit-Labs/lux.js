/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.2
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
  postal.configuration.promise.createDeferred = function() {
    return when.defer();
  };
  postal.configuration.promise.getPromise = function(dfd) {
    return dfd.promise;
  };
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
          hasChanged: store.hasChanged,
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
    this.changedKeys = [];
    this.actionHandlers = transformHandlers(this, options.handlers);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(options.handlers));
    Object.assign(this, options);
    this.inDispatch = false;
    this.hasChanged = false;
    this.state = options.state || {};
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
      this.hasChanged = true;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = Object.assign(this.state, newState));
    },
    replaceState: function(newState) {
      "use strict";
      var $__0 = this;
      this.hasChanged = true;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = newState);
    },
    flush: function() {
      "use strict";
      this.inDispatch = false;
      if (this.hasChanged) {
        var changedKeys = Object.keys(this.changedKeys);
        this.changedKeys = {};
        this.hasChanged = false;
        luxCh.publish(("notification." + this.namespace), {
          changedKeys: changedKeys,
          state: this.state
        });
      } else {
        luxCh.publish(("nochange." + this.namespace));
      }
    },
    handlePayload: function(data, envelope) {
      "use strict";
      var namespace = this.namespace;
      if (this.actionHandlers.hasOwnProperty(data.actionType)) {
        this.inDispatch = true;
        this.actionHandlers[data.actionType].call(this, data).then((function(result) {
          return envelope.reply(null, result);
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
      accum[key] = (obj[key] && obj[key]);
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
            $__0.stores[store.namespace] = response;
            if (response.hasChanged) {
              $__0.updated.push(store.namespace);
            }
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
      stores: {},
      updated: []
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
              this.transition("success");
            }.bind(this), function(err) {
              this.err = err;
              this.transition("failure");
            }.bind(this));
          },
          _onExit: function() {
            luxCh.publish("prenotify", {stores: this.updated});
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
            this.luxAction.stores = stores;
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
  function gateKeeper(store, data) {
    var $__9;
    var payload = {};
    payload[store] = data;
    var found = this.__luxWaitFor.indexOf(store);
    if (found > -1) {
      this.__luxWaitFor.splice(found, 1);
      this.__luxHeardFrom.push(payload);
      if (this.__luxWaitFor.length === 0) {
        payload = ($__9 = Object).assign.apply($__9, $traceurRuntime.spread([{}], this.__luxHeardFrom));
        this.__luxHeardFrom = [];
        this.stores.onChange.call(this, payload);
      }
    } else {
      this.stores.onChange.call(this, payload);
    }
  }
  function handlePreNotify(data) {
    var $__0 = this;
    this.__luxWaitFor = data.stores.filter((function(item) {
      return $__0.stores.listenTo.indexOf(item) > -1;
    }));
  }
  var luxStoreMixin = {
    setup: function() {
      var $__9;
      var $__0 = this;
      var stores = this.stores = (this.stores || {});
      var immediate = stores.immediate;
      var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
      var genericStateChangeHandler = function(stores) {
        if (typeof this.setState === "function") {
          var newState = {};
          for (var $__5 = entries(stores)[Symbol.iterator](),
              $__6; !($__6 = $__5.next()).done; ) {
            var $__8 = $__6.value,
                k = $__8[0],
                v = $__8[1];
            {
              newState[k] = v.state;
            }
          }
          this.setState(newState);
        }
      };
      this.__luxWaitFor = [];
      this.__luxHeardFrom = [];
      this.__subscriptions = this.__subscriptions || [];
      stores.onChange = stores.onChange || genericStateChangeHandler;
      listenTo.forEach((function(store) {
        return $__0.__subscriptions.push(luxCh.subscribe(("notification." + store), (function(data) {
          return gateKeeper.call($__0, store, data);
        })));
      }));
      this.__subscriptions.push(luxCh.subscribe("prenotify", (function(data) {
        return handlePreNotify.call($__0, data);
      })));
      if (immediate) {
        if (immediate === true) {
          this.loadState();
        } else {
          ($__9 = this).loadState.apply($__9, $traceurRuntime.spread(immediate));
        }
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
          stores = this.stores.listenTo;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUFnQixDQUFoQixrQkFBZ0I7QUFDaEIsc0JBQWtCLENBQWxCLG9CQUFrQjtBQUFBLEVBQ25CLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMi4yXG4gKiBVcmw6IGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFuS2l0LUxhYnMvbHV4LmpzXG4gKiBMaWNlbnNlKHMpOiBNSVQgQ29weXJpZ2h0IChjKSAyMDE0IExlYW5LaXRcbiAqL1xuXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiLCBcIndoZW5cIiwgXCJ3aGVuLnBpcGVsaW5lXCIsIFwid2hlbi5wYXJhbGxlbFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0cmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEsXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW4vcGFyYWxsZWxcIikpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgd2hlbiwgcGlwZWxpbmUsIHBhcmFsbGVsICkge1xuXG5cdC8vIFdlIG5lZWQgdG8gdGVsbCBwb3N0YWwgaG93IHRvIGdldCBhIGRlZmVycmVkIGluc3RhbmNlIGZyb20gd2hlbi5qc1xuXHRwb3N0YWwuY29uZmlndXJhdGlvbi5wcm9taXNlLmNyZWF0ZURlZmVycmVkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHdoZW4uZGVmZXIoKTtcblx0fTtcblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgXCJwdWJsaWMtZmFjaW5nXCIvc2FmZSBwcm9taXNlIGluc3RhbmNlXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuZ2V0UHJvbWlzZSA9IGZ1bmN0aW9uKCBkZmQgKSB7XG5cdFx0cmV0dXJuIGRmZC5wcm9taXNlO1xuXHR9O1xuXG5cdHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcblx0dmFyIGFjdGlvbkNyZWF0b3IgPSB7fTtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGFjdGlvbkNyZWF0b3JbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IFwiYWN0aW9uXCIsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9KTtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuIHdoZW4oaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChbZGF0YS5kZXBzXSkpKVxuXHRcdFx0LnRoZW4oXG5cdFx0XHRcdGZ1bmN0aW9uKHgpeyByZXR1cm4gW251bGwsIHhdOyB9LFxuXHRcdFx0XHRmdW5jdGlvbihlcnIpeyByZXR1cm4gW2Vycl07IH1cblx0XHRcdCkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gdmFsdWVzWzFdO1xuXHRcdFx0XHR2YXIgZXJyb3IgPSB2YWx1ZXNbMF07XG5cdFx0XHRcdGlmKGVycm9yICYmIHR5cGVvZiBzdG9yZS5oYW5kbGVBY3Rpb25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCwgc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3Ioa2V5LCBlcnJvcikpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuXHRcdFx0XHR2YXIgcmVzID0gdmFsdWVzWzFdO1xuXHRcdFx0XHR2YXIgZXJyID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRyZXR1cm4gd2hlbih7XG5cdFx0XHRcdFx0aGFzQ2hhbmdlZDogc3RvcmUuaGFzQ2hhbmdlZCxcblx0XHRcdFx0XHRyZXN1bHQ6IHJlcyxcblx0XHRcdFx0XHRlcnJvcjogZXJyLFxuXHRcdFx0XHRcdHN0YXRlOiBzdG9yZS5nZXRTdGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuXHR2YXIgdGFyZ2V0ID0ge307XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0dHJhbnNmb3JtSGFuZGxlcihcblx0XHRcdHN0b3JlLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0a2V5LFxuXHRcdFx0dHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucykge1xuXHRpZighb3B0aW9ucy5uYW1lc3BhY2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIik7XG5cdH1cblx0aWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiKTtcblx0fVxufVxuXG52YXIgc3RvcmVzID0ge307XG5cbmNsYXNzIFN0b3JlIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2U7XG5cdFx0aWYgKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuXHRcdH1cblx0XHR0aGlzLmNoYW5nZWRLZXlzID0gW107XG5cdFx0dGhpcy5hY3Rpb25IYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKHRoaXMsIG9wdGlvbnMuaGFuZGxlcnMpO1xuXHRcdGFjdGlvbkNyZWF0b3JzW25hbWVzcGFjZV0gPSBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMuaGFuZGxlcnMpKTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHRoaXMuaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc3RhdGUgPSBvcHRpb25zLnN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRkaXNwYXRjaDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkKSksXG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiB0aGlzLmluRGlzcGF0Y2gpLFxuXHRcdFx0c2NvcGVkTm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnkuJHtuYW1lc3BhY2V9YCwgdGhpcy5mbHVzaCkpXG5cdFx0fTtcblx0XHRsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuXHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KG9wdGlvbnMuaGFuZGxlcnMpXG5cdFx0fSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0fVxuXG5cdGdldFN0YXRlKCkge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlO1xuXHR9XG5cblx0c2V0U3RhdGUobmV3U3RhdGUpIHtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSkpO1xuXHR9XG5cblx0cmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiAodGhpcy5zdGF0ZSA9IG5ld1N0YXRlKTtcblx0fVxuXG5cdGZsdXNoKCkge1xuXHRcdHRoaXMuaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdGlmKHRoaXMuaGFzQ2hhbmdlZCkge1xuXHRcdFx0dmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzID0ge307XG5cdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdGx1eENoLnB1Ymxpc2goYG5vdGlmaWNhdGlvbi4ke3RoaXMubmFtZXNwYWNlfWAsIHsgY2hhbmdlZEtleXMsIHN0YXRlOiB0aGlzLnN0YXRlIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKGBub2NoYW5nZS4ke3RoaXMubmFtZXNwYWNlfWApO1xuXHRcdH1cblxuXHR9XG5cblx0aGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcblx0XHRpZiAodGhpcy5hY3Rpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG5cdFx0XHR0aGlzLmluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0dGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG5cdFx0XHRcdC5jYWxsKHRoaXMsIGRhdGEpXG5cdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHJlc3VsdCksXG5cdFx0XHRcdFx0KGVycikgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuXHRcdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5mdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0dmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG5cdFx0YWNjdW1ba2V5XSA9IChvYmpba2V5XSAmJiBvYmpba2V5XSk7XG5cdFx0cmV0dXJuIGFjY3VtO1xuXHR9LCB7fSk7XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRcdHJldHVybiAoKSA9PiBwYXJhbGxlbChcblx0XHRcdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHRcdFx0XHR9LCBhY3Rpb24pO1xuXHRcdFx0XHRcdHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHRcdHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcblx0XHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0aWYocmVzcG9uc2UuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZWQucHVzaChzdG9yZS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuXHR9XG5cdC8qXG5cdFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0XHR7XG5cdFx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0XHRhY3Rpb24gOiB7XG5cdFx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHVuaW5pdGlhbGl6ZWQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXIoKSB7XG5cdFx0XHRcdFx0XHRcdHBpcGVsaW5lKFxuXHRcdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuXHRcdFx0XHRcdFx0XHQpLnRoZW4oZnVuY3Rpb24oLi4ucmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBlcnI7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0c3VjY2Vzcyhmbikge1xuXHRcdHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZmFpbHVyZShmbikge1xuXHRcdHRoaXMub24oXCJlcnJvclwiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4pIHtcblx0Z2VuID0gZ2VuIHx8IDA7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRjb29yZGluYXRvcnM6IFtdLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7fTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGFjdGlvbk1ldGFcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBzdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImFjdGlvblwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcInJlZ2lzdGVyXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSwgZW52KSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0aGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IGRhdGE7XG5cblx0dmFyIGZvdW5kID0gdGhpcy5fX2x1eFdhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCB0aGlzLl9fbHV4V2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRwYXlsb2FkID0gT2JqZWN0LmFzc2lnbigge30sIC4uLnRoaXMuX19sdXhIZWFyZEZyb20pO1xuXHRcdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXhXYWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGltbWVkaWF0ZSA9IHN0b3Jlcy5pbW1lZGlhdGU7XG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXHRcdHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oc3RvcmVzKSB7XG5cdFx0XHRpZiAoIHR5cGVvZiB0aGlzLnNldFN0YXRlID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRcdHZhciBuZXdTdGF0ZSA9IHt9O1xuXHRcdFx0XHRmb3IoIHZhciBbayx2XSBvZiBlbnRyaWVzKHN0b3JlcykgKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVbIGsgXSA9IHYuc3RhdGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSggbmV3U3RhdGUgKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gW107XG5cdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG5cblx0XHRzdG9yZXMub25DaGFuZ2UgPSBzdG9yZXMub25DaGFuZ2UgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKGBub3RpZmljYXRpb24uJHtzdG9yZX1gLCAoZGF0YSkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlLCBkYXRhKSlcblx0XHQpKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSlcblx0XHQpO1xuXHRcdGlmKGltbWVkaWF0ZSkge1xuXHRcdFx0aWYoaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHN0b3JlcyA9IHRoaXMuc3RvcmVzLmxpc3RlblRvO1xuXHRcdFx0fVxuXHRcdFx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsdXhDaC5wdWJsaXNoKGBub3RpZnkuJHtzdG9yZX1gKSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG52YXIgbHV4QWN0aW9uTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5hY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHt9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaChmdW5jdGlvbihzdG9yZSkge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKSkpIHtcblx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxufTtcblxudmFyIGx1eEFjdGlvblJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uTWl4aW4uc2V0dXBcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCkge1xuXHRjb250ZXh0Ll9fbHV4Q2xlYW51cCA9IFtdO1xuXG5cdGlmICggY29udGV4dC5zdG9yZXMgKSB7XG5cdFx0bHV4U3RvcmVNaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBsdXhTdG9yZU1peGluLm1peGluKTtcblx0XHRjb250ZXh0Ll9fbHV4Q2xlYW51cC5wdXNoKCBsdXhTdG9yZU1peGluLnRlYXJkb3duICk7XG5cdH1cblxuXHRpZiAoIGNvbnRleHQuZ2V0QWN0aW9uc0ZvciApIHtcblx0XHRsdXhBY3Rpb25NaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdH1cblxuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGNoYW5uZWw6IGx1eENoLFxuXHRcdFN0b3JlLFxuXHRcdGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuXHRcdGNyZWF0ZUNvbXBvbmVudCxcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRkaXNwYXRjaGVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRBY3Rpb25Db29yZGluYXRvcixcblx0XHRnZXRBY3Rpb25DcmVhdG9yRm9yXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9