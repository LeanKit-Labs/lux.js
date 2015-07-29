"use strict";
/*********************************************
*                 Store Mixin                *
**********************************************/
import { storeChannel, dispatcherChannel } from "../bus";
import { ensureLuxProp, entries } from "../utils";

function gateKeeper( store, data ) {
	const payload = {};
	payload[ store ] = true;
	const __lux = this.__lux;

	const found = __lux.waitFor.indexOf( store );

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

export var storeMixin = {
	setup: function() {
		const __lux = ensureLuxProp( this );
		const stores = this.stores = ( this.stores || {} );

		if ( !stores.listenTo || !stores.listenTo.length ) {
			throw new Error( `listenTo must contain at least one store namespace` );
		}

		const listenTo = typeof stores.listenTo === "string" ? [ stores.listenTo ] : stores.listenTo;

		if ( !stores.onChange ) {
			throw new Error( `A component was told to listen to the following store(s): ${listenTo} but no onChange handler was implemented` );
		}

		__lux.waitFor = [];
		__lux.heardFrom = [];

		listenTo.forEach( ( store ) => {
			__lux.subscriptions[ `${store}.changed` ] = storeChannel.subscribe( `${store}.changed`, () => gateKeeper.call( this, store ) );
		} );

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe( "prenotify", ( data ) => handlePreNotify.call( this, data ) );
	},
	teardown: function() {
		for ( let [ key, sub ] of entries( this.__lux.subscriptions ) ) {
			let split;
			if ( key === "prenotify" || ( ( split = key.split( "." ) ) && split.pop() === "changed" ) ) {
				sub.unsubscribe();
			}
		}
	},
	mixin: {}
};

export const storeReactMixin = {
	componentWillMount: storeMixin.setup,
	componentWillUnmount: storeMixin.teardown
};
