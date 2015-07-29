/*!
 *  * lux.js - Flux-based architecture for using ReactJS at LeanKit
 *  * Author: Jim Cowart
 *  * Version: v0.7.4
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
	var actionGroups = {};
	
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
		exports.actions = actions = Object.assign(actions, action);
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
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA5NTRkZWMyMWUwM2JiM2VhNmM4MSIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtYWNoaW5hXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtB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QUMvQixNQUFNO0FBQ04sUUFBSyxHQUFHLFlBQVc7QUFDbEIsUUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUUsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUMsQ0FBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixVQUFNLENBQUMsS0FBSyxDQUFFLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUUsQ0FBRSxDQUFDO0lBQ2xELENBQUM7R0FDRjs7QUFFRCxPQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7O0FBR3RCLHNCQUFFLEtBQUssQ0FBRSxLQUFLLEVBQUUsTUFBTSxDQUFFLENBQUM7Ozs7QUFJekIsTUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE9BQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7OztBQUk3QixNQUFLLFVBQVUsRUFBRztBQUNqQix1QkFBRSxNQUFNLENBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUUsQ0FBQztHQUN4Qzs7O0FBR0QsT0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDOzs7QUFHcEMsT0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25DLFNBQU8sS0FBSyxDQUFDO0VBQ2IsQ0FBQyIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJwb3N0YWxcIiksIHJlcXVpcmUoXCJtYWNoaW5hXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcImxvZGFzaFwiLCBcInBvc3RhbFwiLCBcIm1hY2hpbmFcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibHV4XCJdID0gZmFjdG9yeShyZXF1aXJlKFwibG9kYXNoXCIpLCByZXF1aXJlKFwicG9zdGFsXCIpLCByZXF1aXJlKFwibWFjaGluYVwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV4XCJdID0gZmFjdG9yeShyb290W1wiX1wiXSwgcm9vdFtcInBvc3RhbFwiXSwgcm9vdFtcIm1hY2hpbmFcIl0pO1xufSkodGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8zX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEyX18pIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDk1NGRlYzIxZTAzYmIzZWE2YzgxXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoICEoIHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWwgKS5fYmFiZWxQb2x5ZmlsbCApIHtcblx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGluY2x1ZGUgdGhlIGJhYmVsIHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiICk7XG59XG5cbmltcG9ydCB1dGlscyBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQge1xuXHRnZXRBY3Rpb25Hcm91cCxcblx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0YWRkVG9BY3Rpb25Hcm91cCxcblx0YWN0aW9uc1xufSBmcm9tIFwiLi9hY3Rpb25zXCI7XG5cbmltcG9ydCB7XG5cdGNvbXBvbmVudCxcblx0Y29udHJvbGxlclZpZXcsXG5cdGluaXRSZWFjdCxcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdGFjdGlvbkxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdHB1Ymxpc2hBY3Rpb25cbn0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmltcG9ydCB7IFN0b3JlLCBzdG9yZXMsIHJlbW92ZVN0b3JlIH0gZnJvbSBcIi4vc3RvcmVcIjtcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gXCIuL2V4dGVuZFwiO1xuU3RvcmUuZXh0ZW5kID0gZXh0ZW5kO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tIFwiLi9kaXNwYXRjaGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0YWN0aW9ucyxcblx0cHVibGlzaEFjdGlvbixcblx0YWRkVG9BY3Rpb25Hcm91cCxcblx0Y29tcG9uZW50LFxuXHRjb250cm9sbGVyVmlldyxcblx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0ZGlzcGF0Y2hlcixcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdG1peGluLFxuXHRpbml0UmVhY3QsXG5cdHJlYWN0TWl4aW4sXG5cdHJlbW92ZVN0b3JlLFxuXHRTdG9yZSxcblx0c3RvcmVzLFxuXHR1dGlsc1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2x1eC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlTHV4UHJvcCggY29udGV4dCApIHtcblx0Y29uc3QgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKCBjb250ZXh0Ll9fbHV4IHx8IHt9ICk7XG5cdC8qZXNsaW50LWRpc2FibGUgKi9cblx0Y29uc3QgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0Y29uc3Qgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0Lyplc2xpbnQtZW5hYmxlICovXG5cdHJldHVybiBfX2x1eDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBlbnRyaWVzKCBvYmogKSB7XG5cdGlmICggWyBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIgXS5pbmRleE9mKCB0eXBlb2Ygb2JqICkgPT09IC0xICkge1xuXHRcdG9iaiA9IHt9O1xuXHR9XG5cdGZvciAoIGxldCBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHR5aWVsZCBbIGssIG9ialsgayBdIF07XG5cdH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzLmpzXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5leHBvcnQgbGV0IGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5leHBvcnQgbGV0IGFjdGlvbkdyb3VwcyA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ICkge1xuXHRhY3Rpb25MaXN0ID0gKCB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiApID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYgKCAhYWN0aW9uc1sgYWN0aW9uIF0gKSB7XG5cdFx0XHRhY3Rpb25zWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApIHtcblx0XHRyZXR1cm4gXy5waWNrKCBhY3Rpb25zLCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gZ3JvdXAgbmFtZWQgJyR7Z3JvdXB9J2AgKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JvdXBzV2l0aEFjdGlvbiggYWN0aW9uTmFtZSApIHtcblx0Y29uc3QgZ3JvdXBzID0gW107XG5cdGZvciAoIHZhciBbIGdyb3VwLCBsaXN0IF0gb2YgZW50cmllcyggYWN0aW9uR3JvdXBzICkgKSB7XG5cdFx0aWYgKCBsaXN0LmluZGV4T2YoIGFjdGlvbk5hbWUgKSA+PSAwICkge1xuXHRcdFx0Z3JvdXBzLnB1c2goIGdyb3VwICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKCBhY3Rpb24gKSB7XG5cdGFjdGlvbnMgPSBPYmplY3QuYXNzaWduKCBhY3Rpb25zLCBhY3Rpb24gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0bGV0IGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYgKCAhZ3JvdXAgKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHRjb25zdCBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmICggZGlmZi5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIGZvbGxvd2luZyBhY3Rpb25zIGRvIG5vdCBleGlzdDogJHtkaWZmLmpvaW4oIFwiLCBcIiApfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYgKCBncm91cC5pbmRleE9mKCBhY3Rpb24gKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKCBhY3Rpb24gKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FjdGlvbnMuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfM19fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9XG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IHBvc3RhbCBmcm9tIFwicG9zdGFsXCI7XG5cbmNvbnN0IGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcbmNvbnN0IHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5jb25zdCBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblxuZXhwb3J0IHtcblx0YWN0aW9uQ2hhbm5lbCxcblx0c3RvcmVDaGFubmVsLFxuXHRkaXNwYXRjaGVyQ2hhbm5lbCxcblx0cG9zdGFsXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYnVzLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzVfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwicG9zdGFsXCJcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHsgc3RvcmVNaXhpbiwgc3RvcmVSZWFjdE1peGluIH0gZnJvbSBcIi4vc3RvcmVcIjtcbmltcG9ydCB7IGFjdGlvbkNyZWF0b3JNaXhpbiwgYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sIHB1Ymxpc2hBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25DcmVhdG9yXCI7XG5pbXBvcnQgeyBhY3Rpb25MaXN0ZW5lck1peGluIH0gZnJvbSBcIi4vYWN0aW9uTGlzdGVuZXJcIjtcblxubGV0IFJlYWN0O1xuXG5mdW5jdGlvbiBpbml0UmVhY3QoIHVzZXJSZWFjdCApIHtcblx0UmVhY3QgPSB1c2VyUmVhY3Q7XG5cdHJldHVybiB0aGlzO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVSZWFjdCggbWV0aG9kTmFtZSApIHtcblx0aWYgKCB0eXBlb2YgUmVhY3QgPT09IFwidW5kZWZpbmVkXCIgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBhdHRlbXB0ZWQgdG8gdXNlIGx1eC5cIiArIG1ldGhvZE5hbWUgKyBcIiB3aXRob3V0IGZpcnN0IGNhbGxpbmcgbHV4LmluaXRSZWFjdCggUmVhY3QgKTtcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbnRyb2xsZXJWaWV3KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb250cm9sbGVyVmlld1wiICk7XG5cdGNvbnN0IG9wdCA9IHtcblx0XHRtaXhpbnM6IFsgc3RvcmVSZWFjdE1peGluLCBhY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiBdLmNvbmNhdCggb3B0aW9ucy5taXhpbnMgfHwgW10gKVxuXHR9O1xuXHRkZWxldGUgb3B0aW9ucy5taXhpbnM7XG5cdHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyggT2JqZWN0LmFzc2lnbiggb3B0LCBvcHRpb25zICkgKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50KCBvcHRpb25zICkge1xuXHRlbnN1cmVSZWFjdCggXCJjb21wb25lbnRcIiApO1xuXHRjb25zdCBvcHQgPSB7XG5cdFx0bWl4aW5zOiBbIGFjdGlvbkNyZWF0b3JSZWFjdE1peGluIF0uY29uY2F0KCBvcHRpb25zLm1peGlucyB8fCBbXSApXG5cdH07XG5cdGRlbGV0ZSBvcHRpb25zLm1peGlucztcblx0cmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKCBPYmplY3QuYXNzaWduKCBvcHQsIG9wdGlvbnMgKSApO1xufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAoIG1ldGhvZCApID0+IG1ldGhvZC5jYWxsKCB0aGlzICkgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oIGNvbnRleHQsIC4uLm1peGlucyApIHtcblx0aWYgKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgc3RvcmVNaXhpbiwgYWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBteG4gKSA9PiB7XG5cdFx0aWYgKCB0eXBlb2YgbXhuID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRteG4gPSBteG4oKTtcblx0XHR9XG5cdFx0aWYgKCBteG4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBteG4ubWl4aW4gKTtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgbXhuLnNldHVwICE9PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiTHV4IG1peGlucyBzaG91bGQgaGF2ZSBhIHNldHVwIG1ldGhvZC4gRGlkIHlvdSBwZXJoYXBzIHBhc3MgeW91ciBtaXhpbnMgYWhlYWQgb2YgeW91ciB0YXJnZXQgaW5zdGFuY2U/XCIgKTtcblx0XHR9XG5cdFx0bXhuLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiAoIG14bi50ZWFyZG93biApIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBteG4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0gKTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBzdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gYWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuY29uc3QgcmVhY3RNaXhpbiA9IHtcblx0YWN0aW9uQ3JlYXRvcjogYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sXG5cdHN0b3JlOiBzdG9yZVJlYWN0TWl4aW5cbn07XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSApO1xufVxuXG5leHBvcnQge1xuXHRjb21wb25lbnQsXG5cdGNvbnRyb2xsZXJWaWV3LFxuXHRpbml0UmVhY3QsXG5cdG1peGluLFxuXHRyZWFjdE1peGluLFxuXHRhY3Rpb25MaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRwdWJsaXNoQWN0aW9uXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuaW1wb3J0IHsgc3RvcmVDaGFubmVsLCBkaXNwYXRjaGVyQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AsIGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdGNvbnN0IHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdGNvbnN0IF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHRjb25zdCBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbmV4cG9ydCB2YXIgc3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnN0IF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdGNvbnN0IHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKCB0aGlzLnN0b3JlcyB8fCB7fSApO1xuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvIHx8ICFzdG9yZXMubGlzdGVuVG8ubGVuZ3RoICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gWyBzdG9yZXMubGlzdGVuVG8gXSA6IHN0b3Jlcy5saXN0ZW5UbztcblxuXHRcdGlmICggIXN0b3Jlcy5vbkNoYW5nZSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgICk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbIGAke3N0b3JlfS5jaGFuZ2VkYCBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZSggYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIHRoaXMsIHN0b3JlICkgKTtcblx0XHR9ICk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggXCJwcmVub3RpZnlcIiwgKCBkYXRhICkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwoIHRoaXMsIGRhdGEgKSApO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICggbGV0IFsga2V5LCBzdWIgXSBvZiBlbnRyaWVzKCB0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMgKSApIHtcblx0XHRcdGxldCBzcGxpdDtcblx0XHRcdGlmICgga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxuZXhwb3J0IGNvbnN0IHN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBzdG9yZU1peGluLnNldHVwLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogc3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgZ2V0QWN0aW9uR3JvdXAsIGFjdGlvbnMgfSBmcm9tIFwiLi4vYWN0aW9uc1wiO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hBY3Rpb24oIGFjdGlvbiwgLi4uYXJncyApIHtcblx0aWYgKCBhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRhY3Rpb25zWyBhY3Rpb24gXSggLi4uYXJncyApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHthY3Rpb259J2AgKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgYWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25Hcm91cCA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSBbIHRoaXMuZ2V0QWN0aW9uR3JvdXAgXTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMgPSBbIHRoaXMuZ2V0QWN0aW9ucyBdO1xuXHRcdH1cblxuXHRcdGNvbnN0IGFkZEFjdGlvbklmTm90UHJlc2VudCA9ICggaywgdiApID0+IHtcblx0XHRcdGlmICggIXRoaXNbIGsgXSApIHtcblx0XHRcdFx0dGhpc1sgayBdID0gdjtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAuZm9yRWFjaCggKCBncm91cCApID0+IHtcblx0XHRcdGZvciAoIGxldCBbIGssIHYgXSBvZiBlbnRyaWVzKCBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSApICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGssIHYgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRpZiAoIHRoaXMuZ2V0QWN0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrZXksIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHB1Ymxpc2hBY3Rpb24oIGtleSwgLi4uYXJndW1lbnRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0cHVibGlzaEFjdGlvbjogcHVibGlzaEFjdGlvblxuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogYWN0aW9uQ3JlYXRvck1peGluLnNldHVwLFxuXHRwdWJsaXNoQWN0aW9uOiBwdWJsaXNoQWN0aW9uXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2FjdGlvbkNyZWF0b3IuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4uL2J1c1wiO1xuaW1wb3J0IHsgZW5zdXJlTHV4UHJvcCB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGVBY3Rpb25DcmVhdG9yLCBhZGRUb0FjdGlvbkdyb3VwIH0gZnJvbSBcIi4uL2FjdGlvbnNcIjtcbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25MaXN0ZW5lck1peGluKCB7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSApIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdGNvbnN0IHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoICggZGF0YSwgZW52ICkgPT4ge1xuXHRcdFx0XHRjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdO1xuXHRcdFx0XHRpZiAoIGhhbmRsZXIgKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseSggY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdGlmICggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID0gY2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKS5jb250ZXh0KCBjb250ZXh0ICk7XG5cdFx0XHRjb25zdCBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKCBoYW5kbGVycyApO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0aWYgKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0fTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9hY3Rpb25MaXN0ZW5lci5qc1xuICoqLyIsImltcG9ydCB7IHN0b3JlQ2hhbm5lbCwgZGlzcGF0Y2hlckNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSBcIi4vZGlzcGF0Y2hlclwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgbWl4aW4gfSBmcm9tIFwiLi9taXhpbnNcIjtcblxuZXhwb3J0IGNvbnN0IHN0b3JlcyA9IHt9O1xuXG5mdW5jdGlvbiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzICkge1xuXHRjb25zdCBhY3Rpb25MaXN0ID0gW107XG5cdGZvciAoIGxldCBbIGtleSwgaGFuZGxlciBdIG9mIGVudHJpZXMoIGhhbmRsZXJzICkgKSB7XG5cdFx0YWN0aW9uTGlzdC5wdXNoKCB7XG5cdFx0XHRhY3Rpb25UeXBlOiBrZXksXG5cdFx0XHR3YWl0Rm9yOiBoYW5kbGVyLndhaXRGb3IgfHwgW11cblx0XHR9ICk7XG5cdH1cblx0cmV0dXJuIGFjdGlvbkxpc3Q7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHN0b3JlICkge1xuXHRjb25zdCBuYW1lc3BhY2UgPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5uYW1lc3BhY2UgKSB8fCBzdG9yZS5uYW1lc3BhY2U7XG5cdGlmICggbmFtZXNwYWNlIGluIHN0b3JlcyApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgc3RvcmUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgYWxyZWFkeSBleGlzdHMuYCApO1xuXHR9XG5cdGlmICggIW5hbWVzcGFjZSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGEgbmFtZXNwYWNlIHZhbHVlIHByb3ZpZGVkXCIgKTtcblx0fVxuXHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYWN0aW9uIGhhbmRsZXIgbWV0aG9kcyBwcm92aWRlZFwiICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SGFuZGxlck9iamVjdCgga2V5LCBsaXN0ZW5lcnMgKSB7XG5cdHJldHVybiB7XG5cdFx0d2FpdEZvcjogW10sXG5cdFx0aGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgY2hhbmdlZCA9IDA7XG5cdFx0XHRjb25zdCBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRsaXN0ZW5lcnNbIGtleSBdLmZvckVhY2goIGZ1bmN0aW9uKCBsaXN0ZW5lciApIHtcblx0XHRcdFx0Y2hhbmdlZCArPSAoIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICkgPT09IGZhbHNlID8gMCA6IDEgKTtcblx0XHRcdH0uYmluZCggdGhpcyApICk7XG5cdFx0XHRyZXR1cm4gY2hhbmdlZCA+IDA7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVXYWl0Rm9yKCBzb3VyY2UsIGhhbmRsZXJPYmplY3QgKSB7XG5cdGlmICggc291cmNlLndhaXRGb3IgKSB7XG5cdFx0c291cmNlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdGlmICggaGFuZGxlck9iamVjdC53YWl0Rm9yLmluZGV4T2YoIGRlcCApID09PSAtMSApIHtcblx0XHRcdFx0aGFuZGxlck9iamVjdC53YWl0Rm9yLnB1c2goIGRlcCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICkge1xuXHRsaXN0ZW5lcnNbIGtleSBdID0gbGlzdGVuZXJzWyBrZXkgXSB8fCBbXTtcblx0bGlzdGVuZXJzWyBrZXkgXS5wdXNoKCBoYW5kbGVyLmhhbmRsZXIgfHwgaGFuZGxlciApO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHRpb25zICkge1xuXHRjb25zdCBsaXN0ZW5lcnMgPSB7fTtcblx0Y29uc3QgaGFuZGxlcnMgPSB7fTtcblx0Y29uc3Qgc3RhdGUgPSB7fTtcblx0Y29uc3Qgb3RoZXJPcHRzID0ge307XG5cdG9wdGlvbnMuZm9yRWFjaCggZnVuY3Rpb24oIG8gKSB7XG5cdFx0bGV0IG9wdDtcblx0XHRpZiAoIG8gKSB7XG5cdFx0XHRvcHQgPSBfLmNsb25lKCBvICk7XG5cdFx0XHRfLm1lcmdlKCBzdGF0ZSwgb3B0LnN0YXRlICk7XG5cdFx0XHRpZiAoIG9wdC5oYW5kbGVycyApIHtcblx0XHRcdFx0T2JqZWN0LmtleXMoIG9wdC5oYW5kbGVycyApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdFx0bGV0IGhhbmRsZXIgPSBvcHQuaGFuZGxlcnNbIGtleSBdO1xuXHRcdFx0XHRcdC8vIHNldCB1cCB0aGUgYWN0dWFsIGhhbmRsZXIgbWV0aG9kIHRoYXQgd2lsbCBiZSBleGVjdXRlZFxuXHRcdFx0XHRcdC8vIGFzIHRoZSBzdG9yZSBoYW5kbGVzIGEgZGlzcGF0Y2hlZCBhY3Rpb25cblx0XHRcdFx0XHRoYW5kbGVyc1sga2V5IF0gPSBoYW5kbGVyc1sga2V5IF0gfHwgZ2V0SGFuZGxlck9iamVjdCgga2V5LCBsaXN0ZW5lcnMgKTtcblx0XHRcdFx0XHQvLyBlbnN1cmUgdGhhdCB0aGUgaGFuZGxlciBkZWZpbml0aW9uIGhhcyBhIGxpc3Qgb2YgYWxsIHN0b3Jlc1xuXHRcdFx0XHRcdC8vIGJlaW5nIHdhaXRlZCB1cG9uXG5cdFx0XHRcdFx0dXBkYXRlV2FpdEZvciggaGFuZGxlciwgaGFuZGxlcnNbIGtleSBdICk7XG5cdFx0XHRcdFx0Ly8gQWRkIHRoZSBvcmlnaW5hbCBoYW5kbGVyIG1ldGhvZChzKSB0byB0aGUgbGlzdGVuZXJzIHF1ZXVlXG5cdFx0XHRcdFx0YWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0XHRcdF8ubWVyZ2UoIG90aGVyT3B0cywgb3B0ICk7XG5cdFx0fVxuXHR9ICk7XG5cdHJldHVybiBbIHN0YXRlLCBoYW5kbGVycywgb3RoZXJPcHRzIF07XG59XG5cbmV4cG9ydCBjbGFzcyBTdG9yZSB7XG5cblx0Y29uc3RydWN0b3IoIC4uLm9wdCApIHtcblx0XHRsZXQgWyBzdGF0ZSwgaGFuZGxlcnMsIG9wdGlvbnMgXSA9IHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdCApO1xuXHRcdGVuc3VyZVN0b3JlT3B0aW9ucyggb3B0aW9ucywgaGFuZGxlcnMsIHRoaXMgKTtcblx0XHRjb25zdCBuYW1lc3BhY2UgPSBvcHRpb25zLm5hbWVzcGFjZSB8fCB0aGlzLm5hbWVzcGFjZTtcblx0XHRPYmplY3QuYXNzaWduKCB0aGlzLCBvcHRpb25zICk7XG5cdFx0c3RvcmVzWyBuYW1lc3BhY2UgXSA9IHRoaXM7XG5cdFx0bGV0IGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdGF0ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5zZXRTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmICggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJzZXRTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uKCBuZXdTdGF0ZSApIHtcblx0XHRcdGlmICggIWluRGlzcGF0Y2ggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJyZXBsYWNlU3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0Ly8gd2UgcHJlc2VydmUgdGhlIHVuZGVybHlpbmcgc3RhdGUgcmVmLCBidXQgY2xlYXIgaXRcblx0XHRcdE9iamVjdC5rZXlzKCBzdGF0ZSApLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGRlbGV0ZSBzdGF0ZVsga2V5IF07XG5cdFx0XHR9ICk7XG5cdFx0XHRzdGF0ZSA9IE9iamVjdC5hc3NpZ24oIHN0YXRlLCBuZXdTdGF0ZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLmZsdXNoID0gZnVuY3Rpb24gZmx1c2goKSB7XG5cdFx0XHRpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0XHRpZiAoIHRoaXMuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRcdHN0b3JlQ2hhbm5lbC5wdWJsaXNoKCBgJHt0aGlzLm5hbWVzcGFjZX0uY2hhbmdlZGAgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bWl4aW4oIHRoaXMsIG1peGluLmFjdGlvbkxpc3RlbmVyKCB7XG5cdFx0XHRjb250ZXh0OiB0aGlzLFxuXHRcdFx0Y2hhbm5lbDogZGlzcGF0Y2hlckNoYW5uZWwsXG5cdFx0XHR0b3BpYzogYCR7bmFtZXNwYWNlfS5oYW5kbGUuKmAsXG5cdFx0XHRoYW5kbGVyczogaGFuZGxlcnMsXG5cdFx0XHRoYW5kbGVyRm46IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0XHRpZiAoIGhhbmRsZXJzLmhhc093blByb3BlcnR5KCBkYXRhLmFjdGlvblR5cGUgKSApIHtcblx0XHRcdFx0XHRpbkRpc3BhdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHR2YXIgcmVzID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdLmhhbmRsZXIuYXBwbHkoIHRoaXMsIGRhdGEuYWN0aW9uQXJncy5jb25jYXQoIGRhdGEuZGVwcyApICk7XG5cdFx0XHRcdFx0dGhpcy5oYXNDaGFuZ2VkID0gKCByZXMgPT09IGZhbHNlICkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdFx0XHRcdGAke3RoaXMubmFtZXNwYWNlfS5oYW5kbGVkLiR7ZGF0YS5hY3Rpb25UeXBlfWAsXG5cdFx0XHRcdFx0XHR7IGhhc0NoYW5nZWQ6IHRoaXMuaGFzQ2hhbmdlZCwgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSB9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fS5iaW5kKCB0aGlzIClcblx0XHR9ICkgKTtcblxuXHRcdHRoaXMuX19zdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRub3RpZnk6IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggYG5vdGlmeWAsICgpID0+IHRoaXMuZmx1c2goKSApXG5cdFx0XHRcdFx0LmNvbnN0cmFpbnQoICgpID0+IGluRGlzcGF0Y2ggKVxuXHRcdH07XG5cblx0XHRkaXNwYXRjaGVyLnJlZ2lzdGVyU3RvcmUoXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YWN0aW9uczogYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIE5lZWQgdG8gYnVpbGQgaW4gYmVoYXZpb3IgdG8gcmVtb3ZlIHRoaXMgc3RvcmVcblx0Ly8gZnJvbSB0aGUgZGlzcGF0Y2hlcidzIGFjdGlvbk1hcCBhcyB3ZWxsIVxuXHRkaXNwb3NlKCkge1xuXHRcdC8qZXNsaW50LWRpc2FibGUgKi9cblx0XHRmb3IgKCBsZXQgWyBrLCBzdWJzY3JpcHRpb24gXSBvZiBlbnRyaWVzKCB0aGlzLl9fc3Vic2NyaXB0aW9uICkgKSB7XG5cdFx0XHRzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdFx0Lyplc2xpbnQtZW5hYmxlICovXG5cdFx0ZGVsZXRlIHN0b3Jlc1sgdGhpcy5uYW1lc3BhY2UgXTtcblx0XHRkaXNwYXRjaGVyLnJlbW92ZVN0b3JlKCB0aGlzLm5hbWVzcGFjZSApO1xuXHRcdHRoaXMubHV4Q2xlYW51cCgpO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRzdG9yZXNbIG5hbWVzcGFjZSBdLmRpc3Bvc2UoKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3N0b3JlLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBkaXNwYXRjaGVyQ2hhbm5lbCwgYWN0aW9uQ2hhbm5lbCB9IGZyb20gXCIuL2J1c1wiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgbWFjaGluYSBmcm9tIFwibWFjaGluYVwiO1xuXG5mdW5jdGlvbiBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIGdlbiwgYWN0aW9uVHlwZSwgbmFtZXNwYWNlcyApIHtcblx0bGV0IGNhbGNkR2VuID0gZ2VuO1xuXHRjb25zdCBfbmFtZXNwYWNlcyA9IG5hbWVzcGFjZXMgfHwgW107XG5cdGlmICggX25hbWVzcGFjZXMuaW5kZXhPZiggc3RvcmUubmFtZXNwYWNlICkgPiAtMSApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIGZvciB0aGUgXCIke3N0b3JlLm5hbWVzcGFjZX1cIiBzdG9yZSB3aGVuIHBhcnRpY2lwYXRpbmcgaW4gdGhlIFwiJHthY3Rpb25UeXBlfVwiIGFjdGlvbi5gICk7XG5cdH1cblx0aWYgKCBzdG9yZS53YWl0Rm9yICYmIHN0b3JlLndhaXRGb3IubGVuZ3RoICkge1xuXHRcdHN0b3JlLndhaXRGb3IuZm9yRWFjaCggZnVuY3Rpb24oIGRlcCApIHtcblx0XHRcdGNvbnN0IGRlcFN0b3JlID0gbG9va3VwWyBkZXAgXTtcblx0XHRcdGlmICggZGVwU3RvcmUgKSB7XG5cdFx0XHRcdF9uYW1lc3BhY2VzLnB1c2goIHN0b3JlLm5hbWVzcGFjZSApO1xuXHRcdFx0XHRjb25zdCB0aGlzR2VuID0gY2FsY3VsYXRlR2VuKCBkZXBTdG9yZSwgbG9va3VwLCBnZW4gKyAxLCBhY3Rpb25UeXBlLCBfbmFtZXNwYWNlcyApO1xuXHRcdFx0XHRpZiAoIHRoaXNHZW4gPiBjYWxjZEdlbiApIHtcblx0XHRcdFx0XHRjYWxjZEdlbiA9IHRoaXNHZW47XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybiggYFRoZSBcIiR7YWN0aW9uVHlwZX1cIiBhY3Rpb24gaW4gdGhlIFwiJHtzdG9yZS5uYW1lc3BhY2V9XCIgc3RvcmUgd2FpdHMgZm9yIFwiJHtkZXB9XCIgYnV0IGEgc3RvcmUgd2l0aCB0aGF0IG5hbWVzcGFjZSBkb2VzIG5vdCBwYXJ0aWNpcGF0ZSBpbiB0aGlzIGFjdGlvbi5gICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBjYWxjZEdlbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlICkge1xuXHRjb25zdCB0cmVlID0gW107XG5cdGNvbnN0IGxvb2t1cCA9IHt9O1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IGxvb2t1cFsgc3RvcmUubmFtZXNwYWNlIF0gPSBzdG9yZSApO1xuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHN0b3JlLmdlbiA9IGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgMCwgYWN0aW9uVHlwZSApICk7XG5cdC8qZXNsaW50LWRpc2FibGUgKi9cblx0Zm9yICggbGV0IFsga2V5LCBpdGVtIF0gb2YgZW50cmllcyggbG9va3VwICkgKSB7XG5cdFx0dHJlZVsgaXRlbS5nZW4gXSA9IHRyZWVbIGl0ZW0uZ2VuIF0gfHwgW107XG5cdFx0dHJlZVsgaXRlbS5nZW4gXS5wdXNoKCBpdGVtICk7XG5cdH1cblx0Lyplc2xpbnQtZW5hYmxlICovXG5cdHJldHVybiB0cmVlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzR2VuZXJhdGlvbiggZ2VuZXJhdGlvbiwgYWN0aW9uICkge1xuXHRnZW5lcmF0aW9uLm1hcCggKCBzdG9yZSApID0+IHtcblx0XHRjb25zdCBkYXRhID0gT2JqZWN0LmFzc2lnbigge1xuXHRcdFx0ZGVwczogXy5waWNrKCB0aGlzLnN0b3Jlcywgc3RvcmUud2FpdEZvciApXG5cdFx0fSwgYWN0aW9uICk7XG5cdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaChcblx0XHRcdGAke3N0b3JlLm5hbWVzcGFjZX0uaGFuZGxlLiR7YWN0aW9uLmFjdGlvblR5cGV9YCxcblx0XHRcdGRhdGFcblx0XHQpO1xuXHR9ICk7XG59XG5cbmNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBtYWNoaW5hLkJlaGF2aW9yYWxGc20ge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigge1xuXHRcdFx0aW5pdGlhbFN0YXRlOiBcInJlYWR5XCIsXG5cdFx0XHRhY3Rpb25NYXA6IHt9LFxuXHRcdFx0c3RhdGVzOiB7XG5cdFx0XHRcdHJlYWR5OiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uZGlzcGF0Y2hcIjogXCJkaXNwYXRjaGluZ1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BhdGNoaW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSBsdXhBY3Rpb247XG5cdFx0XHRcdFx0XHRpZiAoIGx1eEFjdGlvbi5nZW5lcmF0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAoIHZhciBnZW5lcmF0aW9uIG9mIGx1eEFjdGlvbi5nZW5lcmF0aW9ucyApIHtcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzR2VuZXJhdGlvbi5jYWxsKCBsdXhBY3Rpb24sIGdlbmVyYXRpb24sIGx1eEFjdGlvbi5hY3Rpb24gKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RpZnlpbmdcIiApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aGFuZGxlZFwiICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5oYW5kbGVkXCI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24sIGRhdGEgKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGRhdGEuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0XHRcdFx0bHV4QWN0aW9uLnVwZGF0ZWQucHVzaCggZGF0YS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF9vbkV4aXQ6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRpZiAoIGx1eEFjdGlvbi51cGRhdGVkLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJwcmVub3RpZnlcIiwgeyBzdG9yZXM6IGx1eEFjdGlvbi51cGRhdGVkIH0gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGlmeWluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwucHVibGlzaCggXCJub3RpZnlcIiwge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb246IGx1eEFjdGlvbi5hY3Rpb25cblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vdGhhbmRsZWQ6IHt9XG5cdFx0XHR9LFxuXHRcdFx0Z2V0U3RvcmVzSGFuZGxpbmcoIGFjdGlvblR5cGUgKSB7XG5cdFx0XHRcdGNvbnN0IHN0b3JlcyA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25UeXBlIF0gfHwgW107XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0c3RvcmVzLFxuXHRcdFx0XHRcdGdlbmVyYXRpb25zOiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0XHR0aGlzLmNyZWF0ZVN1YnNjcmliZXJzKCk7XG5cdH1cblxuXHRoYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApIHtcblx0XHRjb25zdCBsdXhBY3Rpb24gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0eyBhY3Rpb246IGRhdGEsIGdlbmVyYXRpb25JbmRleDogMCwgdXBkYXRlZDogW10gfSxcblx0XHRcdHRoaXMuZ2V0U3RvcmVzSGFuZGxpbmcoIGRhdGEuYWN0aW9uVHlwZSApXG5cdFx0KTtcblx0XHR0aGlzLmhhbmRsZSggbHV4QWN0aW9uLCBcImFjdGlvbi5kaXNwYXRjaFwiICk7XG5cdH1cblxuXHRyZWdpc3RlclN0b3JlKCBzdG9yZU1ldGEgKSB7XG5cdFx0Zm9yICggbGV0IGFjdGlvbkRlZiBvZiBzdG9yZU1ldGEuYWN0aW9ucyApIHtcblx0XHRcdGxldCBhY3Rpb247XG5cdFx0XHRjb25zdCBhY3Rpb25OYW1lID0gYWN0aW9uRGVmLmFjdGlvblR5cGU7XG5cdFx0XHRjb25zdCBhY3Rpb25NZXRhID0ge1xuXHRcdFx0XHRuYW1lc3BhY2U6IHN0b3JlTWV0YS5uYW1lc3BhY2UsXG5cdFx0XHRcdHdhaXRGb3I6IGFjdGlvbkRlZi53YWl0Rm9yXG5cdFx0XHR9O1xuXHRcdFx0YWN0aW9uID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gfHwgW107XG5cdFx0XHRhY3Rpb24ucHVzaCggYWN0aW9uTWV0YSApO1xuXHRcdH1cblx0fVxuXG5cdHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdFx0ZnVuY3Rpb24gaXNUaGlzTmFtZVNwYWNlKCBtZXRhICkge1xuXHRcdFx0cmV0dXJuIG1ldGEubmFtZXNwYWNlID09PSBuYW1lc3BhY2U7XG5cdFx0fVxuXHRcdC8qZXNsaW50LWRpc2FibGUgKi9cblx0XHRmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW50cmllcyggdGhpcy5hY3Rpb25NYXAgKSApIHtcblx0XHRcdGxldCBpZHggPSB2LmZpbmRJbmRleCggaXNUaGlzTmFtZVNwYWNlICk7XG5cdFx0XHRpZiAoIGlkeCAhPT0gLTEgKSB7XG5cdFx0XHRcdHYuc3BsaWNlKCBpZHgsIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Lyplc2xpbnQtZW5hYmxlICovXG5cdH1cblxuXHRjcmVhdGVTdWJzY3JpYmVycygpIHtcblx0XHRpZiAoICF0aGlzLl9fc3Vic2NyaXB0aW9ucyB8fCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiZXhlY3V0ZS4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdFx0KSxcblx0XHRcdFx0ZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0XHQoIGRhdGEgKSA9PiB0aGlzLmhhbmRsZSggdGhpcy5hY3Rpb25Db250ZXh0LCBcImFjdGlvbi5oYW5kbGVkXCIsIGRhdGEgKVxuXHRcdFx0XHQpLmNvbnN0cmFpbnQoICgpID0+ICEhdGhpcy5hY3Rpb25Db250ZXh0IClcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHRpZiAoIHRoaXMuX19zdWJzY3JpcHRpb25zICkge1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMuZm9yRWFjaCggKCBzdWJzY3JpcHRpb24gKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSApO1xuXHRcdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgRGlzcGF0Y2hlcigpO1xuXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9kaXNwYXRjaGVyLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzEyX187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcIm1hY2hpbmFcIlxuICoqIG1vZHVsZSBpZCA9IDEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5cbmV4cG9ydCBjb25zdCBleHRlbmQgPSBmdW5jdGlvbiBleHRlbmQoIC4uLm9wdGlvbnMgKSB7XG5cdGNvbnN0IHBhcmVudCA9IHRoaXM7XG5cdGxldCBzdG9yZTsgLy8gcGxhY2Vob2xkZXIgZm9yIGluc3RhbmNlIGNvbnN0cnVjdG9yXG5cdGNvbnN0IEN0b3IgPSBmdW5jdGlvbigpIHt9OyAvLyBwbGFjZWhvbGRlciBjdG9yIGZ1bmN0aW9uIHVzZWQgdG8gaW5zZXJ0IGxldmVsIGluIHByb3RvdHlwZSBjaGFpblxuXG5cdC8vIEZpcnN0IC0gc2VwYXJhdGUgbWl4aW5zIGZyb20gcHJvdG90eXBlIHByb3BzXG5cdGNvbnN0IG1peGlucyA9IFtdO1xuXHRmb3IgKCBsZXQgb3B0IG9mIG9wdGlvbnMgKSB7XG5cdFx0bWl4aW5zLnB1c2goIF8ucGljayggb3B0LCBbIFwiaGFuZGxlcnNcIiwgXCJzdGF0ZVwiIF0gKSApO1xuXHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0ZGVsZXRlIG9wdC5zdGF0ZTtcblx0fVxuXG5cdGNvbnN0IHByb3RvUHJvcHMgPSBfLm1lcmdlLmFwcGx5KCB0aGlzLCBbIHt9IF0uY29uY2F0KCBvcHRpb25zICkgKTtcblxuXHQvLyBUaGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHRoZSBuZXcgc3ViY2xhc3MgaXMgZWl0aGVyIGRlZmluZWQgYnkgeW91XG5cdC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuXHQvLyBieSB1cyB0byBzaW1wbHkgY2FsbCB0aGUgcGFyZW50J3MgY29uc3RydWN0b3IuXG5cdGlmICggcHJvdG9Qcm9wcyAmJiBwcm90b1Byb3BzLmhhc093blByb3BlcnR5KCBcImNvbnN0cnVjdG9yXCIgKSApIHtcblx0XHRzdG9yZSA9IHByb3RvUHJvcHMuY29uc3RydWN0b3I7XG5cdH0gZWxzZSB7XG5cdFx0c3RvcmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGNvbnN0IGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGFyZ3NbIDAgXSA9IGFyZ3NbIDAgXSB8fCB7fTtcblx0XHRcdHBhcmVudC5hcHBseSggdGhpcywgc3RvcmUubWl4aW5zLmNvbmNhdCggYXJncyApICk7XG5cdFx0fTtcblx0fVxuXG5cdHN0b3JlLm1peGlucyA9IG1peGlucztcblxuXHQvLyBJbmhlcml0IGNsYXNzIChzdGF0aWMpIHByb3BlcnRpZXMgZnJvbSBwYXJlbnQuXG5cdF8ubWVyZ2UoIHN0b3JlLCBwYXJlbnQgKTtcblxuXHQvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuXHQvLyBgcGFyZW50YCdzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuXHRDdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG5cdHN0b3JlLnByb3RvdHlwZSA9IG5ldyBDdG9yKCk7XG5cblx0Ly8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG5cdC8vIGlmIHN1cHBsaWVkLlxuXHRpZiAoIHByb3RvUHJvcHMgKSB7XG5cdFx0Xy5leHRlbmQoIHN0b3JlLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyApO1xuXHR9XG5cblx0Ly8gQ29ycmVjdGx5IHNldCBjaGlsZCdzIGBwcm90b3R5cGUuY29uc3RydWN0b3JgLlxuXHRzdG9yZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdG9yZTtcblxuXHQvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkIGxhdGVyLlxuXHRzdG9yZS5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlO1xuXHRyZXR1cm4gc3RvcmU7XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXh0ZW5kLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==