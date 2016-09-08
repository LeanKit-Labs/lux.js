import React from "react";
import { ensureLuxProp, entries } from "../utils";
import { storeChannel, dispatcherChannel } from "../bus";
import { omit } from "lodash";

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

export default class LuxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.setup();
		this.componentWillUnmount.bind( this );
	}

	setup() {
		const __lux = ensureLuxProp( this );

		__lux.waitFor = [];
		__lux.heardFrom = [];

		this.props.stores.forEach( ( store ) => {
			__lux.subscriptions[ `${ store }.changed` ] = storeChannel.subscribe( `${ store }.changed`, () => gateKeeper.call( this, store ) );
		} );

		__lux.subscriptions.prenotify = dispatcherChannel.subscribe( "prenotify", ( data ) => handlePreNotify.call( this, data ) );
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
		return React.cloneElement( this.props.children, Object.assign( {}, omit( this.props, "children", "onStoreChange", "stores" ), this.state ) );
	}
}

LuxContainer.propTypes = {
	onStoreChange: React.PropTypes.func.isRequired,
	stores: React.PropTypes.arrayOf( React.PropTypes.string ).isRequired,
	children: React.PropTypes.element.isRequired
};
