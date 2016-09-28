import React from "react";
import { setupStoreListener, setupActionMap } from "./wrapperUtils";
import { entries } from "../utils";

export default function luxWrapper( Component, { actions, stores, getState } ) {
	class LuxWrapper extends React.Component {
		constructor( props ) {
			super( props );
			setupStoreListener( this, { stores, getState } );
			setupActionMap( this, { actions } );
			if ( getState ) {
				this.state = getState();
			}
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
