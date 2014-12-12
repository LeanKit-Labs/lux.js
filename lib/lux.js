/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.3.2
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
    return subscription.context(context).constraint(function(data, envelope) {
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
    if (actionGroups[group]) {
      return pluck(actions, actionGroups[group]);
    } else {
      throw new Error(("There is no action group named '" + group + "'"));
    }
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
      if (!stores.listenTo) {
        throw new Error("listenTo must contain at least one store namespace");
      }
      var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
      if (!stores.onChange) {
        throw new Error(("A component was told to listen to the following store(s): " + listenTo + " but no onChange handler was implemented"));
      }
      __lux.waitFor = [];
      __lux.heardFrom = [];
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
          if (key === "prenotify" || ((split = key.split(".")) && split[1] === "changed")) {
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
      if (typeof this.getActionGroup === "string") {
        this.getActionGroup = [this.getActionGroup];
      }
      if (typeof this.getActions === "string") {
        this.getActions = [this.getActions];
      }
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
        this.getActions.forEach(function(key) {
          var val = actions[key];
          if (val) {
            addActionIfNotPreset(key, val);
          } else {
            throw new Error(("There is no action named '" + key + "'"));
          }
        });
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
  var luxActionCreatorReactMixin = {
    componentWillMount: luxActionCreatorMixin.setup,
    publishAction: luxActionCreatorMixin.mixin.publishAction
  };
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
        if (!handlers || !Object.keys(handlers).length) {
          throw new Error("You must have at least one action handler in the handlers property");
        } else if (subs && subs.actionListener) {
          return;
        }
        subs.actionListener = configSubscription(context, channel.subscribe(topic, handlerFn));
        var handlerKeys = Object.keys(handlers);
        generateActionCreator(handlerKeys);
        if (context.namespace) {
          addToActionGroup(context.namespace, handlerKeys);
        }
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
    if (!options.handlers || !Object.keys(options.handlers).length) {
      throw new Error("A lux store must have action handler methods provided");
    }
  }
  var Store = function Store(options) {
    "use strict";
    ensureStoreOptions(options);
    var namespace = options.namespace;
    var stateProp = options.stateProp || "state";
    var state = options[stateProp] || {};
    var origHandlers = options.handlers;
    delete options.handlers;
    delete options[stateProp];
    Object.assign(this, options);
    var handlers = transformHandlers(this, origHandlers);
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
    this.__subscription = {notify: configSubscription(this, dispatcherChannel.subscribe("notify", this.flush)).constraint((function() {
        return inDispatch;
      }))};
    dispatcher.registerStore({
      namespace: namespace,
      actions: buildActionList(origHandlers)
    });
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
              this.transition("success");
            } catch (ex) {
              this.err = ex;
              this.transition("failure");
            }
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
  function getGroupsWithAction(actionName) {
    var groups = [];
    for (var $__5 = entries(actionGroups)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__10 = $__6.value,
          group = $__10[0],
          list = $__10[1];
      {
        if (list.indexOf(actionName) >= 0) {
          groups.push(group);
        }
      }
    }
    return groups;
  }
  var utils = {
    printActions: function() {
      var actionList = Object.keys(actions).map(function(x) {
        return {
          "action name": x,
          "stores": dispatcher.getStoresHandling(x).stores.map(function(x) {
            return x.namespace;
          }).join(","),
          "groups": getGroupsWithAction(x).join(",")
        };
      });
      if (console && console.table) {
        console.group("Currently Recognized Actions");
        console.table(actionList);
        console.groupEnd();
      } else if (console && console.log) {
        console.log(actionList);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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c0JBQW9CO0FBQ3BCLGdCQUFZLENBQVosY0FBWTtBQUNaLGlCQUFhLENBQWIsZUFBYTtBQUNiLFFBQUksQ0FBRyxNQUFJO0FBQ1gsY0FBVSxDQUFWLFlBQVU7QUFDVixRQUFJLENBQUosTUFBSTtBQUNKLFNBQUssQ0FBTCxPQUFLO0FBQ0wsUUFBSSxDQUFKLE1BQUk7QUFBQSxFQUNMLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMy4yXG4gKiBVcmw6IGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFuS2l0LUxhYnMvbHV4LmpzXG4gKiBMaWNlbnNlKHMpOiBNSVQgQ29weXJpZ2h0IChjKSAyMDE0IExlYW5LaXRcbiAqL1xuXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEsIFJlYWN0ICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdHJlcXVpcmUoXCJ0cmFjZXVyXCIpLFxuXHRcdFx0XHRSZWFjdCB8fCByZXF1aXJlKFwicmVhY3RcIiksXG5cdFx0XHRcdHBvc3RhbCxcblx0XHRcdFx0bWFjaGluYSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hICkge1xuXG5cdHZhciBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguYWN0aW9uXCIpO1xuXHR2YXIgc3RvcmVDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguc3RvcmVcIik7XG5cdHZhciBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmRpc3BhdGNoZXJcIik7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGlmKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcblx0XHRcdG9iaiA9IHt9O1xuXHRcdH1cblx0XHRmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuXHRcdFx0eWllbGQgW2ssIG9ialtrXV07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG5cdFx0dmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG5cdFx0XHRhY2N1bVtrZXldID0gb2JqW2tleV07XG5cdFx0XHRyZXR1cm4gYWNjdW07XG5cdFx0fSwge30pO1xuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi5jb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC5jb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoY29udGV4dCkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoY29udGV4dC5fX2x1eCB8fCB7fSk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKF9fbHV4LmNsZWFudXAgfHwgW10pO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9IChfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9KTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHRcblxudmFyIGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xudmFyIGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihhY3Rpb25MaXN0KSB7XG5cdGFjdGlvbkxpc3QgPSAodHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIpID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGlmKCFhY3Rpb25zW2FjdGlvbl0pIHtcblx0XHRcdGFjdGlvbnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1tncm91cF0gKSB7XG5cdFx0cmV0dXJuIHBsdWNrKGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1tncm91cF0pO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvcihhY3Rpb24pIHtcblx0YWN0aW9ucyA9IE9iamVjdC5hc3NpZ24oYWN0aW9ucywgYWN0aW9uKTtcbn1cblxuZnVuY3Rpb24gYWRkVG9BY3Rpb25Hcm91cChncm91cE5hbWUsIGFjdGlvbkxpc3QpIHtcblx0dmFyIGdyb3VwID0gYWN0aW9uR3JvdXBzW2dyb3VwTmFtZV07XG5cdGlmKCFncm91cCkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzW2dyb3VwTmFtZV0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbYWN0aW9uTGlzdF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKXtcblx0XHRpZihncm91cC5pbmRleE9mKGFjdGlvbikgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaChhY3Rpb24pO1xuXHRcdH1cblx0fSk7XG59XG5cblx0XG5cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IHRydWU7XG5cdHZhciBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0dmFyIGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKHRoaXMpO1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cblx0XHRpZiAoICFzdG9yZXMubGlzdGVuVG8gKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCk7XG5cdFx0fVxuXG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICgoIHNwbGl0ID0ga2V5LnNwbGl0KFwiLlwiKSkgJiYgc3BsaXRbMV0gPT09IFwiY2hhbmdlZFwiICkpIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdHZhciBhZGRBY3Rpb25JZk5vdFByZXNldCA9IChrLCB2KSA9PiB7XG5cdFx0XHRpZighdGhpc1trXSkge1xuXHRcdFx0XHRcdHRoaXNba10gPSB2O1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goKGdyb3VwKSA9PiB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkdyb3VwKGdyb3VwKSkpIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoaywgdik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZih0aGlzLmdldEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBhY3Rpb25zWyBrZXkgXTtcblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoa2V5LCB2YWwpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHtrZXl9J2AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IGZ1bmN0aW9uKGFjdGlvbiwgLi4uYXJncykge1xuXHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXAsXG5cdHB1Ymxpc2hBY3Rpb246IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5taXhpbi5wdWJsaXNoQWN0aW9uXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbih7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoY29udGV4dCk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICgoZGF0YSwgZW52KSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZihoYW5kbGVyID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXSkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZighaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKGhhbmRsZXJzKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZSB3YXJuIGluIGRlYnVnIGJ1aWxkc1xuXHRcdFx0XHQvLyBzaW5jZSB3ZSByYW4gdGhlIG1peGluIG9uIHRoaXMgY29udGV4dCBhbHJlYWR5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHR2YXIgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyhoYW5kbGVycyk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoaGFuZGxlcktleXMpO1xuXHRcdFx0aWYoY29udGV4dC5uYW1lc3BhY2UpIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cChjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQsIC4uLm1peGlucykge1xuXHRpZihtaXhpbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0bWl4aW5zID0gW2x1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkNyZWF0b3JNaXhpbl07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcblx0XHRpZih0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZihtaXhpbi5taXhpbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBtaXhpbi5taXhpbik7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoY29udGV4dCk7XG5cdFx0aWYobWl4aW4udGVhcmRvd24pIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBtaXhpbi50ZWFyZG93biApO1xuXHRcdH1cblx0fSk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBsdXhBY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKHRhcmdldCkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKHRhcmdldCkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uQ3JlYXRvck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3JMaXN0ZW5lcih0YXJnZXQpIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIuYXBwbHkoc3RvcmUsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMubmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke29wdGlvbnMubmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHR9XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycyB8fCAhT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG5cdH1cbn1cblxuY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucyk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuXHRcdHZhciBzdGF0ZVByb3AgPSBvcHRpb25zLnN0YXRlUHJvcCB8fCBcInN0YXRlXCI7XG5cdFx0dmFyIHN0YXRlID0gb3B0aW9uc1tzdGF0ZVByb3BdIHx8IHt9O1xuXHRcdHZhciBvcmlnSGFuZGxlcnMgPSBvcHRpb25zLmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHRpb25zLmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHRpb25zWyBzdGF0ZVByb3AgXTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHZhciBoYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKCB0aGlzLCBvcmlnSGFuZGxlcnMgKTtcblx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0XHRpZighaW5EaXNwYXRjaCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oe1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdLmNhbGwodGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChkYXRhLmRlcHMpKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAocmVzID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLmNvbnN0cmFpbnQoKCkgPT4gaW5EaXNwYXRjaCksXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3JpZ0hhbmRsZXJzKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSh0aGlzLm5hbWVzcGFjZSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0ge1xuXHRcdFx0aGFuZGxlZDogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdChkYXRhKSA9PiB0aGlzLmhhbmRsZShcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEpXG5cdFx0XHQpXG5cdFx0fTtcblxuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXTtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZXgpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBleDtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJzdGFydFwiKTtcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlKSB7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdGlmKGRlcFN0b3JlKSB7XG5cdFx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0XHRpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8qZWxzZSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlLndhcm4gb24gZGVidWcgYnVpbGRcblx0XHRcdFx0Ly8gbm90aW5nIHRoYXQgYSBzdG9yZSBhY3Rpb24gc3BlY2lmaWVzIGFub3RoZXIgc3RvcmVcblx0XHRcdFx0Ly8gYXMgYSBkZXBlbmRlbmN5IHRoYXQgZG9lcyBOT1QgcGFydGljaXBhdGUgaW4gdGhlIGFjdGlvblxuXHRcdFx0XHQvLyB0aGlzIGlzIHdoeSBhY3Rpb25UeXBlIGlzIGFuIGFyZyBoZXJlLi4uLlxuXHRcdFx0fSovXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSkpO1xuXHRmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcblx0XHR0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuXHRcdHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogYWN0aW9uTWV0YVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG5cdFx0XHRcdFx0XHRcdGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZW1vdmUuc3RvcmVcIiA6IGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuXHRcdFx0XHRcdFx0dmFyIGlzVGhpc05hbWVTcGFjZSA9IGZ1bmN0aW9uKG1ldGEpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1ldGEubmFtZXNwYWNlID09PSBuYW1lc3BhY2U7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyh0aGlzLmFjdGlvbk1hcCkpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGlkeCA9IHYuZmluZEluZGV4KGlzVGhpc05hbWVTcGFjZSk7XG5cdFx0XHRcdFx0XHRcdGlmKGlkeCAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHR2LnNwbGljZShpZHgsIDEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgaGFuZGxpbmcgPSB0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKHRoaXMubHV4QWN0aW9uLmFjdGlvbi5hY3Rpb25UeXBlKTtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLnN0b3JlcyA9IGhhbmRsaW5nLnN0b3Jlcztcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zID0gaGFuZGxpbmcudHJlZTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGFsbCBzeW5jLi4uaGVuY2UgdGhlIHRyYW5zaXRpb24gY2FsbCBiZWxvdy5cblx0XHRcdFx0XHRcdHZhciBjb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Iuc3RhcnQoKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3RvcHBlZDoge31cblx0XHRcdH0sXG5cdFx0XHRnZXRTdG9yZXNIYW5kbGluZyhhY3Rpb25UeXBlKSB7XG5cdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25UeXBlXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0dHJlZTogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJleGVjdXRlLipcIixcblx0XHRcdFx0XHQoZGF0YSwgZW52KSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRdO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoY29uZmlnKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBjb25maWcpO1xuXHR9XG5cblx0cmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0XHR0aGlzLmhhbmRsZShcInJlbW92ZS5zdG9yZVwiLCBuYW1lc3BhY2UpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG5mdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKGFjdGlvbk5hbWUpIHtcblx0dmFyIGdyb3VwcyA9IFtdO1xuXHRmb3IodmFyIFtncm91cCwgbGlzdF0gb2YgZW50cmllcyhhY3Rpb25Hcm91cHMpKSB7XG5cdFx0aWYobGlzdC5pbmRleE9mKGFjdGlvbk5hbWUpID49IDApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKGdyb3VwKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuLy8gTk9URSAtIHRoZXNlIHdpbGwgZXZlbnR1YWxseSBsaXZlIGluIHRoZWlyIG93biBhZGQtb24gbGliIG9yIGluIGEgZGVidWcgYnVpbGQgb2YgbHV4XG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9uTGlzdCA9IE9iamVjdC5rZXlzKGFjdGlvbnMpXG5cdFx0XHQubWFwKGZ1bmN0aW9uKHgpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcImFjdGlvbiBuYW1lXCIgOiB4LFxuXHRcdFx0XHRcdFwic3RvcmVzXCIgOiBkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKHgpLnN0b3Jlcy5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC5uYW1lc3BhY2U7IH0pLmpvaW4oXCIsXCIpLFxuXHRcdFx0XHRcdFwiZ3JvdXBzXCIgOiBnZXRHcm91cHNXaXRoQWN0aW9uKHgpLmpvaW4oXCIsXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdGNvbnNvbGUuZ3JvdXAoXCJDdXJyZW50bHkgUmVjb2duaXplZCBBY3Rpb25zXCIpO1xuXHRcdFx0Y29uc29sZS50YWJsZShhY3Rpb25MaXN0KTtcblx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdGNvbnNvbGUubG9nKGFjdGlvbkxpc3QpO1xuXHRcdH1cblx0fSxcblxuXHRwcmludFN0b3JlRGVwVHJlZShhY3Rpb25UeXBlKSB7XG5cdFx0dmFyIHRyZWUgPSBbXTtcblx0XHRhY3Rpb25UeXBlID0gdHlwZW9mIGFjdGlvblR5cGUgPT09IFwic3RyaW5nXCIgPyBbYWN0aW9uVHlwZV0gOiBhY3Rpb25UeXBlO1xuXHRcdGlmKCFhY3Rpb25UeXBlKSB7XG5cdFx0XHRhY3Rpb25UeXBlID0gT2JqZWN0LmtleXMoYWN0aW9ucyk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaChmdW5jdGlvbihhdCl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKGF0KVxuXHRcdFx0ICAgIC50cmVlLmZvckVhY2goZnVuY3Rpb24oeCkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoeC5sZW5ndGgpIHtcblx0XHRcdCAgICAgICAgICAgIHZhciB0ID0geC5wb3AoKTtcblx0XHRcdCAgICAgICAgICAgIHRyZWUucHVzaCh7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oXCIsXCIpLFxuXHRcdFx0ICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHQgICAgICAgICAgICB9KTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKHRyZWUpO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRyZWUpO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdFx0YWN0aW9uQ3JlYXRvcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=