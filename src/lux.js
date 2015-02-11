/* global require, module */
/* jshint -W098 */
( function( root, factory ) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "react", "postal", "machina", "lodash" ], factory );
	} else if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function( React, postal, machina, lodash ) {
			return factory(
				React || require( "react" ),
				postal || require( "postal" ),
				machina || require( "machina" ),
				lodash || require( "lodash" ) );
		};
	} else {
		throw new Error( "Sorry - luxJS only support AMD or CommonJS module environments." );
	}
}( this, function( React, postal, machina, _ ) {

	/* istanbul ignore if */
	if ( !( typeof global === "undefined" ? window : global )._6to5Polyfill ) {
		throw new Error("You must include the 6to5 polyfill on your page before lux is loaded. See https://6to5.org/docs/usage/polyfill/ for more details.");
	}

	var actionChannel = postal.channel( "lux.action" );
	var storeChannel = postal.channel( "lux.store" );
	var dispatcherChannel = postal.channel( "lux.dispatcher" );
	var stores = {};

	// jshint ignore:start
	var entries = function* ( obj ) {
		if( [ "object", "function" ].indexOf( typeof obj ) === -1 ) {
			obj = {};
		}
		for( var k of Object.keys( obj ) ) {
			yield [ k, obj[ k ] ];
		}
	}
	// jshint ignore:end

	function configSubscription( context, subscription ) {
		return subscription.context( context )
		                   .constraint( function( data, envelope ){
		                       return !( envelope.hasOwnProperty( "originId" ) ) ||
		                          ( envelope.originId === postal.instanceId() );
		                   });
	}

	function ensureLuxProp( context ) {
		var __lux = context.__lux = ( context.__lux || {} );
		var cleanup = __lux.cleanup = ( __lux.cleanup || [] );
		var subscriptions = __lux.subscriptions = ( __lux.subscriptions || {} );
		return __lux;
	}

	var extend = function( ...options ) {
		var parent = this;
		var store; // placeholder for instance constructor
		var storeObj = {}; // object used to hold initialState & states from prototype for instance-level merging
		var ctor = function() {}; // placeholder ctor function used to insert level in prototype chain

		// First - separate mixins from prototype props
		var mixins = [];
		for( var opt of options ) {
			mixins.push( _.pick( opt, [ "handlers", "state" ] ) );
			delete opt.handlers;
			delete opt.state;
		}

		var protoProps = _.merge.apply( this, [ {} ].concat( options ) );

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if ( protoProps && protoProps.hasOwnProperty( "constructor" ) ) {
			store = protoProps.constructor;
		} else {
			store = function() {
				var args = Array.from( arguments );
				args[ 0 ] = args[ 0 ] || {};
				parent.apply( this, store.mixins.concat( args ) );
			};
		}

		store.mixins = mixins;

		// Inherit class (static) properties from parent.
		_.merge( store, parent );

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		store.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if ( protoProps ) {
			_.extend( store.prototype, protoProps );
		}

		// Correctly set child's `prototype.constructor`.
		store.prototype.constructor = store;

		// Set a convenience property in case the parent's prototype is needed later.
		store.__super__ = parent.prototype;
		return store;
	};

	//import("./actionCreator.js");
	//import("./mixins.js");
	//import("./store.js");
	//import("./dispatcher.js");
	//import("./utils.js");

	// jshint ignore: start
	return {
		actions,
		addToActionGroup,
		component,
		controllerView,
		customActionCreator,
		dispatcher,
		getActionGroup,
		actionCreatorListener,
		actionCreator,
		actionListener,
		mixin: mixin,
		removeStore,
		Store,
		stores,
		utils
	};
	// jshint ignore: end

}));
