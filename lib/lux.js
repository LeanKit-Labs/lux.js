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
      },
      teardown: function() {
        this.__lux.subscriptions.actionListener.unsubscribe();
      }
    };
  };
  function createControllerView(options) {
    var opt = {mixins: [luxStoreReactMixin, luxActionDispatcherReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function createComponent(options) {
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
      context.__lux.cleanup.push(mixin.teardown);
    }));
    context.luxCleanup = luxMixinCleanup;
  }
  mixin.store = luxStoreMixin;
  mixin.actionDispatcher = luxActionDispatcherMixin;
  mixin.actionListener = luxActionListenerMixin;
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
    createComponent: createComponent,
    createControllerView: createControllerView,
    customActionCreator: customActionCreator,
    dispatcher: dispatcher,
    getActionCreatorFor: getActionCreatorFor,
    mixin: mixin,
    removeStore: removeStore,
    Store: Store
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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QnNuQnhELEFBQUksSUFBQSxDQUFBLFVBQVMsRUFBSSxJQUFJLFdBQVMsQUFBQyxFQUFDLENBQUM7QUFJaEMsT0FBTztBQUNOLGlCQUFhLENBQWIsZUFBYTtBQUNiLG9CQUFnQixDQUFoQixrQkFBZ0I7QUFDaEIsa0JBQWMsQ0FBZCxnQkFBYztBQUNkLHVCQUFtQixDQUFuQixxQkFBbUI7QUFDbkIsc0JBQWtCLENBQWxCLG9CQUFrQjtBQUNsQixhQUFTLENBQVQsV0FBUztBQUNULHNCQUFrQixDQUFsQixvQkFBa0I7QUFDbEIsUUFBSSxDQUFHLE1BQUk7QUFDWCxjQUFVLENBQVYsWUFBVTtBQUNWLFFBQUksQ0FBSixNQUFJO0FBQUEsRUFDTCxDQUFDO0FBR0YsQ0FBQyxDQUFDLENBQUM7QUFDSCIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsdXguanMgLSBGbHV4LWJhc2VkIGFyY2hpdGVjdHVyZSBmb3IgdXNpbmcgUmVhY3RKUyBhdCBMZWFuS2l0XG4gKiBBdXRob3I6IEppbSBDb3dhcnRcbiAqIFZlcnNpb246IHYwLjMuMC1SQzFcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgUmVhY3QgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdFJlYWN0IHx8IHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0ZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG5cdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0XHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7fSk7XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIGdyb3VwICkge1xuXHRyZXR1cm4gYWN0aW9uR3JvdXBzW2dyb3VwXSA/IHBsdWNrKGFjdGlvbkNyZWF0b3JzLCBhY3Rpb25Hcm91cHNbZ3JvdXBdKSA6IHt9O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoYWN0aW9uTGlzdCkge1xuXHRhY3Rpb25MaXN0ID0gKHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiKSA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRpZighYWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSkge1xuXHRcdFx0YWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvcihhY3Rpb24pIHtcblx0YWN0aW9uQ3JlYXRvcnMgPSBPYmplY3QuYXNzaWduKGFjdGlvbkNyZWF0b3JzLCBhY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBY3Rpb25Hcm91cChncm91cE5hbWUsIGFjdGlvbnMpIHtcblx0YWN0aW9uR3JvdXBzW2dyb3VwTmFtZV0gPSBhY3Rpb25zO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCh0aGlzKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgbm9DaGFuZ2VIYW5kbGVySW1wbGVtZW50ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGApO1xuXHRcdH07XG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpICYmIHNwbGl0WzFdID09PSBcImNoYW5nZWRcIiApKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gRGlzcGF0Y2hlciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2V0ID0gKGssIHYpID0+IHtcblx0XHRcdGlmKCF0aGlzW2tdKSB7XG5cdFx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKChncm91cCkgPT4ge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25DcmVhdG9yRm9yKGdyb3VwKSkpIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoaywgdik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0aWYodGhpcy5nZXRBY3Rpb25zLmxlbmd0aCkge1xuXHRcdFx0Zm9yKHZhciBba2V5LCB2YWxdIG9mIGVudHJpZXMocGx1Y2soYWN0aW9uQ3JlYXRvcnMsIHRoaXMuZ2V0QWN0aW9ucykpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGtleSwgdmFsKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25EaXNwYXRjaGVyUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW4uc2V0dXBcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9KSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcChjb250ZXh0KTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKChkYXRhLCBlbnYpID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKGhhbmRsZXIgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseShjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmKCFoYW5kbGVycyB8fCAoc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyKSkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBmaXJzdCBwYXJ0IG9mIGNoZWNrIG1lYW5zIG5vIGhhbmRsZXJzIGFjdGlvblxuXHRcdFx0XHQvLyAoYnV0IHdlIHRyaWVkIHRvIGFkZCB0aGUgbWl4aW4uLi4ucG9pbnRsZXNzKVxuXHRcdFx0XHQvLyBzZWNvbmQgcGFydCBvZiBjaGVjayBpbmRpY2F0ZXMgd2UgYWxyZWFkeVxuXHRcdFx0XHQvLyByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dFxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uRGlzcGF0Y2hlclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQsIC4uLm1peGlucykge1xuXHRpZihtaXhpbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0bWl4aW5zID0gW2x1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbl07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcblx0XHRpZih0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZihtaXhpbi5taXhpbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBtaXhpbi5taXhpbik7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoY29udGV4dCk7XG5cdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkRpc3BhdGNoZXIgPSBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIuYXBwbHkoc3RvcmUsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMubmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke29wdGlvbnMubmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHR9XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHR2YXIgc3RhdGVQcm9wID0gb3B0aW9ucy5zdGF0ZVByb3AgfHwgXCJzdGF0ZVwiO1xuXHRcdHZhciBzdGF0ZSA9IG9wdGlvbnNbc3RhdGVQcm9wXSB8fCB7fTtcblx0XHR2YXIgaGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyggdGhpcywgb3B0aW9ucy5oYW5kbGVycyApO1xuXHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHRkZWxldGUgb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9ucy5zdGF0ZTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0aWYoIWluRGlzcGF0Y2gpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIik7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oc3RhdGUsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbih0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXS5jYWxsKHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoZGF0YS5kZXBzKSk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKHJlcyA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0ge1xuXHRcdFx0aGFuZGxlZDogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdChkYXRhKSA9PiB0aGlzLmhhbmRsZShcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEpXG5cdFx0XHQpXG5cdFx0fTtcblxuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZXgpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBleDtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXgpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25DcmVhdG9ycyxcblx0XHRjcmVhdGVBY3Rpb25Hcm91cCxcblx0XHRjcmVhdGVDb21wb25lbnQsXG5cdFx0Y3JlYXRlQ29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3IsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=