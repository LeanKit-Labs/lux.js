import { ensureLuxProp, entries } from "../utils";
import { storeChannel, dispatcherChannel } from "../bus";
import { dispatch } from "./actionCreator";
import { isString, isFunction } from "lodash";

export function gateKeeper( instance, { getState }, store ) {
	const payload = {};
	payload[ store ] = true;
	const __lux = instance.__lux;

	const found = __lux.waitFor.indexOf( store );

	if ( found > -1 ) {
		__lux.waitFor.splice( found, 1 );
		__lux.heardFrom.push( payload );

		if ( __lux.waitFor.length === 0 ) {
			__lux.heardFrom = [];
			instance.setState( getState( instance.props, payload ) );
		}
	}
}

export function handlePreNotify( instance, stores, data ) {
	instance.__lux.waitFor = data.stores.filter(
		( item ) => stores.indexOf( item ) > -1
	);
}

export function setupStoreListener( instance, { stores, getState } ) {
	const __lux = ensureLuxProp( instance );
	__lux.waitFor = [];
	__lux.heardFrom = [];

	if ( stores && stores.length ) {
		stores.forEach( ( store ) => {
			__lux.subscriptions[ `${ store }.changed` ] = storeChannel.subscribe(
				`${ store }.changed`,
				() => gateKeeper( instance, { getState }, store )
			);
		} );

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe(
			"prenotify",
			( data ) => handlePreNotify( instance, stores, data )
		);
	}
}

export function isSyntheticEvent( e ) {
	return e.hasOwnProperty( "eventPhase" ) &&
		e.hasOwnProperty( "nativeEvent" ) &&
		e.hasOwnProperty( "target" ) &&
		e.hasOwnProperty( "type" );
}

export function getDefaultActionCreator( action ) {
	if ( Object.prototype.toString.call( action ) === "[object String]" ) {
		return function( e, ...args ) {
			if ( !isSyntheticEvent( e ) ) {
				args.unshift( e );
			}
			dispatch( action, ...args );
		};
	}
}

export function setupActionMap( instance, { actions } ) {
	instance.propToAction = {};
	for ( let [ childProp, action ] of entries( actions || {} ) ) {
		let actionCreator = action; // assumes function by default
		if ( isString( action ) ) {
			actionCreator = getDefaultActionCreator( action );
		} else if ( !isFunction( action ) ) {
			throw new Error( "The values provided to the luxWrapper actions parameter must be a string or a function" );
		}
		instance.propToAction[ childProp ] = actionCreator;
	}
}
