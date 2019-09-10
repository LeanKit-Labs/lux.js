// NOTE - these will eventually live in their own add-on lib or in a debug build of lux

/* eslint  "no-console":"off" */

import { actions, getGroupsWithAction } from "./actions";
import dispatcher from "./dispatcher";

export function printActions() {
	const actionList = Object.keys( actions )
		.map( function( x ) {
			return {
				"action name": x,
				stores: dispatcher.getStoresHandling( x ).stores.map( function( s ) {
					return s.namespace;
				} ).join( "," ),
				groups: getGroupsWithAction( x ).join( "," )
			};
		} );
	if ( console && console.table ) {
		console.group( "Currently Recognized Actions" );
		console.table( actionList );
		console.groupEnd();
	} else if ( console && console.log ) {
		console.log( actionList );
	}
}

export function printStoreDepTree( actionType ) {
	let tree = [];
	actionType = typeof actionType === "string" ? [ actionType ] : actionType;
	if ( !actionType ) {
		actionType = Object.keys( actions );
	}
	actionType.forEach( function( at ) {
		dispatcher.getStoresHandling( at )
			.generations.forEach( function( x ) {
				while ( x.length ) {
					const t = x.pop();
					tree.push( {
						"action type": at,
						"store namespace": t.namespace,
						"waits for": t.waitFor.join( "," ),
						generation: t.gen
					} );
				}
			} );
		if ( console && console.table ) {
			console.group( `Store Dependency List for ${ at }` );
			console.table( tree );
			console.groupEnd();
		} else if ( console && console.log ) {
			console.log( `Store Dependency List for ${ at }:` );
			console.log( tree );
		}
		tree = [];
	} );
}
