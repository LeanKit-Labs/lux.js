"use strict";
import { entries } from "../utils";
import { getActionGroup, actions } from "../actions";
/*********************************************
*           Action Creator Mixin          *
**********************************************/

export function publishAction( action, ...args ) {
	if ( actions[ action ] ) {
		actions[ action ]( ...args );
	} else {
		throw new Error( `There is no action named '${action}'` );
	}
}

export const actionCreatorMixin = {
	setup: function() {
		this.getActionGroup = this.getActionGroup || [];
		this.getActions = this.getActions || [];

		if ( typeof this.getActionGroup === "string" ) {
			this.getActionGroup = [ this.getActionGroup ];
		}

		if ( typeof this.getActions === "string" ) {
			this.getActions = [ this.getActions ];
		}

		const addActionIfNotPresent = ( k, v ) => {
			if ( !this[ k ] ) {
				this[ k ] = v;
			}
		};
		this.getActionGroup.forEach( ( group ) => {
			for ( let [ k, v ] of entries( getActionGroup( group ) ) ) {
				addActionIfNotPresent( k, v );
			}
		} );

		if ( this.getActions.length ) {
			this.getActions.forEach( function( key ) {
				addActionIfNotPresent( key, function() {
					publishAction( key, ...arguments );
				} );
			} );
		}
	},
	mixin: {
		publishAction: publishAction
	}
};

export const actionCreatorReactMixin = {
	componentWillMount: actionCreatorMixin.setup,
	publishAction: publishAction
};
