/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.1
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FBRWpELFNBQUssQUFBQyxDQUFFLENBQUUsU0FBUSxDQUFHLFFBQU0sQ0FBRywwQkFBd0IsQ0FBRyxVQUFRLENBQUcsT0FBSyxDQUFHLGdCQUFjLENBQUcsZ0JBQWMsQ0FBRSxDQUFHLFFBQU0sQ0FBRSxDQUFDO0VBQzFILEtBQU8sS0FBSyxNQUFPLE9BQUssQ0FBQSxHQUFNLFNBQU8sQ0FBQSxFQUFLLENBQUEsTUFBSyxRQUFRLENBQUk7QUFFMUQsU0FBSyxRQUFRLEVBQUksVUFBVSxNQUFLLENBQUcsQ0FBQSxPQUFNLENBQUk7QUFDNUMsV0FBTyxDQUFBLE9BQU0sQUFBQyxDQUNiLE9BQU0sQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUNqQixDQUFBLE9BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUNmLE9BQUssQ0FDTCxRQUFNLENBQ04sQ0FBQSxPQUFNLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FDZCxDQUFBLE9BQU0sQUFBQyxDQUFDLGVBQWMsQ0FBQyxDQUN2QixDQUFBLE9BQU0sQUFBQyxDQUFDLGVBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztFQUNGLEtBQU87QUFDTixRQUFNLElBQUksTUFBSSxBQUFDLENBQUMsaUVBQWdFLENBQUMsQ0FBQztFQUNuRjtBQUFBLEFBQ0QsQUFBQyxDQUFFLElBQUcsQ0FBRyxVQUFVLE9BQU0sQ0FBRyxDQUFBLEtBQUksQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE9BQU0sQ0FBRyxDQUFBLElBQUcsQ0FBRyxDQUFBLFFBQU8sQ0FBRyxDQUFBLFFBQU87WUM1QjNFLENBQUEsZUFBYyxzQkFBc0IsQUFBQyxTQUFrQjtBRDhCdEQsQUFBSSxJQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsTUFBSyxRQUFRLEFBQUMsQ0FBRSxLQUFJLENBQUUsQ0FBQztBQUNuQyxBQUFJLElBQUEsQ0FBQSxNQUFLLEVBQUksR0FBQyxDQUFDO0FBR2YsU0FBVSxRQUFNLENBQUUsR0FBRTs7OztBRWxDckIsU0FBTyxDQ0FQLGVBQWMsd0JBQXdCLEFEQWQsQ0VBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxZQUFPLElBQUc7OztpQkNDQyxDTGlDRixNQUFLLEtBQUssQUFBQyxDQUFDLEdBQUUsQ0FBQyxDS2pDSyxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7Ozs7QUNGcEQsZUFBRyxNQUFNLEVBQUksQ0FBQSxDRElBLENBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssQ0NKakMsU0FBd0MsQ0FBQztBQUNoRSxpQkFBSTs7Ozs7OztBQ0RaLGlCUG9DUyxFQUFDLENBQUEsQ0FBRyxDQUFBLEdBQUUsQ0FBRSxDQUFBLENBQUMsQ0FBQyxDT3BDSTs7QUNBdkIsZUFBRyxXQUFXLEFBQUMsRUFBQyxDQUFBOzs7O0FDQWhCLGlCQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBTENtQixJQUMvQixRRkE2QixLQUFHLENBQUMsQ0FBQztFRm9DckM7QUFHQSxTQUFTLG1CQUFpQixDQUFFLE9BQU0sQ0FBRyxDQUFBLFlBQVcsQ0FBRztBQUNsRCxTQUFPLENBQUEsWUFBVyxZQUFZLEFBQUMsQ0FBQyxPQUFNLENBQUMsZUFDTixBQUFDLENBQUMsU0FBUyxJQUFHLENBQUcsQ0FBQSxRQUFPLENBQUU7QUFDcEMsV0FBTyxDQUFBLENBQUMsQ0FBQyxRQUFPLGVBQWUsQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDLENBQUEsRUFDekMsRUFBQyxRQUFPLFNBQVMsSUFBTSxDQUFBLE1BQUssV0FBVyxBQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQztFQUN0QjtBQUFBLEFBSUQsU0FBUyxnQkFBYyxDQUFFLFFBQU87QUFDL0IsQUFBSSxNQUFBLENBQUEsVUFBUyxFQUFJLEdBQUMsQ0FBQztBS25EWixRQUFTLEdBQUEsT0FDQSxDTG1EVyxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0tuRFQsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLFdBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxpRDFELFlBQUU7QUFBRyxnQkFBTTtBQUF5QjtBQUM3QyxpQkFBUyxLQUFLLEFBQUMsQ0FBQztBQUNmLG1CQUFTLENBQUcsSUFBRTtBQUNkLGdCQUFNLENBQUcsQ0FBQSxPQUFNLFFBQVEsR0FBSyxHQUFDO0FBQUEsUUFDOUIsQ0FBQyxDQUFDO01BQ0g7SUtuRE87QUFBQSxBTG9EUCxTQUFPLFdBQVMsQ0FBQztFQUNsQjtBQUVBLEFBQUksSUFBQSxDQUFBLGNBQWEsRUFBSSxHQUFDLENBQUM7QUFFdkIsU0FBUyxvQkFBa0IsQ0FBRyxLQUFJLENBQUk7QUFDckMsU0FBTyxDQUFBLGNBQWEsQ0FBRSxLQUFJLENBQUMsQ0FBQztFQUM3QjtBQUFBLEFBRUEsU0FBUyx1QkFBcUIsQ0FBRSxVQUFTLENBQUc7QUFDM0MsQUFBSSxNQUFBLENBQUEsYUFBWSxFQUFJLEdBQUMsQ0FBQztBQUN0QixhQUFTLFFBQVEsQUFBQyxDQUFDLFNBQVMsTUFBSyxDQUFHO0FBQ25DLGtCQUFZLENBQUUsTUFBSyxDQUFDLEVBQUksVUFBUSxBQUFDLENBQUU7QUFDbEMsQUFBSSxVQUFBLENBQUEsSUFBRyxFQUFJLENBQUEsS0FBSSxLQUFLLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztBQUNoQyxZQUFJLFFBQVEsQUFBQyxDQUFDO0FBQ2IsY0FBSSxDQUFHLFNBQU87QUFDZCxhQUFHLENBQUc7QUFDTCxxQkFBUyxDQUFHLE9BQUs7QUFDakIscUJBQVMsQ0FBRyxLQUFHO0FBQUEsVUFDaEI7QUFBQSxRQUNELENBQUMsQ0FBQztNQUNILENBQUM7SUFDRixDQUFDLENBQUM7QUFDRixTQUFPLGNBQVksQ0FBQztFQUNyQjtBQUFBLEFBS0EsU0FBUyxpQkFBZSxDQUFFLEtBQUksQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLEdBQUUsQ0FBRyxDQUFBLE9BQU0sQ0FBRztBQUN0RCxTQUFLLENBQUUsR0FBRSxDQUFDLEVBQUksVUFBUyxJQUFHLENBQUc7QUFDNUIsV0FBTyxDQUFBLElBQUcsQUFBQyxDQUFDLE9BQU0sTUFBTSxBQUFDLENBQUMsS0FBSSxDQUFHLENBQUEsSUFBRyxXQUFXLE9BQU8sQUFBQyxDQUFDLENBQUMsSUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FDaEUsQUFBQyxDQUNKLFNBQVMsQ0FBQSxDQUFFO0FBQUUsYUFBTyxFQUFDLElBQUcsQ0FBRyxFQUFBLENBQUMsQ0FBQztNQUFFLENBQy9CLFVBQVMsR0FBRSxDQUFFO0FBQUUsYUFBTyxFQUFDLEdBQUUsQ0FBQyxDQUFDO01BQUUsQ0FDOUIsS0FBSyxBQUFDLENBQUMsU0FBUyxNQUFLLENBQUU7QUFDdEIsQUFBSSxVQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ3RCLEFBQUksVUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUNyQixXQUFHLEtBQUksR0FBSyxDQUFBLE1BQU8sTUFBSSxrQkFBa0IsQ0FBQSxHQUFNLFdBQVMsQ0FBRztBQUMxRCxlQUFPLENBQUEsSUFBRyxLQUFLLEFBQUMsQ0FBRSxLQUFJLENBQUcsT0FBSyxDQUFHLENBQUEsS0FBSSxrQkFBa0IsQUFBQyxDQUFDLEdBQUUsQ0FBRyxNQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLEtBQU87QUFDTixlQUFPLENBQUEsSUFBRyxLQUFLLEFBQUMsQ0FBRSxLQUFJLENBQUcsT0FBSyxDQUFFLENBQUM7UUFDbEM7QUFBQSxNQUNELENBQUMsS0FBSyxBQUFDLENBQUMsU0FBUyxNQUFLLENBQUU7QUFDdkIsQUFBSSxVQUFBLENBQUEsR0FBRSxFQUFJLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBQ25CLEFBQUksVUFBQSxDQUFBLEdBQUUsRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUNuQixhQUFPLENBQUEsSUFBRyxBQUFDLENBQUM7QUFDWCxtQkFBUyxDQUFHLENBQUEsS0FBSSxXQUFXO0FBQzNCLGVBQUssQ0FBRyxJQUFFO0FBQ1YsY0FBSSxDQUFHLElBQUU7QUFDVCxjQUFJLENBQUcsQ0FBQSxLQUFJLFNBQVMsQUFBQyxFQUFDO0FBQUEsUUFDdkIsQ0FBQyxDQUFDO01BQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztFQUNGO0FBQUEsQUFFQSxTQUFTLGtCQUFnQixDQUFFLEtBQUksQ0FBRyxDQUFBLFFBQU87QUFDeEMsQUFBSSxNQUFBLENBQUEsTUFBSyxFQUFJLEdBQUMsQ0FBQztBS25IUixRQUFTLEdBQUEsT0FDQSxDTG1IVyxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0tuSFQsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLFdBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxpSDFELFlBQUU7QUFBRyxnQkFBTTtBQUF5QjtBQUM3Qyx1QkFBZSxBQUFDLENBQ2YsS0FBSSxDQUNKLE9BQUssQ0FDTCxJQUFFLENBQ0YsQ0FBQSxNQUFPLFFBQU0sQ0FBQSxHQUFNLFNBQU8sQ0FBQSxDQUFJLENBQUEsT0FBTSxRQUFRLEVBQUksUUFBTSxDQUN2RCxDQUFDO01BQ0Y7SUtySE87QUFBQSxBTHNIUCxTQUFPLE9BQUssQ0FBQztFQUNkO0FBRUEsU0FBUyxtQkFBaUIsQ0FBRSxPQUFNLENBQUc7QUFDcEMsT0FBRyxDQUFDLE9BQU0sVUFBVSxDQUFHO0FBQ3RCLFVBQU0sSUFBSSxNQUFJLEFBQUMsQ0FBQyxrREFBaUQsQ0FBQyxDQUFDO0lBQ3BFO0FBQUEsQUFDQSxPQUFHLENBQUMsT0FBTSxTQUFTLENBQUc7QUFDckIsVUFBTSxJQUFJLE1BQUksQUFBQyxDQUFDLHVEQUFzRCxDQUFDLENBQUM7SUFDekU7QUFBQSxFQUNEO0FBQUEsQUFFSSxJQUFBLENBQUEsTUFBSyxFQUFJLEdBQUMsQ0FBQztBVXpJZixBQUFJLElBQUEsUVYySUosU0FBTSxNQUFJLENBQ0csT0FBTTs7O0FBQ2pCLHFCQUFpQixBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDM0IsQUFBSSxNQUFBLENBQUEsU0FBUSxFQUFJLENBQUEsT0FBTSxVQUFVLENBQUM7QUFDakMsT0FBSSxTQUFRLEdBQUssT0FBSyxDQUFHO0FBQ3hCLFVBQU0sSUFBSSxNQUFJLEFBQUMsRUFBQyx5QkFBd0IsRUFBQyxVQUFRLEVBQUMscUJBQWtCLEVBQUMsQ0FBQztJQUN2RSxLQUFPO0FBQ04sV0FBSyxDQUFFLFNBQVEsQ0FBQyxFQUFJLEtBQUcsQ0FBQztJQUN6QjtBQUFBLEFBQ0EsT0FBRyxZQUFZLEVBQUksR0FBQyxDQUFDO0FBQ3JCLE9BQUcsZUFBZSxFQUFJLENBQUEsaUJBQWdCLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxPQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQy9ELGlCQUFhLENBQUUsU0FBUSxDQUFDLEVBQUksQ0FBQSxzQkFBcUIsQUFBQyxDQUFDLE1BQUssS0FBSyxBQUFDLENBQUMsT0FBTSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFNBQUssT0FBTyxBQUFDLENBQUMsSUFBRyxDQUFHLFFBQU0sQ0FBQyxDQUFDO0FBQzVCLE9BQUcsV0FBVyxFQUFJLE1BQUksQ0FBQztBQUN2QixPQUFHLFdBQVcsRUFBSSxNQUFJLENBQUM7QUFDdkIsT0FBRyxNQUFNLEVBQUksQ0FBQSxPQUFNLE1BQU0sR0FBSyxHQUFDLENBQUM7QUFDaEMsT0FBRyxlQUFlLEVBQUk7QUFDckIsYUFBTyxDQUFHLENBQUEsa0JBQWlCLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxLQUFJLFVBQVUsQUFBQyxFQUFDLFdBQVcsRUFBQyxVQUFRLEVBQUssQ0FBQSxJQUFHLGNBQWMsQ0FBQyxDQUFDO0FBQy9GLFdBQUssQ0FBRyxDQUFBLGtCQUFpQixBQUFDLENBQUMsSUFBRyxDQUFHLENBQUEsS0FBSSxVQUFVLEFBQUMsQ0FBQyxRQUFPLENBQUcsQ0FBQSxJQUFHLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQUFBQyxFQUFDLFNBQUEsQUFBQzthQUFLLGdCQUFjO01BQUEsRUFBQztBQUM1RyxpQkFBVyxDQUFHLENBQUEsa0JBQWlCLEFBQUMsQ0FBQyxJQUFHLENBQUcsQ0FBQSxLQUFJLFVBQVUsQUFBQyxFQUFDLFNBQVMsRUFBQyxVQUFRLEVBQUssQ0FBQSxJQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQUEsSUFDMUYsQ0FBQztBQUNELFFBQUksUUFBUSxBQUFDLENBQUMsVUFBUyxDQUFHO0FBQ3pCLGNBQVEsQ0FBUixVQUFRO0FBQ1IsWUFBTSxDQUFHLENBQUEsZUFBYyxBQUFDLENBQUMsT0FBTSxTQUFTLENBQUM7QUFBQSxJQUMxQyxDQUFDLENBQUM7RVVuS29DLEFWME54QyxDVTFOd0M7QUNBeEMsRUFBQyxlQUFjLFlBQVksQ0FBQyxBQUFDO0FYc0s1QixVQUFNLENBQU4sVUFBTyxBQUFDOztBS3JLRCxVQUFTLEdBQUEsT0FDQSxDTHFLZSxPQUFNLEFBQUMsQ0FBQyxJQUFHLGVBQWUsQ0FBQyxDS3JLeEIsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLGFBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxtS3pELFlBQUE7QUFBRyx1QkFBVztBQUFvQztBQUMzRCxxQkFBVyxZQUFZLEFBQUMsRUFBQyxDQUFDO1FBQzNCO01LbEtNO0FBQUEsQUxtS04sV0FBTyxPQUFLLENBQUUsSUFBRyxVQUFVLENBQUMsQ0FBQztJQUM5QjtBQUVBLFdBQU8sQ0FBUCxVQUFRLEFBQUMsQ0FBRTs7QUFDVixXQUFPLENBQUEsSUFBRyxNQUFNLENBQUM7SUFDbEI7QUFFQSxXQUFPLENBQVAsVUFBUyxRQUFPOzs7QUFDZixTQUFHLFdBQVcsRUFBSSxLQUFHLENBQUM7QUFDdEIsV0FBSyxLQUFLLEFBQUMsQ0FBQyxRQUFPLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQyxHQUFFLENBQU07QUFDdEMsdUJBQWUsQ0FBRSxHQUFFLENBQUMsRUFBSSxLQUFHLENBQUM7TUFDN0IsRUFBQyxDQUFDO0FBQ0YsV0FBTyxFQUFDLElBQUcsTUFBTSxFQUFJLENBQUEsTUFBSyxPQUFPLEFBQUMsQ0FBQyxJQUFHLE1BQU0sQ0FBRyxTQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzFEO0FBRUEsZUFBVyxDQUFYLFVBQWEsUUFBTzs7O0FBQ25CLFNBQUcsV0FBVyxFQUFJLEtBQUcsQ0FBQztBQUN0QixXQUFLLEtBQUssQUFBQyxDQUFDLFFBQU8sQ0FBQyxRQUFRLEFBQUMsRUFBQyxTQUFDLEdBQUUsQ0FBTTtBQUN0Qyx1QkFBZSxDQUFFLEdBQUUsQ0FBQyxFQUFJLEtBQUcsQ0FBQztNQUM3QixFQUFDLENBQUM7QUFDRixXQUFPLEVBQUMsSUFBRyxNQUFNLEVBQUksU0FBTyxDQUFDLENBQUM7SUFDL0I7QUFFQSxRQUFJLENBQUosVUFBSyxBQUFDLENBQUU7O0FBQ1AsU0FBRyxXQUFXLEVBQUksTUFBSSxDQUFDO0FBQ3ZCLFNBQUcsSUFBRyxXQUFXLENBQUc7QUFDbkIsQUFBSSxVQUFBLENBQUEsV0FBVSxFQUFJLENBQUEsTUFBSyxLQUFLLEFBQUMsQ0FBQyxJQUFHLFlBQVksQ0FBQyxDQUFDO0FBQy9DLFdBQUcsWUFBWSxFQUFJLEdBQUMsQ0FBQztBQUNyQixXQUFHLFdBQVcsRUFBSSxNQUFJLENBQUM7QUFDdkIsWUFBSSxRQUFRLEFBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQSxJQUFHLFVBQVUsRUFBSztBQUFFLG9CQUFVLENBQVYsWUFBVTtBQUFHLGNBQUksQ0FBRyxDQUFBLElBQUcsTUFBTTtBQUFBLFFBQUUsQ0FBQyxDQUFDO01BQ3BGLEtBQU87QUFDTixZQUFJLFFBQVEsQUFBQyxFQUFDLFdBQVcsRUFBQyxDQUFBLElBQUcsVUFBVSxFQUFHLENBQUM7TUFDNUM7QUFBQSxJQUVEO0FBRUEsZ0JBQVksQ0FBWixVQUFjLElBQUcsQ0FBRyxDQUFBLFFBQU87O0FBQzFCLEFBQUksUUFBQSxDQUFBLFNBQVEsRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFDO0FBQzlCLFNBQUksSUFBRyxlQUFlLGVBQWUsQUFBQyxDQUFDLElBQUcsV0FBVyxDQUFDLENBQUc7QUFDeEQsV0FBRyxXQUFXLEVBQUksS0FBRyxDQUFDO0FBQ3RCLFdBQUcsZUFBZSxDQUFFLElBQUcsV0FBVyxDQUFDLEtBQzlCLEFBQUMsQ0FBQyxJQUFHLENBQUcsS0FBRyxDQUFDLEtBQ1osQUFBQyxFQUNKLFNBQUMsTUFBSztlQUFNLENBQUEsUUFBTyxNQUFNLEFBQUMsQ0FBQyxJQUFHLENBQUcsT0FBSyxDQUFDO1FBQUEsSUFDdkMsU0FBQyxHQUFFO2VBQU0sQ0FBQSxRQUFPLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQztRQUFBLEVBQzVCLENBQUM7TUFDSDtBQUFBLElBQ0Q7T1d6Tm9GO0FYNE5yRixTQUFTLFlBQVUsQ0FBRSxTQUFRLENBQUc7QUFDL0IsU0FBSyxDQUFFLFNBQVEsQ0FBQyxRQUFRLEFBQUMsRUFBQyxDQUFDO0VBQzVCO0FBQUEsQUFJQSxTQUFTLE1BQUksQ0FBRSxHQUFFLENBQUcsQ0FBQSxJQUFHO0FBQ3RCLEFBQUksTUFBQSxDQUFBLEdBQUUsRUFBSSxDQUFBLElBQUcsT0FBTyxBQUFDLEVBQUMsU0FBQyxLQUFJLENBQUcsQ0FBQSxHQUFFLENBQU07QUFDckMsVUFBSSxDQUFFLEdBQUUsQ0FBQyxFQUFJLEVBQUMsR0FBRSxDQUFFLEdBQUUsQ0FBQyxHQUFLLENBQUEsR0FBRSxDQUFFLEdBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxXQUFPLE1BQUksQ0FBQztJQUNiLEVBQUcsR0FBQyxDQUFDLENBQUM7QUFDTixTQUFPLElBQUUsQ0FBQztFQUNYO0FBRUEsU0FBUyxrQkFBZ0IsQ0FBRSxVQUFTLENBQUcsQ0FBQSxNQUFLOztBQUMxQyxXQUFPLFNBQUEsQUFBQztXQUFLLENBQUEsUUFBTyxBQUFDLENBQ3BCLFVBQVMsSUFBSSxBQUFDLEVBQUMsU0FBQyxLQUFJO0FBQ25CLGVBQU8sU0FBQSxBQUFDO0FBQ1AsQUFBSSxZQUFBLENBQUEsSUFBRyxFQUFJLENBQUEsTUFBSyxPQUFPLEFBQUMsQ0FBQyxDQUN4QixJQUFHLENBQUcsQ0FBQSxLQUFJLEFBQUMsQ0FBQyxXQUFVLENBQUcsQ0FBQSxLQUFJLFFBQVEsQ0FBQyxDQUN2QyxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQ1YsZUFBTyxDQUFBLEtBQUksUUFBUSxBQUFDLENBQUM7QUFDcEIsZ0JBQUksR0FBRyxXQUFXLEVBQUMsQ0FBQSxLQUFJLFVBQVUsQ0FBRTtBQUNuQyxlQUFHLENBQUcsS0FBRztBQUFBLFVBQ1YsQ0FBQyxLQUFLLEFBQUMsRUFBQyxTQUFDLFFBQU8sQ0FBTTtBQUNyQixzQkFBVSxDQUFFLEtBQUksVUFBVSxDQUFDLEVBQUksU0FBTyxDQUFDO0FBQ3ZDLGVBQUcsUUFBTyxXQUFXLENBQUc7QUFDdkIseUJBQVcsS0FBSyxBQUFDLENBQUMsS0FBSSxVQUFVLENBQUMsQ0FBQztZQUNuQztBQUFBLFVBQ0QsRUFBQyxDQUFDO1FBQ0gsRUFBQztNQUNGLEVBQUMsQ0FBQyxLQUFLLEFBQUMsRUFBQyxTQUFBLEFBQUM7YUFBSyxZQUFVO01BQUEsRUFBQztJQUFBLEVBQUM7RUFDN0I7QVU1UEQsQUFBSSxJQUFBLG9CVnVRSixTQUFNLGtCQUFnQixDQUNULE1BQUs7O0FBQ2hCLFNBQUssT0FBTyxBQUFDLENBQUMsSUFBRyxDQUFHO0FBQ25CLG9CQUFjLENBQUcsRUFBQTtBQUNqQixXQUFLLENBQUcsR0FBQztBQUNULFlBQU0sQ0FBRyxHQUFDO0FBQUEsSUFDWCxDQUFHLE9BQUssQ0FBQyxDQUFDO0FZN1FaLEFaOFFFLGtCWTlRWSxVQUFVLEFBQUMscURaOFFqQjtBQUNMLGlCQUFXLENBQUcsZ0JBQWM7QUFDNUIsV0FBSyxDQUFHO0FBQ1Asb0JBQVksQ0FBRyxFQUNkLEtBQUksQ0FBRyxjQUFZLENBQ3BCO0FBQ0Esa0JBQVUsQ0FBRztBQUNaLGlCQUFPLENBQVAsVUFBUSxBQUFDOztBQUNQLG1CQUFPLEFBQUM7QWF0UmYsQUFBSSxnQkFBQSxPQUFvQixFQUFBO0FBQUcsdUJBQW9CLEdBQUMsQ0FBQztBUkN6QyxrQkFBUyxHQUFBLE9BQ0EsQ0xxUlcsTUFBSyxZQUFZLENLclJWLE1BQUssU0FBUyxDQUFDLEFBQUMsRUFBQztBQUNuQyxxQkFBZ0IsQ0FDcEIsRUFBQyxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxHQUFLO2tCTG1SdkQsV0FBUztBY3ZSdkIsb0JBQWtCLE1BQWtCLENBQUMsRWR1UlcsQ0FBQSxpQkFBZ0IsS0FBSyxBQUFDLE1BQU8sV0FBUyxDQUFHLENBQUEsTUFBSyxPQUFPLENjdlI1QyxBZHVSNkMsQ2N2UjVDO2NUT2xEO0FVUFIsQVZPUSx5QlVQZ0I7Z0Jmd1JqQixLQUFLLEFBQUMsQ0FBQyxTQUFTLEFBQVMsQ0FBRztBZ0J2UnZCLGtCQUFTLEdBQUEsVUFBb0IsR0FBQztBQUFHLHVCQUFvQixFQUFBLENBQ2hELE9BQW9CLENBQUEsU0FBUSxPQUFPLENBQUcsT0FBa0I7QUFDM0QsNEJBQW1DLEVBQUksQ0FBQSxTQUFRLE1BQW1CLENBQUM7QUFBQSxBaEJzUnpFLGlCQUFHLFdBQVcsQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO1lBQzNCLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFHLENBQUEsU0FBUyxHQUFFLENBQUc7QUFDM0IsaUJBQUcsSUFBSSxFQUFJLElBQUUsQ0FBQztBQUNkLGlCQUFHLFdBQVcsQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO1lBQzNCLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLENBQUM7VUFDZDtBQUNBLGdCQUFNLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDbkIsZ0JBQUksUUFBUSxBQUFDLENBQUMsV0FBVSxDQUFHLEVBQUUsTUFBSyxDQUFHLENBQUEsSUFBRyxRQUFRLENBQUUsQ0FBQyxDQUFDO1VBQ3JEO0FBQUEsUUFDRjtBQUNBLGNBQU0sQ0FBRyxFQUNSLFFBQU8sQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUNwQixnQkFBSSxRQUFRLEFBQUMsQ0FBQyxRQUFPLENBQUcsRUFDdkIsTUFBSyxDQUFHLENBQUEsSUFBRyxPQUFPLENBQ25CLENBQUMsQ0FBQztBQUNGLGVBQUcsS0FBSyxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7VUFDckIsQ0FDRDtBQUNBLGNBQU0sQ0FBRyxFQUNSLFFBQU8sQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUNwQixnQkFBSSxRQUFRLEFBQUMsQ0FBQyxRQUFPLENBQUcsRUFDdkIsTUFBSyxDQUFHLENBQUEsSUFBRyxPQUFPLENBQ25CLENBQUMsQ0FBQztBQUNGLGdCQUFJLFFBQVEsQUFBQyxDQUFDLGdCQUFlLENBQUc7QUFDL0IsbUJBQUssQ0FBRyxDQUFBLElBQUcsT0FBTztBQUNsQixnQkFBRSxDQUFHLENBQUEsSUFBRyxJQUFJO0FBQUEsWUFDYixDQUFDLENBQUM7QUFDRixlQUFHLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO1VBQ3JCLENBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRCxFWXZUa0QsQ1p1VGhEO0VVeFRvQyxBVjBVeEMsQ1UxVXdDO0FPQXhDLEFBQUksSUFBQSx1Q0FBb0MsQ0FBQTtBQ0F4QyxFQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QWxCMFQ1QixVQUFNLENBQU4sVUFBUSxFQUFDOzs7QUFDUixTQUFHLEdBQUcsQUFBQyxDQUFDLFNBQVEsQ0FBRyxHQUFDLENBQUMsQ0FBQztBQUN0QixTQUFJLENBQUMsSUFBRyxTQUFTLENBQUc7QUFDbkIsaUJBQVMsQUFBQyxFQUFDLFNBQUEsQUFBQztlQUFLLENBQUEsV0FBVSxBQUFDLENBQUMsT0FBTSxDQUFDO1FBQUEsRUFBRyxFQUFBLENBQUMsQ0FBQztBQUN6QyxXQUFHLFNBQVMsRUFBSSxLQUFHLENBQUM7TUFDckI7QUFBQSxBQUNBLFdBQU8sS0FBRyxDQUFDO0lBQ1o7QUFDQSxVQUFNLENBQU4sVUFBUSxFQUFDOzs7QUFDUixTQUFHLEdBQUcsQUFBQyxDQUFDLE9BQU0sQ0FBRyxHQUFDLENBQUMsQ0FBQztBQUNwQixTQUFJLENBQUMsSUFBRyxTQUFTLENBQUc7QUFDbkIsaUJBQVMsQUFBQyxFQUFDLFNBQUEsQUFBQztlQUFLLENBQUEsV0FBVSxBQUFDLENBQUMsT0FBTSxDQUFDO1FBQUEsRUFBRyxFQUFBLENBQUMsQ0FBQztBQUN6QyxXQUFHLFNBQVMsRUFBSSxLQUFHLENBQUM7TUFDckI7QUFBQSxBQUNBLFdBQU8sS0FBRyxDQUFDO0lBQ1o7T0FsRStCLENBQUEsT0FBTSxJQUFJLENrQnRRYztBbEI2VXhELFNBQVMsYUFBVyxDQUFFLEtBQUksQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLEdBQUUsQ0FBRztBQUN6QyxNQUFFLEVBQUksQ0FBQSxHQUFFLEdBQUssRUFBQSxDQUFDO0FBQ2QsQUFBSSxNQUFBLENBQUEsUUFBTyxFQUFJLElBQUUsQ0FBQztBQUNsQixPQUFJLEtBQUksUUFBUSxHQUFLLENBQUEsS0FBSSxRQUFRLE9BQU8sQ0FBRztBQUMxQyxVQUFJLFFBQVEsUUFBUSxBQUFDLENBQUMsU0FBUyxHQUFFLENBQUc7QUFDbkMsQUFBSSxVQUFBLENBQUEsUUFBTyxFQUFJLENBQUEsTUFBSyxDQUFFLEdBQUUsQ0FBQyxDQUFDO0FBQzFCLEFBQUksVUFBQSxDQUFBLE9BQU0sRUFBSSxDQUFBLFlBQVcsQUFBQyxDQUFDLFFBQU8sQ0FBRyxPQUFLLENBQUcsQ0FBQSxHQUFFLEVBQUksRUFBQSxDQUFDLENBQUM7QUFDckQsV0FBSSxPQUFNLEVBQUksU0FBTyxDQUFHO0FBQ3ZCLGlCQUFPLEVBQUksUUFBTSxDQUFDO1FBQ25CO0FBQUEsTUFDRCxDQUFDLENBQUM7SUFDSDtBQUFBLEFBQ0EsU0FBTyxTQUFPLENBQUM7RUFDaEI7QUFBQSxBQUVBLFNBQVMsaUJBQWUsQ0FBRSxNQUFLO0FBQzlCLEFBQUksTUFBQSxDQUFBLElBQUcsRUFBSSxHQUFDLENBQUM7QUFDYixBQUFJLE1BQUEsQ0FBQSxNQUFLLEVBQUksR0FBQyxDQUFDO0FBQ2YsU0FBSyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUk7V0FBTSxDQUFBLE1BQUssQ0FBRSxLQUFJLFVBQVUsQ0FBQyxFQUFJLE1BQUk7SUFBQSxFQUFDLENBQUM7QUFDMUQsU0FBSyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUk7V0FBTSxDQUFBLEtBQUksSUFBSSxFQUFJLENBQUEsWUFBVyxBQUFDLENBQUMsS0FBSSxDQUFHLE9BQUssQ0FBQztJQUFBLEVBQUMsQ0FBQztBS2hXM0QsUUFBUyxHQUFBLE9BQ0EsQ0xnV1EsT0FBTSxBQUFDLENBQUMsTUFBSyxDQUFDLENLaFdKLE1BQUssU0FBUyxDQUFDLEFBQUMsRUFBQztBQUNuQyxXQUFnQixDQUNwQixFQUFDLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLEdBQUs7O0FMOFYxRCxZQUFFO0FBQUcsYUFBRztBQUF1QjtBQUN4QyxXQUFHLENBQUUsSUFBRyxJQUFJLENBQUMsRUFBSSxDQUFBLElBQUcsQ0FBRSxJQUFHLElBQUksQ0FBQyxHQUFLLEdBQUMsQ0FBQztBQUNyQyxXQUFHLENBQUUsSUFBRyxJQUFJLENBQUMsS0FBSyxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7TUFDMUI7SUs5Vk87QUFBQSxBTCtWUCxTQUFPLEtBQUcsQ0FBQztFQUNaO0FVdldBLEFBQUksSUFBQSxhVnlXSixTQUFNLFdBQVMsQ0FDSCxBQUFDOztBWTFXYixBWjJXRSxrQlkzV1ksVUFBVSxBQUFDLDhDWjJXakI7QUFDTCxpQkFBVyxDQUFHLFFBQU07QUFDcEIsY0FBUSxDQUFHLEdBQUM7QUFDWixpQkFBVyxDQUFHLEdBQUM7QUFDZixXQUFLLENBQUc7QUFDUCxZQUFJLENBQUc7QUFDTixpQkFBTyxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ3BCLGVBQUcsVUFBVSxFQUFJLEdBQUMsQ0FBQztVQUNwQjtBQUNBLDBCQUFnQixDQUFHLFVBQVMsVUFBUyxDQUFHO0FBQ3ZDLGVBQUcsVUFBVSxFQUFJLEVBQ2hCLE1BQUssQ0FBRyxXQUFTLENBQ2xCLENBQUM7QUFDRCxlQUFHLFdBQVcsQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFDO1VBQzdCO0FBQ0EseUJBQWUsQ0FBRyxVQUFTLFNBQVE7QUt6WGhDLGdCQUFTLEdBQUEsT0FDQSxDTHlYVyxTQUFRLFFBQVEsQ0t6WFQsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLG1CQUFnQixDQUNwQixFQUFDLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLEdBQUs7Z0JMdVh0RCxVQUFRO0FBQXdCO0FBQ3hDLEFBQUksa0JBQUEsQ0FBQSxNQUFLLENBQUM7QUFDVixBQUFJLGtCQUFBLENBQUEsVUFBUyxFQUFJLENBQUEsU0FBUSxXQUFXLENBQUM7QUFDckMsQUFBSSxrQkFBQSxDQUFBLFVBQVMsRUFBSTtBQUNoQiwwQkFBUSxDQUFHLENBQUEsU0FBUSxVQUFVO0FBQzdCLHdCQUFNLENBQUcsQ0FBQSxTQUFRLFFBQVE7QUFBQSxnQkFDMUIsQ0FBQztBQUNELHFCQUFLLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBRSxVQUFTLENBQUMsRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFFLFVBQVMsQ0FBQyxHQUFLLEdBQUMsQ0FBQztBQUN0RSxxQkFBSyxLQUFLLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztjQUN4QjtZSzdYRTtBQUFBLFVMOFhIO0FBQUEsUUFDRDtBQUNBLGdCQUFRLENBQUc7QUFDVixpQkFBTyxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ3BCLEFBQUksY0FBQSxDQUFBLE1BQUssRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFFLElBQUcsVUFBVSxPQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQzdELGVBQUcsVUFBVSxPQUFPLEVBQUksT0FBSyxDQUFDO0FBQzlCLGVBQUcsVUFBVSxZQUFZLEVBQUksQ0FBQSxnQkFBZSxBQUFDLENBQUMsTUFBSyxDQUFDLENBQUM7QUFDckQsZUFBRyxXQUFXLEFBQUMsQ0FBQyxJQUFHLFVBQVUsWUFBWSxPQUFPLEVBQUksY0FBWSxFQUFJLFFBQU0sQ0FBQyxDQUFDO1VBQzdFO0FBQ0EsWUFBRSxDQUFHLFVBQVEsQUFBQyxDQUFFO0FBQ2YsZUFBRyxxQkFBcUIsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO1VBQ25DO0FBQUEsUUFDRDtBQUNBLGtCQUFVLENBQUc7QUFDWixpQkFBTyxDQUFHLFVBQVEsQUFBQzs7QUFDbEIsQUFBSSxjQUFBLENBQUEsV0FBVSxFQUFJLENBQUEsSUFBRyxVQUFVLFlBQVksRUFBSSxJQUFJLGtCQUFnQixBQUFDLENBQUM7QUFDcEUsd0JBQVUsQ0FBRyxDQUFBLElBQUcsVUFBVSxZQUFZO0FBQ3RDLG1CQUFLLENBQUcsQ0FBQSxJQUFHLFVBQVUsT0FBTztBQUFBLFlBQzdCLENBQUMsQ0FBQztBQUNGLHNCQUFVLFFBQ0YsQUFBQyxFQUFDLFNBQUEsQUFBQzttQkFBSyxDQUFBLGVBQWMsQUFBQyxDQUFDLE9BQU0sQ0FBQztZQUFBLEVBQUMsUUFDaEMsQUFBQyxFQUFDLFNBQUEsQUFBQzttQkFBSyxDQUFBLGVBQWMsQUFBQyxDQUFDLE9BQU0sQ0FBQztZQUFBLEVBQUMsQ0FBQztVQUMxQztBQUNBLFlBQUUsQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUNmLGVBQUcscUJBQXFCLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztVQUNuQztBQUFBLFFBQ0Q7QUFDQSxjQUFNLENBQUcsR0FBQztBQUFBLE1BQ1g7QUFBQSxJQUNELEVZamFrRCxDWmlhaEQ7QUFDRixPQUFHLGdCQUFnQixFQUFJLEVBQ3RCLGtCQUFpQixBQUFDLENBQ2pCLElBQUcsQ0FDSCxDQUFBLEtBQUksVUFBVSxBQUFDLENBQ2QsUUFBTyxDQUNQLFVBQVMsSUFBRyxDQUFHLENBQUEsR0FBRSxDQUFHO0FBQ25CLFNBQUcscUJBQXFCLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztJQUNoQyxDQUNELENBQ0QsQ0FDQSxDQUFBLGtCQUFpQixBQUFDLENBQ2pCLElBQUcsQ0FDSCxDQUFBLEtBQUksVUFBVSxBQUFDLENBQ2QsVUFBUyxDQUNULFVBQVMsSUFBRyxDQUFHLENBQUEsR0FBRSxDQUFHO0FBQ25CLFNBQUcsd0JBQXdCLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztJQUNuQyxDQUNELENBQ0QsQ0FDRCxDQUFDO0VVdGJxQyxBVnFjeEMsQ1VyY3dDO0FPQXhDLEFBQUksSUFBQSx5QkFBb0MsQ0FBQTtBQ0F4QyxFQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QWxCeWI1Qix1QkFBbUIsQ0FBbkIsVUFBcUIsSUFBRyxDQUFHLENBQUEsUUFBTyxDQUFHOztBQUNwQyxTQUFHLE9BQU8sQUFBQyxDQUFDLGlCQUFnQixDQUFHLEtBQUcsQ0FBQyxDQUFDO0lBQ3JDO0FBRUEsMEJBQXNCLENBQXRCLFVBQXdCLElBQUcsQ0FBRyxDQUFBLFFBQU8sQ0FBRzs7QUFDdkMsU0FBRyxPQUFPLEFBQUMsQ0FBQyxnQkFBZSxDQUFHLEtBQUcsQ0FBQyxDQUFDO0lBQ3BDO0FBRUEsVUFBTSxDQUFOLFVBQU8sQUFBQzs7QUFDUCxTQUFHLFdBQVcsQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO0FBQzFCLFNBQUcsZ0JBQWdCLFFBQVEsQUFBQyxFQUFDLFNBQUMsWUFBVzthQUFNLENBQUEsWUFBVyxZQUFZLEFBQUMsRUFBQztNQUFBLEVBQUMsQ0FBQztJQUMzRTtPQTNGd0IsQ0FBQSxPQUFNLElBQUksQ2tCeFdxQjtBbEJzY3hELEFBQUksSUFBQSxDQUFBLFVBQVMsRUFBSSxJQUFJLFdBQVMsQUFBQyxFQUFDLENBQUM7QUFLakMsQUFBSSxJQUFBLENBQUEsZUFBYyxFQUFJLFVBQVMsQUFBQzs7QUFDL0IsT0FBRyxhQUFhLFFBQVEsQUFBQyxFQUFFLFNBQUMsTUFBSztXQUFNLENBQUEsTUFBSyxLQUFLLEFBQUMsTUFBSztJQUFBLEVBQUUsQ0FBQztBQUMxRCxPQUFHLGFBQWEsRUFBSSxVQUFRLENBQUM7QUFDN0IsU0FBTyxLQUFHLGFBQWEsQ0FBQztFQUN6QixDQUFDO0FBRUQsU0FBUyxXQUFTLENBQUUsS0FBSSxDQUFHLENBQUEsSUFBRzs7QUFDN0IsQUFBSSxNQUFBLENBQUEsT0FBTSxFQUFJLEdBQUMsQ0FBQztBQUNoQixVQUFNLENBQUUsS0FBSSxDQUFDLEVBQUksS0FBRyxDQUFDO0FBRXJCLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLElBQUcsYUFBYSxRQUFRLEFBQUMsQ0FBRSxLQUFJLENBQUUsQ0FBQztBQUU5QyxPQUFLLEtBQUksRUFBSSxFQUFDLENBQUEsQ0FBSTtBQUNqQixTQUFHLGFBQWEsT0FBTyxBQUFDLENBQUUsS0FBSSxDQUFHLEVBQUEsQ0FBRSxDQUFDO0FBQ3BDLFNBQUcsZUFBZSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztBQUVuQyxTQUFLLElBQUcsYUFBYSxPQUFPLElBQU0sRUFBQSxDQUFJO0FBQ3JDLGNBQU0sVUFBSSxPQUFLLG9CbUI3ZGxCLENBQUEsZUFBYyxPQUFPLEVuQjZkTyxFQUFDLEVBQU0sQ0FBQSxJQUFHLGVBQWUsQ21CN2RiLENuQjZkYyxDQUFDO0FBQ3BELFdBQUcsZUFBZSxFQUFJLEdBQUMsQ0FBQztBQUN4QixXQUFHLE9BQU8sU0FBUyxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUcsUUFBTSxDQUFDLENBQUM7TUFDekM7QUFBQSxJQUNELEtBQU87QUFDTixTQUFHLE9BQU8sU0FBUyxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUcsUUFBTSxDQUFDLENBQUM7SUFDekM7QUFBQSxFQUNEO0FBRUEsU0FBUyxnQkFBYyxDQUFHLElBQUc7O0FBQzVCLE9BQUcsYUFBYSxFQUFJLENBQUEsSUFBRyxPQUFPLE9BQU8sQUFBQyxFQUNyQyxTQUFFLElBQUc7V0FBTyxDQUFBLFdBQVUsU0FBUyxRQUFRLEFBQUMsQ0FBRSxJQUFHLENBQUUsQ0FBQSxDQUFJLEVBQUMsQ0FBQTtJQUFBLEVBQ3JELENBQUM7RUFDRjtBQUVBLEFBQUksSUFBQSxDQUFBLGFBQVksRUFBSTtBQUNuQixRQUFJLENBQUcsVUFBUyxBQUFDOzs7QUFDaEIsQUFBSSxRQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsSUFBRyxPQUFPLEVBQUksRUFBQyxJQUFHLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FBQztBQUM5QyxBQUFJLFFBQUEsQ0FBQSxTQUFRLEVBQUksQ0FBQSxNQUFLLFVBQVUsQ0FBQztBQUNoQyxBQUFJLFFBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxNQUFPLE9BQUssU0FBUyxDQUFBLEdBQU0sU0FBTyxDQUFBLENBQUksRUFBQyxNQUFLLFNBQVMsQ0FBQyxFQUFJLENBQUEsTUFBSyxTQUFTLENBQUM7QUFDeEYsQUFBSSxRQUFBLENBQUEseUJBQXdCLEVBQUksVUFBUyxNQUFLO0FBQzdDLFdBQUssTUFBTyxLQUFHLFNBQVMsQ0FBQSxHQUFNLFdBQVMsQ0FBSTtBQUMxQyxBQUFJLFlBQUEsQ0FBQSxRQUFPLEVBQUksR0FBQyxDQUFDO0FLbGZiLGNBQVMsR0FBQSxPQUNBLENMa2ZLLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDS2xmRCxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUM7QUFDbkMsaUJBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxnZnZELGdCQUFBO0FBQUUsZ0JBQUE7QUFBd0I7QUFDbkMscUJBQU8sQ0FBRyxDQUFBLENBQUUsRUFBSSxDQUFBLENBQUEsTUFBTSxDQUFDO1lBQ3hCO1VLL2VJO0FBQUEsQUxnZkosYUFBRyxTQUFTLEFBQUMsQ0FBRSxRQUFPLENBQUUsQ0FBQztRQUMxQjtBQUFBLE1BQ0QsQ0FBQztBQUNELFNBQUcsYUFBYSxFQUFJLEdBQUMsQ0FBQztBQUN0QixTQUFHLGVBQWUsRUFBSSxHQUFDLENBQUM7QUFDeEIsU0FBRyxnQkFBZ0IsRUFBSSxDQUFBLElBQUcsZ0JBQWdCLEdBQUssR0FBQyxDQUFDO0FBRWpELFdBQUssU0FBUyxFQUFJLENBQUEsTUFBSyxTQUFTLEdBQUssMEJBQXdCLENBQUM7QUFFOUQsYUFBTyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUk7YUFBTSxDQUFBLG9CQUFtQixLQUFLLEFBQUMsQ0FDcEQsS0FBSSxVQUFVLEFBQUMsRUFBQyxlQUFlLEVBQUMsTUFBSSxJQUFLLFNBQUMsSUFBRztlQUFNLENBQUEsVUFBUyxLQUFLLEFBQUMsTUFBTyxNQUFJLENBQUcsS0FBRyxDQUFDO1FBQUEsRUFBQyxDQUN0RjtNQUFBLEVBQUMsQ0FBQztBQUNGLFNBQUcsZ0JBQWdCLEtBQUssQUFBQyxDQUN4QixLQUFJLFVBQVUsQUFBQyxDQUFDLFdBQVUsR0FBRyxTQUFDLElBQUc7YUFBTSxDQUFBLGVBQWMsS0FBSyxBQUFDLE1BQU8sS0FBRyxDQUFDO01BQUEsRUFBQyxDQUN4RSxDQUFDO0FBQ0QsU0FBRyxTQUFRLENBQUc7QUFDYixXQUFHLFNBQVEsSUFBTSxLQUFHLENBQUc7QUFDdEIsYUFBRyxVQUFVLEFBQUMsRUFBQyxDQUFDO1FBQ2pCLEtBQU87QUFDTixnQkFBQSxLQUFHLHVCbUIxZ0JQLENBQUEsZUFBYyxPQUFPLENuQjBnQkMsU0FBUSxDbUIxZ0JVLEVuQjBnQlI7UUFDN0I7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUNBLFdBQU8sQ0FBRyxVQUFTLEFBQUM7QUFDbkIsU0FBRyxnQkFBZ0IsUUFBUSxBQUFDLEVBQUMsU0FBQyxHQUFFO2FBQU0sQ0FBQSxHQUFFLFlBQVksQUFBQyxFQUFDO01BQUEsRUFBQyxDQUFDO0lBQ3pEO0FBQ0EsUUFBSSxDQUFHLEVBQ04sU0FBUSxDQUFHLFVBQVUsQUFBUTtBZ0JqaEJuQixZQUFTLEdBQUEsU0FBb0IsR0FBQztBQUFHLGlCQUFvQixFQUFBLENBQ2hELE9BQW9CLENBQUEsU0FBUSxPQUFPLENBQUcsT0FBa0I7QUFDM0QscUJBQW1DLEVBQUksQ0FBQSxTQUFRLE1BQW1CLENBQUM7QUFBQSxBaEJnaEI5RSxXQUFHLENBQUMsTUFBSyxPQUFPLENBQUc7QUFDbEIsZUFBSyxFQUFJLENBQUEsSUFBRyxPQUFPLFNBQVMsQ0FBQztRQUM5QjtBQUFBLEFBQ0EsYUFBSyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUk7ZUFBTSxDQUFBLEtBQUksUUFBUSxBQUFDLEVBQUMsU0FBUyxFQUFDLE1BQUksRUFBRztRQUFBLEVBQUMsQ0FBQztNQUM1RCxDQUNEO0FBQUEsRUFDRCxDQUFDO0FBRUQsQUFBSSxJQUFBLENBQUEsa0JBQWlCLEVBQUk7QUFDeEIscUJBQWlCLENBQUcsQ0FBQSxhQUFZLE1BQU07QUFDdEMsWUFBUSxDQUFHLENBQUEsYUFBWSxNQUFNLFVBQVU7QUFDdkMsdUJBQW1CLENBQUcsQ0FBQSxhQUFZLFNBQVM7QUFBQSxFQUM1QyxDQUFDO0FBRUQsQUFBSSxJQUFBLENBQUEsY0FBYSxFQUFJLEVBQ3BCLEtBQUksQ0FBRyxVQUFTLEFBQUM7QUFDaEIsU0FBRyxRQUFRLEVBQUksQ0FBQSxJQUFHLFFBQVEsR0FBSyxHQUFDLENBQUM7QUFDakMsU0FBRyxjQUFjLEVBQUksQ0FBQSxJQUFHLGNBQWMsR0FBSyxHQUFDLENBQUM7QUFDN0MsU0FBRyxjQUFjLFFBQVEsQUFBQyxDQUFDLFNBQVMsS0FBSTtBS3BpQmxDLFlBQVMsR0FBQSxPQUNBLENMb2lCSSxPQUFNLEFBQUMsQ0FBQyxtQkFBa0IsQUFBQyxDQUFDLEtBQUksQ0FBQyxDQUFDLENLcGlCcEIsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDO0FBQ25DLGVBQWdCLENBQ3BCLEVBQUMsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssR0FBSzs7QUxraUJ6RCxjQUFBO0FBQUcsY0FBQTtBQUEyQztBQUN0RCxlQUFHLENBQUUsQ0FBQSxDQUFDLEVBQUksRUFBQSxDQUFDO1VBQ1o7UUtqaUJLO0FBQUEsTUxraUJOLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDLENBQUM7SUFDZCxDQUNELENBQUM7QUFFRCxBQUFJLElBQUEsQ0FBQSxtQkFBa0IsRUFBSSxFQUN6QixrQkFBaUIsQ0FBRyxDQUFBLGNBQWEsTUFBTSxDQUN4QyxDQUFDO0FBRUQsU0FBUyxxQkFBbUIsQ0FBRSxPQUFNLENBQUc7QUFDdEMsQUFBSSxNQUFBLENBQUEsR0FBRSxFQUFJLEVBQ1QsTUFBSyxDQUFHLENBQUEsQ0FBQyxrQkFBaUIsQ0FBRyxvQkFBa0IsQ0FBQyxPQUFPLEFBQUMsQ0FBQyxPQUFNLE9BQU8sR0FBSyxHQUFDLENBQUMsQ0FDOUUsQ0FBQztBQUNELFNBQU8sUUFBTSxPQUFPLENBQUM7QUFDckIsU0FBTyxDQUFBLEtBQUksWUFBWSxBQUFDLENBQUMsTUFBSyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN0RDtBQUFBLEFBRUEsU0FBUyxnQkFBYyxDQUFFLE9BQU0sQ0FBRztBQUNqQyxBQUFJLE1BQUEsQ0FBQSxHQUFFLEVBQUksRUFDVCxNQUFLLENBQUcsQ0FBQSxDQUFDLG1CQUFrQixDQUFDLE9BQU8sQUFBQyxDQUFDLE9BQU0sT0FBTyxHQUFLLEdBQUMsQ0FBQyxDQUMxRCxDQUFDO0FBQ0QsU0FBTyxRQUFNLE9BQU8sQ0FBQztBQUNyQixTQUFPLENBQUEsS0FBSSxZQUFZLEFBQUMsQ0FBQyxNQUFLLE9BQU8sQUFBQyxDQUFDLEdBQUUsQ0FBRyxRQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ3REO0FBQUEsQUFHQSxTQUFTLE1BQUksQ0FBRSxPQUFNLENBQUc7QUFDdkIsVUFBTSxhQUFhLEVBQUksR0FBQyxDQUFDO0FBRXpCLE9BQUssT0FBTSxPQUFPLENBQUk7QUFDckIsa0JBQVksTUFBTSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztBQUNuQyxXQUFLLE9BQU8sQUFBQyxDQUFDLE9BQU0sQ0FBRyxDQUFBLGFBQVksTUFBTSxDQUFDLENBQUM7QUFDM0MsWUFBTSxhQUFhLEtBQUssQUFBQyxDQUFFLGFBQVksU0FBUyxDQUFFLENBQUM7SUFDcEQ7QUFBQSxBQUVBLE9BQUssT0FBTSxjQUFjLENBQUk7QUFDNUIsbUJBQWEsTUFBTSxLQUFLLEFBQUMsQ0FBRSxPQUFNLENBQUUsQ0FBQztJQUNyQztBQUFBLEFBRUEsVUFBTSxXQUFXLEVBQUksZ0JBQWMsQ0FBQztFQUNyQztBQUFBLEFBSUMsT0FBTztBQUNOLFVBQU0sQ0FBRyxNQUFJO0FBQ2IsUUFBSSxDQUFKLE1BQUk7QUFDSix1QkFBbUIsQ0FBbkIscUJBQW1CO0FBQ25CLGtCQUFjLENBQWQsZ0JBQWM7QUFDZCxjQUFVLENBQVYsWUFBVTtBQUNWLGFBQVMsQ0FBVCxXQUFTO0FBQ1QsUUFBSSxDQUFHLE1BQUk7QUFDWCxvQkFBZ0IsQ0FBaEIsa0JBQWdCO0FBQ2hCLHNCQUFrQixDQUFsQixvQkFBa0I7QUFBQSxFQUNuQixDQUFDO0FBR0YsQ0FBQyxDQUFDLENBQUM7QUFDSCIsImZpbGUiOiJsdXgtZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsdXguanMgLSBGbHV4LWJhc2VkIGFyY2hpdGVjdHVyZSBmb3IgdXNpbmcgUmVhY3RKUyBhdCBMZWFuS2l0XG4gKiBBdXRob3I6IEppbSBDb3dhcnRcbiAqIFZlcnNpb246IHYwLjIuMVxuICogVXJsOiBodHRwczovL2dpdGh1Yi5jb20vTGVhbktpdC1MYWJzL2x1eC5qc1xuICogTGljZW5zZShzKTogTUlUIENvcHlyaWdodCAoYykgMjAxNCBMZWFuS2l0XG4gKi9cblxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlblwiKSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW4vcGlwZWxpbmVcIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcblxuXHR2YXIgbHV4Q2ggPSBwb3N0YWwuY2hhbm5lbCggXCJsdXhcIiApO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuXHRcdFx0eWllbGQgW2ssIG9ialtrXV07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdFxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3JzW3N0b3JlXTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShhY3Rpb25MaXN0KSB7XG5cdHZhciBhY3Rpb25DcmVhdG9yID0ge307XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0bHV4Q2gucHVibGlzaCh7XG5cdFx0XHRcdHRvcGljOiBcImFjdGlvblwiLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fSk7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRmdW5jdGlvbih4KXsgcmV0dXJuIFtudWxsLCB4XTsgfSxcblx0XHRcdFx0ZnVuY3Rpb24oZXJyKXsgcmV0dXJuIFtlcnJdOyB9XG5cdFx0XHQpLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVycm9yID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRpZihlcnJvciAmJiB0eXBlb2Ygc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQsIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yKGtleSwgZXJyb3IpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlcyA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVyciA9IHZhbHVlc1swXTtcblx0XHRcdFx0cmV0dXJuIHdoZW4oe1xuXHRcdFx0XHRcdGhhc0NoYW5nZWQ6IHN0b3JlLmhhc0NoYW5nZWQsXG5cdFx0XHRcdFx0cmVzdWx0OiByZXMsXG5cdFx0XHRcdFx0ZXJyb3I6IGVycixcblx0XHRcdFx0XHRzdGF0ZTogc3RvcmUuZ2V0U3RhdGUoKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcblx0dmFyIHRhcmdldCA9IHt9O1xuXHRmb3IgKHZhciBba2V5LCBoYW5kbGVyXSBvZiBlbnRyaWVzKGhhbmRsZXJzKSkge1xuXHRcdHRyYW5zZm9ybUhhbmRsZXIoXG5cdFx0XHRzdG9yZSxcblx0XHRcdHRhcmdldCxcblx0XHRcdGtleSxcblx0XHRcdHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiID8gaGFuZGxlci5oYW5kbGVyIDogaGFuZGxlclxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpIHtcblx0aWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIpO1xuXHR9XG5cdGlmKCFvcHRpb25zLmhhbmRsZXJzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG5cdH1cbn1cblxudmFyIHN0b3JlcyA9IHt9O1xuXG5jbGFzcyBTdG9yZSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMob3B0aW9ucyk7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuXHRcdGlmIChuYW1lc3BhY2UgaW4gc3RvcmVzKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0b3Jlc1tuYW1lc3BhY2VdID0gdGhpcztcblx0XHR9XG5cdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IFtdO1xuXHRcdHRoaXMuYWN0aW9uSGFuZGxlcnMgPSB0cmFuc2Zvcm1IYW5kbGVycyh0aGlzLCBvcHRpb25zLmhhbmRsZXJzKTtcblx0XHRhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhvcHRpb25zLmhhbmRsZXJzKSk7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHR0aGlzLnN0YXRlID0gb3B0aW9ucy5zdGF0ZSB8fCB7fTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0ZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuXHRcdFx0bm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcblx0XHRcdHNjb3BlZE5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5LiR7bmFtZXNwYWNlfWAsIHRoaXMuZmx1c2gpKVxuXHRcdH07XG5cdFx0bHV4Q2gucHVibGlzaChcInJlZ2lzdGVyXCIsIHtcblx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdChvcHRpb25zLmhhbmRsZXJzKVxuXHRcdH0pO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRmb3IgKHZhciBbaywgc3Vic2NyaXB0aW9uXSBvZiBlbnRyaWVzKHRoaXMuX19zdWJzY3JpcHRpb24pKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHN0b3Jlc1t0aGlzLm5hbWVzcGFjZV07XG5cdH1cblxuXHRnZXRTdGF0ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZTtcblx0fVxuXG5cdHNldFN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHR0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiAodGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpKTtcblx0fVxuXG5cdHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBuZXdTdGF0ZSk7XG5cdH1cblxuXHRmbHVzaCgpIHtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRpZih0aGlzLmhhc0NoYW5nZWQpIHtcblx0XHRcdHZhciBjaGFuZ2VkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlZEtleXMpO1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5cyA9IHt9O1xuXHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRsdXhDaC5wdWJsaXNoKGBub3RpZmljYXRpb24uJHt0aGlzLm5hbWVzcGFjZX1gLCB7IGNoYW5nZWRLZXlzLCBzdGF0ZTogdGhpcy5zdGF0ZSB9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bHV4Q2gucHVibGlzaChgbm9jaGFuZ2UuJHt0aGlzLm5hbWVzcGFjZX1gKTtcblx0XHR9XG5cblx0fVxuXG5cdGhhbmRsZVBheWxvYWQoZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG5cdFx0aWYgKHRoaXMuYWN0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZGF0YS5hY3Rpb25UeXBlKSkge1xuXHRcdFx0dGhpcy5pbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdHRoaXMuYWN0aW9uSGFuZGxlcnNbZGF0YS5hY3Rpb25UeXBlXVxuXHRcdFx0XHQuY2FsbCh0aGlzLCBkYXRhKVxuXHRcdFx0XHQudGhlbihcblx0XHRcdFx0XHQocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCByZXN1bHQpLFxuXHRcdFx0XHRcdChlcnIpID0+IGVudmVsb3BlLnJlcGx5KGVycilcblx0XHRcdFx0KTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG5cdHN0b3Jlc1tuYW1lc3BhY2VdLmRpc3Bvc2UoKTtcbn1cblxuXHRcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG5cdHZhciByZXMgPSBrZXlzLnJlZHVjZSgoYWNjdW0sIGtleSkgPT4ge1xuXHRcdGFjY3VtW2tleV0gPSAob2JqW2tleV0gJiYgb2JqW2tleV0ucmVzdWx0KTtcblx0XHRyZXR1cm4gYWNjdW07XG5cdH0sIHt9KTtcblx0cmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oZ2VuZXJhdGlvbiwgYWN0aW9uKSB7XG5cdFx0cmV0dXJuICgpID0+IHBhcmFsbGVsKFxuXHRcdFx0Z2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG5cdFx0XHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRcdFx0dmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdFx0XHRcdGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuXHRcdFx0XHRcdH0sIGFjdGlvbik7XG5cdFx0XHRcdFx0cmV0dXJuIGx1eENoLnJlcXVlc3Qoe1xuXHRcdFx0XHRcdFx0dG9waWM6IGBkaXNwYXRjaC4ke3N0b3JlLm5hbWVzcGFjZX1gLFxuXHRcdFx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0XHRcdH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gcmVzcG9uc2U7XG5cdFx0XHRcdFx0XHRpZihyZXNwb25zZS5oYXNDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlZC5wdXNoKHN0b3JlLm5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9KSkudGhlbigoKSA9PiB0aGlzLnN0b3Jlcyk7XG5cdH1cblx0Lypcblx0XHRFeGFtcGxlIG9mIGBjb25maWdgIGFyZ3VtZW50OlxuXHRcdHtcblx0XHRcdGdlbmVyYXRpb25zOiBbXSxcblx0XHRcdGFjdGlvbiA6IHtcblx0XHRcdFx0YWN0aW9uVHlwZTogXCJcIixcblx0XHRcdFx0YWN0aW9uQXJnczogW11cblx0XHRcdH1cblx0XHR9XG5cdCovXG5jbGFzcyBBY3Rpb25Db29yZGluYXRvciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCB7XG5cdFx0XHRnZW5lcmF0aW9uSW5kZXg6IDAsXG5cdFx0XHRzdG9yZXM6IHt9LFxuXHRcdFx0dXBkYXRlZDogW11cblx0XHR9LCBjb25maWcpO1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdFx0cGlwZWxpbmUoXG5cdFx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildXG5cdFx0XHRcdFx0XHRcdCkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmVyciA9IGVycjtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJmYWlsdXJlXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnVwZGF0ZWQgfSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN1Y2Nlc3M6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZmFpbHVyZToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJmYWlsdXJlLmFjdGlvblwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGVycjogdGhpcy5lcnJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRzdWNjZXNzKGZuKSB7XG5cdFx0dGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuXHRcdGlmICghdGhpcy5fc3RhcnRlZCkge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB0aGlzLmhhbmRsZShcInN0YXJ0XCIpLCAwKTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRmYWlsdXJlKGZuKSB7XG5cdFx0dGhpcy5vbihcImVycm9yXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuXHRcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXAsIGdlbikge1xuXHRnZW4gPSBnZW4gfHwgMDtcblx0dmFyIGNhbGNkR2VuID0gZ2VuO1xuXHRpZiAoc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcblx0XHRcdHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuXHRcdFx0dmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG5cdFx0XHRpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG5cdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKSB7XG5cdHZhciB0cmVlID0gW107XG5cdHZhciBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsb29rdXBbc3RvcmUubmFtZXNwYWNlXSA9IHN0b3JlKTtcblx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuXHRmb3IgKHZhciBba2V5LCBpdGVtXSBvZiBlbnRyaWVzKGxvb2t1cCkpIHtcblx0XHR0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuXHRcdHRyZWVbaXRlbS5nZW5dLnB1c2goaXRlbSk7XG5cdH1cblx0cmV0dXJuIHRyZWU7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdGNvb3JkaW5hdG9yczogW10sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbiA9IHt9O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogZnVuY3Rpb24oYWN0aW9uTWV0YSkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogYWN0aW9uTWV0YVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwicmVnaXN0ZXIuc3RvcmVcIjogZnVuY3Rpb24oc3RvcmVNZXRhKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbjtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gfHwgW107XG5cdFx0XHRcdFx0XHRcdGFjdGlvbi5wdXNoKGFjdGlvbk1ldGEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwW3RoaXMubHV4QWN0aW9uLmFjdGlvbi5hY3Rpb25UeXBlXTtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLnN0b3JlcyA9IHN0b3Jlcztcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zID0gYnVpbGRHZW5lcmF0aW9ucyhzdG9yZXMpO1xuXHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCA/IFwiZGlzcGF0Y2hpbmdcIiA6IFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcIipcIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcblx0XHRcdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IHRoaXMubHV4QWN0aW9uLmdlbmVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb29yZGluYXRvclxuXHRcdFx0XHRcdFx0XHQuc3VjY2VzcygoKSA9PiB0aGlzLnRyYW5zaXRpb24oXCJyZWFkeVwiKSlcblx0XHRcdFx0XHRcdFx0LmZhaWx1cmUoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0c3RvcHBlZDoge31cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiYWN0aW9uXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSwgZW52KSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KSxcblx0XHRcdGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwicmVnaXN0ZXJcIixcblx0XHRcdFx0XHRmdW5jdGlvbihkYXRhLCBlbnYpIHtcblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dGhpcy5oYW5kbGUoXCJhY3Rpb24uZGlzcGF0Y2hcIiwgZGF0YSk7XG5cdH1cblxuXHRoYW5kbGVTdG9yZVJlZ2lzdHJhdGlvbihkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgZGF0YSk7XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdHRoaXMudHJhbnNpdGlvbihcInN0b3BwZWRcIik7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cdH1cbn1cblxudmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cdFxuXG5cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXhDbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXhDbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eENsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gZGF0YTtcblxuXHR2YXIgZm91bmQgPSB0aGlzLl9fbHV4V2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHR0aGlzLl9fbHV4V2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0dGhpcy5fX2x1eEhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIHRoaXMuX19sdXhXYWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdHBheWxvYWQgPSBPYmplY3QuYXNzaWduKCB7fSwgLi4udGhpcy5fX2x1eEhlYXJkRnJvbSk7XG5cdFx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKHRoaXMsIHBheWxvYWQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eFdhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblx0XHR2YXIgaW1tZWRpYXRlID0gc3RvcmVzLmltbWVkaWF0ZTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdG9yZXMpIHtcblx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0U3RhdGUgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge307XG5cdFx0XHRcdGZvciggdmFyIFtrLHZdIG9mIGVudHJpZXMoc3RvcmVzKSApIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVsgayBdID0gdi5zdGF0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldFN0YXRlKCBuZXdTdGF0ZSApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3IgPSBbXTtcblx0XHR0aGlzLl9fbHV4SGVhcmRGcm9tID0gW107XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcblxuXHRcdHN0b3Jlcy5vbkNoYW5nZSA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCgoc3RvcmUpID0+IHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoYG5vdGlmaWNhdGlvbi4ke3N0b3JlfWAsIChkYXRhKSA9PiBnYXRlS2VlcGVyLmNhbGwodGhpcywgc3RvcmUsIGRhdGEpKVxuXHRcdCkpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLnB1c2goXG5cdFx0XHRsdXhDaC5zdWJzY3JpYmUoXCJwcmVub3RpZnlcIiwgKGRhdGEpID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKHRoaXMsIGRhdGEpKVxuXHRcdCk7XG5cdFx0aWYoaW1tZWRpYXRlKSB7XG5cdFx0XHRpZihpbW1lZGlhdGUgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGUoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKC4uLmltbWVkaWF0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YikgPT4gc3ViLnVuc3Vic2NyaWJlKCkpO1xuXHR9LFxuXHRtaXhpbjoge1xuXHRcdGxvYWRTdGF0ZTogZnVuY3Rpb24gKC4uLnN0b3Jlcykge1xuXHRcdFx0aWYoIXN0b3Jlcy5sZW5ndGgpIHtcblx0XHRcdFx0c3RvcmVzID0gdGhpcy5zdG9yZXMubGlzdGVuVG87XG5cdFx0XHR9XG5cdFx0XHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGx1eENoLnB1Ymxpc2goYG5vdGlmeS4ke3N0b3JlfWApKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4U3RvcmVNaXhpbi5zZXR1cCxcblx0bG9hZFN0YXRlOiBsdXhTdG9yZU1peGluLm1peGluLmxvYWRTdGF0ZSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbnZhciBsdXhBY3Rpb25NaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmFjdGlvbnMgPSB0aGlzLmFjdGlvbnMgfHwge307XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yID0gdGhpcy5nZXRBY3Rpb25zRm9yIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG5cdFx0XHRmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpKSkge1xuXHRcdFx0XHR0aGlzW2tdID0gdjtcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9XG59O1xuXG52YXIgbHV4QWN0aW9uUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhBY3Rpb25NaXhpbi5zZXR1cFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlclZpZXcob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eFN0b3JlUmVhY3RNaXhpbiwgbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuXHR2YXIgb3B0ID0ge1xuXHRcdG1peGluczogW2x1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuXG5mdW5jdGlvbiBtaXhpbihjb250ZXh0KSB7XG5cdGNvbnRleHQuX19sdXhDbGVhbnVwID0gW107XG5cblx0aWYgKCBjb250ZXh0LnN0b3JlcyApIHtcblx0XHRsdXhTdG9yZU1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRPYmplY3QuYXNzaWduKGNvbnRleHQsIGx1eFN0b3JlTWl4aW4ubWl4aW4pO1xuXHRcdGNvbnRleHQuX19sdXhDbGVhbnVwLnB1c2goIGx1eFN0b3JlTWl4aW4udGVhcmRvd24gKTtcblx0fVxuXG5cdGlmICggY29udGV4dC5nZXRBY3Rpb25zRm9yICkge1xuXHRcdGx1eEFjdGlvbk1peGluLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0fVxuXG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcbn1cblxuXG5cdC8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG5cdHJldHVybiB7XG5cdFx0Y2hhbm5lbDogbHV4Q2gsXG5cdFx0U3RvcmUsXG5cdFx0Y3JlYXRlQ29udHJvbGxlclZpZXcsXG5cdFx0Y3JlYXRlQ29tcG9uZW50LFxuXHRcdHJlbW92ZVN0b3JlLFxuXHRcdGRpc3BhdGNoZXIsXG5cdFx0bWl4aW46IG1peGluLFxuXHRcdEFjdGlvbkNvb3JkaW5hdG9yLFxuXHRcdGdldEFjdGlvbkNyZWF0b3JGb3Jcblx0fTtcblx0Ly8ganNoaW50IGlnbm9yZTogZW5kXG5cbn0pKTtcbiIsIiR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wKFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMSxcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIsIHRoaXMpOyIsIiR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSIsImZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSAkX19wbGFjZWhvbGRlcl9fMFxuICAgIH0iLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwiJGN0eC5zdGF0ZSA9ICgkX19wbGFjZWhvbGRlcl9fMCkgPyAkX19wbGFjZWhvbGRlcl9fMSA6ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICBicmVhayIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsIiRjdHgubWF5YmVUaHJvdygpIiwicmV0dXJuICRjdHguZW5kKCkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAwLCAkX19wbGFjZWhvbGRlcl9fMSA9IFtdOyIsIiRfX3BsYWNlaG9sZGVyX18wWyRfX3BsYWNlaG9sZGVyX18xKytdID0gJF9fcGxhY2Vob2xkZXJfXzI7IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wOyIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=