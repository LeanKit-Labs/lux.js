/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.3.0-RC1
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["traceur", "react", "postal", "machina"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = function(postal, machina, React) {
      return factory(require("traceur"), React || require("react"), postal, machina);
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}(this, function(traceur, React, postal, machina) {
  var $__11 = $traceurRuntime.initGeneratorFunction(entries);
  var actionChannel = postal.channel("lux.action");
  var storeChannel = postal.channel("lux.store");
  var dispatcherChannel = postal.channel("lux.dispatcher");
  var stores = {};
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
    }, $__11, this);
  }
  function pluck(obj, keys) {
    var res = keys.reduce((function(accum, key) {
      accum[key] = obj[key];
      return accum;
    }), {});
    return res;
  }
  function configSubscription(context, subscription) {
    return subscription.withContext(context).withConstraint(function(data, envelope) {
      return !(envelope.hasOwnProperty("originId")) || (envelope.originId === postal.instanceId());
    });
  }
  function ensureLuxProp(context) {
    var __lux = context.__lux = (context.__lux || {});
    var cleanup = __lux.cleanup = (__lux.cleanup || []);
    var subscriptions = __lux.subscriptions = (__lux.subscriptions || {});
    return __lux;
  }
  var actionCreators = Object.create(null);
  var actionGroups = {};
  function buildActionList(handlers) {
    var actionList = [];
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__9 = $__6.value,
          key = $__9[0],
          handler = $__9[1];
      {
        actionList.push({
          actionType: key,
          waitFor: handler.waitFor || []
        });
      }
    }
    return actionList;
  }
  function generateActionCreator(actionList) {
    actionList = (typeof actionList === "string") ? [actionList] : actionList;
    actionList.forEach(function(action) {
      if (!actionCreators[action]) {
        actionCreators[action] = function() {
          var args = Array.from(arguments);
          actionChannel.publish({
            topic: ("execute." + action),
            data: {
              actionType: action,
              actionArgs: args
            }
          });
        };
      }
    });
  }
  function getActionGroup(group) {
    return actionGroups[group] ? pluck(actionCreators, actionGroups[group]) : {};
  }
  function customActionCreator(action) {
    actionCreators = Object.assign(actionCreators, action);
  }
  function addToActionGroup(groupName, actions) {
    var group = actionGroups[groupName];
    if (!group) {
      group = actionGroups[groupName] = [];
    }
    actions = typeof actions === "string" ? [actions] : actions;
    actions.forEach(function(action) {
      if (group.indexOf(action) === -1) {
        group.push(action);
      }
    });
  }
  function gateKeeper(store, data) {
    var payload = {};
    payload[store] = true;
    var __lux = this.__lux;
    var found = __lux.waitFor.indexOf(store);
    if (found > -1) {
      __lux.waitFor.splice(found, 1);
      __lux.heardFrom.push(payload);
      if (__lux.waitFor.length === 0) {
        __lux.heardFrom = [];
        this.stores.onChange.call(this, payload);
      }
    } else {
      this.stores.onChange.call(this, payload);
    }
  }
  function handlePreNotify(data) {
    var $__0 = this;
    this.__lux.waitFor = data.stores.filter((function(item) {
      return $__0.stores.listenTo.indexOf(item) > -1;
    }));
  }
  var luxStoreMixin = {
    setup: function() {
      var $__0 = this;
      var __lux = ensureLuxProp(this);
      var stores = this.stores = (this.stores || {});
      var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
      var noChangeHandlerImplemented = function() {
        throw new Error(("A component was told to listen to the following store(s): " + listenTo + " but no onChange handler was implemented"));
      };
      __lux.waitFor = [];
      __lux.heardFrom = [];
      stores.onChange = stores.onChange || noChangeHandlerImplemented;
      listenTo.forEach((function(store) {
        __lux.subscriptions[(store + ".changed")] = storeChannel.subscribe((store + ".changed"), (function() {
          return gateKeeper.call($__0, store);
        }));
      }));
      __lux.subscriptions.prenotify = dispatcherChannel.subscribe("prenotify", (function(data) {
        return handlePreNotify.call($__0, data);
      }));
    },
    teardown: function() {
      for (var $__5 = entries(this.__lux.subscriptions)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__9 = $__6.value,
            key = $__9[0],
            sub = $__9[1];
        {
          var split;
          if (key === "prenotify" || (split = key.split(".") && split[1] === "changed")) {
            sub.unsubscribe();
          }
        }
      }
    },
    mixin: {}
  };
  var luxStoreReactMixin = {
    componentWillMount: luxStoreMixin.setup,
    loadState: luxStoreMixin.mixin.loadState,
    componentWillUnmount: luxStoreMixin.teardown
  };
  var luxActionDispatcherMixin = {setup: function() {
      var $__0 = this;
      this.getActionGroup = this.getActionGroup || [];
      this.getActions = this.getActions || [];
      var addActionIfNotPreset = (function(k, v) {
        if (!$__0[k]) {
          $__0[k] = v;
        }
      });
      this.getActionGroup.forEach((function(group) {
        for (var $__5 = entries(getActionGroup(group))[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var $__9 = $__6.value,
              k = $__9[0],
              v = $__9[1];
          {
            addActionIfNotPreset(k, v);
          }
        }
      }));
      if (this.getActions.length) {
        for (var $__5 = entries(pluck(actionCreators, this.getActions))[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var $__9 = $__6.value,
              key = $__9[0],
              val = $__9[1];
          {
            addActionIfNotPreset(key, val);
          }
        }
      }
    }};
  var luxActionDispatcherReactMixin = {componentWillMount: luxActionDispatcherMixin.setup};
  var luxActionListenerMixin = function() {
    var $__9 = arguments[0] !== (void 0) ? arguments[0] : {},
        handlers = $__9.handlers,
        handlerFn = $__9.handlerFn,
        context = $__9.context,
        channel = $__9.channel,
        topic = $__9.topic;
    return {
      setup: function() {
        context = context || this;
        var __lux = ensureLuxProp(context);
        var subs = __lux.subscriptions;
        handlers = handlers || context.handlers;
        channel = channel || actionChannel;
        topic = topic || "execute.*";
        handlerFn = handlerFn || ((function(data, env) {
          var handler;
          if (handler = handlers[data.actionType]) {
            handler.apply(context, data.actionArgs);
          }
        }));
        if (!handlers || (subs && subs.actionListener)) {
          return;
        }
        subs.actionListener = configSubscription(context, channel.subscribe(topic, handlerFn));
        generateActionCreator(Object.keys(handlers));
      },
      teardown: function() {
        this.__lux.subscriptions.actionListener.unsubscribe();
      }
    };
  };
  function controllerView(options) {
    var opt = {mixins: [luxStoreReactMixin, luxActionDispatcherReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function component(options) {
    var opt = {mixins: [luxActionDispatcherReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  var luxMixinCleanup = function() {
    var $__0 = this;
    this.__lux.cleanup.forEach((function(method) {
      return method.call($__0);
    }));
    this.__lux.cleanup = undefined;
    delete this.__lux.cleanup;
  };
  function mixin(context) {
    for (var mixins = [],
        $__7 = 1; $__7 < arguments.length; $__7++)
      mixins[$__7 - 1] = arguments[$__7];
    if (mixins.length === 0) {
      mixins = [luxStoreMixin, luxActionDispatcherMixin];
    }
    mixins.forEach((function(mixin) {
      if (typeof mixin === "function") {
        mixin = mixin();
      }
      if (mixin.mixin) {
        Object.assign(context, mixin.mixin);
      }
      mixin.setup.call(context);
      if (mixin.teardown) {
        context.__lux.cleanup.push(mixin.teardown);
      }
    }));
    context.luxCleanup = luxMixinCleanup;
  }
  mixin.store = luxStoreMixin;
  mixin.actionDispatcher = luxActionDispatcherMixin;
  mixin.actionListener = luxActionListenerMixin;
  function actionListener(target) {
    mixin(target, luxActionListenerMixin);
    return target;
  }
  function actionDispatcher(target) {
    mixin(target, luxActionDispatcherMixin);
    return target;
  }
  function transformHandler(store, target, key, handler) {
    target[key] = function() {
      var $__10;
      for (var args = [],
          $__8 = 0; $__8 < arguments.length; $__8++)
        args[$__8] = arguments[$__8];
      return ($__10 = handler).apply.apply($__10, $traceurRuntime.spread([store], args));
    };
  }
  function transformHandlers(store, handlers) {
    var target = {};
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__9 = $__6.value,
          key = $__9[0],
          handler = $__9[1];
      {
        transformHandler(store, target, key, typeof handler === "object" ? handler.handler : handler);
      }
    }
    return target;
  }
  function ensureStoreOptions(options) {
    if (options.namespace in stores) {
      throw new Error((" The store namespace \"" + options.namespace + "\" already exists."));
    }
    if (!options.namespace) {
      throw new Error("A lux store must have a namespace value provided");
    }
    if (!options.handlers) {
      throw new Error("A lux store must have action handler methods provided");
    }
  }
  var Store = function Store(options) {
    "use strict";
    ensureStoreOptions(options);
    var namespace = options.namespace;
    var stateProp = options.stateProp || "state";
    var state = options[stateProp] || {};
    var handlers = transformHandlers(this, options.handlers);
    stores[namespace] = this;
    delete options.handlers;
    delete options.state;
    Object.assign(this, options);
    var inDispatch = false;
    this.hasChanged = false;
    this.getState = function() {
      return state;
    };
    this.setState = function(newState) {
      if (!inDispatch) {
        throw new Error("setState can only be called during a dispatch cycle from a store action handler.");
      }
      state = Object.assign(state, newState);
    };
    this.flush = function flush() {
      inDispatch = false;
      if (this.hasChanged) {
        this.hasChanged = false;
        storeChannel.publish((this.namespace + ".changed"));
      }
    };
    mixin(this, luxActionListenerMixin({
      context: this,
      channel: dispatcherChannel,
      topic: (namespace + ".handle.*"),
      handlers: handlers,
      handlerFn: function(data, envelope) {
        if (handlers.hasOwnProperty(data.actionType)) {
          inDispatch = true;
          var res = handlers[data.actionType].call(this, data.actionArgs.concat(data.deps));
          this.hasChanged = (res === false) ? false : true;
          dispatcherChannel.publish((this.namespace + ".handled." + data.actionType), {
            hasChanged: this.hasChanged,
            namespace: this.namespace
          });
        }
      }.bind(this)
    }));
    this.__subscription = {notify: configSubscription(this, dispatcherChannel.subscribe("notify", this.flush)).withConstraint((function() {
        return inDispatch;
      }))};
    generateActionCreator(Object.keys(handlers));
    dispatcher.registerStore({
      namespace: namespace,
      actions: buildActionList(handlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__9 = $__6.value,
            k = $__9[0],
            subscription = $__9[1];
        {
          subscription.unsubscribe();
        }
      }
      delete stores[this.namespace];
    }}, {});
  function removeStore(namespace) {
    stores[namespace].dispose();
  }
  function processGeneration(generation, action) {
    var $__0 = this;
    generation.map((function(store) {
      var data = Object.assign({deps: pluck($__0.stores, store.waitFor)}, action);
      dispatcherChannel.publish((store.namespace + ".handle." + action.actionType), data);
    }));
  }
  var ActionCoordinator = function ActionCoordinator(config) {
    "use strict";
    var $__0 = this;
    Object.assign(this, {
      generationIndex: 0,
      stores: {},
      updated: []
    }, config);
    this.__subscriptions = {handled: dispatcherChannel.subscribe("*.handled.*", (function(data) {
        return $__0.handle("action.handled", data);
      }))};
    $traceurRuntime.superCall(this, $ActionCoordinator.prototype, "constructor", [{
      initialState: "uninitialized",
      states: {
        uninitialized: {start: "dispatching"},
        dispatching: {
          _onEnter: function() {
            var $__4 = this;
            try {
              (function() {
                var $__2 = 0,
                    $__3 = [];
                for (var $__5 = config.generations[Symbol.iterator](),
                    $__6; !($__6 = $__5.next()).done; ) {
                  var generation = $__6.value;
                  $__3[$__2++] = processGeneration.call($__4, generation, config.action);
                }
                return $__3;
              }());
            } catch (ex) {
              this.err = ex;
              console.log(ex);
              this.transition("failure");
            }
            this.transition("success");
          },
          "action.handled": function(data) {
            if (data.hasChanged) {
              this.updated.push(data.namespace);
            }
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
      var $__9 = $__6.value,
          key = $__9[0],
          item = $__9[1];
      {
        tree[item.gen] = tree[item.gen] || [];
        tree[item.gen].push(item);
      }
    }
    return tree;
  }
  var Dispatcher = function Dispatcher() {
    "use strict";
    var $__0 = this;
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
            var stores = this.luxAction.stores = this.actionMap[this.luxAction.action.actionType] || [];
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
    this.__subscriptions = [configSubscription(this, actionChannel.subscribe("execute.*", (function(data, env) {
      return $__0.handleActionDispatch(data);
    })))];
  };
  var $Dispatcher = Dispatcher;
  ($traceurRuntime.createClass)(Dispatcher, {
    handleActionDispatch: function(data, envelope) {
      "use strict";
      this.handle("action.dispatch", data);
    },
    registerStore: function(config) {
      "use strict";
      this.handle("register.store", config);
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
  return {
    actionCreators: actionCreators,
    addToActionGroup: addToActionGroup,
    component: component,
    controllerView: controllerView,
    customActionCreator: customActionCreator,
    dispatcher: dispatcher,
    getActionGroup: getActionGroup,
    actionDispatcher: actionDispatcher,
    actionListener: actionListener,
    mixin: mixin,
    removeStore: removeStore,
    Store: Store,
    stores: stores
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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LFdBQVM7QUFDVCxpQkFBYSxDQUFiLGVBQWE7QUFDYixtQkFBZSxDQUFmLGlCQUFlO0FBQ2YsaUJBQWEsQ0FBYixlQUFhO0FBQ2IsUUFBSSxDQUFHLE1BQUk7QUFDWCxjQUFVLENBQVYsWUFBVTtBQUNWLFFBQUksQ0FBSixNQUFJO0FBQ0osU0FBSyxDQUFMLE9BQUs7QUFBQSxFQUNOLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMy4wLVJDMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hLCBSZWFjdCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSApIHtcblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoY29udGV4dCkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoY29udGV4dC5fX2x1eCB8fCB7fSk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKF9fbHV4LmNsZWFudXAgfHwgW10pO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9IChfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9KTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHRcblxudmFyIGFjdGlvbkNyZWF0b3JzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoYWN0aW9uTGlzdCkge1xuXHRhY3Rpb25MaXN0ID0gKHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiKSA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRpZighYWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSkge1xuXHRcdFx0YWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRyZXR1cm4gYWN0aW9uR3JvdXBzW2dyb3VwXSA/IHBsdWNrKGFjdGlvbkNyZWF0b3JzLCBhY3Rpb25Hcm91cHNbZ3JvdXBdKSA6IHt9O1xufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25DcmVhdG9ycyA9IE9iamVjdC5hc3NpZ24oYWN0aW9uQ3JlYXRvcnMsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoZ3JvdXBOYW1lLCBhY3Rpb25zKSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdO1xuXHRpZighZ3JvdXApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdID0gW107XG5cdH1cblx0YWN0aW9ucyA9IHR5cGVvZiBhY3Rpb25zID09PSBcInN0cmluZ1wiID8gW2FjdGlvbnNdIDogYWN0aW9ucztcblx0YWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbil7XG5cdFx0aWYoZ3JvdXAuaW5kZXhPZihhY3Rpb24pID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goYWN0aW9uKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCh0aGlzKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgbm9DaGFuZ2VIYW5kbGVySW1wbGVtZW50ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGApO1xuXHRcdH07XG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpICYmIHNwbGl0WzFdID09PSBcImNoYW5nZWRcIiApKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gRGlzcGF0Y2hlciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZXQgPSAoaywgdikgPT4ge1xuXHRcdFx0aWYoIXRoaXNba10pIHtcblx0XHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKChncm91cCkgPT4ge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25Hcm91cChncm91cCkpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGssIHYpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmKHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGZvcih2YXIgW2tleSwgdmFsXSBvZiBlbnRyaWVzKHBsdWNrKGFjdGlvbkNyZWF0b3JzLCB0aGlzLmdldEFjdGlvbnMpKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrZXksIHZhbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uRGlzcGF0Y2hlclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluLnNldHVwXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbih7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoY29udGV4dCk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICgoZGF0YSwgZW52KSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZihoYW5kbGVyID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXSkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZighaGFuZGxlcnMgfHwgKHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lcikpIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gZmlyc3QgcGFydCBvZiBjaGVjayBtZWFucyBubyBoYW5kbGVycyBhY3Rpb25cblx0XHRcdFx0Ly8gKGJ1dCB3ZSB0cmllZCB0byBhZGQgdGhlIG1peGluLi4uLnBvaW50bGVzcylcblx0XHRcdFx0Ly8gc2Vjb25kIHBhcnQgb2YgY2hlY2sgaW5kaWNhdGVzIHdlIGFscmVhZHlcblx0XHRcdFx0Ly8gcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHRcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9XG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuIClcblx0XHRcdFx0KTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uRGlzcGF0Y2hlclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQsIC4uLm1peGlucykge1xuXHRpZihtaXhpbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0bWl4aW5zID0gW2x1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbl07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcblx0XHRpZih0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZihtaXhpbi5taXhpbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBtaXhpbi5taXhpbik7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoY29udGV4dCk7XG5cdFx0aWYobWl4aW4udGVhcmRvd24pIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBtaXhpbi50ZWFyZG93biApO1xuXHRcdH1cblx0fSk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uRGlzcGF0Y2hlciA9IGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIodGFyZ2V0KSB7XG5cdG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gYWN0aW9uRGlzcGF0Y2hlcih0YXJnZXQpIHtcblx0bWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluICk7XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIuYXBwbHkoc3RvcmUsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMubmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke29wdGlvbnMubmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHR9XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHR2YXIgc3RhdGVQcm9wID0gb3B0aW9ucy5zdGF0ZVByb3AgfHwgXCJzdGF0ZVwiO1xuXHRcdHZhciBzdGF0ZSA9IG9wdGlvbnNbc3RhdGVQcm9wXSB8fCB7fTtcblx0XHR2YXIgaGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyggdGhpcywgb3B0aW9ucy5oYW5kbGVycyApO1xuXHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHRkZWxldGUgb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9ucy5zdGF0ZTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0aWYoIWluRGlzcGF0Y2gpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIik7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oc3RhdGUsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbih0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXS5jYWxsKHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoZGF0YS5kZXBzKSk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKHJlcyA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0ge1xuXHRcdFx0aGFuZGxlZDogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdChkYXRhKSA9PiB0aGlzLmhhbmRsZShcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEpXG5cdFx0XHQpXG5cdFx0fTtcblxuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZXgpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBleDtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXgpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25DcmVhdG9ycyxcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uRGlzcGF0Y2hlcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=