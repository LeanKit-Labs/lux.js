import _ from "lodash";

export const extend = function extend( ...options ) {
	const parent = this;
	let store; // placeholder for instance constructor
	const Ctor = function() {}; // placeholder ctor function used to insert level in prototype chain

	// First - separate mixins from prototype props
	const mixins = [];
	for ( let opt of options ) {
		mixins.push( _.pick( opt, [ "handlers", "state" ] ) );
		delete opt.handlers;
		delete opt.state;
	}

	const protoProps = _.merge.apply( this, [ {} ].concat( options ) );

	// The constructor function for the new subclass is either defined by you
	// (the "constructor" property in your `extend` definition), or defaulted
	// by us to simply call the parent's constructor.
	if ( protoProps && protoProps.hasOwnProperty( "constructor" ) ) {
		store = protoProps.constructor;
	} else {
		store = function() {
			const args = Array.from( arguments );
			args[ 0 ] = args[ 0 ] || {};
			parent.apply( this, store.mixins.concat( args ) );
		};
	}

	store.mixins = mixins;

	// Inherit class (static) properties from parent.
	_.merge( store, parent );

	// Set the prototype chain to inherit from `parent`, without calling
	// `parent`'s constructor function.
	Ctor.prototype = parent.prototype;
	store.prototype = new Ctor();

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
