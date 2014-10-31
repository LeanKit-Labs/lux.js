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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTkiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEwIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzExIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FB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Q0FBQSxPQUFNLE1BQU0sQ0FBRztBQUMvQixnQkFBTSxNQUFNLEFBQUMsRUFBQyw0QkFBNEIsRUFBQyxHQUFDLEVBQUcsQ0FBQztBQUNoRCxnQkFBTSxNQUFNLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztBQUNuQixnQkFBTSxTQUFTLEFBQUMsRUFBQyxDQUFDO1FBQ25CLEtBQU8sS0FBSSxPQUFNLEdBQUssQ0FBQSxPQUFNLElBQUksQ0FBRztBQUNsQyxnQkFBTSxJQUFJLEFBQUMsRUFBQyw0QkFBNEIsRUFBQyxHQUFDLEVBQUMsSUFBRSxFQUFDLENBQUM7QUFDL0MsZ0JBQU0sSUFBSSxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7UUFDbEI7QUFBQSxBQUNBLFdBQUcsRUFBSSxHQUFDLENBQUM7TUFDVixDQUFDLENBQUM7SUFDSDtBQUFBLEVBQ0QsQ0FBQztBQUlBLE9BQU87QUFDTixpQkFBYSxDQUFiLGVBQWE7QUFDYixtQkFBZSxDQUFmLGlCQUFlO0FBQ2YsWUFBUSxDQUFSLFVBQVE7QUFDUixpQkFBYSxDQUFiLGVBQWE7QUFDYixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQ2xCLGFBQVMsQ0FBVCxXQUFTO0FBQ1QsaUJBQWEsQ0FBYixlQUFhO0FBQ2IsbUJBQWUsQ0FBZixpQkFBZTtBQUNmLGlCQUFhLENBQWIsZUFBYTtBQUNiLFFBQUksQ0FBRyxNQUFJO0FBQ1gsY0FBVSxDQUFWLFlBQVU7QUFDVixRQUFJLENBQUosTUFBSTtBQUNKLFNBQUssQ0FBTCxPQUFLO0FBQ0wsUUFBSSxDQUFKLE1BQUk7QUFBQSxFQUNMLENBQUM7QUFHRixDQUFDLENBQUMsQ0FBQztBQUNIIiwiZmlsZSI6Imx1eC1lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGx1eC5qcyAtIEZsdXgtYmFzZWQgYXJjaGl0ZWN0dXJlIGZvciB1c2luZyBSZWFjdEpTIGF0IExlYW5LaXRcbiAqIEF1dGhvcjogSmltIENvd2FydFxuICogVmVyc2lvbjogdjAuMy4wLVJDMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWxcIiwgXCJtYWNoaW5hXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hLCBSZWFjdCApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0UmVhY3QgfHwgcmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSApIHtcblxuXHR2YXIgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LmFjdGlvblwiKTtcblx0dmFyIHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKFwibHV4LnN0b3JlXCIpO1xuXHR2YXIgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbChcImx1eC5kaXNwYXRjaGVyXCIpO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRvYmogPSB7fTtcblx0XHR9XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHRcdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdFx0YWNjdW1ba2V5XSA9IG9ialtrZXldO1xuXHRcdFx0cmV0dXJuIGFjY3VtO1xuXHRcdH0sIHt9KTtcblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoY29udGV4dCkge1xuXHRcdHZhciBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoY29udGV4dC5fX2x1eCB8fCB7fSk7XG5cdFx0dmFyIGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKF9fbHV4LmNsZWFudXAgfHwgW10pO1xuXHRcdHZhciBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9IChfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9KTtcblx0XHRyZXR1cm4gX19sdXg7XG5cdH1cblxuXHRcblxudmFyIGFjdGlvbkNyZWF0b3JzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBhY3Rpb25Hcm91cHMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoYWN0aW9uTGlzdCkge1xuXHRhY3Rpb25MaXN0ID0gKHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiKSA/IFthY3Rpb25MaXN0XSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRpZighYWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSkge1xuXHRcdFx0YWN0aW9uQ3JlYXRvcnNbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRyZXR1cm4gYWN0aW9uR3JvdXBzW2dyb3VwXSA/IHBsdWNrKGFjdGlvbkNyZWF0b3JzLCBhY3Rpb25Hcm91cHNbZ3JvdXBdKSA6IHt9O1xufVxuXG5mdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKGFjdGlvbikge1xuXHRhY3Rpb25DcmVhdG9ycyA9IE9iamVjdC5hc3NpZ24oYWN0aW9uQ3JlYXRvcnMsIGFjdGlvbik7XG59XG5cbmZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoZ3JvdXBOYW1lLCBhY3Rpb25zKSB7XG5cdHZhciBncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdO1xuXHRpZighZ3JvdXApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1tncm91cE5hbWVdID0gW107XG5cdH1cblx0YWN0aW9ucyA9IHR5cGVvZiBhY3Rpb25zID09PSBcInN0cmluZ1wiID8gW2FjdGlvbnNdIDogYWN0aW9ucztcblx0YWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbil7XG5cdFx0aWYoZ3JvdXAuaW5kZXhPZihhY3Rpb24pID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goYWN0aW9uKTtcblx0XHR9XG5cdH0pO1xufVxuXG5cdFxuXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSB0cnVlO1xuXHR2YXIgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdHZhciBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9fbHV4ID0gZW5zdXJlTHV4UHJvcCh0aGlzKTtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgbm9DaGFuZ2VIYW5kbGVySW1wbGVtZW50ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGApO1xuXHRcdH07XG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IG5vQ2hhbmdlSGFuZGxlckltcGxlbWVudGVkO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbYCR7c3RvcmV9LmNoYW5nZWRgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUpKTtcblx0XHR9KTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yKHZhciBba2V5LCBzdWJdIG9mIGVudHJpZXModGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zKSkge1xuXHRcdFx0dmFyIHNwbGl0O1xuXHRcdFx0aWYoa2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggc3BsaXQgPSBrZXkuc3BsaXQoXCIuXCIpICYmIHNwbGl0WzFdID09PSBcImNoYW5nZWRcIiApKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gRGlzcGF0Y2hlciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblx0XHR2YXIgYWRkQWN0aW9uSWZOb3RQcmVzZXQgPSAoaywgdikgPT4ge1xuXHRcdFx0aWYoIXRoaXNba10pIHtcblx0XHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKChncm91cCkgPT4ge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25Hcm91cChncm91cCkpKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2V0KGssIHYpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmKHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGZvcih2YXIgW2tleSwgdmFsXSBvZiBlbnRyaWVzKHBsdWNrKGFjdGlvbkNyZWF0b3JzLCB0aGlzLmdldEFjdGlvbnMpKSkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNldChrZXksIHZhbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdGRpc3BhdGNoQWN0aW9uOiBmdW5jdGlvbihhY3Rpb24sIC4uLmFyZ3MpIHtcblx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCh7XG5cdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uRGlzcGF0Y2hlclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluLnNldHVwXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gPSBmdW5jdGlvbih7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdHZhciBfX2x1eCA9IGVuc3VyZUx1eFByb3AoY29udGV4dCk7XG5cdFx0XHR2YXIgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICgoZGF0YSwgZW52KSA9PiB7XG5cdFx0XHRcdHZhciBoYW5kbGVyO1xuXHRcdFx0XHRpZihoYW5kbGVyID0gaGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXSkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZighaGFuZGxlcnMgfHwgKHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lcikpIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUgd2FybiBpbiBkZWJ1ZyBidWlsZHNcblx0XHRcdFx0Ly8gZmlyc3QgcGFydCBvZiBjaGVjayBtZWFucyBubyBoYW5kbGVycyBhY3Rpb25cblx0XHRcdFx0Ly8gKGJ1dCB3ZSB0cmllZCB0byBhZGQgdGhlIG1peGluLi4uLnBvaW50bGVzcylcblx0XHRcdFx0Ly8gc2Vjb25kIHBhcnQgb2YgY2hlY2sgaW5kaWNhdGVzIHdlIGFscmVhZHlcblx0XHRcdFx0Ly8gcmFuIHRoZSBtaXhpbiBvbiB0aGlzIGNvbnRleHRcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9XG5cdFx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuIClcblx0XHRcdFx0KTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIFJlYWN0IENvbXBvbmVudCBWZXJzaW9ucyBvZiBBYm92ZSBNaXhpbiAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJSZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uRGlzcGF0Y2hlclJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eC5jbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQsIC4uLm1peGlucykge1xuXHRpZihtaXhpbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0bWl4aW5zID0gW2x1eFN0b3JlTWl4aW4sIGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbl07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCgobWl4aW4pID0+IHtcblx0XHRpZih0eXBlb2YgbWl4aW4gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bWl4aW4gPSBtaXhpbigpO1xuXHRcdH1cblx0XHRpZihtaXhpbi5taXhpbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBtaXhpbi5taXhpbik7XG5cdFx0fVxuXHRcdG1peGluLnNldHVwLmNhbGwoY29udGV4dCk7XG5cdFx0aWYobWl4aW4udGVhcmRvd24pIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBtaXhpbi50ZWFyZG93biApO1xuXHRcdH1cblx0fSk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxubWl4aW4uc3RvcmUgPSBsdXhTdG9yZU1peGluO1xubWl4aW4uYWN0aW9uRGlzcGF0Y2hlciA9IGx1eEFjdGlvbkRpc3BhdGNoZXJNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gbHV4QWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXIodGFyZ2V0KSB7XG5cdG1peGluKCB0YXJnZXQsIGx1eEFjdGlvbkxpc3RlbmVyTWl4aW4gKTtcblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gYWN0aW9uRGlzcGF0Y2hlcih0YXJnZXQpIHtcblx0bWl4aW4oIHRhcmdldCwgbHV4QWN0aW9uRGlzcGF0Y2hlck1peGluICk7XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG5cdFx0cmV0dXJuIGhhbmRsZXIuYXBwbHkoc3RvcmUsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMubmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke29wdGlvbnMubmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHR9XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbmNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHR2YXIgc3RhdGVQcm9wID0gb3B0aW9ucy5zdGF0ZVByb3AgfHwgXCJzdGF0ZVwiO1xuXHRcdHZhciBzdGF0ZSA9IG9wdGlvbnNbc3RhdGVQcm9wXSB8fCB7fTtcblx0XHR2YXIgaGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyggdGhpcywgb3B0aW9ucy5oYW5kbGVycyApO1xuXHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHR2YXIgaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHRcdH07XG5cblx0XHR0aGlzLnNldFN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcblx0XHRcdGlmKCFpbkRpc3BhdGNoKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInNldFN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIpO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKHN0YXRlLCBuZXdTdGF0ZSk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmKHRoaXMuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bWl4aW4odGhpcywgbHV4QWN0aW9uTGlzdGVuZXJNaXhpbih7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0XHRcdGlmIChoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV0uY2FsbCh0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KGRhdGEuZGVwcykpO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IChyZXMgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0XHRcdFx0YCR7dGhpcy5uYW1lc3BhY2V9LmhhbmRsZWQuJHtkYXRhLmFjdGlvblR5cGV9YCxcblx0XHRcdFx0XHRcdHsgaGFzQ2hhbmdlZDogdGhpcy5oYXNDaGFuZ2VkLCBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlIH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHR9KSk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gaW5EaXNwYXRjaCksXG5cdFx0fTtcblxuXHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvcihPYmplY3Qua2V5cyhoYW5kbGVycykpO1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChvcHRpb25zLmhhbmRsZXJzKVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0ZGVsZXRlIG9wdGlvbnMuaGFuZGxlcnM7XG5cdFx0ZGVsZXRlIG9wdGlvbnMuc3RhdGU7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcblx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0ZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG5cdFx0fSwgYWN0aW9uKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0pO1xufVxuLypcblx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0e1xuXHRcdGdlbmVyYXRpb25zOiBbXSxcblx0XHRhY3Rpb24gOiB7XG5cdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0YWN0aW9uQXJnczogW11cblx0XHR9XG5cdH1cbiovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCB7XG5cdFx0XHRnZW5lcmF0aW9uSW5kZXg6IDAsXG5cdFx0XHRzdG9yZXM6IHt9LFxuXHRcdFx0dXBkYXRlZDogW11cblx0XHR9LCBjb25maWcpO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB7XG5cdFx0XHRoYW5kbGVkOiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0KGRhdGEpID0+IHRoaXMuaGFuZGxlKFwiYWN0aW9uLmhhbmRsZWRcIiwgZGF0YSlcblx0XHRcdClcblx0XHR9O1xuXG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildO1xuXHRcdFx0XHRcdFx0fSBjYXRjaChleCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVyciA9IGV4O1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhleCk7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHRpZihkYXRhLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goZGF0YS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFwiYWN0aW9uLmZhaWx1cmVcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0c3VjY2Vzcyhmbikge1xuXHRcdHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZmFpbHVyZShmbikge1xuXHRcdHRoaXMub24oXCJlcnJvclwiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUpIHtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0aWYoZGVwU3RvcmUpIHtcblx0XHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gLyplbHNlIHtcblx0XHRcdFx0Ly8gVE9ETzogYWRkIGNvbnNvbGUud2FybiBvbiBkZWJ1ZyBidWlsZFxuXHRcdFx0XHQvLyBub3RpbmcgdGhhdCBhIHN0b3JlIGFjdGlvbiBzcGVjaWZpZXMgYW5vdGhlciBzdG9yZVxuXHRcdFx0XHQvLyBhcyBhIGRlcGVuZGVuY3kgdGhhdCBkb2VzIE5PVCBwYXJ0aWNpcGF0ZSBpbiB0aGUgYWN0aW9uXG5cdFx0XHRcdC8vIHRoaXMgaXMgd2h5IGFjdGlvblR5cGUgaXMgYW4gYXJnIGhlcmUuLi4uXG5cdFx0XHR9Ki9cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgaGFuZGxpbmcgPSB0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKHRoaXMubHV4QWN0aW9uLmFjdGlvbi5hY3Rpb25UeXBlKTtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLnN0b3JlcyA9IGhhbmRsaW5nLnN0b3Jlcztcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zID0gaGFuZGxpbmcudHJlZTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoYWN0aW9uVHlwZSkge1xuXHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uVHlwZV0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdHRyZWU6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0KGRhdGEsIGVudikgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKGNvbmZpZykge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgY29uZmlnKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxuLy8gTk9URSAtIHRoZXNlIHdpbGwgZXZlbnR1YWxseSBsaXZlIGluIHRoZWlyIG93biBhZGQtb24gbGliIG9yIGluIGEgZGVidWcgYnVpbGQgb2YgbHV4XG52YXIgdXRpbHMgPSB7XG5cdHByaW50QWN0aW9ucygpIHtcblx0XHR2YXIgYWN0aW9ucyA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKVxuXHRcdFx0Lm1hcChmdW5jdGlvbih4KSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XCJhY3Rpb24gbmFtZVwiIDogeCxcblx0XHRcdFx0XHRcInN0b3Jlc1wiIDogZGlzcGF0Y2hlci5nZXRTdG9yZXNIYW5kbGluZyh4KS5zdG9yZXMubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgubmFtZXNwYWNlOyB9KS5qb2luKFwiLFwiKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0aWYoY29uc29sZSAmJiBjb25zb2xlLnRhYmxlKSB7XG5cdFx0XHRjb25zb2xlLmdyb3VwKFwiQ3VycmVudGx5IFJlY29nbml6ZWQgQWN0aW9uc1wiKTtcblx0XHRcdGNvbnNvbGUudGFibGUoYWN0aW9ucyk7XG5cdFx0XHRjb25zb2xlLmdyb3VwRW5kKCk7XG5cdFx0fSBlbHNlIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhhY3Rpb25zKTtcblx0XHR9XG5cdH0sXG5cblx0cHJpbnRTdG9yZURlcFRyZWUoYWN0aW9uVHlwZSkge1xuXHRcdHZhciB0cmVlID0gW107XG5cdFx0YWN0aW9uVHlwZSA9IHR5cGVvZiBhY3Rpb25UeXBlID09PSBcInN0cmluZ1wiID8gW2FjdGlvblR5cGVdIDogYWN0aW9uVHlwZTtcblx0XHRpZighYWN0aW9uVHlwZSkge1xuXHRcdFx0YWN0aW9uVHlwZSA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKTtcblx0XHR9XG5cdFx0YWN0aW9uVHlwZS5mb3JFYWNoKGZ1bmN0aW9uKGF0KXtcblx0XHRcdGRpc3BhdGNoZXIuZ2V0U3RvcmVzSGFuZGxpbmcoYXQpXG5cdFx0XHQgICAgLnRyZWUuZm9yRWFjaChmdW5jdGlvbih4KSB7XG5cdFx0XHQgICAgICAgIHdoaWxlICh4Lmxlbmd0aCkge1xuXHRcdFx0ICAgICAgICAgICAgdmFyIHQgPSB4LnBvcCgpO1xuXHRcdFx0ICAgICAgICAgICAgdHJlZS5wdXNoKHtcblx0XHRcdCAgICAgICAgICAgIFx0XCJhY3Rpb24gdHlwZVwiIDogYXQsXG5cdFx0XHQgICAgICAgICAgICAgICAgXCJzdG9yZSBuYW1lc3BhY2VcIiA6IHQubmFtZXNwYWNlLFxuXHRcdFx0ICAgICAgICAgICAgICAgIFwid2FpdHMgZm9yXCIgOiB0LndhaXRGb3Iuam9pbihcIixcIiksXG5cdFx0XHQgICAgICAgICAgICAgICAgZ2VuZXJhdGlvbjogdC5nZW5cblx0XHRcdCAgICAgICAgICAgIH0pO1xuXHRcdFx0ICAgICAgICB9XG5cdFx0XHQgICAgfSk7XG5cdFx0ICAgIGlmKGNvbnNvbGUgJiYgY29uc29sZS50YWJsZSkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGBTdG9yZSBEZXBlbmRlbmN5IExpc3QgZm9yICR7YXR9YCk7XG5cdFx0XHRcdGNvbnNvbGUudGFibGUodHJlZSk7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKTtcblx0XHRcdH0gZWxzZSBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgU3RvcmUgRGVwZW5kZW5jeSBMaXN0IGZvciAke2F0fTpgKTtcblx0XHRcdFx0Y29uc29sZS5sb2codHJlZSk7XG5cdFx0XHR9XG5cdFx0XHR0cmVlID0gW107XG5cdFx0fSk7XG5cdH1cbn07XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbkNyZWF0b3JzLFxuXHRcdGFkZFRvQWN0aW9uR3JvdXAsXG5cdFx0Y29tcG9uZW50LFxuXHRcdGNvbnRyb2xsZXJWaWV3LFxuXHRcdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRnZXRBY3Rpb25Hcm91cCxcblx0XHRhY3Rpb25EaXNwYXRjaGVyLFxuXHRcdGFjdGlvbkxpc3RlbmVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRTdG9yZSxcblx0XHRzdG9yZXMsXG5cdFx0dXRpbHNcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzQrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzVbJF9fcGxhY2Vob2xkZXJfXzYgLSAkX19wbGFjZWhvbGRlcl9fN10gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzhdOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==