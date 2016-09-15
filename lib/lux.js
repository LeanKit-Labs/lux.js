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
	
	function publishAction() {
		if (console && typeof console.log === "function") {
			console.log("lux.publishAction has been deprecated and will be removed in future releases. Please use lux.dispatch.");
		}
		_mixins.dispatch.apply(undefined, arguments);
	}
	
	_store.Store.extend = _extend.extend;
	
	exports["default"] = {
		actions: _actions.actions,
		customActionCreator: _actions.customActionCreator,
		dispatch: _mixins.dispatch,
		publishAction: publishAction,
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
	
	// This method is deprecated, but will remain as
	// long as the print utils need it.
	/* istanbul ignore next */
	
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
	
	// This method is deprecated, but will remain as
	// long as the print utils need it.
	/* istanbul ignore next */
	
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
	exports.dispatch = _actionCreator.dispatch;
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
	
	exports.dispatch = dispatch;
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
	/*********************************************
	*           Action Creator Mixin          *
	**********************************************/
	
	"use strict";
	
	function dispatch(action) {
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
						dispatch.apply(undefined, [key].concat(_slice.call(arguments)));
					});
				});
			}
		},
		mixin: {
			dispatch: dispatch
		}
	};
	
	exports.actionCreatorMixin = actionCreatorMixin;
	var actionCreatorReactMixin = {
		componentWillMount: actionCreatorMixin.setup,
		dispatch: dispatch
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
	
	var _actionCreator = __webpack_require__(8);
	
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
	
	function setupStoreListener(instance) {
		var __lux = (0, _utils.ensureLuxProp)(instance);
		__lux.waitFor = [];
		__lux.heardFrom = [];
		var stores = instance.props.stores.split(",").map(function (x) {
			return x.trim();
		});
	
		stores.forEach(function (store) {
			__lux.subscriptions[store + ".changed"] = _bus.storeChannel.subscribe(store + ".changed", function () {
				return gateKeeper.call(instance, store);
			});
		});
	
		__lux.subscriptions.prenotify = _bus.dispatcherChannel.subscribe("prenotify", function (data) {
			return handlePreNotify.call(instance, data);
		});
	}
	
	function isSyntheticEvent(e) {
		return e.hasOwnProperty("eventPhase") && e.hasOwnProperty("nativeEvent") && e.hasOwnProperty("target") && e.hasOwnProperty("type");
	}
	
	function getDefaultActionCreator(action) {
		if (Object.prototype.toString.call(action) === "[object String]") {
			return function (e) {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}
	
				if (!isSyntheticEvent(e)) {
					args.unshift(e);
				}
				_actionCreator.dispatch.apply(undefined, [action].concat(args));
			};
		}
	}
	
	function setupActionMap(instance) {
		instance.propToAction = {};
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _utils.entries)(instance.props.actions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);
	
				var childProp = _step$value[0];
				var action = _step$value[1];
	
				var actionCreator = action; // assumes function by default
				if ((0, _lodash.isString)(action)) {
					actionCreator = getDefaultActionCreator(action);
				} else if (!(0, _lodash.isFunction)(action)) {
					throw new Error("The values provided to the LuxContainer actions property must be a string or a function");
				}
				instance.propToAction[childProp] = actionCreator;
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
	
	var LuxContainer = (function (_React$Component) {
		_inherits(LuxContainer, _React$Component);
	
		function LuxContainer(props) {
			_classCallCheck(this, LuxContainer);
	
			_get(Object.getPrototypeOf(LuxContainer.prototype), "constructor", this).call(this, props);
			setupStoreListener(this);
			setupActionMap(this);
			this.componentWillUnmount.bind(this);
		}
	
		_createClass(LuxContainer, [{
			key: "componentWillUnmount",
			value: function componentWillUnmount() {
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = (0, _utils.entries)(this.__lux.subscriptions)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var _step2$value = _slicedToArray(_step2.value, 2);
	
						var key = _step2$value[0];
						var sub = _step2$value[1];
	
						var split = undefined;
						if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
							sub.unsubscribe();
						}
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
			}
		}, {
			key: "render",
			value: function render() {
				return _react2["default"].cloneElement(this.props.children, Object.assign({}, (0, _lodash.omit)(this.props, "children", "onStoreChange", "stores", "actions"), this.propToAction, this.state));
			}
		}]);
	
		return LuxContainer;
	})(_react2["default"].Component);
	
	exports["default"] = LuxContainer;
	
	LuxContainer.propTypes = {
		onStoreChange: _react2["default"].PropTypes.func,
		stores: _react2["default"].PropTypes.string.isRequired,
		children: _react2["default"].PropTypes.element.isRequired
	};
	
	LuxContainer.defaultProps = {
		stores: "",
		actions: {}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwZjIyNDBhNmMyMDZkZDg0M2E0MSIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvbHV4Q29udGFpbmVyLmpzIiwid2VicGFjazovLy9leHRlcm5hbCB7XCJyb290XCI6XCJSZWFjdFwiLFwiY29tbW9uanNcIjpcInJlYWN0XCIsXCJjb21tb25qczJcIjpcInJlYWN0XCIsXCJhbWRcIjpcInJlYWN0XCJ9Iiwid2VicGFjazovLy8uL3NyYy9zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtYWNoaW5hXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNW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LE1BQU0sQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDOzs7OztBQUtuRSxNQUFLLFVBQVUsSUFBSSxVQUFVLENBQUMsY0FBYyxDQUFFLGFBQWEsQ0FBRSxFQUFHO0FBQy9ELFFBQUssR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDO0dBQy9CLE1BQU07QUFDTixRQUFLLEdBQUcsWUFBVztBQUNsQixRQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBRSxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUUsQ0FBQyxDQUFFLElBQUksRUFBRSxDQUFDO0FBQzVCLFVBQU0sQ0FBQyxLQUFLLENBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxDQUFFLENBQUM7SUFDbEQsQ0FBQztHQUNGOztBQUVELE9BQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOzs7QUFHdEIsc0JBQUUsS0FBSyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUUsQ0FBQzs7OztBQUl6QixNQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbEMsT0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDOzs7O0FBSTdCLE1BQUssVUFBVSxFQUFHO0FBQ2pCLHVCQUFFLE1BQU0sQ0FBRSxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBRSxDQUFDO0dBQ3hDOzs7QUFHRCxPQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7OztBQUdwQyxPQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsU0FBTyxLQUFLLENBQUM7RUFDYixDQUFDIiwiZmlsZSI6Imx1eC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImxvZGFzaFwiKSwgcmVxdWlyZShcInBvc3RhbFwiKSwgcmVxdWlyZShcInJlYWN0XCIpLCByZXF1aXJlKFwibWFjaGluYVwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJsb2Rhc2hcIiwgXCJwb3N0YWxcIiwgXCJyZWFjdFwiLCBcIm1hY2hpbmFcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibHV4XCJdID0gZmFjdG9yeShyZXF1aXJlKFwibG9kYXNoXCIpLCByZXF1aXJlKFwicG9zdGFsXCIpLCByZXF1aXJlKFwicmVhY3RcIiksIHJlcXVpcmUoXCJtYWNoaW5hXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJsdXhcIl0gPSBmYWN0b3J5KHJvb3RbXCJfXCJdLCByb290W1wicG9zdGFsXCJdLCByb290W1wiUmVhY3RcIl0sIHJvb3RbXCJtYWNoaW5hXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfM19fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzVfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xMV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzE0X18pIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDBmMjI0MGE2YzIwNmRkODQzYTQxXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoICEoIHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiBnbG9iYWwgKS5fYmFiZWxQb2x5ZmlsbCApIHtcblx0dGhyb3cgbmV3IEVycm9yKCBcIllvdSBtdXN0IGluY2x1ZGUgdGhlIGJhYmVsIHBvbHlmaWxsIG9uIHlvdXIgcGFnZSBiZWZvcmUgbHV4IGlzIGxvYWRlZC4gU2VlIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL3VzYWdlL3BvbHlmaWxsLyBmb3IgbW9yZSBkZXRhaWxzLlwiICk7XG59XG5cbmltcG9ydCB1dGlscyBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQge1xuXHRnZXRBY3Rpb25Hcm91cCxcblx0Y3VzdG9tQWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uc1xufSBmcm9tIFwiLi9hY3Rpb25zXCI7XG5cbmltcG9ydCB7XG5cdG1peGluLFxuXHRyZWFjdE1peGluLFxuXHRhY3Rpb25MaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRkaXNwYXRjaCxcblx0THV4Q29udGFpbmVyXG59IGZyb20gXCIuL21peGluc1wiO1xuXG5mdW5jdGlvbiBwdWJsaXNoQWN0aW9uKCAuLi5hcmdzICkge1xuXHRpZiAoIGNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0Y29uc29sZS5sb2coIFwibHV4LnB1Ymxpc2hBY3Rpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGZ1dHVyZSByZWxlYXNlcy4gUGxlYXNlIHVzZSBsdXguZGlzcGF0Y2guXCIgKTtcblx0fVxuXHRkaXNwYXRjaCggLi4uYXJncyApO1xufVxuXG5pbXBvcnQgeyBTdG9yZSwgc3RvcmVzLCByZW1vdmVTdG9yZSB9IGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBleHRlbmQgfSBmcm9tIFwiLi9leHRlbmRcIjtcblN0b3JlLmV4dGVuZCA9IGV4dGVuZDtcblxuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSBcIi4vZGlzcGF0Y2hlclwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGFjdGlvbnMsXG5cdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdGRpc3BhdGNoLFxuXHRwdWJsaXNoQWN0aW9uLFxuXHRkaXNwYXRjaGVyLFxuXHRnZXRBY3Rpb25Hcm91cCxcblx0YWN0aW9uQ3JlYXRvckxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25MaXN0ZW5lcixcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdHJlbW92ZVN0b3JlLFxuXHRTdG9yZSxcblx0c3RvcmVzLFxuXHR1dGlscyxcblx0THV4Q29udGFpbmVyXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbHV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICkge1xuXHRjb25zdCBfX2x1eCA9IGNvbnRleHQuX19sdXggPSAoIGNvbnRleHQuX19sdXggfHwge30gKTtcblx0Lyplc2xpbnQtZGlzYWJsZSAqL1xuXHRjb25zdCBjbGVhbnVwID0gX19sdXguY2xlYW51cCA9ICggX19sdXguY2xlYW51cCB8fCBbXSApO1xuXHRjb25zdCBzdWJzY3JpcHRpb25zID0gX19sdXguc3Vic2NyaXB0aW9ucyA9ICggX19sdXguc3Vic2NyaXB0aW9ucyB8fCB7fSApO1xuXHQvKmVzbGludC1lbmFibGUgKi9cblx0cmV0dXJuIF9fbHV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIGVudHJpZXMoIG9iaiApIHtcblx0aWYgKCBbIFwib2JqZWN0XCIsIFwiZnVuY3Rpb25cIiBdLmluZGV4T2YoIHR5cGVvZiBvYmogKSA9PT0gLTEgKSB7XG5cdFx0b2JqID0ge307XG5cdH1cblx0Zm9yICggbGV0IGsgb2YgT2JqZWN0LmtleXMoIG9iaiApICkge1xuXHRcdHlpZWxkIFsgaywgb2JqWyBrIF0gXTtcblx0fVxufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMuanNcbiAqKi8iLCJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmV4cG9ydCBjb25zdCBhY3Rpb25zID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuZXhwb3J0IGNvbnN0IGFjdGlvbkdyb3VwcyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggYWN0aW9uTGlzdCApIHtcblx0YWN0aW9uTGlzdCA9ICggdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgKSA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggIWFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdFx0YWN0aW9uc1sgYWN0aW9uIF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5wdWJsaXNoKCB7XG5cdFx0XHRcdFx0dG9waWM6IGBleGVjdXRlLiR7YWN0aW9ufWAsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uVHlwZTogYWN0aW9uLFxuXHRcdFx0XHRcdFx0YWN0aW9uQXJnczogYXJnc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0gKTtcbn1cblxuLy8gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZCwgYnV0IHdpbGwgcmVtYWluIGFzXG4vLyBsb25nIGFzIHRoZSBwcmludCB1dGlscyBuZWVkIGl0LlxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3Rpb25Hcm91cCggZ3JvdXAgKSB7XG5cdGlmICggYWN0aW9uR3JvdXBzWyBncm91cCBdICkge1xuXHRcdHJldHVybiBfLnBpY2soIGFjdGlvbnMsIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBncm91cCBuYW1lZCAnJHtncm91cH0nYCApO1xuXHR9XG59XG5cbi8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQsIGJ1dCB3aWxsIHJlbWFpbiBhc1xuLy8gbG9uZyBhcyB0aGUgcHJpbnQgdXRpbHMgbmVlZCBpdC5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JvdXBzV2l0aEFjdGlvbiggYWN0aW9uTmFtZSApIHtcblx0Y29uc3QgZ3JvdXBzID0gW107XG5cdGZvciAoIHZhciBbIGdyb3VwLCBsaXN0IF0gb2YgZW50cmllcyggYWN0aW9uR3JvdXBzICkgKSB7XG5cdFx0aWYgKCBsaXN0LmluZGV4T2YoIGFjdGlvbk5hbWUgKSA+PSAwICkge1xuXHRcdFx0Z3JvdXBzLnB1c2goIGdyb3VwICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBncm91cHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdXN0b21BY3Rpb25DcmVhdG9yKCBhY3Rpb24gKSB7XG5cdE9iamVjdC5hc3NpZ24oIGFjdGlvbnMsIGFjdGlvbiApO1xufVxuXG4vLyBUaGlzIG1ldGhvZCBpcyBkZXByZWNhdGVkLCBidXQgd2lsbCByZW1haW4gYXNcbi8vIGxvbmcgYXMgdGhlIHByaW50IHV0aWxzIG5lZWQgaXQuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQWN0aW9uR3JvdXAoIGdyb3VwTmFtZSwgYWN0aW9uTGlzdCApIHtcblx0bGV0IGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXTtcblx0aWYgKCAhZ3JvdXAgKSB7XG5cdFx0Z3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdID0gW107XG5cdH1cblx0YWN0aW9uTGlzdCA9IHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiID8gWyBhY3Rpb25MaXN0IF0gOiBhY3Rpb25MaXN0O1xuXHRjb25zdCBkaWZmID0gXy5kaWZmZXJlbmNlKCBhY3Rpb25MaXN0LCBPYmplY3Qua2V5cyggYWN0aW9ucyApICk7XG5cdGlmICggZGlmZi5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIGZvbGxvd2luZyBhY3Rpb25zIGRvIG5vdCBleGlzdDogJHtkaWZmLmpvaW4oIFwiLCBcIiApfWAgKTtcblx0fVxuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYgKCBncm91cC5pbmRleE9mKCBhY3Rpb24gKSA9PT0gLTEgKSB7XG5cdFx0XHRncm91cC5wdXNoKCBhY3Rpb24gKTtcblx0XHR9XG5cdH0gKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FjdGlvbnMuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfM19fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9XG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IHBvc3RhbCBmcm9tIFwicG9zdGFsXCI7XG5cbmNvbnN0IGFjdGlvbkNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguYWN0aW9uXCIgKTtcbmNvbnN0IHN0b3JlQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5zdG9yZVwiICk7XG5jb25zdCBkaXNwYXRjaGVyQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5kaXNwYXRjaGVyXCIgKTtcblxuZXhwb3J0IHtcblx0YWN0aW9uQ2hhbm5lbCxcblx0c3RvcmVDaGFubmVsLFxuXHRkaXNwYXRjaGVyQ2hhbm5lbCxcblx0cG9zdGFsXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYnVzLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzVfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwicG9zdGFsXCJcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHsgc3RvcmVNaXhpbiwgc3RvcmVSZWFjdE1peGluIH0gZnJvbSBcIi4vc3RvcmVcIjtcbmltcG9ydCB7IGFjdGlvbkNyZWF0b3JNaXhpbiwgYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sIGRpc3BhdGNoIH0gZnJvbSBcIi4vYWN0aW9uQ3JlYXRvclwiO1xuaW1wb3J0IHsgYWN0aW9uTGlzdGVuZXJNaXhpbiB9IGZyb20gXCIuL2FjdGlvbkxpc3RlbmVyXCI7XG5pbXBvcnQgTHV4Q29udGFpbmVyIGZyb20gXCIuL2x1eENvbnRhaW5lclwiO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgR2VuZXJhbGl6ZWQgTWl4aW4gQmVoYXZpb3IgZm9yIG5vbi1sdXggICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgbHV4TWl4aW5DbGVhbnVwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuX19sdXguY2xlYW51cC5mb3JFYWNoKCAoIG1ldGhvZCApID0+IG1ldGhvZC5jYWxsKCB0aGlzICkgKTtcblx0dGhpcy5fX2x1eC5jbGVhbnVwID0gdW5kZWZpbmVkO1xuXHRkZWxldGUgdGhpcy5fX2x1eC5jbGVhbnVwO1xufTtcblxuZnVuY3Rpb24gbWl4aW4oIGNvbnRleHQsIC4uLm1peGlucyApIHtcblx0aWYgKCBtaXhpbnMubGVuZ3RoID09PSAwICkge1xuXHRcdG1peGlucyA9IFsgc3RvcmVNaXhpbiwgYWN0aW9uQ3JlYXRvck1peGluIF07XG5cdH1cblxuXHRtaXhpbnMuZm9yRWFjaCggKCBteG4gKSA9PiB7XG5cdFx0aWYgKCB0eXBlb2YgbXhuID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHRteG4gPSBteG4oKTtcblx0XHR9XG5cdFx0aWYgKCBteG4ubWl4aW4gKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKCBjb250ZXh0LCBteG4ubWl4aW4gKTtcblx0XHR9XG5cdFx0aWYgKCB0eXBlb2YgbXhuLnNldHVwICE9PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiTHV4IG1peGlucyBzaG91bGQgaGF2ZSBhIHNldHVwIG1ldGhvZC4gRGlkIHlvdSBwZXJoYXBzIHBhc3MgeW91ciBtaXhpbnMgYWhlYWQgb2YgeW91ciB0YXJnZXQgaW5zdGFuY2U/XCIgKTtcblx0XHR9XG5cdFx0bXhuLnNldHVwLmNhbGwoIGNvbnRleHQgKTtcblx0XHRpZiAoIG14bi50ZWFyZG93biApIHtcblx0XHRcdGNvbnRleHQuX19sdXguY2xlYW51cC5wdXNoKCBteG4udGVhcmRvd24gKTtcblx0XHR9XG5cdH0gKTtcblx0Y29udGV4dC5sdXhDbGVhbnVwID0gbHV4TWl4aW5DbGVhbnVwO1xuXHRyZXR1cm4gY29udGV4dDtcbn1cblxubWl4aW4uc3RvcmUgPSBzdG9yZU1peGluO1xubWl4aW4uYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JNaXhpbjtcbm1peGluLmFjdGlvbkxpc3RlbmVyID0gYWN0aW9uTGlzdGVuZXJNaXhpbjtcblxuY29uc3QgcmVhY3RNaXhpbiA9IHtcblx0YWN0aW9uQ3JlYXRvcjogYWN0aW9uQ3JlYXRvclJlYWN0TWl4aW4sXG5cdHN0b3JlOiBzdG9yZVJlYWN0TWl4aW5cbn07XG5cbmZ1bmN0aW9uIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25MaXN0ZW5lck1peGluICk7XG59XG5cbmZ1bmN0aW9uIGFjdGlvbkNyZWF0b3IoIHRhcmdldCApIHtcblx0cmV0dXJuIG1peGluKCB0YXJnZXQsIGFjdGlvbkNyZWF0b3JNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yTGlzdGVuZXIoIHRhcmdldCApIHtcblx0cmV0dXJuIGFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3RlbmVyKCB0YXJnZXQgKSApO1xufVxuXG5leHBvcnQge1xuXHRtaXhpbixcblx0cmVhY3RNaXhpbixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdGFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0ZGlzcGF0Y2gsXG5cdEx1eENvbnRhaW5lclxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgICAgICAgU3RvcmUgTWl4aW4gICAgICAgICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmltcG9ydCB7IHN0b3JlQ2hhbm5lbCwgZGlzcGF0Y2hlckNoYW5uZWwgfSBmcm9tIFwiLi4vYnVzXCI7XG5pbXBvcnQgeyBlbnN1cmVMdXhQcm9wLCBlbnRyaWVzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5cbmZ1bmN0aW9uIGdhdGVLZWVwZXIoIHN0b3JlLCBkYXRhICkge1xuXHRjb25zdCBwYXlsb2FkID0ge307XG5cdHBheWxvYWRbIHN0b3JlIF0gPSB0cnVlO1xuXHRjb25zdCBfX2x1eCA9IHRoaXMuX19sdXg7XG5cblx0Y29uc3QgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHR0aGlzLnN0b3Jlcy5vbkNoYW5nZS5jYWxsKCB0aGlzLCBwYXlsb2FkICk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMuc3RvcmVzLmxpc3RlblRvLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbmV4cG9ydCB2YXIgc3RvcmVNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnN0IF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggdGhpcyApO1xuXHRcdGNvbnN0IHN0b3JlcyA9IHRoaXMuc3RvcmVzID0gKCB0aGlzLnN0b3JlcyB8fCB7fSApO1xuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvIHx8ICFzdG9yZXMubGlzdGVuVG8ubGVuZ3RoICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgbGlzdGVuVG8gbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzdG9yZSBuYW1lc3BhY2VgICk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbGlzdGVuVG8gPSB0eXBlb2Ygc3RvcmVzLmxpc3RlblRvID09PSBcInN0cmluZ1wiID8gWyBzdG9yZXMubGlzdGVuVG8gXSA6IHN0b3Jlcy5saXN0ZW5UbztcblxuXHRcdGlmICggIXN0b3Jlcy5vbkNoYW5nZSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYEEgY29tcG9uZW50IHdhcyB0b2xkIHRvIGxpc3RlbiB0byB0aGUgZm9sbG93aW5nIHN0b3JlKHMpOiAke2xpc3RlblRvfSBidXQgbm8gb25DaGFuZ2UgaGFuZGxlciB3YXMgaW1wbGVtZW50ZWRgICk7XG5cdFx0fVxuXG5cdFx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXG5cdFx0bGlzdGVuVG8uZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbIGAke3N0b3JlfS5jaGFuZ2VkYCBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZSggYCR7c3RvcmV9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIHRoaXMsIHN0b3JlICkgKTtcblx0XHR9ICk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggXCJwcmVub3RpZnlcIiwgKCBkYXRhICkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwoIHRoaXMsIGRhdGEgKSApO1xuXHR9LFxuXHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICggbGV0IFsga2V5LCBzdWIgXSBvZiBlbnRyaWVzKCB0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMgKSApIHtcblx0XHRcdGxldCBzcGxpdDtcblx0XHRcdGlmICgga2V5ID09PSBcInByZW5vdGlmeVwiIHx8ICggKCBzcGxpdCA9IGtleS5zcGxpdCggXCIuXCIgKSApICYmIHNwbGl0LnBvcCgpID09PSBcImNoYW5nZWRcIiApICkge1xuXHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG1peGluOiB7fVxufTtcblxuZXhwb3J0IGNvbnN0IHN0b3JlUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBzdG9yZU1peGluLnNldHVwLFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogc3RvcmVNaXhpbi50ZWFyZG93blxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgZ2V0QWN0aW9uR3JvdXAsIGFjdGlvbnMgfSBmcm9tIFwiLi4vYWN0aW9uc1wiO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgICAgICAgICAgQWN0aW9uIENyZWF0b3IgTWl4aW4gICAgICAgICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoKCBhY3Rpb24sIC4uLmFyZ3MgKSB7XG5cdGlmICggYWN0aW9uc1sgYWN0aW9uIF0gKSB7XG5cdFx0YWN0aW9uc1sgYWN0aW9uIF0oIC4uLmFyZ3MgKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gbmFtZWQgJyR7YWN0aW9ufSdgICk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNyZWF0b3JNaXhpbiA9IHtcblx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0QWN0aW9uR3JvdXAgPSB0aGlzLmdldEFjdGlvbkdyb3VwIHx8IFtdO1xuXHRcdHRoaXMuZ2V0QWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyB8fCBbXTtcblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9uR3JvdXAgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gWyB0aGlzLmdldEFjdGlvbkdyb3VwIF07XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zID0gWyB0aGlzLmdldEFjdGlvbnMgXTtcblx0XHR9XG5cblx0XHRjb25zdCBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiAoICF0aGlzWyBrIF0gKSB7XG5cdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW50cmllcyggZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkgKSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrLCB2ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0aWYgKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaCgga2V5LCAuLi5hcmd1bWVudHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fSApO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRkaXNwYXRjaDogZGlzcGF0Y2hcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0ZGlzcGF0Y2g6IGRpc3BhdGNoXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2FjdGlvbkNyZWF0b3IuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4uL2J1c1wiO1xuaW1wb3J0IHsgZW5zdXJlTHV4UHJvcCB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGVBY3Rpb25DcmVhdG9yLCBhZGRUb0FjdGlvbkdyb3VwIH0gZnJvbSBcIi4uL2FjdGlvbnNcIjtcbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25MaXN0ZW5lck1peGluKCB7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSApIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdGNvbnN0IHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoICggZGF0YSwgZW52ICkgPT4ge1xuXHRcdFx0XHRjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdO1xuXHRcdFx0XHRpZiAoIGhhbmRsZXIgKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseSggY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdGlmICggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID0gY2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKS5jb250ZXh0KCBjb250ZXh0ICk7XG5cdFx0XHRjb25zdCBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKCBoYW5kbGVycyApO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0aWYgKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0fTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9hY3Rpb25MaXN0ZW5lci5qc1xuICoqLyIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AsIGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IHN0b3JlQ2hhbm5lbCwgZGlzcGF0Y2hlckNoYW5uZWwgfSBmcm9tIFwiLi4vYnVzXCI7XG5pbXBvcnQgeyBvbWl0LCBpc1N0cmluZywgaXNGdW5jdGlvbiB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGRpc3BhdGNoIH0gZnJvbSBcIi4vYWN0aW9uQ3JlYXRvclwiO1xuXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0Y29uc3QgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkWyBzdG9yZSBdID0gdHJ1ZTtcblx0Y29uc3QgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdGNvbnN0IGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSggdGhpcy5wcm9wcy5vblN0b3JlQ2hhbmdlKCB0aGlzLnByb3BzLCBwYXlsb2FkICkgKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5wcm9wcy5zdG9yZXMuaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxuZnVuY3Rpb24gc2V0dXBTdG9yZUxpc3RlbmVyKCBpbnN0YW5jZSApIHtcblx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCBpbnN0YW5jZSApO1xuXHRfX2x1eC53YWl0Rm9yID0gW107XG5cdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRjb25zdCBzdG9yZXMgPSBpbnN0YW5jZS5wcm9wcy5zdG9yZXMuc3BsaXQoIFwiLFwiICkubWFwKCB4PT4geC50cmltKCkgKTtcblxuXHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zWyBgJHsgc3RvcmUgfS5jaGFuZ2VkYCBdID0gc3RvcmVDaGFubmVsLnN1YnNjcmliZSggYCR7IHN0b3JlIH0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggaW5zdGFuY2UsIHN0b3JlICkgKTtcblx0fSApO1xuXG5cdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggaW5zdGFuY2UsIGRhdGEgKSApO1xufVxuXG5mdW5jdGlvbiBpc1N5bnRoZXRpY0V2ZW50KCBlICkge1xuXHRyZXR1cm4gZS5oYXNPd25Qcm9wZXJ0eSggXCJldmVudFBoYXNlXCIgKSAmJlxuXHRcdGUuaGFzT3duUHJvcGVydHkoIFwibmF0aXZlRXZlbnRcIiApICYmXG5cdFx0ZS5oYXNPd25Qcm9wZXJ0eSggXCJ0YXJnZXRcIiApICYmXG5cdFx0ZS5oYXNPd25Qcm9wZXJ0eSggXCJ0eXBlXCIgKTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0aWYgKCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIGFjdGlvbiApID09PSBcIltvYmplY3QgU3RyaW5nXVwiICkge1xuXHRcdHJldHVybiBmdW5jdGlvbiggZSwgLi4uYXJncyApIHtcblx0XHRcdGlmICggIWlzU3ludGhldGljRXZlbnQoIGUgKSApIHtcblx0XHRcdFx0YXJncy51bnNoaWZ0KCBlICk7XG5cdFx0XHR9XG5cdFx0XHRkaXNwYXRjaCggYWN0aW9uLCAuLi5hcmdzICk7XG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBzZXR1cEFjdGlvbk1hcCggaW5zdGFuY2UgKSB7XG5cdGluc3RhbmNlLnByb3BUb0FjdGlvbiA9IHt9O1xuXHRmb3IgKCBsZXQgWyBjaGlsZFByb3AsIGFjdGlvbiBdIG9mIGVudHJpZXMoIGluc3RhbmNlLnByb3BzLmFjdGlvbnMgKSApIHtcblx0XHRsZXQgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbjsgLy8gYXNzdW1lcyBmdW5jdGlvbiBieSBkZWZhdWx0XG5cdFx0aWYgKCBpc1N0cmluZyggYWN0aW9uICkgKSB7XG5cdFx0XHRhY3Rpb25DcmVhdG9yID0gZ2V0RGVmYXVsdEFjdGlvbkNyZWF0b3IoIGFjdGlvbiApO1xuXHRcdH0gZWxzZSBpZiAoICFpc0Z1bmN0aW9uKCBhY3Rpb24gKSApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggXCJUaGUgdmFsdWVzIHByb3ZpZGVkIHRvIHRoZSBMdXhDb250YWluZXIgYWN0aW9ucyBwcm9wZXJ0eSBtdXN0IGJlIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb25cIiApO1xuXHRcdH1cblx0XHRpbnN0YW5jZS5wcm9wVG9BY3Rpb25bIGNoaWxkUHJvcCBdID0gYWN0aW9uQ3JlYXRvcjtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMdXhDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciggcHJvcHMgKSB7XG5cdFx0c3VwZXIoIHByb3BzICk7XG5cdFx0c2V0dXBTdG9yZUxpc3RlbmVyKCB0aGlzICk7XG5cdFx0c2V0dXBBY3Rpb25NYXAoIHRoaXMgKTtcblx0XHR0aGlzLmNvbXBvbmVudFdpbGxVbm1vdW50LmJpbmQoIHRoaXMgKTtcblx0fVxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGZvciAoIGxldCBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHRsZXQgc3BsaXQ7XG5cdFx0XHRpZiAoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQoXG5cdFx0XHR0aGlzLnByb3BzLmNoaWxkcmVuLFxuXHRcdFx0T2JqZWN0LmFzc2lnbihcblx0XHRcdFx0e30sXG5cdFx0XHRcdG9taXQoIHRoaXMucHJvcHMsIFwiY2hpbGRyZW5cIiwgXCJvblN0b3JlQ2hhbmdlXCIsIFwic3RvcmVzXCIsIFwiYWN0aW9uc1wiICksXG5cdFx0XHRcdHRoaXMucHJvcFRvQWN0aW9uLFxuXHRcdFx0XHR0aGlzLnN0YXRlXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufVxuXG5MdXhDb250YWluZXIucHJvcFR5cGVzID0ge1xuXHRvblN0b3JlQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcblx0c3RvcmVzOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkXG59O1xuXG5MdXhDb250YWluZXIuZGVmYXVsdFByb3BzID0ge1xuXHRzdG9yZXM6IFwiXCIsXG5cdGFjdGlvbnM6IHt9XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2x1eENvbnRhaW5lci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xMV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwge1wicm9vdFwiOlwiUmVhY3RcIixcImNvbW1vbmpzXCI6XCJyZWFjdFwiLFwiY29tbW9uanMyXCI6XCJyZWFjdFwiLFwiYW1kXCI6XCJyZWFjdFwifVxuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IG1peGluIH0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmV4cG9ydCBjb25zdCBzdG9yZXMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0Y29uc3QgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCBsZXQgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0Y29uc3QgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiAoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNoYW5nZWQgPSAwO1xuXHRcdFx0Y29uc3QgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKSB7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiAoIHNvdXJjZS53YWl0Rm9yICkge1xuXHRcdHNvdXJjZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRpZiAoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0Y29uc3QgbGlzdGVuZXJzID0ge307XG5cdGNvbnN0IGhhbmRsZXJzID0ge307XG5cdGNvbnN0IHN0YXRlID0ge307XG5cdGNvbnN0IG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdGxldCBvcHQ7XG5cdFx0aWYgKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYgKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKCAuLi5vcHQgKSB7XG5cdFx0bGV0IFsgc3RhdGUsIGhhbmRsZXJzLCBvcHRpb25zIF0gPSBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHQgKTtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCB0aGlzICk7XG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgdGhpcy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdGxldCBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBtaXhpbi5hY3Rpb25MaXN0ZW5lcigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCAoKSA9PiB0aGlzLmZsdXNoKCkgKVxuXHRcdFx0XHRcdC5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoIClcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZGlzcGF0Y2hlckNoYW5uZWwsIGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IG1hY2hpbmEgZnJvbSBcIm1hY2hpbmFcIjtcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUsIG5hbWVzcGFjZXMgKSB7XG5cdGxldCBjYWxjZEdlbiA9IGdlbjtcblx0Y29uc3QgX25hbWVzcGFjZXMgPSBuYW1lc3BhY2VzIHx8IFtdO1xuXHRpZiAoIF9uYW1lc3BhY2VzLmluZGV4T2YoIHN0b3JlLm5hbWVzcGFjZSApID4gLTEgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBmb3IgdGhlIFwiJHtzdG9yZS5uYW1lc3BhY2V9XCIgc3RvcmUgd2hlbiBwYXJ0aWNpcGF0aW5nIGluIHRoZSBcIiR7YWN0aW9uVHlwZX1cIiBhY3Rpb24uYCApO1xuXHR9XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRjb25zdCBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiAoIGRlcFN0b3JlICkge1xuXHRcdFx0XHRfbmFtZXNwYWNlcy5wdXNoKCBzdG9yZS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0Y29uc3QgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSwgYWN0aW9uVHlwZSwgX25hbWVzcGFjZXMgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oIGBUaGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uIGluIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdhaXRzIGZvciBcIiR7ZGVwfVwiIGJ1dCBhIHN0b3JlIHdpdGggdGhhdCBuYW1lc3BhY2UgZG9lcyBub3QgcGFydGljaXBhdGUgaW4gdGhpcyBhY3Rpb24uYCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0Y29uc3QgdHJlZSA9IFtdO1xuXHRjb25zdCBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHQvKmVzbGludC1kaXNhYmxlICovXG5cdGZvciAoIGxldCBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0Y29uc3QgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSApO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYgKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0Y29uc3QgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIGxldCBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHRsZXQgYWN0aW9uO1xuXHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0Y29uc3QgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdGZ1bmN0aW9uIGlzVGhpc05hbWVTcGFjZSggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH1cblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHRsZXQgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYgKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0aWYgKCAhdGhpcy5fX3N1YnNjcmlwdGlvbnMgfHwgIXRoaXMuX19zdWJzY3JpcHRpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gW1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcImV4ZWN1dGUuKlwiLFxuXHRcdFx0XHRcdCggZGF0YSwgZW52ICkgPT4gdGhpcy5oYW5kbGVBY3Rpb25EaXNwYXRjaCggZGF0YSApXG5cdFx0XHRcdCksXG5cdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XHRcIiouaGFuZGxlZC4qXCIsXG5cdFx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdFx0KS5jb25zdHJhaW50KCAoKSA9PiAhIXRoaXMuYWN0aW9uQ29udGV4dCApXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0aWYgKCB0aGlzLl9fc3Vic2NyaXB0aW9ucyApIHtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zLmZvckVhY2goICggc3Vic2NyaXB0aW9uICkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkgKTtcblx0XHRcdHRoaXMuX19zdWJzY3JpcHRpb25zID0gbnVsbDtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IERpc3BhdGNoZXIoKTtcblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZGlzcGF0Y2hlci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xNF9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJtYWNoaW5hXCJcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgY29uc3QgZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kKCAuLi5vcHRpb25zICkge1xuXHRjb25zdCBwYXJlbnQgPSB0aGlzO1xuXHRsZXQgc3RvcmU7IC8vIHBsYWNlaG9sZGVyIGZvciBpbnN0YW5jZSBjb25zdHJ1Y3RvclxuXHRjb25zdCBDdG9yID0gZnVuY3Rpb24oKSB7fTsgLy8gcGxhY2Vob2xkZXIgY3RvciBmdW5jdGlvbiB1c2VkIHRvIGluc2VydCBsZXZlbCBpbiBwcm90b3R5cGUgY2hhaW5cblxuXHQvLyBGaXJzdCAtIHNlcGFyYXRlIG1peGlucyBmcm9tIHByb3RvdHlwZSBwcm9wc1xuXHRjb25zdCBtaXhpbnMgPSBbXTtcblx0Zm9yICggbGV0IG9wdCBvZiBvcHRpb25zICkge1xuXHRcdG1peGlucy5wdXNoKCBfLnBpY2soIG9wdCwgWyBcImhhbmRsZXJzXCIsIFwic3RhdGVcIiBdICkgKTtcblx0XHRkZWxldGUgb3B0LmhhbmRsZXJzO1xuXHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdH1cblxuXHRjb25zdCBwcm90b1Byb3BzID0gXy5tZXJnZS5hcHBseSggdGhpcywgWyB7fSBdLmNvbmNhdCggb3B0aW9ucyApICk7XG5cblx0Ly8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuXHQvLyAodGhlIFwiY29uc3RydWN0b3JcIiBwcm9wZXJ0eSBpbiB5b3VyIGBleHRlbmRgIGRlZmluaXRpb24pLCBvciBkZWZhdWx0ZWRcblx0Ly8gYnkgdXMgdG8gc2ltcGx5IGNhbGwgdGhlIHBhcmVudCdzIGNvbnN0cnVjdG9yLlxuXHRpZiAoIHByb3RvUHJvcHMgJiYgcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggXCJjb25zdHJ1Y3RvclwiICkgKSB7XG5cdFx0c3RvcmUgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuXHR9IGVsc2Uge1xuXHRcdHN0b3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zdCBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRhcmdzWyAwIF0gPSBhcmdzWyAwIF0gfHwge307XG5cdFx0XHRwYXJlbnQuYXBwbHkoIHRoaXMsIHN0b3JlLm1peGlucy5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdH07XG5cdH1cblxuXHRzdG9yZS5taXhpbnMgPSBtaXhpbnM7XG5cblx0Ly8gSW5oZXJpdCBjbGFzcyAoc3RhdGljKSBwcm9wZXJ0aWVzIGZyb20gcGFyZW50LlxuXHRfLm1lcmdlKCBzdG9yZSwgcGFyZW50ICk7XG5cblx0Ly8gU2V0IHRoZSBwcm90b3R5cGUgY2hhaW4gdG8gaW5oZXJpdCBmcm9tIGBwYXJlbnRgLCB3aXRob3V0IGNhbGxpbmdcblx0Ly8gYHBhcmVudGAncyBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0Q3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xuXHRzdG9yZS5wcm90b3R5cGUgPSBuZXcgQ3RvcigpO1xuXG5cdC8vIEFkZCBwcm90b3R5cGUgcHJvcGVydGllcyAoaW5zdGFuY2UgcHJvcGVydGllcykgdG8gdGhlIHN1YmNsYXNzLFxuXHQvLyBpZiBzdXBwbGllZC5cblx0aWYgKCBwcm90b1Byb3BzICkge1xuXHRcdF8uZXh0ZW5kKCBzdG9yZS5wcm90b3R5cGUsIHByb3RvUHJvcHMgKTtcblx0fVxuXG5cdC8vIENvcnJlY3RseSBzZXQgY2hpbGQncyBgcHJvdG90eXBlLmNvbnN0cnVjdG9yYC5cblx0c3RvcmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gc3RvcmU7XG5cblx0Ly8gU2V0IGEgY29udmVuaWVuY2UgcHJvcGVydHkgaW4gY2FzZSB0aGUgcGFyZW50J3MgcHJvdG90eXBlIGlzIG5lZWRlZCBsYXRlci5cblx0c3RvcmUuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblx0cmV0dXJuIHN0b3JlO1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V4dGVuZC5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=