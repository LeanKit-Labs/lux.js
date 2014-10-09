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
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = Object.assign(this.state, newState));
    },
    replaceState: function(newState) {
      "use strict";
      var $__0 = this;
      Object.keys(newState).forEach((function(key) {
        $__0.changedKeys[key] = true;
      }));
      return (this.state = newState);
    },
    flush: function() {
      "use strict";
      this.inDispatch = false;
      var changedKeys = Object.keys(this.changedKeys);
      this.changedKeys = {};
      luxCh.publish(("notification." + this.namespace), {
        changedKeys: changedKeys,
        state: this.state
      });
    },
    handlePayload: function(data, envelope) {
      "use strict";
      var namespace = this.namespace;
      if (this.actionHandlers.hasOwnProperty(data.actionType)) {
        this.inDispatch = true;
        this.actionHandlers[data.actionType].call(this, data).then((function(result) {
          return envelope.reply(null, {
            result: result,
            namespace: namespace
          });
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
            $__0.stores[store.namespace] = $__0.stores[store.namespace] || {};
            $__0.stores[store.namespace].result = response.result;
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
      stores: {}
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
              this.results = results;
              this.transition("success");
            }.bind(this), function(err) {
              this.err = err;
              this.transition("failure");
            }.bind(this));
          },
          _onExit: function() {
            luxCh.publish("prenotify", {stores: this.storeList});
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
              storeList: this.luxAction.stores.map((function(st) {
                return st.namespace;
              })),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzNCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QUFFLENBQUcsUUFBTSxDQUFDLENBQUMsQ0FBQztFQUN0RDtBQUFBLEFBR0EsU0FBUyxNQUFJLENBQUUsT0FBTSxDQUFHO0FBQ3ZCLFVBQU0sYUFBYSxFQUFJLEdBQUMsQ0FBQztBQUV6QixPQUFLLE9BQU0sT0FBTyxDQUFJO0FBQ3JCLGtCQUFZLE1BQU0sS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7QUFDbkMsV0FBSyxPQUFPLEFBQUMsQ0FBQyxPQUFNLENBQUcsQ0FBQSxhQUFZLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLFlBQU0sYUFBYSxLQUFLLEFBQUMsQ0FBRSxhQUFZLFNBQVMsQ0FBRSxDQUFDO0lBQ3BEO0FBQUEsQUFFQSxPQUFLLE9BQU0sY0FBYyxDQUFJO0FBQzVCLG1CQUFhLE1BQU0sS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7SUFDckM7QUFBQSxBQUVBLFVBQU0sV0FBVyxFQUFJLGdCQUFjLENBQUM7RUFDckM7QUFBQSxBQUlDLE9BQU87QUFDTixVQUFNLENBQUcsTUFBSTtBQUNiLFFBQUksQ0FBSixNQUFJO0FBQ0osdUJBQW1CLENBQW5CLHFCQUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULFFBQUksQ0FBRyxNQUFJO0FBQ1gsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDbkIsQ0FBQztBQUdGLENBQUMsQ0FBQyxDQUFDO0FBQ0giLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG5cdFx0Ly8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG5cdFx0XHRyZXR1cm4gZmFjdG9yeShcblx0XHRcdFx0cmVxdWlyZShcInRyYWNldXJcIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJyZWFjdFwiKSxcblx0XHRcdFx0cG9zdGFsLFxuXHRcdFx0XHRtYWNoaW5hLFxuXHRcdFx0XHRyZXF1aXJlKFwid2hlblwiKSxcblx0XHRcdFx0cmVxdWlyZShcIndoZW4vcGlwZWxpbmVcIiksXG5cdFx0XHRcdHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcblx0fVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcblxuXHR2YXIgbHV4Q2ggPSBwb3N0YWwuY2hhbm5lbCggXCJsdXhcIiApO1xuXHR2YXIgc3RvcmVzID0ge307XG5cblx0Ly8ganNoaW50IGlnbm9yZTpzdGFydFxuXHRmdW5jdGlvbiogZW50cmllcyhvYmopIHtcblx0XHRmb3IodmFyIGsgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuXHRcdFx0eWllbGQgW2ssIG9ialtrXV07XG5cdFx0fVxuXHR9XG5cdC8vIGpzaGludCBpZ25vcmU6ZW5kXG5cblx0ZnVuY3Rpb24gY29uZmlnU3Vic2NyaXB0aW9uKGNvbnRleHQsIHN1YnNjcmlwdGlvbikge1xuXHRcdHJldHVybiBzdWJzY3JpcHRpb24ud2l0aENvbnRleHQoY29udGV4dClcblx0XHQgICAgICAgICAgICAgICAgICAgLndpdGhDb25zdHJhaW50KGZ1bmN0aW9uKGRhdGEsIGVudmVsb3BlKXtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhKGVudmVsb3BlLmhhc093blByb3BlcnR5KFwib3JpZ2luSWRcIikpIHx8XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAoZW52ZWxvcGUub3JpZ2luSWQgPT09IHBvc3RhbC5pbnN0YW5jZUlkKCkpO1xuXHRcdCAgICAgICAgICAgICAgICAgICB9KTtcblx0fVxuXG5cdFxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoaGFuZGxlcnMpIHtcblx0dmFyIGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goe1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3JzW3N0b3JlXTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShhY3Rpb25MaXN0KSB7XG5cdHZhciBhY3Rpb25DcmVhdG9yID0ge307XG5cdGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcblx0XHRhY3Rpb25DcmVhdG9yW2FjdGlvbl0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpO1xuXHRcdFx0bHV4Q2gucHVibGlzaCh7XG5cdFx0XHRcdHRvcGljOiBcImFjdGlvblwiLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fSk7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yO1xufVxuXG5cdFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG5cdHRhcmdldFtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRmdW5jdGlvbih4KXsgcmV0dXJuIFtudWxsLCB4XTsgfSxcblx0XHRcdFx0ZnVuY3Rpb24oZXJyKXsgcmV0dXJuIFtlcnJdOyB9XG5cdFx0XHQpLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVycm9yID0gdmFsdWVzWzBdO1xuXHRcdFx0XHRpZihlcnJvciAmJiB0eXBlb2Ygc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQsIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yKGtleSwgZXJyb3IpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gd2hlbi5qb2luKCBlcnJvciwgcmVzdWx0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcblx0XHRcdFx0dmFyIHJlcyA9IHZhbHVlc1sxXTtcblx0XHRcdFx0dmFyIGVyciA9IHZhbHVlc1swXTtcblx0XHRcdFx0cmV0dXJuIHdoZW4oe1xuXHRcdFx0XHRcdHJlc3VsdDogcmVzLFxuXHRcdFx0XHRcdGVycm9yOiBlcnIsXG5cdFx0XHRcdFx0c3RhdGU6IHN0b3JlLmdldFN0YXRlKClcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlcnMoc3RvcmUsIGhhbmRsZXJzKSB7XG5cdHZhciB0YXJnZXQgPSB7fTtcblx0Zm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcblx0XHR0cmFuc2Zvcm1IYW5kbGVyKFxuXHRcdFx0c3RvcmUsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRrZXksXG5cdFx0XHR0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIiA/IGhhbmRsZXIuaGFuZGxlciA6IGhhbmRsZXJcblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG5cdGlmKCFvcHRpb25zLm5hbWVzcGFjZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcblx0fVxuXHRpZighb3B0aW9ucy5oYW5kbGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIpO1xuXHR9XG59XG5cbnZhciBzdG9yZXMgPSB7fTtcblxuY2xhc3MgU3RvcmUge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZTtcblx0XHRpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdG9yZXNbbmFtZXNwYWNlXSA9IHRoaXM7XG5cdFx0fVxuXHRcdHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcblx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzID0gdHJhbnNmb3JtSGFuZGxlcnModGhpcywgb3B0aW9ucy5oYW5kbGVycyk7XG5cdFx0YWN0aW9uQ3JlYXRvcnNbbmFtZXNwYWNlXSA9IGJ1aWxkQWN0aW9uQ3JlYXRvckZyb20oT2JqZWN0LmtleXMob3B0aW9ucy5oYW5kbGVycykpO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG5cdFx0dGhpcy5zdGF0ZSA9IG9wdGlvbnMuc3RhdGUgfHwge307XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdGRpc3BhdGNoOiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBkaXNwYXRjaC4ke25hbWVzcGFjZX1gLCB0aGlzLmhhbmRsZVBheWxvYWQpKSxcblx0XHRcdG5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5YCwgdGhpcy5mbHVzaCkpLndpdGhDb25zdHJhaW50KCgpID0+IHRoaXMuaW5EaXNwYXRjaCksXG5cdFx0XHRzY29wZWROb3RpZnk6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYG5vdGlmeS4ke25hbWVzcGFjZX1gLCB0aGlzLmZsdXNoKSlcblx0XHR9O1xuXHRcdGx1eENoLnB1Ymxpc2goXCJyZWdpc3RlclwiLCB7XG5cdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3Qob3B0aW9ucy5oYW5kbGVycylcblx0XHR9KTtcblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Zm9yICh2YXIgW2ssIHN1YnNjcmlwdGlvbl0gb2YgZW50cmllcyh0aGlzLl9fc3Vic2NyaXB0aW9uKSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuXHR9XG5cblx0Z2V0U3RhdGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhdGU7XG5cdH1cblxuXHRzZXRTdGF0ZShuZXdTdGF0ZSkge1xuXHRcdE9iamVjdC5rZXlzKG5ld1N0YXRlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRcdHRoaXMuY2hhbmdlZEtleXNba2V5XSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuICh0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSkpO1xuXHR9XG5cblx0cmVwbGFjZVN0YXRlKG5ld1N0YXRlKSB7XG5cdFx0T2JqZWN0LmtleXMobmV3U3RhdGUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0dGhpcy5jaGFuZ2VkS2V5c1trZXldID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKHRoaXMuc3RhdGUgPSBuZXdTdGF0ZSk7XG5cdH1cblxuXHRmbHVzaCgpIHtcblx0XHR0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR2YXIgY2hhbmdlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoYW5nZWRLZXlzKTtcblx0XHR0aGlzLmNoYW5nZWRLZXlzID0ge307XG5cdFx0bHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgeyBjaGFuZ2VkS2V5cywgc3RhdGU6IHRoaXMuc3RhdGUgfSk7XG5cdH1cblxuXHRoYW5kbGVQYXlsb2FkKGRhdGEsIGVudmVsb3BlKSB7XG5cdFx0dmFyIG5hbWVzcGFjZSA9IHRoaXMubmFtZXNwYWNlO1xuXHRcdGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcblx0XHRcdHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHR0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cblx0XHRcdFx0LmNhbGwodGhpcywgZGF0YSlcblx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0KHJlc3VsdCkgPT4gZW52ZWxvcGUucmVwbHkobnVsbCwgeyByZXN1bHQsIG5hbWVzcGFjZSB9KSxcblx0XHRcdFx0XHQoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG5cdFx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0b3JlKG5hbWVzcGFjZSkge1xuXHRzdG9yZXNbbmFtZXNwYWNlXS5kaXNwb3NlKCk7XG59XG5cblx0XG5cbmZ1bmN0aW9uIHBsdWNrKG9iaiwga2V5cykge1xuXHR2YXIgcmVzID0ga2V5cy5yZWR1Y2UoKGFjY3VtLCBrZXkpID0+IHtcblx0XHRhY2N1bVtrZXldID0gKG9ialtrZXldICYmIG9ialtrZXldLnJlc3VsdCk7XG5cdFx0cmV0dXJuIGFjY3VtO1xuXHR9LCB7fSk7XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKGdlbmVyYXRpb24sIGFjdGlvbikge1xuXHRcdHJldHVybiAoKSA9PiBwYXJhbGxlbChcblx0XHRcdGdlbmVyYXRpb24ubWFwKChzdG9yZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcdFx0XHRkZXBzOiBwbHVjayh0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvcilcblx0XHRcdFx0XHR9LCBhY3Rpb24pO1xuXHRcdFx0XHRcdHJldHVybiBsdXhDaC5yZXF1ZXN0KHtcblx0XHRcdFx0XHRcdHRvcGljOiBgZGlzcGF0Y2guJHtzdG9yZS5uYW1lc3BhY2V9YCxcblx0XHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0XHR9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSA9IHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0gfHwge307XG5cdFx0XHRcdFx0XHR0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdLnJlc3VsdCA9IHJlc3BvbnNlLnJlc3VsdDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblx0XHRcdH0pKS50aGVuKCgpID0+IHRoaXMuc3RvcmVzKTtcblx0fVxuXHQvKlxuXHRcdEV4YW1wbGUgb2YgYGNvbmZpZ2AgYXJndW1lbnQ6XG5cdFx0e1xuXHRcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuXHRcdFx0YWN0aW9uIDoge1xuXHRcdFx0XHRhY3Rpb25UeXBlOiBcIlwiLFxuXHRcdFx0XHRhY3Rpb25BcmdzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3Rvcihjb25maWcpIHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIHtcblx0XHRcdGdlbmVyYXRpb25JbmRleDogMCxcblx0XHRcdHN0b3Jlczoge31cblx0XHR9LCBjb25maWcpO1xuXHRcdHN1cGVyKHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJ1bmluaXRpYWxpemVkXCIsXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0dW5pbml0aWFsaXplZDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcigpIHtcblx0XHRcdFx0XHRcdFx0cGlwZWxpbmUoXG5cdFx0XHRcdFx0XHRcdFx0W2ZvciAoZ2VuZXJhdGlvbiBvZiBjb25maWcuZ2VuZXJhdGlvbnMpIHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwodGhpcywgZ2VuZXJhdGlvbiwgY29uZmlnLmFjdGlvbildXG5cdFx0XHRcdFx0XHRcdCkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5yZXN1bHRzID0gcmVzdWx0cztcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHR9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZXJyID0gZXJyO1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGx1eENoLnB1Ymxpc2goXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IHRoaXMuc3RvcmVMaXN0IH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdWNjZXNzOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogdGhpcy5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZhaWx1cmU6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmFjdGlvblxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRsdXhDaC5wdWJsaXNoKFwiZmFpbHVyZS5hY3Rpb25cIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IHRoaXMuYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRlcnI6IHRoaXMuZXJyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImZhaWx1cmVcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0c3VjY2Vzcyhmbikge1xuXHRcdHRoaXMub24oXCJzdWNjZXNzXCIsIGZuKTtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZmFpbHVyZShmbikge1xuXHRcdHRoaXMub24oXCJlcnJvclwiLCBmbik7XG5cdFx0aWYgKCF0aGlzLl9zdGFydGVkKSB7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGFuZGxlKFwic3RhcnRcIiksIDApO1xuXHRcdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cblx0XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbihzdG9yZSwgbG9va3VwLCBnZW4pIHtcblx0Z2VuID0gZ2VuIHx8IDA7XG5cdHZhciBjYWxjZEdlbiA9IGdlbjtcblx0aWYgKHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGgpIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goZnVuY3Rpb24oZGVwKSB7XG5cdFx0XHR2YXIgZGVwU3RvcmUgPSBsb29rdXBbZGVwXTtcblx0XHRcdHZhciB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEpO1xuXHRcdFx0aWYgKHRoaXNHZW4gPiBjYWxjZEdlbikge1xuXHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuXHR2YXIgdHJlZSA9IFtdO1xuXHR2YXIgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG5cdHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKHN0b3JlLCBsb29rdXApKTtcblx0Zm9yICh2YXIgW2tleSwgaXRlbV0gb2YgZW50cmllcyhsb29rdXApKSB7XG5cdFx0dHJlZVtpdGVtLmdlbl0gPSB0cmVlW2l0ZW0uZ2VuXSB8fCBbXTtcblx0XHR0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuXHR9XG5cdHJldHVybiB0cmVlO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRjb29yZGluYXRvcnM6IFtdLFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5sdXhBY3Rpb24gPSB7fTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcblx0XHRcdFx0XHRcdHRoaXMubHV4QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGFjdGlvbk1ldGFcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oXCJwcmVwYXJpbmdcIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInJlZ2lzdGVyLnN0b3JlXCI6IGZ1bmN0aW9uKHN0b3JlTWV0YSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb247XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0XHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSA9IHRoaXMuYWN0aW9uTWFwW2FjdGlvbk5hbWVdIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBzdG9yZXM7XG5cdFx0XHRcdFx0XHR0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcblx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCIqXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29vcmRpbmF0b3IgPSB0aGlzLmx1eEFjdGlvbi5jb29yZGluYXRvciA9IG5ldyBBY3Rpb25Db29yZGluYXRvcih7XG5cdFx0XHRcdFx0XHRcdHN0b3JlTGlzdDogdGhpcy5sdXhBY3Rpb24uc3RvcmVzLm1hcCgoc3QpID0+IHN0Lm5hbWVzcGFjZSksXG5cdFx0XHRcdFx0XHRcdGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiB0aGlzLmx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29vcmRpbmF0b3Jcblx0XHRcdFx0XHRcdFx0LnN1Y2Nlc3MoKCkgPT4gdGhpcy50cmFuc2l0aW9uKFwicmVhZHlcIikpXG5cdFx0XHRcdFx0XHRcdC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiKlwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmZXJVbnRpbFRyYW5zaXRpb24oXCJyZWFkeVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3BwZWQ6IHt9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImFjdGlvblwiLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGRhdGEsIGVudikge1xuXHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRjb25maWdTdWJzY3JpcHRpb24oXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGx1eENoLnN1YnNjcmliZShcblx0XHRcdFx0XHRcInJlZ2lzdGVyXCIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSwgZW52KSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdF07XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhLCBlbnZlbG9wZSkge1xuXHRcdHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuXHR9XG5cblx0aGFuZGxlU3RvcmVSZWdpc3RyYXRpb24oZGF0YSwgZW52ZWxvcGUpIHtcblx0XHR0aGlzLmhhbmRsZShcInJlZ2lzdGVyLnN0b3JlXCIsIGRhdGEpO1xuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLnRyYW5zaXRpb24oXCJzdG9wcGVkXCIpO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXHR9XG59XG5cbnZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuXHRcblxuXG52YXIgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLl9fbHV4Q2xlYW51cC5mb3JFYWNoKCAobWV0aG9kKSA9PiBtZXRob2QuY2FsbCh0aGlzKSApO1xuXHR0aGlzLl9fbHV4Q2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXhDbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlcihzdG9yZSwgZGF0YSkge1xuXHR2YXIgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkW3N0b3JlXSA9IGRhdGE7XG5cblx0dmFyIGZvdW5kID0gdGhpcy5fX2x1eFdhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0dGhpcy5fX2x1eFdhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdHRoaXMuX19sdXhIZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCB0aGlzLl9fbHV4V2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRwYXlsb2FkID0gT2JqZWN0LmFzc2lnbigge30sIC4uLnRoaXMuX19sdXhIZWFyZEZyb20pO1xuXHRcdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXhXYWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbnZhciBsdXhTdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICh0aGlzLnN0b3JlcyB8fCB7fSk7XG5cdFx0dmFyIGltbWVkaWF0ZSA9IHN0b3Jlcy5pbW1lZGlhdGU7XG5cdFx0dmFyIGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFtzdG9yZXMubGlzdGVuVG9dIDogc3RvcmVzLmxpc3RlblRvO1xuXHRcdHZhciBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24oc3RvcmVzKSB7XG5cdFx0XHRpZiAoIHR5cGVvZiB0aGlzLnNldFN0YXRlID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRcdHZhciBuZXdTdGF0ZSA9IHt9O1xuXHRcdFx0XHRmb3IoIHZhciBbayx2XSBvZiBlbnRyaWVzKHN0b3JlcykgKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVbIGsgXSA9IHYuc3RhdGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSggbmV3U3RhdGUgKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX19sdXhXYWl0Rm9yID0gW107XG5cdFx0dGhpcy5fX2x1eEhlYXJkRnJvbSA9IFtdO1xuXHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgW107XG5cblx0XHRzdG9yZXMub25DaGFuZ2UgPSBzdG9yZXMub25DaGFuZ2UgfHwgZ2VuZXJpY1N0YXRlQ2hhbmdlSGFuZGxlcjtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKGBub3RpZmljYXRpb24uJHtzdG9yZX1gLCAoZGF0YSkgPT4gZ2F0ZUtlZXBlci5jYWxsKHRoaXMsIHN0b3JlLCBkYXRhKSlcblx0XHQpKTtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHRcdFx0bHV4Q2guc3Vic2NyaWJlKFwicHJlbm90aWZ5XCIsIChkYXRhKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCh0aGlzLCBkYXRhKSlcblx0XHQpO1xuXHRcdGlmKGltbWVkaWF0ZSkge1xuXHRcdFx0aWYoaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdHRoaXMubG9hZFN0YXRlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHN0b3JlcyA9IHRoaXMuc3RvcmVzLmxpc3RlblRvO1xuXHRcdFx0fVxuXHRcdFx0c3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBsdXhDaC5wdWJsaXNoKGBub3RpZnkuJHtzdG9yZX1gKSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgbHV4U3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGx1eFN0b3JlTWl4aW4uc2V0dXAsXG5cdGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBsdXhTdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG52YXIgbHV4QWN0aW9uTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5hY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHt9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uc0ZvciA9IHRoaXMuZ2V0QWN0aW9uc0ZvciB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnNGb3IuZm9yRWFjaChmdW5jdGlvbihzdG9yZSkge1xuXHRcdFx0Zm9yKHZhciBbaywgdl0gb2YgZW50cmllcyhnZXRBY3Rpb25DcmVhdG9yRm9yKHN0b3JlKSkpIHtcblx0XHRcdFx0dGhpc1trXSA9IHY7XG5cdFx0XHR9XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fVxufTtcblxudmFyIGx1eEFjdGlvblJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uTWl4aW4uc2V0dXBcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHtcblx0XHRtaXhpbnM6IFtsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCkge1xuXHRjb250ZXh0Ll9fbHV4Q2xlYW51cCA9IFtdO1xuXG5cdGlmICggY29udGV4dC5zdG9yZXMgKSB7XG5cdFx0bHV4U3RvcmVNaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBsdXhTdG9yZU1peGluLm1peGluKTtcblx0XHRjb250ZXh0Ll9fbHV4Q2xlYW51cC5wdXNoKCBsdXhTdG9yZU1peGluLnRlYXJkb3duICk7XG5cdH1cblxuXHRpZiAoIGNvbnRleHQuZ2V0QWN0aW9uc0ZvciApIHtcblx0XHRsdXhBY3Rpb25NaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdH1cblxuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cblxuXHQvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuXHRyZXR1cm4ge1xuXHRcdGNoYW5uZWw6IGx1eENoLFxuXHRcdFN0b3JlLFxuXHRcdGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuXHRcdGNyZWF0ZUNvbXBvbmVudCxcblx0XHRyZW1vdmVTdG9yZSxcblx0XHRkaXNwYXRjaGVyLFxuXHRcdG1peGluOiBtaXhpbixcblx0XHRBY3Rpb25Db29yZGluYXRvcixcblx0XHRnZXRBY3Rpb25DcmVhdG9yRm9yXG5cdH07XG5cdC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7XG4iLCIkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMChcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzEsXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yLCB0aGlzKTsiLCIkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UiLCJmdW5jdGlvbigkY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICB9IiwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIiRjdHguc3RhdGUgPSAoJF9fcGxhY2Vob2xkZXJfXzApID8gJF9fcGxhY2Vob2xkZXJfXzEgOiAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgYnJlYWsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCIkY3R4Lm1heWJlVGhyb3coKSIsInJldHVybiAkY3R4LmVuZCgpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIiR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gMCwgJF9fcGxhY2Vob2xkZXJfXzEgPSBbXTsiLCIkX19wbGFjZWhvbGRlcl9fMFskX19wbGFjZWhvbGRlcl9fMSsrXSA9ICRfX3BsYWNlaG9sZGVyX18yOyIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMDsiLCJcbiAgICAgICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID0gW10sICRfX3BsYWNlaG9sZGVyX18xID0gMDtcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPCBhcmd1bWVudHMubGVuZ3RoOyAkX19wbGFjZWhvbGRlcl9fMysrKVxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNFskX19wbGFjZWhvbGRlcl9fNV0gPSBhcmd1bWVudHNbJF9fcGxhY2Vob2xkZXJfXzZdOyIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsIiR0cmFjZXVyUnVudGltZS5zcHJlYWQoJF9fcGxhY2Vob2xkZXJfXzApIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9