/*!
 *  * lux.js - Flux-based architecture for using ReactJS at LeanKit
 *  * Author: Jim Cowart
 *  * Version: v0.8.0
 *  * Url: https://github.com/LeanKit-Labs/lux.js
 *  * License(s): 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"), require("postal"), require("react"), require("machina"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash", "postal", "react", "machina"], factory);
	else if(typeof exports === 'object')
		exports["lux"] = factory(require("lodash"), require("postal"), require("react"), require("machina"));
	else
		root["lux"] = factory(root["_"], root["postal"], root["React"], root["machina"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_14__) {
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
	
	var _store = __webpack_require__(12);
	
	var _extend = __webpack_require__(15);
	
	var _dispatcher = __webpack_require__(13);
	
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
		customActionCreator: _actions.customActionCreator,
		dispatcher: _dispatcher2["default"],
		getActionGroup: _actions.getActionGroup,
		actionCreatorListener: _mixins.actionCreatorListener,
		actionCreator: _mixins.actionCreator,
		actionListener: _mixins.actionListener,
		mixin: _mixins.mixin,
		reactMixin: _mixins.reactMixin,
		removeStore: _store.removeStore,
		Store: _store.Store,
		stores: _store.stores,
		utils: _utils2["default"],
		LuxContainer: _mixins.LuxContainer
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
	
	// This method is deprecated, but will remain as
	// long as the print utils need it.
	/* istanbul ignore next */
	
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
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _store = __webpack_require__(7);
	
	var _actionCreator = __webpack_require__(8);
	
	var _actionListener = __webpack_require__(9);
	
	var _luxContainer = __webpack_require__(10);
	
	var _luxContainer2 = _interopRequireDefault(_luxContainer);
	
	/*********************************************
	*   Generalized Mixin Behavior for non-lux   *
	**********************************************/
	"use strict";
	
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
	
	exports.mixin = mixin;
	exports.reactMixin = reactMixin;
	exports.actionListener = actionListener;
	exports.actionCreator = actionCreator;
	exports.actionCreatorListener = actionCreatorListener;
	exports.publishAction = _actionCreator.publishAction;
	exports.LuxContainer = _luxContainer2["default"];

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
	
	// istanbul ignore next
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	// istanbul ignore next
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	// istanbul ignore next
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// istanbul ignore next
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(11);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _utils = __webpack_require__(1);
	
	var _bus = __webpack_require__(4);
	
	var _lodash = __webpack_require__(3);
	
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
				this.setState(this.props.onStoreChange(this.props, payload));
			}
		}
	}
	
	function handlePreNotify(data) {
		// istanbul ignore next
	
		var _this = this;
	
		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this.props.stores.indexOf(item) > -1;
		});
	}
	
	var LuxContainer = (function (_React$Component) {
		_inherits(LuxContainer, _React$Component);
	
		function LuxContainer(props) {
			_classCallCheck(this, LuxContainer);
	
			_get(Object.getPrototypeOf(LuxContainer.prototype), "constructor", this).call(this, props);
			this.setup();
			this.componentWillUnmount.bind(this);
		}
	
		_createClass(LuxContainer, [{
			key: "setup",
			value: function setup() {
				// istanbul ignore next
	
				var _this2 = this;
	
				var __lux = (0, _utils.ensureLuxProp)(this);
	
				__lux.waitFor = [];
				__lux.heardFrom = [];
	
				this.props.stores.forEach(function (store) {
					__lux.subscriptions[store + ".changed"] = _bus.storeChannel.subscribe(store + ".changed", function () {
						return gateKeeper.call(_this2, store);
					});
				});
	
				__lux.subscriptions.prenotify = _bus.dispatcherChannel.subscribe("prenotify", function (data) {
					return handlePreNotify.call(_this2, data);
				});
			}
		}, {
			key: "componentWillUnmount",
			value: function componentWillUnmount() {
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
			}
		}, {
			key: "render",
			value: function render() {
				return _react2["default"].cloneElement(this.props.children, Object.assign({}, (0, _lodash.omit)(this.props, "children", "onStoreChange", "stores"), this.state));
			}
		}]);
	
		return LuxContainer;
	})(_react2["default"].Component);
	
	exports["default"] = LuxContainer;
	
	LuxContainer.propTypes = {
		onStoreChange: _react2["default"].PropTypes.func.isRequired,
		stores: _react2["default"].PropTypes.arrayOf(_react2["default"].PropTypes.string).isRequired,
		children: _react2["default"].PropTypes.element.isRequired
	};
	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ },
/* 12 */
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
	
	var _dispatcher = __webpack_require__(13);
	
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
/* 13 */
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
	
	var _machina = __webpack_require__(14);
	
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
/* 14 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ },
/* 15 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBiNzAxYTcxMzI3NzkyYzg4Njc2YyIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvbHV4Q29udGFpbmVyLmpzIiwid2VicGFjazovLy9leHRlcm5hbCB7XCJyb290XCI6XCJSZWFjdFwiLFwiY29tbW9uanNcIjpcInJlYWN0XCIsXCJjb21tb25qczJcIjpcInJlYWN0XCIsXCJhbWRcIjpcInJlYWN0XCJ9Iiwid2VicGFjazovLy8uL3NyYy9zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtYWNoaW5hXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNW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RSxDQUFDOzs7O0FBSXpCLE1BQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNsQyxPQUFLLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Ozs7QUFJN0IsTUFBSyxVQUFVLEVBQUc7QUFDakIsdUJBQUUsTUFBTSxDQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFFLENBQUM7R0FDeEM7OztBQUdELE9BQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzs7O0FBR3BDLE9BQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNuQyxTQUFPLEtBQUssQ0FBQztFQUNiLENBQUMiLCJmaWxlIjoibHV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwibG9kYXNoXCIpLCByZXF1aXJlKFwicG9zdGFsXCIpLCByZXF1aXJlKFwicmVhY3RcIiksIHJlcXVpcmUoXCJtYWNoaW5hXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcImxvZGFzaFwiLCBcInBvc3RhbFwiLCBcInJlYWN0XCIsIFwibWFjaGluYVwiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJsdXhcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJwb3N0YWxcIiksIHJlcXVpcmUoXCJyZWFjdFwiKSwgcmVxdWlyZShcIm1hY2hpbmFcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImx1eFwiXSA9IGZhY3Rvcnkocm9vdFtcIl9cIl0sIHJvb3RbXCJwb3N0YWxcIl0sIHJvb3RbXCJSZWFjdFwiXSwgcm9vdFtcIm1hY2hpbmFcIl0pO1xufSkodGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8zX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzExX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTRfXykge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgYjcwMWE3MTMyNzc5MmM4ODY3NmNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmICggISggdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IGdsb2JhbCApLl9iYWJlbFBvbHlmaWxsICkge1xuXHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaW5jbHVkZSB0aGUgYmFiZWwgcG9seWZpbGwgb24geW91ciBwYWdlIGJlZm9yZSBsdXggaXMgbG9hZGVkLiBTZWUgaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvdXNhZ2UvcG9seWZpbGwvIGZvciBtb3JlIGRldGFpbHMuXCIgKTtcbn1cblxuaW1wb3J0IHV0aWxzIGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB7XG5cdGdldEFjdGlvbkdyb3VwLFxuXHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25zXG59IGZyb20gXCIuL2FjdGlvbnNcIjtcblxuaW1wb3J0IHtcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdGFjdGlvbkxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdHB1Ymxpc2hBY3Rpb24sXG5cdEx1eENvbnRhaW5lclxufSBmcm9tIFwiLi9taXhpbnNcIjtcblxuaW1wb3J0IHsgU3RvcmUsIHN0b3JlcywgcmVtb3ZlU3RvcmUgfSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSBcIi4vZXh0ZW5kXCI7XG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRhY3Rpb25zLFxuXHRwdWJsaXNoQWN0aW9uLFxuXHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRkaXNwYXRjaGVyLFxuXHRnZXRBY3Rpb25Hcm91cCxcblx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25MaXN0ZW5lcixcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdHJlbW92ZVN0b3JlLFxuXHRTdG9yZSxcblx0c3RvcmVzLFxuXHR1dGlscyxcblx0THV4Q29udGFpbmVyXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbHV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRjb25zdCBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0Lyplc2xpbnQtZGlzYWJsZSAqL1xuXHRjb25zdCBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9ICggX19sdXguY2xlYW51cCB8fCBbXSApO1xuXHRjb25zdCBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9ICggX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSApO1xuXHQvKmVzbGludC1lbmFibGUgKi9cblx0cmV0dXJuIF9fbHV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIGVudHJpZXMoIG9iaiApIHtcblx0aWYgKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0b2JqID0ge307XG5cdH1cblx0Zm9yICggbGV0IGsgb2YgT2JqZWN0LmtleXMoIG9iaiApICkge1xuXHRcdHlpZWxkIFsgaywgb2JqWyBrIF0gXTtcblx0fVxufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMuanNcbiAqKi8iLCJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmV4cG9ydCBjb25zdCBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuZXhwb3J0IGNvbnN0IGFjdGlvbkdyb3VwcyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdCApIHtcblx0YWN0aW9uTGlzdCA9ICggdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgKSA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggIWFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdFx0YWN0aW9uc1sgYWN0aW9uIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuLy8gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZCwgYnV0IHdpbGwgcmVtYWluIGFzXG4vLyBsb25nIGFzIHRoZSBwcmludCB1dGlscyBuZWVkIGl0LlxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHRjb25zdCBncm91cHMgPSBbXTtcblx0Zm9yICggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiAoIGxpc3QuaW5kZXhPZiggYWN0aW9uTmFtZSApID49IDAgKSB7XG5cdFx0XHRncm91cHMucHVzaCggZ3JvdXAgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0T2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKCBncm91cE5hbWUsIGFjdGlvbkxpc3QgKSB7XG5cdGxldCBncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF07XG5cdGlmICggIWdyb3VwICkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0Y29uc3QgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiAoIGRpZmYubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBkbyBub3QgZXhpc3Q6ICR7ZGlmZi5qb2luKCBcIiwgXCIgKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9ICk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hY3Rpb25zLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIHtcInJvb3RcIjpcIl9cIixcImNvbW1vbmpzXCI6XCJsb2Rhc2hcIixcImNvbW1vbmpzMlwiOlwibG9kYXNoXCIsXCJhbWRcIjpcImxvZGFzaFwifVxuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBwb3N0YWwgZnJvbSBcInBvc3RhbFwiO1xuXG5jb25zdCBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmFjdGlvblwiICk7XG5jb25zdCBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguc3RvcmVcIiApO1xuY29uc3QgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguZGlzcGF0Y2hlclwiICk7XG5cbmV4cG9ydCB7XG5cdGFjdGlvbkNoYW5uZWwsXG5cdHN0b3JlQ2hhbm5lbCxcblx0ZGlzcGF0Y2hlckNoYW5uZWwsXG5cdHBvc3RhbFxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2J1cy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV81X187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInBvc3RhbFwiXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7IHN0b3JlTWl4aW4sIHN0b3JlUmVhY3RNaXhpbiB9IGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBhY3Rpb25DcmVhdG9yTWl4aW4sIGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLCBwdWJsaXNoQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9uQ3JlYXRvclwiO1xuaW1wb3J0IHsgYWN0aW9uTGlzdGVuZXJNaXhpbiB9IGZyb20gXCIuL2FjdGlvbkxpc3RlbmVyXCI7XG5pbXBvcnQgTHV4Q29udGFpbmVyIGZyb20gXCIuL2x1eENvbnRhaW5lclwiO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAoIG1ldGhvZCApID0+IG1ldGhvZC5jYWxsKCB0aGlzICkgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oIGNvbnRleHQsIC4uLm1peGlucyApIHtcblx0aWYgKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgc3RvcmVNaXhpbiwgYWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBteG4gKSA9PiB7XG5cdFx0aWYgKCB0eXBlb2YgbXhuID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRteG4gPSBteG4oKTtcblx0XHR9XG5cdFx0aWYgKCBteG4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBteG4ubWl4aW4gKTtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgbXhuLnNldHVwICE9PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiTHV4IG1peGlucyBzaG91bGQgaGF2ZSBhIHNldHVwIG1ldGhvZC4gRGlkIHlvdSBwZXJoYXBzIHBhc3MgeW91ciBtaXhpbnMgYWhlYWQgb2YgeW91ciB0YXJnZXQgaW5zdGFuY2U/XCIgKTtcblx0XHR9XG5cdFx0bXhuLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiAoIG14bi50ZWFyZG93biApIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBteG4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0gKTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBzdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gYWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuY29uc3QgcmVhY3RNaXhpbiA9IHtcblx0YWN0aW9uQ3JlYXRvcjogYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sXG5cdHN0b3JlOiBzdG9yZVJlYWN0TWl4aW5cbn07XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSApO1xufVxuXG5leHBvcnQge1xuXHRtaXhpbixcblx0cmVhY3RNaXhpbixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdGFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0cHVibGlzaEFjdGlvbixcblx0THV4Q29udGFpbmVyXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuaW1wb3J0IHsgc3RvcmVDaGFubmVsLCBkaXNwYXRjaGVyQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AsIGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdGNvbnN0IHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdGNvbnN0IF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHRjb25zdCBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxuZXhwb3J0IHZhciBzdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCB0aGlzICk7XG5cdFx0Y29uc3Qgc3RvcmVzID0gdGhpcy5zdG9yZXMgPSAoIHRoaXMuc3RvcmVzIHx8IHt9ICk7XG5cblx0XHRpZiAoICFzdG9yZXMubGlzdGVuVG8gfHwgIXN0b3Jlcy5saXN0ZW5Uby5sZW5ndGggKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBsaXN0ZW5UbyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHN0b3JlIG5hbWVzcGFjZWAgKTtcblx0XHR9XG5cblx0XHRjb25zdCBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0gKTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggdGhpcywgZGF0YSApICk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKCBsZXQgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0bGV0IHNwbGl0O1xuXHRcdFx0aWYgKCBrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCAoIHNwbGl0ID0ga2V5LnNwbGl0KCBcIi5cIiApICkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkgKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IHN0b3JlTWl4aW4uc2V0dXAsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBzdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL3N0b3JlLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25Hcm91cCwgYWN0aW9ucyB9IGZyb20gXCIuLi9hY3Rpb25zXCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gQ3JlYXRvciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaEFjdGlvbiggYWN0aW9uLCAuLi5hcmdzICkge1xuXHRpZiAoIGFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdGFjdGlvbnNbIGFjdGlvbiBdKCAuLi5hcmdzICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2FjdGlvbn0nYCApO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBhY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0Y29uc3QgYWRkQWN0aW9uSWZOb3RQcmVzZW50ID0gKCBrLCB2ICkgPT4ge1xuXHRcdFx0aWYgKCAhdGhpc1sgayBdICkge1xuXHRcdFx0XHR0aGlzWyBrIF0gPSB2O1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKCAoIGdyb3VwICkgPT4ge1xuXHRcdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIGdldEFjdGlvbkdyb3VwKCBncm91cCApICkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCggaywgdiApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGlmICggdGhpcy5nZXRBY3Rpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGtleSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cHVibGlzaEFjdGlvbigga2V5LCAuLi5hcmd1bWVudHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fSApO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRwdWJsaXNoQWN0aW9uOiBwdWJsaXNoQWN0aW9uXG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBhY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBhY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXAsXG5cdHB1Ymxpc2hBY3Rpb246IHB1Ymxpc2hBY3Rpb25cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgIEFjdGlvbiBMaXN0ZW5lciBNaXhpbiAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmltcG9ydCB7IGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi4vYnVzXCI7XG5pbXBvcnQgeyBlbnN1cmVMdXhQcm9wIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IsIGFkZFRvQWN0aW9uR3JvdXAgfSBmcm9tIFwiLi4vYWN0aW9uc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyTWl4aW4oIHsgaGFuZGxlcnMsIGhhbmRsZXJGbiwgY29udGV4dCwgY2hhbm5lbCwgdG9waWMgfSA9IHt9ICkge1xuXHRyZXR1cm4ge1xuXHRcdHNldHVwKCkge1xuXHRcdFx0Y29udGV4dCA9IGNvbnRleHQgfHwgdGhpcztcblx0XHRcdGNvbnN0IF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggY29udGV4dCApO1xuXHRcdFx0Y29uc3Qgc3VicyA9IF9fbHV4LnN1YnNjcmlwdGlvbnM7XG5cdFx0XHRoYW5kbGVycyA9IGhhbmRsZXJzIHx8IGNvbnRleHQuaGFuZGxlcnM7XG5cdFx0XHRjaGFubmVsID0gY2hhbm5lbCB8fCBhY3Rpb25DaGFubmVsO1xuXHRcdFx0dG9waWMgPSB0b3BpYyB8fCBcImV4ZWN1dGUuKlwiO1xuXHRcdFx0aGFuZGxlckZuID0gaGFuZGxlckZuIHx8ICggKCBkYXRhLCBlbnYgKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVyc1sgZGF0YS5hY3Rpb25UeXBlIF07XG5cdFx0XHRcdGlmICggaGFuZGxlciApIHtcblx0XHRcdFx0XHRoYW5kbGVyLmFwcGx5KCBjb250ZXh0LCBkYXRhLmFjdGlvbkFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGFjdGlvbiBoYW5kbGVyIGluIHRoZSBoYW5kbGVycyBwcm9wZXJ0eVwiICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBzdWJzICYmIHN1YnMuYWN0aW9uTGlzdGVuZXIgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHN1YnMuYWN0aW9uTGlzdGVuZXIgPSBjaGFubmVsLnN1YnNjcmliZSggdG9waWMsIGhhbmRsZXJGbiApLmNvbnRleHQoIGNvbnRleHQgKTtcblx0XHRcdGNvbnN0IGhhbmRsZXJLZXlzID0gT2JqZWN0LmtleXMoIGhhbmRsZXJzICk7XG5cdFx0XHRnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGhhbmRsZXJLZXlzICk7XG5cdFx0XHRpZiAoIGNvbnRleHQubmFtZXNwYWNlICkge1xuXHRcdFx0XHRhZGRUb0FjdGlvbkdyb3VwKCBjb250ZXh0Lm5hbWVzcGFjZSwgaGFuZGxlcktleXMgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRlYXJkb3duKCkge1xuXHRcdFx0dGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zLmFjdGlvbkxpc3RlbmVyLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzXG4gKiovIiwiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgZW5zdXJlTHV4UHJvcCwgZW50cmllcyB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgc3RvcmVDaGFubmVsLCBkaXNwYXRjaGVyQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IG9taXQgfSBmcm9tIFwibG9kYXNoXCI7XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoIHN0b3JlLCBkYXRhICkge1xuXHRjb25zdCBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHRjb25zdCBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0Y29uc3QgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnNldFN0YXRlKCB0aGlzLnByb3BzLm9uU3RvcmVDaGFuZ2UoIHRoaXMucHJvcHMsIHBheWxvYWQgKSApO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnByb3BzLnN0b3Jlcy5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMdXhDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cdFx0dGhpcy5zZXR1cCgpO1xuXHRcdHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQuYmluZCggdGhpcyApO1xuXHR9XG5cblx0c2V0dXAoKSB7XG5cdFx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCB0aGlzICk7XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHR0aGlzLnByb3BzLnN0b3Jlcy5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7IHN0b3JlIH0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAkeyBzdG9yZSB9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIHRoaXMsIHN0b3JlICkgKTtcblx0XHR9ICk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggXCJwcmVub3RpZnlcIiwgKCBkYXRhICkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwoIHRoaXMsIGRhdGEgKSApO1xuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQoKSB7XG5cdFx0Zm9yICggbGV0IFsga2V5LCBzdWIgXSBvZiBlbnRyaWVzKCB0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMgKSApIHtcblx0XHRcdGxldCBzcGxpdDtcblx0XHRcdGlmICgga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudCggdGhpcy5wcm9wcy5jaGlsZHJlbiwgT2JqZWN0LmFzc2lnbigge30sIG9taXQoIHRoaXMucHJvcHMsIFwiY2hpbGRyZW5cIiwgXCJvblN0b3JlQ2hhbmdlXCIsIFwic3RvcmVzXCIgKSwgdGhpcy5zdGF0ZSApICk7XG5cdH1cbn1cblxuTHV4Q29udGFpbmVyLnByb3BUeXBlcyA9IHtcblx0b25TdG9yZUNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0c3RvcmVzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXlPZiggUmVhY3QuUHJvcFR5cGVzLnN0cmluZyApLmlzUmVxdWlyZWQsXG5cdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2x1eENvbnRhaW5lci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xMV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwge1wicm9vdFwiOlwiUmVhY3RcIixcImNvbW1vbmpzXCI6XCJyZWFjdFwiLFwiY29tbW9uanMyXCI6XCJyZWFjdFwiLFwiYW1kXCI6XCJyZWFjdFwifVxuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IG1peGluIH0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmV4cG9ydCBjb25zdCBzdG9yZXMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0Y29uc3QgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCBsZXQgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0Y29uc3QgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiAoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNoYW5nZWQgPSAwO1xuXHRcdFx0Y29uc3QgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKSB7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiAoIHNvdXJjZS53YWl0Rm9yICkge1xuXHRcdHNvdXJjZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRpZiAoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0Y29uc3QgbGlzdGVuZXJzID0ge307XG5cdGNvbnN0IGhhbmRsZXJzID0ge307XG5cdGNvbnN0IHN0YXRlID0ge307XG5cdGNvbnN0IG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdGxldCBvcHQ7XG5cdFx0aWYgKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYgKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKCAuLi5vcHQgKSB7XG5cdFx0bGV0IFsgc3RhdGUsIGhhbmRsZXJzLCBvcHRpb25zIF0gPSBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHQgKTtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCB0aGlzICk7XG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdGxldCBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBtaXhpbi5hY3Rpb25MaXN0ZW5lcigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCAoKSA9PiB0aGlzLmZsdXNoKCkgKVxuXHRcdFx0XHRcdC5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoIClcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZGlzcGF0Y2hlckNoYW5uZWwsIGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IG1hY2hpbmEgZnJvbSBcIm1hY2hpbmFcIjtcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUsIG5hbWVzcGFjZXMgKSB7XG5cdGxldCBjYWxjZEdlbiA9IGdlbjtcblx0Y29uc3QgX25hbWVzcGFjZXMgPSBuYW1lc3BhY2VzIHx8IFtdO1xuXHRpZiAoIF9uYW1lc3BhY2VzLmluZGV4T2YoIHN0b3JlLm5hbWVzcGFjZSApID4gLTEgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBmb3IgdGhlIFwiJHtzdG9yZS5uYW1lc3BhY2V9XCIgc3RvcmUgd2hlbiBwYXJ0aWNpcGF0aW5nIGluIHRoZSBcIiR7YWN0aW9uVHlwZX1cIiBhY3Rpb24uYCApO1xuXHR9XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRjb25zdCBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiAoIGRlcFN0b3JlICkge1xuXHRcdFx0XHRfbmFtZXNwYWNlcy5wdXNoKCBzdG9yZS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0Y29uc3QgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSwgYWN0aW9uVHlwZSwgX25hbWVzcGFjZXMgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oIGBUaGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uIGluIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdhaXRzIGZvciBcIiR7ZGVwfVwiIGJ1dCBhIHN0b3JlIHdpdGggdGhhdCBuYW1lc3BhY2UgZG9lcyBub3QgcGFydGljaXBhdGUgaW4gdGhpcyBhY3Rpb24uYCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0Y29uc3QgdHJlZSA9IFtdO1xuXHRjb25zdCBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHQvKmVzbGludC1kaXNhYmxlICovXG5cdGZvciAoIGxldCBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0Y29uc3QgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSApO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYgKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0Y29uc3QgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIGxldCBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHRsZXQgYWN0aW9uO1xuXHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0Y29uc3QgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdGZ1bmN0aW9uIGlzVGhpc05hbWVTcGFjZSggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH1cblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHRsZXQgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYgKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0aWYgKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdCggZGF0YSwgZW52ICkgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IERpc3BhdGNoZXIoKTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZGlzcGF0Y2hlci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xNF9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJtYWNoaW5hXCJcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgY29uc3QgZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKCAuLi5vcHRpb25zICkge1xuXHRjb25zdCBwYXJlbnQgPSB0aGlzO1xuXHRsZXQgc3RvcmU7IC8vIHBsYWNlaG9sZGVyIGZvciBpbnN0YW5jZSBjb25zdHJ1Y3RvclxuXHRjb25zdCBDdG9yID0gZnVuY3Rpb24oKSB7fTsgLy8gcGxhY2Vob2xkZXIgY3RvciBmdW5jdGlvbiB1c2VkIHRvIGluc2VydCBsZXZlbCBpbiBwcm90b3R5cGUgY2hhaW5cblxuXHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRjb25zdCBtaXhpbnMgPSBbXTtcblx0Zm9yICggbGV0IG9wdCBvZiBvcHRpb25zICkge1xuXHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdH1cblxuXHRjb25zdCBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHR9IGVsc2Uge1xuXHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zdCBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdH07XG5cdH1cblxuXHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0Q3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgQ3RvcigpO1xuXG5cdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHQvLyBpZiBzdXBwbGllZC5cblx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0fVxuXG5cdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0cmV0dXJuIHN0b3JlO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V4dGVuZC5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=