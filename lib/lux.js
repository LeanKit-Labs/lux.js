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
      dispatcher.removeStore(this.namespace);
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
          },
          "remove.store": function(namespace) {
            var isThisNameSpace = function(meta) {
              return meta.namespace === namespace;
            };
            for (var $__5 = entries(this.actionMap)[Symbol.iterator](),
                $__6; !($__6 = $__5.next()).done; ) {
              var $__10 = $__6.value,
                  k = $__10[0],
                  v = $__10[1];
              {
                var idx = v.findIndex(isThisNameSpace);
                if (idx !== -1) {
                  v.splice(idx, 1);
                }
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
    removeStore: function(namespace) {
      "use strict";
      this.handle("remove.store", namespace);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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ZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMy4wLVJDMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hLCBSZWFjdCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSApIHtcblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoY29udGV4dCkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoY29udGV4dC5fX2x1eCB8fCB7fSk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKF9fbHV4LmNsZWFudXAgfHwgW10pO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9IChfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9KTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHRcblxudmFyIGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihhY3Rpb25MaXN0KSB7XG5cdGFjdGlvbkxpc3QgPSAodHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIpID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGlmKCFhY3Rpb25zW2FjdGlvbl0pIHtcblx0XHRcdGFjdGlvbnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRyZXR1cm4gYWN0aW9uR3JvdXBzW2dyb3VwXSA/IHBsdWNrKGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1tncm91cF0pIDoge307XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoYWN0aW9uKSB7XG5cdGFjdGlvbnMgPSBPYmplY3QuYXNzaWduKGFjdGlvbnMsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoZ3JvdXBOYW1lLCBhY3Rpb25MaXN0KSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdO1xuXHRpZighZ3JvdXApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbil7XG5cdFx0aWYoZ3JvdXAuaW5kZXhPZihhY3Rpb24pID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goYWN0aW9uKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCh0aGlzKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgbm9DaGFuZ2VIYW5kbGVySW1wbGVtZW50ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGApO1xuXHRcdH07XG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpICYmIHNwbGl0WzFdID09PSBcImNoYW5nZWRcIiApKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gRGlzcGF0Y2hlciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZXQgPSAoaywgdikgPT4ge1xuXHRcdFx0aWYoIXRoaXNba10pIHtcblx0XHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKChncm91cCkgPT4ge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25Hcm91cChncm91cCkpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGssIHYpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmKHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGZvcih2YXIgW2tleSwgdmFsXSBvZiBlbnRyaWVzKHBsdWNrKGFjdGlvbnMsIHRoaXMuZ2V0QWN0aW9ucykpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGtleSwgdmFsKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogZnVuY3Rpb24oYWN0aW9uLCAuLi5hcmdzKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cFxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30pIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKGNvbnRleHQpO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoKGRhdGEsIGVudikgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYoaGFuZGxlciA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0pIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYoIWhhbmRsZXJzIHx8IChzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIpKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIGZpcnN0IHBhcnQgb2YgY2hlY2sgbWVhbnMgbm8gaGFuZGxlcnMgYWN0aW9uXG5cdFx0XHRcdC8vIChidXQgd2UgdHJpZWQgdG8gYWRkIHRoZSBtaXhpbi4uLi5wb2ludGxlc3MpXG5cdFx0XHRcdC8vIHNlY29uZCBwYXJ0IG9mIGNoZWNrIGluZGljYXRlcyB3ZSBhbHJlYWR5XG5cdFx0XHRcdC8vIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBSZWFjdCBDb21wb25lbnQgVmVyc2lvbnMgb2YgQWJvdmUgTWl4aW4gICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0LCAuLi5taXhpbnMpIHtcblx0aWYobWl4aW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdG1peGlucyA9IFtsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW5dO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goKG1peGluKSA9PiB7XG5cdFx0aWYodHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYobWl4aW4ubWl4aW4pIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbWl4aW4ubWl4aW4pO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKGNvbnRleHQpO1xuXHRcdGlmKG1peGluLnRlYXJkb3duKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG5taXhpbi5zdG9yZSA9IGx1eFN0b3JlTWl4aW47XG5taXhpbi5hY3Rpb25DcmVhdG9yID0gbHV4QWN0aW9uQ3JlYXRvck1peGluO1xubWl4aW4uYWN0aW9uTGlzdGVuZXIgPSBsdXhBY3Rpb25MaXN0ZW5lck1peGluO1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lcih0YXJnZXQpIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvcih0YXJnZXQpIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIodGFyZ2V0KSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuXHRcdHJldHVybiBoYW5kbGVyLmFwcGx5KHN0b3JlLCAuLi5hcmdzKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLm5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtvcHRpb25zLm5hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0fVxuXHRpZighb3B0aW9ucy5uYW1lc3BhY2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIik7XG5cdH1cblx0aWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiKTtcblx0fVxufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2U7XG5cdFx0dmFyIHN0YXRlUHJvcCA9IG9wdGlvbnMuc3RhdGVQcm9wIHx8IFwic3RhdGVcIjtcblx0XHR2YXIgc3RhdGUgPSBvcHRpb25zW3N0YXRlUHJvcF0gfHwge307XG5cdFx0dmFyIGhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnMoIHRoaXMsIG9wdGlvbnMuaGFuZGxlcnMgKTtcblx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0XHRpZighaW5EaXNwYXRjaCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oe1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdLmNhbGwodGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChkYXRhLmRlcHMpKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAocmVzID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IGluRGlzcGF0Y2gpLFxuXHRcdH07XG5cblx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHRcdH1cblx0XHQpO1xuXHRcdGRlbGV0ZSBvcHRpb25zLmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHRpb25zWyBzdGF0ZVByb3AgXTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHR9XG5cblx0Ly8gTmVlZCB0byBidWlsZCBpbiBiZWhhdmlvciB0byByZW1vdmUgdGhpcyBzdG9yZVxuXHQvLyBmcm9tIHRoZSBkaXNwYXRjaGVyJ3MgYWN0aW9uTWFwIGFzIHdlbGwhXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHRcdGRpc3BhdGNoZXIucmVtb3ZlU3RvcmUodGhpcy5uYW1lc3BhY2UpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG5cdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHR9LCBhY3Rpb24pO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG4vKlxuXHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuXHR7XG5cdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdGFjdGlvbiA6IHtcblx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdH1cblx0fVxuKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge30sXG5cdFx0XHR1cGRhdGVkOiBbXVxuXHRcdH0sIGNvbmZpZyk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHtcblx0XHRcdGhhbmRsZWQ6IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XCIqLmhhbmRsZWQuKlwiLFxuXHRcdFx0XHQoZGF0YSkgPT4gdGhpcy5oYW5kbGUoXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhKVxuXHRcdFx0KVxuXHRcdH07XG5cblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHVuaW5pdGlhbGl6ZWQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXIoKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV07XG5cdFx0XHRcdFx0XHR9IGNhdGNoKGV4KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXg7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goZGF0YS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwiYWN0aW9uLmZhaWx1cmVcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzdGFydCgpIHtcblx0XHR0aGlzLmhhbmRsZShcInN0YXJ0XCIpO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUpIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0aWYoZGVwU3RvcmUpIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlbW92ZS5zdG9yZVwiIDogZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cdFx0XHRcdFx0XHR2YXIgaXNUaGlzTmFtZVNwYWNlID0gZnVuY3Rpb24obWV0YSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKHRoaXMuYWN0aW9uTWFwKSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgaWR4ID0gdi5maW5kSW5kZXgoaXNUaGlzTmFtZVNwYWNlKTtcblx0XHRcdFx0XHRcdFx0aWYoaWR4ICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdHYuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBoYW5kbGluZyA9IHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcodGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGUpO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gaGFuZGxpbmcuc3RvcmVzO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBoYW5kbGluZy50cmVlO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCA/IFwiZGlzcGF0Y2hpbmdcIiA6IFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgYWxsIHN5bmMuLi5oZW5jZSB0aGUgdHJhbnNpdGlvbiBjYWxsIGJlbG93LlxuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcblx0XHRcdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb29yZGluYXRvci5zdGFydCgpO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKGFjdGlvblR5cGUpIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHR0cmVlOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVtb3ZlLnN0b3JlXCIsIG5hbWVzcGFjZSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxudmFyIHV0aWxzID0ge1xuXHRwcmludEFjdGlvbnMoKSB7XG5cdFx0dmFyIGFjdGlvbnMgPSBPYmplY3Qua2V5cyhhY3Rpb25zKVxuXHRcdFx0Lm1hcChmdW5jdGlvbih4KSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XCJhY3Rpb24gbmFtZVwiIDogeCxcblx0XHRcdFx0XHRcInN0b3Jlc1wiIDogZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyh4KS5zdG9yZXMubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9KS5qb2luKFwiLFwiKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0aWYoY29uc29sZSAmJiBjb25zb2xlLnRhYmxlKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKFwiQ3VycmVudGx5IFJlY29nbml6ZWQgQWN0aW9uc1wiKTtcblx0XHRcdGNvbnNvbGUudGFibGUoYWN0aW9ucyk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0fSBlbHNlIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhhY3Rpb25zKTtcblx0XHR9XG5cdH0sXG5cblx0cHJpbnRTdG9yZURlcFRyZWUoYWN0aW9uVHlwZSkge1xuXHRcdHZhciB0cmVlID0gW107XG5cdFx0YWN0aW9uVHlwZSA9IHR5cGVvZiBhY3Rpb25UeXBlID09PSBcInN0cmluZ1wiID8gW2FjdGlvblR5cGVdIDogYWN0aW9uVHlwZTtcblx0XHRpZighYWN0aW9uVHlwZSkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKGFjdGlvbnMpO1xuXHRcdH1cblx0XHRhY3Rpb25UeXBlLmZvckVhY2goZnVuY3Rpb24oYXQpe1xuXHRcdFx0ZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyhhdClcblx0XHRcdCAgICAudHJlZS5mb3JFYWNoKGZ1bmN0aW9uKHgpIHtcblx0XHRcdCAgICAgICAgd2hpbGUgKHgubGVuZ3RoKSB7XG5cdFx0XHQgICAgICAgICAgICB2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHQgICAgICAgICAgICB0cmVlLnB1c2goe1xuXHRcdFx0ICAgICAgICAgICAgXHRcImFjdGlvbiB0eXBlXCIgOiBhdCxcblx0XHRcdCAgICAgICAgICAgICAgICBcInN0b3JlIG5hbWVzcGFjZVwiIDogdC5uYW1lc3BhY2UsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJ3YWl0cyBmb3JcIiA6IHQud2FpdEZvci5qb2luKFwiLFwiKSxcblx0XHRcdCAgICAgICAgICAgICAgICBnZW5lcmF0aW9uOiB0LmdlblxuXHRcdFx0ICAgICAgICAgICAgfSk7XG5cdFx0XHQgICAgICAgIH1cblx0XHRcdCAgICB9KTtcblx0XHQgICAgaWYoY29uc29sZSAmJiBjb25zb2xlLnRhYmxlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH1gKTtcblx0XHRcdFx0Y29uc29sZS50YWJsZSh0cmVlKTtcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdFx0fSBlbHNlIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9OmApO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0cmVlKTtcblx0XHRcdH1cblx0XHRcdHRyZWUgPSBbXTtcblx0XHR9KTtcblx0fVxufTtcblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0YWN0aW9ucyxcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRcdGFjdGlvbkNyZWF0b3IsXG5cdFx0YWN0aW9uTGlzdGVuZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlLFxuXHRcdHN0b3Jlcyxcblx0XHR1dGlsc1xuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fNCsrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNVskX19wbGFjZWhvbGRlcl9fNiAtICRfX3BsYWNlaG9sZGVyX183XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fOF07IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9