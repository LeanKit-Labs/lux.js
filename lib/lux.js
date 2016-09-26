/*!
 *  * lux.js - Flux-based architecture for using ReactJS at LeanKit
 *  * Author: Jim Cowart
 *  * Version: v2.0.0-2
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

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	/* istanbul ignore next */
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	/*istanbul ignore next*/var _utils2 = _interopRequireDefault(_utils);
	
	var /*istanbul ignore next*/_actions = __webpack_require__(2);
	
	var /*istanbul ignore next*/_mixins = __webpack_require__(6);
	
	var /*istanbul ignore next*/_store = __webpack_require__(12);
	
	var /*istanbul ignore next*/_extend = __webpack_require__(15);
	
	var /*istanbul ignore next*/_dispatcher = __webpack_require__(13);
	
	/*istanbul ignore next*/var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	if (!(typeof global === "undefined" ? window : global)._babelPolyfill) {
		throw new Error("You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details.");
	}
	
	function publishAction() {
		if (console && typeof console.log === "function") {
			console.log("lux.publishAction has been deprecated and will be removed in future releases. Please use lux.dispatch.");
		}
		/*istanbul ignore next*/_mixins.dispatch.apply( /*istanbul ignore next*/undefined, /*istanbul ignore next*/arguments);
	}
	
	/*istanbul ignore next*/_store.Store.extend = /*istanbul ignore next*/_extend.extend;
	
	/*istanbul ignore next*/exports.default = {
		actions: /*istanbul ignore next*/_actions.actions,
		customActionCreator: /*istanbul ignore next*/_actions.customActionCreator,
		dispatch: /*istanbul ignore next*/_mixins.dispatch,
		publishAction: publishAction,
		dispatcher: /*istanbul ignore next*/_dispatcher2.default,
		getActionGroup: /*istanbul ignore next*/_actions.getActionGroup,
		actionCreatorListener: /*istanbul ignore next*/_mixins.actionCreatorListener,
		actionCreator: /*istanbul ignore next*/_mixins.actionCreator,
		actionListener: /*istanbul ignore next*/_mixins.actionListener,
		mixin: /*istanbul ignore next*/_mixins.mixin,
		reactMixin: /*istanbul ignore next*/_mixins.reactMixin,
		removeStore: /*istanbul ignore next*/_store.removeStore,
		Store: /*istanbul ignore next*/_store.Store,
		stores: /*istanbul ignore next*/_store.stores,
		utils: /*istanbul ignore next*/_utils2.default,
		LuxContainer: /*istanbul ignore next*/_mixins.LuxContainer
	};
	/*istanbul ignore next*/module.exports = exports["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.ensureLuxProp = ensureLuxProp;
	/*istanbul ignore next*/exports.entries = entries;
	
	/*istanbul ignore next*/var _marked = [entries].map(regeneratorRuntime.mark);
	
	function ensureLuxProp(context) {
		var __lux = context.__lux = context.__lux || {};
		/*eslint-disable */
		var cleanup = __lux.cleanup = __lux.cleanup || [];
		var subscriptions = __lux.subscriptions = __lux.subscriptions || {};
		/*eslint-enable */
		return __lux;
	}
	
	function entries(obj) /*istanbul ignore next*/{
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, k;
	
		return regeneratorRuntime.wrap(function entries$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						if (["object", "function"].indexOf( /*istanbul ignore next*/typeof obj === "undefined" ? "undefined" : _typeof(obj)) === -1) {
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

	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionGroups = exports.actions = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.generateActionCreator = generateActionCreator;
	/*istanbul ignore next*/exports.getActionGroup = getActionGroup;
	/*istanbul ignore next*/exports.getGroupsWithAction = getGroupsWithAction;
	/*istanbul ignore next*/exports.customActionCreator = customActionCreator;
	/*istanbul ignore next*/exports.addToActionGroup = addToActionGroup;
	
	var /*istanbul ignore next*/_lodash = __webpack_require__(3);
	
	/*istanbul ignore next*/var _lodash2 = _interopRequireDefault(_lodash);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	/*istanbul ignore next*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var actions = /*istanbul ignore next*/exports.actions = Object.create(null);
	var actionGroups = /*istanbul ignore next*/exports.actionGroups = Object.create(null);
	
	function generateActionCreator(actionList) {
		actionList = typeof actionList === "string" ? [actionList] : actionList;
		actionList.forEach(function (action) {
			if (!actions[action]) {
				actions[action] = function () {
					var args = Array.from(arguments);
					/*istanbul ignore next*/_bus.actionChannel.publish({
						topic: /*istanbul ignore next*/"execute." + action,
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
			return (/*istanbul ignore next*/_lodash2.default.pick(actions, actionGroups[group])
			);
		} else {
			throw new Error( /*istanbul ignore next*/"There is no action group named '" + group + "'");
		}
	}
	
	// This method is deprecated, but will remain as
	// long as the print utils need it.
	/* istanbul ignore next */
	function getGroupsWithAction(actionName) {
		var groups = [];
		/*istanbul ignore next*/var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)(actionGroups)[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
				/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
				var group = _step$value[0];
				/*istanbul ignore next*/var list = _step$value[1];
	
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
		var diff = /*istanbul ignore next*/_lodash2.default.difference(actionList, Object.keys(actions));
		if (diff.length) {
			throw new Error( /*istanbul ignore next*/"The following actions do not exist: " + diff.join(", "));
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

	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.postal = exports.dispatcherChannel = exports.storeChannel = exports.actionChannel = undefined;
	
	var /*istanbul ignore next*/_postal = __webpack_require__(5);
	
	/*istanbul ignore next*/var _postal2 = _interopRequireDefault(_postal);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var actionChannel = /*istanbul ignore next*/_postal2.default.channel("lux.action");
	var storeChannel = /*istanbul ignore next*/_postal2.default.channel("lux.store");
	var dispatcherChannel = /*istanbul ignore next*/_postal2.default.channel("lux.dispatcher");
	
	/*istanbul ignore next*/exports.actionChannel = actionChannel;
	/*istanbul ignore next*/exports.storeChannel = storeChannel;
	/*istanbul ignore next*/exports.dispatcherChannel = dispatcherChannel;
	/*istanbul ignore next*/exports.postal = _postal2.default;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.LuxContainer = exports.dispatch = exports.actionCreatorListener = exports.actionCreator = exports.actionListener = exports.reactMixin = exports.mixin = undefined;
	
	var /*istanbul ignore next*/_store = __webpack_require__(7);
	
	var /*istanbul ignore next*/_actionCreator = __webpack_require__(8);
	
	var /*istanbul ignore next*/_actionListener = __webpack_require__(9);
	
	var /*istanbul ignore next*/_luxContainer = __webpack_require__(10);
	
	/*istanbul ignore next*/var _luxContainer2 = _interopRequireDefault(_luxContainer);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*********************************************
	*   Generalized Mixin Behavior for non-lux   *
	**********************************************/
	var luxMixinCleanup = function luxMixinCleanup() {
		/*istanbul ignore next*/var _this = this;
	
		this.__lux.cleanup.forEach(function (method) /*istanbul ignore next*/{
			return method.call( /*istanbul ignore next*/_this);
		});
		this.__lux.cleanup = undefined;
		delete this.__lux.cleanup;
	};
	
	function mixin(context) {
		/*istanbul ignore next*/for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			mixins[_key - 1] = arguments[_key];
		}
	
		if (mixins.length === 0) {
			mixins = [/*istanbul ignore next*/_store.storeMixin, /*istanbul ignore next*/_actionCreator.actionCreatorMixin];
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
	
	mixin.store = /*istanbul ignore next*/_store.storeMixin;
	mixin.actionCreator = /*istanbul ignore next*/_actionCreator.actionCreatorMixin;
	mixin.actionListener = /*istanbul ignore next*/_actionListener.actionListenerMixin;
	
	var reactMixin = {
		actionCreator: /*istanbul ignore next*/_actionCreator.actionCreatorReactMixin,
		store: /*istanbul ignore next*/_store.storeReactMixin
	};
	
	function actionListener(target) {
		return mixin(target, /*istanbul ignore next*/_actionListener.actionListenerMixin);
	}
	
	function actionCreator(target) {
		return mixin(target, /*istanbul ignore next*/_actionCreator.actionCreatorMixin);
	}
	
	function actionCreatorListener(target) {
		return actionCreator(actionListener(target));
	}
	
	/*istanbul ignore next*/exports.mixin = mixin;
	/*istanbul ignore next*/exports.reactMixin = reactMixin;
	/*istanbul ignore next*/exports.actionListener = actionListener;
	/*istanbul ignore next*/exports.actionCreator = actionCreator;
	/*istanbul ignore next*/exports.actionCreatorListener = actionCreatorListener;
	/*istanbul ignore next*/exports.dispatch = _actionCreator.dispatch;
	/*istanbul ignore next*/exports.LuxContainer = _luxContainer2.default;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*********************************************
	*                 Store Mixin                *
	**********************************************/
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.storeReactMixin = exports.storeMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
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
		/*istanbul ignore next*/var _this = this;
	
		this.__lux.waitFor = data.stores.filter(function (item) /*istanbul ignore next*/{
			return (/*istanbul ignore next*/_this.stores.listenTo.indexOf(item) > -1
			);
		});
	}
	
	var storeMixin = /*istanbul ignore next*/exports.storeMixin = {
		setup: function /*istanbul ignore next*/setup() {
			/*istanbul ignore next*/var _this2 = this;
	
			var __lux = /*istanbul ignore next*/(0, _utils.ensureLuxProp)(this);
			var stores = this.stores = this.stores || {};
	
			if (!stores.listenTo || !stores.listenTo.length) {
				throw new Error( /*istanbul ignore next*/"listenTo must contain at least one store namespace");
			}
	
			var listenTo = typeof stores.listenTo === "string" ? [stores.listenTo] : stores.listenTo;
	
			if (!stores.onChange) {
				throw new Error( /*istanbul ignore next*/"A component was told to listen to the following store(s): " + listenTo + " but no onChange handler was implemented");
			}
	
			__lux.waitFor = [];
			__lux.heardFrom = [];
	
			listenTo.forEach(function (store) {
				__lux.subscriptions[/*istanbul ignore next*/store + ".changed"] = /*istanbul ignore next*/_bus.storeChannel.subscribe( /*istanbul ignore next*/store + ".changed", function () /*istanbul ignore next*/{
					return gateKeeper.call( /*istanbul ignore next*/_this2, store);
				});
			});
	
			__lux.subscriptions.prenotify = /*istanbul ignore next*/_bus.dispatcherChannel.subscribe("prenotify", function (data) /*istanbul ignore next*/{
				return handlePreNotify.call( /*istanbul ignore next*/_this2, data);
			});
		},
		teardown: function /*istanbul ignore next*/teardown() {
			/*istanbul ignore next*/var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;
	
			try {
				for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)(this.__lux.subscriptions)[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
					/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
					var key = _step$value[0];
					/*istanbul ignore next*/var sub = _step$value[1];
	
					var split = /*istanbul ignore next*/void 0;
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
	
	var storeReactMixin = /*istanbul ignore next*/exports.storeReactMixin = {
		componentWillMount: storeMixin.setup,
		componentWillUnmount: storeMixin.teardown
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionCreatorReactMixin = exports.actionCreatorMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.dispatch = dispatch;
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_actions = __webpack_require__(2);
	
	/*********************************************
	*           Action Creator Mixin          *
	**********************************************/
	
	function dispatch(action) {
		if ( /*istanbul ignore next*/_actions.actions[action]) {
			/*istanbul ignore next*/for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}
	
			/*istanbul ignore next*/_actions.actions[action]. /*istanbul ignore next*/apply( /*istanbul ignore next*/_actions.actions, args);
		} else {
			throw new Error( /*istanbul ignore next*/"There is no action named '" + action + "'");
		}
	}
	
	var actionCreatorMixin = /*istanbul ignore next*/exports.actionCreatorMixin = {
		setup: function /*istanbul ignore next*/setup() {
			/*istanbul ignore next*/var _this = this;
	
			this.getActionGroup = this.getActionGroup || [];
			this.getActions = this.getActions || [];
	
			if (typeof this.getActionGroup === "string") {
				this.getActionGroup = [this.getActionGroup];
			}
	
			if (typeof this.getActions === "string") {
				this.getActions = [this.getActions];
			}
	
			var addActionIfNotPresent = function addActionIfNotPresent(k, v) {
				if (! /*istanbul ignore next*/_this[k]) {
					/*istanbul ignore next*/_this[k] = v;
				}
			};
			this.getActionGroup.forEach(function (group) {
				/*istanbul ignore next*/var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)( /*istanbul ignore next*/(0, _actions.getActionGroup)(group))[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
						/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
						var k = _step$value[0];
						/*istanbul ignore next*/var v = _step$value[1];
	
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
						/*istanbul ignore next*/dispatch.apply( /*istanbul ignore next*/undefined, /*istanbul ignore next*/[key].concat(Array.prototype.slice.call(arguments)));
					});
				});
			}
		},
		mixin: {
			dispatch: dispatch
		}
	};
	
	var actionCreatorReactMixin = /*istanbul ignore next*/exports.actionCreatorReactMixin = {
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
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionListenerMixin = actionListenerMixin;
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_actions = __webpack_require__(2);
	
	function actionListenerMixin() {
		/*istanbul ignore next*/var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
		/*istanbul ignore next*/var handlers = _ref.handlers;
		/*istanbul ignore next*/var handlerFn = _ref.handlerFn;
		/*istanbul ignore next*/var context = _ref.context;
		/*istanbul ignore next*/var channel = _ref.channel;
		/*istanbul ignore next*/var topic = _ref.topic;
	
		return {
			/*istanbul ignore next*/setup: function setup() {
				context = context || this;
				var __lux = /*istanbul ignore next*/(0, _utils.ensureLuxProp)(context);
				var subs = __lux.subscriptions;
				handlers = handlers || context.handlers;
				channel = channel || /*istanbul ignore next*/_bus.actionChannel;
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
				/*istanbul ignore next*/(0, _actions.generateActionCreator)(handlerKeys);
				if (context.namespace) {
					/*istanbul ignore next*/(0, _actions.addToActionGroup)(context.namespace, handlerKeys);
				}
			},
			/*istanbul ignore next*/teardown: function teardown() {
				this.__lux.subscriptions.actionListener.unsubscribe();
			}
		};
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var /*istanbul ignore next*/_react = __webpack_require__(11);
	
	/*istanbul ignore next*/var _react2 = _interopRequireDefault(_react);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	var /*istanbul ignore next*/_lodash = __webpack_require__(3);
	
	var /*istanbul ignore next*/_actionCreator = __webpack_require__(8);
	
	/*istanbul ignore next*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
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
		/*istanbul ignore next*/var _this = this;
	
		this.__lux.waitFor = data.stores.filter(function (item) /*istanbul ignore next*/{
			return (/*istanbul ignore next*/_this.props.stores.indexOf(item) > -1
			);
		});
	}
	
	function setupStoreListener(instance) {
		var __lux = /*istanbul ignore next*/(0, _utils.ensureLuxProp)(instance);
		__lux.waitFor = [];
		__lux.heardFrom = [];
		var stores = instance.props.stores.split(",").map(function (x) /*istanbul ignore next*/{
			return x.trim();
		});
	
		stores.forEach(function (store) {
			__lux.subscriptions[/*istanbul ignore next*/store + ".changed"] = /*istanbul ignore next*/_bus.storeChannel.subscribe( /*istanbul ignore next*/store + ".changed", function () /*istanbul ignore next*/{
				return gateKeeper.call(instance, store);
			});
		});
	
		__lux.subscriptions.prenotify = /*istanbul ignore next*/_bus.dispatcherChannel.subscribe("prenotify", function (data) /*istanbul ignore next*/{
			return handlePreNotify.call(instance, data);
		});
	}
	
	function isSyntheticEvent(e) {
		return e.hasOwnProperty("eventPhase") && e.hasOwnProperty("nativeEvent") && e.hasOwnProperty("target") && e.hasOwnProperty("type");
	}
	
	function getDefaultActionCreator(action) {
		if (Object.prototype.toString.call(action) === "[object String]") {
			return function (e) {
				/*istanbul ignore next*/for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}
	
				if (!isSyntheticEvent(e)) {
					args.unshift(e);
				}
				/*istanbul ignore next*/_actionCreator.dispatch.apply( /*istanbul ignore next*/undefined, /*istanbul ignore next*/[action].concat(args));
			};
		}
	}
	
	function setupActionMap(instance) {
		instance.propToAction = {};
		/*istanbul ignore next*/var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)(instance.props.actions)[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
				/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
				var childProp = _step$value[0];
				/*istanbul ignore next*/var action = _step$value[1];
	
				var actionCreator = action; // assumes function by default
				if ( /*istanbul ignore next*/(0, _lodash.isString)(action)) {
					actionCreator = getDefaultActionCreator(action);
				} else if (! /*istanbul ignore next*/(0, _lodash.isFunction)(action)) {
					throw new Error("The values provided to the LuxContainer actions property must be a string or a function");
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
	
	/*istanbul ignore next*/var LuxContainer = function (_React$Component) {
		_inherits(LuxContainer, _React$Component);
	
		function /*istanbul ignore next*/LuxContainer(props) {
			/*istanbul ignore next*/_classCallCheck(this, LuxContainer);
	
			var _this2 = _possibleConstructorReturn(this, (LuxContainer.__proto__ || Object.getPrototypeOf(LuxContainer)).call(this, props));
	
			setupStoreListener( /*istanbul ignore next*/_this2);
			setupActionMap( /*istanbul ignore next*/_this2);
			/*istanbul ignore next*/_this2.componentWillUnmount.bind( /*istanbul ignore next*/_this2);
			/*istanbul ignore next*/return _this2;
		}
	
		_createClass(LuxContainer, [{
			key: "componentWillUnmount",
			value: function componentWillUnmount() {
				/*istanbul ignore next*/var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for ( /*istanbul ignore next*/var _iterator2 = /*istanbul ignore next*/(0, _utils.entries)(this.__lux.subscriptions)[Symbol.iterator](), _step2; /*istanbul ignore next*/!(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion2 = true) {
						/*istanbul ignore next*/var _step2$value = _slicedToArray(_step2.value, 2);
	
						var key = _step2$value[0];
						/*istanbul ignore next*/var sub = _step2$value[1];
	
						var split = /*istanbul ignore next*/void 0;
						if (key === "prenotify" || (split = key.split(".")) && split.pop() === "changed") {
							sub.unsubscribe();
						}
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
			}
		}, {
			key: "render",
			value: function render() {
				return (/*istanbul ignore next*/_react2.default.cloneElement(this.props.children, Object.assign({}, /*istanbul ignore next*/(0, _lodash.omit)(this.props, "children", "onStoreChange", "stores", "actions"), this.propToAction, this.state))
				);
			}
		}]);
	
		return LuxContainer;
	}( /*istanbul ignore next*/_react2.default.Component);
	
	/*istanbul ignore next*/exports.default = LuxContainer;
	
	
	LuxContainer.propTypes = {
		onStoreChange: /*istanbul ignore next*/_react2.default.PropTypes.func,
		stores: /*istanbul ignore next*/_react2.default.PropTypes.string.isRequired,
		children: /*istanbul ignore next*/_react2.default.PropTypes.element.isRequired
	};
	
	LuxContainer.defaultProps = {
		stores: "",
		actions: {}
	};
	/*istanbul ignore next*/module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Store = exports.stores = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.removeStore = removeStore;
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_dispatcher = __webpack_require__(13);
	
	/*istanbul ignore next*/var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	var /*istanbul ignore next*/_lodash = __webpack_require__(3);
	
	/*istanbul ignore next*/var _lodash2 = _interopRequireDefault(_lodash);
	
	var /*istanbul ignore next*/_mixins = __webpack_require__(6);
	
	/*istanbul ignore next*/function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var stores = /*istanbul ignore next*/exports.stores = {};
	
	function buildActionList(handlers) {
		var actionList = [];
		/*istanbul ignore next*/var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)(handlers)[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
				/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
				var key = _step$value[0];
				/*istanbul ignore next*/var handler = _step$value[1];
	
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
			throw new Error( /*istanbul ignore next*/"The store namespace \"" + namespace + "\" already exists.");
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
			handler: function /*istanbul ignore next*/handler() {
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
	
		/*istanbul ignore next*/for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}
	
		options.forEach(function (o) {
			var opt = /*istanbul ignore next*/void 0;
			if (o) {
				opt = /*istanbul ignore next*/_lodash2.default.clone(o);
				/*istanbul ignore next*/_lodash2.default.merge(state, opt.state);
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
				/*istanbul ignore next*/_lodash2.default.merge(otherOpts, opt);
			}
		});
		return [state, handlers, otherOpts];
	}
	
	/*istanbul ignore next*/var Store = exports.Store = function () {
		function /*istanbul ignore next*/Store() {
			/*istanbul ignore next*/var _this = this;
	
			_classCallCheck(this, Store);
	
			var _processStoreArgs = /*istanbul ignore next*/processStoreArgs.apply( /*istanbul ignore next*/undefined, /*istanbul ignore next*/arguments);
	
			/*istanbul ignore next*/var _processStoreArgs2 = _slicedToArray(_processStoreArgs, 3);
	
			var state = _processStoreArgs2[0];
			/*istanbul ignore next*/var handlers = _processStoreArgs2[1];
			/*istanbul ignore next*/var options = _processStoreArgs2[2];
	
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
					/*istanbul ignore next*/_bus.storeChannel.publish( /*istanbul ignore next*/this.namespace + ".changed");
				}
			};
	
			/*istanbul ignore next*/(0, _mixins.mixin)(this, /*istanbul ignore next*/_mixins.mixin.actionListener({
				context: this,
				channel: /*istanbul ignore next*/_bus.dispatcherChannel,
				topic: /*istanbul ignore next*/namespace + ".handle.*",
				handlers: handlers,
				handlerFn: function (data) {
					if (handlers.hasOwnProperty(data.actionType)) {
						inDispatch = true;
						var res = handlers[data.actionType].handler.apply(this, data.actionArgs.concat(data.deps));
						this.hasChanged = res === false ? false : true;
						/*istanbul ignore next*/_bus.dispatcherChannel.publish( /*istanbul ignore next*/this.namespace + ".handled." + data.actionType, { hasChanged: this.hasChanged, namespace: this.namespace });
					}
				}.bind(this)
			}));
	
			this.__subscription = {
				notify: /*istanbul ignore next*/_bus.dispatcherChannel.subscribe( /*istanbul ignore next*/"notify", function () /*istanbul ignore next*/{
					return (/*istanbul ignore next*/_this.flush()
					);
				}).constraint(function () /*istanbul ignore next*/{
					return inDispatch;
				})
			};
	
			/*istanbul ignore next*/_dispatcher2.default.registerStore({
				namespace: namespace,
				actions: buildActionList(handlers)
			});
		}
	
		// Need to build in behavior to remove this store
		// from the dispatcher's actionMap as well!
	
	
		_createClass(Store, [{
			key: "dispose",
			value: function dispose() {
				/*istanbul ignore next*/
				/*eslint-disable */
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for ( /*istanbul ignore next*/var _iterator2 = /*istanbul ignore next*/(0, _utils.entries)(this.__subscription)[Symbol.iterator](), _step2; /*istanbul ignore next*/!(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion2 = true) {
						/*istanbul ignore next*/var _step2$value = _slicedToArray(_step2.value, 2);
	
						var k = _step2$value[0];
						/*istanbul ignore next*/var subscription = _step2$value[1];
	
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
				/*istanbul ignore next*/_dispatcher2.default.removeStore(this.namespace);
				this.luxCleanup();
			}
		}]);
	
		return Store;
	}();
	
	function removeStore(namespace) {
		stores[namespace].dispose();
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var /*istanbul ignore next*/_lodash = __webpack_require__(3);
	
	/*istanbul ignore next*/var _lodash2 = _interopRequireDefault(_lodash);
	
	var /*istanbul ignore next*/_bus = __webpack_require__(4);
	
	var /*istanbul ignore next*/_utils = __webpack_require__(1);
	
	var /*istanbul ignore next*/_machina = __webpack_require__(14);
	
	/*istanbul ignore next*/var _machina2 = _interopRequireDefault(_machina);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function calculateGen(store, lookup, gen, actionType, namespaces) {
		var calcdGen = gen;
		var _namespaces = namespaces || [];
		if (_namespaces.indexOf(store.namespace) > -1) {
			throw new Error( /*istanbul ignore next*/"Circular dependency detected for the \"" + store.namespace + "\" store when participating in the \"" + actionType + "\" action.");
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
					console.warn( /*istanbul ignore next*/"The \"" + actionType + "\" action in the \"" + store.namespace + "\" store waits for \"" + dep + "\" but a store with that namespace does not participate in this action.");
				}
			});
		}
		return calcdGen;
	}
	
	function buildGenerations(stores, actionType) {
		var tree = [];
		var lookup = {};
		stores.forEach(function (store) /*istanbul ignore next*/{
			return lookup[store.namespace] = store;
		});
		stores.forEach(function (store) /*istanbul ignore next*/{
			return store.gen = calculateGen(store, lookup, 0, actionType);
		});
		/*eslint-disable */
		/*istanbul ignore next*/var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for ( /*istanbul ignore next*/var _iterator = /*istanbul ignore next*/(0, _utils.entries)(lookup)[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
				/*istanbul ignore next*/var _step$value = _slicedToArray(_step.value, 2);
	
				var key = _step$value[0];
				/*istanbul ignore next*/var item = _step$value[1];
	
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
		/*istanbul ignore next*/var _this = this;
	
		generation.map(function (store) {
			var data = Object.assign({
				deps: /*istanbul ignore next*/_lodash2.default.pick( /*istanbul ignore next*/_this.stores, store.waitFor)
			}, action);
			/*istanbul ignore next*/_bus.dispatcherChannel.publish( /*istanbul ignore next*/store.namespace + ".handle." + action.actionType, data);
		});
	}
	
	/*istanbul ignore next*/var Dispatcher = function (_machina$BehavioralFs) {
		_inherits(Dispatcher, _machina$BehavioralFs);
	
		function /*istanbul ignore next*/Dispatcher() {
			/*istanbul ignore next*/_classCallCheck(this, Dispatcher);
	
			var _this2 = _possibleConstructorReturn(this, (Dispatcher.__proto__ || Object.getPrototypeOf(Dispatcher)).call(this, {
				initialState: "ready",
				actionMap: {},
				states: {
					ready: {
						_onEnter: function /*istanbul ignore next*/_onEnter() {
							this.actionContext = undefined;
						},
						"action.dispatch": "dispatching"
					},
					dispatching: {
						_onEnter: function /*istanbul ignore next*/_onEnter(luxAction) {
							this.actionContext = luxAction;
							if (luxAction.generations.length) {
								/*istanbul ignore next*/var _iteratorNormalCompletion2 = true;
								var _didIteratorError2 = false;
								var _iteratorError2 = undefined;
	
								try {
									for ( /*istanbul ignore next*/var _iterator2 = luxAction.generations[Symbol.iterator](), _step2; /*istanbul ignore next*/!(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion2 = true) {
										/*istanbul ignore next*/var generation = _step2.value;
	
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
						"action.handled": function /*istanbul ignore next*/actionHandled(luxAction, data) {
							if (data.hasChanged) {
								luxAction.updated.push(data.namespace);
							}
						},
						_onExit: function /*istanbul ignore next*/_onExit(luxAction) {
							if (luxAction.updated.length) {
								/*istanbul ignore next*/_bus.dispatcherChannel.publish("prenotify", { stores: luxAction.updated });
							}
						}
					},
					notifying: {
						_onEnter: function /*istanbul ignore next*/_onEnter(luxAction) {
							/*istanbul ignore next*/_bus.dispatcherChannel.publish("notify", {
								action: luxAction.action
							});
						}
					},
					nothandled: {}
				},
				/*istanbul ignore next*/getStoresHandling: function getStoresHandling(actionType) {
					var stores = this.actionMap[actionType] || [];
					return {
						stores: stores,
						generations: buildGenerations(stores, actionType)
					};
				}
			}));
	
			/*istanbul ignore next*/_this2.createSubscribers();
			/*istanbul ignore next*/return _this2;
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
				/*istanbul ignore next*/var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;
	
				try {
					for ( /*istanbul ignore next*/var _iterator3 = storeMeta.actions[Symbol.iterator](), _step3; /*istanbul ignore next*/!(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion3 = true) {
						/*istanbul ignore next*/var actionDef = _step3.value;
	
						var action = /*istanbul ignore next*/void 0;
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
				/*istanbul ignore next*/var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;
	
				try {
					for ( /*istanbul ignore next*/var _iterator4 = /*istanbul ignore next*/(0, _utils.entries)(this.actionMap)[Symbol.iterator](), _step4; /*istanbul ignore next*/!(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion4 = true) {
						/*istanbul ignore next*/var _step4$value = _slicedToArray(_step4.value, 2);
	
						var k = _step4$value[0];
						/*istanbul ignore next*/var v = _step4$value[1];
	
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
				/*istanbul ignore next*/var _this3 = this;
	
				if (!this.__subscriptions || !this.__subscriptions.length) {
					this.__subscriptions = [/*istanbul ignore next*/_bus.actionChannel.subscribe("execute.*", function (data, env) /*istanbul ignore next*/{
						return (/*istanbul ignore next*/_this3.handleActionDispatch(data)
						);
					}), /*istanbul ignore next*/_bus.dispatcherChannel.subscribe("*.handled.*", function (data) /*istanbul ignore next*/{
						return (/*istanbul ignore next*/_this3.handle( /*istanbul ignore next*/_this3.actionContext, "action.handled", data)
						);
					}).constraint(function () /*istanbul ignore next*/{
						return !! /*istanbul ignore next*/_this3.actionContext;
					})];
				}
			}
		}, {
			key: "dispose",
			value: function dispose() {
				if (this.__subscriptions) {
					this.__subscriptions.forEach(function (subscription) /*istanbul ignore next*/{
						return subscription.unsubscribe();
					});
					this.__subscriptions = null;
				}
			}
		}]);
	
		return Dispatcher;
	}( /*istanbul ignore next*/_machina2.default.BehavioralFsm);
	
	/*istanbul ignore next*/exports.default = new Dispatcher();
	/*istanbul ignore next*/module.exports = exports["default"];

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*istanbul ignore next*/Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.extend = undefined;
	
	var /*istanbul ignore next*/_lodash = __webpack_require__(3);
	
	/*istanbul ignore next*/var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var extend = /*istanbul ignore next*/exports.extend = function extend() {
		/*istanbul ignore next*/for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
			options[_key] = arguments[_key];
		}
	
		var parent = this;
		var _store = /*istanbul ignore next*/void 0; // placeholder for instance constructor
		var Ctor = function Ctor() {}; // placeholder ctor function used to insert level in prototype chain
	
		// First - separate mixins from prototype props
		var mixins = [];
		/*istanbul ignore next*/var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for ( /*istanbul ignore next*/var _iterator = options[Symbol.iterator](), _step; /*istanbul ignore next*/!(_iteratorNormalCompletion = (_step = _iterator.next()).done); /*istanbul ignore next*/_iteratorNormalCompletion = true) {
				/*istanbul ignore next*/var opt = _step.value;
	
				mixins.push( /*istanbul ignore next*/_lodash2.default.pick(opt, ["handlers", "state"]));
				delete opt.handlers;
				delete opt.state;
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
	
		var protoProps = /*istanbul ignore next*/_lodash2.default.merge.apply(this, [{}].concat(options));
	
		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty("constructor")) {
			_store = protoProps.constructor;
		} else {
			_store = function /*istanbul ignore next*/store() {
				var args = Array.from(arguments);
				args[0] = args[0] || {};
				parent.apply(this, _store.mixins.concat(args));
			};
		}
	
		_store.mixins = mixins;
	
		// Inherit class (static) properties from parent.
		/*istanbul ignore next*/_lodash2.default.merge(_store, parent);
	
		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		Ctor.prototype = parent.prototype;
		_store.prototype = new Ctor();
	
		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) {
			/*istanbul ignore next*/_lodash2.default.extend(_store.prototype, protoProps);
		}
	
		// Correctly set child's `prototype.constructor`.
		_store.prototype.constructor = _store;
	
		// Set a convenience property in case the parent's prototype is needed later.
		_store.__super__ = parent.prototype;
		return _store;
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBkZGNjNGZhZGEyMWE2YWZjNmQzZSIsIndlYnBhY2s6Ly8vLi9zcmMvbHV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYWN0aW9ucy5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wicm9vdFwiOlwiX1wiLFwiY29tbW9uanNcIjpcImxvZGFzaFwiLFwiY29tbW9uanMyXCI6XCJsb2Rhc2hcIixcImFtZFwiOlwibG9kYXNoXCJ9Iiwid2VicGFjazovLy8uL3NyYy9idXMuanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicG9zdGFsXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21peGlucy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL3N0b3JlLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvYWN0aW9uQ3JlYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWl4aW5zL2FjdGlvbkxpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9taXhpbnMvbHV4Q29udGFpbmVyLmpzIiwid2VicGFjazovLy9leHRlcm5hbCB7XCJyb290XCI6XCJSZWFjdFwiLFwiY29tbW9uanNcIjpcInJlYWN0XCIsXCJjb21tb25qczJcIjpcInJlYWN0XCIsXCJhbWRcIjpcInJlYWN0XCJ9Iiwid2VicGFjazovLy8uL3NyYy9zdG9yZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGlzcGF0Y2hlci5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtYWNoaW5hXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuZC5qcyJdLCJuYW1lcyI6WyJnbG9iYWwiLCJ3aW5kb3ciLCJfYmFiZWxQb2x5ZmlsbCIsIkVycm9yIiwicHVibGlzaEFjdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJleHRlbmQiLCJhY3Rpb25zIiwiY3VzdG9tQWN0aW9uQ3JlYXRvciIsImRpc3BhdGNoIiwiZGlzcGF0Y2hlciIsImdldEFjdGlvbkdyb3VwIiwiYWN0aW9uQ3JlYXRvckxpc3RlbmVyIiwiYWN0aW9uQ3JlYXRvciIsImFjdGlvbkxpc3RlbmVyIiwibWl4aW4iLCJyZWFjdE1peGluIiwicmVtb3ZlU3RvcmUiLCJTdG9yZSIsInN0b3JlcyIsInV0aWxzIiwiTHV4Q29udGFpbmVyIiwiZW5zdXJlTHV4UHJvcCIsImVudHJpZXMiLCJjb250ZXh0IiwiX19sdXgiLCJjbGVhbnVwIiwic3Vic2NyaXB0aW9ucyIsIm9iaiIsImluZGV4T2YiLCJPYmplY3QiLCJrZXlzIiwiayIsImdlbmVyYXRlQWN0aW9uQ3JlYXRvciIsImdldEdyb3Vwc1dpdGhBY3Rpb24iLCJhZGRUb0FjdGlvbkdyb3VwIiwiY3JlYXRlIiwiYWN0aW9uR3JvdXBzIiwiYWN0aW9uTGlzdCIsImZvckVhY2giLCJhY3Rpb24iLCJhcmdzIiwiQXJyYXkiLCJmcm9tIiwiYXJndW1lbnRzIiwicHVibGlzaCIsInRvcGljIiwiZGF0YSIsImFjdGlvblR5cGUiLCJhY3Rpb25BcmdzIiwiZ3JvdXAiLCJwaWNrIiwiYWN0aW9uTmFtZSIsImdyb3VwcyIsImxpc3QiLCJwdXNoIiwiYXNzaWduIiwiZ3JvdXBOYW1lIiwiZGlmZiIsImRpZmZlcmVuY2UiLCJsZW5ndGgiLCJqb2luIiwiYWN0aW9uQ2hhbm5lbCIsImNoYW5uZWwiLCJzdG9yZUNoYW5uZWwiLCJkaXNwYXRjaGVyQ2hhbm5lbCIsInBvc3RhbCIsImx1eE1peGluQ2xlYW51cCIsIm1ldGhvZCIsImNhbGwiLCJ1bmRlZmluZWQiLCJtaXhpbnMiLCJteG4iLCJzZXR1cCIsInRlYXJkb3duIiwibHV4Q2xlYW51cCIsInN0b3JlIiwidGFyZ2V0IiwiZ2F0ZUtlZXBlciIsInBheWxvYWQiLCJmb3VuZCIsIndhaXRGb3IiLCJzcGxpY2UiLCJoZWFyZEZyb20iLCJvbkNoYW5nZSIsImhhbmRsZVByZU5vdGlmeSIsImZpbHRlciIsIml0ZW0iLCJsaXN0ZW5UbyIsInN0b3JlTWl4aW4iLCJzdWJzY3JpYmUiLCJwcmVub3RpZnkiLCJrZXkiLCJzdWIiLCJzcGxpdCIsInBvcCIsInVuc3Vic2NyaWJlIiwic3RvcmVSZWFjdE1peGluIiwiY29tcG9uZW50V2lsbE1vdW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJhY3Rpb25DcmVhdG9yTWl4aW4iLCJnZXRBY3Rpb25zIiwiYWRkQWN0aW9uSWZOb3RQcmVzZW50IiwidiIsImFjdGlvbkNyZWF0b3JSZWFjdE1peGluIiwiYWN0aW9uTGlzdGVuZXJNaXhpbiIsImhhbmRsZXJzIiwiaGFuZGxlckZuIiwic3VicyIsImVudiIsImhhbmRsZXIiLCJhcHBseSIsImhhbmRsZXJLZXlzIiwibmFtZXNwYWNlIiwic2V0U3RhdGUiLCJwcm9wcyIsIm9uU3RvcmVDaGFuZ2UiLCJzZXR1cFN0b3JlTGlzdGVuZXIiLCJpbnN0YW5jZSIsIm1hcCIsIngiLCJ0cmltIiwiaXNTeW50aGV0aWNFdmVudCIsImUiLCJoYXNPd25Qcm9wZXJ0eSIsImdldERlZmF1bHRBY3Rpb25DcmVhdG9yIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJ1bnNoaWZ0Iiwic2V0dXBBY3Rpb25NYXAiLCJwcm9wVG9BY3Rpb24iLCJjaGlsZFByb3AiLCJiaW5kIiwiY2xvbmVFbGVtZW50IiwiY2hpbGRyZW4iLCJzdGF0ZSIsIkNvbXBvbmVudCIsInByb3BUeXBlcyIsIlByb3BUeXBlcyIsImZ1bmMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiZWxlbWVudCIsImRlZmF1bHRQcm9wcyIsImJ1aWxkQWN0aW9uTGlzdCIsImVuc3VyZVN0b3JlT3B0aW9ucyIsIm9wdGlvbnMiLCJnZXRIYW5kbGVyT2JqZWN0IiwibGlzdGVuZXJzIiwiY2hhbmdlZCIsImxpc3RlbmVyIiwidXBkYXRlV2FpdEZvciIsInNvdXJjZSIsImhhbmRsZXJPYmplY3QiLCJkZXAiLCJhZGRMaXN0ZW5lcnMiLCJwcm9jZXNzU3RvcmVBcmdzIiwib3RoZXJPcHRzIiwibyIsIm9wdCIsImNsb25lIiwibWVyZ2UiLCJpbkRpc3BhdGNoIiwiaGFzQ2hhbmdlZCIsImdldFN0YXRlIiwibmV3U3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJmbHVzaCIsInJlcyIsImNvbmNhdCIsImRlcHMiLCJfX3N1YnNjcmlwdGlvbiIsIm5vdGlmeSIsImNvbnN0cmFpbnQiLCJyZWdpc3RlclN0b3JlIiwic3Vic2NyaXB0aW9uIiwiZGlzcG9zZSIsImNhbGN1bGF0ZUdlbiIsImxvb2t1cCIsImdlbiIsIm5hbWVzcGFjZXMiLCJjYWxjZEdlbiIsIl9uYW1lc3BhY2VzIiwiZGVwU3RvcmUiLCJ0aGlzR2VuIiwid2FybiIsImJ1aWxkR2VuZXJhdGlvbnMiLCJ0cmVlIiwicHJvY2Vzc0dlbmVyYXRpb24iLCJnZW5lcmF0aW9uIiwiRGlzcGF0Y2hlciIsImluaXRpYWxTdGF0ZSIsImFjdGlvbk1hcCIsInN0YXRlcyIsInJlYWR5IiwiX29uRW50ZXIiLCJhY3Rpb25Db250ZXh0IiwiZGlzcGF0Y2hpbmciLCJsdXhBY3Rpb24iLCJnZW5lcmF0aW9ucyIsInRyYW5zaXRpb24iLCJ1cGRhdGVkIiwiX29uRXhpdCIsIm5vdGlmeWluZyIsIm5vdGhhbmRsZWQiLCJnZXRTdG9yZXNIYW5kbGluZyIsImNyZWF0ZVN1YnNjcmliZXJzIiwiZ2VuZXJhdGlvbkluZGV4IiwiaGFuZGxlIiwic3RvcmVNZXRhIiwiYWN0aW9uRGVmIiwiYWN0aW9uTWV0YSIsImlzVGhpc05hbWVTcGFjZSIsIm1ldGEiLCJpZHgiLCJmaW5kSW5kZXgiLCJfX3N1YnNjcmlwdGlvbnMiLCJoYW5kbGVBY3Rpb25EaXNwYXRjaCIsIkJlaGF2aW9yYWxGc20iLCJwYXJlbnQiLCJDdG9yIiwicHJvdG9Qcm9wcyIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7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QVEseUNBQVc7QUFDbEIsUUFBTW5DLE9BQU9DLE1BQU1DLElBQU4sQ0FBWUMsU0FBWixDQUFiO0FBQ0FILFNBQU0sQ0FBTixJQUFZQSxLQUFNLENBQU4sS0FBYSxFQUF6QjtBQUNBa0wsV0FBTzVHLEtBQVAsQ0FBYyxJQUFkLEVBQW9CbkMsT0FBTUwsTUFBTixDQUFha0csTUFBYixDQUFxQmhJLElBQXJCLENBQXBCO0FBQ0EsSUFKRDtBQUtBOztBQUVEbUMsU0FBTUwsTUFBTixHQUFlQSxNQUFmOztBQUVBO0FBQ0EsMkNBQUUwRixLQUFGLENBQVNyRixNQUFULEVBQWdCK0ksTUFBaEI7O0FBRUE7QUFDQTtBQUNBQyxPQUFLOUYsU0FBTCxHQUFpQjZGLE9BQU83RixTQUF4QjtBQUNBbEQsU0FBTWtELFNBQU4sR0FBa0IsSUFBSThGLElBQUosRUFBbEI7O0FBRUE7QUFDQTtBQUNBLE1BQUtDLFVBQUwsRUFBa0I7QUFDakIsNENBQUV2TixNQUFGLENBQVVzRSxPQUFNa0QsU0FBaEIsRUFBMkIrRixVQUEzQjtBQUNBOztBQUVEO0FBQ0FqSixTQUFNa0QsU0FBTixDQUFnQmdHLFdBQWhCLEdBQThCbEosTUFBOUI7O0FBRUE7QUFDQUEsU0FBTW1KLFNBQU4sR0FBa0JKLE9BQU83RixTQUF6QjtBQUNBLFNBQU9sRCxNQUFQO0FBQ0EsRUFsRE0sQyIsImZpbGUiOiJsdXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJsb2Rhc2hcIiksIHJlcXVpcmUoXCJwb3N0YWxcIiksIHJlcXVpcmUoXCJyZWFjdFwiKSwgcmVxdWlyZShcIm1hY2hpbmFcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW1wibG9kYXNoXCIsIFwicG9zdGFsXCIsIFwicmVhY3RcIiwgXCJtYWNoaW5hXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImx1eFwiXSA9IGZhY3RvcnkocmVxdWlyZShcImxvZGFzaFwiKSwgcmVxdWlyZShcInBvc3RhbFwiKSwgcmVxdWlyZShcInJlYWN0XCIpLCByZXF1aXJlKFwibWFjaGluYVwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV4XCJdID0gZmFjdG9yeShyb290W1wiX1wiXSwgcm9vdFtcInBvc3RhbFwiXSwgcm9vdFtcIlJlYWN0XCJdLCByb290W1wibWFjaGluYVwiXSk7XG59KSh0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV81X18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTFfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV8xNF9fKSB7XG5yZXR1cm4gXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uXG4gKiovIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBkZGNjNGZhZGEyMWE2YWZjNmQzZVxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKCAhKCB0eXBlb2YgZ2xvYmFsID09PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogZ2xvYmFsICkuX2JhYmVsUG9seWZpbGwgKSB7XG5cdHRocm93IG5ldyBFcnJvciggXCJZb3UgbXVzdCBpbmNsdWRlIHRoZSBiYWJlbCBwb2x5ZmlsbCBvbiB5b3VyIHBhZ2UgYmVmb3JlIGx1eCBpcyBsb2FkZWQuIFNlZSBodHRwczovL2JhYmVsanMuaW8vZG9jcy91c2FnZS9wb2x5ZmlsbC8gZm9yIG1vcmUgZGV0YWlscy5cIiApO1xufVxuXG5pbXBvcnQgdXRpbHMgZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHtcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGN1c3RvbUFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbnNcbn0gZnJvbSBcIi4vYWN0aW9uc1wiO1xuXG5pbXBvcnQge1xuXHRtaXhpbixcblx0cmVhY3RNaXhpbixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdGFjdGlvbkNyZWF0b3IsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0ZGlzcGF0Y2gsXG5cdEx1eENvbnRhaW5lclxufSBmcm9tIFwiLi9taXhpbnNcIjtcblxuZnVuY3Rpb24gcHVibGlzaEFjdGlvbiggLi4uYXJncyApIHtcblx0aWYgKCBjb25zb2xlICYmIHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdGNvbnNvbGUubG9nKCBcImx1eC5wdWJsaXNoQWN0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBmdXR1cmUgcmVsZWFzZXMuIFBsZWFzZSB1c2UgbHV4LmRpc3BhdGNoLlwiICk7XG5cdH1cblx0ZGlzcGF0Y2goIC4uLmFyZ3MgKTtcbn1cblxuaW1wb3J0IHsgU3RvcmUsIHN0b3JlcywgcmVtb3ZlU3RvcmUgfSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSBcIi4vZXh0ZW5kXCI7XG5TdG9yZS5leHRlbmQgPSBleHRlbmQ7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuL2Rpc3BhdGNoZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRhY3Rpb25zLFxuXHRjdXN0b21BY3Rpb25DcmVhdG9yLFxuXHRkaXNwYXRjaCxcblx0cHVibGlzaEFjdGlvbixcblx0ZGlzcGF0Y2hlcixcblx0Z2V0QWN0aW9uR3JvdXAsXG5cdGFjdGlvbkNyZWF0b3JMaXN0ZW5lcixcblx0YWN0aW9uQ3JlYXRvcixcblx0YWN0aW9uTGlzdGVuZXIsXG5cdG1peGluLFxuXHRyZWFjdE1peGluLFxuXHRyZW1vdmVTdG9yZSxcblx0U3RvcmUsXG5cdHN0b3Jlcyxcblx0dXRpbHMsXG5cdEx1eENvbnRhaW5lclxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2x1eC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlTHV4UHJvcCggY29udGV4dCApIHtcblx0Y29uc3QgX19sdXggPSBjb250ZXh0Ll9fbHV4ID0gKCBjb250ZXh0Ll9fbHV4IHx8IHt9ICk7XG5cdC8qZXNsaW50LWRpc2FibGUgKi9cblx0Y29uc3QgY2xlYW51cCA9IF9fbHV4LmNsZWFudXAgPSAoIF9fbHV4LmNsZWFudXAgfHwgW10gKTtcblx0Y29uc3Qgc3Vic2NyaXB0aW9ucyA9IF9fbHV4LnN1YnNjcmlwdGlvbnMgPSAoIF9fbHV4LnN1YnNjcmlwdGlvbnMgfHwge30gKTtcblx0Lyplc2xpbnQtZW5hYmxlICovXG5cdHJldHVybiBfX2x1eDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBlbnRyaWVzKCBvYmogKSB7XG5cdGlmICggWyBcIm9iamVjdFwiLCBcImZ1bmN0aW9uXCIgXS5pbmRleE9mKCB0eXBlb2Ygb2JqICkgPT09IC0xICkge1xuXHRcdG9iaiA9IHt9O1xuXHR9XG5cdGZvciAoIGxldCBrIG9mIE9iamVjdC5rZXlzKCBvYmogKSApIHtcblx0XHR5aWVsZCBbIGssIG9ialsgayBdIF07XG5cdH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzLmpzXG4gKiovIiwiaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5leHBvcnQgY29uc3QgYWN0aW9ucyA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbmV4cG9ydCBjb25zdCBhY3Rpb25Hcm91cHMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbkNyZWF0b3IoIGFjdGlvbkxpc3QgKSB7XG5cdGFjdGlvbkxpc3QgPSAoIHR5cGVvZiBhY3Rpb25MaXN0ID09PSBcInN0cmluZ1wiICkgPyBbIGFjdGlvbkxpc3QgXSA6IGFjdGlvbkxpc3Q7XG5cdGFjdGlvbkxpc3QuZm9yRWFjaCggZnVuY3Rpb24oIGFjdGlvbiApIHtcblx0XHRpZiAoICFhY3Rpb25zWyBhY3Rpb24gXSApIHtcblx0XHRcdGFjdGlvbnNbIGFjdGlvbiBdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkuZnJvbSggYXJndW1lbnRzICk7XG5cdFx0XHRcdGFjdGlvbkNoYW5uZWwucHVibGlzaCgge1xuXHRcdFx0XHRcdHRvcGljOiBgZXhlY3V0ZS4ke2FjdGlvbn1gLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvblR5cGU6IGFjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkFyZ3M6IGFyZ3Ncblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9ICk7XG59XG5cbi8vIFRoaXMgbWV0aG9kIGlzIGRlcHJlY2F0ZWQsIGJ1dCB3aWxsIHJlbWFpbiBhc1xuLy8gbG9uZyBhcyB0aGUgcHJpbnQgdXRpbHMgbmVlZCBpdC5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uR3JvdXAoIGdyb3VwICkge1xuXHRpZiAoIGFjdGlvbkdyb3Vwc1sgZ3JvdXAgXSApIHtcblx0XHRyZXR1cm4gXy5waWNrKCBhY3Rpb25zLCBhY3Rpb25Hcm91cHNbIGdyb3VwIF0gKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoIGBUaGVyZSBpcyBubyBhY3Rpb24gZ3JvdXAgbmFtZWQgJyR7Z3JvdXB9J2AgKTtcblx0fVxufVxuXG4vLyBUaGlzIG1ldGhvZCBpcyBkZXByZWNhdGVkLCBidXQgd2lsbCByZW1haW4gYXNcbi8vIGxvbmcgYXMgdGhlIHByaW50IHV0aWxzIG5lZWQgaXQuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdyb3Vwc1dpdGhBY3Rpb24oIGFjdGlvbk5hbWUgKSB7XG5cdGNvbnN0IGdyb3VwcyA9IFtdO1xuXHRmb3IgKCB2YXIgWyBncm91cCwgbGlzdCBdIG9mIGVudHJpZXMoIGFjdGlvbkdyb3VwcyApICkge1xuXHRcdGlmICggbGlzdC5pbmRleE9mKCBhY3Rpb25OYW1lICkgPj0gMCApIHtcblx0XHRcdGdyb3Vwcy5wdXNoKCBncm91cCApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZ3JvdXBzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tQWN0aW9uQ3JlYXRvciggYWN0aW9uICkge1xuXHRPYmplY3QuYXNzaWduKCBhY3Rpb25zLCBhY3Rpb24gKTtcbn1cblxuLy8gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZCwgYnV0IHdpbGwgcmVtYWluIGFzXG4vLyBsb25nIGFzIHRoZSBwcmludCB1dGlscyBuZWVkIGl0LlxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0FjdGlvbkdyb3VwKCBncm91cE5hbWUsIGFjdGlvbkxpc3QgKSB7XG5cdGxldCBncm91cCA9IGFjdGlvbkdyb3Vwc1sgZ3JvdXBOYW1lIF07XG5cdGlmICggIWdyb3VwICkge1xuXHRcdGdyb3VwID0gYWN0aW9uR3JvdXBzWyBncm91cE5hbWUgXSA9IFtdO1xuXHR9XG5cdGFjdGlvbkxpc3QgPSB0eXBlb2YgYWN0aW9uTGlzdCA9PT0gXCJzdHJpbmdcIiA/IFsgYWN0aW9uTGlzdCBdIDogYWN0aW9uTGlzdDtcblx0Y29uc3QgZGlmZiA9IF8uZGlmZmVyZW5jZSggYWN0aW9uTGlzdCwgT2JqZWN0LmtleXMoIGFjdGlvbnMgKSApO1xuXHRpZiAoIGRpZmYubGVuZ3RoICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBmb2xsb3dpbmcgYWN0aW9ucyBkbyBub3QgZXhpc3Q6ICR7ZGlmZi5qb2luKCBcIiwgXCIgKX1gICk7XG5cdH1cblx0YWN0aW9uTGlzdC5mb3JFYWNoKCBmdW5jdGlvbiggYWN0aW9uICkge1xuXHRcdGlmICggZ3JvdXAuaW5kZXhPZiggYWN0aW9uICkgPT09IC0xICkge1xuXHRcdFx0Z3JvdXAucHVzaCggYWN0aW9uICk7XG5cdFx0fVxuXHR9ICk7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hY3Rpb25zLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzNfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIHtcInJvb3RcIjpcIl9cIixcImNvbW1vbmpzXCI6XCJsb2Rhc2hcIixcImNvbW1vbmpzMlwiOlwibG9kYXNoXCIsXCJhbWRcIjpcImxvZGFzaFwifVxuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBwb3N0YWwgZnJvbSBcInBvc3RhbFwiO1xuXG5jb25zdCBhY3Rpb25DaGFubmVsID0gcG9zdGFsLmNoYW5uZWwoIFwibHV4LmFjdGlvblwiICk7XG5jb25zdCBzdG9yZUNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguc3RvcmVcIiApO1xuY29uc3QgZGlzcGF0Y2hlckNoYW5uZWwgPSBwb3N0YWwuY2hhbm5lbCggXCJsdXguZGlzcGF0Y2hlclwiICk7XG5cbmV4cG9ydCB7XG5cdGFjdGlvbkNoYW5uZWwsXG5cdHN0b3JlQ2hhbm5lbCxcblx0ZGlzcGF0Y2hlckNoYW5uZWwsXG5cdHBvc3RhbFxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2J1cy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV81X187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInBvc3RhbFwiXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7IHN0b3JlTWl4aW4sIHN0b3JlUmVhY3RNaXhpbiB9IGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBhY3Rpb25DcmVhdG9yTWl4aW4sIGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLCBkaXNwYXRjaCB9IGZyb20gXCIuL2FjdGlvbkNyZWF0b3JcIjtcbmltcG9ydCB7IGFjdGlvbkxpc3RlbmVyTWl4aW4gfSBmcm9tIFwiLi9hY3Rpb25MaXN0ZW5lclwiO1xuaW1wb3J0IEx1eENvbnRhaW5lciBmcm9tIFwiLi9sdXhDb250YWluZXJcIjtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKiAgIEdlbmVyYWxpemVkIE1peGluIEJlaGF2aW9yIGZvciBub24tbHV4ICAgKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmNvbnN0IGx1eE1peGluQ2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLl9fbHV4LmNsZWFudXAuZm9yRWFjaCggKCBtZXRob2QgKSA9PiBtZXRob2QuY2FsbCggdGhpcyApICk7XG5cdHRoaXMuX19sdXguY2xlYW51cCA9IHVuZGVmaW5lZDtcblx0ZGVsZXRlIHRoaXMuX19sdXguY2xlYW51cDtcbn07XG5cbmZ1bmN0aW9uIG1peGluKCBjb250ZXh0LCAuLi5taXhpbnMgKSB7XG5cdGlmICggbWl4aW5zLmxlbmd0aCA9PT0gMCApIHtcblx0XHRtaXhpbnMgPSBbIHN0b3JlTWl4aW4sIGFjdGlvbkNyZWF0b3JNaXhpbiBdO1xuXHR9XG5cblx0bWl4aW5zLmZvckVhY2goICggbXhuICkgPT4ge1xuXHRcdGlmICggdHlwZW9mIG14biA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0bXhuID0gbXhuKCk7XG5cdFx0fVxuXHRcdGlmICggbXhuLm1peGluICkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbiggY29udGV4dCwgbXhuLm1peGluICk7XG5cdFx0fVxuXHRcdGlmICggdHlwZW9mIG14bi5zZXR1cCAhPT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcIkx1eCBtaXhpbnMgc2hvdWxkIGhhdmUgYSBzZXR1cCBtZXRob2QuIERpZCB5b3UgcGVyaGFwcyBwYXNzIHlvdXIgbWl4aW5zIGFoZWFkIG9mIHlvdXIgdGFyZ2V0IGluc3RhbmNlP1wiICk7XG5cdFx0fVxuXHRcdG14bi5zZXR1cC5jYWxsKCBjb250ZXh0ICk7XG5cdFx0aWYgKCBteG4udGVhcmRvd24gKSB7XG5cdFx0XHRjb250ZXh0Ll9fbHV4LmNsZWFudXAucHVzaCggbXhuLnRlYXJkb3duICk7XG5cdFx0fVxuXHR9ICk7XG5cdGNvbnRleHQubHV4Q2xlYW51cCA9IGx1eE1peGluQ2xlYW51cDtcblx0cmV0dXJuIGNvbnRleHQ7XG59XG5cbm1peGluLnN0b3JlID0gc3RvcmVNaXhpbjtcbm1peGluLmFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yTWl4aW47XG5taXhpbi5hY3Rpb25MaXN0ZW5lciA9IGFjdGlvbkxpc3RlbmVyTWl4aW47XG5cbmNvbnN0IHJlYWN0TWl4aW4gPSB7XG5cdGFjdGlvbkNyZWF0b3I6IGFjdGlvbkNyZWF0b3JSZWFjdE1peGluLFxuXHRzdG9yZTogc3RvcmVSZWFjdE1peGluXG59O1xuXG5mdW5jdGlvbiBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkge1xuXHRyZXR1cm4gbWl4aW4oIHRhcmdldCwgYWN0aW9uTGlzdGVuZXJNaXhpbiApO1xufVxuXG5mdW5jdGlvbiBhY3Rpb25DcmVhdG9yKCB0YXJnZXQgKSB7XG5cdHJldHVybiBtaXhpbiggdGFyZ2V0LCBhY3Rpb25DcmVhdG9yTWl4aW4gKTtcbn1cblxuZnVuY3Rpb24gYWN0aW9uQ3JlYXRvckxpc3RlbmVyKCB0YXJnZXQgKSB7XG5cdHJldHVybiBhY3Rpb25DcmVhdG9yKCBhY3Rpb25MaXN0ZW5lciggdGFyZ2V0ICkgKTtcbn1cblxuZXhwb3J0IHtcblx0bWl4aW4sXG5cdHJlYWN0TWl4aW4sXG5cdGFjdGlvbkxpc3RlbmVyLFxuXHRhY3Rpb25DcmVhdG9yLFxuXHRhY3Rpb25DcmVhdG9yTGlzdGVuZXIsXG5cdGRpc3BhdGNoLFxuXHRMdXhDb250YWluZXJcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgICAgICAgIFN0b3JlIE1peGluICAgICAgICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5pbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4uL2J1c1wiO1xuaW1wb3J0IHsgZW5zdXJlTHV4UHJvcCwgZW50cmllcyB9IGZyb20gXCIuLi91dGlsc1wiO1xuXG5mdW5jdGlvbiBnYXRlS2VlcGVyKCBzdG9yZSwgZGF0YSApIHtcblx0Y29uc3QgcGF5bG9hZCA9IHt9O1xuXHRwYXlsb2FkWyBzdG9yZSBdID0gdHJ1ZTtcblx0Y29uc3QgX19sdXggPSB0aGlzLl9fbHV4O1xuXG5cdGNvbnN0IGZvdW5kID0gX19sdXgud2FpdEZvci5pbmRleE9mKCBzdG9yZSApO1xuXG5cdGlmICggZm91bmQgPiAtMSApIHtcblx0XHRfX2x1eC53YWl0Rm9yLnNwbGljZSggZm91bmQsIDEgKTtcblx0XHRfX2x1eC5oZWFyZEZyb20ucHVzaCggcGF5bG9hZCApO1xuXG5cdFx0aWYgKCBfX2x1eC53YWl0Rm9yLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdF9fbHV4LmhlYXJkRnJvbSA9IFtdO1xuXHRcdFx0dGhpcy5zdG9yZXMub25DaGFuZ2UuY2FsbCggdGhpcywgcGF5bG9hZCApO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVOb3RpZnkoIGRhdGEgKSB7XG5cdHRoaXMuX19sdXgud2FpdEZvciA9IGRhdGEuc3RvcmVzLmZpbHRlcihcblx0XHQoIGl0ZW0gKSA9PiB0aGlzLnN0b3Jlcy5saXN0ZW5Uby5pbmRleE9mKCBpdGVtICkgPiAtMVxuXHQpO1xufVxuXG5leHBvcnQgdmFyIHN0b3JlTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRjb25zdCBfX2x1eCA9IGVuc3VyZUx1eFByb3AoIHRoaXMgKTtcblx0XHRjb25zdCBzdG9yZXMgPSB0aGlzLnN0b3JlcyA9ICggdGhpcy5zdG9yZXMgfHwge30gKTtcblxuXHRcdGlmICggIXN0b3Jlcy5saXN0ZW5UbyB8fCAhc3RvcmVzLmxpc3RlblRvLmxlbmd0aCApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvciggYGxpc3RlblRvIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc3RvcmUgbmFtZXNwYWNlYCApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxpc3RlblRvID0gdHlwZW9mIHN0b3Jlcy5saXN0ZW5UbyA9PT0gXCJzdHJpbmdcIiA/IFsgc3RvcmVzLmxpc3RlblRvIF0gOiBzdG9yZXMubGlzdGVuVG87XG5cblx0XHRpZiAoICFzdG9yZXMub25DaGFuZ2UgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBBIGNvbXBvbmVudCB3YXMgdG9sZCB0byBsaXN0ZW4gdG8gdGhlIGZvbGxvd2luZyBzdG9yZShzKTogJHtsaXN0ZW5Ub30gYnV0IG5vIG9uQ2hhbmdlIGhhbmRsZXIgd2FzIGltcGxlbWVudGVkYCApO1xuXHRcdH1cblxuXHRcdF9fbHV4LndhaXRGb3IgPSBbXTtcblx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblxuXHRcdGxpc3RlblRvLmZvckVhY2goICggc3RvcmUgKSA9PiB7XG5cdFx0XHRfX2x1eC5zdWJzY3JpcHRpb25zWyBgJHtzdG9yZX0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAke3N0b3JlfS5jaGFuZ2VkYCwgKCkgPT4gZ2F0ZUtlZXBlci5jYWxsKCB0aGlzLCBzdG9yZSApICk7XG5cdFx0fSApO1xuXG5cdFx0X19sdXguc3Vic2NyaXB0aW9ucy5wcmVub3RpZnkgPSBkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoIFwicHJlbm90aWZ5XCIsICggZGF0YSApID0+IGhhbmRsZVByZU5vdGlmeS5jYWxsKCB0aGlzLCBkYXRhICkgKTtcblx0fSxcblx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAoIGxldCBbIGtleSwgc3ViIF0gb2YgZW50cmllcyggdGhpcy5fX2x1eC5zdWJzY3JpcHRpb25zICkgKSB7XG5cdFx0XHRsZXQgc3BsaXQ7XG5cdFx0XHRpZiAoIGtleSA9PT0gXCJwcmVub3RpZnlcIiB8fCAoICggc3BsaXQgPSBrZXkuc3BsaXQoIFwiLlwiICkgKSAmJiBzcGxpdC5wb3AoKSA9PT0gXCJjaGFuZ2VkXCIgKSApIHtcblx0XHRcdFx0c3ViLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRtaXhpbjoge31cbn07XG5cbmV4cG9ydCBjb25zdCBzdG9yZVJlYWN0TWl4aW4gPSB7XG5cdGNvbXBvbmVudFdpbGxNb3VudDogc3RvcmVNaXhpbi5zZXR1cCxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IHN0b3JlTWl4aW4udGVhcmRvd25cbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvc3RvcmUuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbmltcG9ydCB7IGVudHJpZXMgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IGdldEFjdGlvbkdyb3VwLCBhY3Rpb25zIH0gZnJvbSBcIi4uL2FjdGlvbnNcIjtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiogICAgICAgICAgIEFjdGlvbiBDcmVhdG9yIE1peGluICAgICAgICAgICpcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaCggYWN0aW9uLCAuLi5hcmdzICkge1xuXHRpZiAoIGFjdGlvbnNbIGFjdGlvbiBdICkge1xuXHRcdGFjdGlvbnNbIGFjdGlvbiBdKCAuLi5hcmdzICk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBgVGhlcmUgaXMgbm8gYWN0aW9uIG5hbWVkICcke2FjdGlvbn0nYCApO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBhY3Rpb25DcmVhdG9yTWl4aW4gPSB7XG5cdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldEFjdGlvbkdyb3VwID0gdGhpcy5nZXRBY3Rpb25Hcm91cCB8fCBbXTtcblx0XHR0aGlzLmdldEFjdGlvbnMgPSB0aGlzLmdldEFjdGlvbnMgfHwgW107XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzLmdldEFjdGlvbkdyb3VwID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0dGhpcy5nZXRBY3Rpb25Hcm91cCA9IFsgdGhpcy5nZXRBY3Rpb25Hcm91cCBdO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIHRoaXMuZ2V0QWN0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucyA9IFsgdGhpcy5nZXRBY3Rpb25zIF07XG5cdFx0fVxuXG5cdFx0Y29uc3QgYWRkQWN0aW9uSWZOb3RQcmVzZW50ID0gKCBrLCB2ICkgPT4ge1xuXHRcdFx0aWYgKCAhdGhpc1sgayBdICkge1xuXHRcdFx0XHR0aGlzWyBrIF0gPSB2O1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5nZXRBY3Rpb25Hcm91cC5mb3JFYWNoKCAoIGdyb3VwICkgPT4ge1xuXHRcdFx0Zm9yICggbGV0IFsgaywgdiBdIG9mIGVudHJpZXMoIGdldEFjdGlvbkdyb3VwKCBncm91cCApICkgKSB7XG5cdFx0XHRcdGFkZEFjdGlvbklmTm90UHJlc2VudCggaywgdiApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGlmICggdGhpcy5nZXRBY3Rpb25zLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuZ2V0QWN0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbigga2V5ICkge1xuXHRcdFx0XHRhZGRBY3Rpb25JZk5vdFByZXNlbnQoIGtleSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goIGtleSwgLi4uYXJndW1lbnRzICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cdH0sXG5cdG1peGluOiB7XG5cdFx0ZGlzcGF0Y2g6IGRpc3BhdGNoXG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBhY3Rpb25DcmVhdG9yUmVhY3RNaXhpbiA9IHtcblx0Y29tcG9uZW50V2lsbE1vdW50OiBhY3Rpb25DcmVhdG9yTWl4aW4uc2V0dXAsXG5cdGRpc3BhdGNoOiBkaXNwYXRjaFxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9hY3Rpb25DcmVhdG9yLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qICAgICAgICAgICAgQWN0aW9uIExpc3RlbmVyIE1peGluICAgICAgICAgICAqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuaW1wb3J0IHsgYWN0aW9uQ2hhbm5lbCB9IGZyb20gXCIuLi9idXNcIjtcbmltcG9ydCB7IGVuc3VyZUx1eFByb3AgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlQWN0aW9uQ3JlYXRvciwgYWRkVG9BY3Rpb25Hcm91cCB9IGZyb20gXCIuLi9hY3Rpb25zXCI7XG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uTGlzdGVuZXJNaXhpbiggeyBoYW5kbGVycywgaGFuZGxlckZuLCBjb250ZXh0LCBjaGFubmVsLCB0b3BpYyB9ID0ge30gKSB7XG5cdHJldHVybiB7XG5cdFx0c2V0dXAoKSB7XG5cdFx0XHRjb250ZXh0ID0gY29udGV4dCB8fCB0aGlzO1xuXHRcdFx0Y29uc3QgX19sdXggPSBlbnN1cmVMdXhQcm9wKCBjb250ZXh0ICk7XG5cdFx0XHRjb25zdCBzdWJzID0gX19sdXguc3Vic2NyaXB0aW9ucztcblx0XHRcdGhhbmRsZXJzID0gaGFuZGxlcnMgfHwgY29udGV4dC5oYW5kbGVycztcblx0XHRcdGNoYW5uZWwgPSBjaGFubmVsIHx8IGFjdGlvbkNoYW5uZWw7XG5cdFx0XHR0b3BpYyA9IHRvcGljIHx8IFwiZXhlY3V0ZS4qXCI7XG5cdFx0XHRoYW5kbGVyRm4gPSBoYW5kbGVyRm4gfHwgKCAoIGRhdGEsIGVudiApID0+IHtcblx0XHRcdFx0Y29uc3QgaGFuZGxlciA9IGhhbmRsZXJzWyBkYXRhLmFjdGlvblR5cGUgXTtcblx0XHRcdFx0aWYgKCBoYW5kbGVyICkge1xuXHRcdFx0XHRcdGhhbmRsZXIuYXBwbHkoIGNvbnRleHQsIGRhdGEuYWN0aW9uQXJncyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHRpZiAoICFoYW5kbGVycyB8fCAhT2JqZWN0LmtleXMoIGhhbmRsZXJzICkubGVuZ3RoICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgYWN0aW9uIGhhbmRsZXIgaW4gdGhlIGhhbmRsZXJzIHByb3BlcnR5XCIgKTtcblx0XHRcdH0gZWxzZSBpZiAoIHN1YnMgJiYgc3Vicy5hY3Rpb25MaXN0ZW5lciApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0c3Vicy5hY3Rpb25MaXN0ZW5lciA9IGNoYW5uZWwuc3Vic2NyaWJlKCB0b3BpYywgaGFuZGxlckZuICkuY29udGV4dCggY29udGV4dCApO1xuXHRcdFx0Y29uc3QgaGFuZGxlcktleXMgPSBPYmplY3Qua2V5cyggaGFuZGxlcnMgKTtcblx0XHRcdGdlbmVyYXRlQWN0aW9uQ3JlYXRvciggaGFuZGxlcktleXMgKTtcblx0XHRcdGlmICggY29udGV4dC5uYW1lc3BhY2UgKSB7XG5cdFx0XHRcdGFkZFRvQWN0aW9uR3JvdXAoIGNvbnRleHQubmFtZXNwYWNlLCBoYW5kbGVyS2V5cyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dGVhcmRvd24oKSB7XG5cdFx0XHR0aGlzLl9fbHV4LnN1YnNjcmlwdGlvbnMuYWN0aW9uTGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcblx0XHR9XG5cdH07XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9taXhpbnMvYWN0aW9uTGlzdGVuZXIuanNcbiAqKi8iLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBlbnN1cmVMdXhQcm9wLCBlbnRyaWVzIH0gZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgeyBzdG9yZUNoYW5uZWwsIGRpc3BhdGNoZXJDaGFubmVsIH0gZnJvbSBcIi4uL2J1c1wiO1xuaW1wb3J0IHsgb21pdCwgaXNTdHJpbmcsIGlzRnVuY3Rpb24gfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gXCIuL2FjdGlvbkNyZWF0b3JcIjtcblxuZnVuY3Rpb24gZ2F0ZUtlZXBlciggc3RvcmUsIGRhdGEgKSB7XG5cdGNvbnN0IHBheWxvYWQgPSB7fTtcblx0cGF5bG9hZFsgc3RvcmUgXSA9IHRydWU7XG5cdGNvbnN0IF9fbHV4ID0gdGhpcy5fX2x1eDtcblxuXHRjb25zdCBmb3VuZCA9IF9fbHV4LndhaXRGb3IuaW5kZXhPZiggc3RvcmUgKTtcblxuXHRpZiAoIGZvdW5kID4gLTEgKSB7XG5cdFx0X19sdXgud2FpdEZvci5zcGxpY2UoIGZvdW5kLCAxICk7XG5cdFx0X19sdXguaGVhcmRGcm9tLnB1c2goIHBheWxvYWQgKTtcblxuXHRcdGlmICggX19sdXgud2FpdEZvci5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoIHRoaXMucHJvcHMub25TdG9yZUNoYW5nZSggdGhpcy5wcm9wcywgcGF5bG9hZCApICk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVByZU5vdGlmeSggZGF0YSApIHtcblx0dGhpcy5fX2x1eC53YWl0Rm9yID0gZGF0YS5zdG9yZXMuZmlsdGVyKFxuXHRcdCggaXRlbSApID0+IHRoaXMucHJvcHMuc3RvcmVzLmluZGV4T2YoIGl0ZW0gKSA+IC0xXG5cdCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwU3RvcmVMaXN0ZW5lciggaW5zdGFuY2UgKSB7XG5cdGNvbnN0IF9fbHV4ID0gZW5zdXJlTHV4UHJvcCggaW5zdGFuY2UgKTtcblx0X19sdXgud2FpdEZvciA9IFtdO1xuXHRfX2x1eC5oZWFyZEZyb20gPSBbXTtcblx0Y29uc3Qgc3RvcmVzID0gaW5zdGFuY2UucHJvcHMuc3RvcmVzLnNwbGl0KCBcIixcIiApLm1hcCggeD0+IHgudHJpbSgpICk7XG5cblx0c3RvcmVzLmZvckVhY2goICggc3RvcmUgKSA9PiB7XG5cdFx0X19sdXguc3Vic2NyaXB0aW9uc1sgYCR7IHN0b3JlIH0uY2hhbmdlZGAgXSA9IHN0b3JlQ2hhbm5lbC5zdWJzY3JpYmUoIGAkeyBzdG9yZSB9LmNoYW5nZWRgLCAoKSA9PiBnYXRlS2VlcGVyLmNhbGwoIGluc3RhbmNlLCBzdG9yZSApICk7XG5cdH0gKTtcblxuXHRfX2x1eC5zdWJzY3JpcHRpb25zLnByZW5vdGlmeSA9IGRpc3BhdGNoZXJDaGFubmVsLnN1YnNjcmliZSggXCJwcmVub3RpZnlcIiwgKCBkYXRhICkgPT4gaGFuZGxlUHJlTm90aWZ5LmNhbGwoIGluc3RhbmNlLCBkYXRhICkgKTtcbn1cblxuZnVuY3Rpb24gaXNTeW50aGV0aWNFdmVudCggZSApIHtcblx0cmV0dXJuIGUuaGFzT3duUHJvcGVydHkoIFwiZXZlbnRQaGFzZVwiICkgJiZcblx0XHRlLmhhc093blByb3BlcnR5KCBcIm5hdGl2ZUV2ZW50XCIgKSAmJlxuXHRcdGUuaGFzT3duUHJvcGVydHkoIFwidGFyZ2V0XCIgKSAmJlxuXHRcdGUuaGFzT3duUHJvcGVydHkoIFwidHlwZVwiICk7XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBY3Rpb25DcmVhdG9yKCBhY3Rpb24gKSB7XG5cdGlmICggT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCBhY3Rpb24gKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIiApIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oIGUsIC4uLmFyZ3MgKSB7XG5cdFx0XHRpZiAoICFpc1N5bnRoZXRpY0V2ZW50KCBlICkgKSB7XG5cdFx0XHRcdGFyZ3MudW5zaGlmdCggZSApO1xuXHRcdFx0fVxuXHRcdFx0ZGlzcGF0Y2goIGFjdGlvbiwgLi4uYXJncyApO1xuXHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gc2V0dXBBY3Rpb25NYXAoIGluc3RhbmNlICkge1xuXHRpbnN0YW5jZS5wcm9wVG9BY3Rpb24gPSB7fTtcblx0Zm9yICggbGV0IFsgY2hpbGRQcm9wLCBhY3Rpb24gXSBvZiBlbnRyaWVzKCBpbnN0YW5jZS5wcm9wcy5hY3Rpb25zICkgKSB7XG5cdFx0bGV0IGFjdGlvbkNyZWF0b3IgPSBhY3Rpb247IC8vIGFzc3VtZXMgZnVuY3Rpb24gYnkgZGVmYXVsdFxuXHRcdGlmICggaXNTdHJpbmcoIGFjdGlvbiApICkge1xuXHRcdFx0YWN0aW9uQ3JlYXRvciA9IGdldERlZmF1bHRBY3Rpb25DcmVhdG9yKCBhY3Rpb24gKTtcblx0XHR9IGVsc2UgaWYgKCAhaXNGdW5jdGlvbiggYWN0aW9uICkgKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoIFwiVGhlIHZhbHVlcyBwcm92aWRlZCB0byB0aGUgTHV4Q29udGFpbmVyIGFjdGlvbnMgcHJvcGVydHkgbXVzdCBiZSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uXCIgKTtcblx0XHR9XG5cdFx0aW5zdGFuY2UucHJvcFRvQWN0aW9uWyBjaGlsZFByb3AgXSA9IGFjdGlvbkNyZWF0b3I7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTHV4Q29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IoIHByb3BzICkge1xuXHRcdHN1cGVyKCBwcm9wcyApO1xuXHRcdHNldHVwU3RvcmVMaXN0ZW5lciggdGhpcyApO1xuXHRcdHNldHVwQWN0aW9uTWFwKCB0aGlzICk7XG5cdFx0dGhpcy5jb21wb25lbnRXaWxsVW5tb3VudC5iaW5kKCB0aGlzICk7XG5cdH1cblxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRmb3IgKCBsZXQgWyBrZXksIHN1YiBdIG9mIGVudHJpZXMoIHRoaXMuX19sdXguc3Vic2NyaXB0aW9ucyApICkge1xuXHRcdFx0bGV0IHNwbGl0O1xuXHRcdFx0aWYgKCBrZXkgPT09IFwicHJlbm90aWZ5XCIgfHwgKCAoIHNwbGl0ID0ga2V5LnNwbGl0KCBcIi5cIiApICkgJiYgc3BsaXQucG9wKCkgPT09IFwiY2hhbmdlZFwiICkgKSB7XG5cdFx0XHRcdHN1Yi51bnN1YnNjcmliZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRyZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KFxuXHRcdFx0dGhpcy5wcm9wcy5jaGlsZHJlbixcblx0XHRcdE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdHt9LFxuXHRcdFx0XHRvbWl0KCB0aGlzLnByb3BzLCBcImNoaWxkcmVuXCIsIFwib25TdG9yZUNoYW5nZVwiLCBcInN0b3Jlc1wiLCBcImFjdGlvbnNcIiApLFxuXHRcdFx0XHR0aGlzLnByb3BUb0FjdGlvbixcblx0XHRcdFx0dGhpcy5zdGF0ZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuTHV4Q29udGFpbmVyLnByb3BUeXBlcyA9IHtcblx0b25TdG9yZUNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG5cdHN0b3JlczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLmVsZW1lbnQuaXNSZXF1aXJlZFxufTtcblxuTHV4Q29udGFpbmVyLmRlZmF1bHRQcm9wcyA9IHtcblx0c3RvcmVzOiBcIlwiLFxuXHRhY3Rpb25zOiB7fVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL21peGlucy9sdXhDb250YWluZXIuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTFfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIHtcInJvb3RcIjpcIlJlYWN0XCIsXCJjb21tb25qc1wiOlwicmVhY3RcIixcImNvbW1vbmpzMlwiOlwicmVhY3RcIixcImFtZFwiOlwicmVhY3RcIn1cbiAqKiBtb2R1bGUgaWQgPSAxMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IHsgc3RvcmVDaGFubmVsLCBkaXNwYXRjaGVyQ2hhbm5lbCB9IGZyb20gXCIuL2J1c1wiO1xuaW1wb3J0IHsgZW50cmllcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tIFwiLi9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBtaXhpbiB9IGZyb20gXCIuL21peGluc1wiO1xuXG5leHBvcnQgY29uc3Qgc3RvcmVzID0ge307XG5cbmZ1bmN0aW9uIGJ1aWxkQWN0aW9uTGlzdCggaGFuZGxlcnMgKSB7XG5cdGNvbnN0IGFjdGlvbkxpc3QgPSBbXTtcblx0Zm9yICggbGV0IFsga2V5LCBoYW5kbGVyIF0gb2YgZW50cmllcyggaGFuZGxlcnMgKSApIHtcblx0XHRhY3Rpb25MaXN0LnB1c2goIHtcblx0XHRcdGFjdGlvblR5cGU6IGtleSxcblx0XHRcdHdhaXRGb3I6IGhhbmRsZXIud2FpdEZvciB8fCBbXVxuXHRcdH0gKTtcblx0fVxuXHRyZXR1cm4gYWN0aW9uTGlzdDtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgc3RvcmUgKSB7XG5cdGNvbnN0IG5hbWVzcGFjZSA9ICggb3B0aW9ucyAmJiBvcHRpb25zLm5hbWVzcGFjZSApIHx8IHN0b3JlLm5hbWVzcGFjZTtcblx0aWYgKCBuYW1lc3BhY2UgaW4gc3RvcmVzICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYFRoZSBzdG9yZSBuYW1lc3BhY2UgXCIke25hbWVzcGFjZX1cIiBhbHJlYWR5IGV4aXN0cy5gICk7XG5cdH1cblx0aWYgKCAhbmFtZXNwYWNlICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggXCJBIGx1eCBzdG9yZSBtdXN0IGhhdmUgYSBuYW1lc3BhY2UgdmFsdWUgcHJvdmlkZWRcIiApO1xuXHR9XG5cdGlmICggIWhhbmRsZXJzIHx8ICFPYmplY3Qua2V5cyggaGFuZGxlcnMgKS5sZW5ndGggKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCBcIkEgbHV4IHN0b3JlIG11c3QgaGF2ZSBhY3Rpb24gaGFuZGxlciBtZXRob2RzIHByb3ZpZGVkXCIgKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRIYW5kbGVyT2JqZWN0KCBrZXksIGxpc3RlbmVycyApIHtcblx0cmV0dXJuIHtcblx0XHR3YWl0Rm9yOiBbXSxcblx0XHRoYW5kbGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBjaGFuZ2VkID0gMDtcblx0XHRcdGNvbnN0IGFyZ3MgPSBBcnJheS5mcm9tKCBhcmd1bWVudHMgKTtcblx0XHRcdGxpc3RlbmVyc1sga2V5IF0uZm9yRWFjaCggZnVuY3Rpb24oIGxpc3RlbmVyICkge1xuXHRcdFx0XHRjaGFuZ2VkICs9ICggbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKSA9PT0gZmFsc2UgPyAwIDogMSApO1xuXHRcdFx0fS5iaW5kKCB0aGlzICkgKTtcblx0XHRcdHJldHVybiBjaGFuZ2VkID4gMDtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdhaXRGb3IoIHNvdXJjZSwgaGFuZGxlck9iamVjdCApIHtcblx0aWYgKCBzb3VyY2Uud2FpdEZvciApIHtcblx0XHRzb3VyY2Uud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0aWYgKCBoYW5kbGVyT2JqZWN0LndhaXRGb3IuaW5kZXhPZiggZGVwICkgPT09IC0xICkge1xuXHRcdFx0XHRoYW5kbGVyT2JqZWN0LndhaXRGb3IucHVzaCggZGVwICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVycyggbGlzdGVuZXJzLCBrZXksIGhhbmRsZXIgKSB7XG5cdGxpc3RlbmVyc1sga2V5IF0gPSBsaXN0ZW5lcnNbIGtleSBdIHx8IFtdO1xuXHRsaXN0ZW5lcnNbIGtleSBdLnB1c2goIGhhbmRsZXIuaGFuZGxlciB8fCBoYW5kbGVyICk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdG9yZUFyZ3MoIC4uLm9wdGlvbnMgKSB7XG5cdGNvbnN0IGxpc3RlbmVycyA9IHt9O1xuXHRjb25zdCBoYW5kbGVycyA9IHt9O1xuXHRjb25zdCBzdGF0ZSA9IHt9O1xuXHRjb25zdCBvdGhlck9wdHMgPSB7fTtcblx0b3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiggbyApIHtcblx0XHRsZXQgb3B0O1xuXHRcdGlmICggbyApIHtcblx0XHRcdG9wdCA9IF8uY2xvbmUoIG8gKTtcblx0XHRcdF8ubWVyZ2UoIHN0YXRlLCBvcHQuc3RhdGUgKTtcblx0XHRcdGlmICggb3B0LmhhbmRsZXJzICkge1xuXHRcdFx0XHRPYmplY3Qua2V5cyggb3B0LmhhbmRsZXJzICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0XHRsZXQgaGFuZGxlciA9IG9wdC5oYW5kbGVyc1sga2V5IF07XG5cdFx0XHRcdFx0Ly8gc2V0IHVwIHRoZSBhY3R1YWwgaGFuZGxlciBtZXRob2QgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkXG5cdFx0XHRcdFx0Ly8gYXMgdGhlIHN0b3JlIGhhbmRsZXMgYSBkaXNwYXRjaGVkIGFjdGlvblxuXHRcdFx0XHRcdGhhbmRsZXJzWyBrZXkgXSA9IGhhbmRsZXJzWyBrZXkgXSB8fCBnZXRIYW5kbGVyT2JqZWN0KCBrZXksIGxpc3RlbmVycyApO1xuXHRcdFx0XHRcdC8vIGVuc3VyZSB0aGF0IHRoZSBoYW5kbGVyIGRlZmluaXRpb24gaGFzIGEgbGlzdCBvZiBhbGwgc3RvcmVzXG5cdFx0XHRcdFx0Ly8gYmVpbmcgd2FpdGVkIHVwb25cblx0XHRcdFx0XHR1cGRhdGVXYWl0Rm9yKCBoYW5kbGVyLCBoYW5kbGVyc1sga2V5IF0gKTtcblx0XHRcdFx0XHQvLyBBZGQgdGhlIG9yaWdpbmFsIGhhbmRsZXIgbWV0aG9kKHMpIHRvIHRoZSBsaXN0ZW5lcnMgcXVldWVcblx0XHRcdFx0XHRhZGRMaXN0ZW5lcnMoIGxpc3RlbmVycywga2V5LCBoYW5kbGVyICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBvcHQuaGFuZGxlcnM7XG5cdFx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHRcdFx0Xy5tZXJnZSggb3RoZXJPcHRzLCBvcHQgKTtcblx0XHR9XG5cdH0gKTtcblx0cmV0dXJuIFsgc3RhdGUsIGhhbmRsZXJzLCBvdGhlck9wdHMgXTtcbn1cblxuZXhwb3J0IGNsYXNzIFN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvciggLi4ub3B0ICkge1xuXHRcdGxldCBbIHN0YXRlLCBoYW5kbGVycywgb3B0aW9ucyBdID0gcHJvY2Vzc1N0b3JlQXJncyggLi4ub3B0ICk7XG5cdFx0ZW5zdXJlU3RvcmVPcHRpb25zKCBvcHRpb25zLCBoYW5kbGVycywgdGhpcyApO1xuXHRcdGNvbnN0IG5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlIHx8IHRoaXMubmFtZXNwYWNlO1xuXHRcdE9iamVjdC5hc3NpZ24oIHRoaXMsIG9wdGlvbnMgKTtcblx0XHRzdG9yZXNbIG5hbWVzcGFjZSBdID0gdGhpcztcblx0XHRsZXQgaW5EaXNwYXRjaCA9IGZhbHNlO1xuXHRcdHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5nZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHN0YXRlO1xuXHRcdH07XG5cblx0XHR0aGlzLnNldFN0YXRlID0gZnVuY3Rpb24oIG5ld1N0YXRlICkge1xuXHRcdFx0aWYgKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInNldFN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBkdXJpbmcgYSBkaXNwYXRjaCBjeWNsZSBmcm9tIGEgc3RvcmUgYWN0aW9uIGhhbmRsZXIuXCIgKTtcblx0XHRcdH1cblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMucmVwbGFjZVN0YXRlID0gZnVuY3Rpb24oIG5ld1N0YXRlICkge1xuXHRcdFx0aWYgKCAhaW5EaXNwYXRjaCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBcInJlcGxhY2VTdGF0ZSBjYW4gb25seSBiZSBjYWxsZWQgZHVyaW5nIGEgZGlzcGF0Y2ggY3ljbGUgZnJvbSBhIHN0b3JlIGFjdGlvbiBoYW5kbGVyLlwiICk7XG5cdFx0XHR9XG5cdFx0XHQvLyB3ZSBwcmVzZXJ2ZSB0aGUgdW5kZXJseWluZyBzdGF0ZSByZWYsIGJ1dCBjbGVhciBpdFxuXHRcdFx0T2JqZWN0LmtleXMoIHN0YXRlICkuZm9yRWFjaCggZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0ZGVsZXRlIHN0YXRlWyBrZXkgXTtcblx0XHRcdH0gKTtcblx0XHRcdHN0YXRlID0gT2JqZWN0LmFzc2lnbiggc3RhdGUsIG5ld1N0YXRlICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZmx1c2ggPSBmdW5jdGlvbiBmbHVzaCgpIHtcblx0XHRcdGluRGlzcGF0Y2ggPSBmYWxzZTtcblx0XHRcdGlmICggdGhpcy5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRcdFx0c3RvcmVDaGFubmVsLnB1Ymxpc2goIGAke3RoaXMubmFtZXNwYWNlfS5jaGFuZ2VkYCApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtaXhpbiggdGhpcywgbWl4aW4uYWN0aW9uTGlzdGVuZXIoIHtcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRjaGFubmVsOiBkaXNwYXRjaGVyQ2hhbm5lbCxcblx0XHRcdHRvcGljOiBgJHtuYW1lc3BhY2V9LmhhbmRsZS4qYCxcblx0XHRcdGhhbmRsZXJzOiBoYW5kbGVycyxcblx0XHRcdGhhbmRsZXJGbjogZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0XHRcdGlmICggaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoIGRhdGEuYWN0aW9uVHlwZSApICkge1xuXHRcdFx0XHRcdGluRGlzcGF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdHZhciByZXMgPSBoYW5kbGVyc1sgZGF0YS5hY3Rpb25UeXBlIF0uaGFuZGxlci5hcHBseSggdGhpcywgZGF0YS5hY3Rpb25BcmdzLmNvbmNhdCggZGF0YS5kZXBzICkgKTtcblx0XHRcdFx0XHR0aGlzLmhhc0NoYW5nZWQgPSAoIHJlcyA9PT0gZmFsc2UgKSA/IGZhbHNlIDogdHJ1ZTtcblx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0XHRcdFx0YCR7dGhpcy5uYW1lc3BhY2V9LmhhbmRsZWQuJHtkYXRhLmFjdGlvblR5cGV9YCxcblx0XHRcdFx0XHRcdHsgaGFzQ2hhbmdlZDogdGhpcy5oYXNDaGFuZ2VkLCBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlIH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LmJpbmQoIHRoaXMgKVxuXHRcdH0gKSApO1xuXG5cdFx0dGhpcy5fX3N1YnNjcmlwdGlvbiA9IHtcblx0XHRcdG5vdGlmeTogZGlzcGF0Y2hlckNoYW5uZWwuc3Vic2NyaWJlKCBgbm90aWZ5YCwgKCkgPT4gdGhpcy5mbHVzaCgpIClcblx0XHRcdFx0XHQuY29uc3RyYWludCggKCkgPT4gaW5EaXNwYXRjaCApXG5cdFx0fTtcblxuXHRcdGRpc3BhdGNoZXIucmVnaXN0ZXJTdG9yZShcblx0XHRcdHtcblx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRhY3Rpb25zOiBidWlsZEFjdGlvbkxpc3QoIGhhbmRsZXJzIClcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0Ly8gTmVlZCB0byBidWlsZCBpbiBiZWhhdmlvciB0byByZW1vdmUgdGhpcyBzdG9yZVxuXHQvLyBmcm9tIHRoZSBkaXNwYXRjaGVyJ3MgYWN0aW9uTWFwIGFzIHdlbGwhXG5cdGRpc3Bvc2UoKSB7XG5cdFx0Lyplc2xpbnQtZGlzYWJsZSAqL1xuXHRcdGZvciAoIGxldCBbIGssIHN1YnNjcmlwdGlvbiBdIG9mIGVudHJpZXMoIHRoaXMuX19zdWJzY3JpcHRpb24gKSApIHtcblx0XHRcdHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXHRcdH1cblx0XHQvKmVzbGludC1lbmFibGUgKi9cblx0XHRkZWxldGUgc3RvcmVzWyB0aGlzLm5hbWVzcGFjZSBdO1xuXHRcdGRpc3BhdGNoZXIucmVtb3ZlU3RvcmUoIHRoaXMubmFtZXNwYWNlICk7XG5cdFx0dGhpcy5sdXhDbGVhbnVwKCk7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVN0b3JlKCBuYW1lc3BhY2UgKSB7XG5cdHN0b3Jlc1sgbmFtZXNwYWNlIF0uZGlzcG9zZSgpO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc3RvcmUuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGRpc3BhdGNoZXJDaGFubmVsLCBhY3Rpb25DaGFubmVsIH0gZnJvbSBcIi4vYnVzXCI7XG5pbXBvcnQgeyBlbnRyaWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBtYWNoaW5hIGZyb20gXCJtYWNoaW5hXCI7XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUdlbiggc3RvcmUsIGxvb2t1cCwgZ2VuLCBhY3Rpb25UeXBlLCBuYW1lc3BhY2VzICkge1xuXHRsZXQgY2FsY2RHZW4gPSBnZW47XG5cdGNvbnN0IF9uYW1lc3BhY2VzID0gbmFtZXNwYWNlcyB8fCBbXTtcblx0aWYgKCBfbmFtZXNwYWNlcy5pbmRleE9mKCBzdG9yZS5uYW1lc3BhY2UgKSA+IC0xICkge1xuXHRcdHRocm93IG5ldyBFcnJvciggYENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgZm9yIHRoZSBcIiR7c3RvcmUubmFtZXNwYWNlfVwiIHN0b3JlIHdoZW4gcGFydGljaXBhdGluZyBpbiB0aGUgXCIke2FjdGlvblR5cGV9XCIgYWN0aW9uLmAgKTtcblx0fVxuXHRpZiAoIHN0b3JlLndhaXRGb3IgJiYgc3RvcmUud2FpdEZvci5sZW5ndGggKSB7XG5cdFx0c3RvcmUud2FpdEZvci5mb3JFYWNoKCBmdW5jdGlvbiggZGVwICkge1xuXHRcdFx0Y29uc3QgZGVwU3RvcmUgPSBsb29rdXBbIGRlcCBdO1xuXHRcdFx0aWYgKCBkZXBTdG9yZSApIHtcblx0XHRcdFx0X25hbWVzcGFjZXMucHVzaCggc3RvcmUubmFtZXNwYWNlICk7XG5cdFx0XHRcdGNvbnN0IHRoaXNHZW4gPSBjYWxjdWxhdGVHZW4oIGRlcFN0b3JlLCBsb29rdXAsIGdlbiArIDEsIGFjdGlvblR5cGUsIF9uYW1lc3BhY2VzICk7XG5cdFx0XHRcdGlmICggdGhpc0dlbiA+IGNhbGNkR2VuICkge1xuXHRcdFx0XHRcdGNhbGNkR2VuID0gdGhpc0dlbjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCBgVGhlIFwiJHthY3Rpb25UeXBlfVwiIGFjdGlvbiBpbiB0aGUgXCIke3N0b3JlLm5hbWVzcGFjZX1cIiBzdG9yZSB3YWl0cyBmb3IgXCIke2RlcH1cIiBidXQgYSBzdG9yZSB3aXRoIHRoYXQgbmFtZXNwYWNlIGRvZXMgbm90IHBhcnRpY2lwYXRlIGluIHRoaXMgYWN0aW9uLmAgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblx0cmV0dXJuIGNhbGNkR2VuO1xufVxuXG5mdW5jdGlvbiBidWlsZEdlbmVyYXRpb25zKCBzdG9yZXMsIGFjdGlvblR5cGUgKSB7XG5cdGNvbnN0IHRyZWUgPSBbXTtcblx0Y29uc3QgbG9va3VwID0ge307XG5cdHN0b3Jlcy5mb3JFYWNoKCAoIHN0b3JlICkgPT4gbG9va3VwWyBzdG9yZS5uYW1lc3BhY2UgXSA9IHN0b3JlICk7XG5cdHN0b3Jlcy5mb3JFYWNoKCAoIHN0b3JlICkgPT4gc3RvcmUuZ2VuID0gY2FsY3VsYXRlR2VuKCBzdG9yZSwgbG9va3VwLCAwLCBhY3Rpb25UeXBlICkgKTtcblx0Lyplc2xpbnQtZGlzYWJsZSAqL1xuXHRmb3IgKCBsZXQgWyBrZXksIGl0ZW0gXSBvZiBlbnRyaWVzKCBsb29rdXAgKSApIHtcblx0XHR0cmVlWyBpdGVtLmdlbiBdID0gdHJlZVsgaXRlbS5nZW4gXSB8fCBbXTtcblx0XHR0cmVlWyBpdGVtLmdlbiBdLnB1c2goIGl0ZW0gKTtcblx0fVxuXHQvKmVzbGludC1lbmFibGUgKi9cblx0cmV0dXJuIHRyZWU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NHZW5lcmF0aW9uKCBnZW5lcmF0aW9uLCBhY3Rpb24gKSB7XG5cdGdlbmVyYXRpb24ubWFwKCAoIHN0b3JlICkgPT4ge1xuXHRcdGNvbnN0IGRhdGEgPSBPYmplY3QuYXNzaWduKCB7XG5cdFx0XHRkZXBzOiBfLnBpY2soIHRoaXMuc3RvcmVzLCBzdG9yZS53YWl0Rm9yIClcblx0XHR9LCBhY3Rpb24gKTtcblx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKFxuXHRcdFx0YCR7c3RvcmUubmFtZXNwYWNlfS5oYW5kbGUuJHthY3Rpb24uYWN0aW9uVHlwZX1gLFxuXHRcdFx0ZGF0YVxuXHRcdCk7XG5cdH0gKTtcbn1cblxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIG1hY2hpbmEuQmVoYXZpb3JhbEZzbSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCB7XG5cdFx0XHRpbml0aWFsU3RhdGU6IFwicmVhZHlcIixcblx0XHRcdGFjdGlvbk1hcDoge30sXG5cdFx0XHRzdGF0ZXM6IHtcblx0XHRcdFx0cmVhZHk6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFjdGlvbkNvbnRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcImFjdGlvbi5kaXNwYXRjaFwiOiBcImRpc3BhdGNoaW5nXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGlzcGF0Y2hpbmc6IHtcblx0XHRcdFx0XHRfb25FbnRlcjogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdHRoaXMuYWN0aW9uQ29udGV4dCA9IGx1eEFjdGlvbjtcblx0XHRcdFx0XHRcdGlmICggbHV4QWN0aW9uLmdlbmVyYXRpb25zLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdFx0Zm9yICggdmFyIGdlbmVyYXRpb24gb2YgbHV4QWN0aW9uLmdlbmVyYXRpb25zICkge1xuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NHZW5lcmF0aW9uLmNhbGwoIGx1eEFjdGlvbiwgZ2VuZXJhdGlvbiwgbHV4QWN0aW9uLmFjdGlvbiApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHRoaXMudHJhbnNpdGlvbiggbHV4QWN0aW9uLCBcIm5vdGlmeWluZ1wiICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnRyYW5zaXRpb24oIGx1eEFjdGlvbiwgXCJub3RoYW5kbGVkXCIgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFwiYWN0aW9uLmhhbmRsZWRcIjogZnVuY3Rpb24oIGx1eEFjdGlvbiwgZGF0YSApIHtcblx0XHRcdFx0XHRcdGlmICggZGF0YS5oYXNDaGFuZ2VkICkge1xuXHRcdFx0XHRcdFx0XHRsdXhBY3Rpb24udXBkYXRlZC5wdXNoKCBkYXRhLm5hbWVzcGFjZSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X29uRXhpdDogZnVuY3Rpb24oIGx1eEFjdGlvbiApIHtcblx0XHRcdFx0XHRcdGlmICggbHV4QWN0aW9uLnVwZGF0ZWQubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcInByZW5vdGlmeVwiLCB7IHN0b3JlczogbHV4QWN0aW9uLnVwZGF0ZWQgfSApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aWZ5aW5nOiB7XG5cdFx0XHRcdFx0X29uRW50ZXI6IGZ1bmN0aW9uKCBsdXhBY3Rpb24gKSB7XG5cdFx0XHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5wdWJsaXNoKCBcIm5vdGlmeVwiLCB7XG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogbHV4QWN0aW9uLmFjdGlvblxuXHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm90aGFuZGxlZDoge31cblx0XHRcdH0sXG5cdFx0XHRnZXRTdG9yZXNIYW5kbGluZyggYWN0aW9uVHlwZSApIHtcblx0XHRcdFx0Y29uc3Qgc3RvcmVzID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvblR5cGUgXSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzdG9yZXMsXG5cdFx0XHRcdFx0Z2VuZXJhdGlvbnM6IGJ1aWxkR2VuZXJhdGlvbnMoIHN0b3JlcywgYWN0aW9uVHlwZSApXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSApO1xuXHRcdHRoaXMuY3JlYXRlU3Vic2NyaWJlcnMoKTtcblx0fVxuXG5cdGhhbmRsZUFjdGlvbkRpc3BhdGNoKCBkYXRhICkge1xuXHRcdGNvbnN0IGx1eEFjdGlvbiA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7IGFjdGlvbjogZGF0YSwgZ2VuZXJhdGlvbkluZGV4OiAwLCB1cGRhdGVkOiBbXSB9LFxuXHRcdFx0dGhpcy5nZXRTdG9yZXNIYW5kbGluZyggZGF0YS5hY3Rpb25UeXBlIClcblx0XHQpO1xuXHRcdHRoaXMuaGFuZGxlKCBsdXhBY3Rpb24sIFwiYWN0aW9uLmRpc3BhdGNoXCIgKTtcblx0fVxuXG5cdHJlZ2lzdGVyU3RvcmUoIHN0b3JlTWV0YSApIHtcblx0XHRmb3IgKCBsZXQgYWN0aW9uRGVmIG9mIHN0b3JlTWV0YS5hY3Rpb25zICkge1xuXHRcdFx0bGV0IGFjdGlvbjtcblx0XHRcdGNvbnN0IGFjdGlvbk5hbWUgPSBhY3Rpb25EZWYuYWN0aW9uVHlwZTtcblx0XHRcdGNvbnN0IGFjdGlvbk1ldGEgPSB7XG5cdFx0XHRcdG5hbWVzcGFjZTogc3RvcmVNZXRhLm5hbWVzcGFjZSxcblx0XHRcdFx0d2FpdEZvcjogYWN0aW9uRGVmLndhaXRGb3Jcblx0XHRcdH07XG5cdFx0XHRhY3Rpb24gPSB0aGlzLmFjdGlvbk1hcFsgYWN0aW9uTmFtZSBdID0gdGhpcy5hY3Rpb25NYXBbIGFjdGlvbk5hbWUgXSB8fCBbXTtcblx0XHRcdGFjdGlvbi5wdXNoKCBhY3Rpb25NZXRhICk7XG5cdFx0fVxuXHR9XG5cblx0cmVtb3ZlU3RvcmUoIG5hbWVzcGFjZSApIHtcblx0XHRmdW5jdGlvbiBpc1RoaXNOYW1lU3BhY2UoIG1ldGEgKSB7XG5cdFx0XHRyZXR1cm4gbWV0YS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZTtcblx0XHR9XG5cdFx0Lyplc2xpbnQtZGlzYWJsZSAqL1xuXHRcdGZvciAoIGxldCBbIGssIHYgXSBvZiBlbnRyaWVzKCB0aGlzLmFjdGlvbk1hcCApICkge1xuXHRcdFx0bGV0IGlkeCA9IHYuZmluZEluZGV4KCBpc1RoaXNOYW1lU3BhY2UgKTtcblx0XHRcdGlmICggaWR4ICE9PSAtMSApIHtcblx0XHRcdFx0di5zcGxpY2UoIGlkeCwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvKmVzbGludC1lbmFibGUgKi9cblx0fVxuXG5cdGNyZWF0ZVN1YnNjcmliZXJzKCkge1xuXHRcdGlmICggIXRoaXMuX19zdWJzY3JpcHRpb25zIHx8ICF0aGlzLl9fc3Vic2NyaXB0aW9ucy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IFtcblx0XHRcdFx0YWN0aW9uQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCJleGVjdXRlLipcIixcblx0XHRcdFx0XHQoIGRhdGEsIGVudiApID0+IHRoaXMuaGFuZGxlQWN0aW9uRGlzcGF0Y2goIGRhdGEgKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRkaXNwYXRjaGVyQ2hhbm5lbC5zdWJzY3JpYmUoXG5cdFx0XHRcdFx0XCIqLmhhbmRsZWQuKlwiLFxuXHRcdFx0XHRcdCggZGF0YSApID0+IHRoaXMuaGFuZGxlKCB0aGlzLmFjdGlvbkNvbnRleHQsIFwiYWN0aW9uLmhhbmRsZWRcIiwgZGF0YSApXG5cdFx0XHRcdCkuY29uc3RyYWludCggKCkgPT4gISF0aGlzLmFjdGlvbkNvbnRleHQgKVxuXHRcdFx0XTtcblx0XHR9XG5cdH1cblxuXHRkaXNwb3NlKCkge1xuXHRcdGlmICggdGhpcy5fX3N1YnNjcmlwdGlvbnMgKSB7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKCAoIHN1YnNjcmlwdGlvbiApID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpICk7XG5cdFx0XHR0aGlzLl9fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBEaXNwYXRjaGVyKCk7XG5cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2Rpc3BhdGNoZXIuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMTRfXztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwibWFjaGluYVwiXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcblxuZXhwb3J0IGNvbnN0IGV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZCggLi4ub3B0aW9ucyApIHtcblx0Y29uc3QgcGFyZW50ID0gdGhpcztcblx0bGV0IHN0b3JlOyAvLyBwbGFjZWhvbGRlciBmb3IgaW5zdGFuY2UgY29uc3RydWN0b3Jcblx0Y29uc3QgQ3RvciA9IGZ1bmN0aW9uKCkge307IC8vIHBsYWNlaG9sZGVyIGN0b3IgZnVuY3Rpb24gdXNlZCB0byBpbnNlcnQgbGV2ZWwgaW4gcHJvdG90eXBlIGNoYWluXG5cblx0Ly8gRmlyc3QgLSBzZXBhcmF0ZSBtaXhpbnMgZnJvbSBwcm90b3R5cGUgcHJvcHNcblx0Y29uc3QgbWl4aW5zID0gW107XG5cdGZvciAoIGxldCBvcHQgb2Ygb3B0aW9ucyApIHtcblx0XHRtaXhpbnMucHVzaCggXy5waWNrKCBvcHQsIFsgXCJoYW5kbGVyc1wiLCBcInN0YXRlXCIgXSApICk7XG5cdFx0ZGVsZXRlIG9wdC5oYW5kbGVycztcblx0XHRkZWxldGUgb3B0LnN0YXRlO1xuXHR9XG5cblx0Y29uc3QgcHJvdG9Qcm9wcyA9IF8ubWVyZ2UuYXBwbHkoIHRoaXMsIFsge30gXS5jb25jYXQoIG9wdGlvbnMgKSApO1xuXG5cdC8vIFRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgdGhlIG5ldyBzdWJjbGFzcyBpcyBlaXRoZXIgZGVmaW5lZCBieSB5b3Vcblx0Ly8gKHRoZSBcImNvbnN0cnVjdG9yXCIgcHJvcGVydHkgaW4geW91ciBgZXh0ZW5kYCBkZWZpbml0aW9uKSwgb3IgZGVmYXVsdGVkXG5cdC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cblx0aWYgKCBwcm90b1Byb3BzICYmIHByb3RvUHJvcHMuaGFzT3duUHJvcGVydHkoIFwiY29uc3RydWN0b3JcIiApICkge1xuXHRcdHN0b3JlID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3Rvcjtcblx0fSBlbHNlIHtcblx0XHRzdG9yZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc3QgYXJncyA9IEFycmF5LmZyb20oIGFyZ3VtZW50cyApO1xuXHRcdFx0YXJnc1sgMCBdID0gYXJnc1sgMCBdIHx8IHt9O1xuXHRcdFx0cGFyZW50LmFwcGx5KCB0aGlzLCBzdG9yZS5taXhpbnMuY29uY2F0KCBhcmdzICkgKTtcblx0XHR9O1xuXHR9XG5cblx0c3RvcmUubWl4aW5zID0gbWl4aW5zO1xuXG5cdC8vIEluaGVyaXQgY2xhc3MgKHN0YXRpYykgcHJvcGVydGllcyBmcm9tIHBhcmVudC5cblx0Xy5tZXJnZSggc3RvcmUsIHBhcmVudCApO1xuXG5cdC8vIFNldCB0aGUgcHJvdG90eXBlIGNoYWluIHRvIGluaGVyaXQgZnJvbSBgcGFyZW50YCwgd2l0aG91dCBjYWxsaW5nXG5cdC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG5cdEN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcblx0c3RvcmUucHJvdG90eXBlID0gbmV3IEN0b3IoKTtcblxuXHQvLyBBZGQgcHJvdG90eXBlIHByb3BlcnRpZXMgKGluc3RhbmNlIHByb3BlcnRpZXMpIHRvIHRoZSBzdWJjbGFzcyxcblx0Ly8gaWYgc3VwcGxpZWQuXG5cdGlmICggcHJvdG9Qcm9wcyApIHtcblx0XHRfLmV4dGVuZCggc3RvcmUucHJvdG90eXBlLCBwcm90b1Byb3BzICk7XG5cdH1cblxuXHQvLyBDb3JyZWN0bHkgc2V0IGNoaWxkJ3MgYHByb3RvdHlwZS5jb25zdHJ1Y3RvcmAuXG5cdHN0b3JlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN0b3JlO1xuXG5cdC8vIFNldCBhIGNvbnZlbmllbmNlIHByb3BlcnR5IGluIGNhc2UgdGhlIHBhcmVudCdzIHByb3RvdHlwZSBpcyBuZWVkZWQgbGF0ZXIuXG5cdHN0b3JlLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XG5cdHJldHVybiBzdG9yZTtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9leHRlbmQuanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9