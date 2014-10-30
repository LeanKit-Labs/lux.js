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
  var actionCreators = {};
  var actionGroups = {};
  function getActionCreatorFor(group) {
    return actionGroups[group] ? pluck(actionCreators, actionGroups[group]) : {};
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
  function customActionCreator(action) {
    actionCreators = Object.assign(actionCreators, action);
  }
  function createActionGroup(groupName, actions) {
    actionGroups[groupName] = actions;
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
      this.getActionsFor = this.getActionsFor || [];
      this.getActions = this.getActions || [];
      var addActionIfNotPreset = (function(k, v) {
        if (!$__0[k]) {
          $__0[k] = v;
        }
      });
      this.getActionsFor.forEach((function(group) {
        for (var $__5 = entries(getActionCreatorFor(group))[Symbol.iterator](),
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
  function makeActionListener(target) {
    mixin(target, luxActionListenerMixin);
    return target;
  }
  function makeActionDispatcher(target) {
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
    createActionGroup: createActionGroup,
    component: component,
    controllerView: controllerView,
    customActionCreator: customActionCreator,
    dispatcher: dispatcher,
    getActionCreatorFor: getActionCreatorFor,
    makeActionListener: makeActionListener,
    mixin: mixin,
    removeStore: removeStore,
    Store: Store
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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LENBQUMsaUJBQWdCLENBQUcsS0FBRyxDQUFDLENBQUM7SUFDckM7QUFFQSxnQkFBWSxDQUFaLFVBQWMsTUFBSyxDQUFHOztBQUNyQixTQUFHLE9BQU8sQUFBQyxDQUFDLGdCQUFlLENBQUcsT0FBSyxDQUFDLENBQUM7SUFDdEM7QUFFQSxVQUFNLENBQU4sVUFBTyxBQUFDOztBQUNQLFNBQUcsV0FBVyxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7QUFDMUIsU0FBRyxnQkFBZ0IsUUFBUSxBQUFDLEVBQUMsU0FBQyxZQUFXO2FBQU0sQ0FBQSxZQUFXLFlBQVksQUFBQyxFQUFDO01BQUEsRUFBQyxDQUFDO0lBQzNFO09BL0V3QixDQUFBLE9BQU0sSUFBSSxDb0JqakJxQjtBcEJtb0J4RCxBQUFJLElBQUEsQ0FBQSxVQUFTLEVBQUksSUFBSSxXQUFTLEFBQUMsRUFBQyxDQUFDO0FBSWhDLE9BQU87QUFDTixpQkFBYSxDQUFiLGVBQWE7QUFDYixvQkFBZ0IsQ0FBaEIsa0JBQWdCO0FBQ2hCLFlBQVEsQ0FBUixVQUFRO0FBQ1IsaUJBQWEsQ0FBYixlQUFhO0FBQ2Isc0JBQWtCLENBQWxCLG9CQUFrQjtBQUNsQixhQUFTLENBQVQsV0FBUztBQUNULHNCQUFrQixDQUFsQixvQkFBa0I7QUFDbEIscUJBQWlCLENBQWpCLG1CQUFpQjtBQUNqQixRQUFJLENBQUcsTUFBSTtBQUNYLGNBQVUsQ0FBVixZQUFVO0FBQ1YsUUFBSSxDQUFKLE1BQUk7QUFBQSxFQUNMLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMy4wLVJDMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hLCBSZWFjdCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSApIHtcblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoY29udGV4dCkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoY29udGV4dC5fX2x1eCB8fCB7fSk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKF9fbHV4LmNsZWFudXAgfHwgW10pO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9IChfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9KTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHRcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG52YXIgYWN0aW9uQ3JlYXRvcnMgPSB7fTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gZ2V0QWN0aW9uQ3JlYXRvckZvciggZ3JvdXAgKSB7XG5cdHJldHVybiBhY3Rpb25Hcm91cHNbZ3JvdXBdID8gcGx1Y2soYWN0aW9uQ3JlYXRvcnMsIGFjdGlvbkdyb3Vwc1tncm91cF0pIDoge307XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihhY3Rpb25MaXN0KSB7XG5cdGFjdGlvbkxpc3QgPSAodHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIpID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGlmKCFhY3Rpb25DcmVhdG9yc1thY3Rpb25dKSB7XG5cdFx0XHRhY3Rpb25DcmVhdG9yc1thY3Rpb25dID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25DcmVhdG9ycyA9IE9iamVjdC5hc3NpZ24oYWN0aW9uQ3JlYXRvcnMsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFjdGlvbkdyb3VwKGdyb3VwTmFtZSwgYWN0aW9ucykge1xuXHRhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IGFjdGlvbnM7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKHRoaXMpO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXHRcdHZhciBub0NoYW5nZUhhbmRsZXJJbXBsZW1lbnRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCk7XG5cdFx0fTtcblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRzdG9yZXMub25DaGFuZ2UgPSBzdG9yZXMub25DaGFuZ2UgfHwgbm9DaGFuZ2VIYW5kbGVySW1wbGVtZW50ZWQ7XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKChzdG9yZSkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1tgJHtzdG9yZX0uY2hhbmdlZGBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZShgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSkpO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IodmFyIFtrZXksIHN1Yl0gb2YgZW50cmllcyh0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMpKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZihrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCBzcGxpdCA9IGtleS5zcGxpdChcIi5cIikgJiYgc3BsaXRbMV0gPT09IFwiY2hhbmdlZFwiICkpIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBEaXNwYXRjaGVyIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZXQgPSAoaywgdikgPT4ge1xuXHRcdFx0aWYoIXRoaXNba10pIHtcblx0XHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goKGdyb3VwKSA9PiB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3IoZ3JvdXApKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrLCB2KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZih0aGlzLmdldEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRmb3IodmFyIFtrZXksIHZhbF0gb2YgZW50cmllcyhwbHVjayhhY3Rpb25DcmVhdG9ycywgdGhpcy5nZXRBY3Rpb25zKSkpIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoa2V5LCB2YWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbi5zZXR1cFxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30pIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKGNvbnRleHQpO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoKGRhdGEsIGVudikgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYoaGFuZGxlciA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0pIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYoIWhhbmRsZXJzIHx8IChzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIpKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIGZpcnN0IHBhcnQgb2YgY2hlY2sgbWVhbnMgbm8gaGFuZGxlcnMgYWN0aW9uXG5cdFx0XHRcdC8vIChidXQgd2UgdHJpZWQgdG8gYWRkIHRoZSBtaXhpbi4uLi5wb2ludGxlc3MpXG5cdFx0XHRcdC8vIHNlY29uZCBwYXJ0IG9mIGNoZWNrIGluZGljYXRlcyB3ZSBhbHJlYWR5XG5cdFx0XHRcdC8vIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBSZWFjdCBDb21wb25lbnQgVmVyc2lvbnMgb2YgQWJvdmUgTWl4aW4gICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25EaXNwYXRjaGVyUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0LCAuLi5taXhpbnMpIHtcblx0aWYobWl4aW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdG1peGlucyA9IFtsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW5dO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goKG1peGluKSA9PiB7XG5cdFx0aWYodHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYobWl4aW4ubWl4aW4pIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbWl4aW4ubWl4aW4pO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKGNvbnRleHQpO1xuXHRcdGlmKG1peGluLnRlYXJkb3duKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkRpc3BhdGNoZXIgPSBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmZ1bmN0aW9uIG1ha2VBY3Rpb25MaXN0ZW5lcih0YXJnZXQpIHtcblx0bWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiApO1xuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBtYWtlQWN0aW9uRGlzcGF0Y2hlcih0YXJnZXQpIHtcblx0bWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluICk7XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIuYXBwbHkoc3RvcmUsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMubmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke29wdGlvbnMubmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHR9XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHR2YXIgc3RhdGVQcm9wID0gb3B0aW9ucy5zdGF0ZVByb3AgfHwgXCJzdGF0ZVwiO1xuXHRcdHZhciBzdGF0ZSA9IG9wdGlvbnNbc3RhdGVQcm9wXSB8fCB7fTtcblx0XHR2YXIgaGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyggdGhpcywgb3B0aW9ucy5oYW5kbGVycyApO1xuXHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHRkZWxldGUgb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9ucy5zdGF0ZTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0aWYoIWluRGlzcGF0Y2gpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIik7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oc3RhdGUsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbih0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXS5jYWxsKHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoZGF0YS5kZXBzKSk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKHJlcyA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0ge1xuXHRcdFx0aGFuZGxlZDogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdChkYXRhKSA9PiB0aGlzLmhhbmRsZShcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEpXG5cdFx0XHQpXG5cdFx0fTtcblxuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZXgpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBleDtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXgpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25DcmVhdG9ycyxcblx0XHRjcmVhdGVBY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3IsXG5cdFx0bWFrZUFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZVxuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fNCsrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNVskX19wbGFjZWhvbGRlcl9fNiAtICRfX3BsYWNlaG9sZGVyX183XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fOF07IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9