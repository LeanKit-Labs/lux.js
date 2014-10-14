/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.2.2
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
  postal.configuration.promise.createDeferred = function() {
    return when.defer();
  };
  postal.configuration.promise.getPromise = function(dfd) {
    return dfd.promise;
  };
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
      scopedNotify: configSubscription(this, luxCh.subscribe(("notify." + namespace), (function(data, env) {
        return env.reply(null, {
          changedKeys: [],
          state: $__0.state
        });
      })))
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
      accum[key] = obj[key];
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
        var $__0 = this;
        if (!stores.length) {
          stores = this.stores.listenTo;
        }
        this.__luxWaitFor = $traceurRuntime.spread(stores);
        stores.forEach((function(store) {
          return luxCh.request({
            topic: ("notify." + store),
            replyChannel: "lux"
          }).then((function(data) {
            return gateKeeper.call($__0, store, data);
          }));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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O0FBQUEsQUFFQSxPQUFLLE9BQU0sY0FBYyxDQUFJO0FBQzVCLG1CQUFhLE1BQU0sS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7SUFDckM7QUFBQSxBQUVBLFVBQU0sV0FBVyxFQUFJLGdCQUFjLENBQUM7RUFDckM7QUFBQSxBQUlDLE9BQU87QUFDTixVQUFNLENBQUcsTUFBSTtBQUNiLFFBQUksQ0FBSixNQUFJO0FBQ0osdUJBQW1CLENBQW5CLHFCQUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULFFBQUksQ0FBRyxNQUFJO0FBQ1gsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDbkIsQ0FBQztBQUdGLENBQUMsQ0FBQyxDQUFDO0FBQ0giLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbHV4LmpzIC0gRmx1eC1iYXNlZCBhcmNoaXRlY3R1cmUgZm9yIHVzaW5nIFJlYWN0SlMgYXQgTGVhbktpdFxuICogQXV0aG9yOiBKaW0gQ293YXJ0XG4gKiBWZXJzaW9uOiB2MC4yLjJcbiAqIFVybDogaHR0cHM6Ly9naXRodWIuY29tL0xlYW5LaXQtTGFicy9sdXguanNcbiAqIExpY2Vuc2Uocyk6IE1JVCBDb3B5cmlnaHQgKGMpIDIwMTQgTGVhbktpdFxuICovXG5cblxuKCBmdW5jdGlvbiggcm9vdCwgZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwidHJhY2V1clwiLCBcInJlYWN0XCIsIFwicG9zdGFsLnJlcXVlc3QtcmVzcG9uc2VcIiwgXCJtYWNoaW5hXCIsIFwid2hlblwiLCBcIndoZW4ucGlwZWxpbmVcIiwgXCJ3aGVuLnBhcmFsbGVsXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzICkge1xuXHRcdC8vIE5vZGUsIG9yIENvbW1vbkpTLUxpa2UgZW52aXJvbm1lbnRzXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcG9zdGFsLCBtYWNoaW5hICkge1xuXHRcdFx0cmV0dXJuIGZhY3RvcnkoXG5cdFx0XHRcdHJlcXVpcmUoXCJ0cmFjZXVyXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwicmVhY3RcIiksXG5cdFx0XHRcdHBvc3RhbCxcblx0XHRcdFx0bWFjaGluYSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW5cIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BpcGVsaW5lXCIpLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlbi9wYXJhbGxlbFwiKSk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTb3JyeSAtIGx1eEpTIG9ubHkgc3VwcG9ydCBBTUQgb3IgQ29tbW9uSlMgbW9kdWxlIGVudmlyb25tZW50cy5cIik7XG5cdH1cbn0oIHRoaXMsIGZ1bmN0aW9uKCB0cmFjZXVyLCBSZWFjdCwgcG9zdGFsLCBtYWNoaW5hLCB3aGVuLCBwaXBlbGluZSwgcGFyYWxsZWwgKSB7XG5cblx0Ly8gV2UgbmVlZCB0byB0ZWxsIHBvc3RhbCBob3cgdG8gZ2V0IGEgZGVmZXJyZWQgaW5zdGFuY2UgZnJvbSB3aGVuLmpzXG5cdHBvc3RhbC5jb25maWd1cmF0aW9uLnByb21pc2UuY3JlYXRlRGVmZXJyZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gd2hlbi5kZWZlcigpO1xuXHR9O1xuXHQvLyBXZSBuZWVkIHRvIHRlbGwgcG9zdGFsIGhvdyB0byBnZXQgYSBcInB1YmxpYy1mYWNpbmdcIi9zYWZlIHByb21pc2UgaW5zdGFuY2Vcblx0cG9zdGFsLmNvbmZpZ3VyYXRpb24ucHJvbWlzZS5nZXRQcm9taXNlID0gZnVuY3Rpb24oIGRmZCApIHtcblx0XHRyZXR1cm4gZGZkLnByb21pc2U7XG5cdH07XG5cblx0dmFyIGx1eENoID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4XCIgKTtcblx0dmFyIHN0b3JlcyA9IHt9O1xuXG5cdC8vIGpzaGludCBpZ25vcmU6c3RhcnRcblx0ZnVuY3Rpb24qIGVudHJpZXMob2JqKSB7XG5cdFx0Zm9yKHZhciBrIG9mIE9iamVjdC5rZXlzKG9iaikpIHtcblx0XHRcdHlpZWxkIFtrLCBvYmpba11dO1xuXHRcdH1cblx0fVxuXHQvLyBqc2hpbnQgaWdub3JlOmVuZFxuXG5cdGZ1bmN0aW9uIGNvbmZpZ1N1YnNjcmlwdGlvbihjb250ZXh0LCBzdWJzY3JpcHRpb24pIHtcblx0XHRyZXR1cm4gc3Vic2NyaXB0aW9uLndpdGhDb250ZXh0KGNvbnRleHQpXG5cdFx0ICAgICAgICAgICAgICAgICAgIC53aXRoQ29uc3RyYWludChmdW5jdGlvbihkYXRhLCBlbnZlbG9wZSl7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fFxuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlLm9yaWdpbklkID09PSBwb3N0YWwuaW5zdGFuY2VJZCgpKTtcblx0XHQgICAgICAgICAgICAgICAgICAgfSk7XG5cdH1cblxuXHRcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KGhhbmRsZXJzKSB7XG5cdHZhciBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAodmFyIFtrZXksIGhhbmRsZXJdIG9mIGVudHJpZXMoaGFuZGxlcnMpKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG52YXIgYWN0aW9uQ3JlYXRvcnMgPSB7fTtcblxuZnVuY3Rpb24gZ2V0QWN0aW9uQ3JlYXRvckZvciggc3RvcmUgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yc1tzdG9yZV07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oYWN0aW9uTGlzdCkge1xuXHR2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goZnVuY3Rpb24oYWN0aW9uKSB7XG5cdFx0YWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcblx0XHRcdGx1eENoLnB1Ymxpc2goe1xuXHRcdFx0XHR0b3BpYzogXCJhY3Rpb25cIixcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdH0pO1xuXHRyZXR1cm4gYWN0aW9uQ3JlYXRvcjtcbn1cblxuXHRcblxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVyKHN0b3JlLCB0YXJnZXQsIGtleSwgaGFuZGxlcikge1xuXHR0YXJnZXRba2V5XSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gd2hlbihoYW5kbGVyLmFwcGx5KHN0b3JlLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KFtkYXRhLmRlcHNdKSkpXG5cdFx0XHQudGhlbihcblx0XHRcdFx0ZnVuY3Rpb24oeCl7IHJldHVybiBbbnVsbCwgeF07IH0sXG5cdFx0XHRcdGZ1bmN0aW9uKGVycil7IHJldHVybiBbZXJyXTsgfVxuXHRcdFx0KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXN1bHQgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnJvciA9IHZhbHVlc1swXTtcblx0XHRcdFx0aWYoZXJyb3IgJiYgdHlwZW9mIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0LCBzdG9yZS5oYW5kbGVBY3Rpb25FcnJvcihrZXksIGVycm9yKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG5cdFx0XHRcdHZhciByZXMgPSB2YWx1ZXNbMV07XG5cdFx0XHRcdHZhciBlcnIgPSB2YWx1ZXNbMF07XG5cdFx0XHRcdHJldHVybiB3aGVuKHtcblx0XHRcdFx0XHRoYXNDaGFuZ2VkOiBzdG9yZS5oYXNDaGFuZ2VkLFxuXHRcdFx0XHRcdHJlc3VsdDogcmVzLFxuXHRcdFx0XHRcdGVycm9yOiBlcnIsXG5cdFx0XHRcdFx0c3RhdGU6IHN0b3JlLmdldFN0YXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbnZhciBzdG9yZXMgPSB7fTtcblxuY2xhc3MgU3RvcmUge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0fVxuXHRcdHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcblx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgb3B0aW9ucy5oYW5kbGVycyk7XG5cdFx0YWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykpO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0dGhpcy5zdGF0ZSA9IG9wdGlvbnMuc3RhdGUgfHwge307XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBkaXNwYXRjaC4ke25hbWVzcGFjZX1gLCB0aGlzLmhhbmRsZVBheWxvYWQpKSxcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IHRoaXMuaW5EaXNwYXRjaCksXG5cdFx0XHRzY29wZWROb3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbihcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0bHV4Q2guc3Vic2NyaWJlKFxuXHRcdFx0XHRcdGBub3RpZnkuJHtuYW1lc3BhY2V9YCxcblx0XHRcdFx0XHQoZGF0YSwgZW52KSA9PiBlbnYucmVwbHkobnVsbCwgeyBjaGFuZ2VkS2V5czogW10sIHN0YXRlOiB0aGlzLnN0YXRlIH0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHR9O1xuXHRcdGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG5cdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHR9KTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHR9XG5cblx0Z2V0U3RhdGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhdGU7XG5cdH1cblxuXHRzZXRTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IHRydWU7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKSk7XG5cdH1cblxuXHRyZXBsYWNlU3RhdGUobmV3U3RhdGUpIHtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gbmV3U3RhdGUpO1xuXHR9XG5cblx0Zmx1c2goKSB7XG5cdFx0dGhpcy5pbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0aWYodGhpcy5oYXNDaGFuZ2VkKSB7XG5cdFx0XHR2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcblx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0bHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgeyBjaGFuZ2VkS2V5cywgc3RhdGU6IHRoaXMuc3RhdGUgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGx1eENoLnB1Ymxpc2goYG5vY2hhbmdlLiR7dGhpcy5uYW1lc3BhY2V9YCk7XG5cdFx0fVxuXG5cdH1cblxuXHRoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuXHRcdGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cblx0XHRcdFx0LmNhbGwodGhpcywgZGF0YSlcblx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0KHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgcmVzdWx0KSxcblx0XHRcdFx0XHQoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG5cdFx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRhY2N1bVtrZXldID0gb2JqW2tleV07XG5cdFx0cmV0dXJuIGFjY3VtO1xuXHR9LCB7fSk7XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRcdHJldHVybiAoKSA9PiBwYXJhbGxlbChcblx0XHRcdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHRcdFx0XHR9LCBhY3Rpb24pO1xuXHRcdFx0XHRcdHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHRcdHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcblx0XHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRcdFx0aWYocmVzcG9uc2UuaGFzQ2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZWQucHVzaChzdG9yZS5uYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9O1xuXHRcdFx0fSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuXHR9XG5cdC8qXG5cdFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcblx0XHR7XG5cdFx0XHRnZW5lcmF0aW9uczogW10sXG5cdFx0XHRhY3Rpb24gOiB7XG5cdFx0XHRcdGFjdGlvblR5cGU6IFwiXCIsXG5cdFx0XHRcdGFjdGlvbkFyZ3M6IFtdXG5cdFx0XHR9XG5cdFx0fVxuXHQqL1xuY2xhc3MgQWN0aW9uQ29vcmRpbmF0b3IgZXh0ZW5kcyBtYWNoaW5hLkZzbSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywge1xuXHRcdFx0Z2VuZXJhdGlvbkluZGV4OiAwLFxuXHRcdFx0c3RvcmVzOiB7fSxcblx0XHRcdHVwZGF0ZWQ6IFtdXG5cdFx0fSwgY29uZmlnKTtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwidW5pbml0aWFsaXplZFwiLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHVuaW5pdGlhbGl6ZWQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXIoKSB7XG5cdFx0XHRcdFx0XHRcdHBpcGVsaW5lKFxuXHRcdFx0XHRcdFx0XHRcdFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuXHRcdFx0XHRcdFx0XHQpLnRoZW4oZnVuY3Rpb24oLi4ucmVzdWx0cykge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5lcnIgPSBlcnI7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKFwiZmFpbHVyZVwiKTtcblx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcInByZW5vdGlmeVwiLCB7IHN0b3JlczogdGhpcy51cGRhdGVkIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0c3VjY2Vzcyhmbikge1xuXHRcdHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZmFpbHVyZShmbikge1xuXHRcdHRoaXMub24oXCJlcnJvclwiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4pIHtcblx0Z2VuID0gZ2VuIHx8IDA7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRjb29yZGluYXRvcnM6IFtdLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7fTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGFjdGlvbk1ldGFcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBzdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImFjdGlvblwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcInJlZ2lzdGVyXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSwgZW52KSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0aGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IGRhdGE7XG5cblx0dmFyIGZvdW5kID0gdGhpcy5fX2x1eFdhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCB0aGlzLl9fbHV4V2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRwYXlsb2FkID0gT2JqZWN0LmFzc2lnbigge30sIC4uLnRoaXMuX19sdXhIZWFyZEZyb20pO1xuXHRcdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXhXYWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGltbWVkaWF0ZSA9IHN0b3Jlcy5pbW1lZGlhdGU7XG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXHRcdHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oc3RvcmVzKSB7XG5cdFx0XHRpZiAoIHR5cGVvZiB0aGlzLnNldFN0YXRlID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRcdHZhciBuZXdTdGF0ZSA9IHt9O1xuXHRcdFx0XHRmb3IoIHZhciBbayx2XSBvZiBlbnRyaWVzKHN0b3JlcykgKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVbIGsgXSA9IHYuc3RhdGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSggbmV3U3RhdGUgKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gW107XG5cdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG5cblx0XHRzdG9yZXMub25DaGFuZ2UgPSBzdG9yZXMub25DaGFuZ2UgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKGBub3RpZmljYXRpb24uJHtzdG9yZX1gLCAoZGF0YSkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlLCBkYXRhKSlcblx0XHQpKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSlcblx0XHQpO1xuXHRcdC8vIGltbWVkaWF0ZSBjYW4gZWl0aGVyIGJlIGEgYm9vbCwgb3IgYW4gYXJyYXkgb2Ygc3RvcmUgbmFtZXNwYWNlc1xuXHRcdC8vIGZpcnN0IGNoZWNrIGlzIGZvciB0cnV0aHlcblx0XHRpZihpbW1lZGlhdGUpIHtcblx0XHRcdC8vIHNlY29uZCBjaGVjayBpcyBmb3Igc3RyaWN0IGJvb2wgZXF1YWxpdHlcblx0XHRcdGlmKGltbWVkaWF0ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5sb2FkU3RhdGUoLi4uaW1tZWRpYXRlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3ViKSA9PiBzdWIudW5zdWJzY3JpYmUoKSk7XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0bG9hZFN0YXRlOiBmdW5jdGlvbiAoLi4uc3RvcmVzKSB7XG5cdFx0XHRpZighc3RvcmVzLmxlbmd0aCkge1xuXHRcdFx0XHRzdG9yZXMgPSB0aGlzLnN0b3Jlcy5saXN0ZW5Ubztcblx0XHRcdH1cblx0XHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gWy4uLnN0b3Jlc107XG5cdFx0XHRzdG9yZXMuZm9yRWFjaChcblx0XHRcdFx0KHN0b3JlKSA9PiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHR0b3BpYzogYG5vdGlmeS4ke3N0b3JlfWAsXG5cdFx0XHRcdFx0cmVwbHlDaGFubmVsOiBcImx1eFwiXG5cdFx0XHRcdH0pLnRoZW4oKGRhdGEpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSwgZGF0YSkpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGx1eFN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuXHRsb2FkU3RhdGU6IGx1eFN0b3JlTWl4aW4ubWl4aW4ubG9hZFN0YXRlLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogbHV4U3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxudmFyIGx1eEFjdGlvbk1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuYWN0aW9ucyA9IHRoaXMuYWN0aW9ucyB8fCB7fTtcblx0XHR0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zRm9yLmZvckVhY2goZnVuY3Rpb24oc3RvcmUpIHtcblx0XHRcdGZvcih2YXIgW2ssIHZdIG9mIGVudHJpZXMoZ2V0QWN0aW9uQ3JlYXRvckZvcihzdG9yZSkpKSB7XG5cdFx0XHRcdHRoaXNba10gPSB2O1xuXHRcdFx0fVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cdH1cbn07XG5cbnZhciBsdXhBY3Rpb25SZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eEFjdGlvbk1peGluLnNldHVwXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVDb250cm9sbGVyVmlldyhvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4U3RvcmVSZWFjdE1peGluLCBsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbbHV4QWN0aW9uUmVhY3RNaXhpbl0uY29uY2F0KG9wdGlvbnMubWl4aW5zIHx8IFtdKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyhPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xufVxuXG5cbmZ1bmN0aW9uIG1peGluKGNvbnRleHQpIHtcblx0Y29udGV4dC5fX2x1eENsZWFudXAgPSBbXTtcblxuXHRpZiAoIGNvbnRleHQuc3RvcmVzICkge1xuXHRcdGx1eFN0b3JlTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHRcdE9iamVjdC5hc3NpZ24oY29udGV4dCwgbHV4U3RvcmVNaXhpbi5taXhpbik7XG5cdFx0Y29udGV4dC5fX2x1eENsZWFudXAucHVzaCggbHV4U3RvcmVNaXhpbi50ZWFyZG93biApO1xuXHR9XG5cblx0aWYgKCBjb250ZXh0LmdldEFjdGlvbnNGb3IgKSB7XG5cdFx0bHV4QWN0aW9uTWl4aW4uc2V0dXAuY2FsbCggY29udGV4dCApO1xuXHR9XG5cblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xufVxuXG5cblx0Ly8ganNoaW50IGlnbm9yZTogc3RhcnRcblx0cmV0dXJuIHtcblx0XHRjaGFubmVsOiBsdXhDaCxcblx0XHRTdG9yZSxcblx0XHRjcmVhdGVDb250cm9sbGVyVmlldyxcblx0XHRjcmVhdGVDb21wb25lbnQsXG5cdFx0cmVtb3ZlU3RvcmUsXG5cdFx0ZGlzcGF0Y2hlcixcblx0XHRtaXhpbjogbWl4aW4sXG5cdFx0QWN0aW9uQ29vcmRpbmF0b3IsXG5cdFx0Z2V0QWN0aW9uQ3JlYXRvckZvclxuXHR9O1xuXHQvLyBqc2hpbnQgaWdub3JlOiBlbmRcblxufSkpO1xuIiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==