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
	mixin,
	reactMixin,
	actionListener,
	actionCreator,
	actionCreatorListener,
	dispatch,
	luxWrapper
} from "./mixins";

/* istanbul ignore next */
function publishAction( ...args ) {
	if ( console && typeof console.log === "function" ) {
		console.log( "lux.publishAction has been deprecated and will be removed in future releases. Please use lux.dispatch." );
	}
	dispatch( ...args );
}

import { Store, stores, removeStore } from "./store";

import dispatcher from "./dispatcher";

export default {
	actions,
	customActionCreator,
	dispatch,
	publishAction,
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
	luxWrapper
};
