import _ from "lodash";
import { entries } from "./utils";
import { actionChannel } from "./bus";
export const actions = Object.create( null );
export const actionGroups = Object.create( null );

export function generateActionCreator( actionList ) {
	actionList = ( typeof actionList === "string" ) ? [ actionList ] : actionList;
	actionList.forEach( function( action ) {
		if ( !actions[ action ] ) {
			actions[ action ] = function() {
				var args = Array.from( arguments );
				actionChannel.publish( {
					topic: `execute.${action}`,
					data: {
						actionType: action,
						actionArgs: args
					}
				} );
			};
		}
	} );
}

// This method is deprecated, but will remain as
// long as the print utils need it.
/* istanbul ignore next */
export function getActionGroup( group ) {
	if ( actionGroups[ group ] ) {
		return _.pick( actions, actionGroups[ group ] );
	} else {
		throw new Error( `There is no action group named '${group}'` );
	}
}

// This method is deprecated, but will remain as
// long as the print utils need it.
/* istanbul ignore next */
export function getGroupsWithAction( actionName ) {
	const groups = [];
	for ( var [ group, list ] of entries( actionGroups ) ) {
		if ( list.indexOf( actionName ) >= 0 ) {
			groups.push( group );
		}
	}
	return groups;
}

export function customActionCreator( action ) {
	Object.assign( actions, action );
}

// This method is deprecated, but will remain as
// long as the print utils need it.
/* istanbul ignore next */
export function addToActionGroup( groupName, actionList ) {
	let group = actionGroups[ groupName ];
	if ( !group ) {
		group = actionGroups[ groupName ] = [];
	}
	actionList = typeof actionList === "string" ? [ actionList ] : actionList;
	const diff = _.difference( actionList, Object.keys( actions ) );
	if ( diff.length ) {
		throw new Error( `The following actions do not exist: ${diff.join( ", " )}` );
	}
	actionList.forEach( function( action ) {
		if ( group.indexOf( action ) === -1 ) {
			group.push( action );
		}
	} );
}
