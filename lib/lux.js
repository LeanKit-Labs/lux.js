/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.3
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
            actionArgs: args,
            component: this.constructor && this.constructor.displayName,
            rootNodeID: this._rootNodeID
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
      var immediate = stores.hasOwnProperty("immediate") ? stores.immediate : true;
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
            replyChannel: LUX_CHANNEL,
            data: {
              component: $__0.constructor && $__0.constructor.displayName,
              rootNodeID: $__0._rootNodeID
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDMUQsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN0RDtBQUFBLEFBR0EsU0FBUyxNQUFJLENBQUUsT0FBTSxDQUFHO0FBQ3ZCLFVBQU0sYUFBYSxFQUFJLEdBQUMsQ0FBQztBQUV6QixPQUFLLE9BQU0sT0FBTyxDQUFJO0FBQ3JCLFdBQUssT0FBTyxBQUFDLENBQUMsT0FBTSxDQUFHLENBQUEsYUFBWSxNQUFNLENBQUMsQ0FBQztBQUMzQyxrQkFBWSxNQUFNLEtBQUssQUFBQyxDQUFFLE9BQU0sQ0FBRSxDQUFDO0FBQ25DLFlBQU0sYUFBYSxLQUFLLEFBQUMsQ0FBRSxhQUFZLFNBQVMsQ0FBRSxDQUFDO0lBQ3BEO0FBQUEsQUFFQSxPQUFLLE9BQU0sY0FBYyxDQUFJO0FBQzVCLG1CQUFhLE1BQU0sS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7SUFDckM7QUFBQSxBQUVBLFVBQU0sV0FBVyxFQUFJLGdCQUFjLENBQUM7RUFDckM7QUFBQSxBQUlDLE9BQU87QUFDTixVQUFNLENBQUcsTUFBSTtBQUNiLFFBQUksQ0FBSixNQUFJO0FBQ0osdUJBQW1CLENBQW5CLHFCQUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULFFBQUksQ0FBRyxNQUFJO0FBQ1gsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDbkIsQ0FBQztBQUdGLENBQUMsQ0FBQyxDQUFDO0FBQ0giLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbHV4LmpzIC0gRmx1eC1iYXNlZCBhcmNoaXRlY3R1cmUgZm9yIHVzaW5nIFJlYWN0SlMgYXQgTGVhbktpdFxuICogQXV0aG9yOiBKaW0gQ293YXJ0XG4gKiBWZXJzaW9uOiB2MC4yLjNcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsLnJlcXVlc3QtcmVzcG9uc2VcIiwgXCJtYWNoaW5hXCIsIFwid2hlblwiLCBcIndoZW4ucGlwZWxpbmVcIiwgXCJ3aGVuLnBhcmFsbGVsXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdHJlcXVpcmUoXCJ0cmFjZXVyXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwicmVhY3RcIiksXG5cdFx0XHRcdHBvc3RhbCxcblx0XHRcdFx0bWFjaGluYSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW5cIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9wYXJhbGxlbFwiKSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCB3aGVuLCBwaXBlbGluZSwgcGFyYWxsZWwgKSB7XG5cblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgZGVmZXJyZWQgaW5zdGFuY2UgZnJvbSB3aGVuLmpzXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuY3JlYXRlRGVmZXJyZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gd2hlbi5kZWZlcigpO1xuXHR9O1xuXHQvLyBXZSBuZWVkIHRvIHRlbGwgcG9zdGFsIGhvdyB0byBnZXQgYSBcInB1YmxpYy1mYWNpbmdcIi9zYWZlIHByb21pc2UgaW5zdGFuY2Vcblx0cG9zdGFsLmNvbmZpZ3VyYXRpb24ucHJvbWlzZS5nZXRQcm9taXNlID0gZnVuY3Rpb24oIGRmZCApIHtcblx0XHRyZXR1cm4gZGZkLnByb21pc2U7XG5cdH07XG5cblx0dmFyIExVWF9DSEFOTkVMID0gXCJsdXhcIjtcblx0dmFyIGx1eENoID0gcG9zdGFsLmNoYW5uZWwoIExVWF9DSEFOTkVMICk7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcblx0dmFyIGFjdGlvbkNyZWF0b3IgPSB7fTtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGFjdGlvbkNyZWF0b3JbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IFwiYWN0aW9uXCIsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJncyxcblx0XHRcdFx0XHRjb21wb25lbnQ6IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZSxcblx0XHRcdFx0XHRyb290Tm9kZUlEOiB0aGlzLl9yb290Tm9kZUlEXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdH0pO1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuXHR0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gd2hlbihoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KFtkYXRhLmRlcHNdKSkpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0ZnVuY3Rpb24oeCl7IHJldHVybiBbbnVsbCwgeF07IH0sXG5cdFx0XHRcdGZ1bmN0aW9uKGVycil7IHJldHVybiBbZXJyXTsgfVxuXHRcdFx0KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnJvciA9IHZhbHVlc1swXTtcblx0XHRcdFx0aWYoZXJyb3IgJiYgdHlwZW9mIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0LCBzdG9yZS5oYW5kbGVBY3Rpb25FcnJvcihrZXksIGVycm9yKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXMgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnIgPSB2YWx1ZXNbMF07XG5cdFx0XHRcdHJldHVybiB3aGVuKHtcblx0XHRcdFx0XHRoYXNDaGFuZ2VkOiBzdG9yZS5oYXNDaGFuZ2VkLFxuXHRcdFx0XHRcdHJlc3VsdDogcmVzLFxuXHRcdFx0XHRcdGVycm9yOiBlcnIsXG5cdFx0XHRcdFx0c3RhdGU6IHN0b3JlLmdldFN0YXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbnZhciBzdG9yZXMgPSB7fTtcblxuY2xhc3MgU3RvcmUge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0fVxuXHRcdHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcblx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgb3B0aW9ucy5oYW5kbGVycyk7XG5cdFx0YWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykpO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0dGhpcy5zdGF0ZSA9IG9wdGlvbnMuc3RhdGUgfHwge307XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBkaXNwYXRjaC4ke25hbWVzcGFjZX1gLCB0aGlzLmhhbmRsZVBheWxvYWQpKSxcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IHRoaXMuaW5EaXNwYXRjaCksXG5cdFx0XHRzY29wZWROb3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdGBub3RpZnkuJHtuYW1lc3BhY2V9YCxcblx0XHRcdFx0XHQoZGF0YSwgZW52KSA9PiBlbnYucmVwbHkobnVsbCwgeyBjaGFuZ2VkS2V5czogW10sIHN0YXRlOiB0aGlzLnN0YXRlIH0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHR9O1xuXHRcdGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG5cdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHR9KTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHR9XG5cblx0Z2V0U3RhdGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhdGU7XG5cdH1cblxuXHRzZXRTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKSk7XG5cdH1cblxuXHRyZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gbmV3U3RhdGUpO1xuXHR9XG5cblx0Zmx1c2goKSB7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHR2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcblx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0bHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgeyBjaGFuZ2VkS2V5cywgc3RhdGU6IHRoaXMuc3RhdGUgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGx1eENoLnB1Ymxpc2goYG5vY2hhbmdlLiR7dGhpcy5uYW1lc3BhY2V9YCk7XG5cdFx0fVxuXG5cdH1cblxuXHRoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuXHRcdGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cblx0XHRcdFx0LmNhbGwodGhpcywgZGF0YSlcblx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0KHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgcmVzdWx0KSxcblx0XHRcdFx0XHQoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG5cdFx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRhY2N1bVtrZXldID0gb2JqW2tleV07XG5cdFx0cmV0dXJuIGFjY3VtO1xuXHR9LCB7fSk7XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRcdHJldHVybiAoKSA9PiBwYXJhbGxlbChcblx0XHRcdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHRcdFx0XHR9LCBhY3Rpb24pO1xuXHRcdFx0XHRcdHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHRcdHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcblx0XHRcdFx0XHRcdHJlcGx5Q2hhbm5lbDogTFVYX0NIQU5ORUwsXG5cdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gPSByZXNwb25zZTtcblx0XHRcdFx0XHRcdGlmKHJlc3BvbnNlLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goc3RvcmUubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblx0XHRcdH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcblx0fVxuXHQvKlxuXHRcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdFx0e1xuXHRcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdFx0YWN0aW9uIDoge1xuXHRcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge30sXG5cdFx0XHR1cGRhdGVkOiBbXVxuXHRcdH0sIGNvbmZpZyk7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0XHRwaXBlbGluZShcblx0XHRcdFx0XHRcdFx0XHRbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV1cblx0XHRcdFx0XHRcdFx0KS50aGVuKGZ1bmN0aW9uKC4uLnJlc3VsdHMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXJyO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IHRoaXMudXBkYXRlZCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gc3RvcmVzO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJhY3Rpb25cIixcblx0XHRcdFx0XHRmdW5jdGlvbihkYXRhLCBlbnYpIHtcblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJyZWdpc3RlclwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRdO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcblx0fVxuXG5cdGhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eENsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eENsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4Q2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSBkYXRhO1xuXG5cdHZhciBmb3VuZCA9IHRoaXMuX19sdXhXYWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggdGhpcy5fX2x1eFdhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0cGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oIHt9LCAuLi50aGlzLl9fbHV4SGVhcmRGcm9tKTtcblx0XHRcdHRoaXMuX19sdXhIZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4V2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBpbW1lZGlhdGUgPSBzdG9yZXMuaGFzT3duUHJvcGVydHkoXCJpbW1lZGlhdGVcIikgPyBzdG9yZXMuaW1tZWRpYXRlIDogdHJ1ZTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdG9yZXMpIHtcblx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0U3RhdGUgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge307XG5cdFx0XHRcdGZvciggdmFyIFtrLHZdIG9mIGVudHJpZXMoc3RvcmVzKSApIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVsgayBdID0gdi5zdGF0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKCBuZXdTdGF0ZSApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3IgPSBbXTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tID0gW107XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoYG5vdGlmaWNhdGlvbi4ke3N0b3JlfWAsIChkYXRhKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUsIGRhdGEpKVxuXHRcdCkpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKVxuXHRcdCk7XG5cdFx0Ly8gaW1tZWRpYXRlIGNhbiBlaXRoZXIgYmUgYSBib29sLCBvciBhbiBhcnJheSBvZiBzdG9yZSBuYW1lc3BhY2VzXG5cdFx0Ly8gZmlyc3QgY2hlY2sgaXMgZm9yIHRydXRoeVxuXHRcdGlmKGltbWVkaWF0ZSkge1xuXHRcdFx0Ly8gc2Vjb25kIGNoZWNrIGlzIGZvciBzdHJpY3QgYm9vbCBlcXVhbGl0eVxuXHRcdFx0aWYoaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdHZhciBsaXN0ZW5Ubztcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGxpc3RlblRvID0gdGhpcy5zdG9yZXMubGlzdGVuVG87XG5cdFx0XHRcdHN0b3JlcyA9IHR5cGVvZiBsaXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtsaXN0ZW5Ub10gOiBsaXN0ZW5Ubztcblx0XHRcdH1cblx0XHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gWy4uLnN0b3Jlc107XG5cdFx0XHRzdG9yZXMuZm9yRWFjaChcblx0XHRcdFx0KHN0b3JlKSA9PiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHR0b3BpYzogYG5vdGlmeS4ke3N0b3JlfWAsXG5cdFx0XHRcdFx0cmVwbHlDaGFubmVsOiBMVVhfQ0hBTk5FTCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRjb21wb25lbnQ6IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZSxcblx0XHRcdFx0XHRcdHJvb3ROb2RlSUQ6IHRoaXMuX3Jvb3ROb2RlSURcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLnRoZW4oKGRhdGEpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSwgZGF0YSkpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxudmFyIGx1eEFjdGlvbk1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcblx0XHR0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uQ3JlYXRvckZvcihzdG9yZSkpKSB7XG5cdFx0XHRcdHRoaXNba10gPSB2O1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25SZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbk1peGluLnNldHVwXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQpIHtcblx0Y29udGV4dC5fX2x1eENsZWFudXAgPSBbXTtcblxuXHRpZiAoIGNvbnRleHQuc3RvcmVzICkge1xuXHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbHV4U3RvcmVNaXhpbi5taXhpbik7XG5cdFx0bHV4U3RvcmVNaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0Y29udGV4dC5fX2x1eENsZWFudXAucHVzaCggbHV4U3RvcmVNaXhpbi50ZWFyZG93biApO1xuXHR9XG5cblx0aWYgKCBjb250ZXh0LmdldEFjdGlvbnNGb3IgKSB7XG5cdFx0bHV4QWN0aW9uTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHR9XG5cblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xufVxuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRjaGFubmVsOiBsdXhDaCxcblx0XHRTdG9yZSxcblx0XHRjcmVhdGVDb250cm9sbGVyVmlldyxcblx0XHRjcmVhdGVDb21wb25lbnQsXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0QWN0aW9uQ29vcmRpbmF0b3IsXG5cdFx0Z2V0QWN0aW9uQ3JlYXRvckZvclxuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==