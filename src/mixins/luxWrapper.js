// **********************************************
// *   Generalized Mixin Behavior for non-lux   *
// **********************************************

import React from "react";
import { setupStoreListener, setupActionMap } from "./wrapperUtils";
import { entries } from "../utils";

export default function luxWrapper( Component, {
	actions,
	stores,
	getState,
	pureComponent = false,
	componentWillMount,
	componentDidMount,
	componentWillReceiveProps,
	componentWillUpdate,
	componentDidUpdate,
	componentWillUnmount
} ) {
	const getStateTakesProps = getState && getState.length;

	function getComponentState( instance, props ) {
		const initialPayload = ( stores || [] ).reduce( ( m, s ) => {
			m[ s ] = true;
			return m;
		}, {} );
		return getState( props, initialPayload );
	}

	class LuxWrapper extends React[ pureComponent ? "PureComponent" : "Component" ] {
		constructor( props, context ) {
			super( props, context );
			setupStoreListener( this, { stores, getState } );
			setupActionMap( this, { actions } );
			if ( getState ) {
				this.state = getComponentState( this, props );
			}
		}

		componentWillMount( ...args ) {
			if ( componentWillMount ) {
				componentWillMount.apply( this, args );
			}
		}

		componentDidMount( ...args ) {
			if ( componentDidMount ) {
				componentDidMount.apply( this, args );
			}
		}

		componentWillReceiveProps( ...args ) {
			if ( getState && getStateTakesProps ) {
				this.setState( getComponentState( this, ...args ) );
			}
			if ( componentWillReceiveProps ) {
				componentWillReceiveProps.apply( this, args );
			}
		}

		componentWillUpdate( ...args ) {
			if ( componentWillUpdate ) {
				componentWillUpdate.apply( this, args );
			}
		}

		componentDidUpdate( ...args ) {
			if ( componentDidUpdate ) {
				componentDidUpdate.apply( this, args );
			}
		}

		componentWillUnmount( ...args ) {
			if ( componentWillUnmount ) {
				componentWillUnmount.apply( this, args );
			}
			for ( const [ key, sub ] of entries( this.__lux.subscriptions ) ) {
				let split;
				// eslint-disable-next-line no-cond-assign
				if ( key === "prenotify" || ( ( split = key.split( "." ) ) && split.pop() === "changed" ) ) {
					sub.unsubscribe();
				}
			}
		}

		render() {
			return React.createElement(
				Component,
				Object.assign(
					{},
					this.props,
					this.propToAction,
					this.state
				)
			);
		}
	}

	LuxWrapper.displayName = `LuxWrapped(${ Component.displayName || "Component" })`;

	return LuxWrapper;
}
