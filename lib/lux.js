/*!
 *  * lux.js - Flux-based architecture for using ReactJS at LeanKit
 *  * Author: Jim Cowart
 *  * Version: v0.8.0
 *  * Url: https://github.com/LeanKit-Labs/lux.js
 *  * License(s): 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("postal"), require("machina"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "postal", "machina"], factory);
	else if(typeof exports === 'object')
		exports["lux"] = factory(require("lodash"), require("postal"), require("machina"));
	else
		root["lux"] = factory(root["_"], root["postal"], root["machina"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _utils = __webpack_require__(1);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _actions = __webpack_require__(2);
	
	var _mixins = __webpack_require__(6);
	
	var _store = __webpack_require__(10);
	
	var _extend = __webpack_require__(13);
	
	var _dispatcher = __webpack_require__(11);
	
	var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	"use strict";
	
	/* istanbul ignore next */
	if (!(typeof global === "undefined" ? window : global)._babelPolyfill) {
		throw new Error("You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details.");
	}
	
	_store.Store.extend = _extend.extend;
	
	exports["default"] = {
		actions: _actions.actions,
		publishAction: _mixins.publishAction,
		addToActionGroup: _actions.addToActionGroup,
		component: _mixins.component,
		controllerView: _mixins.controllerView,
		customActionCreator: _actions.customActionCreator,
		dispatcher: _dispatcher2["default"],
		getActionGroup: _actions.getActionGroup,
		actionCreatorListener: _mixins.actionCreatorListener,
		actionCreator: _mixins.actionCreator,
		actionListener: _mixins.actionListener,
		mixin: _mixins.mixin,
		initReact: _mixins.initReact,
		reactMixin: _mixins.reactMixin,
		removeStore: _store.removeStore,
		Store: _store.Store,
		stores: _store.stores,
		utils: _utils2["default"]
	};
	module.exports = exports["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ensureLuxProp = ensureLuxProp;
	exports.entries = entries;
	var marked0$0 = [entries].map(regeneratorRuntime.mark);
	
	function ensureLuxProp(context) {
		var __lux = context.__lux = context.__lux || {};
		/*eslint-disable */
		var cleanup = __lux.cleanup = __lux.cleanup || [];
		var subscriptions = __lux.subscriptions = __lux.subscriptions || {};
		/*eslint-enable */
		return __lux;
	}
	
	function entries(obj) {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, k;
	
		return regeneratorRuntime.wrap(function entries$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:
					if (["object", "function"].indexOf(typeof obj) === -1) {
						obj = {};
					}
					_iteratorNormalCompletion = true;
					_didIteratorError = false;
					_iteratorError = undefined;
					context$1$0.prev = 4;
					_iterator = Object.keys(obj)[Symbol.iterator]();
	
				case 6:
					if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
						context$1$0.next = 13;
						break;
					}
	
					k = _step.value;
					context$1$0.next = 10;
					return [k, obj[k]];
	
				case 10:
					_iteratorNormalCompletion = true;
					context$1$0.next = 6;
					break;
	
				case 13:
					context$1$0.next = 19;
					break;
	
				case 15:
					context$1$0.prev = 15;
					context$1$0.t0 = context$1$0["catch"](4);
					_didIteratorError = true;
					_iteratorError = context$1$0.t0;
	
				case 19:
					context$1$0.prev = 19;
					context$1$0.prev = 20;
	
					if (!_iteratorNormalCompletion && _iterator["return"]) {
						_iterator["return"]();
					}
	
				case 22:
					context$1$0.prev = 22;
	
					if (!_didIteratorError) {
						context$1$0.next = 25;
						break;
					}
	
					throw _iteratorError;
	
				case 25:
					return context$1$0.finish(22);
	
				case 26:
					return context$1$0.finish(19);
	
				case 27:
				case "end":
					return context$1$0.stop();
			}
		}, marked0$0[0], this, [[4, 15, 19, 27], [20,, 22, 26]]);
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	exports.generateActionCreator = generateActionCreator;
	exports.getActionGroup = getActionGroup;
	exports.getGroupsWithAction = getGroupsWithAction;
	exports.customActionCreator = customActionCreator;
	exports.addToActionGroup = addToActionGroup;
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _utils = __webpack_require__(1);
	
	var _bus = __webpack_require__(4);
	
	var actions = Object.create(null);
	exports.actions = actions;
	var actionGroups = Object.create(null);
	
	exports.actionGroups = actionGroups;
	
	function generateActionCreator(actionList) {
		actionList = typeof actionList === "string" ? [actionList] : actionList;
		actionList.forEach(function (action) {
			if (!actions[action]) {
				actions[action] = function () {
					var args = Array.from(arguments);
					_bus.actionChannel.publish({
						topic: "execute." + action,
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
			return _lodash2["default"].pick(actions, actionGroups[group]);
		} else {
			throw new Error("There is no action group named '" + group + "'");
		}
	}
	
	function getGroupsWithAction(actionName) {
		var groups = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _utils.entries)(actionGroups)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);
	
				var group = _step$value[0];
				var list = _step$value[1];
	
				if (list.indexOf(actionName) >= 0) {
					groups.push(group);
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		return groups;
	}
	
	function customActionCreator(action) {
		Object.assign(actions, action);
	}
	
	function addToActionGroup(groupName, actionList) {
		var group = actionGroups[groupName];
		if (!group) {
			group = actionGroups[groupName] = [];
		}
		actionList = typeof actionList === "string" ? [actionList] : actionList;
		var diff = _lodash2["default"].difference(actionList, Object.keys(actions));
		if (diff.length) {
			throw new Error("The following actions do not exist: " + diff.join(", "));
		}
		actionList.forEach(function (action) {
			if (group.indexOf(action) === -1) {
				group.push(action);
			}
		});
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _postal = __webpack_require__(5);
	
	var _postal2 = _interopRequireDefault(_postal);
	
	var actionChannel = _postal2["default"].channel("lux.action");
	var storeChannel = _postal2["default"].channel("lux.store");
	var dispatcherChannel = _postal2["default"].channel("lux.dispatcher");
	
	exports.actionChannel = actionChannel;
	exports.storeChannel = storeChannel;
	exports.dispatcherChannel = dispatcherChannel;
	exports.postal = _postal2["default"];

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _store = __webpack_require__(7);
	
	var _actionCreator = __webpack_require__(8);
	
	var _actionListener = __webpack_require__(9);
	
	"use strict";
	
	var React = undefined;
	
	function initReact(userReact) {
		React = userReact;
		return this;
	}
	
	function ensureReact(methodName) {
		if (typeof React === "undefined") {
			throw new Error("You attempted to use lux." + methodName + " without first calling lux.initReact( React );");
		}
	}
	
	function controllerView(options) {
		ensureReact("controllerView");
		var opt = {
			mixins: [_store.storeReactMixin, _actionCreator.actionCreatorReactMixin].concat(options.mixins || [])
		};
		delete options.mixins;
		return React.createClass(Object.assign(opt, options));
	}
	
	function component(options) {
		ensureReact("component");
		var opt = {
			mixins: [_actionCreator.actionCreatorReactMixin].concat(options.mixins || [])
		};
		delete options.mixins;
		return React.createClass(Object.assign(opt, options));
	}
	
	/*********************************************
	*   Generalized Mixin Behavior for non-lux   *
	**********************************************/
	var luxMixinCleanup = function luxMixinCleanup() {
		// istanbul ignore next
	
		var _this = this;
	
		this.__lux.cleanup.forEach(function (method) {
			return method.call(_this);
		});
		this.__lux.cleanup = undefined;
		delete this.__lux.cleanup;
	};
	
	function mixin(context) {
		for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			mixins[_key - 1] = arguments[_key];
		}
	
		if (mixins.length === 0) {
			mixins = [_store.storeMixin, _actionCreator.actionCreatorMixin];
		}
	
		mixins.forEach(function (mxn) {
			if (typeof mxn === "function") {
				mxn = mxn();
			}
			if (mxn.mixin) {
				Object.assign(context, mxn.mixin);
			}
			if (typeof mxn.setup !== "function") {
				throw new Error("Lux mixins should have a setup method. Did you perhaps pass your mixins ahead of your target instance?");
			}
			mxn.setup.call(context);
			if (mxn.teardown) {
				context.__lux.cleanup.push(mxn.teardown);
			}
		});
		context.luxCleanup = luxMixinCleanup;
		return context;
	}
	
	mixin.store = _store.storeMixin;
	mixin.actionCreator = _actionCreator.actionCreatorMixin;
	mixin.actionListener = _actionListener.actionListenerMixin;
	
	var reactMixin = {
		actionCreator: _actionCreator.actionCreatorReactMixin,
		store: _store.storeReactMixin
	};
	
	function actionListener(target) {
		return mixin(target, _actionListener.actionListenerMixin);
	}
	
	function actionCreator(target) {
		return mixin(target, _actionCreator.actionCreatorMixin);
	}
	
	function actionCreatorListener(target) {
		return actionCreator(actionListener(target));
	}
	
	exports.component = component;
	exports.controllerView = controllerView;
	exports.initReact = initReact;
	exports.mixin = mixin;
	exports.reactMixin = reactMixin;
	exports.actionListener = actionListener;
	exports.actionCreator = actionCreator;
	exports.actionCreatorListener = actionCreatorListener;
	exports.publishAction = _actionCreator.publishAction;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	/*********************************************
	*                 Store Mixin                *
	**********************************************/
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	"use strict";
	
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
		// istanbul ignore next
	
		var _this = this;
	
		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this.stores.listenTo.indexOf(item) > -1;
		});
	}
	
	var storeMixin = {
		setup: function setup() {
			// istanbul ignore next
	
			var _this2 = this;
	
			var __lux = (0, _utils.ensureLuxProp)(this);
			var stores = this.stores = this.stores || {};
	
			if (!stores.listenTo || !stores.listenTo.length) {
				throw new Error("listenTo must contain at least one store namespace");
			}
	
			var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
	
			if (!stores.onChange) {
				throw new Error("A component was told to listen to the following store(s): " + listenTo + " but no onChange handler was implemented");
			}
	
			__lux.waitFor = [];
			__lux.heardFrom = [];
	
			listenTo.forEach(function (store) {
				__lux.subscriptions[store + ".changed"] = _bus.storeChannel.subscribe(store + ".changed", function () {
					return gateKeeper.call(_this2, store);
				});
			});
	
			__lux.subscriptions.prenotify = _bus.dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify.call(_this2, data);
			});
		},
		teardown: function teardown() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;
	
			try {
				for (var _iterator = (0, _utils.entries)(this.__lux.subscriptions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2);
	
					var key = _step$value[0];
					var sub = _step$value[1];
	
					var split = undefined;
					if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
						sub.unsubscribe();
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator["return"]) {
						_iterator["return"]();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		},
		mixin: {}
	};
	
	exports.storeMixin = storeMixin;
	var storeReactMixin = {
		componentWillMount: storeMixin.setup,
		componentWillUnmount: storeMixin.teardown
	};
	exports.storeReactMixin = storeReactMixin;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	var _slice = Array.prototype.slice;
	// istanbul ignore next
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	exports.publishAction = publishAction;
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
	/*********************************************
	*           Action Creator Mixin          *
	**********************************************/
	
	"use strict";
	
	function publishAction(action) {
		if (_actions.actions[action]) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}
	
			_actions.actions[action].apply(_actions.actions, args);
		} else {
			throw new Error("There is no action named '" + action + "'");
		}
	}
	
	var actionCreatorMixin = {
		setup: function setup() {
			// istanbul ignore next
	
			var _this = this;
	
			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];
	
			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}
	
			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}
	
			var addActionIfNotPresent = function addActionIfNotPresent(k, v) {
				if (!_this[k]) {
					_this[k] = v;
				}
			};
			this.getActionGroup.forEach(function (group) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = (0, _utils.entries)((0, _actions.getActionGroup)(group))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _step$value = _slicedToArray(_step.value, 2);
	
						var k = _step$value[0];
						var v = _step$value[1];
	
						addActionIfNotPresent(k, v);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator["return"]) {
							_iterator["return"]();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			});
	
			if (this.getActions.length) {
				this.getActions.forEach(function (key) {
					addActionIfNotPresent(key, function () {
						publishAction.apply(undefined, [key].concat(_slice.call(arguments)));
					});
				});
			}
		},
		mixin: {
			publishAction: publishAction
		}
	};
	
	exports.actionCreatorMixin = actionCreatorMixin;
	var actionCreatorReactMixin = {
		componentWillMount: actionCreatorMixin.setup,
		publishAction: publishAction
	};
	exports.actionCreatorReactMixin = actionCreatorReactMixin;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionListenerMixin = actionListenerMixin;
	
	/*********************************************
	*            Action Listener Mixin           *
	**********************************************/
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
	"use strict";
	function actionListenerMixin() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
		var handlers = _ref.handlers;
		var handlerFn = _ref.handlerFn;
		var context = _ref.context;
		var channel = _ref.channel;
		var topic = _ref.topic;
	
		return {
			setup: function setup() {
				context = context || this;
				var __lux = (0, _utils.ensureLuxProp)(context);
				var subs = __lux.subscriptions;
				handlers = handlers || context.handlers;
				channel = channel || _bus.actionChannel;
				topic = topic || "execute.*";
				handlerFn = handlerFn || function (data, env) {
					var handler = handlers[data.actionType];
					if (handler) {
						handler.apply(context, data.actionArgs);
					}
				};
				if (!handlers || !Object.keys(handlers).length) {
					throw new Error("You must have at least one action handler in the handlers property");
				} else if (subs && subs.actionListener) {
					return;
				}
				subs.actionListener = channel.subscribe(topic, handlerFn).context(context);
				var handlerKeys = Object.keys(handlers);
				(0, _actions.generateActionCreator)(handlerKeys);
				if (context.namespace) {
					(0, _actions.addToActionGroup)(context.namespace, handlerKeys);
				}
			},
			teardown: function teardown() {
				this.__lux.subscriptions.actionListener.unsubscribe();
			}
		};
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	// istanbul ignore next
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	exports.removeStore = removeStore;
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	// istanbul ignore next
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _dispatcher = __webpack_require__(11);
	
	var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _mixins = __webpack_require__(6);
	
	var stores = {};
	
	exports.stores = stores;
	function buildActionList(handlers) {
		var actionList = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _utils.entries)(handlers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);
	
				var key = _step$value[0];
				var handler = _step$value[1];
	
				actionList.push({
					actionType: key,
					waitFor: handler.waitFor || []
				});
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		return actionList;
	}
	
	function ensureStoreOptions(options, handlers, store) {
		var namespace = options && options.namespace || store.namespace;
		if (namespace in stores) {
			throw new Error("The store namespace \"" + namespace + "\" already exists.");
		}
		if (!namespace) {
			throw new Error("A lux store must have a namespace value provided");
		}
		if (!handlers || !Object.keys(handlers).length) {
			throw new Error("A lux store must have action handler methods provided");
		}
	}
	
	function getHandlerObject(key, listeners) {
		return {
			waitFor: [],
			handler: function handler() {
				var changed = 0;
				var args = Array.from(arguments);
				listeners[key].forEach((function (listener) {
					changed += listener.apply(this, args) === false ? 0 : 1;
				}).bind(this));
				return changed > 0;
			}
		};
	}
	
	function updateWaitFor(source, handlerObject) {
		if (source.waitFor) {
			source.waitFor.forEach(function (dep) {
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
		var listeners = {};
		var handlers = {};
		var state = {};
		var otherOpts = {};
	
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}
	
		options.forEach(function (o) {
			var opt = undefined;
			if (o) {
				opt = _lodash2["default"].clone(o);
				_lodash2["default"].merge(state, opt.state);
				if (opt.handlers) {
					Object.keys(opt.handlers).forEach(function (key) {
						var handler = opt.handlers[key];
						// set up the actual handler method that will be executed
						// as the store handles a dispatched action
						handlers[key] = handlers[key] || getHandlerObject(key, listeners);
						// ensure that the handler definition has a list of all stores
						// being waited upon
						updateWaitFor(handler, handlers[key]);
						// Add the original handler method(s) to the listeners queue
						addListeners(listeners, key, handler);
					});
				}
				delete opt.handlers;
				delete opt.state;
				_lodash2["default"].merge(otherOpts, opt);
			}
		});
		return [state, handlers, otherOpts];
	}
	
	var Store = (function () {
		function Store() {
			// istanbul ignore next
	
			var _this = this;
	
			_classCallCheck(this, Store);
	
			var _processStoreArgs = processStoreArgs.apply(undefined, arguments);
	
			var _processStoreArgs2 = _slicedToArray(_processStoreArgs, 3);
	
			var state = _processStoreArgs2[0];
			var handlers = _processStoreArgs2[1];
			var options = _processStoreArgs2[2];
	
			ensureStoreOptions(options, handlers, this);
			var namespace = options.namespace || this.namespace;
			Object.assign(this, options);
			stores[namespace] = this;
			var inDispatch = false;
			this.hasChanged = false;
	
			this.getState = function () {
				return state;
			};
	
			this.setState = function (newState) {
				if (!inDispatch) {
					throw new Error("setState can only be called during a dispatch cycle from a store action handler.");
				}
				state = Object.assign(state, newState);
			};
	
			this.replaceState = function (newState) {
				if (!inDispatch) {
					throw new Error("replaceState can only be called during a dispatch cycle from a store action handler.");
				}
				// we preserve the underlying state ref, but clear it
				Object.keys(state).forEach(function (key) {
					delete state[key];
				});
				state = Object.assign(state, newState);
			};
	
			this.flush = function flush() {
				inDispatch = false;
				if (this.hasChanged) {
					this.hasChanged = false;
					_bus.storeChannel.publish(this.namespace + ".changed");
				}
			};
	
			(0, _mixins.mixin)(this, _mixins.mixin.actionListener({
				context: this,
				channel: _bus.dispatcherChannel,
				topic: namespace + ".handle.*",
				handlers: handlers,
				handlerFn: (function (data) {
					if (handlers.hasOwnProperty(data.actionType)) {
						inDispatch = true;
						var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
						this.hasChanged = res === false ? false : true;
						_bus.dispatcherChannel.publish(this.namespace + ".handled." + data.actionType, { hasChanged: this.hasChanged, namespace: this.namespace });
					}
				}).bind(this)
			}));
	
			this.__subscription = {
				notify: _bus.dispatcherChannel.subscribe("notify", function () {
					return _this.flush();
				}).constraint(function () {
					return inDispatch;
				})
			};
	
			_dispatcher2["default"].registerStore({
				namespace: namespace,
				actions: buildActionList(handlers)
			});
		}
	
		// Need to build in behavior to remove this store
		// from the dispatcher's actionMap as well!
	
		_createClass(Store, [{
			key: "dispose",
			value: function dispose() {
				/*eslint-disable */
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _utils.entries)(this.__subscription)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var _step2$value = _slicedToArray(_step2.value, 2);
	
						var k = _step2$value[0];
						var subscription = _step2$value[1];
	
						subscription.unsubscribe();
					}
					/*eslint-enable */
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
							_iterator2["return"]();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				delete stores[this.namespace];
				_dispatcher2["default"].removeStore(this.namespace);
				this.luxCleanup();
			}
		}]);
	
		return Store;
	})();
	
	exports.Store = Store;
	
	function removeStore(namespace) {
		stores[namespace].dispose();
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
	
	// istanbul ignore next
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	// istanbul ignore next
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	// istanbul ignore next
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// istanbul ignore next
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _machina = __webpack_require__(12);
	
	var _machina2 = _interopRequireDefault(_machina);
	
	"use strict";
	
	function calculateGen(store, lookup, gen, actionType, namespaces) {
		var calcdGen = gen;
		var _namespaces = namespaces || [];
		if (_namespaces.indexOf(store.namespace) > -1) {
			throw new Error("Circular dependency detected for the \"" + store.namespace + "\" store when participating in the \"" + actionType + "\" action.");
		}
		if (store.waitFor && store.waitFor.length) {
			store.waitFor.forEach(function (dep) {
				var depStore = lookup[dep];
				if (depStore) {
					_namespaces.push(store.namespace);
					var thisGen = calculateGen(depStore, lookup, gen + 1, actionType, _namespaces);
					if (thisGen > calcdGen) {
						calcdGen = thisGen;
					}
				} else {
					console.warn("The \"" + actionType + "\" action in the \"" + store.namespace + "\" store waits for \"" + dep + "\" but a store with that namespace does not participate in this action.");
				}
			});
		}
		return calcdGen;
	}
	
	function buildGenerations(stores, actionType) {
		var tree = [];
		var lookup = {};
		stores.forEach(function (store) {
			return lookup[store.namespace] = store;
		});
		stores.forEach(function (store) {
			return store.gen = calculateGen(store, lookup, 0, actionType);
		});
		/*eslint-disable */
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _utils.entries)(lookup)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);
	
				var key = _step$value[0];
				var item = _step$value[1];
	
				tree[item.gen] = tree[item.gen] || [];
				tree[item.gen].push(item);
			}
			/*eslint-enable */
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		return tree;
	}
	
	function processGeneration(generation, action) {
		// istanbul ignore next
	
		var _this = this;
	
		generation.map(function (store) {
			var data = Object.assign({
				deps: _lodash2["default"].pick(_this.stores, store.waitFor)
			}, action);
			_bus.dispatcherChannel.publish(store.namespace + ".handle." + action.actionType, data);
		});
	}
	
	var Dispatcher = (function (_machina$BehavioralFsm) {
		_inherits(Dispatcher, _machina$BehavioralFsm);
	
		function Dispatcher() {
			_classCallCheck(this, Dispatcher);
	
			_get(Object.getPrototypeOf(Dispatcher.prototype), "constructor", this).call(this, {
				initialState: "ready",
				actionMap: {},
				states: {
					ready: {
						_onEnter: function _onEnter() {
							this.actionContext = undefined;
						},
						"action.dispatch": "dispatching"
					},
					dispatching: {
						_onEnter: function _onEnter(luxAction) {
							this.actionContext = luxAction;
							if (luxAction.generations.length) {
								var _iteratorNormalCompletion2 = true;
								var _didIteratorError2 = false;
								var _iteratorError2 = undefined;
	
								try {
									for (var _iterator2 = luxAction.generations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
										var generation = _step2.value;
	
										processGeneration.call(luxAction, generation, luxAction.action);
									}
								} catch (err) {
									_didIteratorError2 = true;
									_iteratorError2 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
											_iterator2["return"]();
										}
									} finally {
										if (_didIteratorError2) {
											throw _iteratorError2;
										}
									}
								}
	
								this.transition(luxAction, "notifying");
							} else {
								this.transition(luxAction, "nothandled");
							}
						},
						"action.handled": function actionHandled(luxAction, data) {
							if (data.hasChanged) {
								luxAction.updated.push(data.namespace);
							}
						},
						_onExit: function _onExit(luxAction) {
							if (luxAction.updated.length) {
								_bus.dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
							}
						}
					},
					notifying: {
						_onEnter: function _onEnter(luxAction) {
							_bus.dispatcherChannel.publish("notify", {
								action: luxAction.action
							});
						}
					},
					nothandled: {}
				},
				getStoresHandling: function getStoresHandling(actionType) {
					var stores = this.actionMap[actionType] || [];
					return {
						stores: stores,
						generations: buildGenerations(stores, actionType)
					};
				}
			});
			this.createSubscribers();
		}
	
		_createClass(Dispatcher, [{
			key: "handleActionDispatch",
			value: function handleActionDispatch(data) {
				var luxAction = Object.assign({ action: data, generationIndex: 0, updated: [] }, this.getStoresHandling(data.actionType));
				this.handle(luxAction, "action.dispatch");
			}
		}, {
			key: "registerStore",
			value: function registerStore(storeMeta) {
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;
	
				try {
					for (var _iterator3 = storeMeta.actions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var actionDef = _step3.value;
	
						var action = undefined;
						var actionName = actionDef.actionType;
						var actionMeta = {
							namespace: storeMeta.namespace,
							waitFor: actionDef.waitFor
						};
						action = this.actionMap[actionName] = this.actionMap[actionName] || [];
						action.push(actionMeta);
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
							_iterator3["return"]();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}
		}, {
			key: "removeStore",
			value: function removeStore(namespace) {
				function isThisNameSpace(meta) {
					return meta.namespace === namespace;
				}
				/*eslint-disable */
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;
	
				try {
					for (var _iterator4 = (0, _utils.entries)(this.actionMap)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var _step4$value = _slicedToArray(_step4.value, 2);
	
						var k = _step4$value[0];
						var v = _step4$value[1];
	
						var idx = v.findIndex(isThisNameSpace);
						if (idx !== -1) {
							v.splice(idx, 1);
						}
					}
					/*eslint-enable */
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
							_iterator4["return"]();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			}
		}, {
			key: "createSubscribers",
			value: function createSubscribers() {
				// istanbul ignore next
	
				var _this2 = this;
	
				if (!this.__subscriptions || !this.__subscriptions.length) {
					this.__subscriptions = [_bus.actionChannel.subscribe("execute.*", function (data, env) {
						return _this2.handleActionDispatch(data);
					}), _bus.dispatcherChannel.subscribe("*.handled.*", function (data) {
						return _this2.handle(_this2.actionContext, "action.handled", data);
					}).constraint(function () {
						return !!_this2.actionContext;
					})];
				}
			}
		}, {
			key: "dispose",
			value: function dispose() {
				if (this.__subscriptions) {
					this.__subscriptions.forEach(function (subscription) {
						return subscription.unsubscribe();
					});
					this.__subscriptions = null;
				}
			}
		}]);
	
		return Dispatcher;
	})(_machina2["default"].BehavioralFsm);
	
	exports["default"] = new Dispatcher();
	module.exports = exports["default"];

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var extend = function extend() {
		for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}
	
		var parent = this;
		var store = undefined; // placeholder for instance constructor
		var Ctor = function Ctor() {}; // placeholder ctor function used to insert level in prototype chain
	
		// First - separate mixins from prototype props
		var mixins = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var opt = _step.value;
	
				mixins.push(_lodash2["default"].pick(opt, ["handlers", "state"]));
				delete opt.handlers;
				delete opt.state;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator["return"]) {
					_iterator["return"]();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	
		var protoProps = _lodash2["default"].merge.apply(this, [{}].concat(options));
	
		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty("constructor")) {
			store = protoProps.constructor;
		} else {
			store = function () {
				var args = Array.from(arguments);
				args[0] = args[0] || {};
				parent.apply(this, store.mixins.concat(args));
			};
		}
	
		store.mixins = mixins;
	
		// Inherit class (static) properties from parent.
		_lodash2["default"].merge(store, parent);
	
		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		Ctor.prototype = parent.prototype;
		store.prototype = new Ctor();
	
		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) {
			_lodash2["default"].extend(store.prototype, protoProps);
		}
	
		// Correctly set child's `prototype.constructor`.
		store.prototype.constructor = store;
	
		// Set a convenience property in case the parent's prototype is needed later.
		store.__super__ = parent.prototype;
		return store;
	};
	exports.extend = extend;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAzMDU1NWZlOGEwZGNmODhhZGVjYyIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtYWNoaW5hXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtB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QixNQUFNO0FBQ04sUUFBSyxHQUFHLFlBQVc7QUFDbEIsUUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUMsQ0FBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixVQUFNLENBQUMsS0FBSyxDQUFFLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUUsQ0FBRSxDQUFDO0lBQ2xELENBQUM7R0FDRjs7QUFFRCxPQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7O0FBR3RCLHNCQUFFLEtBQUssQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFFLENBQUM7Ozs7QUFJekIsTUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE9BQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7OztBQUk3QixNQUFLLFVBQVUsRUFBRztBQUNqQix1QkFBRSxNQUFNLENBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUUsQ0FBQztHQUN4Qzs7O0FBR0QsT0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOzs7QUFHcEMsT0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25DLFNBQU8sS0FBSyxDQUFDO0VBQ2IsQ0FBQyIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJwb3N0YWxcIiksIHJlcXVpcmUoXCJtYWNoaW5hXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcImxvZGFzaFwiLCBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibHV4XCJdID0gZmFjdG9yeShyZXF1aXJlKFwibG9kYXNoXCIpLCByZXF1aXJlKFwicG9zdGFsXCIpLCByZXF1aXJlKFwibWFjaGluYVwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV4XCJdID0gZmFjdG9yeShyb290W1wiX1wiXSwgcm9vdFtcInBvc3RhbFwiXSwgcm9vdFtcIm1hY2hpbmFcIl0pO1xufSkodGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8zX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEyX18pIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDMwNTU1ZmU4YTBkY2Y4OGFkZWNjXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoICEoIHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWwgKS5fYmFiZWxQb2x5ZmlsbCApIHtcblx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGluY2x1ZGUgdGhlIGJhYmVsIHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiICk7XG59XG5cbmltcG9ydCB1dGlscyBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQge1xuXHRnZXRBY3Rpb25Hcm91cCxcblx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0YWRkVG9BY3Rpb25Hcm91cCxcblx0YWN0aW9uc1xufSBmcm9tIFwiLi9hY3Rpb25zXCI7XG5cbmltcG9ydCB7XG5cdGNvbXBvbmVudCxcblx0Y29udHJvbGxlclZpZXcsXG5cdGluaXRSZWFjdCxcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdGFjdGlvbkxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdHB1Ymxpc2hBY3Rpb25cbn0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmltcG9ydCB7IFN0b3JlLCBzdG9yZXMsIHJlbW92ZVN0b3JlIH0gZnJvbSBcIi4vc3RvcmVcIjtcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gXCIuL2V4dGVuZFwiO1xuU3RvcmUuZXh0ZW5kID0gZXh0ZW5kO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tIFwiLi9kaXNwYXRjaGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0YWN0aW9ucyxcblx0cHVibGlzaEFjdGlvbixcblx0YWRkVG9BY3Rpb25Hcm91cCxcblx0Y29tcG9uZW50LFxuXHRjb250cm9sbGVyVmlldyxcblx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0ZGlzcGF0Y2hlcixcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdG1peGluLFxuXHRpbml0UmVhY3QsXG5cdHJlYWN0TWl4aW4sXG5cdHJlbW92ZVN0b3JlLFxuXHRTdG9yZSxcblx0c3RvcmVzLFxuXHR1dGlsc1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2x1eC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlTHV4UHJvcCggY29udGV4dCApIHtcblx0Y29uc3QgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKCBjb250ZXh0Ll9fbHV4IHx8IHt9ICk7XG5cdC8qZXNsaW50LWRpc2FibGUgKi9cblx0Y29uc3QgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0Y29uc3Qgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0Lyplc2xpbnQtZW5hYmxlICovXG5cdHJldHVybiBfX2x1eDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBlbnRyaWVzKCBvYmogKSB7XG5cdGlmICggWyBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIgXS5pbmRleE9mKCB0eXBlb2Ygb2JqICkgPT09IC0xICkge1xuXHRcdG9iaiA9IHt9O1xuXHR9XG5cdGZvciAoIGxldCBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHR5aWVsZCBbIGssIG9ialsgayBdIF07XG5cdH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzLmpzXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5leHBvcnQgY29uc3QgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbmV4cG9ydCBjb25zdCBhY3Rpb25Hcm91cHMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiAoICFhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRcdGFjdGlvbnNbIGFjdGlvbiBdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCgge1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9ICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzWyBncm91cCBdICkge1xuXHRcdHJldHVybiBfLnBpY2soIGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCApO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHRjb25zdCBncm91cHMgPSBbXTtcblx0Zm9yICggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiAoIGxpc3QuaW5kZXhPZiggYWN0aW9uTmFtZSApID49IDAgKSB7XG5cdFx0XHRncm91cHMucHVzaCggZ3JvdXAgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0T2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKCBncm91cE5hbWUsIGFjdGlvbkxpc3QgKSB7XG5cdGxldCBncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF07XG5cdGlmICggIWdyb3VwICkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0Y29uc3QgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiAoIGRpZmYubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBkbyBub3QgZXhpc3Q6ICR7ZGlmZi5qb2luKCBcIiwgXCIgKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9ICk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hY3Rpb25zLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIHtcInJvb3RcIjpcIl9cIixcImNvbW1vbmpzXCI6XCJsb2Rhc2hcIixcImNvbW1vbmpzMlwiOlwibG9kYXNoXCIsXCJhbWRcIjpcImxvZGFzaFwifVxuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBwb3N0YWwgZnJvbSBcInBvc3RhbFwiO1xuXG5jb25zdCBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmFjdGlvblwiICk7XG5jb25zdCBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguc3RvcmVcIiApO1xuY29uc3QgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguZGlzcGF0Y2hlclwiICk7XG5cbmV4cG9ydCB7XG5cdGFjdGlvbkNoYW5uZWwsXG5cdHN0b3JlQ2hhbm5lbCxcblx0ZGlzcGF0Y2hlckNoYW5uZWwsXG5cdHBvc3RhbFxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2J1cy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV81X187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInBvc3RhbFwiXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7IHN0b3JlTWl4aW4sIHN0b3JlUmVhY3RNaXhpbiB9IGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBhY3Rpb25DcmVhdG9yTWl4aW4sIGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLCBwdWJsaXNoQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9uQ3JlYXRvclwiO1xuaW1wb3J0IHsgYWN0aW9uTGlzdGVuZXJNaXhpbiB9IGZyb20gXCIuL2FjdGlvbkxpc3RlbmVyXCI7XG5cbmxldCBSZWFjdDtcblxuZnVuY3Rpb24gaW5pdFJlYWN0KCB1c2VyUmVhY3QgKSB7XG5cdFJlYWN0ID0gdXNlclJlYWN0O1xuXHRyZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gZW5zdXJlUmVhY3QoIG1ldGhvZE5hbWUgKSB7XG5cdGlmICggdHlwZW9mIFJlYWN0ID09PSBcInVuZGVmaW5lZFwiICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgYXR0ZW1wdGVkIHRvIHVzZSBsdXguXCIgKyBtZXRob2ROYW1lICsgXCIgd2l0aG91dCBmaXJzdCBjYWxsaW5nIGx1eC5pbml0UmVhY3QoIFJlYWN0ICk7XCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjb250cm9sbGVyVmlldyggb3B0aW9ucyApIHtcblx0ZW5zdXJlUmVhY3QoIFwiY29udHJvbGxlclZpZXdcIiApO1xuXHRjb25zdCBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIHN0b3JlUmVhY3RNaXhpbiwgYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gXS5jb25jYXQoIG9wdGlvbnMubWl4aW5zIHx8IFtdIClcblx0fTtcblx0ZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuXHRyZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3MoIE9iamVjdC5hc3NpZ24oIG9wdCwgb3B0aW9ucyApICk7XG59XG5cbmZ1bmN0aW9uIGNvbXBvbmVudCggb3B0aW9ucyApIHtcblx0ZW5zdXJlUmVhY3QoIFwiY29tcG9uZW50XCIgKTtcblx0Y29uc3Qgb3B0ID0ge1xuXHRcdG1peGluczogWyBhY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmNvbnN0IGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmICggbWl4aW5zLmxlbmd0aCA9PT0gMCApIHtcblx0XHRtaXhpbnMgPSBbIHN0b3JlTWl4aW4sIGFjdGlvbkNyZWF0b3JNaXhpbiBdO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goICggbXhuICkgPT4ge1xuXHRcdGlmICggdHlwZW9mIG14biA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0bXhuID0gbXhuKCk7XG5cdFx0fVxuXHRcdGlmICggbXhuLm1peGluICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggY29udGV4dCwgbXhuLm1peGluICk7XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIG14bi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG14bi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYgKCBteG4udGVhcmRvd24gKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbXhuLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9ICk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gc3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmNvbnN0IHJlYWN0TWl4aW4gPSB7XG5cdGFjdGlvbkNyZWF0b3I6IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLFxuXHRzdG9yZTogc3RvcmVSZWFjdE1peGluXG59O1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgYWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkgKTtcbn1cblxuZXhwb3J0IHtcblx0Y29tcG9uZW50LFxuXHRjb250cm9sbGVyVmlldyxcblx0aW5pdFJlYWN0LFxuXHRtaXhpbixcblx0cmVhY3RNaXhpbixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdGFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0cHVibGlzaEFjdGlvblxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmltcG9ydCB7IHN0b3JlQ2hhbm5lbCwgZGlzcGF0Y2hlckNoYW5uZWwgfSBmcm9tIFwiLi4vYnVzXCI7XG5pbXBvcnQgeyBlbnN1cmVMdXhQcm9wLCBlbnRyaWVzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoIHN0b3JlLCBkYXRhICkge1xuXHRjb25zdCBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHRjb25zdCBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0Y29uc3QgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG5leHBvcnQgdmFyIHN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIHRoaXMgKTtcblx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyB8fCAhc3RvcmVzLmxpc3RlblRvLmxlbmd0aCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFsgc3RvcmVzLmxpc3RlblRvIF0gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCApO1xuXHRcdH1cblxuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goICggc3RvcmUgKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zWyBgJHtzdG9yZX0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKCB0aGlzLCBzdG9yZSApICk7XG5cdFx0fSApO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoIGxldCBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHRsZXQgc3BsaXQ7XG5cdFx0XHRpZiAoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbmV4cG9ydCBjb25zdCBzdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogc3RvcmVNaXhpbi5zZXR1cCxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IHN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvc3RvcmUuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IGdldEFjdGlvbkdyb3VwLCBhY3Rpb25zIH0gZnJvbSBcIi4uL2FjdGlvbnNcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoQWN0aW9uKCBhY3Rpb24sIC4uLmFyZ3MgKSB7XG5cdGlmICggYWN0aW9uc1sgYWN0aW9uIF0gKSB7XG5cdFx0YWN0aW9uc1sgYWN0aW9uIF0oIC4uLmFyZ3MgKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gbmFtZWQgJyR7YWN0aW9ufSdgICk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9uR3JvdXAgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gWyB0aGlzLmdldEFjdGlvbkdyb3VwIF07XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zID0gWyB0aGlzLmdldEFjdGlvbnMgXTtcblx0XHR9XG5cblx0XHRjb25zdCBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiAoICF0aGlzWyBrIF0gKSB7XG5cdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW50cmllcyggZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkgKSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrLCB2ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0aWYgKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRwdWJsaXNoQWN0aW9uKCBrZXksIC4uLmFyZ3VtZW50cyApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge1xuXHRcdHB1Ymxpc2hBY3Rpb246IHB1Ymxpc2hBY3Rpb25cblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9hY3Rpb25DcmVhdG9yLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuaW1wb3J0IHsgYWN0aW9uQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlQWN0aW9uQ3JlYXRvciwgYWRkVG9BY3Rpb25Hcm91cCB9IGZyb20gXCIuLi9hY3Rpb25zXCI7XG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXJNaXhpbiggeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30gKSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICk7XG5cdFx0XHRjb25zdCBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0Y29uc3QgaGFuZGxlciA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXTtcblx0XHRcdFx0aWYgKCBoYW5kbGVyICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9IGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuICkuY29udGV4dCggY29udGV4dCApO1xuXHRcdFx0Y29uc3QgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyggaGFuZGxlcnMgKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggaGFuZGxlcktleXMgKTtcblx0XHRcdGlmICggY29udGV4dC5uYW1lc3BhY2UgKSB7XG5cdFx0XHRcdGFkZFRvQWN0aW9uR3JvdXAoIGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdH07XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvYWN0aW9uTGlzdGVuZXIuanNcbiAqKi8iLCJpbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IG1peGluIH0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmV4cG9ydCBjb25zdCBzdG9yZXMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0Y29uc3QgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCBsZXQgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0Y29uc3QgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiAoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNoYW5nZWQgPSAwO1xuXHRcdFx0Y29uc3QgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKSB7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiAoIHNvdXJjZS53YWl0Rm9yICkge1xuXHRcdHNvdXJjZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRpZiAoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0Y29uc3QgbGlzdGVuZXJzID0ge307XG5cdGNvbnN0IGhhbmRsZXJzID0ge307XG5cdGNvbnN0IHN0YXRlID0ge307XG5cdGNvbnN0IG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdGxldCBvcHQ7XG5cdFx0aWYgKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYgKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKCAuLi5vcHQgKSB7XG5cdFx0bGV0IFsgc3RhdGUsIGhhbmRsZXJzLCBvcHRpb25zIF0gPSBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHQgKTtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCB0aGlzICk7XG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdGxldCBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBtaXhpbi5hY3Rpb25MaXN0ZW5lcigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCAoKSA9PiB0aGlzLmZsdXNoKCkgKVxuXHRcdFx0XHRcdC5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoIClcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZGlzcGF0Y2hlckNoYW5uZWwsIGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IG1hY2hpbmEgZnJvbSBcIm1hY2hpbmFcIjtcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUsIG5hbWVzcGFjZXMgKSB7XG5cdGxldCBjYWxjZEdlbiA9IGdlbjtcblx0Y29uc3QgX25hbWVzcGFjZXMgPSBuYW1lc3BhY2VzIHx8IFtdO1xuXHRpZiAoIF9uYW1lc3BhY2VzLmluZGV4T2YoIHN0b3JlLm5hbWVzcGFjZSApID4gLTEgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBmb3IgdGhlIFwiJHtzdG9yZS5uYW1lc3BhY2V9XCIgc3RvcmUgd2hlbiBwYXJ0aWNpcGF0aW5nIGluIHRoZSBcIiR7YWN0aW9uVHlwZX1cIiBhY3Rpb24uYCApO1xuXHR9XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRjb25zdCBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiAoIGRlcFN0b3JlICkge1xuXHRcdFx0XHRfbmFtZXNwYWNlcy5wdXNoKCBzdG9yZS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0Y29uc3QgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSwgYWN0aW9uVHlwZSwgX25hbWVzcGFjZXMgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oIGBUaGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uIGluIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdhaXRzIGZvciBcIiR7ZGVwfVwiIGJ1dCBhIHN0b3JlIHdpdGggdGhhdCBuYW1lc3BhY2UgZG9lcyBub3QgcGFydGljaXBhdGUgaW4gdGhpcyBhY3Rpb24uYCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0Y29uc3QgdHJlZSA9IFtdO1xuXHRjb25zdCBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHQvKmVzbGludC1kaXNhYmxlICovXG5cdGZvciAoIGxldCBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0Y29uc3QgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSApO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYgKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0Y29uc3QgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIGxldCBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHRsZXQgYWN0aW9uO1xuXHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0Y29uc3QgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdGZ1bmN0aW9uIGlzVGhpc05hbWVTcGFjZSggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH1cblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHRsZXQgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYgKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0aWYgKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdCggZGF0YSwgZW52ICkgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IERpc3BhdGNoZXIoKTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZGlzcGF0Y2hlci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xMl9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJtYWNoaW5hXCJcbiAqKiBtb2R1bGUgaWQgPSAxMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgY29uc3QgZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKCAuLi5vcHRpb25zICkge1xuXHRjb25zdCBwYXJlbnQgPSB0aGlzO1xuXHRsZXQgc3RvcmU7IC8vIHBsYWNlaG9sZGVyIGZvciBpbnN0YW5jZSBjb25zdHJ1Y3RvclxuXHRjb25zdCBDdG9yID0gZnVuY3Rpb24oKSB7fTsgLy8gcGxhY2Vob2xkZXIgY3RvciBmdW5jdGlvbiB1c2VkIHRvIGluc2VydCBsZXZlbCBpbiBwcm90b3R5cGUgY2hhaW5cblxuXHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRjb25zdCBtaXhpbnMgPSBbXTtcblx0Zm9yICggbGV0IG9wdCBvZiBvcHRpb25zICkge1xuXHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdH1cblxuXHRjb25zdCBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHR9IGVsc2Uge1xuXHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zdCBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdH07XG5cdH1cblxuXHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0Q3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgQ3RvcigpO1xuXG5cdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHQvLyBpZiBzdXBwbGllZC5cblx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0fVxuXG5cdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0cmV0dXJuIHN0b3JlO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V4dGVuZC5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=