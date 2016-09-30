
/** *******************************************
*                 Store Mixin                *
**********************************************/
import { storeChannel, dispatcherChannel } from "../bus";
import { ensureLuxProp, entries } from "../utils";

function gateKeeper( instance, store, data ) {
	const payload = {};
	payload[ store ] = true;
	const __lux = instance.__lux;

	const found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
			__lux.heardFrom = [];
			instance.stores.onChange.call( instance, payload );
		}
	}
}

function handlePreNotify( instance, data ) {
	instance.__lux.waitFor = data.stores.filter(
		item => instance.stores.listenTo.indexOf( item ) > -1
	);
}

export const storeMixin = {
	setup() {
		const __lux = ensureLuxProp( this );
		const stores = this.stores;
		if ( !stores ) {
			throw new Error( "Your component must provide a \"stores\" key" );
		}

		if ( !stores.listenTo || !stores.listenTo.length ) {
			throw new Error( "listenTo must contain at least one store namespace" );
		}

		const listenTo = typeof stores.listenTo === "string" ? [ stores.listenTo ] : stores.listenTo;

		if ( !stores.onChange ) {
			throw new Error( `A component was told to listen to the following store(s): ${listenTo} but no onChange handler was implemented` );
		}

		__lux.waitFor = [];
		__lux.heardFrom = [];

		listenTo.forEach( store => {
			__lux.subscriptions[ `${store}.changed` ] = storeChannel.subscribe( `${store}.changed`, () => gateKeeper( this, store ) );
		} );

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe( "prenotify", data => handlePreNotify( this, data ) );
	},
	teardown() {
		for ( const [ key, sub ] of entries( this.__lux.subscriptions ) ) {
			let split;
			// eslint-disable-next-line no-cond-assign
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

