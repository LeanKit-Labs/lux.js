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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUFDO0FBQ0giLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbHV4LmpzIC0gRmx1eC1iYXNlZCBhcmNoaXRlY3R1cmUgZm9yIHVzaW5nIFJlYWN0SlMgYXQgTGVhbktpdFxuICogQXV0aG9yOiBKaW0gQ293YXJ0XG4gKiBWZXJzaW9uOiB2MC4yLjNcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsLnJlcXVlc3QtcmVzcG9uc2VcIiwgXCJtYWNoaW5hXCIsIFwid2hlblwiLCBcIndoZW4ucGlwZWxpbmVcIiwgXCJ3aGVuLnBhcmFsbGVsXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdHJlcXVpcmUoXCJ0cmFjZXVyXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwicmVhY3RcIiksXG5cdFx0XHRcdHBvc3RhbCxcblx0XHRcdFx0bWFjaGluYSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW5cIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9wYXJhbGxlbFwiKSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCB3aGVuLCBwaXBlbGluZSwgcGFyYWxsZWwgKSB7XG5cblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgZGVmZXJyZWQgaW5zdGFuY2UgZnJvbSB3aGVuLmpzXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuY3JlYXRlRGVmZXJyZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gd2hlbi5kZWZlcigpO1xuXHR9O1xuXHQvLyBXZSBuZWVkIHRvIHRlbGwgcG9zdGFsIGhvdyB0byBnZXQgYSBcInB1YmxpYy1mYWNpbmdcIi9zYWZlIHByb21pc2UgaW5zdGFuY2Vcblx0cG9zdGFsLmNvbmZpZ3VyYXRpb24ucHJvbWlzZS5nZXRQcm9taXNlID0gZnVuY3Rpb24oIGRmZCApIHtcblx0XHRyZXR1cm4gZGZkLnByb21pc2U7XG5cdH07XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcblx0dmFyIGFjdGlvbkNyZWF0b3IgPSB7fTtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGFjdGlvbkNyZWF0b3JbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzLFxuXHRcdFx0XHRcdGNvbXBvbmVudDogdGhpcy5jb25zdHJ1Y3RvciAmJiB0aGlzLmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lLFxuXHRcdFx0XHRcdHJvb3ROb2RlSUQ6IHRoaXMuX3Jvb3ROb2RlSURcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fSk7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRmdW5jdGlvbih4KXsgcmV0dXJuIFtudWxsLCB4XTsgfSxcblx0XHRcdFx0ZnVuY3Rpb24oZXJyKXsgcmV0dXJuIFtlcnJdOyB9XG5cdFx0XHQpLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVycm9yID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRpZihlcnJvciAmJiB0eXBlb2Ygc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQsIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yKGtleSwgZXJyb3IpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlcyA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVyciA9IHZhbHVlc1swXTtcblx0XHRcdFx0cmV0dXJuIHdoZW4oe1xuXHRcdFx0XHRcdGhhc0NoYW5nZWQ6IHN0b3JlLmhhc0NoYW5nZWQsXG5cdFx0XHRcdFx0cmVzdWx0OiByZXMsXG5cdFx0XHRcdFx0ZXJyb3I6IGVycixcblx0XHRcdFx0XHRzdGF0ZTogc3RvcmUuZ2V0U3RhdGUoKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFvcHRpb25zLmhhbmRsZXJzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG5cdH1cbn1cblxudmFyIHN0b3JlcyA9IHt9O1xuXG5jbGFzcyBTdG9yZSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucyk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuXHRcdGlmIChuYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHR9XG5cdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IFtdO1xuXHRcdHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBvcHRpb25zLmhhbmRsZXJzKTtcblx0XHRhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhvcHRpb25zLmhhbmRsZXJzKSk7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHR0aGlzLnN0YXRlID0gb3B0aW9ucy5zdGF0ZSB8fCB7fTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0ZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcblx0XHRcdGdldFN0YXRlOiBjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0YCR7bmFtZXNwYWNlfS5zdGF0ZWAsXG5cdFx0XHRcdFx0KGRhdGEsIGVudikgPT4gZW52LnJlcGx5KG51bGwsIHsgY2hhbmdlZEtleXM6IFtdLCBzdGF0ZTogdGhpcy5zdGF0ZSB9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0fTtcblx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChcInJlZ2lzdGVyXCIsIHtcblx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChvcHRpb25zLmhhbmRsZXJzKVxuXHRcdH0pO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cblxuXHRnZXRTdGF0ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZTtcblx0fVxuXG5cdHNldFN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiAodGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpKTtcblx0fVxuXG5cdHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBuZXdTdGF0ZSk7XG5cdH1cblxuXHRmbHVzaCgpIHtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IHt9O1xuXHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGAsIHsgY2hhbmdlZEtleXMsIHN0YXRlOiB0aGlzLnN0YXRlIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0udW5jaGFuZ2VkYCk7XG5cdFx0fVxuXG5cdH1cblxuXHRoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuXHRcdGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cblx0XHRcdFx0LmNhbGwodGhpcywgZGF0YSlcblx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0KHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgcmVzdWx0KSxcblx0XHRcdFx0XHQoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG5cdFx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRhY2N1bVtrZXldID0gb2JqW2tleV07XG5cdFx0cmV0dXJuIGFjY3VtO1xuXHR9LCB7fSk7XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRcdHJldHVybiAoKSA9PiBwYXJhbGxlbChcblx0XHRcdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHRcdFx0XHR9LCBhY3Rpb24pO1xuXHRcdFx0XHRcdHJldHVybiBkaXNwYXRjaGVyQ2hhbm5lbC5yZXF1ZXN0KHtcblx0XHRcdFx0XHRcdHRvcGljOiBgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHRyZXBseUNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLmNoYW5uZWwsXG5cdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gPSByZXNwb25zZTtcblx0XHRcdFx0XHRcdGlmKHJlc3BvbnNlLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goc3RvcmUubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblx0XHRcdH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcblx0fVxuXHQvKlxuXHRcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdFx0e1xuXHRcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdFx0YWN0aW9uIDoge1xuXHRcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge30sXG5cdFx0XHR1cGRhdGVkOiBbXVxuXHRcdH0sIGNvbmZpZyk7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0XHRwaXBlbGluZShcblx0XHRcdFx0XHRcdFx0XHRbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV1cblx0XHRcdFx0XHRcdFx0KS50aGVuKGZ1bmN0aW9uKC4uLnJlc3VsdHMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXJyO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IHRoaXMudXBkYXRlZCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gc3RvcmVzO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJyZWdpc3RlclwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRdO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcblx0fVxuXG5cdGhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IGRhdGE7XG5cblx0dmFyIGZvdW5kID0gdGhpcy5fX2x1eFdhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCB0aGlzLl9fbHV4V2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRwYXlsb2FkID0gT2JqZWN0LmFzc2lnbigge30sIC4uLnRoaXMuX19sdXhIZWFyZEZyb20pO1xuXHRcdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXhXYWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGltbWVkaWF0ZSA9IHN0b3Jlcy5oYXNPd25Qcm9wZXJ0eShcImltbWVkaWF0ZVwiKSA/IHN0b3Jlcy5pbW1lZGlhdGUgOiB0cnVlO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uKHN0b3Jlcykge1xuXHRcdFx0aWYgKCB0eXBlb2YgdGhpcy5zZXRTdGF0ZSA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0XHR2YXIgbmV3U3RhdGUgPSB7fTtcblx0XHRcdFx0Zm9yKCB2YXIgW2ssdl0gb2YgZW50cmllcyhzdG9yZXMpICkge1xuXHRcdFx0XHRcdG5ld1N0YXRlWyBrIF0gPSB2LnN0YXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoIG5ld1N0YXRlICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLl9fbHV4V2FpdEZvciA9IFtdO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20gPSBbXTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXI7XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKChzdG9yZSkgPT4gdGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcblx0XHRcdHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoZGF0YSkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlLCBkYXRhKSlcblx0XHQpKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSlcblx0XHQpO1xuXHRcdC8vIGltbWVkaWF0ZSBjYW4gZWl0aGVyIGJlIGEgYm9vbCwgb3IgYW4gYXJyYXkgb2Ygc3RvcmUgbmFtZXNwYWNlc1xuXHRcdC8vIGZpcnN0IGNoZWNrIGlzIGZvciB0cnV0aHlcblx0XHRpZihpbW1lZGlhdGUpIHtcblx0XHRcdC8vIHNlY29uZCBjaGVjayBpcyBmb3Igc3RyaWN0IGJvb2wgZXF1YWxpdHlcblx0XHRcdGlmKGltbWVkaWF0ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGUoLi4uaW1tZWRpYXRlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViKSA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0bG9hZFN0YXRlOiBmdW5jdGlvbiAoLi4uc3RvcmVzKSB7XG5cdFx0XHR2YXIgbGlzdGVuVG87XG5cdFx0XHRpZighc3RvcmVzLmxlbmd0aCkge1xuXHRcdFx0XHRsaXN0ZW5UbyA9IHRoaXMuc3RvcmVzLmxpc3RlblRvO1xuXHRcdFx0XHRzdG9yZXMgPSB0eXBlb2YgbGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbbGlzdGVuVG9dIDogbGlzdGVuVG87XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9fbHV4V2FpdEZvciA9IFsuLi5zdG9yZXNdO1xuXHRcdFx0c3RvcmVzLmZvckVhY2goXG5cdFx0XHRcdChzdG9yZSkgPT4gc3RvcmVDaGFubmVsLnJlcXVlc3Qoe1xuXHRcdFx0XHRcdHRvcGljOiBgJHtzdG9yZX0uc3RhdGVgLFxuXHRcdFx0XHRcdHJlcGx5Q2hhbm5lbDogc3RvcmVDaGFubmVsLmNoYW5uZWwsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50OiB0aGlzLmNvbnN0cnVjdG9yICYmIHRoaXMuY29uc3RydWN0b3IuZGlzcGxheU5hbWUsXG5cdFx0XHRcdFx0XHRyb290Tm9kZUlEOiB0aGlzLl9yb290Tm9kZUlEXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS50aGVuKChkYXRhKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUsIGRhdGEpKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbnZhciBsdXhBY3Rpb25NaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpKSkge1xuXHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIGx1eFN0b3JlTWl4aW4ubWl4aW4pO1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdGNvbnRleHQuX19sdXhDbGVhbnVwLnB1c2goIGx1eFN0b3JlTWl4aW4udGVhcmRvd24gKTtcblx0fVxuXG5cdGlmICggY29udGV4dC5nZXRBY3Rpb25zRm9yICkge1xuXHRcdGx1eEFjdGlvbk1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0U3RvcmUsXG5cdFx0Y3JlYXRlQ29udHJvbGxlclZpZXcsXG5cdFx0Y3JlYXRlQ29tcG9uZW50LFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdEFjdGlvbkNvb3JkaW5hdG9yLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3Jcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=