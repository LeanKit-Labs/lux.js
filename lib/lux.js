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
  var actionChannel = postal.channel("lux.action");
  var storeChannel = postal.channel("lux.store");
  var dispatcherChannel = postal.channel("lux.dispatcher");
  function entries(obj) {
    var $__5,
        $__6,
        k;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            if (typeof obj !== "object") {
              obj = {};
            }
            $ctx.state = 10;
            break;
          case 10:
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
        actionChannel.publish({
          topic: ("execute." + action),
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
      dispatch: configSubscription(this, dispatcherChannel.subscribe((namespace + ".handle.*"), this.handlePayload)),
      notify: configSubscription(this, dispatcherChannel.subscribe("notify", this.flush)).withConstraint((function() {
        return $__0.inDispatch;
      })),
      getState: configSubscription(this, storeChannel.subscribe((namespace + ".state"), (function(data, env) {
        return env.reply(null, {
          changedKeys: [],
          state: $__0.state
        });
      })))
    };
    storeChannel.publish("register", {
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
        storeChannel.publish((this.namespace + ".changed"), {
          changedKeys: changedKeys,
          state: this.state
        });
      } else {
        storeChannel.publish((this.namespace + ".unchanged"));
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
          return dispatcherChannel.request({
            topic: (store.namespace + ".handle." + action.actionType),
            replyChannel: dispatcherChannel.channel,
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
            dispatcherChannel.publish("prenotify", {stores: this.updated});
          }
        },
        success: {_onEnter: function() {
            dispatcherChannel.publish("notify", {action: this.action});
            this.emit("success");
          }},
        failure: {_onEnter: function() {
            dispatcherChannel.publish("notify", {action: this.action});
            dispatcherChannel.publish("action.failure", {
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
    this.__subscriptions = [configSubscription(this, actionChannel.subscribe("execute.*", function(data, env) {
      this.handleActionDispatch(data);
    })), configSubscription(this, storeChannel.subscribe("register", function(data, env) {
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
        return $__0.__subscriptions.push(storeChannel.subscribe((store + ".changed"), (function(data) {
          return gateKeeper.call($__0, store, data);
        })));
      }));
      this.__subscriptions.push(dispatcherChannel.subscribe("prenotify", (function(data) {
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
          return storeChannel.request({
            topic: (store + ".state"),
            replyChannel: storeChannel.channel,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUEsRUFDbkIsQ0FBQztBQUdGLENBQUMsQ0FBQyxDQUFDO0FBQ0giLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbHV4LmpzIC0gRmx1eC1iYXNlZCBhcmNoaXRlY3R1cmUgZm9yIHVzaW5nIFJlYWN0SlMgYXQgTGVhbktpdFxuICogQXV0aG9yOiBKaW0gQ293YXJ0XG4gKiBWZXJzaW9uOiB2MC4yLjNcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsLnJlcXVlc3QtcmVzcG9uc2VcIiwgXCJtYWNoaW5hXCIsIFwid2hlblwiLCBcIndoZW4ucGlwZWxpbmVcIiwgXCJ3aGVuLnBhcmFsbGVsXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdHJlcXVpcmUoXCJ0cmFjZXVyXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwicmVhY3RcIiksXG5cdFx0XHRcdHBvc3RhbCxcblx0XHRcdFx0bWFjaGluYSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW5cIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9wYXJhbGxlbFwiKSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCB3aGVuLCBwaXBlbGluZSwgcGFyYWxsZWwgKSB7XG5cblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgZGVmZXJyZWQgaW5zdGFuY2UgZnJvbSB3aGVuLmpzXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuY3JlYXRlRGVmZXJyZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gd2hlbi5kZWZlcigpO1xuXHR9O1xuXHQvLyBXZSBuZWVkIHRvIHRlbGwgcG9zdGFsIGhvdyB0byBnZXQgYSBcInB1YmxpYy1mYWNpbmdcIi9zYWZlIHByb21pc2UgaW5zdGFuY2Vcblx0cG9zdGFsLmNvbmZpZ3VyYXRpb24ucHJvbWlzZS5nZXRQcm9taXNlID0gZnVuY3Rpb24oIGRmZCApIHtcblx0XHRyZXR1cm4gZGZkLnByb21pc2U7XG5cdH07XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGlmKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcblx0XHRcdG9iaiA9IHt9O1xuXHRcdH1cblx0XHRmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuXHRcdFx0eWllbGQgW2ssIG9ialtrXV07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdFxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3JzW3N0b3JlXTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShhY3Rpb25MaXN0KSB7XG5cdHZhciBhY3Rpb25DcmVhdG9yID0ge307XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJncyxcblx0XHRcdFx0XHRjb21wb25lbnQ6IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZSxcblx0XHRcdFx0XHRyb290Tm9kZUlEOiB0aGlzLl9yb290Tm9kZUlEXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdH0pO1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuXHR0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gd2hlbihoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KFtkYXRhLmRlcHNdKSkpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0ZnVuY3Rpb24oeCl7IHJldHVybiBbbnVsbCwgeF07IH0sXG5cdFx0XHRcdGZ1bmN0aW9uKGVycil7IHJldHVybiBbZXJyXTsgfVxuXHRcdFx0KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnJvciA9IHZhbHVlc1swXTtcblx0XHRcdFx0aWYoZXJyb3IgJiYgdHlwZW9mIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0LCBzdG9yZS5oYW5kbGVBY3Rpb25FcnJvcihrZXksIGVycm9yKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXMgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnIgPSB2YWx1ZXNbMF07XG5cdFx0XHRcdHJldHVybiB3aGVuKHtcblx0XHRcdFx0XHRoYXNDaGFuZ2VkOiBzdG9yZS5oYXNDaGFuZ2VkLFxuXHRcdFx0XHRcdHJlc3VsdDogcmVzLFxuXHRcdFx0XHRcdGVycm9yOiBlcnIsXG5cdFx0XHRcdFx0c3RhdGU6IHN0b3JlLmdldFN0YXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbnZhciBzdG9yZXMgPSB7fTtcblxuY2xhc3MgU3RvcmUge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0fVxuXHRcdHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcblx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgb3B0aW9ucy5oYW5kbGVycyk7XG5cdFx0YWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykpO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0dGhpcy5zdGF0ZSA9IG9wdGlvbnMuc3RhdGUgfHwge307XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKGAke25hbWVzcGFjZX0uaGFuZGxlLipgLCB0aGlzLmhhbmRsZVBheWxvYWQpKSxcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IHRoaXMuaW5EaXNwYXRjaCksXG5cdFx0XHRnZXRTdGF0ZTogY29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdGAke25hbWVzcGFjZX0uc3RhdGVgLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IGVudi5yZXBseShudWxsLCB7IGNoYW5nZWRLZXlzOiBbXSwgc3RhdGU6IHRoaXMuc3RhdGUgfSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdH07XG5cdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG5cdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHR9KTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHR9XG5cblx0Z2V0U3RhdGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhdGU7XG5cdH1cblxuXHRzZXRTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKSk7XG5cdH1cblxuXHRyZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gbmV3U3RhdGUpO1xuXHR9XG5cblx0Zmx1c2goKSB7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHR2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcblx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgLCB7IGNoYW5nZWRLZXlzLCBzdGF0ZTogdGhpcy5zdGF0ZSB9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goYCR7dGhpcy5uYW1lc3BhY2V9LnVuY2hhbmdlZGApO1xuXHRcdH1cblxuXHR9XG5cblx0aGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcblx0XHRpZiAodGhpcy5hY3Rpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG5cdFx0XHR0aGlzLmluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0dGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG5cdFx0XHRcdC5jYWxsKHRoaXMsIGRhdGEpXG5cdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHJlc3VsdCksXG5cdFx0XHRcdFx0KGVycikgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuXHRcdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5mdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0dmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG5cdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdHJldHVybiBhY2N1bTtcblx0fSwge30pO1xuXHRyZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0XHRyZXR1cm4gKCkgPT4gcGFyYWxsZWwoXG5cdFx0XHRnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcblx0XHRcdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0XHRcdFx0ZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG5cdFx0XHRcdFx0fSwgYWN0aW9uKTtcblx0XHRcdFx0XHRyZXR1cm4gZGlzcGF0Y2hlckNoYW5uZWwucmVxdWVzdCh7XG5cdFx0XHRcdFx0XHR0b3BpYzogYCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0cmVwbHlDaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbC5jaGFubmVsLFxuXHRcdFx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0XHRcdH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gcmVzcG9uc2U7XG5cdFx0XHRcdFx0XHRpZihyZXNwb25zZS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKHN0b3JlLm5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9KSkudGhlbigoKSA9PiB0aGlzLnN0b3Jlcyk7XG5cdH1cblx0Lypcblx0XHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuXHRcdHtcblx0XHRcdGdlbmVyYXRpb25zOiBbXSxcblx0XHRcdGFjdGlvbiA6IHtcblx0XHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdFx0YWN0aW9uQXJnczogW11cblx0XHRcdH1cblx0XHR9XG5cdCovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCB7XG5cdFx0XHRnZW5lcmF0aW9uSW5kZXg6IDAsXG5cdFx0XHRzdG9yZXM6IHt9LFxuXHRcdFx0dXBkYXRlZDogW11cblx0XHR9LCBjb25maWcpO1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdFx0cGlwZWxpbmUoXG5cdFx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildXG5cdFx0XHRcdFx0XHRcdCkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmVyciA9IGVycjtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN1Y2Nlc3M6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZmFpbHVyZToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJhY3Rpb24uZmFpbHVyZVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGVycjogdGhpcy5lcnJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRzdWNjZXNzKGZuKSB7XG5cdFx0dGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRmYWlsdXJlKGZuKSB7XG5cdFx0dGhpcy5vbihcImVycm9yXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbikge1xuXHRnZW4gPSBnZW4gfHwgMDtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG5cdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuXHRmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcblx0XHR0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuXHRcdHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogYWN0aW9uTWV0YVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG5cdFx0XHRcdFx0XHRcdGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW3RoaXMubHV4QWN0aW9uLmFjdGlvbi5hY3Rpb25UeXBlXTtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLnN0b3JlcyA9IHN0b3Jlcztcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zID0gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCA/IFwiZGlzcGF0Y2hpbmdcIiA6IFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcblx0XHRcdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb29yZGluYXRvclxuXHRcdFx0XHRcdFx0XHQuc3VjY2VzcygoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcblx0XHRcdFx0XHRcdFx0LmZhaWx1cmUoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3RvcHBlZDoge31cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJleGVjdXRlLipcIixcblx0XHRcdFx0XHRmdW5jdGlvbihkYXRhLCBlbnYpIHtcblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwicmVnaXN0ZXJcIixcblx0XHRcdFx0XHRmdW5jdGlvbihkYXRhLCBlbnYpIHtcblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG5cdH1cblxuXHRoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgZGF0YSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cblxudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eENsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eENsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4Q2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSBkYXRhO1xuXG5cdHZhciBmb3VuZCA9IHRoaXMuX19sdXhXYWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggdGhpcy5fX2x1eFdhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0cGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oIHt9LCAuLi50aGlzLl9fbHV4SGVhcmRGcm9tKTtcblx0XHRcdHRoaXMuX19sdXhIZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4V2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBpbW1lZGlhdGUgPSBzdG9yZXMuaGFzT3duUHJvcGVydHkoXCJpbW1lZGlhdGVcIikgPyBzdG9yZXMuaW1tZWRpYXRlIDogdHJ1ZTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdG9yZXMpIHtcblx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0U3RhdGUgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge307XG5cdFx0XHRcdGZvciggdmFyIFtrLHZdIG9mIGVudHJpZXMoc3RvcmVzKSApIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVsgayBdID0gdi5zdGF0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKCBuZXdTdGF0ZSApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3IgPSBbXTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tID0gW107XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKGAke3N0b3JlfS5jaGFuZ2VkYCwgKGRhdGEpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSwgZGF0YSkpXG5cdFx0KSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcblx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcInByZW5vdGlmeVwiLCAoZGF0YSkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwodGhpcywgZGF0YSkpXG5cdFx0KTtcblx0XHQvLyBpbW1lZGlhdGUgY2FuIGVpdGhlciBiZSBhIGJvb2wsIG9yIGFuIGFycmF5IG9mIHN0b3JlIG5hbWVzcGFjZXNcblx0XHQvLyBmaXJzdCBjaGVjayBpcyBmb3IgdHJ1dGh5XG5cdFx0aWYoaW1tZWRpYXRlKSB7XG5cdFx0XHQvLyBzZWNvbmQgY2hlY2sgaXMgZm9yIHN0cmljdCBib29sIGVxdWFsaXR5XG5cdFx0XHRpZihpbW1lZGlhdGUgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGUoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKC4uLmltbWVkaWF0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YikgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuXHR9LFxuXHRtaXhpbjoge1xuXHRcdGxvYWRTdGF0ZTogZnVuY3Rpb24gKC4uLnN0b3Jlcykge1xuXHRcdFx0dmFyIGxpc3RlblRvO1xuXHRcdFx0aWYoIXN0b3Jlcy5sZW5ndGgpIHtcblx0XHRcdFx0bGlzdGVuVG8gPSB0aGlzLnN0b3Jlcy5saXN0ZW5Ubztcblx0XHRcdFx0c3RvcmVzID0gdHlwZW9mIGxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW2xpc3RlblRvXSA6IGxpc3RlblRvO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fX2x1eFdhaXRGb3IgPSBbLi4uc3RvcmVzXTtcblx0XHRcdHN0b3Jlcy5mb3JFYWNoKFxuXHRcdFx0XHQoc3RvcmUpID0+IHN0b3JlQ2hhbm5lbC5yZXF1ZXN0KHtcblx0XHRcdFx0XHR0b3BpYzogYCR7c3RvcmV9LnN0YXRlYCxcblx0XHRcdFx0XHRyZXBseUNoYW5uZWw6IHN0b3JlQ2hhbm5lbC5jaGFubmVsLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGNvbXBvbmVudDogdGhpcy5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lLFxuXHRcdFx0XHRcdFx0cm9vdE5vZGVJRDogdGhpcy5fcm9vdE5vZGVJRFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkudGhlbigoZGF0YSkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlLCBkYXRhKSlcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG52YXIgbHV4QWN0aW9uTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpKSkge1xuXHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIGx1eFN0b3JlTWl4aW4ubWl4aW4pO1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdGNvbnRleHQuX19sdXhDbGVhbnVwLnB1c2goIGx1eFN0b3JlTWl4aW4udGVhcmRvd24gKTtcblx0fVxuXG5cdGlmICggY29udGV4dC5nZXRBY3Rpb25zRm9yICkge1xuXHRcdGx1eEFjdGlvbk1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0U3RvcmUsXG5cdFx0Y3JlYXRlQ29udHJvbGxlclZpZXcsXG5cdFx0Y3JlYXRlQ29tcG9uZW50LFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdEFjdGlvbkNvb3JkaW5hdG9yLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3Jcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=