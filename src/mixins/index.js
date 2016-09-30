
import { storeMixin, storeReactMixin } from "./store";
import { actionCreatorMixin, actionCreatorReactMixin, dispatch } from "./actionCreator";
import { actionListenerMixin } from "./actionListener";
import luxWrapper from "./luxWrapper";

/** *******************************************
 *   Generalized Mixin Behavior for non-lux   *
 **********************************************/

function mixin( context, ...mixins ) {
	if ( mixins.length === 0 ) {
		mixins = [ storeMixin, actionCreatorMixin ];
	}

	mixins.forEach( mxn => {
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
	context.luxCleanup = () => {
		context.__lux.cleanup.forEach( method => method.call( context ) );
		context.__lux.cleanup = undefined;
		delete context.__lux.cleanup;
	};
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
	mixin,
	reactMixin,
	actionListener,
	actionCreator,
	actionCreatorListener,
	dispatch,
	luxWrapper
};
