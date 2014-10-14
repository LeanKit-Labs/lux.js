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
  var LUX_CHANNEL = "lux";
  var luxCh = postal.channel(LUX_CHANNEL);
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
      scopedNotify: configSubscription(this, luxCh.subscribe(("notify." + namespace), (function(data, env) {
        return env.reply(null, {
          changedKeys: [],
          state: $__0.state
        });
      })))
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
      accum[key] = obj[key];
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
            replyChannel: LUX_CHANNEL,
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
      var immediate = stores.immediate || true;
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
        var $__0 = this;
        var listenTo;
        if (!stores.length) {
          listenTo = this.stores.listenTo;
          stores = typeof listenTo === "string" ? [listenTo] : listenTo;
        }
        this.__luxWaitFor = $traceurRuntime.spread(stores);
        stores.forEach((function(store) {
          return luxCh.request({
            topic: ("notify." + store),
            replyChannel: LUX_CHANNEL
          }).then((function(data) {
            return gateKeeper.call($__0, store, data);
          }));
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
      Object.assign(context, luxStoreMixin.mixin);
      luxStoreMixin.setup.call(context);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUM7QUFFekIsT0FBSyxPQUFNLE9BQU8sQ0FBSTtBQUNyQixXQUFLLE9BQU8sQUFBQyxDQUFDLE9BQU0sQ0FBRyxDQUFBLGFBQVksTUFBTSxDQUFDLENBQUM7QUFDM0Msa0JBQVksTUFBTSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztBQUNuQyxZQUFNLGFBQWEsS0FBSyxBQUFDLENBQUUsYUFBWSxTQUFTLENBQUUsQ0FBQztJQUNwRDtBQUFBLEFBRUEsT0FBSyxPQUFNLGNBQWMsQ0FBSTtBQUM1QixtQkFBYSxNQUFNLEtBQUssQUFBQyxDQUFFLE9BQU0sQ0FBRSxDQUFDO0lBQ3JDO0FBQUEsQUFFQSxVQUFNLFdBQVcsRUFBSSxnQkFBYyxDQUFDO0VBQ3JDO0FBQUEsQUFJQyxPQUFPO0FBQ04sVUFBTSxDQUFHLE1BQUk7QUFDYixRQUFJLENBQUosTUFBSTtBQUNKLHVCQUFtQixDQUFuQixxQkFBbUI7QUFDbkIsa0JBQWMsQ0FBZCxnQkFBYztBQUNkLGNBQVUsQ0FBVixZQUFVO0FBQ1YsYUFBUyxDQUFULFdBQVM7QUFDVCxRQUFJLENBQUcsTUFBSTtBQUNYLG9CQUFnQixDQUFoQixrQkFBZ0I7QUFDaEIsc0JBQWtCLENBQWxCLG9CQUFrQjtBQUFBLEVBQ25CLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMi4yXG4gKiBVcmw6IGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFuS2l0LUxhYnMvbHV4LmpzXG4gKiBMaWNlbnNlKHMpOiBNSVQgQ29weXJpZ2h0IChjKSAyMDE0IExlYW5LaXRcbiAqL1xuXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiLCBcIndoZW5cIiwgXCJ3aGVuLnBpcGVsaW5lXCIsIFwid2hlbi5wYXJhbGxlbFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0cmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEsXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW4vcGFyYWxsZWxcIikpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgd2hlbiwgcGlwZWxpbmUsIHBhcmFsbGVsICkge1xuXG5cdC8vIFdlIG5lZWQgdG8gdGVsbCBwb3N0YWwgaG93IHRvIGdldCBhIGRlZmVycmVkIGluc3RhbmNlIGZyb20gd2hlbi5qc1xuXHRwb3N0YWwuY29uZmlndXJhdGlvbi5wcm9taXNlLmNyZWF0ZURlZmVycmVkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHdoZW4uZGVmZXIoKTtcblx0fTtcblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgXCJwdWJsaWMtZmFjaW5nXCIvc2FmZSBwcm9taXNlIGluc3RhbmNlXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuZ2V0UHJvbWlzZSA9IGZ1bmN0aW9uKCBkZmQgKSB7XG5cdFx0cmV0dXJuIGRmZC5wcm9taXNlO1xuXHR9O1xuXG5cdHZhciBMVVhfQ0hBTk5FTCA9IFwibHV4XCI7XG5cdHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBMVVhfQ0hBTk5FTCApO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuXHRcdFx0eWllbGQgW2ssIG9ialtrXV07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdFxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3JzW3N0b3JlXTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShhY3Rpb25MaXN0KSB7XG5cdHZhciBhY3Rpb25DcmVhdG9yID0ge307XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0bHV4Q2gucHVibGlzaCh7XG5cdFx0XHRcdHRvcGljOiBcImFjdGlvblwiLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fSk7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRmdW5jdGlvbih4KXsgcmV0dXJuIFtudWxsLCB4XTsgfSxcblx0XHRcdFx0ZnVuY3Rpb24oZXJyKXsgcmV0dXJuIFtlcnJdOyB9XG5cdFx0XHQpLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVycm9yID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRpZihlcnJvciAmJiB0eXBlb2Ygc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQsIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yKGtleSwgZXJyb3IpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlcyA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVyciA9IHZhbHVlc1swXTtcblx0XHRcdFx0cmV0dXJuIHdoZW4oe1xuXHRcdFx0XHRcdGhhc0NoYW5nZWQ6IHN0b3JlLmhhc0NoYW5nZWQsXG5cdFx0XHRcdFx0cmVzdWx0OiByZXMsXG5cdFx0XHRcdFx0ZXJyb3I6IGVycixcblx0XHRcdFx0XHRzdGF0ZTogc3RvcmUuZ2V0U3RhdGUoKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFvcHRpb25zLmhhbmRsZXJzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG5cdH1cbn1cblxudmFyIHN0b3JlcyA9IHt9O1xuXG5jbGFzcyBTdG9yZSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucyk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuXHRcdGlmIChuYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHR9XG5cdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IFtdO1xuXHRcdHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBvcHRpb25zLmhhbmRsZXJzKTtcblx0XHRhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhvcHRpb25zLmhhbmRsZXJzKSk7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHR0aGlzLnN0YXRlID0gb3B0aW9ucy5zdGF0ZSB8fCB7fTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0ZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcblx0XHRcdHNjb3BlZE5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0YG5vdGlmeS4ke25hbWVzcGFjZX1gLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IGVudi5yZXBseShudWxsLCB7IGNoYW5nZWRLZXlzOiBbXSwgc3RhdGU6IHRoaXMuc3RhdGUgfSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdH07XG5cdFx0bHV4Q2gucHVibGlzaChcInJlZ2lzdGVyXCIsIHtcblx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChvcHRpb25zLmhhbmRsZXJzKVxuXHRcdH0pO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cblxuXHRnZXRTdGF0ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZTtcblx0fVxuXG5cdHNldFN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiAodGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpKTtcblx0fVxuXG5cdHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBuZXdTdGF0ZSk7XG5cdH1cblxuXHRmbHVzaCgpIHtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IHt9O1xuXHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKGBub3RpZmljYXRpb24uJHt0aGlzLm5hbWVzcGFjZX1gLCB7IGNoYW5nZWRLZXlzLCBzdGF0ZTogdGhpcy5zdGF0ZSB9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bHV4Q2gucHVibGlzaChgbm9jaGFuZ2UuJHt0aGlzLm5hbWVzcGFjZX1gKTtcblx0XHR9XG5cblx0fVxuXG5cdGhhbmRsZVBheWxvYWQoZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG5cdFx0aWYgKHRoaXMuYWN0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0dGhpcy5pbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdHRoaXMuYWN0aW9uSGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXVxuXHRcdFx0XHQuY2FsbCh0aGlzLCBkYXRhKVxuXHRcdFx0XHQudGhlbihcblx0XHRcdFx0XHQocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCByZXN1bHQpLFxuXHRcdFx0XHRcdChlcnIpID0+IGVudmVsb3BlLnJlcGx5KGVycilcblx0XHRcdFx0KTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG5cdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRyZXR1cm4gYWNjdW07XG5cdH0sIHt9KTtcblx0cmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG5cdFx0cmV0dXJuICgpID0+IHBhcmFsbGVsKFxuXHRcdFx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0XHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRcdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdFx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdFx0XHRcdH0sIGFjdGlvbik7XG5cdFx0XHRcdFx0cmV0dXJuIGx1eENoLnJlcXVlc3Qoe1xuXHRcdFx0XHRcdFx0dG9waWM6IGBkaXNwYXRjaC4ke3N0b3JlLm5hbWVzcGFjZX1gLFxuXHRcdFx0XHRcdFx0cmVwbHlDaGFubmVsOiBMVVhfQ0hBTk5FTCxcblx0XHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0aWYocmVzcG9uc2UuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZWQucHVzaChzdG9yZS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuXHR9XG5cdC8qXG5cdFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0XHR7XG5cdFx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0XHRhY3Rpb24gOiB7XG5cdFx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHVuaW5pdGlhbGl6ZWQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXIoKSB7XG5cdFx0XHRcdFx0XHRcdHBpcGVsaW5lKFxuXHRcdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuXHRcdFx0XHRcdFx0XHQpLnRoZW4oZnVuY3Rpb24oLi4ucmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBlcnI7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0c3VjY2Vzcyhmbikge1xuXHRcdHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZmFpbHVyZShmbikge1xuXHRcdHRoaXMub24oXCJlcnJvclwiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4pIHtcblx0Z2VuID0gZ2VuIHx8IDA7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRjb29yZGluYXRvcnM6IFtdLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7fTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGFjdGlvbk1ldGFcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBzdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImFjdGlvblwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcInJlZ2lzdGVyXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSwgZW52KSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0aGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IGRhdGE7XG5cblx0dmFyIGZvdW5kID0gdGhpcy5fX2x1eFdhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCB0aGlzLl9fbHV4V2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRwYXlsb2FkID0gT2JqZWN0LmFzc2lnbigge30sIC4uLnRoaXMuX19sdXhIZWFyZEZyb20pO1xuXHRcdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXhXYWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGltbWVkaWF0ZSA9IHN0b3Jlcy5pbW1lZGlhdGUgfHwgdHJ1ZTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdG9yZXMpIHtcblx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0U3RhdGUgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge307XG5cdFx0XHRcdGZvciggdmFyIFtrLHZdIG9mIGVudHJpZXMoc3RvcmVzKSApIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVsgayBdID0gdi5zdGF0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKCBuZXdTdGF0ZSApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3IgPSBbXTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tID0gW107XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoYG5vdGlmaWNhdGlvbi4ke3N0b3JlfWAsIChkYXRhKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUsIGRhdGEpKVxuXHRcdCkpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKVxuXHRcdCk7XG5cdFx0Ly8gaW1tZWRpYXRlIGNhbiBlaXRoZXIgYmUgYSBib29sLCBvciBhbiBhcnJheSBvZiBzdG9yZSBuYW1lc3BhY2VzXG5cdFx0Ly8gZmlyc3QgY2hlY2sgaXMgZm9yIHRydXRoeVxuXHRcdGlmKGltbWVkaWF0ZSkge1xuXHRcdFx0Ly8gc2Vjb25kIGNoZWNrIGlzIGZvciBzdHJpY3QgYm9vbCBlcXVhbGl0eVxuXHRcdFx0aWYoaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdHZhciBsaXN0ZW5Ubztcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGxpc3RlblRvID0gdGhpcy5zdG9yZXMubGlzdGVuVG87XG5cdFx0XHRcdHN0b3JlcyA9IHR5cGVvZiBsaXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtsaXN0ZW5Ub10gOiBsaXN0ZW5Ubztcblx0XHRcdH1cblx0XHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gWy4uLnN0b3Jlc107XG5cdFx0XHRzdG9yZXMuZm9yRWFjaChcblx0XHRcdFx0KHN0b3JlKSA9PiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHR0b3BpYzogYG5vdGlmeS4ke3N0b3JlfWAsXG5cdFx0XHRcdFx0cmVwbHlDaGFubmVsOiBMVVhfQ0hBTk5FTFxuXHRcdFx0XHR9KS50aGVuKChkYXRhKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUsIGRhdGEpKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbnZhciBsdXhBY3Rpb25NaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpKSkge1xuXHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIGx1eFN0b3JlTWl4aW4ubWl4aW4pO1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdGNvbnRleHQuX19sdXhDbGVhbnVwLnB1c2goIGx1eFN0b3JlTWl4aW4udGVhcmRvd24gKTtcblx0fVxuXG5cdGlmICggY29udGV4dC5nZXRBY3Rpb25zRm9yICkge1xuXHRcdGx1eEFjdGlvbk1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0Y2hhbm5lbDogbHV4Q2gsXG5cdFx0U3RvcmUsXG5cdFx0Y3JlYXRlQ29udHJvbGxlclZpZXcsXG5cdFx0Y3JlYXRlQ29tcG9uZW50LFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdEFjdGlvbkNvb3JkaW5hdG9yLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3Jcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=