/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.3.1
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
            $__5 = Object.keys(obj)[$traceurRuntime.toProperty(Symbol.iterator)]();
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
    for (var $__5 = entries(handlers)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
      for (var $__5 = entries(this.__lux.subscriptions)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
        for (var $__5 = entries(getActionGroup(group))[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    for (var $__5 = entries(handlers)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    this.__subscription = {notify: configSubscription(this, dispatcherChannel.subscribe("notify", this.flush)).withConstraint((function() {
        return inDispatch;
      }))};
    dispatcher.registerStore({
      namespace: namespace,
      actions: buildActionList(origHandlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    $traceurRuntime.superConstructor($ActionCoordinator).call(this, {
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
                for (var $__5 = config.generations[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    });
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
    for (var $__5 = entries(lookup)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    $traceurRuntime.superConstructor($Dispatcher).call(this, {
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
            for (var $__5 = storeMeta.actions[$traceurRuntime.toProperty(Symbol.iterator)](),
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
            for (var $__5 = entries(this.actionMap)[$traceurRuntime.toProperty(Symbol.iterator)](),
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
    });
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
    for (var $__5 = entries(actionGroups)[$traceurRuntime.toProperty(Symbol.iterator)](),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHV4LWVzNi5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImx1eC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgUmVhY3QgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdFJlYWN0IHx8IHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0ZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG5cdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0XHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7fSk7XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0XG5cbnZhciBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoYWN0aW9uTGlzdCkge1xuXHRhY3Rpb25MaXN0ID0gKHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiKSA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRpZighYWN0aW9uc1thY3Rpb25dKSB7XG5cdFx0XHRhY3Rpb25zW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCh7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbZ3JvdXBdICkge1xuXHRcdHJldHVybiBwbHVjayhhY3Rpb25zLCBhY3Rpb25Hcm91cHNbZ3JvdXBdKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gZ3JvdXAgbmFtZWQgJyR7Z3JvdXB9J2ApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoYWN0aW9uKSB7XG5cdGFjdGlvbnMgPSBPYmplY3QuYXNzaWduKGFjdGlvbnMsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoZ3JvdXBOYW1lLCBhY3Rpb25MaXN0KSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdO1xuXHRpZighZ3JvdXApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gW2FjdGlvbkxpc3RdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbil7XG5cdFx0aWYoZ3JvdXAuaW5kZXhPZihhY3Rpb24pID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goYWN0aW9uKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCh0aGlzKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBsaXN0ZW5UbyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHN0b3JlIG5hbWVzcGFjZWApO1xuXHRcdH1cblxuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5UbztcblxuXHRcdGlmICggIXN0b3Jlcy5vbkNoYW5nZSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGApO1xuXHRcdH1cblxuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zW2Ake3N0b3JlfS5jaGFuZ2VkYF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlKSk7XG5cdFx0fSk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcInByZW5vdGlmeVwiLCAoZGF0YSkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwodGhpcywgZGF0YSkpO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdGZvcih2YXIgW2tleSwgc3ViXSBvZiBlbnRyaWVzKHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucykpIHtcblx0XHRcdHZhciBzcGxpdDtcblx0XHRcdGlmKGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoKCBzcGxpdCA9IGtleS5zcGxpdChcIi5cIikpICYmIHNwbGl0WzFdID09PSBcImNoYW5nZWRcIiApKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gQ3JlYXRvciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9uR3JvdXAgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gWyB0aGlzLmdldEFjdGlvbkdyb3VwIF07XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zID0gWyB0aGlzLmdldEFjdGlvbnMgXTtcblx0XHR9XG5cblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZXQgPSAoaywgdikgPT4ge1xuXHRcdFx0aWYoIXRoaXNba10pIHtcblx0XHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKChncm91cCkgPT4ge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25Hcm91cChncm91cCkpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGssIHYpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYodGhpcy5nZXRBY3Rpb25zLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuXHRcdFx0XHR2YXIgdmFsID0gYWN0aW9uc1sga2V5IF07XG5cdFx0XHRcdGlmICggdmFsICkge1xuXHRcdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGtleSwgdmFsKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gbmFtZWQgJyR7a2V5fSdgICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRwdWJsaXNoQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24sIC4uLmFyZ3MpIHtcblx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCh7XG5cdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBsdXhBY3Rpb25DcmVhdG9yTWl4aW4ubWl4aW4ucHVibGlzaEFjdGlvblxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30pIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKGNvbnRleHQpO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoKGRhdGEsIGVudikgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYoaGFuZGxlciA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0pIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYoIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyhoYW5kbGVycykubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gc2luY2Ugd2UgcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHQgYWxyZWFkeVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID1cblx0XHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdFx0Y2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKVxuXHRcdFx0XHQpO1xuXHRcdFx0dmFyIGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoaGFuZGxlcnMpO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKGhhbmRsZXJLZXlzKTtcblx0XHRcdGlmKGNvbnRleHQubmFtZXNwYWNlKSB7XG5cdFx0XHRcdGFkZFRvQWN0aW9uR3JvdXAoY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBSZWFjdCBDb21wb25lbnQgVmVyc2lvbnMgb2YgQWJvdmUgTWl4aW4gICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0LCAuLi5taXhpbnMpIHtcblx0aWYobWl4aW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdG1peGlucyA9IFtsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25DcmVhdG9yTWl4aW5dO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goKG1peGluKSA9PiB7XG5cdFx0aWYodHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYobWl4aW4ubWl4aW4pIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbWl4aW4ubWl4aW4pO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKGNvbnRleHQpO1xuXHRcdGlmKG1peGluLnRlYXJkb3duKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG5taXhpbi5zdG9yZSA9IGx1eFN0b3JlTWl4aW47XG5taXhpbi5hY3Rpb25DcmVhdG9yID0gbHV4QWN0aW9uQ3JlYXRvck1peGluO1xubWl4aW4uYWN0aW9uTGlzdGVuZXIgPSBsdXhBY3Rpb25MaXN0ZW5lck1peGluO1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lcih0YXJnZXQpIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvcih0YXJnZXQpIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIodGFyZ2V0KSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuXHRcdHJldHVybiBoYW5kbGVyLmFwcGx5KHN0b3JlLCAuLi5hcmdzKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLm5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtvcHRpb25zLm5hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0fVxuXHRpZighb3B0aW9ucy5uYW1lc3BhY2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIik7XG5cdH1cblx0aWYoIW9wdGlvbnMuaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKG9wdGlvbnMuaGFuZGxlcnMpLmxlbmd0aCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHR2YXIgc3RhdGVQcm9wID0gb3B0aW9ucy5zdGF0ZVByb3AgfHwgXCJzdGF0ZVwiO1xuXHRcdHZhciBzdGF0ZSA9IG9wdGlvbnNbc3RhdGVQcm9wXSB8fCB7fTtcblx0XHR2YXIgb3JpZ0hhbmRsZXJzID0gb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9ucy5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0aW9uc1sgc3RhdGVQcm9wIF07XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHR2YXIgaGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyggdGhpcywgb3JpZ0hhbmRsZXJzICk7XG5cdFx0c3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuXHRcdHZhciBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuXHRcdFx0aWYoIWluRGlzcGF0Y2gpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIik7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oc3RhdGUsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaChgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbih0aGlzLCBsdXhBY3Rpb25MaXN0ZW5lck1peGluKHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXS5jYWxsKHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoZGF0YS5kZXBzKSk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKHJlcyA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiBpbkRpc3BhdGNoKSxcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChvcmlnSGFuZGxlcnMpXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKHRoaXMubmFtZXNwYWNlKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0ZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG5cdFx0fSwgYWN0aW9uKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0pO1xufVxuLypcblx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0e1xuXHRcdGdlbmVyYXRpb25zOiBbXSxcblx0XHRhY3Rpb24gOiB7XG5cdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0YWN0aW9uQXJnczogW11cblx0XHR9XG5cdH1cbiovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCB7XG5cdFx0XHRnZW5lcmF0aW9uSW5kZXg6IDAsXG5cdFx0XHRzdG9yZXM6IHt9LFxuXHRcdFx0dXBkYXRlZDogW11cblx0XHR9LCBjb25maWcpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB7XG5cdFx0XHRoYW5kbGVkOiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0KGRhdGEpID0+IHRoaXMuaGFuZGxlKFwiYWN0aW9uLmhhbmRsZWRcIiwgZGF0YSlcblx0XHRcdClcblx0XHR9O1xuXG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaChleCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVyciA9IGV4O1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goZGF0YS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwiYWN0aW9uLmZhaWx1cmVcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzdGFydCgpIHtcblx0XHR0aGlzLmhhbmRsZShcInN0YXJ0XCIpO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUpIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0aWYoZGVwU3RvcmUpIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlbW92ZS5zdG9yZVwiIDogZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cdFx0XHRcdFx0XHR2YXIgaXNUaGlzTmFtZVNwYWNlID0gZnVuY3Rpb24obWV0YSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKHRoaXMuYWN0aW9uTWFwKSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgaWR4ID0gdi5maW5kSW5kZXgoaXNUaGlzTmFtZVNwYWNlKTtcblx0XHRcdFx0XHRcdFx0aWYoaWR4ICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdHYuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBoYW5kbGluZyA9IHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcodGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGUpO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gaGFuZGxpbmcuc3RvcmVzO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBoYW5kbGluZy50cmVlO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCA/IFwiZGlzcGF0Y2hpbmdcIiA6IFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgYWxsIHN5bmMuLi5oZW5jZSB0aGUgdHJhbnNpdGlvbiBjYWxsIGJlbG93LlxuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcblx0XHRcdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb29yZGluYXRvci5zdGFydCgpO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKGFjdGlvblR5cGUpIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHR0cmVlOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVtb3ZlLnN0b3JlXCIsIG5hbWVzcGFjZSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbmZ1bmN0aW9uIGdldEdyb3Vwc1dpdGhBY3Rpb24oYWN0aW9uTmFtZSkge1xuXHR2YXIgZ3JvdXBzID0gW107XG5cdGZvcih2YXIgW2dyb3VwLCBsaXN0XSBvZiBlbnRyaWVzKGFjdGlvbkdyb3VwcykpIHtcblx0XHRpZihsaXN0LmluZGV4T2YoYWN0aW9uTmFtZSkgPj0gMCkge1xuXHRcdFx0Z3JvdXBzLnB1c2goZ3JvdXApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG4vLyBOT1RFIC0gdGhlc2Ugd2lsbCBldmVudHVhbGx5IGxpdmUgaW4gdGhlaXIgb3duIGFkZC1vbiBsaWIgb3IgaW4gYSBkZWJ1ZyBidWlsZCBvZiBsdXhcbnZhciB1dGlscyA9IHtcblx0cHJpbnRBY3Rpb25zKCkge1xuXHRcdHZhciBhY3Rpb25MaXN0ID0gT2JqZWN0LmtleXMoYWN0aW9ucylcblx0XHRcdC5tYXAoZnVuY3Rpb24oeCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoeCkuc3RvcmVzLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4Lm5hbWVzcGFjZTsgfSkuam9pbihcIixcIiksXG5cdFx0XHRcdFx0XCJncm91cHNcIiA6IGdldEdyb3Vwc1dpdGhBY3Rpb24oeCkuam9pbihcIixcIilcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0Y29uc29sZS5ncm91cChcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIik7XG5cdFx0XHRjb25zb2xlLnRhYmxlKGFjdGlvbkxpc3QpO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0Y29uc29sZS5sb2coYWN0aW9uTGlzdCk7XG5cdFx0fVxuXHR9LFxuXG5cdHByaW50U3RvcmVEZXBUcmVlKGFjdGlvblR5cGUpIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25UeXBlXSA6IGFjdGlvblR5cGU7XG5cdFx0aWYoIWFjdGlvblR5cGUpIHtcblx0XHRcdGFjdGlvblR5cGUgPSBPYmplY3Qua2V5cyhhY3Rpb25zKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKGZ1bmN0aW9uKGF0KXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoYXQpXG5cdFx0XHQgICAgLnRyZWUuZm9yRWFjaChmdW5jdGlvbih4KSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICh4Lmxlbmd0aCkge1xuXHRcdFx0ICAgICAgICAgICAgdmFyIHQgPSB4LnBvcCgpO1xuXHRcdFx0ICAgICAgICAgICAgdHJlZS5wdXNoKHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbihcIixcIiksXG5cdFx0XHQgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdCAgICAgICAgICAgIH0pO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCk7XG5cdFx0XHRcdGNvbnNvbGUudGFibGUodHJlZSk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgKTtcblx0XHRcdFx0Y29uc29sZS5sb2codHJlZSk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnMsXG5cdFx0YWRkVG9BY3Rpb25Hcm91cCxcblx0XHRjb21wb25lbnQsXG5cdFx0Y29udHJvbGxlclZpZXcsXG5cdFx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0XHRkaXNwYXRjaGVyLFxuXHRcdGdldEFjdGlvbkdyb3VwLFxuXHRcdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0XHRhY3Rpb25DcmVhdG9yLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZSxcblx0XHRzdG9yZXMsXG5cdFx0dXRpbHNcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==