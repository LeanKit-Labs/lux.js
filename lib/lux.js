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
/******/ 	__webpack_require__.p = "./js/";
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
	
	var _utils = __webpack_require__(1);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _actions = __webpack_require__(2);
	
	var _mixins = __webpack_require__(6);
	
	var _store = __webpack_require__(13);
	
	var _dispatcher = __webpack_require__(14);
	
	var _dispatcher2 = _interopRequireDefault(_dispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/* istanbul ignore next */
	if (!(typeof global === "undefined" ? window : global)._babelPolyfill) {
		throw new Error("You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details.");
	}
	
	/* istanbul ignore next */
	function publishAction() {
		/* eslint-disable no-console */
		if (console && typeof console.log === "function") {
			console.log("lux.publishAction has been deprecated and will be removed in future releases. Please use lux.dispatch.");
		}
		/* eslint-enable no-console */
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

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
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
		}
		throw new Error("There is no action group named '" + group + "'");
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
	
	// **********************************************
	// *   Generalized Mixin Behavior for non-lux   *
	// **********************************************
	
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
		context.luxCleanup = function () {
			context.__lux.cleanup.forEach(function (method) {
				return method.call(context);
			});
			context.__lux.cleanup = undefined;
			delete context.__lux.cleanup;
		};
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

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.storeReactMixin = exports.storeMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // **********************************************
	// *                 Store Mixin                *
	// **********************************************
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	function gateKeeper(instance, store, data) {
		var payload = {};
		payload[store] = true;
		var __lux = instance.__lux;
	
		var found = __lux.waitFor.indexOf(store);
	
		if (found > -1) {
			__lux.waitFor.splice(found, 1);
			__lux.heardFrom.push(payload);
	
			if (__lux.waitFor.length === 0) {
				__lux.heardFrom = [];
				instance.stores.onChange.call(instance, payload);
			}
		}
	}
	
	function handlePreNotify(instance, data) {
		instance.__lux.waitFor = data.stores.filter(function (item) {
			return instance.stores.listenTo.indexOf(item) > -1;
		});
	}
	
	var storeMixin = exports.storeMixin = {
		setup: function setup() {
			var _this = this;
	
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
					return gateKeeper(_this, store);
				});
			});
	
			__lux.subscriptions.prenotify = _bus.dispatcherChannel.subscribe("prenotify", function (data) {
				return handlePreNotify(_this, data);
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
					// eslint-disable-next-line no-cond-assign
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

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionCreatorReactMixin = exports.actionCreatorMixin = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // *******************************************
	// *           Action Creator Mixin          *
	// *******************************************
	
	exports.dispatch = dispatch;
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
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
	
		mixin: { dispatch: dispatch }
	};
	
	var actionCreatorReactMixin = exports.actionCreatorReactMixin = {
		componentWillMount: actionCreatorMixin.setup,
		dispatch: dispatch
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.actionListenerMixin = actionListenerMixin;
	
	var _bus = __webpack_require__(4);
	
	var _utils = __webpack_require__(1);
	
	var _actions = __webpack_require__(2);
	
	function actionListenerMixin() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
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
	} // **********************************************
	// *            Action Listener Mixin           *
	// **********************************************

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
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // **********************************************
	// *   Generalized Mixin Behavior for non-lux   *
	// **********************************************
	
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
							// eslint-disable-next-line no-cond-assign
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
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // **********************************************
	// *   wrapper utilities                        *
	// **********************************************
	
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
		return undefined;
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
			var options = _processStoreArgs2[2]; // eslint-disable-line prefer-const
	
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
						this.hasChanged = !(res === false);
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
					// eslint-disable-next-line
					console.warn("The \"" + actionType + "\" action in the \"" + store.namespace + "\" store waits for \"" + dep + "\" but a store with that namespace does not participate in this action.");
				}
			});
		}
		return calcdGen;
	}
	
	function buildGenerations(stores, actionType) {
		var tree = [];
		var lookup = {};
		/*eslint-disable */
		stores.forEach(function (store) {
			return lookup[store.namespace] = store;
		});
		stores.forEach(function (store) {
			return store.gen = calculateGen(store, lookup, 0, actionType);
		});
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
				deps: _lodash2.default.pick(_this.stores, store.waitFor) // eslint-disable-line no-invalid-this
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
			// eslint-enable object-shorthand
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
	
						var actionName = actionDef.actionType;
						var actionMeta = {
							namespace: storeMeta.namespace,
							waitFor: actionDef.waitFor
						};
						var action = this.actionMap[actionName] = this.actionMap[actionName] || [];
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
//# sourceMappingURL=lux.js.map