"use strict";

import { storeMixin, storeReactMixin } from "./store";
import { actionCreatorMixin, actionCreatorReactMixin, publishAction } from "./actionCreator";
import { actionListenerMixin } from "./actionListener";

let React;

function initReact( userReact ) {
	React = userReact;
	return this;
}

function ensureReact( methodName ) {
	if ( typeof React === "undefined" ) {
		throw new Error( "You attempted to use lux." + methodName + " without first calling lux.initReact( React );" );
	}
}

function controllerView( options ) {
	ensureReact( "controllerView" );
	const opt = {
		mixins: [ storeReactMixin, actionCreatorReactMixin ].concat( options.mixins || [] )
	};
	delete options.mixins;
	return React.createClass( Object.assign( opt, options ) );
}

function component( options ) {
	ensureReact( "component" );
	const opt = {
		mixins: [ actionCreatorReactMixin ].concat( options.mixins || [] )
	};
	delete options.mixins;
	return React.createClass( Object.assign( opt, options ) );
}

/*********************************************
*   Generalized Mixin Behavior for non-lux   *
**********************************************/
const luxMixinCleanup = function() {
	this.__lux.cleanup.forEach( ( method ) => method.call( this ) );
	this.__lux.cleanup = undefined;
	delete this.__lux.cleanup;
};

function mixin( context, ...mixins ) {
	if ( mixins.length === 0 ) {
		mixins = [ storeMixin, actionCreatorMixin ];
	}

	mixins.forEach( ( mxn ) => {
		if ( typeof mxn === "function" ) {
			mxn = mxn();
		}
		if ( mxn.mixin ) {
			Object.assign( context, mxn.mixin );
		}
		if ( typeof mxn.setup !== "function" ) {
			throw new Error( "Lux mixins should have a setup method. Did you perhaps pass your mixins ahead of your target instance?" );
		}
		mxn.setup.call( context );
		if ( mxn.teardown ) {
			context.__lux.cleanup.push( mxn.teardown );
		}
	} );
	context.luxCleanup = luxMixinCleanup;
	return context;
}

mixin.store = storeMixin;
mixin.actionCreator = actionCreatorMixin;
mixin.actionListener = actionListenerMixin;

const reactMixin = {
	actionCreator: actionCreatorReactMixin,
	store: storeReactMixin
};

function actionListener( target ) {
	return mixin( target, actionListenerMixin );
}

function actionCreator( target ) {
	return mixin( target, actionCreatorMixin );
}

function actionCreatorListener( target ) {
	return actionCreator( actionListener( target ) );
}

export {
	component,
	controllerView,
	initReact,
	mixin,
	reactMixin,
	actionListener,
	actionCreator,
	actionCreatorListener,
	publishAction
};
