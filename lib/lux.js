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
  var actionCreators = Object.create(null);
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
  var luxActionDispatcherMixin = {
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
        for (var $__5 = entries(pluck(actionCreators, this.getActions))[Symbol.iterator](),
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
    mixin: {dispatchAction: function(action) {
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
  var luxActionDispatcherReactMixin = {componentWillMount: luxActionDispatcherMixin.setup};
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
        $__8 = 1; $__8 < arguments.length; $__8++)
      mixins[$__8 - 1] = arguments[$__8];
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
    delete options.state;
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
      this.on("success", fn);
      if (!this._started) {
        this._started = true;
        this.handle("start");
      }
      return this;
    },
    failure: function(fn) {
      "use strict";
      this.on("error", fn);
      if (!this._started) {
        this._started = true;
        this.handle("start");
      }
      return this;
    }
  }, {}, machina.Fsm);
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
      var actions = Object.keys(actionCreators).map(function(x) {
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
        actionType = Object.keys(actionCreators);
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
    stores: stores,
    utils: utils
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FBRWpELFNBQUssQUFBQyxDQUFFLENBQUUsU0FBUSxDQUFHLFFBQU0sQ0FBRyxTQUFPLENBQUcsVUFBUSxDQUFFLENBQUcsUUFBTSxDQUFFLENBQUM7RUFDL0QsS0FBTyxLQUFLLE1BQU8sT0FBSyxDQUFBLEdBQU0sU0FBTyxDQUFBLEVBQUssQ0FBQSxNQUFLLFFBQVEsQ0FBSTtBQUUxRCxTQUFLLFFBQVEsRUFBSSxVQUFVLE1BQUssQ0FBRyxDQUFBLE9BQU0sQ0FBRyxDQUFBLEtBQUksQ0FBSTtBQUNuRCxXQUFPLENBQUEsT0FBTSxBQUFDLENBQ2IsT0FBTSxBQUFDLENBQUMsU0FBUSxDQUFDLENBQ2pCLENBQUEsS0FBSSxHQUFLLENBQUEsT0FBTSxBQUFDLENBQUMsT0FBTSxDQUFDLENBQ3hCLE9BQUssQ0FDTCxRQUFNLENBQUMsQ0FBQztJQUNWLENBQUM7RUFDRixLQUFPO0FBQ04sUUFBTSxJQUFJLE1BQUksQUFBQyxDQUFDLGlFQUFnRSxDQUFDLENBQUM7RUFDbkY7QUFBQSxBQUNELEFBQUMsQ0FBRSxJQUFHLENBQUcsVUFBVSxPQUFNLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxPQUFNO1lDekJqRCxDQUFBLGVBQWMsc0JBQXNCLEFBQUMsU0FBa0I7QUQyQnRELEFBQUksSUFBQSxDQUFBLGFBQVksRUFBSSxDQUFBLE1BQUssUUFBUSxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUM7QUFDaEQsQUFBSSxJQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsTUFBSyxRQUFRLEFBQUMsQ0FBQyxXQUFVLENBQUMsQ0FBQztBQUM5QyxBQUFJLElBQUEsQ0FBQSxpQkFBZ0IsRUFBSSxDQUFBLE1BQUssUUFBUSxBQUFDLENBQUMsZ0JBQWUsQ0FBQyxDQUFDO0FBQ3hELEFBQUksSUFBQSxDQUFBLE1BQUssRUFBSSxHQUFDLENBQUM7QUFHZixTQUFVLFFBQU0sQ0FBRSxHQUFFOzs7O0FFakNyQixTQUFPLENDQVAsZUFBYyx3QkFBd0IsQURBZCxDRUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFlBQU8sSUFBRzs7O0FKaUNkLGVBQUcsTUFBTyxJQUFFLENBQUEsR0FBTSxTQUFPLENBQUc7QUFDM0IsZ0JBQUUsRUFBSSxHQUFDLENBQUM7WUFDVDtBQUFBOzs7aUJLbENlLENMbUNGLE1BQUssS0FBSyxBQUFDLENBQUMsR0FBRSxDQUFDLENLbkNLLE1BQUssU0FBUyxDQUFDLEFBQUMsRUFBQzs7OztBQ0ZwRCxlQUFHLE1BQU0sRUFBSSxDQUFBLENESUEsQ0FBQyxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxDQ0pqQyxTQUF3QyxDQUFDO0FBQ2hFLGlCQUFJOzs7Ozs7O0FDRFosaUJQc0NTLEVBQUMsQ0FBQSxDQUFHLENBQUEsR0FBRSxDQUFFLENBQUEsQ0FBQyxDQUFDLENPdENJOztBQ0F2QixlQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUNBaEIsaUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FMQ21CLElBQy9CLFFGQTZCLEtBQUcsQ0FBQyxDQUFDO0VGc0NyQztBQUdBLFNBQVMsTUFBSSxDQUFFLEdBQUUsQ0FBRyxDQUFBLElBQUc7QUFDdEIsQUFBSSxNQUFBLENBQUEsR0FBRSxFQUFJLENBQUEsSUFBRyxPQUFPLEFBQUMsRUFBQyxTQUFDLEtBQUksQ0FBRyxDQUFBLEdBQUUsQ0FBTTtBQUNyQyxVQUFJLENBQUUsR0FBRSxDQUFDLEVBQUksQ0FBQSxHQUFFLENBQUUsR0FBRSxDQUFDLENBQUM7QUFDckIsV0FBTyxNQUFJLENBQUM7SUFDYixFQUFHLEdBQUMsQ0FBQyxDQUFDO0FBQ04sU0FBTyxJQUFFLENBQUM7RUFDWDtBQUVBLFNBQVMsbUJBQWlCLENBQUUsT0FBTSxDQUFHLENBQUEsWUFBVyxDQUFHO0FBQ2xELFNBQU8sQ0FBQSxZQUFXLFlBQVksQUFBQyxDQUFDLE9BQU0sQ0FBQyxlQUNOLEFBQUMsQ0FBQyxTQUFTLElBQUcsQ0FBRyxDQUFBLFFBQU8sQ0FBRTtBQUNwQyxXQUFPLENBQUEsQ0FBQyxDQUFDLFFBQU8sZUFBZSxBQUFDLENBQUMsVUFBUyxDQUFDLENBQUMsQ0FBQSxFQUN6QyxFQUFDLFFBQU8sU0FBUyxJQUFNLENBQUEsTUFBSyxXQUFXLEFBQUMsRUFBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0VBQ3RCO0FBQUEsQUFFQSxTQUFTLGNBQVksQ0FBRSxPQUFNLENBQUc7QUFDL0IsQUFBSSxNQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxNQUFNLEVBQUksRUFBQyxPQUFNLE1BQU0sR0FBSyxHQUFDLENBQUMsQ0FBQztBQUNqRCxBQUFJLE1BQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxLQUFJLFFBQVEsRUFBSSxFQUFDLEtBQUksUUFBUSxHQUFLLEdBQUMsQ0FBQyxDQUFDO0FBQ25ELEFBQUksTUFBQSxDQUFBLGFBQVksRUFBSSxDQUFBLEtBQUksY0FBYyxFQUFJLEVBQUMsS0FBSSxjQUFjLEdBQUssR0FBQyxDQUFDLENBQUM7QUFDckUsU0FBTyxNQUFJLENBQUM7RUFDYjtBQUFBLEFBSUcsSUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLE1BQUssT0FBTyxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFDeEMsQUFBSSxJQUFBLENBQUEsWUFBVyxFQUFJLEdBQUMsQ0FBQztBQUVyQixTQUFTLGdCQUFjLENBQUUsUUFBTztBQUMvQixBQUFJLE1BQUEsQ0FBQSxVQUFTLEVBQUksR0FBQyxDQUFDO0FLdkVaLFFBQVMsR0FBQSxPQUNBLENMdUVXLE9BQU0sQUFBQyxDQUFDLFFBQU8sQ0FBQyxDS3ZFVCxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7QUFDbkMsV0FBZ0IsQ0FDcEIsRUFBQyxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxHQUFLOztBTHFFMUQsWUFBRTtBQUFHLGdCQUFNO0FBQXlCO0FBQzdDLGlCQUFTLEtBQUssQUFBQyxDQUFDO0FBQ2YsbUJBQVMsQ0FBRyxJQUFFO0FBQ2QsZ0JBQU0sQ0FBRyxDQUFBLE9BQU0sUUFBUSxHQUFLLEdBQUM7QUFBQSxRQUM5QixDQUFDLENBQUM7TUFDSDtJS3ZFTztBQUFBLEFMd0VQLFNBQU8sV0FBUyxDQUFDO0VBQ2xCO0FBRUEsU0FBUyxzQkFBb0IsQ0FBRSxVQUFTLENBQUc7QUFDMUMsYUFBUyxFQUFJLENBQUEsQ0FBQyxNQUFPLFdBQVMsQ0FBQSxHQUFNLFNBQU8sQ0FBQyxFQUFJLEVBQUMsVUFBUyxDQUFDLEVBQUksV0FBUyxDQUFDO0FBQ3pFLGFBQVMsUUFBUSxBQUFDLENBQUMsU0FBUyxNQUFLLENBQUc7QUFDbkMsU0FBRyxDQUFDLGNBQWEsQ0FBRSxNQUFLLENBQUMsQ0FBRztBQUMzQixxQkFBYSxDQUFFLE1BQUssQ0FBQyxFQUFJLFVBQVEsQUFBQyxDQUFFO0FBQ25DLEFBQUksWUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLEtBQUksS0FBSyxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7QUFDaEMsc0JBQVksUUFBUSxBQUFDLENBQUM7QUFDckIsZ0JBQUksR0FBRyxVQUFVLEVBQUMsT0FBSyxDQUFFO0FBQ3pCLGVBQUcsQ0FBRztBQUNMLHVCQUFTLENBQUcsT0FBSztBQUNqQix1QkFBUyxDQUFHLEtBQUc7QUFBQSxZQUNoQjtBQUFBLFVBQ0QsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztNQUNGO0FBQUEsSUFDRCxDQUFDLENBQUM7RUFDSDtBQUFBLEFBRUEsU0FBUyxlQUFhLENBQUcsS0FBSSxDQUFJO0FBQ2hDLFNBQU8sQ0FBQSxZQUFXLENBQUUsS0FBSSxDQUFDLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxjQUFhLENBQUcsQ0FBQSxZQUFXLENBQUUsS0FBSSxDQUFDLENBQUMsQ0FBQSxDQUFJLEdBQUMsQ0FBQztFQUM3RTtBQUFBLEFBRUEsU0FBUyxvQkFBa0IsQ0FBRSxNQUFLLENBQUc7QUFDcEMsaUJBQWEsRUFBSSxDQUFBLE1BQUssT0FBTyxBQUFDLENBQUMsY0FBYSxDQUFHLE9BQUssQ0FBQyxDQUFDO0VBQ3ZEO0FBQUEsQUFFQSxTQUFTLGlCQUFlLENBQUUsU0FBUSxDQUFHLENBQUEsT0FBTSxDQUFHO0FBQzdDLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLFlBQVcsQ0FBRSxTQUFRLENBQUMsQ0FBQztBQUNuQyxPQUFHLENBQUMsS0FBSSxDQUFHO0FBQ1YsVUFBSSxFQUFJLENBQUEsWUFBVyxDQUFFLFNBQVEsQ0FBQyxFQUFJLEdBQUMsQ0FBQztJQUNyQztBQUFBLEFBQ0EsVUFBTSxFQUFJLENBQUEsTUFBTyxRQUFNLENBQUEsR0FBTSxTQUFPLENBQUEsQ0FBSSxFQUFDLE9BQU0sQ0FBQyxFQUFJLFFBQU0sQ0FBQztBQUMzRCxVQUFNLFFBQVEsQUFBQyxDQUFDLFNBQVMsTUFBSyxDQUFFO0FBQy9CLFNBQUcsS0FBSSxRQUFRLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBQSxHQUFNLEVBQUMsQ0FBQSxDQUFJO0FBQ2pDLFlBQUksS0FBSyxBQUFDLENBQUMsTUFBSyxDQUFDLENBQUM7TUFDbkI7QUFBQSxJQUNELENBQUMsQ0FBQztFQUNIO0FBQUEsQUFTQSxTQUFTLFdBQVMsQ0FBRSxLQUFJLENBQUcsQ0FBQSxJQUFHLENBQUc7QUFDaEMsQUFBSSxNQUFBLENBQUEsT0FBTSxFQUFJLEdBQUMsQ0FBQztBQUNoQixVQUFNLENBQUUsS0FBSSxDQUFDLEVBQUksS0FBRyxDQUFDO0FBQ3JCLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLElBQUcsTUFBTSxDQUFDO0FBRXRCLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLEtBQUksUUFBUSxRQUFRLEFBQUMsQ0FBRSxLQUFJLENBQUUsQ0FBQztBQUUxQyxPQUFLLEtBQUksRUFBSSxFQUFDLENBQUEsQ0FBSTtBQUNqQixVQUFJLFFBQVEsT0FBTyxBQUFDLENBQUUsS0FBSSxDQUFHLEVBQUEsQ0FBRSxDQUFDO0FBQ2hDLFVBQUksVUFBVSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztBQUUvQixTQUFLLEtBQUksUUFBUSxPQUFPLElBQU0sRUFBQSxDQUFJO0FBQ2pDLFlBQUksVUFBVSxFQUFJLEdBQUMsQ0FBQztBQUNwQixXQUFHLE9BQU8sU0FBUyxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUcsUUFBTSxDQUFDLENBQUM7TUFDekM7QUFBQSxJQUNELEtBQU87QUFDTixTQUFHLE9BQU8sU0FBUyxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUcsUUFBTSxDQUFDLENBQUM7SUFDekM7QUFBQSxFQUNEO0FBQUEsQUFFQSxTQUFTLGdCQUFjLENBQUcsSUFBRzs7QUFDNUIsT0FBRyxNQUFNLFFBQVEsRUFBSSxDQUFBLElBQUcsT0FBTyxPQUFPLEFBQUMsRUFDdEMsU0FBRSxJQUFHO1dBQU8sQ0FBQSxXQUFVLFNBQVMsUUFBUSxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUEsQ0FBSSxFQUFDLENBQUE7SUFBQSxFQUNyRCxDQUFDO0VBQ0Y7QUFFQSxBQUFJLElBQUEsQ0FBQSxhQUFZLEVBQUk7QUFDbkIsUUFBSSxDQUFHLFVBQVMsQUFBQzs7QUFDaEIsQUFBSSxRQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsYUFBWSxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFDL0IsQUFBSSxRQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsSUFBRyxPQUFPLEVBQUksRUFBQyxJQUFHLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FBQztBQUM5QyxBQUFJLFFBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxNQUFPLE9BQUssU0FBUyxDQUFBLEdBQU0sU0FBTyxDQUFBLENBQUksRUFBQyxNQUFLLFNBQVMsQ0FBQyxFQUFJLENBQUEsTUFBSyxTQUFTLENBQUM7QUFDeEYsQUFBSSxRQUFBLENBQUEsMEJBQXlCLEVBQUksVUFBUSxBQUFDLENBQUU7QUFDM0MsWUFBTSxJQUFJLE1BQUksQUFBQyxFQUFDLDREQUE0RCxFQUFDLFNBQU8sRUFBQywyQ0FBeUMsRUFBQyxDQUFDO01BQ2pJLENBQUM7QUFDRCxVQUFJLFFBQVEsRUFBSSxHQUFDLENBQUM7QUFDbEIsVUFBSSxVQUFVLEVBQUksR0FBQyxDQUFDO0FBRXBCLFdBQUssU0FBUyxFQUFJLENBQUEsTUFBSyxTQUFTLEdBQUssMkJBQXlCLENBQUM7QUFFL0QsYUFBTyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUk7QUFDckIsWUFBSSxjQUFjLEVBQUssS0FBSSxFQUFDLFdBQVMsRUFBQyxFQUFJLENBQUEsWUFBVyxVQUFVLEFBQUMsRUFBSSxLQUFJLEVBQUMsV0FBUyxJQUFHLFNBQUEsQUFBQztlQUFLLENBQUEsVUFBUyxLQUFLLEFBQUMsTUFBTyxNQUFJLENBQUM7UUFBQSxFQUFDLENBQUM7TUFDekgsRUFBQyxDQUFDO0FBRUYsVUFBSSxjQUFjLFVBQVUsRUFBSSxDQUFBLGlCQUFnQixVQUFVLEFBQUMsQ0FBQyxXQUFVLEdBQUcsU0FBQyxJQUFHO2FBQU0sQ0FBQSxlQUFjLEtBQUssQUFBQyxNQUFPLEtBQUcsQ0FBQztNQUFBLEVBQUMsQ0FBQztJQUNySDtBQUNBLFdBQU8sQ0FBRyxVQUFTLEFBQUM7QUs1S2IsVUFBUyxHQUFBLE9BQ0EsQ0w0S08sT0FBTSxBQUFDLENBQUMsSUFBRyxNQUFNLGNBQWMsQ0FBQyxDSzVLckIsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLGFBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUwwSzFELGNBQUU7QUFBRyxjQUFFO0FBQXlDO0FBQ3hELEFBQUksWUFBQSxDQUFBLEtBQUksQ0FBQztBQUNULGFBQUcsR0FBRSxJQUFNLFlBQVUsQ0FBQSxFQUFLLEVBQUUsS0FBSSxFQUFJLENBQUEsR0FBRSxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQSxFQUFLLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxJQUFNLFVBQVEsQ0FBRSxDQUFHO0FBQy9FLGNBQUUsWUFBWSxBQUFDLEVBQUMsQ0FBQztVQUNsQjtBQUFBLFFBQ0Q7TUs1S007QUFBQSxJTDZLUDtBQUNBLFFBQUksQ0FBRyxHQUFDO0FBQUEsRUFDVCxDQUFDO0FBRUQsQUFBSSxJQUFBLENBQUEsa0JBQWlCLEVBQUk7QUFDeEIscUJBQWlCLENBQUcsQ0FBQSxhQUFZLE1BQU07QUFDdEMsWUFBUSxDQUFHLENBQUEsYUFBWSxNQUFNLFVBQVU7QUFDdkMsdUJBQW1CLENBQUcsQ0FBQSxhQUFZLFNBQVM7QUFBQSxFQUM1QyxDQUFDO0FBTUQsQUFBSSxJQUFBLENBQUEsd0JBQXVCLEVBQUk7QUFDOUIsUUFBSSxDQUFHLFVBQVMsQUFBQzs7QUFDaEIsU0FBRyxlQUFlLEVBQUksQ0FBQSxJQUFHLGVBQWUsR0FBSyxHQUFDLENBQUM7QUFDL0MsU0FBRyxXQUFXLEVBQUksQ0FBQSxJQUFHLFdBQVcsR0FBSyxHQUFDLENBQUM7QUFDdkMsQUFBSSxRQUFBLENBQUEsb0JBQW1CLElBQUksU0FBQyxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQU07QUFDcEMsV0FBRyxDQUFDLEtBQUssQ0FBQSxDQUFDLENBQUc7QUFDWCxjQUFLLENBQUEsQ0FBQyxFQUFJLEVBQUEsQ0FBQztRQUNaO0FBQUEsTUFDRixDQUFBLENBQUM7QUFDRCxTQUFHLGVBQWUsUUFBUSxBQUFDLEVBQUMsU0FBQyxLQUFJO0FLMU0zQixZQUFTLEdBQUEsT0FDQSxDTDBNSSxPQUFNLEFBQUMsQ0FBQyxjQUFhLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQyxDSzFNZixNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7QUFDbkMsZUFBZ0IsQ0FDcEIsRUFBQyxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxHQUFLOztBTHdNekQsY0FBQTtBQUFHLGNBQUE7QUFBc0M7QUFDakQsK0JBQW1CLEFBQUMsQ0FBQyxDQUFBLENBQUcsRUFBQSxDQUFDLENBQUM7VUFDM0I7UUt2TUs7QUFBQSxNTHdNTixFQUFDLENBQUM7QUFDRixTQUFHLElBQUcsV0FBVyxPQUFPLENBQUc7QUsvTXJCLFlBQVMsR0FBQSxPQUNBLENMK01RLE9BQU0sQUFBQyxDQUFDLEtBQUksQUFBQyxDQUFDLGNBQWEsQ0FBRyxDQUFBLElBQUcsV0FBVyxDQUFDLENBQUMsQ0svTXBDLE1BQUssU0FBUyxDQUFDLEFBQUMsRUFBQztBQUNuQyxlQUFnQixDQUNwQixFQUFDLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLEdBQUs7O0FMNk16RCxnQkFBRTtBQUFHLGdCQUFFO0FBQXVEO0FBQ3RFLCtCQUFtQixBQUFDLENBQUMsR0FBRSxDQUFHLElBQUUsQ0FBQyxDQUFDO1VBQy9CO1FLNU1LO0FBQUEsTUw2TU47QUFBQSxJQUNEO0FBQ0EsUUFBSSxDQUFHLEVBQ04sY0FBYSxDQUFHLFVBQVMsTUFBSyxBQUFTLENBQUc7QVV0TmhDLFlBQVMsR0FBQSxPQUFvQixHQUFDO0FBQUcsbUJBQW9DLENBQ2hFLE9BQW9CLENBQUEsU0FBUSxPQUFPLENBQUcsT0FBa0I7QUFDM0QsY0FBa0IsUUFBb0MsQ0FBQyxFQUFJLENBQUEsU0FBUSxNQUFtQixDQUFDO0FBQUEsQVZxTmxHLG9CQUFZLFFBQVEsQUFBQyxDQUFDO0FBQ3JCLGNBQUksR0FBRyxVQUFVLEVBQUMsT0FBSyxDQUFFO0FBQ3pCLGFBQUcsQ0FBRztBQUNMLHFCQUFTLENBQUcsT0FBSztBQUNqQixxQkFBUyxDQUFHLEtBQUc7QUFBQSxVQUNoQjtBQUFBLFFBQ0QsQ0FBQyxDQUFDO01BQ0gsQ0FDRDtBQUFBLEVBQ0QsQ0FBQztBQUVELEFBQUksSUFBQSxDQUFBLDZCQUE0QixFQUFJLEVBQ25DLGtCQUFpQixDQUFHLENBQUEsd0JBQXVCLE1BQU0sQ0FDbEQsQ0FBQztBQUtELEFBQUksSUFBQSxDQUFBLHNCQUFxQixFQUFJLFVBQVMsQUFBb0Q7eURBQUQsR0FBQztBQUFsRCxlQUFPO0FBQUcsZ0JBQVE7QUFBRyxjQUFNO0FBQUcsY0FBTTtBQUFHLFlBQUk7QUFDbEYsU0FBTztBQUNOLFVBQUksQ0FBSixVQUFLLEFBQUM7QUFDTCxjQUFNLEVBQUksQ0FBQSxPQUFNLEdBQUssS0FBRyxDQUFDO0FBQ3pCLEFBQUksVUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLGFBQVksQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ2xDLEFBQUksVUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLEtBQUksY0FBYyxDQUFDO0FBQzlCLGVBQU8sRUFBSSxDQUFBLFFBQU8sR0FBSyxDQUFBLE9BQU0sU0FBUyxDQUFDO0FBQ3ZDLGNBQU0sRUFBSSxDQUFBLE9BQU0sR0FBSyxjQUFZLENBQUM7QUFDbEMsWUFBSSxFQUFJLENBQUEsS0FBSSxHQUFLLFlBQVUsQ0FBQztBQUM1QixnQkFBUSxFQUFJLENBQUEsU0FBUSxHQUFLLEdBQUMsU0FBQyxJQUFHLENBQUcsQ0FBQSxHQUFFLENBQU07QUFDeEMsQUFBSSxZQUFBLENBQUEsT0FBTSxDQUFDO0FBQ1gsYUFBRyxPQUFNLEVBQUksQ0FBQSxRQUFPLENBQUUsSUFBRyxXQUFXLENBQUMsQ0FBRztBQUN2QyxrQkFBTSxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUcsQ0FBQSxJQUFHLFdBQVcsQ0FBQyxDQUFDO1VBQ3hDO0FBQUEsUUFDRCxFQUFDLENBQUM7QUFDRixXQUFHLENBQUMsUUFBTyxDQUFBLEVBQUssRUFBQyxJQUFHLEdBQUssQ0FBQSxJQUFHLGVBQWUsQ0FBQyxDQUFHO0FBTTlDLGdCQUFNO1FBQ1A7QUFBQSxBQUNBLFdBQUcsZUFBZSxFQUNqQixDQUFBLGtCQUFpQixBQUFDLENBQ2pCLE9BQU0sQ0FDTixDQUFBLE9BQU0sVUFBVSxBQUFDLENBQUUsS0FBSSxDQUFHLFVBQVEsQ0FBRSxDQUNyQyxDQUFDO0FBQ0YsNEJBQW9CLEFBQUMsQ0FBQyxNQUFLLEtBQUssQUFBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLENBQUM7TUFDN0M7QUFDQSxhQUFPLENBQVAsVUFBUSxBQUFDLENBQUU7QUFDVixXQUFHLE1BQU0sY0FBYyxlQUFlLFlBQVksQUFBQyxFQUFDLENBQUM7TUFDdEQ7QUFBQSxJQUNELENBQUM7RUFDRixDQUFDO0FBS0QsU0FBUyxlQUFhLENBQUUsT0FBTSxDQUFHO0FBQ2hDLEFBQUksTUFBQSxDQUFBLEdBQUUsRUFBSSxFQUNULE1BQUssQ0FBRyxDQUFBLENBQUMsa0JBQWlCLENBQUcsOEJBQTRCLENBQUMsT0FBTyxBQUFDLENBQUMsT0FBTSxPQUFPLEdBQUssR0FBQyxDQUFDLENBQ3hGLENBQUM7QUFDRCxTQUFPLFFBQU0sT0FBTyxDQUFDO0FBQ3JCLFNBQU8sQ0FBQSxLQUFJLFlBQVksQUFBQyxDQUFDLE1BQUssT0FBTyxBQUFDLENBQUMsR0FBRSxDQUFHLFFBQU0sQ0FBQyxDQUFDLENBQUM7RUFDdEQ7QUFBQSxBQUVBLFNBQVMsVUFBUSxDQUFFLE9BQU0sQ0FBRztBQUMzQixBQUFJLE1BQUEsQ0FBQSxHQUFFLEVBQUksRUFDVCxNQUFLLENBQUcsQ0FBQSxDQUFDLDZCQUE0QixDQUFDLE9BQU8sQUFBQyxDQUFDLE9BQU0sT0FBTyxHQUFLLEdBQUMsQ0FBQyxDQUNwRSxDQUFDO0FBQ0QsU0FBTyxRQUFNLE9BQU8sQ0FBQztBQUNyQixTQUFPLENBQUEsS0FBSSxZQUFZLEFBQUMsQ0FBQyxNQUFLLE9BQU8sQUFBQyxDQUFDLEdBQUUsQ0FBRyxRQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ3REO0FBQUEsQUFNSSxJQUFBLENBQUEsZUFBYyxFQUFJLFVBQVMsQUFBQzs7QUFDL0IsT0FBRyxNQUFNLFFBQVEsUUFBUSxBQUFDLEVBQUUsU0FBQyxNQUFLO1dBQU0sQ0FBQSxNQUFLLEtBQUssQUFBQyxNQUFLO0lBQUEsRUFBRSxDQUFDO0FBQzNELE9BQUcsTUFBTSxRQUFRLEVBQUksVUFBUSxDQUFDO0FBQzlCLFNBQU8sS0FBRyxNQUFNLFFBQVEsQ0FBQztFQUMxQixDQUFDO0FBRUQsU0FBUyxNQUFJLENBQUUsT0FBTSxBQUFXO0FVMVNwQixRQUFTLEdBQUEsU0FBb0IsR0FBQztBQUFHLGVBQW9DLENBQ2hFLE9BQW9CLENBQUEsU0FBUSxPQUFPLENBQUcsT0FBa0I7QUFDM0QsWUFBa0IsUUFBb0MsQ0FBQyxFQUFJLENBQUEsU0FBUSxNQUFtQixDQUFDO0FBQUEsQVZ5U3BHLE9BQUcsTUFBSyxPQUFPLElBQU0sRUFBQSxDQUFHO0FBQ3ZCLFdBQUssRUFBSSxFQUFDLGFBQVksQ0FBRyx5QkFBdUIsQ0FBQyxDQUFDO0lBQ25EO0FBQUEsQUFFQSxTQUFLLFFBQVEsQUFBQyxFQUFDLFNBQUMsS0FBSSxDQUFNO0FBQ3pCLFNBQUcsTUFBTyxNQUFJLENBQUEsR0FBTSxXQUFTLENBQUc7QUFDL0IsWUFBSSxFQUFJLENBQUEsS0FBSSxBQUFDLEVBQUMsQ0FBQztNQUNoQjtBQUFBLEFBQ0EsU0FBRyxLQUFJLE1BQU0sQ0FBRztBQUNmLGFBQUssT0FBTyxBQUFDLENBQUMsT0FBTSxDQUFHLENBQUEsS0FBSSxNQUFNLENBQUMsQ0FBQztNQUNwQztBQUFBLEFBQ0EsVUFBSSxNQUFNLEtBQUssQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3pCLFNBQUcsS0FBSSxTQUFTLENBQUc7QUFDbEIsY0FBTSxNQUFNLFFBQVEsS0FBSyxBQUFDLENBQUUsS0FBSSxTQUFTLENBQUUsQ0FBQztNQUM3QztBQUFBLElBQ0QsRUFBQyxDQUFDO0FBQ0YsVUFBTSxXQUFXLEVBQUksZ0JBQWMsQ0FBQztFQUNyQztBQUVBLE1BQUksTUFBTSxFQUFJLGNBQVksQ0FBQztBQUMzQixNQUFJLGlCQUFpQixFQUFJLHlCQUF1QixDQUFDO0FBQ2pELE1BQUksZUFBZSxFQUFJLHVCQUFxQixDQUFDO0FBRTdDLFNBQVMsZUFBYSxDQUFFLE1BQUssQ0FBRztBQUMvQixRQUFJLEFBQUMsQ0FBRSxNQUFLLENBQUcsdUJBQXFCLENBQUUsQ0FBQztBQUN2QyxTQUFPLE9BQUssQ0FBQztFQUNkO0FBQUEsQUFFQSxTQUFTLGlCQUFlLENBQUUsTUFBSyxDQUFHO0FBQ2pDLFFBQUksQUFBQyxDQUFFLE1BQUssQ0FBRyx5QkFBdUIsQ0FBRSxDQUFDO0FBQ3pDLFNBQU8sT0FBSyxDQUFDO0VBQ2Q7QUFBQSxBQUtBLFNBQVMsaUJBQWUsQ0FBRSxLQUFJLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxHQUFFLENBQUcsQ0FBQSxPQUFNO0FBQ25ELFNBQUssQ0FBRSxHQUFFLENBQUMsRUFBSSxVQUFTLEFBQU07O0FXaFZsQixVQUFTLEdBQUEsT0FBb0IsR0FBQztBQUFHLGVBQW9CLEVBQUEsQ0FDaEQsT0FBb0IsQ0FBQSxTQUFRLE9BQU8sQ0FBRyxPQUFrQjtBQUMzRCxpQkFBbUMsRUFBSSxDQUFBLFNBQVEsTUFBbUIsQ0FBQztBQUFBLEFYK1UvRSxvQkFBTyxRQUFNLG9CWWxWZixDQUFBLGVBQWMsT0FBTyxFWmtWRSxLQUFJLEVBQU0sS0FBRyxDWWxWSSxFWmtWRjtJQUNyQyxDQUFDO0VBQ0Y7QUFFQSxTQUFTLGtCQUFnQixDQUFFLEtBQUksQ0FBRyxDQUFBLFFBQU87QUFDeEMsQUFBSSxNQUFBLENBQUEsTUFBSyxFQUFJLEdBQUMsQ0FBQztBS3RWUixRQUFTLEdBQUEsT0FDQSxDTHNWVyxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0t0VlQsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLFdBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxvVjFELFlBQUU7QUFBRyxnQkFBTTtBQUF5QjtBQUM3Qyx1QkFBZSxBQUFDLENBQ2YsS0FBSSxDQUNKLE9BQUssQ0FDTCxJQUFFLENBQ0YsQ0FBQSxNQUFPLFFBQU0sQ0FBQSxHQUFNLFNBQU8sQ0FBQSxDQUFJLENBQUEsT0FBTSxRQUFRLEVBQUksUUFBTSxDQUN2RCxDQUFDO01BQ0Y7SUt4Vk87QUFBQSxBTHlWUCxTQUFPLE9BQUssQ0FBQztFQUNkO0FBRUEsU0FBUyxtQkFBaUIsQ0FBRSxPQUFNLENBQUc7QUFDcEMsT0FBSSxPQUFNLFVBQVUsR0FBSyxPQUFLLENBQUc7QUFDaEMsVUFBTSxJQUFJLE1BQUksQUFBQyxFQUFDLHlCQUF3QixFQUFDLENBQUEsT0FBTSxVQUFVLEVBQUMscUJBQWtCLEVBQUMsQ0FBQztJQUMvRTtBQUFBLEFBQ0EsT0FBRyxDQUFDLE9BQU0sVUFBVSxDQUFHO0FBQ3RCLFVBQU0sSUFBSSxNQUFJLEFBQUMsQ0FBQyxrREFBaUQsQ0FBQyxDQUFDO0lBQ3BFO0FBQUEsQUFDQSxPQUFHLENBQUMsT0FBTSxTQUFTLENBQUc7QUFDckIsVUFBTSxJQUFJLE1BQUksQUFBQyxDQUFDLHVEQUFzRCxDQUFDLENBQUM7SUFDekU7QUFBQSxFQUNEO0FhN1dJLEFiNldKLElhN1dJLFFiK1dKLFNBQU0sTUFBSSxDQUVHLE9BQU07O0FBQ2pCLHFCQUFpQixBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDM0IsQUFBSSxNQUFBLENBQUEsU0FBUSxFQUFJLENBQUEsT0FBTSxVQUFVLENBQUM7QUFDakMsQUFBSSxNQUFBLENBQUEsU0FBUSxFQUFJLENBQUEsT0FBTSxVQUFVLEdBQUssUUFBTSxDQUFDO0FBQzVDLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE9BQU0sQ0FBRSxTQUFRLENBQUMsR0FBSyxHQUFDLENBQUM7QUFDcEMsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLENBQUEsaUJBQWdCLEFBQUMsQ0FBRSxJQUFHLENBQUcsQ0FBQSxPQUFNLFNBQVMsQ0FBRSxDQUFDO0FBQzFELFNBQUssQ0FBRSxTQUFRLENBQUMsRUFBSSxLQUFHLENBQUM7QUFDeEIsQUFBSSxNQUFBLENBQUEsVUFBUyxFQUFJLE1BQUksQ0FBQztBQUN0QixPQUFHLFdBQVcsRUFBSSxNQUFJLENBQUM7QUFFdkIsT0FBRyxTQUFTLEVBQUksVUFBUSxBQUFDLENBQUU7QUFDMUIsV0FBTyxNQUFJLENBQUM7SUFDYixDQUFDO0FBRUQsT0FBRyxTQUFTLEVBQUksVUFBUyxRQUFPLENBQUc7QUFDbEMsU0FBRyxDQUFDLFVBQVMsQ0FBRztBQUNmLFlBQU0sSUFBSSxNQUFJLEFBQUMsQ0FBQyxrRkFBaUYsQ0FBQyxDQUFDO01BQ3BHO0FBQUEsQUFDQSxVQUFJLEVBQUksQ0FBQSxNQUFLLE9BQU8sQUFBQyxDQUFDLEtBQUksQ0FBRyxTQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0FBRUQsT0FBRyxNQUFNLEVBQUksU0FBUyxNQUFJLENBQUMsQUFBQyxDQUFFO0FBQzdCLGVBQVMsRUFBSSxNQUFJLENBQUM7QUFDbEIsU0FBRyxJQUFHLFdBQVcsQ0FBRztBQUNuQixXQUFHLFdBQVcsRUFBSSxNQUFJLENBQUM7QUFDdkIsbUJBQVcsUUFBUSxBQUFDLEVBQUksSUFBRyxVQUFVLEVBQUMsV0FBUyxFQUFDLENBQUM7TUFDbEQ7QUFBQSxJQUNELENBQUM7QUFFRCxRQUFJLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxzQkFBcUIsQUFBQyxDQUFDO0FBQ2xDLFlBQU0sQ0FBRyxLQUFHO0FBQ1osWUFBTSxDQUFHLGtCQUFnQjtBQUN6QixVQUFJLEdBQU0sU0FBUSxFQUFDLFlBQVUsQ0FBQTtBQUM3QixhQUFPLENBQUcsU0FBTztBQUNqQixjQUFRLENBQUcsQ0FBQSxTQUFTLElBQUcsQ0FBRyxDQUFBLFFBQU8sQ0FBRztBQUNuQyxXQUFJLFFBQU8sZUFBZSxBQUFDLENBQUMsSUFBRyxXQUFXLENBQUMsQ0FBRztBQUM3QyxtQkFBUyxFQUFJLEtBQUcsQ0FBQztBQUNqQixBQUFJLFlBQUEsQ0FBQSxHQUFFLEVBQUksQ0FBQSxRQUFPLENBQUUsSUFBRyxXQUFXLENBQUMsS0FBSyxBQUFDLENBQUMsSUFBRyxDQUFHLENBQUEsSUFBRyxXQUFXLE9BQU8sQUFBQyxDQUFDLElBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqRixhQUFHLFdBQVcsRUFBSSxDQUFBLENBQUMsR0FBRSxJQUFNLE1BQUksQ0FBQyxFQUFJLE1BQUksRUFBSSxLQUFHLENBQUM7QUFDaEQsMEJBQWdCLFFBQVEsQUFBQyxFQUNyQixJQUFHLFVBQVUsRUFBQyxZQUFXLEVBQUMsQ0FBQSxJQUFHLFdBQVcsRUFDM0M7QUFBRSxxQkFBUyxDQUFHLENBQUEsSUFBRyxXQUFXO0FBQUcsb0JBQVEsQ0FBRyxDQUFBLElBQUcsVUFBVTtBQUFBLFVBQUUsQ0FDMUQsQ0FBQztRQUNGO0FBQUEsTUFDRCxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUM7QUFBQSxJQUNaLENBQUMsQ0FBQyxDQUFDO0FBRUgsT0FBRyxlQUFlLEVBQUksRUFDckIsTUFBSyxDQUFHLENBQUEsa0JBQWlCLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxpQkFBZ0IsVUFBVSxBQUFDLENBQUMsUUFBTyxDQUFHLENBQUEsSUFBRyxNQUFNLENBQUMsQ0FBQyxlQUFlLEFBQUMsRUFBQyxTQUFBLEFBQUM7YUFBSyxXQUFTO01BQUEsRUFBQyxDQUNwSCxDQUFDO0FBRUQsd0JBQW9CLEFBQUMsQ0FBQyxNQUFLLEtBQUssQUFBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLENBQUM7QUFFNUMsYUFBUyxjQUFjLEFBQUMsQ0FDdkI7QUFDQyxjQUFRLENBQVIsVUFBUTtBQUNSLFlBQU0sQ0FBRyxDQUFBLGVBQWMsQUFBQyxDQUFDLE9BQU0sU0FBUyxDQUFDO0FBQUEsSUFDMUMsQ0FDRCxDQUFDO0FBQ0QsU0FBTyxRQUFNLFNBQVMsQ0FBQztBQUN2QixTQUFPLFFBQU0sTUFBTSxDQUFDO0FBQ3BCLFNBQUssT0FBTyxBQUFDLENBQUMsSUFBRyxDQUFHLFFBQU0sQ0FBQyxDQUFDO0VhOWFVLEFieWJ4QyxDYXpid0M7QUNBeEMsRUFBQyxlQUFjLFlBQVksQ0FBQyxBQUFDLFNkbWI1QixPQUFNLENBQU4sVUFBTyxBQUFDOztBS2xiRCxVQUFTLEdBQUEsT0FDQSxDTGtiZSxPQUFNLEFBQUMsQ0FBQyxJQUFHLGVBQWUsQ0FBQyxDS2xieEIsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLGFBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxnYnpELFlBQUE7QUFBRyx1QkFBVztBQUFvQztBQUMzRCxxQkFBVyxZQUFZLEFBQUMsRUFBQyxDQUFDO1FBQzNCO01LL2FNO0FBQUEsQUxnYk4sV0FBTyxPQUFLLENBQUUsSUFBRyxVQUFVLENBQUMsQ0FBQztJQUM5QixNY3hib0Y7QWQyYnJGLFNBQVMsWUFBVSxDQUFFLFNBQVEsQ0FBRztBQUMvQixTQUFLLENBQUUsU0FBUSxDQUFDLFFBQVEsQUFBQyxFQUFDLENBQUM7RUFDNUI7QUFBQSxBQUtBLFNBQVMsa0JBQWdCLENBQUUsVUFBUyxDQUFHLENBQUEsTUFBSzs7QUFDM0MsYUFBUyxJQUFJLEFBQUMsRUFBQyxTQUFDLEtBQUksQ0FBTTtBQUN6QixBQUFJLFFBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxNQUFLLE9BQU8sQUFBQyxDQUFDLENBQ3hCLElBQUcsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQUFDLFdBQVUsQ0FBRyxDQUFBLEtBQUksUUFBUSxDQUFDLENBQ3ZDLENBQUcsT0FBSyxDQUFDLENBQUM7QUFDVixzQkFBZ0IsUUFBUSxBQUFDLEVBQ3JCLEtBQUksVUFBVSxFQUFDLFdBQVUsRUFBQyxDQUFBLE1BQUssV0FBVyxFQUM3QyxLQUFHLENBQ0osQ0FBQztJQUNGLEVBQUMsQ0FBQztFQUNIO0FhNWNBLEFBQUksSUFBQSxvQmJ1ZEosU0FBTSxrQkFBZ0IsQ0FDVCxNQUFLOzs7QUFDaEIsU0FBSyxPQUFPLEFBQUMsQ0FBQyxJQUFHLENBQUc7QUFDbkIsb0JBQWMsQ0FBRyxFQUFBO0FBQ2pCLFdBQUssQ0FBRyxHQUFDO0FBQ1QsWUFBTSxDQUFHLEdBQUM7QUFBQSxJQUNYLENBQUcsT0FBSyxDQUFDLENBQUM7QUFFVixPQUFHLGdCQUFnQixFQUFJLEVBQ3RCLE9BQU0sQ0FBRyxDQUFBLGlCQUFnQixVQUFVLEFBQUMsQ0FDbkMsYUFBWSxHQUNaLFNBQUMsSUFBRzthQUFNLENBQUEsV0FBVSxBQUFDLENBQUMsZ0JBQWUsQ0FBRyxLQUFHLENBQUM7TUFBQSxFQUM3QyxDQUNELENBQUM7QWVwZUgsQWZzZUUsa0JldGVZLFVBQVUsQUFBQyxxRGZzZWpCO0FBQ0wsaUJBQVcsQ0FBRyxnQkFBYztBQUM1QixXQUFLLENBQUc7QUFDUCxvQkFBWSxDQUFHLEVBQ2QsS0FBSSxDQUFHLGNBQVksQ0FDcEI7QUFDQSxrQkFBVSxDQUFHO0FBQ1osaUJBQU8sQ0FBUCxVQUFRLEFBQUM7O0FBQ1IsY0FBSTtBQUNIO0FnQi9lUCxBQUFJLGtCQUFBLE9BQW9CLEVBQUE7QUFBRyx5QkFBb0IsR0FBQyxDQUFDO0FYQ3pDLG9CQUFTLEdBQUEsT0FDQSxDTDZlVSxNQUFLLFlBQVksQ0s3ZVQsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLHVCQUFnQixDQUNwQixFQUFDLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLEdBQUs7b0JMMmV4RCxXQUFTO0FpQi9ldEIsc0JBQWtCLE1BQWtCLENBQUMsRWpCK2VVLENBQUEsaUJBQWdCLEtBQUssQUFBQyxNQUFPLFdBQVMsQ0FBRyxDQUFBLE1BQUssT0FBTyxDaUIvZTNDLEFqQitlNEMsQ2lCL2UzQztnQlpPbEQ7QWFQUixBYk9RLDJCYVBnQjtrQmxCK2UrRTtZQUNqRyxDQUFFLE9BQU0sRUFBQyxDQUFHO0FBQ1gsaUJBQUcsSUFBSSxFQUFJLEdBQUMsQ0FBQztBQUNiLG9CQUFNLElBQUksQUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ2YsaUJBQUcsV0FBVyxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7WUFDM0I7QUFBQSxBQUNBLGVBQUcsV0FBVyxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7VUFDM0I7QUFDQSx5QkFBZSxDQUFHLFVBQVMsSUFBRyxDQUFHO0FBQ2hDLGVBQUcsSUFBRyxXQUFXLENBQUc7QUFDbkIsaUJBQUcsUUFBUSxLQUFLLEFBQUMsQ0FBQyxJQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDO0FBQUEsVUFDRDtBQUNBLGdCQUFNLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDbkIsNEJBQWdCLFFBQVEsQUFBQyxDQUFDLFdBQVUsQ0FBRyxFQUFFLE1BQUssQ0FBRyxDQUFBLElBQUcsUUFBUSxDQUFFLENBQUMsQ0FBQztVQUNqRTtBQUFBLFFBQ0Q7QUFDQSxjQUFNLENBQUcsRUFDUixRQUFPLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDcEIsNEJBQWdCLFFBQVEsQUFBQyxDQUFDLFFBQU8sQ0FBRyxFQUNuQyxNQUFLLENBQUcsQ0FBQSxJQUFHLE9BQU8sQ0FDbkIsQ0FBQyxDQUFDO0FBQ0YsZUFBRyxLQUFLLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztVQUNyQixDQUNEO0FBQ0EsY0FBTSxDQUFHLEVBQ1IsUUFBTyxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ3BCLDRCQUFnQixRQUFRLEFBQUMsQ0FBQyxRQUFPLENBQUcsRUFDbkMsTUFBSyxDQUFHLENBQUEsSUFBRyxPQUFPLENBQ25CLENBQUMsQ0FBQztBQUNGLDRCQUFnQixRQUFRLEFBQUMsQ0FBQyxnQkFBZSxDQUFHO0FBQzNDLG1CQUFLLENBQUcsQ0FBQSxJQUFHLE9BQU87QUFDbEIsZ0JBQUUsQ0FBRyxDQUFBLElBQUcsSUFBSTtBQUFBLFlBQ2IsQ0FBQyxDQUFDO0FBQ0YsZUFBRyxLQUFLLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztVQUNyQixDQUNEO0FBQUEsTUFDRDtBQUFBLElBQ0QsRWVwaEJrRCxDZm9oQmhEO0VhcmhCb0MsQWJ1aUJ4QyxDYXZpQndDO0FNQXhDLEFBQUksSUFBQSx1Q0FBb0MsQ0FBQTtBQ0F4QyxFQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QXBCdWhCNUIsVUFBTSxDQUFOLFVBQVEsRUFBQyxDQUFHOztBQUNYLFNBQUcsR0FBRyxBQUFDLENBQUMsU0FBUSxDQUFHLEdBQUMsQ0FBQyxDQUFDO0FBQ3RCLFNBQUksQ0FBQyxJQUFHLFNBQVMsQ0FBRztBQUNuQixXQUFHLFNBQVMsRUFBSSxLQUFHLENBQUM7QUFDcEIsV0FBRyxPQUFPLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztNQUNyQjtBQUFBLEFBQ0EsV0FBTyxLQUFHLENBQUM7SUFDWjtBQUNBLFVBQU0sQ0FBTixVQUFRLEVBQUMsQ0FBRzs7QUFDWCxTQUFHLEdBQUcsQUFBQyxDQUFDLE9BQU0sQ0FBRyxHQUFDLENBQUMsQ0FBQztBQUNwQixTQUFJLENBQUMsSUFBRyxTQUFTLENBQUc7QUFDbkIsV0FBRyxTQUFTLEVBQUksS0FBRyxDQUFDO0FBQ3BCLFdBQUcsT0FBTyxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7TUFDckI7QUFBQSxBQUNBLFdBQU8sS0FBRyxDQUFDO0lBQ1o7QUFBQSxPQS9FK0IsQ0FBQSxPQUFNLElBQUksQ29CdGRjO0FwQjBpQnhELFNBQVMsYUFBVyxDQUFFLEtBQUksQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLEdBQUUsQ0FBRyxDQUFBLFVBQVMsQ0FBRztBQUNyRCxBQUFJLE1BQUEsQ0FBQSxRQUFPLEVBQUksSUFBRSxDQUFDO0FBQ2xCLE9BQUksS0FBSSxRQUFRLEdBQUssQ0FBQSxLQUFJLFFBQVEsT0FBTyxDQUFHO0FBQzFDLFVBQUksUUFBUSxRQUFRLEFBQUMsQ0FBQyxTQUFTLEdBQUUsQ0FBRztBQUNuQyxBQUFJLFVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxNQUFLLENBQUUsR0FBRSxDQUFDLENBQUM7QUFDMUIsV0FBRyxRQUFPLENBQUc7QUFDWixBQUFJLFlBQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxZQUFXLEFBQUMsQ0FBQyxRQUFPLENBQUcsT0FBSyxDQUFHLENBQUEsR0FBRSxFQUFJLEVBQUEsQ0FBQyxDQUFDO0FBQ3JELGFBQUksT0FBTSxFQUFJLFNBQU8sQ0FBRztBQUN2QixtQkFBTyxFQUFJLFFBQU0sQ0FBQztVQUNuQjtBQUFBLFFBQ0Q7QUFBQSxNQU1ELENBQUMsQ0FBQztJQUNIO0FBQUEsQUFDQSxTQUFPLFNBQU8sQ0FBQztFQUNoQjtBQUFBLEFBRUEsU0FBUyxpQkFBZSxDQUFHLE1BQUssQ0FBRyxDQUFBLFVBQVM7QUFDM0MsQUFBSSxNQUFBLENBQUEsSUFBRyxFQUFJLEdBQUMsQ0FBQztBQUNiLEFBQUksTUFBQSxDQUFBLE1BQUssRUFBSSxHQUFDLENBQUM7QUFDZixTQUFLLFFBQVEsQUFBQyxFQUFDLFNBQUMsS0FBSTtXQUFNLENBQUEsTUFBSyxDQUFFLEtBQUksVUFBVSxDQUFDLEVBQUksTUFBSTtJQUFBLEVBQUMsQ0FBQztBQUMxRCxTQUFLLFFBQVEsQUFBQyxFQUFDLFNBQUMsS0FBSTtXQUFNLENBQUEsS0FBSSxJQUFJLEVBQUksQ0FBQSxZQUFXLEFBQUMsQ0FBQyxLQUFJLENBQUcsT0FBSyxDQUFHLEVBQUEsQ0FBRyxXQUFTLENBQUM7SUFBQSxFQUFDLENBQUM7QUtua0IxRSxRQUFTLEdBQUEsT0FDQSxDTG1rQlEsT0FBTSxBQUFDLENBQUMsTUFBSyxDQUFDLENLbmtCSixNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7QUFDbkMsV0FBZ0IsQ0FDcEIsRUFBQyxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxHQUFLOztBTGlrQjFELFlBQUU7QUFBRyxhQUFHO0FBQXVCO0FBQ3hDLFdBQUcsQ0FBRSxJQUFHLElBQUksQ0FBQyxFQUFJLENBQUEsSUFBRyxDQUFFLElBQUcsSUFBSSxDQUFDLEdBQUssR0FBQyxDQUFDO0FBQ3JDLFdBQUcsQ0FBRSxJQUFHLElBQUksQ0FBQyxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztNQUMxQjtJS2prQk87QUFBQSxBTGtrQlAsU0FBTyxLQUFHLENBQUM7RUFDWjtBYTFrQkEsQUFBSSxJQUFBLGFiNGtCSixTQUFNLFdBQVMsQ0FDSCxBQUFDOzs7QWU3a0JiLEFmOGtCRSxrQmU5a0JZLFVBQVUsQUFBQyw4Q2Y4a0JqQjtBQUNMLGlCQUFXLENBQUcsUUFBTTtBQUNwQixjQUFRLENBQUcsR0FBQztBQUNaLGlCQUFXLENBQUcsR0FBQztBQUNmLFdBQUssQ0FBRztBQUNQLFlBQUksQ0FBRztBQUNOLGlCQUFPLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDcEIsZUFBRyxVQUFVLEVBQUksR0FBQyxDQUFDO1VBQ3BCO0FBQ0EsMEJBQWdCLENBQUcsVUFBUyxVQUFTLENBQUc7QUFDdkMsZUFBRyxVQUFVLEVBQUksRUFDaEIsTUFBSyxDQUFHLFdBQVMsQ0FDbEIsQ0FBQztBQUNELGVBQUcsV0FBVyxBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7VUFDN0I7QUFDQSx5QkFBZSxDQUFHLFVBQVMsU0FBUTtBSzVsQmhDLGdCQUFTLEdBQUEsT0FDQSxDTDRsQlcsU0FBUSxRQUFRLENLNWxCVCxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7QUFDbkMsbUJBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSztnQkwwbEJ0RCxVQUFRO0FBQXdCO0FBQ3hDLEFBQUksa0JBQUEsQ0FBQSxNQUFLLENBQUM7QUFDVixBQUFJLGtCQUFBLENBQUEsVUFBUyxFQUFJLENBQUEsU0FBUSxXQUFXLENBQUM7QUFDckMsQUFBSSxrQkFBQSxDQUFBLFVBQVMsRUFBSTtBQUNoQiwwQkFBUSxDQUFHLENBQUEsU0FBUSxVQUFVO0FBQzdCLHdCQUFNLENBQUcsQ0FBQSxTQUFRLFFBQVE7QUFBQSxnQkFDMUIsQ0FBQztBQUNELHFCQUFLLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBRSxVQUFTLENBQUMsRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFFLFVBQVMsQ0FBQyxHQUFLLEdBQUMsQ0FBQztBQUN0RSxxQkFBSyxLQUFLLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztjQUN4QjtZS2htQkU7QUFBQSxVTGltQkg7QUFBQSxRQUNEO0FBQ0EsZ0JBQVEsQ0FBRztBQUNWLGlCQUFPLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDcEIsQUFBSSxjQUFBLENBQUEsUUFBTyxFQUFJLENBQUEsSUFBRyxrQkFBa0IsQUFBQyxDQUFDLElBQUcsVUFBVSxPQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZFLGVBQUcsVUFBVSxPQUFPLEVBQUksQ0FBQSxRQUFPLE9BQU8sQ0FBQztBQUN2QyxlQUFHLFVBQVUsWUFBWSxFQUFJLENBQUEsUUFBTyxLQUFLLENBQUM7QUFDMUMsZUFBRyxXQUFXLEFBQUMsQ0FBQyxJQUFHLFVBQVUsWUFBWSxPQUFPLEVBQUksY0FBWSxFQUFJLFFBQU0sQ0FBQyxDQUFDO1VBQzdFO0FBQ0EsWUFBRSxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ2YsZUFBRyxxQkFBcUIsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO1VBQ25DO0FBQUEsUUFDRDtBQUNBLGtCQUFVLENBQUc7QUFDWixpQkFBTyxDQUFHLFVBQVEsQUFBQzs7QUFDbEIsQUFBSSxjQUFBLENBQUEsV0FBVSxFQUFJLENBQUEsSUFBRyxVQUFVLFlBQVksRUFBSSxJQUFJLGtCQUFnQixBQUFDLENBQUM7QUFDcEUsd0JBQVUsQ0FBRyxDQUFBLElBQUcsVUFBVSxZQUFZO0FBQ3RDLG1CQUFLLENBQUcsQ0FBQSxJQUFHLFVBQVUsT0FBTztBQUFBLFlBQzdCLENBQUMsQ0FBQztBQUNGLHNCQUFVLFFBQ0YsQUFBQyxFQUFDLFNBQUEsQUFBQzttQkFBSyxDQUFBLGVBQWMsQUFBQyxDQUFDLE9BQU0sQ0FBQztZQUFBLEVBQUMsUUFDaEMsQUFBQyxFQUFDLFNBQUEsQUFBQzttQkFBSyxDQUFBLGVBQWMsQUFBQyxDQUFDLE9BQU0sQ0FBQztZQUFBLEVBQUMsQ0FBQztVQUMxQztBQUNBLFlBQUUsQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUNmLGVBQUcscUJBQXFCLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztVQUNuQztBQUFBLFFBQ0Q7QUFDQSxjQUFNLENBQUcsR0FBQztBQUFBLE1BQ1g7QUFDQSxzQkFBZ0IsQ0FBaEIsVUFBa0IsVUFBUyxDQUFHO0FBQzdCLEFBQUksVUFBQSxDQUFBLE1BQUssRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFFLFVBQVMsQ0FBQyxHQUFLLEdBQUMsQ0FBQztBQUM3QyxhQUFPO0FBQ04sZUFBSyxDQUFMLE9BQUs7QUFDTCxhQUFHLENBQUcsQ0FBQSxnQkFBZSxBQUFDLENBQUUsTUFBSyxDQUFHLFdBQVMsQ0FBRTtBQUFBLFFBQzVDLENBQUM7TUFDRjtBQUFBLElBQ0QsRWUzb0JrRCxDZjJvQmhEO0FBQ0YsT0FBRyxnQkFBZ0IsRUFBSSxFQUN0QixrQkFBaUIsQUFBQyxDQUNqQixJQUFHLENBQ0gsQ0FBQSxhQUFZLFVBQVUsQUFBQyxDQUN0QixXQUFVLEdBQ1YsU0FBQyxJQUFHLENBQUcsQ0FBQSxHQUFFO1dBQU0sQ0FBQSx5QkFBd0IsQUFBQyxDQUFDLElBQUcsQ0FBQztJQUFBLEVBQzlDLENBQ0QsQ0FDRCxDQUFDO0VhcnBCcUMsQWJvcUJ4QyxDYXBxQndDO0FNQXhDLEFBQUksSUFBQSx5QkFBb0MsQ0FBQTtBQ0F4QyxFQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QXBCd3BCNUIsdUJBQW1CLENBQW5CLFVBQXFCLElBQUcsQ0FBRyxDQUFBLFFBQU8sQ0FBRzs7QUFDcEMsU0FBRyxPQUFPLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBRyxLQUFHLENBQUMsQ0FBQztJQUNyQztBQUVBLGdCQUFZLENBQVosVUFBYyxNQUFLLENBQUc7O0FBQ3JCLFNBQUcsT0FBTyxBQUFDLENBQUMsZ0JBQWUsQ0FBRyxPQUFLLENBQUMsQ0FBQztJQUN0QztBQUVBLFVBQU0sQ0FBTixVQUFPLEFBQUM7O0FBQ1AsU0FBRyxXQUFXLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztBQUMxQixTQUFHLGdCQUFnQixRQUFRLEFBQUMsRUFBQyxTQUFDLFlBQVc7YUFBTSxDQUFBLFlBQVcsWUFBWSxBQUFDLEVBQUM7TUFBQSxFQUFDLENBQUM7SUFDM0U7T0F2RndCLENBQUEsT0FBTSxJQUFJLENvQjNrQnFCO0FwQnFxQnhELEFBQUksSUFBQSxDQUFBLFVBQVMsRUFBSSxJQUFJLFdBQVMsQUFBQyxFQUFDLENBQUM7QUFNakMsQUFBSSxJQUFBLENBQUEsS0FBSSxFQUFJO0FBQ1gsZUFBVyxDQUFYLFVBQVksQUFBQyxDQUFFO0FBQ2QsQUFBSSxRQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsTUFBSyxLQUFLLEFBQUMsQ0FBQyxjQUFhLENBQUMsSUFDcEMsQUFBQyxDQUFDLFNBQVMsQ0FBQSxDQUFHO0FBQ2hCLGFBQU87QUFDTixzQkFBWSxDQUFJLEVBQUE7QUFDaEIsaUJBQU8sQ0FBSSxDQUFBLFVBQVMsa0JBQWtCLEFBQUMsQ0FBQyxDQUFBLENBQUMsT0FBTyxJQUFJLEFBQUMsQ0FBQyxTQUFTLENBQUEsQ0FBRztBQUFFLGlCQUFPLENBQUEsQ0FBQSxVQUFVLENBQUM7VUFBRSxDQUFDLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQztBQUFBLFFBQ3BHLENBQUM7TUFDRixDQUFDLENBQUM7QUFDSCxTQUFHLE9BQU0sR0FBSyxDQUFBLE9BQU0sTUFBTSxDQUFHO0FBQzVCLGNBQU0sTUFBTSxBQUFDLENBQUMsOEJBQTZCLENBQUMsQ0FBQztBQUM3QyxjQUFNLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3RCLGNBQU0sU0FBUyxBQUFDLEVBQUMsQ0FBQztNQUNuQixLQUFPLEtBQUksT0FBTSxHQUFLLENBQUEsT0FBTSxJQUFJLENBQUc7QUFDbEMsY0FBTSxJQUFJLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztNQUNyQjtBQUFBLElBQ0Q7QUFFQSxvQkFBZ0IsQ0FBaEIsVUFBa0IsVUFBUyxDQUFHO0FBQzdCLEFBQUksUUFBQSxDQUFBLElBQUcsRUFBSSxHQUFDLENBQUM7QUFDYixlQUFTLEVBQUksQ0FBQSxNQUFPLFdBQVMsQ0FBQSxHQUFNLFNBQU8sQ0FBQSxDQUFJLEVBQUMsVUFBUyxDQUFDLEVBQUksV0FBUyxDQUFDO0FBQ3ZFLFNBQUcsQ0FBQyxVQUFTLENBQUc7QUFDZixpQkFBUyxFQUFJLENBQUEsTUFBSyxLQUFLLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztNQUN6QztBQUFBLEFBQ0EsZUFBUyxRQUFRLEFBQUMsQ0FBQyxTQUFTLEVBQUMsQ0FBRTtBQUM5QixpQkFBUyxrQkFBa0IsQUFBQyxDQUFDLEVBQUMsQ0FBQyxLQUN2QixRQUFRLEFBQUMsQ0FBQyxTQUFTLENBQUEsQ0FBRztBQUN0QixnQkFBTyxDQUFBLE9BQU8sQ0FBRztBQUNiLEFBQUksY0FBQSxDQUFBLENBQUEsRUFBSSxDQUFBLENBQUEsSUFBSSxBQUFDLEVBQUMsQ0FBQztBQUNmLGVBQUcsS0FBSyxBQUFDLENBQUM7QUFDVCwwQkFBWSxDQUFJLEdBQUM7QUFDZCw4QkFBZ0IsQ0FBSSxDQUFBLENBQUEsVUFBVTtBQUM5Qix3QkFBVSxDQUFJLENBQUEsQ0FBQSxRQUFRLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQztBQUNoQyx1QkFBUyxDQUFHLENBQUEsQ0FBQSxJQUFJO0FBQUEsWUFDcEIsQ0FBQyxDQUFDO1VBQ047QUFBQSxRQUNKLENBQUMsQ0FBQztBQUNILFdBQUcsT0FBTSxHQUFLLENBQUEsT0FBTSxNQUFNLENBQUc7QUFDL0IsZ0JBQU0sTUFBTSxBQUFDLEVBQUMsNEJBQTRCLEVBQUMsR0FBQyxFQUFHLENBQUM7QUFDaEQsZ0JBQU0sTUFBTSxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFDbkIsZ0JBQU0sU0FBUyxBQUFDLEVBQUMsQ0FBQztRQUNuQixLQUFPLEtBQUksT0FBTSxHQUFLLENBQUEsT0FBTSxJQUFJLENBQUc7QUFDbEMsZ0JBQU0sSUFBSSxBQUFDLEVBQUMsNEJBQTRCLEVBQUMsR0FBQyxFQUFDLElBQUUsRUFBQyxDQUFDO0FBQy9DLGdCQUFNLElBQUksQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDO1FBQ2xCO0FBQUEsQUFDQSxXQUFHLEVBQUksR0FBQyxDQUFDO01BQ1YsQ0FBQyxDQUFDO0lBQ0g7QUFBQSxFQUNELENBQUM7QUFJQSxPQUFPO0FBQ04saUJBQWEsQ0FBYixlQUFhO0FBQ2IsbUJBQWUsQ0FBZixpQkFBZTtBQUNmLFlBQVEsQ0FBUixVQUFRO0FBQ1IsaUJBQWEsQ0FBYixlQUFhO0FBQ2Isc0JBQWtCLENBQWxCLG9CQUFrQjtBQUNsQixhQUFTLENBQVQsV0FBUztBQUNULGlCQUFhLENBQWIsZUFBYTtBQUNiLG1CQUFlLENBQWYsaUJBQWU7QUFDZixpQkFBYSxDQUFiLGVBQWE7QUFDYixRQUFJLENBQUcsTUFBSTtBQUNYLGNBQVUsQ0FBVixZQUFVO0FBQ1YsUUFBSSxDQUFKLE1BQUk7QUFDSixTQUFLLENBQUwsT0FBSztBQUNMLFFBQUksQ0FBSixNQUFJO0FBQUEsRUFDTCxDQUFDO0FBR0YsQ0FBQyxDQUFDLENBQUM7QUFDSCIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsdXguanMgLSBGbHV4LWJhc2VkIGFyY2hpdGVjdHVyZSBmb3IgdXNpbmcgUmVhY3RKUyBhdCBMZWFuS2l0XG4gKiBBdXRob3I6IEppbSBDb3dhcnRcbiAqIFZlcnNpb246IHYwLjMuMC1SQzFcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsXCIsIFwibWFjaGluYVwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSwgUmVhY3QgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdFJlYWN0IHx8IHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cblx0dmFyIGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5hY3Rpb25cIik7XG5cdHZhciBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5zdG9yZVwiKTtcblx0dmFyIGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoXCJsdXguZGlzcGF0Y2hlclwiKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0ZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG5cdFx0aWYodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuXHRcdFx0b2JqID0ge307XG5cdFx0fVxuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0XHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRcdGFjY3VtW2tleV0gPSBvYmpba2V5XTtcblx0XHRcdHJldHVybiBhY2N1bTtcblx0XHR9LCB7fSk7XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKGNvbnRleHQpIHtcblx0XHR2YXIgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKGNvbnRleHQuX19sdXggfHwge30pO1xuXHRcdHZhciBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9IChfX2x1eC5jbGVhbnVwIHx8IFtdKTtcblx0XHR2YXIgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSk7XG5cdFx0cmV0dXJuIF9fbHV4O1xuXHR9XG5cblx0XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG52YXIgYWN0aW9uR3JvdXBzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKGFjdGlvbkxpc3QpIHtcblx0YWN0aW9uTGlzdCA9ICh0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIikgPyBbYWN0aW9uTGlzdF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0aWYoIWFjdGlvbkNyZWF0b3JzW2FjdGlvbl0pIHtcblx0XHRcdGFjdGlvbkNyZWF0b3JzW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCh7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0cmV0dXJuIGFjdGlvbkdyb3Vwc1tncm91cF0gPyBwbHVjayhhY3Rpb25DcmVhdG9ycywgYWN0aW9uR3JvdXBzW2dyb3VwXSkgOiB7fTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvcihhY3Rpb24pIHtcblx0YWN0aW9uQ3JlYXRvcnMgPSBPYmplY3QuYXNzaWduKGFjdGlvbkNyZWF0b3JzLCBhY3Rpb24pO1xufVxuXG5mdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKGdyb3VwTmFtZSwgYWN0aW9ucykge1xuXHR2YXIgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXTtcblx0aWYoIWdyb3VwKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXHR9XG5cdGFjdGlvbnMgPSB0eXBlb2YgYWN0aW9ucyA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25zXSA6IGFjdGlvbnM7XG5cdGFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pe1xuXHRcdGlmKGdyb3VwLmluZGV4T2YoYWN0aW9uKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKGFjdGlvbik7XG5cdFx0fVxuXHR9KTtcbn1cblxuXHRcblxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gdHJ1ZTtcblx0dmFyIF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHR2YXIgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AodGhpcyk7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgKTtcblx0XHR9O1xuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBub0NoYW5nZUhhbmRsZXJJbXBsZW1lbnRlZDtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zW2Ake3N0b3JlfS5jaGFuZ2VkYF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlKSk7XG5cdFx0fSk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcInByZW5vdGlmeVwiLCAoZGF0YSkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwodGhpcywgZGF0YSkpO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdGZvcih2YXIgW2tleSwgc3ViXSBvZiBlbnRyaWVzKHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucykpIHtcblx0XHRcdHZhciBzcGxpdDtcblx0XHRcdGlmKGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoIHNwbGl0ID0ga2V5LnNwbGl0KFwiLlwiKSAmJiBzcGxpdFsxXSA9PT0gXCJjaGFuZ2VkXCIgKSkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIERpc3BhdGNoZXIgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cdFx0dmFyIGFkZEFjdGlvbklmTm90UHJlc2V0ID0gKGssIHYpID0+IHtcblx0XHRcdGlmKCF0aGlzW2tdKSB7XG5cdFx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCgoZ3JvdXApID0+IHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uR3JvdXAoZ3JvdXApKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrLCB2KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZih0aGlzLmdldEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRmb3IodmFyIFtrZXksIHZhbF0gb2YgZW50cmllcyhwbHVjayhhY3Rpb25DcmVhdG9ycywgdGhpcy5nZXRBY3Rpb25zKSkpIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZXQoa2V5LCB2YWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRkaXNwYXRjaEFjdGlvbjogZnVuY3Rpb24oYWN0aW9uLCAuLi5hcmdzKSB7XG5cdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbi5zZXR1cFxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhBY3Rpb25MaXN0ZW5lck1peGluID0gZnVuY3Rpb24oeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30pIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHR2YXIgX19sdXggPSBlbnN1cmVMdXhQcm9wKGNvbnRleHQpO1xuXHRcdFx0dmFyIHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoKGRhdGEsIGVudikgPT4ge1xuXHRcdFx0XHR2YXIgaGFuZGxlcjtcblx0XHRcdFx0aWYoaGFuZGxlciA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0pIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYoIWhhbmRsZXJzIHx8IChzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIpKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlIHdhcm4gaW4gZGVidWcgYnVpbGRzXG5cdFx0XHRcdC8vIGZpcnN0IHBhcnQgb2YgY2hlY2sgbWVhbnMgbm8gaGFuZGxlcnMgYWN0aW9uXG5cdFx0XHRcdC8vIChidXQgd2UgdHJpZWQgdG8gYWRkIHRoZSBtaXhpbi4uLi5wb2ludGxlc3MpXG5cdFx0XHRcdC8vIHNlY29uZCBwYXJ0IG9mIGNoZWNrIGluZGljYXRlcyB3ZSBhbHJlYWR5XG5cdFx0XHRcdC8vIHJhbiB0aGUgbWl4aW4gb24gdGhpcyBjb250ZXh0XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPVxuXHRcdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdFx0Y29udGV4dCxcblx0XHRcdFx0XHRjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApXG5cdFx0XHRcdCk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICBSZWFjdCBDb21wb25lbnQgVmVyc2lvbnMgb2YgQWJvdmUgTWl4aW4gICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25EaXNwYXRjaGVyUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4LmNsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4LmNsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0LCAuLi5taXhpbnMpIHtcblx0aWYobWl4aW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdG1peGlucyA9IFtsdXhTdG9yZU1peGluLCBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW5dO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goKG1peGluKSA9PiB7XG5cdFx0aWYodHlwZW9mIG1peGluID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG1peGluID0gbWl4aW4oKTtcblx0XHR9XG5cdFx0aWYobWl4aW4ubWl4aW4pIHtcblx0XHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbWl4aW4ubWl4aW4pO1xuXHRcdH1cblx0XHRtaXhpbi5zZXR1cC5jYWxsKGNvbnRleHQpO1xuXHRcdGlmKG1peGluLnRlYXJkb3duKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbWl4aW4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0pO1xuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cbm1peGluLnN0b3JlID0gbHV4U3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkRpc3BhdGNoZXIgPSBsdXhBY3Rpb25EaXNwYXRjaGVyTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGx1eEFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKHRhcmdldCkge1xuXHRtaXhpbiggdGFyZ2V0LCBsdXhBY3Rpb25MaXN0ZW5lck1peGluICk7XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkRpc3BhdGNoZXIodGFyZ2V0KSB7XG5cdG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbiApO1xuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuXHRcdHJldHVybiBoYW5kbGVyLmFwcGx5KHN0b3JlLCAuLi5hcmdzKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLm5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtvcHRpb25zLm5hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0fVxuXHRpZighb3B0aW9ucy5uYW1lc3BhY2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIik7XG5cdH1cblx0aWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiKTtcblx0fVxufVxuXG5jbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2U7XG5cdFx0dmFyIHN0YXRlUHJvcCA9IG9wdGlvbnMuc3RhdGVQcm9wIHx8IFwic3RhdGVcIjtcblx0XHR2YXIgc3RhdGUgPSBvcHRpb25zW3N0YXRlUHJvcF0gfHwge307XG5cdFx0dmFyIGhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnMoIHRoaXMsIG9wdGlvbnMuaGFuZGxlcnMgKTtcblx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0dmFyIGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG5cdFx0XHRpZighaW5EaXNwYXRjaCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKHRoaXMsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4oe1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdLmNhbGwodGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChkYXRhLmRlcHMpKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAocmVzID09PSBmYWxzZSkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSkpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IGluRGlzcGF0Y2gpLFxuXHRcdH07XG5cblx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHRcdH1cblx0XHQpO1xuXHRcdGRlbGV0ZSBvcHRpb25zLmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHRpb25zLnN0YXRlO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdH0sIGFjdGlvbik7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9KTtcbn1cbi8qXG5cdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdHtcblx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0YWN0aW9uIDoge1xuXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0fVxuXHR9XG4qL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0ge1xuXHRcdFx0aGFuZGxlZDogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdChkYXRhKSA9PiB0aGlzLmhhbmRsZShcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEpXG5cdFx0XHQpXG5cdFx0fTtcblxuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZXgpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBleDtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXgpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0aWYoZGF0YS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKGRhdGEubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcImFjdGlvbi5mYWlsdXJlXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuaGFuZGxlKFwic3RhcnRcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0XHR0aGlzLmhhbmRsZShcInN0YXJ0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlKSB7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdGlmKGRlcFN0b3JlKSB7XG5cdFx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0XHRpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8qZWxzZSB7XG5cdFx0XHRcdC8vIFRPRE86IGFkZCBjb25zb2xlLndhcm4gb24gZGVidWcgYnVpbGRcblx0XHRcdFx0Ly8gbm90aW5nIHRoYXQgYSBzdG9yZSBhY3Rpb24gc3BlY2lmaWVzIGFub3RoZXIgc3RvcmVcblx0XHRcdFx0Ly8gYXMgYSBkZXBlbmRlbmN5IHRoYXQgZG9lcyBOT1QgcGFydGljaXBhdGUgaW4gdGhlIGFjdGlvblxuXHRcdFx0XHQvLyB0aGlzIGlzIHdoeSBhY3Rpb25UeXBlIGlzIGFuIGFyZyBoZXJlLi4uLlxuXHRcdFx0fSovXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSkpO1xuXHRmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcblx0XHR0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuXHRcdHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogYWN0aW9uTWV0YVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG5cdFx0XHRcdFx0XHRcdGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGhhbmRsaW5nID0gdGhpcy5nZXRTdG9yZXNIYW5kbGluZyh0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZSk7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBoYW5kbGluZy5zdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGhhbmRsaW5nLnRyZWU7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKGFjdGlvblR5cGUpIHtcblx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvblR5cGVdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHR0cmVlOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdChkYXRhLCBlbnYpID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZShjb25maWcpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGNvbmZpZyk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbi8vIE5PVEUgLSB0aGVzZSB3aWxsIGV2ZW50dWFsbHkgbGl2ZSBpbiB0aGVpciBvd24gYWRkLW9uIGxpYiBvciBpbiBhIGRlYnVnIGJ1aWxkIG9mIGx1eFxudmFyIHV0aWxzID0ge1xuXHRwcmludEFjdGlvbnMoKSB7XG5cdFx0dmFyIGFjdGlvbnMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycylcblx0XHRcdC5tYXAoZnVuY3Rpb24oeCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFwiYWN0aW9uIG5hbWVcIiA6IHgsXG5cdFx0XHRcdFx0XCJzdG9yZXNcIiA6IGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoeCkuc3RvcmVzLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4Lm5hbWVzcGFjZTsgfSkuam9pbihcIixcIilcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0Y29uc29sZS5ncm91cChcIkN1cnJlbnRseSBSZWNvZ25pemVkIEFjdGlvbnNcIik7XG5cdFx0XHRjb25zb2xlLnRhYmxlKGFjdGlvbnMpO1xuXHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xuXHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0Y29uc29sZS5sb2coYWN0aW9ucyk7XG5cdFx0fVxuXHR9LFxuXG5cdHByaW50U3RvcmVEZXBUcmVlKGFjdGlvblR5cGUpIHtcblx0XHR2YXIgdHJlZSA9IFtdO1xuXHRcdGFjdGlvblR5cGUgPSB0eXBlb2YgYWN0aW9uVHlwZSA9PT0gXCJzdHJpbmdcIiA/IFthY3Rpb25UeXBlXSA6IGFjdGlvblR5cGU7XG5cdFx0aWYoIWFjdGlvblR5cGUpIHtcblx0XHRcdGFjdGlvblR5cGUgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG5cdFx0fVxuXHRcdGFjdGlvblR5cGUuZm9yRWFjaChmdW5jdGlvbihhdCl7XG5cdFx0XHRkaXNwYXRjaGVyLmdldFN0b3Jlc0hhbmRsaW5nKGF0KVxuXHRcdFx0ICAgIC50cmVlLmZvckVhY2goZnVuY3Rpb24oeCkge1xuXHRcdFx0ICAgICAgICB3aGlsZSAoeC5sZW5ndGgpIHtcblx0XHRcdCAgICAgICAgICAgIHZhciB0ID0geC5wb3AoKTtcblx0XHRcdCAgICAgICAgICAgIHRyZWUucHVzaCh7XG5cdFx0XHQgICAgICAgICAgICBcdFwiYWN0aW9uIHR5cGVcIiA6IGF0LFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwic3RvcmUgbmFtZXNwYWNlXCIgOiB0Lm5hbWVzcGFjZSxcblx0XHRcdCAgICAgICAgICAgICAgICBcIndhaXRzIGZvclwiIDogdC53YWl0Rm9yLmpvaW4oXCIsXCIpLFxuXHRcdFx0ICAgICAgICAgICAgICAgIGdlbmVyYXRpb246IHQuZ2VuXG5cdFx0XHQgICAgICAgICAgICB9KTtcblx0XHRcdCAgICAgICAgfVxuXHRcdFx0ICAgIH0pO1xuXHRcdCAgICBpZihjb25zb2xlICYmIGNvbnNvbGUudGFibGUpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fWApO1xuXHRcdFx0XHRjb25zb2xlLnRhYmxlKHRyZWUpO1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYFN0b3JlIERlcGVuZGVuY3kgTGlzdCBmb3IgJHthdH06YCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRyZWUpO1xuXHRcdFx0fVxuXHRcdFx0dHJlZSA9IFtdO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25DcmVhdG9ycyxcblx0XHRhZGRUb0FjdGlvbkdyb3VwLFxuXHRcdGNvbXBvbmVudCxcblx0XHRjb250cm9sbGVyVmlldyxcblx0XHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0Z2V0QWN0aW9uR3JvdXAsXG5cdFx0YWN0aW9uRGlzcGF0Y2hlcixcblx0XHRhY3Rpb25MaXN0ZW5lcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0U3RvcmUsXG5cdFx0c3RvcmVzLFxuXHRcdHV0aWxzXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=