/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.3.3
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["traceur", "react", "postal", "machina", "lodash"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = function(React, postal, machina, lodash) {
      return factory(require("traceur"), React || require("react"), postal || require("postal"), machina || require("machina"), lodash || require("lodash"));
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}(this, function(traceur, React, postal, machina, _) {
  var $__13 = $traceurRuntime.initGeneratorFunction(entries);
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
            if (["object", "function"].indexOf(typeof obj) === -1) {
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
    }, $__13, this);
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
  var extend = function() {
    for (var options = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      options[$__7] = arguments[$__7];
    var parent = this;
    var store;
    var storeObj = {};
    var ctor = function() {};
    var mixins = [];
    for (var $__5 = options[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__6; !($__6 = $__5.next()).done; ) {
      var opt = $__6.value;
      {
        mixins.push(_.pick(opt, ["handlers", "state"]));
        delete opt.handlers;
        delete opt.state;
      }
    }
    var protoProps = _.merge.apply(this, [{}].concat(options));
    if (protoProps && protoProps.hasOwnProperty("constructor")) {
      store = protoProps.constructor;
    } else {
      store = function() {
        var args = Array.from(arguments);
        args[0] = args[0] || {};
        parent.apply(this, store.mixins.concat(args));
      };
    }
    store.mixins = mixins;
    _.merge(store, parent);
    ctor.prototype = parent.prototype;
    store.prototype = new ctor();
    if (protoProps) {
      _.extend(store.prototype, protoProps);
    }
    store.prototype.constructor = store;
    store.__super__ = parent.prototype;
    return store;
  };
  var actions = Object.create(null);
  var actionGroups = {};
  function buildActionList(handlers) {
    var actionList = [];
    for (var $__5 = entries(handlers)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__12 = $__6.value,
          key = $__12[0],
          handler = $__12[1];
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
        var $__12 = $__6.value,
            key = $__12[0],
            sub = $__12[1];
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
          var $__12 = $__6.value,
              k = $__12[0],
              v = $__12[1];
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
            $__8 = 1; $__8 < arguments.length; $__8++)
          args[$__8 - 1] = arguments[$__8];
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
    var $__12 = arguments[0] !== (void 0) ? arguments[0] : {},
        handlers = $__12.handlers,
        handlerFn = $__12.handlerFn,
        context = $__12.context,
        channel = $__12.channel,
        topic = $__12.topic;
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
        $__9 = 1; $__9 < arguments.length; $__9++)
      mixins[$__9 - 1] = arguments[$__9];
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
  function ensureStoreOptions(options, handlers, store) {
    var namespace = (options && options.namespace) || store.namespace;
    if (namespace in stores) {
      throw new Error((" The store namespace \"" + namespace + "\" already exists."));
    }
    if (!namespace) {
      throw new Error("A lux store must have a namespace value provided");
    }
    if (!handlers || !Object.keys(handlers).length) {
      throw new Error("A lux store must have action handler methods provided");
    }
  }
  function getHandlerObject(handlers, key, listeners) {
    return {
      waitFor: [],
      handler: function() {
        var changed = 0;
        var args = Array.from(arguments);
        listeners[key].forEach(function(listener) {
          changed += (listener.apply(this, args) === false ? 0 : 1);
        }.bind(this));
        return changed > 0;
      }
    };
  }
  function updateWaitFor(source, handlerObject) {
    if (source.waitFor) {
      source.waitFor.forEach(function(dep) {
        if (handlerObject.waitFor.indexOf(dep) === -1) {
          handlerObject.waitFor.push(dep);
        }
      });
    }
  }
  function addListeners(listeners, key, handler) {
    listeners[key] = listeners[key] || [];
    listeners[key].push(handler.handler || handler);
  }
  function processStoreArgs() {
    for (var options = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      options[$__10] = arguments[$__10];
    var listeners = {};
    var handlers = {};
    var state = {};
    var otherOpts = {};
    options.forEach(function(opt) {
      if (opt) {
        _.merge(state, opt.state);
        if (opt.handlers) {
          Object.keys(opt.handlers).forEach(function(key) {
            var handler = opt.handlers[key];
            handlers[key] = handlers[key] || getHandlerObject(handlers, key, listeners);
            updateWaitFor(handler, handlers[key]);
            addListeners(listeners, key, handler);
          });
        }
        delete opt.handlers;
        delete opt.state;
        _.merge(otherOpts, opt);
      }
    });
    return [state, handlers, otherOpts];
  }
  var Store = function Store() {
    "use strict";
    for (var opt = [],
        $__11 = 0; $__11 < arguments.length; $__11++)
      opt[$__11] = arguments[$__11];
    var $__12 = processStoreArgs.apply(null, $traceurRuntime.spread(opt)),
        state = $__12[0],
        handlers = $__12[1],
        options = $__12[2];
    ensureStoreOptions(options, handlers, this);
    var namespace = options.namespace || this.namespace;
    Object.assign(this, options);
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
          var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
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
      actions: buildActionList(handlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__12 = $__6.value,
            k = $__12[0],
            subscription = $__12[1];
        {
          subscription.unsubscribe();
        }
      }
      delete stores[this.namespace];
      dispatcher.removeStore(this.namespace);
    }}, {});
  Store.extend = extend;
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
      var $__12 = $__6.value,
          key = $__12[0],
          item = $__12[1];
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
              var $__12 = $__6.value,
                  k = $__12[0],
                  v = $__12[1];
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
      var $__12 = $__6.value,
          group = $__12[0],
          list = $__12[1];
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
//# sourceURL=lux-es6.js
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHV4LWVzNi5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImx1eC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiLCBcImxvZGFzaFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIGxvZGFzaCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwgfHwgcmVxdWlyZShcInBvc3RhbFwiKSxcblx0XHRcdFx0bWFjaGluYSB8fCByZXF1aXJlKFwibWFjaGluYVwiKSxcblx0XHRcdFx0bG9kYXNoIHx8IHJlcXVpcmUoXCJsb2Rhc2hcIikpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgXyApIHtcblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRpZihbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YodHlwZW9mIG9iaikgPT09IC0xKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24uY29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAuY29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0dmFyIGV4dGVuZCA9IGZ1bmN0aW9uKCAuLi5vcHRpb25zICkge1xuXHRcdHZhciBwYXJlbnQgPSB0aGlzO1xuXHRcdHZhciBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdFx0dmFyIHN0b3JlT2JqID0ge307IC8vIG9iamVjdCB1c2VkIHRvIGhvbGQgaW5pdGlhbFN0YXRlICYgc3RhdGVzIGZyb20gcHJvdG90eXBlIGZvciBpbnN0YW5jZS1sZXZlbCBtZXJnaW5nXG5cdFx0dmFyIGN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdFx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0XHR2YXIgbWl4aW5zID0gW107XG5cdFx0Zm9yKCB2YXIgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdFx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHRcdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHRcdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0XHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdFx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRcdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHRcdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdFx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0c3RvcmUucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcblxuXHRcdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHRcdC8vIGlmIHN1cHBsaWVkLlxuXHRcdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0XHR9XG5cblx0XHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdFx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0XHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRcdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdFx0cmV0dXJuIHN0b3JlO1xuXHR9O1xuXG5cdFxuXG52YXIgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKGFjdGlvbkxpc3QpIHtcblx0YWN0aW9uTGlzdCA9ICh0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIikgPyBbYWN0aW9uTGlzdF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0aWYoIWFjdGlvbnNbYWN0aW9uXSkge1xuXHRcdFx0YWN0aW9uc1thY3Rpb25dID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzW2dyb3VwXSApIHtcblx0XHRyZXR1cm4gcGx1Y2soYWN0aW9ucywgYWN0aW9uR3JvdXBzW2dyb3VwXSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25zID0gT2JqZWN0LmFzc2lnbihhY3Rpb25zLCBhY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKGdyb3VwTmFtZSwgYWN0aW9uTGlzdCkge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXTtcblx0aWYoIWdyb3VwKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pe1xuXHRcdGlmKGdyb3VwLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKGFjdGlvbik7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gdHJ1ZTtcblx0dmFyIF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHR2YXIgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AodGhpcyk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgKTtcblx0XHR9XG5cblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKChzdG9yZSkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1tgJHtzdG9yZX0uY2hhbmdlZGBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZShgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSkpO1xuXHRcdH0pO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IodmFyIFtrZXksIHN1Yl0gb2YgZW50cmllcyh0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMpKSB7XG5cdFx0XHR2YXIgc3BsaXQ7XG5cdFx0XHRpZihrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpKSAmJiBzcGxpdFsxXSA9PT0gXCJjaGFuZ2VkXCIgKSkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2V0ID0gKGssIHYpID0+IHtcblx0XHRcdGlmKCF0aGlzW2tdKSB7XG5cdFx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCgoZ3JvdXApID0+IHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uR3JvdXAoZ3JvdXApKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrLCB2KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmKHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblx0XHRcdFx0dmFyIHZhbCA9IGFjdGlvbnNbIGtleSBdO1xuXHRcdFx0XHRpZiAoIHZhbCApIHtcblx0XHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrZXksIHZhbCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2tleX0nYCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogZnVuY3Rpb24oYWN0aW9uLCAuLi5hcmdzKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogbHV4QWN0aW9uQ3JlYXRvck1peGluLm1peGluLnB1Ymxpc2hBY3Rpb25cbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbiA9IGZ1bmN0aW9uKHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9KSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcChjb250ZXh0KTtcblx0XHRcdHZhciBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKChkYXRhLCBlbnYpID0+IHtcblx0XHRcdFx0dmFyIGhhbmRsZXI7XG5cdFx0XHRcdGlmKGhhbmRsZXIgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseShjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmKCFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoaGFuZGxlcnMpLmxlbmd0aCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFjdGlvbiBoYW5kbGVyIGluIHRoZSBoYW5kbGVycyBwcm9wZXJ0eVwiICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIgKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIHNpbmNlIHdlIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0IGFscmVhZHlcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9XG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuIClcblx0XHRcdFx0KTtcblx0XHRcdHZhciBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKGhhbmRsZXJzKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihoYW5kbGVyS2V5cyk7XG5cdFx0XHRpZihjb250ZXh0Lm5hbWVzcGFjZSkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgUmVhY3QgQ29tcG9uZW50IFZlcnNpb25zIG9mIEFib3ZlIE1peGluICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gY29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhBY3Rpb25DcmVhdG9yUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBHZW5lcmFsaXplZCBNaXhpbiBCZWhhdmlvciBmb3Igbm9uLWx1eCAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCwgLi4ubWl4aW5zKSB7XG5cdGlmKG1peGlucy5sZW5ndGggPT09IDApIHtcblx0XHRtaXhpbnMgPSBbbHV4U3RvcmVNaXhpbiwgbHV4QWN0aW9uQ3JlYXRvck1peGluXTtcblx0fVxuXG5cdG1peGlucy5mb3JFYWNoKChtaXhpbikgPT4ge1xuXHRcdGlmKHR5cGVvZiBtaXhpbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRtaXhpbiA9IG1peGluKCk7XG5cdFx0fVxuXHRcdGlmKG1peGluLm1peGluKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIG1peGluLm1peGluKTtcblx0XHR9XG5cdFx0bWl4aW4uc2V0dXAuY2FsbChjb250ZXh0KTtcblx0XHRpZihtaXhpbi50ZWFyZG93bikge1xuXHRcdFx0Y29udGV4dC5fX2x1eC5jbGVhbnVwLnB1c2goIG1peGluLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9KTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGx1eEFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IodGFyZ2V0KSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKHRhcmdldCkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdGVuZXIoIHRhcmdldCApKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucywgaGFuZGxlcnMsIHN0b3JlKSB7XG5cdHZhciBuYW1lc3BhY2UgPSAob3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0fVxuXHRpZighbmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoaGFuZGxlcnMpLmxlbmd0aCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGhhbmRsZXJzLCBrZXksIGxpc3RlbmVycyApIHtcblx0cmV0dXJuIHtcblx0XHR3YWl0Rm9yOiBbXSxcblx0XHRoYW5kbGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBjaGFuZ2VkID0gMDtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRsaXN0ZW5lcnNbIGtleSBdLmZvckVhY2goIGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiggc291cmNlLndhaXRGb3IgKXtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKC4uLm9wdGlvbnMpIHtcblx0dmFyIGxpc3RlbmVycyA9IHt9O1xuXHR2YXIgaGFuZGxlcnMgPSB7fTtcblx0dmFyIHN0YXRlID0ge307XG5cdHZhciBvdGhlck9wdHMgPSB7fTtcblx0b3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggb3B0ICkge1xuXHRcdGlmKCBvcHQgKSB7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHR2YXIgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBoYW5kbGVycywga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBbIHN0YXRlLCBoYW5kbGVycywgb3RoZXJPcHRzIF07XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvciguLi5vcHQpIHtcblx0XHR2YXIgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0XHRpZighaW5EaXNwYXRjaCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oe1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdLmhhbmRsZXIuYXBwbHkodGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChkYXRhLmRlcHMpKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAocmVzID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLmNvbnN0cmFpbnQoKCkgPT4gaW5EaXNwYXRjaCksXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKHRoaXMubmFtZXNwYWNlKTtcblx0fVxufVxuXG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG5cdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHR9LCBhY3Rpb24pO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSk7XG59XG4vKlxuXHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuXHR7XG5cdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdGFjdGlvbiA6IHtcblx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdH1cblx0fVxuKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge30sXG5cdFx0XHR1cGRhdGVkOiBbXVxuXHRcdH0sIGNvbmZpZyk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHtcblx0XHRcdGhhbmRsZWQ6IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XCIqLmhhbmRsZWQuKlwiLFxuXHRcdFx0XHQoZGF0YSkgPT4gdGhpcy5oYW5kbGUoXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhKVxuXHRcdFx0KVxuXHRcdH07XG5cblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHVuaW5pdGlhbGl6ZWQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXIoKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV07XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoKGV4KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXg7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5oYW5kbGVkXCI6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRcdGlmKGRhdGEuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZWQucHVzaChkYXRhLm5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IHRoaXMudXBkYXRlZCB9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN1Y2Nlc3M6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZmFpbHVyZToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJhY3Rpb24uZmFpbHVyZVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGVycjogdGhpcy5lcnJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHN0YXJ0KCkge1xuXHRcdHRoaXMuaGFuZGxlKFwic3RhcnRcIik7XG5cdH1cbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbiwgYWN0aW9uVHlwZSkge1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHRpZihkZXBTdG9yZSkge1xuXHRcdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdFx0fVxuXHRcdFx0fSAvKmVsc2Uge1xuXHRcdFx0XHQvLyBUT0RPOiBhZGQgY29uc29sZS53YXJuIG9uIGRlYnVnIGJ1aWxkXG5cdFx0XHRcdC8vIG5vdGluZyB0aGF0IGEgc3RvcmUgYWN0aW9uIHNwZWNpZmllcyBhbm90aGVyIHN0b3JlXG5cdFx0XHRcdC8vIGFzIGEgZGVwZW5kZW5jeSB0aGF0IGRvZXMgTk9UIHBhcnRpY2lwYXRlIGluIHRoZSBhY3Rpb25cblx0XHRcdFx0Ly8gdGhpcyBpcyB3aHkgYWN0aW9uVHlwZSBpcyBhbiBhcmcgaGVyZS4uLi5cblx0XHRcdH0qL1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlICkge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUpKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRjb29yZGluYXRvcnM6IFtdLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7fTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGFjdGlvbk1ldGFcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVtb3ZlLnN0b3JlXCIgOiBmdW5jdGlvbihuYW1lc3BhY2UpIHtcblx0XHRcdFx0XHRcdHZhciBpc1RoaXNOYW1lU3BhY2UgPSBmdW5jdGlvbihtZXRhKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXModGhpcy5hY3Rpb25NYXApKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBpZHggPSB2LmZpbmRJbmRleChpc1RoaXNOYW1lU3BhY2UpO1xuXHRcdFx0XHRcdFx0XHRpZihpZHggIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0di5zcGxpY2UoaWR4LCAxKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGhhbmRsaW5nID0gdGhpcy5nZXRTdG9yZXNIYW5kbGluZyh0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZSk7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBoYW5kbGluZy5zdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGhhbmRsaW5nLnRyZWU7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0Ly8gVGhpcyBpcyBhbGwgc3luYy4uLmhlbmNlIHRoZSB0cmFuc2l0aW9uIGNhbGwgYmVsb3cuXG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yLnN0YXJ0KCk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoYWN0aW9uVHlwZSkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uVHlwZV0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdHRyZWU6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0KGRhdGEsIGVudikgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKGNvbmZpZykge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgY29uZmlnKTtcblx0fVxuXG5cdHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJyZW1vdmUuc3RvcmVcIiwgbmFtZXNwYWNlKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxuZnVuY3Rpb24gZ2V0R3JvdXBzV2l0aEFjdGlvbihhY3Rpb25OYW1lKSB7XG5cdHZhciBncm91cHMgPSBbXTtcblx0Zm9yKHZhciBbZ3JvdXAsIGxpc3RdIG9mIGVudHJpZXMoYWN0aW9uR3JvdXBzKSkge1xuXHRcdGlmKGxpc3QuaW5kZXhPZihhY3Rpb25OYW1lKSA+PSAwKSB7XG5cdFx0XHRncm91cHMucHVzaChncm91cCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxudmFyIHV0aWxzID0ge1xuXHRwcmludEFjdGlvbnMoKSB7XG5cdFx0dmFyIGFjdGlvbkxpc3QgPSBPYmplY3Qua2V5cyhhY3Rpb25zKVxuXHRcdFx0Lm1hcChmdW5jdGlvbih4KSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XCJhY3Rpb24gbmFtZVwiIDogeCxcblx0XHRcdFx0XHRcInN0b3Jlc1wiIDogZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyh4KS5zdG9yZXMubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9KS5qb2luKFwiLFwiKSxcblx0XHRcdFx0XHRcImdyb3Vwc1wiIDogZ2V0R3JvdXBzV2l0aEFjdGlvbih4KS5qb2luKFwiLFwiKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0aWYoY29uc29sZSAmJiBjb25zb2xlLnRhYmxlKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKFwiQ3VycmVudGx5IFJlY29nbml6ZWQgQWN0aW9uc1wiKTtcblx0XHRcdGNvbnNvbGUudGFibGUoYWN0aW9uTGlzdCk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0fSBlbHNlIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhhY3Rpb25MaXN0KTtcblx0XHR9XG5cdH0sXG5cblx0cHJpbnRTdG9yZURlcFRyZWUoYWN0aW9uVHlwZSkge1xuXHRcdHZhciB0cmVlID0gW107XG5cdFx0YWN0aW9uVHlwZSA9IHR5cGVvZiBhY3Rpb25UeXBlID09PSBcInN0cmluZ1wiID8gW2FjdGlvblR5cGVdIDogYWN0aW9uVHlwZTtcblx0XHRpZighYWN0aW9uVHlwZSkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKGFjdGlvbnMpO1xuXHRcdH1cblx0XHRhY3Rpb25UeXBlLmZvckVhY2goZnVuY3Rpb24oYXQpe1xuXHRcdFx0ZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyhhdClcblx0XHRcdCAgICAudHJlZS5mb3JFYWNoKGZ1bmN0aW9uKHgpIHtcblx0XHRcdCAgICAgICAgd2hpbGUgKHgubGVuZ3RoKSB7XG5cdFx0XHQgICAgICAgICAgICB2YXIgdCA9IHgucG9wKCk7XG5cdFx0XHQgICAgICAgICAgICB0cmVlLnB1c2goe1xuXHRcdFx0ICAgICAgICAgICAgXHRcImFjdGlvbiB0eXBlXCIgOiBhdCxcblx0XHRcdCAgICAgICAgICAgICAgICBcInN0b3JlIG5hbWVzcGFjZVwiIDogdC5uYW1lc3BhY2UsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJ3YWl0cyBmb3JcIiA6IHQud2FpdEZvci5qb2luKFwiLFwiKSxcblx0XHRcdCAgICAgICAgICAgICAgICBnZW5lcmF0aW9uOiB0LmdlblxuXHRcdFx0ICAgICAgICAgICAgfSk7XG5cdFx0XHQgICAgICAgIH1cblx0XHRcdCAgICB9KTtcblx0XHQgICAgaWYoY29uc29sZSAmJiBjb25zb2xlLnRhYmxlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH1gKTtcblx0XHRcdFx0Y29uc29sZS50YWJsZSh0cmVlKTtcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdFx0fSBlbHNlIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9OmApO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0cmVlKTtcblx0XHRcdH1cblx0XHRcdHRyZWUgPSBbXTtcblx0XHR9KTtcblx0fVxufTtcblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0YWN0aW9ucyxcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRcdGFjdGlvbkNyZWF0b3IsXG5cdFx0YWN0aW9uTGlzdGVuZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdFN0b3JlLFxuXHRcdHN0b3Jlcyxcblx0XHR1dGlsc1xuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9