"use strict";

/* istanbul ignore next */
if ( !( typeof global === "undefined" ? window : global )._babelPolyfill ) {
	throw new Error( "You must include the babel polyfill on your page before lux is loaded. See https://babeljs.io/docs/usage/polyfill/ for more details." );
}

import utils from "./utils";

import {
	getActionGroup,
	customActionCreator,
	actions
} from "./actions";

import {
	component,
	controllerView,
	mixin,
	reactMixin,
	actionListener,
	actionCreator,
	actionCreatorListener,
	publishAction,
	LuxContainer
} from "./mixins";

import { Store, stores, removeStore } from "./store";
import { extend } from "./extend";
Store.extend = extend;

import dispatcher from "./dispatcher";

export default {
	actions,
	publishAction,
	component,
	controllerView,
	customActionCreator,
	dispatcher,
	getActionGroup,
	actionCreatorListener,
	actionCreator,
	actionListener,
	mixin,
	reactMixin,
	removeStore,
	Store,
	stores,
	utils,
	LuxContainer
};
