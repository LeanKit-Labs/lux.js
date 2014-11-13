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
  var $__12 = $traceurRuntime.initGeneratorFunction(entries);
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
    }, $__12, this);
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
  var actions = Object.create(null);
  var actionGroups = {};
  function buildActionList(handlers) {
    var actionList = [];
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__10 = $__6.value,
          key = $__10[0],
          handler = $__10[1];
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
      if (!actions[action]) {
        actions[action] = function() {
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
    return actionGroups[group] ? pluck(actions, actionGroups[group]) : {};
  }
  function customActionCreator(action) {
    actions = Object.assign(actions, action);
  }
  function addToActionGroup(groupName, actionList) {
    var group = actionGroups[groupName];
    if (!group) {
      group = actionGroups[groupName] = [];
    }
    actionList = typeof actionList === "string" ? [actionList] : actionList;
    actionList.forEach(function(action) {
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
        var $__10 = $__6.value,
            key = $__10[0],
            sub = $__10[1];
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
  var luxActionCreatorMixin = {
    setup: function() {
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
          var $__10 = $__6.value,
              k = $__10[0],
              v = $__10[1];
          {
            addActionIfNotPreset(k, v);
          }
        }
      }));
      if (this.getActions.length) {
        for (var $__5 = entries(pluck(actions, this.getActions))[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var $__10 = $__6.value,
              key = $__10[0],
              val = $__10[1];
          {
            addActionIfNotPreset(key, val);
          }
        }
      }
    },
    mixin: {publishAction: function(action) {
        for (var args = [],
            $__7 = 1; $__7 < arguments.length; $__7++)
          args[$__7 - 1] = arguments[$__7];
        actionChannel.publish({
          topic: ("execute." + action),
          data: {
            actionType: action,
            actionArgs: args
          }
        });
      }}
  };
  var luxActionCreatorReactMixin = {componentWillMount: luxActionCreatorMixin.setup};
  var luxActionListenerMixin = function() {
    var $__10 = arguments[0] !== (void 0) ? arguments[0] : {},
        handlers = $__10.handlers,
        handlerFn = $__10.handlerFn,
        context = $__10.context,
        channel = $__10.channel,
        topic = $__10.topic;
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
    var opt = {mixins: [luxStoreReactMixin, luxActionCreatorReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function component(options) {
    var opt = {mixins: [luxActionCreatorReactMixin].concat(options.mixins || [])};
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
        $__8 = 1; $__8 < arguments.length; $__8++)
      mixins[$__8 - 1] = arguments[$__8];
    if (mixins.length === 0) {
      mixins = [luxStoreMixin, luxActionCreatorMixin];
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
    return context;
  }
  mixin.store = luxStoreMixin;
  mixin.actionCreator = luxActionCreatorMixin;
  mixin.actionListener = luxActionListenerMixin;
  function actionListener(target) {
    return mixin(target, luxActionListenerMixin);
  }
  function actionCreator(target) {
    return mixin(target, luxActionCreatorMixin);
  }
  function actionCreatorListener(target) {
    return actionCreator(actionListener(target));
  }
  function transformHandler(store, target, key, handler) {
    target[key] = function() {
      var $__11;
      for (var args = [],
          $__9 = 0; $__9 < arguments.length; $__9++)
        args[$__9] = arguments[$__9];
      return ($__11 = handler).apply.apply($__11, $traceurRuntime.spread([store], args));
    };
  }
  function transformHandlers(store, handlers) {
    var target = {};
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__10 = $__6.value,
          key = $__10[0],
          handler = $__10[1];
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
      actions: buildActionList(options.handlers)
    });
    delete options.handlers;
    delete options[stateProp];
    Object.assign(this, options);
  };
  ($traceurRuntime.createClass)(Store, {dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__10 = $__6.value,
            k = $__10[0],
            subscription = $__10[1];
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
  ($traceurRuntime.createClass)(ActionCoordinator, {start: function() {
      "use strict";
      this.handle("start");
    }}, {}, machina.Fsm);
  function calculateGen(store, lookup, gen, actionType) {
    var calcdGen = gen;
    if (store.waitFor && store.waitFor.length) {
      store.waitFor.forEach(function(dep) {
        var depStore = lookup[dep];
        if (depStore) {
          var thisGen = calculateGen(depStore, lookup, gen + 1);
          if (thisGen > calcdGen) {
            calcdGen = thisGen;
          }
        }
      });
    }
    return calcdGen;
  }
  function buildGenerations(stores, actionType) {
    var tree = [];
    var lookup = {};
    stores.forEach((function(store) {
      return lookup[store.namespace] = store;
    }));
    stores.forEach((function(store) {
      return store.gen = calculateGen(store, lookup, 0, actionType);
    }));
    for (var $__5 = entries(lookup)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__10 = $__6.value,
          key = $__10[0],
          item = $__10[1];
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
            var handling = this.getStoresHandling(this.luxAction.action.actionType);
            this.luxAction.stores = handling.stores;
            this.luxAction.generations = handling.tree;
            this.transition(this.luxAction.generations.length ? "dispatching" : "ready");
          },
          "*": function() {
            this.deferUntilTransition("ready");
          }
        },
        dispatching: {
          _onEnter: function() {
            var coordinator = new ActionCoordinator({
              generations: this.luxAction.generations,
              action: this.luxAction.action
            });
            coordinator.start();
            this.transition("ready");
          },
          "*": function() {
            this.deferUntilTransition("ready");
          }
        },
        stopped: {}
      },
      getStoresHandling: function(actionType) {
        var stores = this.actionMap[actionType] || [];
        return {
          stores: stores,
          tree: buildGenerations(stores, actionType)
        };
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
  var utils = {
    printActions: function() {
      var actions = Object.keys(actions).map(function(x) {
        return {
          "action name": x,
          "stores": dispatcher.getStoresHandling(x).stores.map(function(x) {
            return x.namespace;
          }).join(",")
        };
      });
      if (console && console.table) {
        console.group("Currently Recognized Actions");
        console.table(actions);
        console.groupEnd();
      } else if (console && console.log) {
        console.log(actions);
      }
    },
    printStoreDepTree: function(actionType) {
      var tree = [];
      actionType = typeof actionType === "string" ? [actionType] : actionType;
      if (!actionType) {
        actionType = Object.keys(actions);
      }
      actionType.forEach(function(at) {
        dispatcher.getStoresHandling(at).tree.forEach(function(x) {
          while (x.length) {
            var t = x.pop();
            tree.push({
              "action type": at,
              "store namespace": t.namespace,
              "waits for": t.waitFor.join(","),
              generation: t.gen
            });
          }
        });
        if (console && console.table) {
          console.group(("Store Dependency List for " + at));
          console.table(tree);
          console.groupEnd();
        } else if (console && console.log) {
          console.log(("Store Dependency List for " + at + ":"));
          console.log(tree);
        }
        tree = [];
      });
    }
  };
  return {
    actions: actions,
    addToActionGroup: addToActionGroup,
    component: component,
    controllerView: controllerView,
    customActionCreator: customActionCreator,
    dispatcher: dispatcher,
    getActionGroup: getActionGroup,
    actionCreatorListener: actionCreatorListener,
    actionCreator: actionCreator,
    actionListener: actionListener,
    mixin: mixin,
    removeStore: removeStore,
    Store: Store,
    stores: stores,
    utils: utils
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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Q2xCLGFBQVMsQ0FBVCxXQUFTO0FBQ1QsaUJBQWEsQ0FBYixlQUFhO0FBQ2Isd0JBQW9CLENBQXBCLHNCQUFvQjtBQUNwQixnQkFBWSxDQUFaLGNBQVk7QUFDWixpQkFBYSxDQUFiLGVBQWE7QUFDYixRQUFJLENBQUcsTUFBSTtBQUNYLGNBQVUsQ0FBVixZQUFVO0FBQ1YsUUFBSSxDQUFKLE1BQUk7QUFDSixTQUFLLENBQUwsT0FBSztBQUNMLFFBQUksQ0FBSixNQUFJO0FBQUEsRUFDTCxDQUFDO0FBR0YsQ0FBQyxDQUFDLENBQUM7QUFDSCIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsdXguanMgLSBGbHV4LWJhc2VkIGFyY2hpdGVjdHVyZSBmb3IgdXNpbmcgUmVhY3RKUyBhdCBMZWFuS2l0XG4gKiBBdXRob3I6IEppbSBDb3dhcnRcbiAqIFZlcnNpb246IHYwLjMuMC1SQzFcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgUmVhY3QgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdFJlYWN0IHx8IHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0ZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG5cdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0XHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7fSk7XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0XG5cbnZhciBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoYWN0aW9uTGlzdCkge1xuXHRhY3Rpb25MaXN0ID0gKHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiKSA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRpZighYWN0aW9uc1thY3Rpb25dKSB7XG5cdFx0XHRhY3Rpb25zW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCh7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0cmV0dXJuIGFjdGlvbkdyb3Vwc1tncm91cF0gPyBwbHVjayhhY3Rpb25zLCBhY3Rpb25Hcm91cHNbZ3JvdXBdKSA6IHt9O1xufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbihhY3Rpb25zLCBhY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKGdyb3VwTmFtZSwgYWN0aW9uTGlzdCkge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXTtcblx0aWYoIWdyb3VwKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pe1xuXHRcdGlmKGdyb3VwLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKGFjdGlvbik7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gdHJ1ZTtcblx0dmFyIF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHR2YXIgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AodGhpcyk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgKTtcblx0XHR9O1xuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBub0NoYW5nZUhhbmRsZXJJbXBsZW1lbnRlZDtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zW2Ake3N0b3JlfS5jaGFuZ2VkYF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlKSk7XG5cdFx0fSk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcInByZW5vdGlmeVwiLCAoZGF0YSkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwodGhpcywgZGF0YSkpO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdGZvcih2YXIgW2tleSwgc3ViXSBvZiBlbnRyaWVzKHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucykpIHtcblx0XHRcdHZhciBzcGxpdDtcblx0XHRcdGlmKGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoIHNwbGl0ID0ga2V5LnNwbGl0KFwiLlwiKSAmJiBzcGxpdFsxXSA9PT0gXCJjaGFuZ2VkXCIgKSkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIERpc3BhdGNoZXIgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2V0ID0gKGssIHYpID0+IHtcblx0XHRcdGlmKCF0aGlzW2tdKSB7XG5cdFx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCgoZ3JvdXApID0+IHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uR3JvdXAoZ3JvdXApKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrLCB2KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZih0aGlzLmdldEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRmb3IodmFyIFtrZXksIHZhbF0gb2YgZW50cmllcyhwbHVjayhhY3Rpb25zLCB0aGlzLmdldEFjdGlvbnMpKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrZXksIHZhbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbiwgLi4uYXJncykge1xuXHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXBcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9KSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcChjb250ZXh0KTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKChkYXRhLCBlbnYpID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKGhhbmRsZXIgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseShjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmKCFoYW5kbGVycyB8fCAoc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyKSkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBmaXJzdCBwYXJ0IG9mIGNoZWNrIG1lYW5zIG5vIGhhbmRsZXJzIGFjdGlvblxuXHRcdFx0XHQvLyAoYnV0IHdlIHRyaWVkIHRvIGFkZCB0aGUgbWl4aW4uLi4ucG9pbnRsZXNzKVxuXHRcdFx0XHQvLyBzZWNvbmQgcGFydCBvZiBjaGVjayBpbmRpY2F0ZXMgd2UgYWxyZWFkeVxuXHRcdFx0XHQvLyByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dFxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gY29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCwgLi4ubWl4aW5zKSB7XG5cdGlmKG1peGlucy5sZW5ndGggPT09IDApIHtcblx0XHRtaXhpbnMgPSBbbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKChtaXhpbikgPT4ge1xuXHRcdGlmKHR5cGVvZiBtaXhpbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKG1peGluLm1peGluKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIG1peGluLm1peGluKTtcblx0XHR9XG5cdFx0bWl4aW4uc2V0dXAuY2FsbChjb250ZXh0KTtcblx0XHRpZihtaXhpbi50ZWFyZG93bikge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKHRhcmdldCkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuXHR0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcblx0XHRyZXR1cm4gaGFuZGxlci5hcHBseShzdG9yZSwgLi4uYXJncyk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuXHR2YXIgdGFyZ2V0ID0ge307XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0dHJhbnNmb3JtSGFuZGxlcihcblx0XHRcdHN0b3JlLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0a2V5LFxuXHRcdFx0dHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5uYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7b3B0aW9ucy5uYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG5cdH1cblx0aWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFvcHRpb25zLmhhbmRsZXJzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG5cdH1cbn1cblxuY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucyk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuXHRcdHZhciBzdGF0ZVByb3AgPSBvcHRpb25zLnN0YXRlUHJvcCB8fCBcInN0YXRlXCI7XG5cdFx0dmFyIHN0YXRlID0gb3B0aW9uc1tzdGF0ZVByb3BdIHx8IHt9O1xuXHRcdHZhciBoYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKCB0aGlzLCBvcHRpb25zLmhhbmRsZXJzICk7XG5cdFx0c3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0aWYoIWluRGlzcGF0Y2gpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIik7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oc3RhdGUsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbih0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXS5jYWxsKHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoZGF0YS5kZXBzKSk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKHJlcyA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKE9iamVjdC5rZXlzKGhhbmRsZXJzKSk7XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KG9wdGlvbnMuaGFuZGxlcnMpXG5cdFx0XHR9XG5cdFx0KTtcblx0XHRkZWxldGUgb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9uc1sgc3RhdGVQcm9wIF07XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0ZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG5cdFx0fSwgYWN0aW9uKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0pO1xufVxuLypcblx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0e1xuXHRcdGdlbmVyYXRpb25zOiBbXSxcblx0XHRhY3Rpb24gOiB7XG5cdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0YWN0aW9uQXJnczogW11cblx0XHR9XG5cdH1cbiovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCB7XG5cdFx0XHRnZW5lcmF0aW9uSW5kZXg6IDAsXG5cdFx0XHRzdG9yZXM6IHt9LFxuXHRcdFx0dXBkYXRlZDogW11cblx0XHR9LCBjb25maWcpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB7XG5cdFx0XHRoYW5kbGVkOiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0KGRhdGEpID0+IHRoaXMuaGFuZGxlKFwiYWN0aW9uLmhhbmRsZWRcIiwgZGF0YSlcblx0XHRcdClcblx0XHR9O1xuXG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildO1xuXHRcdFx0XHRcdFx0fSBjYXRjaChleCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVyciA9IGV4O1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJzdGFydFwiKTtcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlKSB7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdGlmKGRlcFN0b3JlKSB7XG5cdFx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0XHRpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8qZWxzZSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlLndhcm4gb24gZGVidWcgYnVpbGRcblx0XHRcdFx0Ly8gbm90aW5nIHRoYXQgYSBzdG9yZSBhY3Rpb24gc3BlY2lmaWVzIGFub3RoZXIgc3RvcmVcblx0XHRcdFx0Ly8gYXMgYSBkZXBlbmRlbmN5IHRoYXQgZG9lcyBOT1QgcGFydGljaXBhdGUgaW4gdGhlIGFjdGlvblxuXHRcdFx0XHQvLyB0aGlzIGlzIHdoeSBhY3Rpb25UeXBlIGlzIGFuIGFyZyBoZXJlLi4uLlxuXHRcdFx0fSovXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSkpO1xuXHRmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcblx0XHR0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuXHRcdHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogYWN0aW9uTWV0YVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG5cdFx0XHRcdFx0XHRcdGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGhhbmRsaW5nID0gdGhpcy5nZXRTdG9yZXNIYW5kbGluZyh0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZSk7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBoYW5kbGluZy5zdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGhhbmRsaW5nLnRyZWU7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBpcyBhbGwgc3luYy4uLmhlbmNlIHRoZSB0cmFuc2l0aW9uIGNhbGwgYmVsb3cuXG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yLnN0YXJ0KCk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoYWN0aW9uVHlwZSkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uVHlwZV0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdHRyZWU6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0KGRhdGEsIGVudikgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKGNvbmZpZykge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgY29uZmlnKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxuLy8gTk9URSAtIHRoZXNlIHdpbGwgZXZlbnR1YWxseSBsaXZlIGluIHRoZWlyIG93biBhZGQtb24gbGliIG9yIGluIGEgZGVidWcgYnVpbGQgb2YgbHV4XG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbnMpXG5cdFx0XHQubWFwKGZ1bmN0aW9uKHgpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcImFjdGlvbiBuYW1lXCIgOiB4LFxuXHRcdFx0XHRcdFwic3RvcmVzXCIgOiBkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKHgpLnN0b3Jlcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC5uYW1lc3BhY2U7IH0pLmpvaW4oXCIsXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdGNvbnNvbGUuZ3JvdXAoXCJDdXJyZW50bHkgUmVjb2duaXplZCBBY3Rpb25zXCIpO1xuXHRcdFx0Y29uc29sZS50YWJsZShhY3Rpb25zKTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdGNvbnNvbGUubG9nKGFjdGlvbnMpO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZShhY3Rpb25UeXBlKSB7XG5cdFx0dmFyIHRyZWUgPSBbXTtcblx0XHRhY3Rpb25UeXBlID0gdHlwZW9mIGFjdGlvblR5cGUgPT09IFwic3RyaW5nXCIgPyBbYWN0aW9uVHlwZV0gOiBhY3Rpb25UeXBlO1xuXHRcdGlmKCFhY3Rpb25UeXBlKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoYWN0aW9ucyk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaChmdW5jdGlvbihhdCl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKGF0KVxuXHRcdFx0ICAgIC50cmVlLmZvckVhY2goZnVuY3Rpb24oeCkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoeC5sZW5ndGgpIHtcblx0XHRcdCAgICAgICAgICAgIHZhciB0ID0geC5wb3AoKTtcblx0XHRcdCAgICAgICAgICAgIHRyZWUucHVzaCh7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oXCIsXCIpLFxuXHRcdFx0ICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHQgICAgICAgICAgICB9KTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKHRyZWUpO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRyZWUpO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdFx0YWN0aW9uQ3JlYXRvcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=