/**
 * lux.js - Flux-based architecture for using ReactJS at LeanKit
 * Author: Jim Cowart
 * Version: v0.1.0
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
            console.log(config);
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
    var payload = {};
    payload[store] = data;
    this.stores.onChange.call(this, payload);
  }
  var luxStoreMixin = {
    setup: function() {
      var $__9;
      var $__0 = this;
      var stores = this.stores = (this.stores || {});
      var immediate = stores.immediate;
      var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
      var genericStateChangeHandler = function(stores) {
        this.setState(stores);
      };
      this.__subscriptions = this.__subscriptions || [];
      var handler = stores.onChange || genericStateChangeHandler;
      listenTo.forEach((function(store) {
        return $__0.__subscriptions.push(luxCh.subscribe(("notification." + store), (function(data) {
          return gateKeeper.call($__0, store, data);
        })));
      }));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImx1eC1lczYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTIiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTciLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxBQUFFLFNBQVUsSUFBRyxDQUFHLENBQUEsT0FBTSxDQUFJO0FBQzFCLEtBQUssTUFBTyxPQUFLLENBQUEsR0FBTSxXQUFTLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBSSxDQUFJO0FB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QzNDLFlBQU0sYUFBYSxLQUFLLEFBQUMsQ0FBRSxhQUFZLFNBQVMsQ0FBRSxDQUFDO0lBQ3BEO0FBQUEsQUFFQSxPQUFLLE9BQU0sY0FBYyxDQUFJO0FBQzVCLG1CQUFhLE1BQU0sS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7SUFDckM7QUFBQSxBQUVBLFVBQU0sV0FBVyxFQUFJLGdCQUFjLENBQUM7RUFDckM7QUFBQSxBQUlFLE9BQU87QUFDTCxVQUFNLENBQUcsTUFBSTtBQUNiLFFBQUksQ0FBSixNQUFJO0FBQ0osdUJBQW1CLENBQW5CLHFCQUFtQjtBQUNuQixrQkFBYyxDQUFkLGdCQUFjO0FBQ2QsY0FBVSxDQUFWLFlBQVU7QUFDVixhQUFTLENBQVQsV0FBUztBQUNULFFBQUksQ0FBRyxNQUFJO0FBQ1gsb0JBQWdCLENBQWhCLGtCQUFnQjtBQUNoQixzQkFBa0IsQ0FBbEIsb0JBQWtCO0FBQUEsRUFDcEIsQ0FBQztBQUdILENBQUMsQ0FBQyxDQUFDO0FBQUEiLCJmaWxlIjoibHV4LWVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4oIGZ1bmN0aW9uKCByb290LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoIFsgXCJ0cmFjZXVyXCIsIFwicmVhY3RcIiwgXCJwb3N0YWwucmVxdWVzdC1yZXNwb25zZVwiLCBcIm1hY2hpbmFcIiwgXCJ3aGVuXCIsIFwid2hlbi5waXBlbGluZVwiLCBcIndoZW4ucGFyYWxsZWxcIiBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gTm9kZSwgb3IgQ29tbW9uSlMtTGlrZSBlbnZpcm9ubWVudHNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwb3N0YWwsIG1hY2hpbmEgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZShcInRyYWNldXJcIiksIFxuICAgICAgICByZXF1aXJlKFwicmVhY3RcIiksIFxuICAgICAgICBwb3N0YWwsIFxuICAgICAgICBtYWNoaW5hLCBcbiAgICAgICAgcmVxdWlyZShcIndoZW5cIiksIFxuICAgICAgICByZXF1aXJlKFwid2hlbi9waXBlbGluZVwiKSwgXG4gICAgICAgIHJlcXVpcmUoXCJ3aGVuL3BhcmFsbGVsXCIpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNvcnJ5IC0gbHV4SlMgb25seSBzdXBwb3J0IEFNRCBvciBDb21tb25KUyBtb2R1bGUgZW52aXJvbm1lbnRzLlwiKTtcbiAgfVxufSggdGhpcywgZnVuY3Rpb24oIHRyYWNldXIsIFJlYWN0LCBwb3N0YWwsIG1hY2hpbmEsIHdoZW4sIHBpcGVsaW5lLCBwYXJhbGxlbCApIHtcbiAgXG4gIHZhciBsdXhDaCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eFwiICk7XG4gIHZhciBzdG9yZXMgPSB7fTtcblxuICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gIGZ1bmN0aW9uKiBlbnRyaWVzKG9iaikge1xuICAgIGZvcih2YXIgayBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgICB5aWVsZCBbaywgb2JqW2tdXTtcbiAgICB9XG4gIH1cbiAgLy8ganNoaW50IGlnbm9yZTplbmRcblxuICBmdW5jdGlvbiBjb25maWdTdWJzY3JpcHRpb24oY29udGV4dCwgc3Vic2NyaXB0aW9uKSB7XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbi53aXRoQ29udGV4dChjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAud2l0aENvbnN0cmFpbnQoZnVuY3Rpb24oZGF0YSwgZW52ZWxvcGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShlbnZlbG9wZS5oYXNPd25Qcm9wZXJ0eShcIm9yaWdpbklkXCIpKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbnZlbG9wZS5vcmlnaW5JZCA9PT0gcG9zdGFsLmluc3RhbmNlSWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgXG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdChoYW5kbGVycykge1xuICAgIHZhciBhY3Rpb25MaXN0ID0gW107XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgYWN0aW9uTGlzdC5wdXNoKHtcbiAgICAgICAgICAgIGFjdGlvblR5cGU6IGtleSxcbiAgICAgICAgICAgIHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbnZhciBhY3Rpb25DcmVhdG9ycyA9IHt9O1xuXG5mdW5jdGlvbiBnZXRBY3Rpb25DcmVhdG9yRm9yKCBzdG9yZSApIHtcbiAgICByZXR1cm4gYWN0aW9uQ3JlYXRvcnNbc3RvcmVdO1xufVxuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkNyZWF0b3JGcm9tKGFjdGlvbkxpc3QpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IHt9O1xuICAgIGFjdGlvbkxpc3QuZm9yRWFjaChmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgYWN0aW9uQ3JlYXRvclthY3Rpb25dID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LmZyb20oYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIHRvcGljOiBcImFjdGlvblwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25BcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG4gIFxuXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZXIoc3RvcmUsIHRhcmdldCwga2V5LCBoYW5kbGVyKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiB3aGVuKGhhbmRsZXIuYXBwbHkoc3RvcmUsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoW2RhdGEuZGVwc10pKSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHgpeyByZXR1cm4gW251bGwsIHhdOyB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7IHJldHVybiBbZXJyXTsgfVxuICAgICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlc1sxXTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSB2YWx1ZXNbMF07XG4gICAgICAgICAgICAgICAgaWYoZXJyb3IgJiYgdHlwZW9mIHN0b3JlLmhhbmRsZUFjdGlvbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4uam9pbiggZXJyb3IsIHJlc3VsdCwgc3RvcmUuaGFuZGxlQWN0aW9uRXJyb3Ioa2V5LCBlcnJvcikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aGVuLmpvaW4oIGVycm9yLCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IHZhbHVlc1sxXTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gdmFsdWVzWzBdO1xuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiByZXMsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdG9yZS5nZXRTdGF0ZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGVycyhzdG9yZSwgaGFuZGxlcnMpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge307XG4gICAgZm9yICh2YXIgW2tleSwgaGFuZGxlcl0gb2YgZW50cmllcyhoYW5kbGVycykpIHtcbiAgICAgICAgdHJhbnNmb3JtSGFuZGxlcihcbiAgICAgICAgICAgIHN0b3JlLFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgdHlwZW9mIGhhbmRsZXIgPT09IFwib2JqZWN0XCIgPyBoYW5kbGVyLmhhbmRsZXIgOiBoYW5kbGVyXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgaWYoIW9wdGlvbnMubmFtZXNwYWNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiKTtcbiAgICB9XG4gICAgaWYoIW9wdGlvbnMuaGFuZGxlcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIik7XG4gICAgfVxufVxuXG52YXIgc3RvcmVzID0ge307XG5cbmNsYXNzIFN0b3JlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGVuc3VyZVN0b3JlT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlO1xuICAgICAgICBpZiAobmFtZXNwYWNlIGluIHN0b3Jlcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RvcmVzW25hbWVzcGFjZV0gPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSBbXTtcbiAgICAgICAgdGhpcy5hY3Rpb25IYW5kbGVycyA9IHRyYW5zZm9ybUhhbmRsZXJzKHRoaXMsIG9wdGlvbnMuaGFuZGxlcnMpO1xuICAgICAgICBhY3Rpb25DcmVhdG9yc1tuYW1lc3BhY2VdID0gYnVpbGRBY3Rpb25DcmVhdG9yRnJvbShPYmplY3Qua2V5cyhvcHRpb25zLmhhbmRsZXJzKSk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBvcHRpb25zLnN0YXRlIHx8IHt9O1xuICAgICAgICB0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgZGlzcGF0Y2g6IGNvbmZpZ1N1YnNjcmlwdGlvbih0aGlzLCBsdXhDaC5zdWJzY3JpYmUoYGRpc3BhdGNoLiR7bmFtZXNwYWNlfWAsIHRoaXMuaGFuZGxlUGF5bG9hZCkpLFxuICAgICAgICAgICAgbm90aWZ5OiBjb25maWdTdWJzY3JpcHRpb24odGhpcywgbHV4Q2guc3Vic2NyaWJlKGBub3RpZnlgLCB0aGlzLmZsdXNoKSkud2l0aENvbnN0cmFpbnQoKCkgPT4gdGhpcy5pbkRpc3BhdGNoKSxcbiAgICAgICAgICAgIHNjb3BlZE5vdGlmeTogY29uZmlnU3Vic2NyaXB0aW9uKHRoaXMsIGx1eENoLnN1YnNjcmliZShgbm90aWZ5LiR7bmFtZXNwYWNlfWAsIHRoaXMuZmx1c2gpKVxuICAgICAgICB9O1xuICAgICAgICBsdXhDaC5wdWJsaXNoKFwicmVnaXN0ZXJcIiwge1xuICAgICAgICAgICAgbmFtZXNwYWNlLFxuICAgICAgICAgICAgYWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KG9wdGlvbnMuaGFuZGxlcnMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGZvciAodmFyIFtrLCBzdWJzY3JpcHRpb25dIG9mIGVudHJpZXModGhpcy5fX3N1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzdG9yZXNbdGhpcy5uYW1lc3BhY2VdO1xuICAgIH1cblxuICAgIGdldFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBuZXdTdGF0ZSkpO1xuICAgIH1cblxuICAgIHJlcGxhY2VTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdTdGF0ZSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZWRLZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlID0gbmV3U3RhdGUpO1xuICAgIH1cblxuICAgIGZsdXNoKCkge1xuICAgICAgICB0aGlzLmluRGlzcGF0Y2ggPSBmYWxzZTtcbiAgICAgICAgdmFyIGNoYW5nZWRLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFuZ2VkS2V5cyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZEtleXMgPSB7fTtcbiAgICAgICAgbHV4Q2gucHVibGlzaChgbm90aWZpY2F0aW9uLiR7dGhpcy5uYW1lc3BhY2V9YCwgeyBjaGFuZ2VkS2V5cywgc3RhdGU6IHRoaXMuc3RhdGUgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlUGF5bG9hZChkYXRhLCBlbnZlbG9wZSkge1xuICAgICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KGRhdGEuYWN0aW9uVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5EaXNwYXRjaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbkhhbmRsZXJzW2RhdGEuYWN0aW9uVHlwZV1cbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLCBkYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0KSA9PiBlbnZlbG9wZS5yZXBseShudWxsLCB7IHJlc3VsdCwgbmFtZXNwYWNlIH0pLFxuICAgICAgICAgICAgICAgICAgICAoZXJyKSA9PiBlbnZlbG9wZS5yZXBseShlcnIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3RvcmUobmFtZXNwYWNlKSB7XG4gICAgc3RvcmVzW25hbWVzcGFjZV0uZGlzcG9zZSgpO1xufVxuICBcblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlcyA9IGtleXMucmVkdWNlKChhY2N1bSwga2V5KSA9PiB7XG4gICAgICAgIGFjY3VtW2tleV0gPSAob2JqW2tleV0gJiYgb2JqW2tleV0ucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIGFjY3VtO1xuICAgIH0sIHt9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbihnZW5lcmF0aW9uLCBhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHBhcmFsbGVsKFxuICAgICAgICAgICAgZ2VuZXJhdGlvbi5tYXAoKHN0b3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IHBsdWNrKHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yKVxuICAgICAgICAgICAgICAgICAgICB9LCBhY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbHV4Q2gucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3BpYzogYGRpc3BhdGNoLiR7c3RvcmUubmFtZXNwYWNlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3Jlc1tzdG9yZS5uYW1lc3BhY2VdID0gdGhpcy5zdG9yZXNbc3RvcmUubmFtZXNwYWNlXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVzW3N0b3JlLm5hbWVzcGFjZV0ucmVzdWx0ID0gcmVzcG9uc2UucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oKCkgPT4gdGhpcy5zdG9yZXMpO1xuICAgIH1cbiAgICAvKlxuICAgIFx0RXhhbXBsZSBvZiBgY29uZmlnYCBhcmd1bWVudDpcbiAgICBcdHtcbiAgICBcdFx0Z2VuZXJhdGlvbnM6IFtdLFxuICAgIFx0XHRhY3Rpb24gOiB7XG4gICAgXHRcdFx0YWN0aW9uVHlwZTogXCJcIixcbiAgICBcdFx0XHRhY3Rpb25BcmdzOiBbXVxuICAgIFx0XHR9XG4gICAgXHR9XG4gICAgKi9cbmNsYXNzIEFjdGlvbkNvb3JkaW5hdG9yIGV4dGVuZHMgbWFjaGluYS5Gc20ge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIGdlbmVyYXRpb25JbmRleDogMCxcbiAgICAgICAgICAgIHN0b3Jlczoge31cbiAgICAgICAgfSwgY29uZmlnKTtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInVuaW5pdGlhbGl6ZWRcIixcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHVuaW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFwiZGlzcGF0Y2hpbmdcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2hpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXIoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGlwZWxpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtmb3IgKGdlbmVyYXRpb24gb2YgY29uZmlnLmdlbmVyYXRpb25zKSBwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKHRoaXMsIGdlbmVyYXRpb24sIGNvbmZpZy5hY3Rpb24pXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudGhlbihmdW5jdGlvbiguLi5yZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnIgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfb25FeGl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsdXhDaC5wdWJsaXNoKFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiB0aGlzLnN0b3JlTGlzdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgX29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcIm5vdGlmeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0aGlzLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGx1eENoLnB1Ymxpc2goXCJub3RpZnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGhpcy5hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbHV4Q2gucHVibGlzaChcImZhaWx1cmUuYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMuYWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycjogdGhpcy5lcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1Y2Nlc3MoZm4pIHtcbiAgICAgICAgdGhpcy5vbihcInN1Y2Nlc3NcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZmFpbHVyZShmbikge1xuICAgICAgICB0aGlzLm9uKFwiZXJyb3JcIiwgZm4pO1xuICAgICAgICBpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5oYW5kbGUoXCJzdGFydFwiKSwgMCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4gIFxuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCwgZ2VuKSB7XG4gICAgZ2VuID0gZ2VuIHx8IDA7XG4gICAgdmFyIGNhbGNkR2VuID0gZ2VuO1xuICAgIGlmIChzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoKSB7XG4gICAgICAgIHN0b3JlLndhaXRGb3IuZm9yRWFjaChmdW5jdGlvbihkZXApIHtcbiAgICAgICAgICAgIHZhciBkZXBTdG9yZSA9IGxvb2t1cFtkZXBdO1xuICAgICAgICAgICAgdmFyIHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSk7XG4gICAgICAgICAgICBpZiAodGhpc0dlbiA+IGNhbGNkR2VuKSB7XG4gICAgICAgICAgICAgICAgY2FsY2RHZW4gPSB0aGlzR2VuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKHN0b3Jlcykge1xuICAgIHZhciB0cmVlID0gW107XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHN0b3Jlcy5mb3JFYWNoKChzdG9yZSkgPT4gbG9va3VwW3N0b3JlLm5hbWVzcGFjZV0gPSBzdG9yZSk7XG4gICAgc3RvcmVzLmZvckVhY2goKHN0b3JlKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oc3RvcmUsIGxvb2t1cCkpO1xuICAgIGZvciAodmFyIFtrZXksIGl0ZW1dIG9mIGVudHJpZXMobG9va3VwKSkge1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXSA9IHRyZWVbaXRlbS5nZW5dIHx8IFtdO1xuICAgICAgICB0cmVlW2l0ZW0uZ2VuXS5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJlZTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuRnNtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgaW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG4gICAgICAgICAgICBhY3Rpb25NYXA6IHt9LFxuICAgICAgICAgICAgY29vcmRpbmF0b3JzOiBbXSxcbiAgICAgICAgICAgIHN0YXRlczoge1xuICAgICAgICAgICAgICAgIHJlYWR5OiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge307XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uLmRpc3BhdGNoXCI6IGZ1bmN0aW9uKGFjdGlvbk1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubHV4QWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uTWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbihcInByZXBhcmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCJyZWdpc3Rlci5zdG9yZVwiOiBmdW5jdGlvbihzdG9yZU1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uTWV0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbYWN0aW9uTmFtZV0gPSB0aGlzLmFjdGlvbk1hcFthY3Rpb25OYW1lXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24ucHVzaChhY3Rpb25NZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJlcGFyaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFt0aGlzLmx1eEFjdGlvbi5hY3Rpb24uYWN0aW9uVHlwZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbi5zdG9yZXMgPSBzdG9yZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyA9IGJ1aWxkR2VuZXJhdGlvbnMoc3RvcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbih0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggPyBcImRpc3BhdGNoaW5nXCIgOiBcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcIipcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmVyVW50aWxUcmFuc2l0aW9uKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BhdGNoaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgIF9vbkVudGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb29yZGluYXRvciA9IHRoaXMubHV4QWN0aW9uLmNvb3JkaW5hdG9yID0gbmV3IEFjdGlvbkNvb3JkaW5hdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZUxpc3Q6IHRoaXMubHV4QWN0aW9uLnN0b3Jlcy5tYXAoKHN0KSA9PiBzdC5uYW1lc3BhY2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb25zOiB0aGlzLmx1eEFjdGlvbi5nZW5lcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRoaXMubHV4QWN0aW9uLmFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mYWlsdXJlKCgpID0+IHRoaXMudHJhbnNpdGlvbihcInJlYWR5XCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgXCIqXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZlclVudGlsVHJhbnNpdGlvbihcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdG9wcGVkOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG4gICAgICAgICAgICBjb25maWdTdWJzY3JpcHRpb24oXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIGVudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBjb25maWdTdWJzY3JpcHRpb24oXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBsdXhDaC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgICAgICAgIFwicmVnaXN0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSwgZW52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGhhbmRsZUFjdGlvbkRpc3BhdGNoKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlKFwiYWN0aW9uLmRpc3BhdGNoXCIsIGRhdGEpO1xuICAgIH1cblxuICAgIGhhbmRsZVN0b3JlUmVnaXN0cmF0aW9uKGRhdGEsIGVudmVsb3BlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlKFwicmVnaXN0ZXIuc3RvcmVcIiwgZGF0YSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uKFwic3RvcHBlZFwiKTtcbiAgICAgICAgdGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxufVxuXG52YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gIFxuXG5cbnZhciBsdXhNaXhpbkNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMuX19sdXhDbGVhbnVwLmZvckVhY2goIChtZXRob2QpID0+IG1ldGhvZC5jYWxsKHRoaXMpICk7XG5cdHRoaXMuX19sdXhDbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eENsZWFudXA7XG59O1xuXG5mdW5jdGlvbiBnYXRlS2VlcGVyKHN0b3JlLCBkYXRhKSB7XG5cdHZhciBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbc3RvcmVdID0gZGF0YTtcblx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCh0aGlzLCBwYXlsb2FkKTtcbn1cblxudmFyIGx1eFN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKHRoaXMuc3RvcmVzIHx8IHt9KTtcblx0XHR2YXIgaW1tZWRpYXRlID0gc3RvcmVzLmltbWVkaWF0ZTtcblx0XHR2YXIgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gW3N0b3Jlcy5saXN0ZW5Ub10gOiBzdG9yZXMubGlzdGVuVG87XG5cdFx0dmFyIGdlbmVyaWNTdGF0ZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbihzdG9yZXMpIHtcblx0XHQgICAgdGhpcy5zZXRTdGF0ZShzdG9yZXMpO1xuXHRcdH07XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSB0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCBbXTtcblx0XHR2YXIgaGFuZGxlciA9IHN0b3Jlcy5vbkNoYW5nZSB8fCBnZW5lcmljU3RhdGVDaGFuZ2VIYW5kbGVyO1xuXHRcdGxpc3RlblRvLmZvckVhY2goKHN0b3JlKSA9PiB0aGlzLl9fc3Vic2NyaXB0aW9ucy5wdXNoKFxuXHQgICAgICAgIGx1eENoLnN1YnNjcmliZShgbm90aWZpY2F0aW9uLiR7c3RvcmV9YCwgKGRhdGEpID0+IGdhdGVLZWVwZXIuY2FsbCh0aGlzLCBzdG9yZSwgZGF0YSkpXG5cdCAgICApKTtcblx0XHRpZihpbW1lZGlhdGUpIHtcblx0XHRcdGlmKGltbWVkaWF0ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRTdGF0ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHR0aGlzLmxvYWRTdGF0ZSguLi5pbW1lZGlhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWIpID0+IHN1Yi51bnN1YnNjcmliZSgpKTtcblx0fSxcblx0bWl4aW46IHtcblx0XHRsb2FkU3RhdGU6IGZ1bmN0aW9uICguLi5zdG9yZXMpIHtcblx0XHRcdGlmKCFzdG9yZXMubGVuZ3RoKSB7XG5cdFx0XHQgICAgc3RvcmVzID0gdGhpcy5zdG9yZXMubGlzdGVuVG87XG5cdFx0XHR9XG5cdFx0XHRzdG9yZXMuZm9yRWFjaCgoc3RvcmUpID0+IGx1eENoLnB1Ymxpc2goYG5vdGlmeS4ke3N0b3JlfWApKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBsdXhTdG9yZVJlYWN0TWl4aW4gPSB7XG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBsdXhTdG9yZU1peGluLnNldHVwLFxuICAgIGxvYWRTdGF0ZTogbHV4U3RvcmVNaXhpbi5taXhpbi5sb2FkU3RhdGUsXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGx1eFN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cbnZhciBsdXhBY3Rpb25NaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zID0gdGhpcy5hY3Rpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLmdldEFjdGlvbnNGb3IgPSB0aGlzLmdldEFjdGlvbnNGb3IgfHwgW107XG4gICAgICAgIHRoaXMuZ2V0QWN0aW9uc0Zvci5mb3JFYWNoKGZ1bmN0aW9uKHN0b3JlKSB7XG4gICAgICAgICAgICBmb3IodmFyIFtrLCB2XSBvZiBlbnRyaWVzKGdldEFjdGlvbkNyZWF0b3JGb3Ioc3RvcmUpKSkge1xuICAgICAgICAgICAgICAgIHRoaXNba10gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbn07XG5cbnZhciBsdXhBY3Rpb25SZWFjdE1peGluID0ge1xuICAgIGNvbXBvbmVudFdpbGxNb3VudDogbHV4QWN0aW9uTWl4aW4uc2V0dXBcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZXJWaWV3KG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0ID0ge1xuICAgICAgICBtaXhpbnM6IFtsdXhTdG9yZVJlYWN0TWl4aW4sIGx1eEFjdGlvblJlYWN0TWl4aW5dLmNvbmNhdChvcHRpb25zLm1peGlucyB8fCBbXSlcbiAgICB9O1xuICAgIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0ID0ge1xuICAgICAgICBtaXhpbnM6IFtsdXhBY3Rpb25SZWFjdE1peGluXS5jb25jYXQob3B0aW9ucy5taXhpbnMgfHwgW10pXG4gICAgfTtcbiAgICBkZWxldGUgb3B0aW9ucy5taXhpbnM7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG59XG5cblxuZnVuY3Rpb24gbWl4aW4oY29udGV4dCkge1xuXHRjb250ZXh0Ll9fbHV4Q2xlYW51cCA9IFtdO1xuXG5cdGlmICggY29udGV4dC5zdG9yZXMgKSB7XG5cdFx0bHV4U3RvcmVNaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0T2JqZWN0LmFzc2lnbihjb250ZXh0LCBsdXhTdG9yZU1peGluLm1peGluKTtcblx0XHRjb250ZXh0Ll9fbHV4Q2xlYW51cC5wdXNoKCBsdXhTdG9yZU1peGluLnRlYXJkb3duICk7XG5cdH1cblxuXHRpZiAoIGNvbnRleHQuZ2V0QWN0aW9uc0ZvciApIHtcblx0XHRsdXhBY3Rpb25NaXhpbi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdH1cblxuXHRjb250ZXh0Lmx1eENsZWFudXAgPSBsdXhNaXhpbkNsZWFudXA7XG59XG5cblxuICAvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuICByZXR1cm4ge1xuICAgIGNoYW5uZWw6IGx1eENoLFxuICAgIFN0b3JlLFxuICAgIGNyZWF0ZUNvbnRyb2xsZXJWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudCxcbiAgICByZW1vdmVTdG9yZSxcbiAgICBkaXNwYXRjaGVyLFxuICAgIG1peGluOiBtaXhpbixcbiAgICBBY3Rpb25Db29yZGluYXRvcixcbiAgICBnZXRBY3Rpb25DcmVhdG9yRm9yXG4gIH07XG4gIC8vIGpzaGludCBpZ25vcmU6IGVuZFxuXG59KSk7IiwiJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAoXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xLFxuICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiwgdGhpcyk7IiwiJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlIiwiZnVuY3Rpb24oJGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpICRfX3BsYWNlaG9sZGVyX18wXG4gICAgfSIsIlxuICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18xW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgICAgICAgISgkX19wbGFjZWhvbGRlcl9fMyA9ICRfX3BsYWNlaG9sZGVyX180Lm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzU7XG4gICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzY7XG4gICAgICAgIH0iLCIkY3R4LnN0YXRlID0gKCRfX3BsYWNlaG9sZGVyX18wKSA/ICRfX3BsYWNlaG9sZGVyX18xIDogJF9fcGxhY2Vob2xkZXJfXzI7XG4gICAgICAgIGJyZWFrIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiJGN0eC5tYXliZVRocm93KCkiLCJyZXR1cm4gJGN0eC5lbmQoKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18zKSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9IDAsICRfX3BsYWNlaG9sZGVyX18xID0gW107IiwiJF9fcGxhY2Vob2xkZXJfXzBbJF9fcGxhY2Vob2xkZXJfXzErK10gPSAkX19wbGFjZWhvbGRlcl9fMjsiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzA7IiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9IDA7XG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yIDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fcGxhY2Vob2xkZXJfXzMrKylcbiAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzRbJF9fcGxhY2Vob2xkZXJfXzVdID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX182XTsiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCIkdHJhY2V1clJ1bnRpbWUuc3ByZWFkKCRfX3BsYWNlaG9sZGVyX18wKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==