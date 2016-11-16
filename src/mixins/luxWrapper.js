// **********************************************
// *   Generalized Mixin Behavior for non-lux   *
// **********************************************

import React from "react";
import { setupStoreListener, setupActionMap } from "./wrapperUtils";
import { entries } from "../utils";

export default function luxWrapper( Component, { actions, stores, getState, pureComponent = false } ) {
	class LuxWrapper extends React[ pureComponent ? "PureComponent" : "Component" ] {
		constructor( props, context ) {
			super( props, context );
			setupStoreListener( this, { stores, getState } );
			setupActionMap( this, { actions } );
			if ( getState ) {
				const initialPayload = ( stores || [] ).reduce( ( m, s ) => {
					m[ s ] = true;
					return m;
				}, {} );
				this.state = getState( props, initialPayload );
			}
		}

		componentWillUnmount() {
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
