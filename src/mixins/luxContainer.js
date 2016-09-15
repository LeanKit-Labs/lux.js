import React from "react";
import { ensureLuxProp, entries } from "../utils";
import { storeChannel, dispatcherChannel } from "../bus";
import { omit, isString, isFunction } from "lodash";
import { dispatch } from "./actionCreator";

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
			this.setState( this.props.onStoreChange( this.props, payload ) );
		}
	}
}

function handlePreNotify( data ) {
	this.__lux.waitFor = data.stores.filter(
		( item ) => this.props.stores.indexOf( item ) > -1
	);
}

function setupStoreListener( instance ) {
	const __lux = ensureLuxProp( instance );
	__lux.waitFor = [];
	__lux.heardFrom = [];
	const stores = instance.props.stores.split( "," ).map( x=> x.trim() );

	stores.forEach( ( store ) => {
		__lux.subscriptions[ `${ store }.changed` ] = storeChannel.subscribe( `${ store }.changed`, () => gateKeeper.call( instance, store ) );
	} );

	__lux.subscriptions.prenotify = dispatcherChannel.subscribe( "prenotify", ( data ) => handlePreNotify.call( instance, data ) );
}

function isSyntheticEvent( e ) {
	return e.hasOwnProperty( "eventPhase" ) &&
		e.hasOwnProperty( "nativeEvent" ) &&
		e.hasOwnProperty( "target" ) &&
		e.hasOwnProperty( "type" );
}

function getDefaultActionCreator( action ) {
	if ( Object.prototype.toString.call( action ) === "[object String]" ) {
		return function( e, ...args ) {
			if ( !isSyntheticEvent( e ) ) {
				args.unshift( e );
			}
			dispatch( action, ...args );
		};
	}
}

function setupActionMap( instance ) {
	instance.propToAction = {};
	for ( let [ childProp, action ] of entries( instance.props.actions ) ) {
		let actionCreator = action; // assumes function by default
		if ( isString( action ) ) {
			actionCreator = getDefaultActionCreator( action );
		} else if ( !isFunction( action ) ) {
			throw new Error( "The values provided to the LuxContainer actions property must be a string or a function" );
		}
		instance.propToAction[ childProp ] = actionCreator;
	}
}

export default class LuxContainer extends React.Component {
	constructor( props ) {
		super( props );
		setupStoreListener( this );
		setupActionMap( this );
		this.componentWillUnmount.bind( this );
	}

	componentWillUnmount() {
		for ( let [ key, sub ] of entries( this.__lux.subscriptions ) ) {
			let split;
			if ( key === "prenotify" || ( ( split = key.split( "." ) ) && split.pop() === "changed" ) ) {
				sub.unsubscribe();
			}
		}
	}

	render() {
		return React.cloneElement(
			this.props.children,
			Object.assign(
				{},
				omit( this.props, "children", "onStoreChange", "stores", "actions" ),
				this.propToAction,
				this.state
			)
		);
	}
}

LuxContainer.propTypes = {
	onStoreChange: React.PropTypes.func,
	stores: React.PropTypes.string.isRequired,
	children: React.PropTypes.element.isRequired
};

LuxContainer.defaultProps = {
	stores: "",
	actions: {}
};
