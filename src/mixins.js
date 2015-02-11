
/* global storeChannel, generateActionCreator, actions, ensureLuxProp, actionChannel, dispatcherChannel, React, getActionGroup, entries, configSubscription, luxActionChannel */
/* jshint -W098 */

/*********************************************
*                 Store Mixin                *
**********************************************/
function gateKeeper( store, data ) {
	var payload = {};
	payload[ store ] = true;
	var __lux = this.__lux;

	var found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
			__lux.heardFrom = [];
			this.stores.onChange.call( this, payload );
		}
	} else {
		this.stores.onChange.call( this, payload );
	}
}

function handlePreNotify( data ) {
	this.__lux.waitFor = data.stores.filter(
		( item ) => this.stores.listenTo.indexOf( item ) > -1
	);
}

var luxStoreMixin = {
	setup: function () {
		var __lux = ensureLuxProp( this );
		var stores = this.stores = ( this.stores || {} );

		if ( !stores.listenTo ) {
			throw new Error( `listenTo must contain at least one store namespace` );
		}

		var listenTo = typeof stores.listenTo === "string" ? [ stores.listenTo ] : stores.listenTo;

		if ( !stores.onChange ) {
			throw new Error( `A component was told to listen to the following store(s): ${listenTo} but no onChange handler was implemented` );
		}

		__lux.waitFor = [];
		__lux.heardFrom = [];

		listenTo.forEach( ( store ) => {
			__lux.subscriptions[ `${store}.changed` ] = storeChannel.subscribe( `${store}.changed`, () => gateKeeper.call( this, store ) );
		});

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe( "prenotify", ( data ) => handlePreNotify.call( this, data ) );
	},
	teardown: function () {
		for( var [ key, sub ] of entries( this.__lux.subscriptions ) ) {
			var split;
			if( key === "prenotify" || ( ( split = key.split( "." ) ) && split.pop() === "changed" ) ) {
				sub.unsubscribe();
			}
		}
	},
	mixin: {}
};

var luxStoreReactMixin = {
	componentWillMount: luxStoreMixin.setup,
	loadState: luxStoreMixin.mixin.loadState,
	componentWillUnmount: luxStoreMixin.teardown
};

/*********************************************
*           Action Creator Mixin          *
**********************************************/

var luxActionCreatorMixin = {
	setup: function () {
		this.getActionGroup = this.getActionGroup || [];
		this.getActions = this.getActions || [];

		if ( typeof this.getActionGroup === "string" ) {
			this.getActionGroup = [ this.getActionGroup ];
		}

		if ( typeof this.getActions === "string" ) {
			this.getActions = [ this.getActions ];
		}

		var addActionIfNotPresent = ( k, v ) => {
			if( !this[ k ] ) {
					this[ k ] = v;
				}
		};
		this.getActionGroup.forEach( ( group ) => {
			for( var [ k, v ] of entries( getActionGroup( group ) ) ) {
				addActionIfNotPresent( k, v );
			}
		});

		if( this.getActions.length ) {
			this.getActions.forEach( function ( key ) {
				var val = actions[ key ];
				if ( val ) {
					addActionIfNotPresent( key, val );
				} else {
					throw new Error( `There is no action named '${key}'` );
				}
			});
		}
	},
	mixin: {
		publishAction: function( action, ...args ) {
			actionChannel.publish( {
				topic: `execute.${action}`,
				data: {
					actionType: action,
					actionArgs: args
				}
			} );
		}
	}
};

var luxActionCreatorReactMixin = {
	componentWillMount: luxActionCreatorMixin.setup,
	publishAction: luxActionCreatorMixin.mixin.publishAction
};

/*********************************************
*            Action Listener Mixin           *
**********************************************/
var luxActionListenerMixin = function( { handlers, handlerFn, context, channel, topic } = {} ) {
	return {
		setup() {
			context = context || this;
			var __lux = ensureLuxProp( context );
			var subs = __lux.subscriptions;
			handlers = handlers || context.handlers;
			channel = channel || actionChannel;
			topic = topic || "execute.*";
			handlerFn = handlerFn || ( ( data, env ) => {
				var handler;
				if( handler = handlers[ data.actionType ] ) {
					handler.apply( context, data.actionArgs );
				}
			} );
			if( !handlers || !Object.keys( handlers ).length ) {
				throw new Error( "You must have at least one action handler in the handlers property" );
			} else if ( subs && subs.actionListener ) {
				// TODO: add console warn in debug builds
				// since we ran the mixin on this context already
				return;
			}
			subs.actionListener =
				configSubscription(
					context,
					channel.subscribe( topic, handlerFn )
				);
			var handlerKeys = Object.keys( handlers );
			generateActionCreator( handlerKeys );
			if( context.namespace ) {
				addToActionGroup( context.namespace, handlerKeys );
			}
		},
		teardown() {
			this.__lux.subscriptions.actionListener.unsubscribe();
		},
	};
};

/*********************************************
*   React Component Versions of Above Mixin  *
**********************************************/
function controllerView( options ) {
	var opt = {
		mixins: [ luxStoreReactMixin, luxActionCreatorReactMixin ].concat( options.mixins || [] )
	};
	delete options.mixins;
	return React.createClass( Object.assign( opt, options ) );
}

function component( options ) {
	var opt = {
		mixins: [ luxActionCreatorReactMixin ].concat( options.mixins || [] )
	};
	delete options.mixins;
	return React.createClass( Object.assign( opt, options ) );
}


/*********************************************
*   Generalized Mixin Behavior for non-lux   *
**********************************************/
var luxMixinCleanup = function () {
	this.__lux.cleanup.forEach( ( method ) => method.call( this ) );
	this.__lux.cleanup = undefined;
	delete this.__lux.cleanup;
};

function mixin( context, ...mixins ) {
	if( mixins.length === 0 ) {
		mixins = [ luxStoreMixin, luxActionCreatorMixin ];
	}

	mixins.forEach( ( mixin ) => {
		if( typeof mixin === "function" ) {
			mixin = mixin();
		}
		if( mixin.mixin ) {
			Object.assign( context, mixin.mixin );
		}
		if( typeof mixin.setup !== "function" ) {
			throw new Error( "Lux mixins should have a setup method. Did you perhaps pass your mixins ahead of your target instance?" );
		}
		mixin.setup.call( context );
		if( mixin.teardown ) {
			context.__lux.cleanup.push( mixin.teardown );
		}
	});
	context.luxCleanup = luxMixinCleanup;
	return context;
}

mixin.store = luxStoreMixin;
mixin.actionCreator = luxActionCreatorMixin;
mixin.actionListener = luxActionListenerMixin;

function actionListener( target ) {
	return mixin( target, luxActionListenerMixin );
}

function actionCreator( target ) {
	return mixin( target, luxActionCreatorMixin );
}

function actionCreatorListener( target ) {
	return actionCreator( actionListener( target ));
}
