/*!
 *  * lux.js - Flux-based architecture for using ReactJS at LeanKit
 *  * Author: Jim Cowart
 *  * Version: v2.0.0-3
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
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_15__) {
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

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	/* istanbul ignore next */
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _utils = __webpack_require__(1);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _actions = __webpack_require__(2);
	
	var _mixins = __webpack_require__(6);
	
	var _store = __webpack_require__(13);
	
	var _dispatcher = __webpack_require__(14);
	
	var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	if (!(typeof global === "undefined" ? window : global)._babelPolyfill) {
		throw new Error("You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details.");
	}
	
	/* istanbul ignore next */
	function publishAction() {
		if (console && typeof console.log === "function") {
			console.log("lux.publishAction has been deprecated and will be removed in future releases. Please use lux.dispatch.");
		}
		_mixins.dispatch.apply(undefined, arguments);
	}
	
	exports.default = {
		actions: _actions.actions,
		customActionCreator: _actions.customActionCreator,
		dispatch: _mixins.dispatch,
		publishAction: publishAction,
		dispatcher: _dispatcher2.default,
		getActionGroup: _actions.getActionGroup,
		actionCreatorListener: _mixins.actionCreatorListener,
		actionCreator: _mixins.actionCreator,
		actionListener: _mixins.actionListener,
		mixin: _mixins.mixin,
		reactMixin: _mixins.reactMixin,
		removeStore: _store.removeStore,
		Store: _store.Store,
		stores: _store.stores,
		utils: _utils2.default,
		luxWrapper: _mixins.luxWrapper
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
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.ensureLuxProp = ensureLuxProp;
	exports.entries = entries;
	
	var _marked = [entries].map(regeneratorRuntime.mark);
	
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
	
		return regeneratorRuntime.wrap(function entries$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						if (["object", "function"].indexOf(typeof obj === "undefined" ? "undefined" : _typeof(obj)) === -1) {
							obj = {};
						}
						_iteratorNormalCompletion = true;
						_didIteratorError = false;
						_iteratorError = undefined;
						_context.prev = 4;
						_iterator = Object.keys(obj)[Symbol.iterator]();
	
					case 6:
						if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
							_context.next = 13;
							break;
						}
	
						k = _step.value;
						_context.next = 10;
						return [k, obj[k]];
	
					case 10:
						_iteratorNormalCompletion = true;
						_context.next = 6;
						break;
	
					case 13:
						_context.next = 19;
						break;
	
					case 15:
						_context.prev = 15;
						_context.t0 = _context["catch"](4);
						_didIteratorError = true;
						_iteratorError = _context.t0;
	
					case 19:
						_context.prev = 19;
						_context.prev = 20;
	
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
	
					case 22:
						_context.prev = 22;
	
						if (!_didIteratorError) {
							_context.next = 25;
							break;
						}
	
						throw _iteratorError;
	
					case 25:
						return _context.finish(22);
	
					case 26:
						return _context.finish(19);
	
					case 27:
					case "end":
						return _context.stop();
				}
			}
		}, _marked[0], this, [[4, 15, 19, 27], [20,, 22, 26]]);
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionGroups = exports.actions = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.generateActionCreator = generateActionCreator;
	exports.getActionGroup = getActionGroup;
	exports.getGroupsWithAction = getGroupsWithAction;
	exports.customActionCreator = customActionCreator;
	exports.addToActionGroup = addToActionGroup;
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _utils = __webpack_require__(1);
	
	var _bus = __webpack_require__(4);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var actions = exports.actions = Object.create(null);
	var actionGroups = exports.actionGroups = Object.create(null);
	
	function generateActionCreator(actionList) {
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
			return _lodash2.default.pick(actions, actionGroups[group]);
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
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
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
		var diff = _lodash2.default.difference(actionList, Object.keys(actions));
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
	exports.postal = exports.dispatcherChannel = exports.storeChannel = exports.actionChannel = undefined;
	
	var _postal = __webpack_require__(5);
	
	var _postal2 = _interopRequireDefault(_postal);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var actionChannel = _postal2.default.channel("lux.action");
	var storeChannel = _postal2.default.channel("lux.store");
	var dispatcherChannel = _postal2.default.channel("lux.dispatcher");
	
	exports.actionChannel = actionChannel;
	exports.storeChannel = storeChannel;
	exports.dispatcherChannel = dispatcherChannel;
	exports.postal = _postal2.default;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.luxWrapper = exports.dispatch = exports.actionCreatorListener = exports.actionCreator = exports.actionListener = exports.reactMixin = exports.mixin = undefined;
	
	var _store = __webpack_require__(7);
	
	var _actionCreator = __webpack_require__(8);
	
	var _actionListener = __webpack_require__(9);
	
	var _luxWrapper = __webpack_require__(10);
	
	var _luxWrapper2 = _interopRequireDefault(_luxWrapper);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*********************************************
	*   Generalized Mixin Behavior for non-lux   *
	**********************************************/
	var luxMixinCleanup = function luxMixinCleanup() {
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
	exports.luxWrapper = _luxWrapper2.default;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*********************************************
	*                 Store Mixin                *
	**********************************************/
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.storeReactMixin = exports.storeMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
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
		var _this = this;
	
		this.__lux.waitFor = data.stores.filter(function (item) {
			return _this.stores.listenTo.indexOf(item) > -1;
		});
	}
	
	var storeMixin = exports.storeMixin = {
		setup: function setup() {
			var _this2 = this;
	
			var __lux = (0, _utils.ensureLuxProp)(this);
			var stores = this.stores;
			if (!stores) {
				throw new Error("Your component must provide a \"stores\" key");
			}
	
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
	
					var split = void 0;
					if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
						sub.unsubscribe();
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
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
	
	var storeReactMixin = exports.storeReactMixin = {
		componentWillMount: storeMixin.setup,
		componentWillUnmount: storeMixin.teardown
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionCreatorReactMixin = exports.actionCreatorMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.dispatch = dispatch;
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
	/*********************************************
	*           Action Creator Mixin          *
	**********************************************/
	
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
	
	var actionCreatorMixin = exports.actionCreatorMixin = {
		setup: function setup() {
			var _this = this;
	
			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];
	
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
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
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
						dispatch.apply(undefined, [key].concat(Array.prototype.slice.call(arguments)));
					});
				});
			}
		},
		mixin: {
			dispatch: dispatch
		}
	};
	
	var actionCreatorReactMixin = exports.actionCreatorReactMixin = {
		componentWillMount: actionCreatorMixin.setup,
		dispatch: dispatch
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*********************************************
	*            Action Listener Mixin           *
	**********************************************/
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionListenerMixin = actionListenerMixin;
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
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
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.default = luxWrapper;
	
	var _react = __webpack_require__(11);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _wrapperUtils = __webpack_require__(12);
	
	var _utils = __webpack_require__(1);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function luxWrapper(Component, _ref) {
		var actions = _ref.actions;
		var stores = _ref.stores;
		var getState = _ref.getState;
	
		var LuxWrapper = function (_React$Component) {
			_inherits(LuxWrapper, _React$Component);
	
			function LuxWrapper(props) {
				_classCallCheck(this, LuxWrapper);
	
				var _this = _possibleConstructorReturn(this, (LuxWrapper.__proto__ || Object.getPrototypeOf(LuxWrapper)).call(this, props));
	
				(0, _wrapperUtils.setupStoreListener)(_this, { stores: stores, getState: getState });
				(0, _wrapperUtils.setupActionMap)(_this, { actions: actions });
				if (getState) {
					_this.state = getState();
				}
				return _this;
			}
	
			_createClass(LuxWrapper, [{
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
	
							var split = void 0;
							if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
								sub.unsubscribe();
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
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
					return _react2.default.createElement(Component, Object.assign({}, this.props, this.propToAction, this.state));
				}
			}]);
	
			return LuxWrapper;
		}(_react2.default.Component);
	
		LuxWrapper.displayName = "LuxWrapped(" + (Component.displayName || "Component") + ")";
	
		return LuxWrapper;
	}
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
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.gateKeeper = gateKeeper;
	exports.handlePreNotify = handlePreNotify;
	exports.setupStoreListener = setupStoreListener;
	exports.isSyntheticEvent = isSyntheticEvent;
	exports.getDefaultActionCreator = getDefaultActionCreator;
	exports.setupActionMap = setupActionMap;
	
	var _utils = __webpack_require__(1);
	
	var _bus = __webpack_require__(4);
	
	var _actionCreator = __webpack_require__(8);
	
	var _lodash = __webpack_require__(3);
	
	function gateKeeper(instance, _ref, store) {
		var getState = _ref.getState;
	
		var payload = {};
		payload[store] = true;
		var __lux = instance.__lux;
	
		var found = __lux.waitFor.indexOf(store);
	
		if (found > -1) {
			__lux.waitFor.splice(found, 1);
			__lux.heardFrom.push(payload);
	
			if (__lux.waitFor.length === 0) {
				__lux.heardFrom = [];
				instance.setState(getState(instance.props, payload));
			}
		}
	}
	
	function handlePreNotify(instance, stores, data) {
		instance.__lux.waitFor = data.stores.filter(function (item) {
			return stores.indexOf(item) > -1;
		});
	}
	
	function setupStoreListener(instance, _ref2) {
		var stores = _ref2.stores;
		var getState = _ref2.getState;
	
		var __lux = (0, _utils.ensureLuxProp)(instance);
		__lux.waitFor = [];
		__lux.heardFrom = [];
	
		if (stores && stores.length) {
			stores.forEach(function (store) {
				__lux.subscriptions[store + ".changed"] = _bus.storeChannel.subscribe(store + ".changed", function () {
					return gateKeeper(instance, { getState: getState }, store);
				});
			});
	
			__lux.subscriptions.prenotify = _bus.dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify(instance, stores, data);
			});
		}
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
	
	function setupActionMap(instance, _ref3) {
		var actions = _ref3.actions;
	
		instance.propToAction = {};
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = (0, _utils.entries)(actions || {})[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _step$value = _slicedToArray(_step.value, 2);
	
				var childProp = _step$value[0];
				var action = _step$value[1];
	
				var actionCreator = action; // assumes function by default
				if ((0, _lodash.isString)(action)) {
					actionCreator = getDefaultActionCreator(action);
				} else if (!(0, _lodash.isFunction)(action)) {
					throw new Error("The values provided to the luxWrapper actions parameter must be a string or a function");
				}
				instance.propToAction[childProp] = actionCreator;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Store = exports.stores = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.removeStore = removeStore;
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _dispatcher = __webpack_require__(14);
	
	var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _mixins = __webpack_require__(6);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var stores = exports.stores = {};
	
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
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
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
				listeners[key].forEach(function (listener) {
					changed += listener.apply(this, args) === false ? 0 : 1;
				}.bind(this));
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
			var opt = void 0;
			if (o) {
				opt = _lodash2.default.clone(o);
				_lodash2.default.merge(state, opt.state);
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
				_lodash2.default.merge(otherOpts, opt);
			}
		});
		return [state, handlers, otherOpts];
	}
	
	var Store = exports.Store = function () {
		function Store() {
			var _this = this;
	
			_classCallCheck(this, Store);
	
			var _processStoreArgs = processStoreArgs.apply(undefined, arguments);
	
			var _processStoreArgs2 = _slicedToArray(_processStoreArgs, 3);
	
			var state = _processStoreArgs2[0];
			var handlers = _processStoreArgs2[1];
			var options = _processStoreArgs2[2];
	
			ensureStoreOptions(options, handlers, this);
			var namespace = options.namespace;
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
				handlerFn: function (data) {
					if (handlers.hasOwnProperty(data.actionType)) {
						inDispatch = true;
						var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
						this.hasChanged = res === false ? false : true;
						_bus.dispatcherChannel.publish(this.namespace + ".handled." + data.actionType, { hasChanged: this.hasChanged, namespace: this.namespace });
					}
				}.bind(this)
			}));
	
			this.__subscription = {
				notify: _bus.dispatcherChannel.subscribe("notify", function () {
					return _this.flush();
				}).constraint(function () {
					return inDispatch;
				})
			};
	
			_dispatcher2.default.registerStore({
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
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				delete stores[this.namespace];
				_dispatcher2.default.removeStore(this.namespace);
				this.luxCleanup();
			}
		}]);
	
		return Store;
	}();
	
	function removeStore(namespace) {
		stores[namespace].dispose();
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _lodash = __webpack_require__(3);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _machina = __webpack_require__(15);
	
	var _machina2 = _interopRequireDefault(_machina);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
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
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
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
		var _this = this;
	
		generation.map(function (store) {
			var data = Object.assign({
				deps: _lodash2.default.pick(_this.stores, store.waitFor)
			}, action);
			_bus.dispatcherChannel.publish(store.namespace + ".handle." + action.actionType, data);
		});
	}
	
	var Dispatcher = function (_machina$BehavioralFs) {
		_inherits(Dispatcher, _machina$BehavioralFs);
	
		function Dispatcher() {
			_classCallCheck(this, Dispatcher);
	
			var _this2 = _possibleConstructorReturn(this, (Dispatcher.__proto__ || Object.getPrototypeOf(Dispatcher)).call(this, {
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
										if (!_iteratorNormalCompletion2 && _iterator2.return) {
											_iterator2.return();
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
			}));
	
			_this2.createSubscribers();
			return _this2;
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
	
						var action = void 0;
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
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
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
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
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
				var _this3 = this;
	
				this.__subscriptions = [_bus.actionChannel.subscribe("execute.*", function (data, env) {
					return _this3.handleActionDispatch(data);
				}), _bus.dispatcherChannel.subscribe("*.handled.*", function (data) {
					return _this3.handle(_this3.actionContext, "action.handled", data);
				}).constraint(function () {
					return !!_this3.actionContext;
				})];
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
	}(_machina2.default.BehavioralFsm);
	
	exports.default = new Dispatcher();
	module.exports = exports["default"];

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBkMmM4ZjdmM2I1NDlmMGIwMjhhYyIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvbHV4V3JhcHBlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiUmVhY3RcIixcImNvbW1vbmpzXCI6XCJyZWFjdFwiLFwiY29tbW9uanMyXCI6XCJyZWFjdFwiLFwiYW1kXCI6XCJyZWFjdFwifSIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3dyYXBwZXJVdGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Rpc3BhdGNoZXIuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibWFjaGluYVwiIl0sIm5hbWVzIjpbImdsb2JhbCIsIndpbmRvdyIsIl9iYWJlbFBvbHlmaWxsIiwiRXJyb3IiLCJwdWJsaXNoQWN0aW9uIiwiY29uc29sZSIsImxvZyIsImFjdGlvbnMiLCJjdXN0b21BY3Rpb25DcmVhdG9yIiwiZGlzcGF0Y2giLCJkaXNwYXRjaGVyIiwiZ2V0QWN0aW9uR3JvdXAiLCJhY3Rpb25DcmVhdG9yTGlzdGVuZXIiLCJhY3Rpb25DcmVhdG9yIiwiYWN0aW9uTGlzdGVuZXIiLCJtaXhpbiIsInJlYWN0TWl4aW4iLCJyZW1vdmVTdG9yZSIsIlN0b3JlIiwic3RvcmVzIiwidXRpbHMiLCJsdXhXcmFwcGVyIiwiZW5zdXJlTHV4UHJvcCIsImVudHJpZXMiLCJjb250ZXh0IiwiX19sdXgiLCJjbGVhbnVwIiwic3Vic2NyaXB0aW9ucyIsIm9iaiIsImluZGV4T2YiLCJPYmplY3QiLCJrZXlzIiwiayIsImdlbmVyYXRlQWN0aW9uQ3JlYXRvciIsImdldEdyb3Vwc1dpdGhBY3Rpb24iLCJhZGRUb0FjdGlvbkdyb3VwIiwiY3JlYXRlIiwiYWN0aW9uR3JvdXBzIiwiYWN0aW9uTGlzdCIsImZvckVhY2giLCJhY3Rpb24iLCJhcmdzIiwiQXJyYXkiLCJmcm9tIiwiYXJndW1lbnRzIiwicHVibGlzaCIsInRvcGljIiwiZGF0YSIsImFjdGlvblR5cGUiLCJhY3Rpb25BcmdzIiwiZ3JvdXAiLCJwaWNrIiwiYWN0aW9uTmFtZSIsImdyb3VwcyIsImxpc3QiLCJwdXNoIiwiYXNzaWduIiwiZ3JvdXBOYW1lIiwiZGlmZiIsImRpZmZlcmVuY2UiLCJsZW5ndGgiLCJqb2luIiwiYWN0aW9uQ2hhbm5lbCIsImNoYW5uZWwiLCJzdG9yZUNoYW5uZWwiLCJkaXNwYXRjaGVyQ2hhbm5lbCIsInBvc3RhbCIsImx1eE1peGluQ2xlYW51cCIsIm1ldGhvZCIsImNhbGwiLCJ1bmRlZmluZWQiLCJtaXhpbnMiLCJteG4iLCJzZXR1cCIsInRlYXJkb3duIiwibHV4Q2xlYW51cCIsInN0b3JlIiwidGFyZ2V0IiwiZ2F0ZUtlZXBlciIsInBheWxvYWQiLCJmb3VuZCIsIndhaXRGb3IiLCJzcGxpY2UiLCJoZWFyZEZyb20iLCJvbkNoYW5nZSIsImhhbmRsZVByZU5vdGlmeSIsImZpbHRlciIsIml0ZW0iLCJsaXN0ZW5UbyIsInN0b3JlTWl4aW4iLCJzdWJzY3JpYmUiLCJwcmVub3RpZnkiLCJrZXkiLCJzdWIiLCJzcGxpdCIsInBvcCIsInVuc3Vic2NyaWJlIiwic3RvcmVSZWFjdE1peGluIiwiY29tcG9uZW50V2lsbE1vdW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJhY3Rpb25DcmVhdG9yTWl4aW4iLCJnZXRBY3Rpb25zIiwiYWRkQWN0aW9uSWZOb3RQcmVzZW50IiwidiIsImFjdGlvbkNyZWF0b3JSZWFjdE1peGluIiwiYWN0aW9uTGlzdGVuZXJNaXhpbiIsImhhbmRsZXJzIiwiaGFuZGxlckZuIiwic3VicyIsImVudiIsImhhbmRsZXIiLCJhcHBseSIsImhhbmRsZXJLZXlzIiwibmFtZXNwYWNlIiwiQ29tcG9uZW50IiwiZ2V0U3RhdGUiLCJMdXhXcmFwcGVyIiwicHJvcHMiLCJzdGF0ZSIsImNyZWF0ZUVsZW1lbnQiLCJwcm9wVG9BY3Rpb24iLCJkaXNwbGF5TmFtZSIsInNldHVwU3RvcmVMaXN0ZW5lciIsImlzU3ludGhldGljRXZlbnQiLCJnZXREZWZhdWx0QWN0aW9uQ3JlYXRvciIsInNldHVwQWN0aW9uTWFwIiwiaW5zdGFuY2UiLCJzZXRTdGF0ZSIsImUiLCJoYXNPd25Qcm9wZXJ0eSIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwidW5zaGlmdCIsImNoaWxkUHJvcCIsImJ1aWxkQWN0aW9uTGlzdCIsImVuc3VyZVN0b3JlT3B0aW9ucyIsIm9wdGlvbnMiLCJnZXRIYW5kbGVyT2JqZWN0IiwibGlzdGVuZXJzIiwiY2hhbmdlZCIsImxpc3RlbmVyIiwiYmluZCIsInVwZGF0ZVdhaXRGb3IiLCJzb3VyY2UiLCJoYW5kbGVyT2JqZWN0IiwiZGVwIiwiYWRkTGlzdGVuZXJzIiwicHJvY2Vzc1N0b3JlQXJncyIsIm90aGVyT3B0cyIsIm8iLCJvcHQiLCJjbG9uZSIsIm1lcmdlIiwiaW5EaXNwYXRjaCIsImhhc0NoYW5nZWQiLCJuZXdTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsImZsdXNoIiwicmVzIiwiY29uY2F0IiwiZGVwcyIsIl9fc3Vic2NyaXB0aW9uIiwibm90aWZ5IiwiY29uc3RyYWludCIsInJlZ2lzdGVyU3RvcmUiLCJzdWJzY3JpcHRpb24iLCJkaXNwb3NlIiwiY2FsY3VsYXRlR2VuIiwibG9va3VwIiwiZ2VuIiwibmFtZXNwYWNlcyIsImNhbGNkR2VuIiwiX25hbWVzcGFjZXMiLCJkZXBTdG9yZSIsInRoaXNHZW4iLCJ3YXJuIiwiYnVpbGRHZW5lcmF0aW9ucyIsInRyZWUiLCJwcm9jZXNzR2VuZXJhdGlvbiIsImdlbmVyYXRpb24iLCJtYXAiLCJEaXNwYXRjaGVyIiwiaW5pdGlhbFN0YXRlIiwiYWN0aW9uTWFwIiwic3RhdGVzIiwicmVhZHkiLCJfb25FbnRlciIsImFjdGlvbkNvbnRleHQiLCJkaXNwYXRjaGluZyIsImx1eEFjdGlvbiIsImdlbmVyYXRpb25zIiwidHJhbnNpdGlvbiIsInVwZGF0ZWQiLCJfb25FeGl0Iiwibm90aWZ5aW5nIiwibm90aGFuZGxlZCIsImdldFN0b3Jlc0hhbmRsaW5nIiwiY3JlYXRlU3Vic2NyaWJlcnMiLCJnZW5lcmF0aW9uSW5kZXgiLCJoYW5kbGUiLCJzdG9yZU1ldGEiLCJhY3Rpb25EZWYiLCJhY3Rpb25NZXRhIiwiaXNUaGlzTmFtZVNwYWNlIiwibWV0YSIsImlkeCIsImZpbmRJbmRleCIsIl9fc3Vic2NyaXB0aW9ucyIsImhhbmRsZUFjdGlvbkRpc3BhdGNoIiwiQmVoYXZpb3JhbEZzbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztB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VUFBSXNHLE1BQU10RyxFQUFFdUcsU0FBRixDQUFhSCxlQUFiLENBQVY7QUFDQSxVQUFLRSxRQUFRLENBQUMsQ0FBZCxFQUFrQjtBQUNqQnRHLFNBQUVyQixNQUFGLENBQVUySCxHQUFWLEVBQWUsQ0FBZjtBQUNBO0FBQ0Q7QUFDRDtBQVh3QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWXhCOzs7dUNBRW1CO0FBQUE7O0FBQ25CLFNBQUtFLGVBQUwsR0FBdUIsQ0FDdEIsbUJBQWNySCxTQUFkLENBQ0MsV0FERCxFQUVDLFVBQUUzQyxJQUFGLEVBQVE4RCxHQUFSO0FBQUEsWUFBaUIsT0FBS21HLG9CQUFMLENBQTJCakssSUFBM0IsQ0FBakI7QUFBQSxLQUZELENBRHNCLEVBS3RCLHVCQUFrQjJDLFNBQWxCLENBQ0MsYUFERCxFQUVDLFVBQUUzQyxJQUFGO0FBQUEsWUFBWSxPQUFLd0osTUFBTCxDQUFhLE9BQUtaLGFBQWxCLEVBQWlDLGdCQUFqQyxFQUFtRDVJLElBQW5ELENBQVo7QUFBQSxLQUZELEVBR0VvSCxVQUhGLENBR2M7QUFBQSxZQUFNLENBQUMsQ0FBQyxPQUFLd0IsYUFBYjtBQUFBLEtBSGQsQ0FMc0IsQ0FBdkI7QUFVQTs7OzZCQUVTO0FBQ1QsUUFBSyxLQUFLb0IsZUFBVixFQUE0QjtBQUMzQixVQUFLQSxlQUFMLENBQXFCeEssT0FBckIsQ0FBOEIsVUFBRThILFlBQUY7QUFBQSxhQUFvQkEsYUFBYXJFLFdBQWIsRUFBcEI7QUFBQSxNQUE5QjtBQUNBLFVBQUsrRyxlQUFMLEdBQXVCLElBQXZCO0FBQ0E7QUFDRDs7OztHQTVHdUIsa0JBQVFFLGE7O21CQStHbEIsSUFBSTVCLFVBQUosRTs7Ozs7OztBQ3RLZixpRCIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJwb3N0YWxcIiksIHJlcXVpcmUoXCJyZWFjdFwiKSwgcmVxdWlyZShcIm1hY2hpbmFcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wibG9kYXNoXCIsIFwicG9zdGFsXCIsIFwicmVhY3RcIiwgXCJtYWNoaW5hXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImx1eFwiXSA9IGZhY3RvcnkocmVxdWlyZShcImxvZGFzaFwiKSwgcmVxdWlyZShcInBvc3RhbFwiKSwgcmVxdWlyZShcInJlYWN0XCIpLCByZXF1aXJlKFwibWFjaGluYVwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV4XCJdID0gZmFjdG9yeShyb290W1wiX1wiXSwgcm9vdFtcInBvc3RhbFwiXSwgcm9vdFtcIlJlYWN0XCJdLCByb290W1wibWFjaGluYVwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV81X18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTFfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xNV9fKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBkMmM4ZjdmM2I1NDlmMGIwMjhhY1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKCAhKCB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsICkuX2JhYmVsUG9seWZpbGwgKSB7XG5cdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSBiYWJlbCBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovL2JhYmVsanMuaW8vZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIiApO1xufVxuXG5pbXBvcnQgdXRpbHMgZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHtcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbnNcbn0gZnJvbSBcIi4vYWN0aW9uc1wiO1xuXG5pbXBvcnQge1xuXHRtaXhpbixcblx0cmVhY3RNaXhpbixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdGFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0ZGlzcGF0Y2gsXG5cdGx1eFdyYXBwZXJcbn0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBwdWJsaXNoQWN0aW9uKCAuLi5hcmdzICkge1xuXHRpZiAoIGNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSBcImZ1bmN0aW9uXCIgKSB7XG5cdFx0Y29uc29sZS5sb2coIFwibHV4LnB1Ymxpc2hBY3Rpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGZ1dHVyZSByZWxlYXNlcy4gUGxlYXNlIHVzZSBsdXguZGlzcGF0Y2guXCIgKTtcblx0fVxuXHRkaXNwYXRjaCggLi4uYXJncyApO1xufVxuXG5pbXBvcnQgeyBTdG9yZSwgc3RvcmVzLCByZW1vdmVTdG9yZSB9IGZyb20gXCIuL3N0b3JlXCI7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRhY3Rpb25zLFxuXHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRkaXNwYXRjaCxcblx0cHVibGlzaEFjdGlvbixcblx0ZGlzcGF0Y2hlcixcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdG1peGluLFxuXHRyZWFjdE1peGluLFxuXHRyZW1vdmVTdG9yZSxcblx0U3RvcmUsXG5cdHN0b3Jlcyxcblx0dXRpbHMsXG5cdGx1eFdyYXBwZXJcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9sdXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKSB7XG5cdGNvbnN0IF9fbHV4ID0gY29udGV4dC5fX2x1eCA9ICggY29udGV4dC5fX2x1eCB8fCB7fSApO1xuXHQvKmVzbGludC1kaXNhYmxlICovXG5cdGNvbnN0IGNsZWFudXAgPSBfX2x1eC5jbGVhbnVwID0gKCBfX2x1eC5jbGVhbnVwIHx8IFtdICk7XG5cdGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zID0gKCBfX2x1eC5zdWJzY3JpcHRpb25zIHx8IHt9ICk7XG5cdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRyZXR1cm4gX19sdXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiogZW50cmllcyggb2JqICkge1xuXHRpZiAoIFsgXCJvYmplY3RcIiwgXCJmdW5jdGlvblwiIF0uaW5kZXhPZiggdHlwZW9mIG9iaiApID09PSAtMSApIHtcblx0XHRvYmogPSB7fTtcblx0fVxuXHRmb3IgKCBsZXQgayBvZiBPYmplY3Qua2V5cyggb2JqICkgKSB7XG5cdFx0eWllbGQgWyBrLCBvYmpbIGsgXSBdO1xuXHR9XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy5qc1xuICoqLyIsImltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgYWN0aW9uQ2hhbm5lbCB9IGZyb20gXCIuL2J1c1wiO1xuZXhwb3J0IGNvbnN0IGFjdGlvbnMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5leHBvcnQgY29uc3QgYWN0aW9uR3JvdXBzID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ICkge1xuXHRhY3Rpb25MaXN0LmZvckVhY2goIGZ1bmN0aW9uKCBhY3Rpb24gKSB7XG5cdFx0aWYgKCAhYWN0aW9uc1sgYWN0aW9uIF0gKSB7XG5cdFx0XHRhY3Rpb25zWyBhY3Rpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0XHRhY3Rpb25DaGFubmVsLnB1Ymxpc2goIHtcblx0XHRcdFx0XHR0b3BpYzogYGV4ZWN1dGUuJHthY3Rpb259YCxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb25UeXBlOiBhY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25BcmdzOiBhcmdzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSApO1xufVxuXG4vLyBUaGlzIG1ldGhvZCBpcyBkZXByZWNhdGVkLCBidXQgd2lsbCByZW1haW4gYXNcbi8vIGxvbmcgYXMgdGhlIHByaW50IHV0aWxzIG5lZWQgaXQuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGlvbkdyb3VwKCBncm91cCApIHtcblx0aWYgKCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKSB7XG5cdFx0cmV0dXJuIF8ucGljayggYWN0aW9ucywgYWN0aW9uR3JvdXBzWyBncm91cCBdICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIGdyb3VwIG5hbWVkICcke2dyb3VwfSdgICk7XG5cdH1cbn1cblxuLy8gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZCwgYnV0IHdpbGwgcmVtYWluIGFzXG4vLyBsb25nIGFzIHRoZSBwcmludCB1dGlscyBuZWVkIGl0LlxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcm91cHNXaXRoQWN0aW9uKCBhY3Rpb25OYW1lICkge1xuXHRjb25zdCBncm91cHMgPSBbXTtcblx0Zm9yICggdmFyIFsgZ3JvdXAsIGxpc3QgXSBvZiBlbnRyaWVzKCBhY3Rpb25Hcm91cHMgKSApIHtcblx0XHRpZiAoIGxpc3QuaW5kZXhPZiggYWN0aW9uTmFtZSApID49IDAgKSB7XG5cdFx0XHRncm91cHMucHVzaCggZ3JvdXAgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGdyb3Vwcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbUFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0T2JqZWN0LmFzc2lnbiggYWN0aW9ucywgYWN0aW9uICk7XG59XG5cbi8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQsIGJ1dCB3aWxsIHJlbWFpbiBhc1xuLy8gbG9uZyBhcyB0aGUgcHJpbnQgdXRpbHMgbmVlZCBpdC5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9BY3Rpb25Hcm91cCggZ3JvdXBOYW1lLCBhY3Rpb25MaXN0ICkge1xuXHRsZXQgZ3JvdXAgPSBhY3Rpb25Hcm91cHNbIGdyb3VwTmFtZSBdO1xuXHRpZiAoICFncm91cCApIHtcblx0XHRncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF0gPSBbXTtcblx0fVxuXHRhY3Rpb25MaXN0ID0gdHlwZW9mIGFjdGlvbkxpc3QgPT09IFwic3RyaW5nXCIgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGNvbnN0IGRpZmYgPSBfLmRpZmZlcmVuY2UoIGFjdGlvbkxpc3QsIE9iamVjdC5rZXlzKCBhY3Rpb25zICkgKTtcblx0aWYgKCBkaWZmLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGUgZm9sbG93aW5nIGFjdGlvbnMgZG8gbm90IGV4aXN0OiAke2RpZmYuam9pbiggXCIsIFwiICl9YCApO1xuXHR9XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiAoIGdyb3VwLmluZGV4T2YoIGFjdGlvbiApID09PSAtMSApIHtcblx0XHRcdGdyb3VwLnB1c2goIGFjdGlvbiApO1xuXHRcdH1cblx0fSApO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYWN0aW9ucy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8zX187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCB7XCJyb290XCI6XCJfXCIsXCJjb21tb25qc1wiOlwibG9kYXNoXCIsXCJjb21tb25qczJcIjpcImxvZGFzaFwiLFwiYW1kXCI6XCJsb2Rhc2hcIn1cbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgcG9zdGFsIGZyb20gXCJwb3N0YWxcIjtcblxuY29uc3QgYWN0aW9uQ2hhbm5lbCA9IHBvc3RhbC5jaGFubmVsKCBcImx1eC5hY3Rpb25cIiApO1xuY29uc3Qgc3RvcmVDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LnN0b3JlXCIgKTtcbmNvbnN0IGRpc3BhdGNoZXJDaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmRpc3BhdGNoZXJcIiApO1xuXG5leHBvcnQge1xuXHRhY3Rpb25DaGFubmVsLFxuXHRzdG9yZUNoYW5uZWwsXG5cdGRpc3BhdGNoZXJDaGFubmVsLFxuXHRwb3N0YWxcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9idXMuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfNV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJwb3N0YWxcIlxuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgeyBzdG9yZU1peGluLCBzdG9yZVJlYWN0TWl4aW4gfSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgYWN0aW9uQ3JlYXRvck1peGluLCBhY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiwgZGlzcGF0Y2ggfSBmcm9tIFwiLi9hY3Rpb25DcmVhdG9yXCI7XG5pbXBvcnQgeyBhY3Rpb25MaXN0ZW5lck1peGluIH0gZnJvbSBcIi4vYWN0aW9uTGlzdGVuZXJcIjtcbmltcG9ydCBsdXhXcmFwcGVyIGZyb20gXCIuL2x1eFdyYXBwZXJcIjtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmNvbnN0IGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmICggbWl4aW5zLmxlbmd0aCA9PT0gMCApIHtcblx0XHRtaXhpbnMgPSBbIHN0b3JlTWl4aW4sIGFjdGlvbkNyZWF0b3JNaXhpbiBdO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goICggbXhuICkgPT4ge1xuXHRcdGlmICggdHlwZW9mIG14biA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0bXhuID0gbXhuKCk7XG5cdFx0fVxuXHRcdGlmICggbXhuLm1peGluICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggY29udGV4dCwgbXhuLm1peGluICk7XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIG14bi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG14bi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYgKCBteG4udGVhcmRvd24gKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbXhuLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9ICk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gc3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmNvbnN0IHJlYWN0TWl4aW4gPSB7XG5cdGFjdGlvbkNyZWF0b3I6IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLFxuXHRzdG9yZTogc3RvcmVSZWFjdE1peGluXG59O1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgYWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkgKTtcbn1cblxuZXhwb3J0IHtcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdGFjdGlvbkxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdGRpc3BhdGNoLFxuXHRsdXhXcmFwcGVyXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgICAgICBTdG9yZSBNaXhpbiAgICAgICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuaW1wb3J0IHsgc3RvcmVDaGFubmVsLCBkaXNwYXRjaGVyQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AsIGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdGNvbnN0IHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdGNvbnN0IF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHRjb25zdCBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc3RvcmVzLm9uQ2hhbmdlLmNhbGwoIHRoaXMsIHBheWxvYWQgKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlTm90aWZ5KCBkYXRhICkge1xuXHR0aGlzLl9fbHV4LndhaXRGb3IgPSBkYXRhLnN0b3Jlcy5maWx0ZXIoXG5cdFx0KCBpdGVtICkgPT4gdGhpcy5zdG9yZXMubGlzdGVuVG8uaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxuZXhwb3J0IHZhciBzdG9yZU1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCB0aGlzICk7XG5cdFx0Y29uc3Qgc3RvcmVzID0gdGhpcy5zdG9yZXM7XG5cdFx0aWYgKCAhc3RvcmVzICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIllvdXIgY29tcG9uZW50IG11c3QgcHJvdmlkZSBhIFxcXCJzdG9yZXNcXFwiIGtleVwiICk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhc3RvcmVzLmxpc3RlblRvIHx8ICFzdG9yZXMubGlzdGVuVG8ubGVuZ3RoICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcImxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlXCIgKTtcblx0XHR9XG5cblx0XHRjb25zdCBsaXN0ZW5UbyA9IHR5cGVvZiBzdG9yZXMubGlzdGVuVG8gPT09IFwic3RyaW5nXCIgPyBbIHN0b3Jlcy5saXN0ZW5UbyBdIDogc3RvcmVzLmxpc3RlblRvO1xuXG5cdFx0aWYgKCAhc3RvcmVzLm9uQ2hhbmdlICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQSBjb21wb25lbnQgd2FzIHRvbGQgdG8gbGlzdGVuIHRvIHRoZSBmb2xsb3dpbmcgc3RvcmUocyk6ICR7bGlzdGVuVG99IGJ1dCBubyBvbkNoYW5nZSBoYW5kbGVyIHdhcyBpbXBsZW1lbnRlZGAgKTtcblx0XHR9XG5cblx0XHRfX2x1eC53YWl0Rm9yID0gW107XG5cdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0XHRsaXN0ZW5Uby5mb3JFYWNoKCAoIHN0b3JlICkgPT4ge1xuXHRcdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7c3RvcmV9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKCBgJHtzdG9yZX0uY2hhbmdlZGAsICgpID0+IGdhdGVLZWVwZXIuY2FsbCggdGhpcywgc3RvcmUgKSApO1xuXHRcdH0gKTtcblxuXHRcdF9fbHV4LnN1YnNjcmlwdGlvbnMucHJlbm90aWZ5ID0gZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBcInByZW5vdGlmeVwiLCAoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkuY2FsbCggdGhpcywgZGF0YSApICk7XG5cdH0sXG5cdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKCBsZXQgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0bGV0IHNwbGl0O1xuXHRcdFx0aWYgKCBrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCAoIHNwbGl0ID0ga2V5LnNwbGl0KCBcIi5cIiApICkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkgKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0bWl4aW46IHt9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RvcmVSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IHN0b3JlTWl4aW4uc2V0dXAsXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBzdG9yZU1peGluLnRlYXJkb3duXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL3N0b3JlLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25Hcm91cCwgYWN0aW9ucyB9IGZyb20gXCIuLi9hY3Rpb25zXCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICBBY3Rpb24gQ3JlYXRvciBNaXhpbiAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2goIGFjdGlvbiwgLi4uYXJncyApIHtcblx0aWYgKCBhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRhY3Rpb25zWyBhY3Rpb24gXSggLi4uYXJncyApO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZXJlIGlzIG5vIGFjdGlvbiBuYW1lZCAnJHthY3Rpb259J2AgKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgYWN0aW9uQ3JlYXRvck1peGluID0ge1xuXHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IHRoaXMuZ2V0QWN0aW9uR3JvdXAgfHwgW107XG5cdFx0dGhpcy5nZXRBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zIHx8IFtdO1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5nZXRBY3Rpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zID0gWyB0aGlzLmdldEFjdGlvbnMgXTtcblx0XHR9XG5cblx0XHRjb25zdCBhZGRBY3Rpb25JZk5vdFByZXNlbnQgPSAoIGssIHYgKSA9PiB7XG5cdFx0XHRpZiAoICF0aGlzWyBrIF0gKSB7XG5cdFx0XHRcdHRoaXNbIGsgXSA9IHY7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwLmZvckVhY2goICggZ3JvdXAgKSA9PiB7XG5cdFx0XHRmb3IgKCBsZXQgWyBrLCB2IF0gb2YgZW50cmllcyggZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkgKSApIHtcblx0XHRcdFx0YWRkQWN0aW9uSWZOb3RQcmVzZW50KCBrLCB2ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0aWYgKCB0aGlzLmdldEFjdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCgga2V5LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaCgga2V5LCAuLi5hcmd1bWVudHMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fSApO1xuXHRcdH1cblx0fSxcblx0bWl4aW46IHtcblx0XHRkaXNwYXRjaDogZGlzcGF0Y2hcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluID0ge1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IGFjdGlvbkNyZWF0b3JNaXhpbi5zZXR1cCxcblx0ZGlzcGF0Y2g6IGRpc3BhdGNoXG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvbWl4aW5zL2FjdGlvbkNyZWF0b3IuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICBBY3Rpb24gTGlzdGVuZXIgTWl4aW4gICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4uL2J1c1wiO1xuaW1wb3J0IHsgZW5zdXJlTHV4UHJvcCB9IGZyb20gXCIuLi91dGlsc1wiO1xuaW1wb3J0IHsgZ2VuZXJhdGVBY3Rpb25DcmVhdG9yLCBhZGRUb0FjdGlvbkdyb3VwIH0gZnJvbSBcIi4uL2FjdGlvbnNcIjtcbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25MaXN0ZW5lck1peGluKCB7IGhhbmRsZXJzLCBoYW5kbGVyRm4sIGNvbnRleHQsIGNoYW5uZWwsIHRvcGljIH0gPSB7fSApIHtcblx0cmV0dXJuIHtcblx0XHRzZXR1cCgpIHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXM7XG5cdFx0XHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGNvbnRleHQgKTtcblx0XHRcdGNvbnN0IHN1YnMgPSBfX2x1eC5zdWJzY3JpcHRpb25zO1xuXHRcdFx0aGFuZGxlcnMgPSBoYW5kbGVycyB8fCBjb250ZXh0LmhhbmRsZXJzO1xuXHRcdFx0Y2hhbm5lbCA9IGNoYW5uZWwgfHwgYWN0aW9uQ2hhbm5lbDtcblx0XHRcdHRvcGljID0gdG9waWMgfHwgXCJleGVjdXRlLipcIjtcblx0XHRcdGhhbmRsZXJGbiA9IGhhbmRsZXJGbiB8fCAoICggZGF0YSwgZW52ICkgPT4ge1xuXHRcdFx0XHRjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNbIGRhdGEuYWN0aW9uVHlwZSBdO1xuXHRcdFx0XHRpZiAoIGhhbmRsZXIgKSB7XG5cdFx0XHRcdFx0aGFuZGxlci5hcHBseSggY29udGV4dCwgZGF0YS5hY3Rpb25BcmdzICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdGlmICggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBhY3Rpb24gaGFuZGxlciBpbiB0aGUgaGFuZGxlcnMgcHJvcGVydHlcIiApO1xuXHRcdFx0fSBlbHNlIGlmICggc3VicyAmJiBzdWJzLmFjdGlvbkxpc3RlbmVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzdWJzLmFjdGlvbkxpc3RlbmVyID0gY2hhbm5lbC5zdWJzY3JpYmUoIHRvcGljLCBoYW5kbGVyRm4gKS5jb250ZXh0KCBjb250ZXh0ICk7XG5cdFx0XHRjb25zdCBoYW5kbGVyS2V5cyA9IE9iamVjdC5rZXlzKCBoYW5kbGVycyApO1xuXHRcdFx0Z2VuZXJhdGVBY3Rpb25DcmVhdG9yKCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0aWYgKCBjb250ZXh0Lm5hbWVzcGFjZSApIHtcblx0XHRcdFx0YWRkVG9BY3Rpb25Hcm91cCggY29udGV4dC5uYW1lc3BhY2UsIGhhbmRsZXJLZXlzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0ZWFyZG93bigpIHtcblx0XHRcdHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucy5hY3Rpb25MaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0fTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9hY3Rpb25MaXN0ZW5lci5qc1xuICoqLyIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHNldHVwU3RvcmVMaXN0ZW5lciwgc2V0dXBBY3Rpb25NYXAgfSBmcm9tIFwiLi93cmFwcGVyVXRpbHNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbHV4V3JhcHBlciggQ29tcG9uZW50LCB7IGFjdGlvbnMsIHN0b3JlcywgZ2V0U3RhdGUgfSApIHtcblx0Y2xhc3MgTHV4V3JhcHBlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdFx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdFx0c3VwZXIoIHByb3BzICk7XG5cdFx0XHRzZXR1cFN0b3JlTGlzdGVuZXIoIHRoaXMsIHsgc3RvcmVzLCBnZXRTdGF0ZSB9ICk7XG5cdFx0XHRzZXR1cEFjdGlvbk1hcCggdGhpcywgeyBhY3Rpb25zIH0gKTtcblx0XHRcdGlmICggZ2V0U3RhdGUgKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSBnZXRTdGF0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFx0Zm9yICggbGV0IFsga2V5LCBzdWIgXSBvZiBlbnRyaWVzKCB0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMgKSApIHtcblx0XHRcdFx0bGV0IHNwbGl0O1xuXHRcdFx0XHRpZiAoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0XHRzdWIudW5zdWJzY3JpYmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlbmRlcigpIHtcblx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRDb21wb25lbnQsXG5cdFx0XHRcdE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0e30sXG5cdFx0XHRcdFx0dGhpcy5wcm9wcyxcblx0XHRcdFx0XHR0aGlzLnByb3BUb0FjdGlvbixcblx0XHRcdFx0XHR0aGlzLnN0YXRlXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0THV4V3JhcHBlci5kaXNwbGF5TmFtZSA9IGBMdXhXcmFwcGVkKCR7IENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBcIkNvbXBvbmVudFwiIH0pYDtcblxuXHRyZXR1cm4gTHV4V3JhcHBlcjtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9sdXhXcmFwcGVyLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzExX187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCB7XCJyb290XCI6XCJSZWFjdFwiLFwiY29tbW9uanNcIjpcInJlYWN0XCIsXCJjb21tb25qczJcIjpcInJlYWN0XCIsXCJhbWRcIjpcInJlYWN0XCJ9XG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCB7IGVuc3VyZUx1eFByb3AsIGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IHN0b3JlQ2hhbm5lbCwgZGlzcGF0Y2hlckNoYW5uZWwgfSBmcm9tIFwiLi4vYnVzXCI7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gXCIuL2FjdGlvbkNyZWF0b3JcIjtcbmltcG9ydCB7IGlzU3RyaW5nLCBpc0Z1bmN0aW9uIH0gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2F0ZUtlZXBlciggaW5zdGFuY2UsIHsgZ2V0U3RhdGUgfSwgc3RvcmUgKSB7XG5cdGNvbnN0IHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdGNvbnN0IF9fbHV4ID0gaW5zdGFuY2UuX19sdXg7XG5cblx0Y29uc3QgZm91bmQgPSBfX2x1eC53YWl0Rm9yLmluZGV4T2YoIHN0b3JlICk7XG5cblx0aWYgKCBmb3VuZCA+IC0xICkge1xuXHRcdF9fbHV4LndhaXRGb3Iuc3BsaWNlKCBmb3VuZCwgMSApO1xuXHRcdF9fbHV4LmhlYXJkRnJvbS5wdXNoKCBwYXlsb2FkICk7XG5cblx0XHRpZiAoIF9fbHV4LndhaXRGb3IubGVuZ3RoID09PSAwICkge1xuXHRcdFx0X19sdXguaGVhcmRGcm9tID0gW107XG5cdFx0XHRpbnN0YW5jZS5zZXRTdGF0ZSggZ2V0U3RhdGUoIGluc3RhbmNlLnByb3BzLCBwYXlsb2FkICkgKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggaW5zdGFuY2UsIHN0b3JlcywgZGF0YSApIHtcblx0aW5zdGFuY2UuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiBzdG9yZXMuaW5kZXhPZiggaXRlbSApID4gLTFcblx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwU3RvcmVMaXN0ZW5lciggaW5zdGFuY2UsIHsgc3RvcmVzLCBnZXRTdGF0ZSB9ICkge1xuXHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIGluc3RhbmNlICk7XG5cdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0X19sdXguaGVhcmRGcm9tID0gW107XG5cblx0aWYgKCBzdG9yZXMgJiYgc3RvcmVzLmxlbmd0aCApIHtcblx0XHRzdG9yZXMuZm9yRWFjaCggKCBzdG9yZSApID0+IHtcblx0XHRcdF9fbHV4LnN1YnNjcmlwdGlvbnNbIGAkeyBzdG9yZSB9LmNoYW5nZWRgIF0gPSBzdG9yZUNoYW5uZWwuc3Vic2NyaWJlKFxuXHRcdFx0XHRgJHsgc3RvcmUgfS5jaGFuZ2VkYCxcblx0XHRcdFx0KCkgPT4gZ2F0ZUtlZXBlciggaW5zdGFuY2UsIHsgZ2V0U3RhdGUgfSwgc3RvcmUgKVxuXHRcdFx0KTtcblx0XHR9ICk7XG5cblx0XHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFwicHJlbm90aWZ5XCIsXG5cdFx0XHQoIGRhdGEgKSA9PiBoYW5kbGVQcmVOb3RpZnkoIGluc3RhbmNlLCBzdG9yZXMsIGRhdGEgKVxuXHRcdCk7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3ludGhldGljRXZlbnQoIGUgKSB7XG5cdHJldHVybiBlLmhhc093blByb3BlcnR5KCBcImV2ZW50UGhhc2VcIiApICYmXG5cdFx0ZS5oYXNPd25Qcm9wZXJ0eSggXCJuYXRpdmVFdmVudFwiICkgJiZcblx0XHRlLmhhc093blByb3BlcnR5KCBcInRhcmdldFwiICkgJiZcblx0XHRlLmhhc093blByb3BlcnR5KCBcInR5cGVcIiApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEFjdGlvbkNyZWF0b3IoIGFjdGlvbiApIHtcblx0aWYgKCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIGFjdGlvbiApID09PSBcIltvYmplY3QgU3RyaW5nXVwiICkge1xuXHRcdHJldHVybiBmdW5jdGlvbiggZSwgLi4uYXJncyApIHtcblx0XHRcdGlmICggIWlzU3ludGhldGljRXZlbnQoIGUgKSApIHtcblx0XHRcdFx0YXJncy51bnNoaWZ0KCBlICk7XG5cdFx0XHR9XG5cdFx0XHRkaXNwYXRjaCggYWN0aW9uLCAuLi5hcmdzICk7XG5cdFx0fTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBBY3Rpb25NYXAoIGluc3RhbmNlLCB7IGFjdGlvbnMgfSApIHtcblx0aW5zdGFuY2UucHJvcFRvQWN0aW9uID0ge307XG5cdGZvciAoIGxldCBbIGNoaWxkUHJvcCwgYWN0aW9uIF0gb2YgZW50cmllcyggYWN0aW9ucyB8fCB7fSApICkge1xuXHRcdGxldCBhY3Rpb25DcmVhdG9yID0gYWN0aW9uOyAvLyBhc3N1bWVzIGZ1bmN0aW9uIGJ5IGRlZmF1bHRcblx0XHRpZiAoIGlzU3RyaW5nKCBhY3Rpb24gKSApIHtcblx0XHRcdGFjdGlvbkNyZWF0b3IgPSBnZXREZWZhdWx0QWN0aW9uQ3JlYXRvciggYWN0aW9uICk7XG5cdFx0fSBlbHNlIGlmICggIWlzRnVuY3Rpb24oIGFjdGlvbiApICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIlRoZSB2YWx1ZXMgcHJvdmlkZWQgdG8gdGhlIGx1eFdyYXBwZXIgYWN0aW9ucyBwYXJhbWV0ZXIgbXVzdCBiZSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uXCIgKTtcblx0XHR9XG5cdFx0aW5zdGFuY2UucHJvcFRvQWN0aW9uWyBjaGlsZFByb3AgXSA9IGFjdGlvbkNyZWF0b3I7XG5cdH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy93cmFwcGVyVXRpbHMuanNcbiAqKi8iLCJpbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IG1peGluIH0gZnJvbSBcIi4vbWl4aW5zXCI7XG5cbmV4cG9ydCBjb25zdCBzdG9yZXMgPSB7fTtcblxuZnVuY3Rpb24gYnVpbGRBY3Rpb25MaXN0KCBoYW5kbGVycyApIHtcblx0Y29uc3QgYWN0aW9uTGlzdCA9IFtdO1xuXHRmb3IgKCBsZXQgWyBrZXksIGhhbmRsZXIgXSBvZiBlbnRyaWVzKCBoYW5kbGVycyApICkge1xuXHRcdGFjdGlvbkxpc3QucHVzaCgge1xuXHRcdFx0YWN0aW9uVHlwZToga2V5LFxuXHRcdFx0d2FpdEZvcjogaGFuZGxlci53YWl0Rm9yIHx8IFtdXG5cdFx0fSApO1xuXHR9XG5cdHJldHVybiBhY3Rpb25MaXN0O1xufVxuXG5mdW5jdGlvbiBlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCBzdG9yZSApIHtcblx0Y29uc3QgbmFtZXNwYWNlID0gKCBvcHRpb25zICYmIG9wdGlvbnMubmFtZXNwYWNlICkgfHwgc3RvcmUubmFtZXNwYWNlO1xuXHRpZiAoIG5hbWVzcGFjZSBpbiBzdG9yZXMgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlIHN0b3JlIG5hbWVzcGFjZSBcIiR7bmFtZXNwYWNlfVwiIGFscmVhZHkgZXhpc3RzLmAgKTtcblx0fVxuXHRpZiAoICFuYW1lc3BhY2UgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhIG5hbWVzcGFjZSB2YWx1ZSBwcm92aWRlZFwiICk7XG5cdH1cblx0aWYgKCAhaGFuZGxlcnMgfHwgIU9iamVjdC5rZXlzKCBoYW5kbGVycyApLmxlbmd0aCApIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiQSBsdXggc3RvcmUgbXVzdCBoYXZlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZHMgcHJvdmlkZWRcIiApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICkge1xuXHRyZXR1cm4ge1xuXHRcdHdhaXRGb3I6IFtdLFxuXHRcdGhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGNoYW5nZWQgPSAwO1xuXHRcdFx0Y29uc3QgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0bGlzdGVuZXJzWyBrZXkgXS5mb3JFYWNoKCBmdW5jdGlvbiggbGlzdGVuZXIgKSB7XG5cdFx0XHRcdGNoYW5nZWQgKz0gKCBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApID09PSBmYWxzZSA/IDAgOiAxICk7XG5cdFx0XHR9LmJpbmQoIHRoaXMgKSApO1xuXHRcdFx0cmV0dXJuIGNoYW5nZWQgPiAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlV2FpdEZvciggc291cmNlLCBoYW5kbGVyT2JqZWN0ICkge1xuXHRpZiAoIHNvdXJjZS53YWl0Rm9yICkge1xuXHRcdHNvdXJjZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRpZiAoIGhhbmRsZXJPYmplY3Qud2FpdEZvci5pbmRleE9mKCBkZXAgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdGhhbmRsZXJPYmplY3Qud2FpdEZvci5wdXNoKCBkZXAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkTGlzdGVuZXJzKCBsaXN0ZW5lcnMsIGtleSwgaGFuZGxlciApIHtcblx0bGlzdGVuZXJzWyBrZXkgXSA9IGxpc3RlbmVyc1sga2V5IF0gfHwgW107XG5cdGxpc3RlbmVyc1sga2V5IF0ucHVzaCggaGFuZGxlci5oYW5kbGVyIHx8IGhhbmRsZXIgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0aW9ucyApIHtcblx0Y29uc3QgbGlzdGVuZXJzID0ge307XG5cdGNvbnN0IGhhbmRsZXJzID0ge307XG5cdGNvbnN0IHN0YXRlID0ge307XG5cdGNvbnN0IG90aGVyT3B0cyA9IHt9O1xuXHRvcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uKCBvICkge1xuXHRcdGxldCBvcHQ7XG5cdFx0aWYgKCBvICkge1xuXHRcdFx0b3B0ID0gXy5jbG9uZSggbyApO1xuXHRcdFx0Xy5tZXJnZSggc3RhdGUsIG9wdC5zdGF0ZSApO1xuXHRcdFx0aWYgKCBvcHQuaGFuZGxlcnMgKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKCBvcHQuaGFuZGxlcnMgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVyID0gb3B0LmhhbmRsZXJzWyBrZXkgXTtcblx0XHRcdFx0XHQvLyBzZXQgdXAgdGhlIGFjdHVhbCBoYW5kbGVyIG1ldGhvZCB0aGF0IHdpbGwgYmUgZXhlY3V0ZWRcblx0XHRcdFx0XHQvLyBhcyB0aGUgc3RvcmUgaGFuZGxlcyBhIGRpc3BhdGNoZWQgYWN0aW9uXG5cdFx0XHRcdFx0aGFuZGxlcnNbIGtleSBdID0gaGFuZGxlcnNbIGtleSBdIHx8IGdldEhhbmRsZXJPYmplY3QoIGtleSwgbGlzdGVuZXJzICk7XG5cdFx0XHRcdFx0Ly8gZW5zdXJlIHRoYXQgdGhlIGhhbmRsZXIgZGVmaW5pdGlvbiBoYXMgYSBsaXN0IG9mIGFsbCBzdG9yZXNcblx0XHRcdFx0XHQvLyBiZWluZyB3YWl0ZWQgdXBvblxuXHRcdFx0XHRcdHVwZGF0ZVdhaXRGb3IoIGhhbmRsZXIsIGhhbmRsZXJzWyBrZXkgXSApO1xuXHRcdFx0XHRcdC8vIEFkZCB0aGUgb3JpZ2luYWwgaGFuZGxlciBtZXRob2QocykgdG8gdGhlIGxpc3RlbmVycyBxdWV1ZVxuXHRcdFx0XHRcdGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRcdGRlbGV0ZSBvcHQuc3RhdGU7XG5cdFx0XHRfLm1lcmdlKCBvdGhlck9wdHMsIG9wdCApO1xuXHRcdH1cblx0fSApO1xuXHRyZXR1cm4gWyBzdGF0ZSwgaGFuZGxlcnMsIG90aGVyT3B0cyBdO1xufVxuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuXG5cdGNvbnN0cnVjdG9yKCAuLi5vcHQgKSB7XG5cdFx0bGV0IFsgc3RhdGUsIGhhbmRsZXJzLCBvcHRpb25zIF0gPSBwcm9jZXNzU3RvcmVBcmdzKCAuLi5vcHQgKTtcblx0XHRlbnN1cmVTdG9yZU9wdGlvbnMoIG9wdGlvbnMsIGhhbmRsZXJzLCB0aGlzICk7XG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2U7XG5cdFx0T2JqZWN0LmFzc2lnbiggdGhpcywgb3B0aW9ucyApO1xuXHRcdHN0b3Jlc1sgbmFtZXNwYWNlIF0gPSB0aGlzO1xuXHRcdGxldCBpbkRpc3BhdGNoID0gZmFsc2U7XG5cdFx0dGhpcy5oYXNDaGFuZ2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGU7XG5cdFx0fTtcblxuXHRcdHRoaXMuc2V0U3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwic2V0U3RhdGUgY2FuIG9ubHkgYmUgY2FsbGVkIGR1cmluZyBhIGRpc3BhdGNoIGN5Y2xlIGZyb20gYSBzdG9yZSBhY3Rpb24gaGFuZGxlci5cIiApO1xuXHRcdFx0fVxuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbiggbmV3U3RhdGUgKSB7XG5cdFx0XHRpZiAoICFpbkRpc3BhdGNoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwicmVwbGFjZVN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdC8vIHdlIHByZXNlcnZlIHRoZSB1bmRlcmx5aW5nIHN0YXRlIHJlZiwgYnV0IGNsZWFyIGl0XG5cdFx0XHRPYmplY3Qua2V5cyggc3RhdGUgKS5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRkZWxldGUgc3RhdGVbIGtleSBdO1xuXHRcdFx0fSApO1xuXHRcdFx0c3RhdGUgPSBPYmplY3QuYXNzaWduKCBzdGF0ZSwgbmV3U3RhdGUgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuXHRcdFx0aW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYgKCB0aGlzLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdFx0XHRzdG9yZUNoYW5uZWwucHVibGlzaCggYCR7dGhpcy5uYW1lc3BhY2V9LmNoYW5nZWRgICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1peGluKCB0aGlzLCBtaXhpbi5hY3Rpb25MaXN0ZW5lcigge1xuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGNoYW5uZWw6IGRpc3BhdGNoZXJDaGFubmVsLFxuXHRcdFx0dG9waWM6IGAke25hbWVzcGFjZX0uaGFuZGxlLipgLFxuXHRcdFx0aGFuZGxlcnM6IGhhbmRsZXJzLFxuXHRcdFx0aGFuZGxlckZuOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0aWYgKCBoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5hY3Rpb25UeXBlICkgKSB7XG5cdFx0XHRcdFx0aW5EaXNwYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXS5oYW5kbGVyLmFwcGx5KCB0aGlzLCBkYXRhLmFjdGlvbkFyZ3MuY29uY2F0KCBkYXRhLmRlcHMgKSApO1xuXHRcdFx0XHRcdHRoaXMuaGFzQ2hhbmdlZCA9ICggcmVzID09PSBmYWxzZSApID8gZmFsc2UgOiB0cnVlO1xuXHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRcdFx0XHRgJHt0aGlzLm5hbWVzcGFjZX0uaGFuZGxlZC4ke2RhdGEuYWN0aW9uVHlwZX1gLFxuXHRcdFx0XHRcdFx0eyBoYXNDaGFuZ2VkOiB0aGlzLmhhc0NoYW5nZWQsIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0uYmluZCggdGhpcyApXG5cdFx0fSApICk7XG5cblx0XHR0aGlzLl9fc3Vic2NyaXB0aW9uID0ge1xuXHRcdFx0bm90aWZ5OiBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIGBub3RpZnlgLCAoKSA9PiB0aGlzLmZsdXNoKCkgKVxuXHRcdFx0XHRcdC5jb25zdHJhaW50KCAoKSA9PiBpbkRpc3BhdGNoIClcblx0XHR9O1xuXG5cdFx0ZGlzcGF0Y2hlci5yZWdpc3RlclN0b3JlKFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lc3BhY2UsXG5cdFx0XHRcdGFjdGlvbnM6IGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHQvLyBOZWVkIHRvIGJ1aWxkIGluIGJlaGF2aW9yIHRvIHJlbW92ZSB0aGlzIHN0b3JlXG5cdC8vIGZyb20gdGhlIGRpc3BhdGNoZXIncyBhY3Rpb25NYXAgYXMgd2VsbCFcblx0ZGlzcG9zZSgpIHtcblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgc3Vic2NyaXB0aW9uIF0gb2YgZW50cmllcyggdGhpcy5fX3N1YnNjcmlwdGlvbiApICkge1xuXHRcdFx0c3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRcdGRlbGV0ZSBzdG9yZXNbIHRoaXMubmFtZXNwYWNlIF07XG5cdFx0ZGlzcGF0Y2hlci5yZW1vdmVTdG9yZSggdGhpcy5uYW1lc3BhY2UgKTtcblx0XHR0aGlzLmx1eENsZWFudXAoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0c3RvcmVzWyBuYW1lc3BhY2UgXS5kaXNwb3NlKCk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zdG9yZS5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZGlzcGF0Y2hlckNoYW5uZWwsIGFjdGlvbkNoYW5uZWwgfSBmcm9tIFwiLi9idXNcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IG1hY2hpbmEgZnJvbSBcIm1hY2hpbmFcIjtcblxuZnVuY3Rpb24gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCBnZW4sIGFjdGlvblR5cGUsIG5hbWVzcGFjZXMgKSB7XG5cdGxldCBjYWxjZEdlbiA9IGdlbjtcblx0Y29uc3QgX25hbWVzcGFjZXMgPSBuYW1lc3BhY2VzIHx8IFtdO1xuXHRpZiAoIF9uYW1lc3BhY2VzLmluZGV4T2YoIHN0b3JlLm5hbWVzcGFjZSApID4gLTEgKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCBmb3IgdGhlIFwiJHtzdG9yZS5uYW1lc3BhY2V9XCIgc3RvcmUgd2hlbiBwYXJ0aWNpcGF0aW5nIGluIHRoZSBcIiR7YWN0aW9uVHlwZX1cIiBhY3Rpb24uYCApO1xuXHR9XG5cdGlmICggc3RvcmUud2FpdEZvciAmJiBzdG9yZS53YWl0Rm9yLmxlbmd0aCApIHtcblx0XHRzdG9yZS53YWl0Rm9yLmZvckVhY2goIGZ1bmN0aW9uKCBkZXAgKSB7XG5cdFx0XHRjb25zdCBkZXBTdG9yZSA9IGxvb2t1cFsgZGVwIF07XG5cdFx0XHRpZiAoIGRlcFN0b3JlICkge1xuXHRcdFx0XHRfbmFtZXNwYWNlcy5wdXNoKCBzdG9yZS5uYW1lc3BhY2UgKTtcblx0XHRcdFx0Y29uc3QgdGhpc0dlbiA9IGNhbGN1bGF0ZUdlbiggZGVwU3RvcmUsIGxvb2t1cCwgZ2VuICsgMSwgYWN0aW9uVHlwZSwgX25hbWVzcGFjZXMgKTtcblx0XHRcdFx0aWYgKCB0aGlzR2VuID4gY2FsY2RHZW4gKSB7XG5cdFx0XHRcdFx0Y2FsY2RHZW4gPSB0aGlzR2VuO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oIGBUaGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uIGluIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdhaXRzIGZvciBcIiR7ZGVwfVwiIGJ1dCBhIHN0b3JlIHdpdGggdGhhdCBuYW1lc3BhY2UgZG9lcyBub3QgcGFydGljaXBhdGUgaW4gdGhpcyBhY3Rpb24uYCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gY2FsY2RHZW47XG59XG5cbmZ1bmN0aW9uIGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApIHtcblx0Y29uc3QgdHJlZSA9IFtdO1xuXHRjb25zdCBsb29rdXAgPSB7fTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBsb29rdXBbIHN0b3JlLm5hbWVzcGFjZSBdID0gc3RvcmUgKTtcblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiBzdG9yZS5nZW4gPSBjYWxjdWxhdGVHZW4oIHN0b3JlLCBsb29rdXAsIDAsIGFjdGlvblR5cGUgKSApO1xuXHQvKmVzbGludC1kaXNhYmxlICovXG5cdGZvciAoIGxldCBbIGtleSwgaXRlbSBdIG9mIGVudHJpZXMoIGxvb2t1cCApICkge1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0gPSB0cmVlWyBpdGVtLmdlbiBdIHx8IFtdO1xuXHRcdHRyZWVbIGl0ZW0uZ2VuIF0ucHVzaCggaXRlbSApO1xuXHR9XG5cdC8qZXNsaW50LWVuYWJsZSAqL1xuXHRyZXR1cm4gdHJlZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0dlbmVyYXRpb24oIGdlbmVyYXRpb24sIGFjdGlvbiApIHtcblx0Z2VuZXJhdGlvbi5tYXAoICggc3RvcmUgKSA9PiB7XG5cdFx0Y29uc3QgZGF0YSA9IE9iamVjdC5hc3NpZ24oIHtcblx0XHRcdGRlcHM6IF8ucGljayggdGhpcy5zdG9yZXMsIHN0b3JlLndhaXRGb3IgKVxuXHRcdH0sIGFjdGlvbiApO1xuXHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goXG5cdFx0XHRgJHtzdG9yZS5uYW1lc3BhY2V9LmhhbmRsZS4ke2FjdGlvbi5hY3Rpb25UeXBlfWAsXG5cdFx0XHRkYXRhXG5cdFx0KTtcblx0fSApO1xufVxuXG5jbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgbWFjaGluYS5CZWhhdmlvcmFsRnNtIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoIHtcblx0XHRcdGluaXRpYWxTdGF0ZTogXCJyZWFkeVwiLFxuXHRcdFx0YWN0aW9uTWFwOiB7fSxcblx0XHRcdHN0YXRlczoge1xuXHRcdFx0XHRyZWFkeToge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmRpc3BhdGNoXCI6IFwiZGlzcGF0Y2hpbmdcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkaXNwYXRjaGluZzoge1xuXHRcdFx0XHRcdF9vbkVudGVyOiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0dGhpcy5hY3Rpb25Db250ZXh0ID0gbHV4QWN0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKCB2YXIgZ2VuZXJhdGlvbiBvZiBsdXhBY3Rpb24uZ2VuZXJhdGlvbnMgKSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc0dlbmVyYXRpb24uY2FsbCggbHV4QWN0aW9uLCBnZW5lcmF0aW9uLCBsdXhBY3Rpb24uYWN0aW9uICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGhpcy50cmFuc2l0aW9uKCBsdXhBY3Rpb24sIFwibm90aWZ5aW5nXCIgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGhhbmRsZWRcIiApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJhY3Rpb24uaGFuZGxlZFwiOiBmdW5jdGlvbiggbHV4QWN0aW9uLCBkYXRhICkge1xuXHRcdFx0XHRcdFx0aWYgKCBkYXRhLmhhc0NoYW5nZWQgKSB7XG5cdFx0XHRcdFx0XHRcdGx1eEFjdGlvbi51cGRhdGVkLnB1c2goIGRhdGEubmFtZXNwYWNlICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRfb25FeGl0OiBmdW5jdGlvbiggbHV4QWN0aW9uICkge1xuXHRcdFx0XHRcdFx0aWYgKCBsdXhBY3Rpb24udXBkYXRlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwicHJlbm90aWZ5XCIsIHsgc3RvcmVzOiBsdXhBY3Rpb24udXBkYXRlZCB9ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RpZnlpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGRpc3BhdGNoZXJDaGFubmVsLnB1Ymxpc2goIFwibm90aWZ5XCIsIHtcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBsdXhBY3Rpb24uYWN0aW9uXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3RoYW5kbGVkOiB7fVxuXHRcdFx0fSxcblx0XHRcdGdldFN0b3Jlc0hhbmRsaW5nKCBhY3Rpb25UeXBlICkge1xuXHRcdFx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uVHlwZSBdIHx8IFtdO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHN0b3Jlcyxcblx0XHRcdFx0XHRnZW5lcmF0aW9uczogYnVpbGRHZW5lcmF0aW9ucyggc3RvcmVzLCBhY3Rpb25UeXBlIClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdFx0dGhpcy5jcmVhdGVTdWJzY3JpYmVycygpO1xuXHR9XG5cblx0aGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKSB7XG5cdFx0Y29uc3QgbHV4QWN0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHsgYWN0aW9uOiBkYXRhLCBnZW5lcmF0aW9uSW5kZXg6IDAsIHVwZGF0ZWQ6IFtdIH0sXG5cdFx0XHR0aGlzLmdldFN0b3Jlc0hhbmRsaW5nKCBkYXRhLmFjdGlvblR5cGUgKVxuXHRcdCk7XG5cdFx0dGhpcy5oYW5kbGUoIGx1eEFjdGlvbiwgXCJhY3Rpb24uZGlzcGF0Y2hcIiApO1xuXHR9XG5cblx0cmVnaXN0ZXJTdG9yZSggc3RvcmVNZXRhICkge1xuXHRcdGZvciAoIGxldCBhY3Rpb25EZWYgb2Ygc3RvcmVNZXRhLmFjdGlvbnMgKSB7XG5cdFx0XHRsZXQgYWN0aW9uO1xuXHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IGFjdGlvbkRlZi5hY3Rpb25UeXBlO1xuXHRcdFx0Y29uc3QgYWN0aW9uTWV0YSA9IHtcblx0XHRcdFx0bmFtZXNwYWNlOiBzdG9yZU1ldGEubmFtZXNwYWNlLFxuXHRcdFx0XHR3YWl0Rm9yOiBhY3Rpb25EZWYud2FpdEZvclxuXHRcdFx0fTtcblx0XHRcdGFjdGlvbiA9IHRoaXMuYWN0aW9uTWFwWyBhY3Rpb25OYW1lIF0gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdIHx8IFtdO1xuXHRcdFx0YWN0aW9uLnB1c2goIGFjdGlvbk1ldGEgKTtcblx0XHR9XG5cdH1cblxuXHRyZW1vdmVTdG9yZSggbmFtZXNwYWNlICkge1xuXHRcdGZ1bmN0aW9uIGlzVGhpc05hbWVTcGFjZSggbWV0YSApIHtcblx0XHRcdHJldHVybiBtZXRhLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlO1xuXHRcdH1cblx0XHQvKmVzbGludC1kaXNhYmxlICovXG5cdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIHRoaXMuYWN0aW9uTWFwICkgKSB7XG5cdFx0XHRsZXQgaWR4ID0gdi5maW5kSW5kZXgoIGlzVGhpc05hbWVTcGFjZSApO1xuXHRcdFx0aWYgKCBpZHggIT09IC0xICkge1xuXHRcdFx0XHR2LnNwbGljZSggaWR4LCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qZXNsaW50LWVuYWJsZSAqL1xuXHR9XG5cblx0Y3JlYXRlU3Vic2NyaWJlcnMoKSB7XG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbnMgPSBbXG5cdFx0XHRhY3Rpb25DaGFubmVsLnN1YnNjcmliZShcblx0XHRcdFx0XCJleGVjdXRlLipcIixcblx0XHRcdFx0KCBkYXRhLCBlbnYgKSA9PiB0aGlzLmhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhIClcblx0XHRcdCksXG5cdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFwiKi5oYW5kbGVkLipcIixcblx0XHRcdFx0KCBkYXRhICkgPT4gdGhpcy5oYW5kbGUoIHRoaXMuYWN0aW9uQ29udGV4dCwgXCJhY3Rpb24uaGFuZGxlZFwiLCBkYXRhIClcblx0XHRcdCkuY29uc3RyYWludCggKCkgPT4gISF0aGlzLmFjdGlvbkNvbnRleHQgKVxuXHRcdF07XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdGlmICggdGhpcy5fX3N1YnNjcmlwdGlvbnMgKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKCAoIHN1YnNjcmlwdGlvbiApID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpICk7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBEaXNwYXRjaGVyKCk7XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2Rpc3BhdGNoZXIuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTVfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwibWFjaGluYVwiXG4gKiogbW9kdWxlIGlkID0gMTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=