/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.0
 * Url: https://github.com/LeanKit-Labs/lux.js
 * License(s): MIT Copyright (c) 2014 LeanKit
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["traceur", "react", "postal.request-response", "machina", "when", "when.pipeline", "when.parallel"], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = function(postal, machina) {
      return factory(require("traceur"), require("react"), postal, machina, require("when"), require("when/pipeline"), require("when/parallel"));
    };
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}(this, function(traceur, React, postal, machina, when, pipeline, parallel) {
  var $__10 = $traceurRuntime.initGeneratorFunction(entries);
  var luxCh = postal.channel("lux");
  var stores = {};
  function entries(obj) {
    var $__5,
        $__6,
        k;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
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
    }, $__10, this);
  }
  function configSubscription(context, subscription) {
    return subscription.withContext(context).withConstraint(function(data, envelope) {
      return !(envelope.hasOwnProperty("originId")) || (envelope.originId === postal.instanceId());
    });
  }
  function buildActionList(handlers) {
    var actionList = [];
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__8 = $__6.value,
          key = $__8[0],
          handler = $__8[1];
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
  function getActionCreatorFor(store) {
    return actionCreators[store];
  }
  function buildActionCreatorFrom(actionList) {
    var actionCreator = {};
    actionList.forEach(function(action) {
      actionCreator[action] = function() {
        var args = Array.from(arguments);
        luxCh.publish({
          topic: "action",
          data: {
            actionType: action,
            actionArgs: args
          }
        });
      };
    });
    return actionCreator;
  }
  function transformHandler(store, target, key, handler) {
    target[key] = function(data) {
      return when(handler.apply(store, data.actionArgs.concat([data.deps]))).then(function(x) {
        return [null, x];
      }, function(err) {
        return [err];
      }).then(function(values) {
        var result = values[1];
        var error = values[0];
        if (error && typeof store.handleActionError === "function") {
          return when.join(error, result, store.handleActionError(key, error));
        } else {
          return when.join(error, result);
        }
      }).then(function(values) {
        var res = values[1];
        var err = values[0];
        return when({
          hasChanged: store.hasChanged,
          result: res,
          error: err,
          state: store.getState()
        });
      });
    };
  }
  function transformHandlers(store, handlers) {
    var target = {};
    for (var $__5 = entries(handlers)[Symbol.iterator](),
        $__6; !($__6 = $__5.next()).done; ) {
      var $__8 = $__6.value,
          key = $__8[0],
          handler = $__8[1];
      {
        transformHandler(store, target, key, typeof handler === "object" ? handler.handler : handler);
      }
    }
    return target;
  }
  function ensureStoreOptions(options) {
    if (!options.namespace) {
      throw new Error("A lux store must have a namespace value provided");
    }
    if (!options.handlers) {
      throw new Error("A lux store must have action handler methods provided");
    }
  }
  var stores = {};
  var Store = function Store(options) {
    "use strict";
    var $__0 = this;
    ensureStoreOptions(options);
    var namespace = options.namespace;
    if (namespace in stores) {
      throw new Error((" The store namespace \"" + namespace + "\" already exists."));
    } else {
      stores[namespace] = this;
    }
    this.changedKeys = [];
    this.actionHandlers = transformHandlers(this, options.handlers);
    actionCreators[namespace] = buildActionCreatorFrom(Object.keys(options.handlers));
    Object.assign(this, options);
    this.inDispatch = false;
    this.hasChanged = false;
    this.state = options.state || {};
    this.__subscription = {
      dispatch: configSubscription(this, luxCh.subscribe(("dispatch." + namespace), this.handlePayload)),
      notify: configSubscription(this, luxCh.subscribe("notify", this.flush)).withConstraint((function() {
        return $__0.inDispatch;
      })),
      scopedNotify: configSubscription(this, luxCh.subscribe(("notify." + namespace), this.flush))
    };
    luxCh.publish("register", {
      namespace: namespace,
      actions: buildActionList(options.handlers)
    });
  };
  ($traceurRuntime.createClass)(Store, {
    dispose: function() {
      "use strict";
      for (var $__5 = entries(this.__subscription)[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__8 = $__6.value,
            k = $__8[0],
            subscription = $__8[1];
        {
          subscription.unsubscribe();
        }
      }
      delete stores[this.namespace];
    },
    getState: function() {
      "use strict";
      return this.state;
    },
    setState: function(newState) {
      "use strict";
      var $__0 = this;
      this.hasChanged = true;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = Object.assign(this.state, newState));
    },
    replaceState: function(newState) {
      "use strict";
      var $__0 = this;
      this.hasChanged = true;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = newState);
    },
    flush: function() {
      "use strict";
      this.inDispatch = false;
      if (this.hasChanged) {
        var changedKeys = Object.keys(this.changedKeys);
        this.changedKeys = {};
        this.hasChanged = false;
        luxCh.publish(("notification." + this.namespace), {
          changedKeys: changedKeys,
          state: this.state
        });
      } else {
        luxCh.publish(("nochange." + this.namespace));
      }
    },
    handlePayload: function(data, envelope) {
      "use strict";
      var namespace = this.namespace;
      if (this.actionHandlers.hasOwnProperty(data.actionType)) {
        this.inDispatch = true;
        this.actionHandlers[data.actionType].call(this, data).then((function(result) {
          return envelope.reply(null, result);
        }), (function(err) {
          return envelope.reply(err);
        }));
      }
    }
  }, {});
  function removeStore(namespace) {
    stores[namespace].dispose();
  }
  function pluck(obj, keys) {
    var res = keys.reduce((function(accum, key) {
      accum[key] = (obj[key] && obj[key].result);
      return accum;
    }), {});
    return res;
  }
  function processGeneration(generation, action) {
    var $__0 = this;
    return (function() {
      return parallel(generation.map((function(store) {
        return (function() {
          var data = Object.assign({deps: pluck($__0.stores, store.waitFor)}, action);
          return luxCh.request({
            topic: ("dispatch." + store.namespace),
            data: data
          }).then((function(response) {
            $__0.stores[store.namespace] = response;
            if (response.hasChanged) {
              $__0.updated.push(store.namespace);
            }
          }));
        });
      }))).then((function() {
        return $__0.stores;
      }));
    });
  }
  var ActionCoordinator = function ActionCoordinator(config) {
    "use strict";
    Object.assign(this, {
      generationIndex: 0,
      stores: {},
      updated: []
    }, config);
    $traceurRuntime.superCall(this, $ActionCoordinator.prototype, "constructor", [{
      initialState: "uninitialized",
      states: {
        uninitialized: {start: "dispatching"},
        dispatching: {
          _onEnter: function() {
            var $__4 = this;
            pipeline((function() {
              var $__2 = 0,
                  $__3 = [];
              for (var $__5 = config.generations[Symbol.iterator](),
                  $__6; !($__6 = $__5.next()).done; ) {
                var generation = $__6.value;
                $__3[$__2++] = processGeneration.call($__4, generation, config.action);
              }
              return $__3;
            }())).then(function() {
              for (var results = [],
                  $__7 = 0; $__7 < arguments.length; $__7++)
                results[$__7] = arguments[$__7];
              this.transition("success");
            }.bind(this), function(err) {
              this.err = err;
              this.transition("failure");
            }.bind(this));
          },
          _onExit: function() {
            luxCh.publish("prenotify", {stores: this.updated});
          }
        },
        success: {_onEnter: function() {
            luxCh.publish("notify", {action: this.action});
            this.emit("success");
          }},
        failure: {_onEnter: function() {
            luxCh.publish("notify", {action: this.action});
            luxCh.publish("failure.action", {
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
      var $__8 = $__6.value,
          key = $__8[0],
          item = $__8[1];
      {
        tree[item.gen] = tree[item.gen] || [];
        tree[item.gen].push(item);
      }
    }
    return tree;
  }
  var Dispatcher = function Dispatcher() {
    "use strict";
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
            var stores = this.actionMap[this.luxAction.action.actionType];
            this.luxAction.stores = stores;
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
    this.__subscriptions = [configSubscription(this, luxCh.subscribe("action", function(data, env) {
      this.handleActionDispatch(data);
    })), configSubscription(this, luxCh.subscribe("register", function(data, env) {
      this.handleStoreRegistration(data);
    }))];
  };
  var $Dispatcher = Dispatcher;
  ($traceurRuntime.createClass)(Dispatcher, {
    handleActionDispatch: function(data, envelope) {
      "use strict";
      this.handle("action.dispatch", data);
    },
    handleStoreRegistration: function(data, envelope) {
      "use strict";
      this.handle("register.store", data);
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
  var luxMixinCleanup = function() {
    var $__0 = this;
    this.__luxCleanup.forEach((function(method) {
      return method.call($__0);
    }));
    this.__luxCleanup = undefined;
    delete this.__luxCleanup;
  };
  function gateKeeper(store, data) {
    var $__9;
    var payload = {};
    payload[store] = data;
    var found = this.__luxWaitFor.indexOf(store);
    if (found > -1) {
      this.__luxWaitFor.splice(found, 1);
      this.__luxHeardFrom.push(payload);
      if (this.__luxWaitFor.length === 0) {
        payload = ($__9 = Object).assign.apply($__9, $traceurRuntime.spread([{}], this.__luxHeardFrom));
        this.__luxHeardFrom = [];
        this.stores.onChange.call(this, payload);
      }
    } else {
      this.stores.onChange.call(this, payload);
    }
  }
  function handlePreNotify(data) {
    var $__0 = this;
    this.__luxWaitFor = data.stores.filter((function(item) {
      return $__0.stores.listenTo.indexOf(item) > -1;
    }));
  }
  var luxStoreMixin = {
    setup: function() {
      var $__9;
      var $__0 = this;
      var stores = this.stores = (this.stores || {});
      var immediate = stores.immediate;
      var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
      var genericStateChangeHandler = function(stores) {
        if (typeof this.setState === "function") {
          var newState = {};
          for (var $__5 = entries(stores)[Symbol.iterator](),
              $__6; !($__6 = $__5.next()).done; ) {
            var $__8 = $__6.value,
                k = $__8[0],
                v = $__8[1];
            {
              newState[k] = v.state;
            }
          }
          this.setState(newState);
        }
      };
      this.__luxWaitFor = [];
      this.__luxHeardFrom = [];
      this.__subscriptions = this.__subscriptions || [];
      stores.onChange = stores.onChange || genericStateChangeHandler;
      listenTo.forEach((function(store) {
        return $__0.__subscriptions.push(luxCh.subscribe(("notification." + store), (function(data) {
          return gateKeeper.call($__0, store, data);
        })));
      }));
      this.__subscriptions.push(luxCh.subscribe("prenotify", (function(data) {
        return handlePreNotify.call($__0, data);
      })));
      if (immediate) {
        if (immediate === true) {
          this.loadState();
        } else {
          ($__9 = this).loadState.apply($__9, $traceurRuntime.spread(immediate));
        }
      }
    },
    teardown: function() {
      this.__subscriptions.forEach((function(sub) {
        return sub.unsubscribe();
      }));
    },
    mixin: {loadState: function() {
        for (var stores = [],
            $__7 = 0; $__7 < arguments.length; $__7++)
          stores[$__7] = arguments[$__7];
        if (!stores.length) {
          stores = this.stores.listenTo;
        }
        stores.forEach((function(store) {
          return luxCh.publish(("notify." + store));
        }));
      }}
  };
  var luxStoreReactMixin = {
    componentWillMount: luxStoreMixin.setup,
    loadState: luxStoreMixin.mixin.loadState,
    componentWillUnmount: luxStoreMixin.teardown
  };
  var luxActionMixin = {setup: function() {
      this.actions = this.actions || {};
      this.getActionsFor = this.getActionsFor || [];
      this.getActionsFor.forEach(function(store) {
        for (var $__5 = entries(getActionCreatorFor(store))[Symbol.iterator](),
            $__6; !($__6 = $__5.next()).done; ) {
          var $__8 = $__6.value,
              k = $__8[0],
              v = $__8[1];
          {
            this[k] = v;
          }
        }
      }.bind(this));
    }};
  var luxActionReactMixin = {componentWillMount: luxActionMixin.setup};
  function createControllerView(options) {
    var opt = {mixins: [luxStoreReactMixin, luxActionReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function createComponent(options) {
    var opt = {mixins: [luxActionReactMixin].concat(options.mixins || [])};
    delete options.mixins;
    return React.createClass(Object.assign(opt, options));
  }
  function mixin(context) {
    context.__luxCleanup = [];
    if (context.stores) {
      luxStoreMixin.setup.call(context);
      Object.assign(context, luxStoreMixin.mixin);
      context.__luxCleanup.push(luxStoreMixin.teardown);
    }
    if (context.getActionsFor) {
      luxActionMixin.setup.call(context);
    }
    context.luxCleanup = luxMixinCleanup;
  }
  return {
    channel: luxCh,
    Store: Store,
    createControllerView: createControllerView,
    createComponent: createComponent,
    removeStore: removeStore,
    dispatcher: dispatcher,
    mixin: mixin,
    ActionCoordinator: ActionCoordinator,
    getActionCreatorFor: getActionCreatorFor
  };
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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LE9BQU8sQUFBQyxDQUFDLE9BQU0sT0FBTyxHQUFLLEdBQUMsQ0FBQyxDQUMxRCxDQUFDO0FBQ0QsU0FBTyxRQUFNLE9BQU8sQ0FBQztBQUNyQixTQUFPLENBQUEsS0FBSSxZQUFZLEFBQUMsQ0FBQyxNQUFLLE9BQU8sQUFBQyxDQUFDLEdBQUUsQ0FBRyxRQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ3REO0FBQUEsQUFHQSxTQUFTLE1BQUksQ0FBRSxPQUFNLENBQUc7QUFDdkIsVUFBTSxhQUFhLEVBQUksR0FBQyxDQUFDO0FBRXpCLE9BQUssT0FBTSxPQUFPLENBQUk7QUFDckIsa0JBQVksTUFBTSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztBQUNuQyxXQUFLLE9BQU8sQUFBQyxDQUFDLE9BQU0sQ0FBRyxDQUFBLGFBQVksTUFBTSxDQUFDLENBQUM7QUFDM0MsWUFBTSxhQUFhLEtBQUssQUFBQyxDQUFFLGFBQVksU0FBUyxDQUFFLENBQUM7SUFDcEQ7QUFBQSxBQUVBLE9BQUssT0FBTSxjQUFjLENBQUk7QUFDNUIsbUJBQWEsTUFBTSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztJQUNyQztBQUFBLEFBRUEsVUFBTSxXQUFXLEVBQUksZ0JBQWMsQ0FBQztFQUNyQztBQUFBLEFBSUMsT0FBTztBQUNOLFVBQU0sQ0FBRyxNQUFJO0FBQ2IsUUFBSSxDQUFKLE1BQUk7QUFDSix1QkFBbUIsQ0FBbkIscUJBQW1CO0FBQ25CLGtCQUFjLENBQWQsZ0JBQWM7QUFDZCxjQUFVLENBQVYsWUFBVTtBQUNWLGFBQVMsQ0FBVCxXQUFTO0FBQ1QsUUFBSSxDQUFHLE1BQUk7QUFDWCxvQkFBZ0IsQ0FBaEIsa0JBQWdCO0FBQ2hCLHNCQUFrQixDQUFsQixvQkFBa0I7QUFBQSxFQUNuQixDQUFDO0FBR0YsQ0FBQyxDQUFDLENBQUM7QUFDSCIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbiggZnVuY3Rpb24oIHJvb3QsIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcInRyYWNldXJcIiwgXCJyZWFjdFwiLCBcInBvc3RhbC5yZXF1ZXN0LXJlc3BvbnNlXCIsIFwibWFjaGluYVwiLCBcIndoZW5cIiwgXCJ3aGVuLnBpcGVsaW5lXCIsIFwid2hlbi5wYXJhbGxlbFwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cyApIHtcblx0XHQvLyBOb2RlLCBvciBDb21tb25KUy1MaWtlIGVudmlyb25tZW50c1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBvc3RhbCwgbWFjaGluYSApIHtcblx0XHRcdHJldHVybiBmYWN0b3J5KFxuXHRcdFx0XHRyZXF1aXJlKFwidHJhY2V1clwiKSxcblx0XHRcdFx0cmVxdWlyZShcInJlYWN0XCIpLFxuXHRcdFx0XHRwb3N0YWwsXG5cdFx0XHRcdG1hY2hpbmEsXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW4vcGFyYWxsZWxcIikpO1xuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiU29ycnkgLSBsdXhKUyBvbmx5IHN1cHBvcnQgQU1EIG9yIENvbW1vbkpTIG1vZHVsZSBlbnZpcm9ubWVudHMuXCIpO1xuXHR9XG59KCB0aGlzLCBmdW5jdGlvbiggdHJhY2V1ciwgUmVhY3QsIHBvc3RhbCwgbWFjaGluYSwgd2hlbiwgcGlwZWxpbmUsIHBhcmFsbGVsICkge1xuXG5cdHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG5cdHZhciBzdG9yZXMgPSB7fTtcblxuXHQvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG5cdGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuXHRcdGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG5cdFx0XHR5aWVsZCBbaywgb2JqW2tdXTtcblx0XHR9XG5cdH1cblx0Ly8ganNoaW50IGlnbm9yZTplbmRcblxuXHRmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuXHRcdCAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoZW52ZWxvcGUuaGFzT3duUHJvcGVydHkoXCJvcmlnaW5JZFwiKSkgfHxcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG5cdFx0ICAgICAgICAgICAgICAgICAgIH0pO1xuXHR9XG5cblx0XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuXHR2YXIgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCh7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxudmFyIGFjdGlvbkNyZWF0b3JzID0ge307XG5cbmZ1bmN0aW9uIGdldEFjdGlvbkNyZWF0b3JGb3IoIHN0b3JlICkge1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcblx0dmFyIGFjdGlvbkNyZWF0b3IgPSB7fTtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGFjdGlvbikge1xuXHRcdGFjdGlvbkNyZWF0b3JbYWN0aW9uXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKGFyZ3VtZW50cyk7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKHtcblx0XHRcdFx0dG9waWM6IFwiYWN0aW9uXCIsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9KTtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG5cblx0XG5cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcihzdG9yZSwgdGFyZ2V0LCBrZXksIGhhbmRsZXIpIHtcblx0dGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuIHdoZW4oaGFuZGxlci5hcHBseShzdG9yZSwgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdChbZGF0YS5kZXBzXSkpKVxuXHRcdFx0LnRoZW4oXG5cdFx0XHRcdGZ1bmN0aW9uKHgpeyByZXR1cm4gW251bGwsIHhdOyB9LFxuXHRcdFx0XHRmdW5jdGlvbihlcnIpeyByZXR1cm4gW2Vycl07IH1cblx0XHRcdCkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gdmFsdWVzWzFdO1xuXHRcdFx0XHR2YXIgZXJyb3IgPSB2YWx1ZXNbMF07XG5cdFx0XHRcdGlmKGVycm9yICYmIHR5cGVvZiBzdG9yZS5oYW5kbGVBY3Rpb25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCwgc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3Ioa2V5LCBlcnJvcikpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuXHRcdFx0XHR2YXIgcmVzID0gdmFsdWVzWzFdO1xuXHRcdFx0XHR2YXIgZXJyID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRyZXR1cm4gd2hlbih7XG5cdFx0XHRcdFx0aGFzQ2hhbmdlZDogc3RvcmUuaGFzQ2hhbmdlZCxcblx0XHRcdFx0XHRyZXN1bHQ6IHJlcyxcblx0XHRcdFx0XHRlcnJvcjogZXJyLFxuXHRcdFx0XHRcdHN0YXRlOiBzdG9yZS5nZXRTdGF0ZSgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXJzKHN0b3JlLCBoYW5kbGVycykge1xuXHR2YXIgdGFyZ2V0ID0ge307XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0dHJhbnNmb3JtSGFuZGxlcihcblx0XHRcdHN0b3JlLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0a2V5LFxuXHRcdFx0dHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucykge1xuXHRpZighb3B0aW9ucy5uYW1lc3BhY2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIik7XG5cdH1cblx0aWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiKTtcblx0fVxufVxuXG52YXIgc3RvcmVzID0ge307XG5cbmNsYXNzIFN0b3JlIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2U7XG5cdFx0aWYgKG5hbWVzcGFjZSBpbiBzdG9yZXMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgIFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuXHRcdH1cblx0XHR0aGlzLmNoYW5nZWRLZXlzID0gW107XG5cdFx0dGhpcy5hY3Rpb25IYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKHRoaXMsIG9wdGlvbnMuaGFuZGxlcnMpO1xuXHRcdGFjdGlvbkNyZWF0b3JzW25hbWVzcGFjZV0gPSBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMuaGFuZGxlcnMpKTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuXHRcdHRoaXMuaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdHRoaXMuc3RhdGUgPSBvcHRpb25zLnN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRkaXNwYXRjaDogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgZGlzcGF0Y2guJHtuYW1lc3BhY2V9YCwgdGhpcy5oYW5kbGVQYXlsb2FkKSksXG5cdFx0XHRub3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeWAsIHRoaXMuZmx1c2gpKS53aXRoQ29uc3RyYWludCgoKSA9PiB0aGlzLmluRGlzcGF0Y2gpLFxuXHRcdFx0c2NvcGVkTm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnkuJHtuYW1lc3BhY2V9YCwgdGhpcy5mbHVzaCkpXG5cdFx0fTtcblx0XHRsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuXHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KG9wdGlvbnMuaGFuZGxlcnMpXG5cdFx0fSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHRkZWxldGUgc3RvcmVzW3RoaXMubmFtZXNwYWNlXTtcblx0fVxuXG5cdGdldFN0YXRlKCkge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlO1xuXHR9XG5cblx0c2V0U3RhdGUobmV3U3RhdGUpIHtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSkpO1xuXHR9XG5cblx0cmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiAodGhpcy5zdGF0ZSA9IG5ld1N0YXRlKTtcblx0fVxuXG5cdGZsdXNoKCkge1xuXHRcdHRoaXMuaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdGlmKHRoaXMuaGFzQ2hhbmdlZCkge1xuXHRcdFx0dmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzID0ge307XG5cdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdGx1eENoLnB1Ymxpc2goYG5vdGlmaWNhdGlvbi4ke3RoaXMubmFtZXNwYWNlfWAsIHsgY2hhbmdlZEtleXMsIHN0YXRlOiB0aGlzLnN0YXRlIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKGBub2NoYW5nZS4ke3RoaXMubmFtZXNwYWNlfWApO1xuXHRcdH1cblxuXHR9XG5cblx0aGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHZhciBuYW1lc3BhY2UgPSB0aGlzLm5hbWVzcGFjZTtcblx0XHRpZiAodGhpcy5hY3Rpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShkYXRhLmFjdGlvblR5cGUpKSB7XG5cdFx0XHR0aGlzLmluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0dGhpcy5hY3Rpb25IYW5kbGVyc1tkYXRhLmFjdGlvblR5cGVdXG5cdFx0XHRcdC5jYWxsKHRoaXMsIGRhdGEpXG5cdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdChyZXN1bHQpID0+IGVudmVsb3BlLnJlcGx5KG51bGwsIHJlc3VsdCksXG5cdFx0XHRcdFx0KGVycikgPT4gZW52ZWxvcGUucmVwbHkoZXJyKVxuXHRcdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdG9yZShuYW1lc3BhY2UpIHtcblx0c3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuXG5cdFxuXG5mdW5jdGlvbiBwbHVjayhvYmosIGtleXMpIHtcblx0dmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG5cdFx0YWNjdW1ba2V5XSA9IChvYmpba2V5XSAmJiBvYmpba2V5XS5yZXN1bHQpO1xuXHRcdHJldHVybiBhY2N1bTtcblx0fSwge30pO1xuXHRyZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcblx0XHRyZXR1cm4gKCkgPT4gcGFyYWxsZWwoXG5cdFx0XHRnZW5lcmF0aW9uLm1hcCgoc3RvcmUpID0+IHtcblx0XHRcdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0XHRcdFx0ZGVwczogcGx1Y2sodGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IpXG5cdFx0XHRcdFx0fSwgYWN0aW9uKTtcblx0XHRcdFx0XHRyZXR1cm4gbHV4Q2gucmVxdWVzdCh7XG5cdFx0XHRcdFx0XHR0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG5cdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0fSkudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gPSByZXNwb25zZTtcblx0XHRcdFx0XHRcdGlmKHJlc3BvbnNlLmhhc0NoYW5nZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVkLnB1c2goc3RvcmUubmFtZXNwYWNlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblx0XHRcdH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcblx0fVxuXHQvKlxuXHRcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdFx0e1xuXHRcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdFx0YWN0aW9uIDoge1xuXHRcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge30sXG5cdFx0XHR1cGRhdGVkOiBbXVxuXHRcdH0sIGNvbmZpZyk7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHR1bmluaXRpYWxpemVkOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyKCkge1xuXHRcdFx0XHRcdFx0XHRwaXBlbGluZShcblx0XHRcdFx0XHRcdFx0XHRbZm9yIChnZW5lcmF0aW9uIG9mIGNvbmZpZy5nZW5lcmF0aW9ucykgcHJvY2Vzc0dlbmVyYXRpb24uY2FsbCh0aGlzLCBnZW5lcmF0aW9uLCBjb25maWcuYWN0aW9uKV1cblx0XHRcdFx0XHRcdFx0KS50aGVuKGZ1bmN0aW9uKC4uLnJlc3VsdHMpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXJyO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IHRoaXMudXBkYXRlZCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3VjY2Vzczoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWlsdXJlOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0XHRcdFx0ZXJyOiB0aGlzLmVyclxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHN1Y2Nlc3MoZm4pIHtcblx0XHR0aGlzLm9uKFwic3VjY2Vzc1wiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGZhaWx1cmUoZm4pIHtcblx0XHR0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5cdFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG5cdGdlbiA9IGdlbiB8fCAwO1xuXHR2YXIgY2FsY2RHZW4gPSBnZW47XG5cdGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKGZ1bmN0aW9uKGRlcCkge1xuXHRcdFx0dmFyIGRlcFN0b3JlID0gbG9va3VwW2RlcF07XG5cdFx0XHR2YXIgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbihkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxKTtcblx0XHRcdGlmICh0aGlzR2VuID4gY2FsY2RHZW4pIHtcblx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpIHtcblx0dmFyIHRyZWUgPSBbXTtcblx0dmFyIGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGxvb2t1cFtzdG9yZS5uYW1lc3BhY2VdID0gc3RvcmUpO1xuXHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwKSk7XG5cdGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuXHRcdHRyZWVbaXRlbS5nZW5dID0gdHJlZVtpdGVtLmdlbl0gfHwgW107XG5cdFx0dHJlZVtpdGVtLmdlbl0ucHVzaChpdGVtKTtcblx0fVxuXHRyZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoe1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0Y29vcmRpbmF0b3JzOiBbXSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge307XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBmdW5jdGlvbihhY3Rpb25NZXRhKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb25NZXRhXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwicHJlcGFyaW5nXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0XHRcdFx0XHR2YXIgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcblx0XHRcdFx0XHRcdFx0YWN0aW9uLnB1c2goYWN0aW9uTWV0YSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbdGhpcy5sdXhBY3Rpb24uYWN0aW9uLmFjdGlvblR5cGVdO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uc3RvcmVzID0gc3RvcmVzO1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMgPSBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcyk7XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24odGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoID8gXCJkaXNwYXRjaGluZ1wiIDogXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvb3JkaW5hdG9yID0gdGhpcy5sdXhBY3Rpb24uY29vcmRpbmF0b3IgPSBuZXcgQWN0aW9uQ29vcmRpbmF0b3Ioe1xuXHRcdFx0XHRcdFx0XHRnZW5lcmF0aW9uczogdGhpcy5sdXhBY3Rpb24uZ2VuZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5sdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvb3JkaW5hdG9yXG5cdFx0XHRcdFx0XHRcdC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuXHRcdFx0XHRcdFx0XHQuZmFpbHVyZSgoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdG9wcGVkOiB7fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJhY3Rpb25cIixcblx0XHRcdFx0XHRmdW5jdGlvbihkYXRhLCBlbnYpIHtcblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0Y29uZmlnU3Vic2NyaXB0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRsdXhDaC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJyZWdpc3RlclwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHRdO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcImFjdGlvbi5kaXNwYXRjaFwiLCBkYXRhKTtcblx0fVxuXG5cdGhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJyZWdpc3Rlci5zdG9yZVwiLCBkYXRhKTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblx0fVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cblx0XG5cblxudmFyIGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5fX2x1eENsZWFudXAuZm9yRWFjaCggKG1ldGhvZCkgPT4gbWV0aG9kLmNhbGwodGhpcykgKTtcblx0dGhpcy5fX2x1eENsZWFudXAgPSB1bmRlZmluZWQ7XG5cdGRlbGV0ZSB0aGlzLl9fbHV4Q2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoc3RvcmUsIGRhdGEpIHtcblx0dmFyIHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFtzdG9yZV0gPSBkYXRhO1xuXG5cdHZhciBmb3VuZCA9IHRoaXMuX19sdXhXYWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggdGhpcy5fX2x1eFdhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0cGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oIHt9LCAuLi50aGlzLl9fbHV4SGVhcmRGcm9tKTtcblx0XHRcdHRoaXMuX19sdXhIZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwodGhpcywgcGF5bG9hZCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4V2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG52YXIgbHV4U3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAodGhpcy5zdG9yZXMgfHwge30pO1xuXHRcdHZhciBpbW1lZGlhdGUgPSBzdG9yZXMuaW1tZWRpYXRlO1xuXHRcdHZhciBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbc3RvcmVzLmxpc3RlblRvXSA6IHN0b3Jlcy5saXN0ZW5Ubztcblx0XHR2YXIgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uKHN0b3Jlcykge1xuXHRcdFx0aWYgKCB0eXBlb2YgdGhpcy5zZXRTdGF0ZSA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0XHR2YXIgbmV3U3RhdGUgPSB7fTtcblx0XHRcdFx0Zm9yKCB2YXIgW2ssdl0gb2YgZW50cmllcyhzdG9yZXMpICkge1xuXHRcdFx0XHRcdG5ld1N0YXRlWyBrIF0gPSB2LnN0YXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoIG5ld1N0YXRlICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLl9fbHV4V2FpdEZvciA9IFtdO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20gPSBbXTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IHRoaXMuX19zdWJzY3JpcHRpb25zIHx8IFtdO1xuXG5cdFx0c3RvcmVzLm9uQ2hhbmdlID0gc3RvcmVzLm9uQ2hhbmdlIHx8IGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXI7XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKChzdG9yZSkgPT4gdGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcblx0XHRcdGx1eENoLnN1YnNjcmliZShgbm90aWZpY2F0aW9uLiR7c3RvcmV9YCwgKGRhdGEpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSwgZGF0YSkpXG5cdFx0KSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMucHVzaChcblx0XHRcdGx1eENoLnN1YnNjcmliZShcInByZW5vdGlmeVwiLCAoZGF0YSkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwodGhpcywgZGF0YSkpXG5cdFx0KTtcblx0XHRpZihpbW1lZGlhdGUpIHtcblx0XHRcdGlmKGltbWVkaWF0ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGUoLi4uaW1tZWRpYXRlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViKSA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0bG9hZFN0YXRlOiBmdW5jdGlvbiAoLi4uc3RvcmVzKSB7XG5cdFx0XHRpZighc3RvcmVzLmxlbmd0aCkge1xuXHRcdFx0XHRzdG9yZXMgPSB0aGlzLnN0b3Jlcy5saXN0ZW5Ubztcblx0XHRcdH1cblx0XHRcdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbHV4Q2gucHVibGlzaChgbm90aWZ5LiR7c3RvcmV9YCkpO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxudmFyIGx1eEFjdGlvbk1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcblx0XHR0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uQ3JlYXRvckZvcihzdG9yZSkpKSB7XG5cdFx0XHRcdHRoaXNba10gPSB2O1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25SZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbk1peGluLnNldHVwXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQpIHtcblx0Y29udGV4dC5fX2x1eENsZWFudXAgPSBbXTtcblxuXHRpZiAoIGNvbnRleHQuc3RvcmVzICkge1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbHV4U3RvcmVNaXhpbi5taXhpbik7XG5cdFx0Y29udGV4dC5fX2x1eENsZWFudXAucHVzaCggbHV4U3RvcmVNaXhpbi50ZWFyZG93biApO1xuXHR9XG5cblx0aWYgKCBjb250ZXh0LmdldEFjdGlvbnNGb3IgKSB7XG5cdFx0bHV4QWN0aW9uTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHR9XG5cblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xufVxuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRjaGFubmVsOiBsdXhDaCxcblx0XHRTdG9yZSxcblx0XHRjcmVhdGVDb250cm9sbGVyVmlldyxcblx0XHRjcmVhdGVDb21wb25lbnQsXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0QWN0aW9uQ29vcmRpbmF0b3IsXG5cdFx0Z2V0QWN0aW9uQ3JlYXRvckZvclxuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==