

export function ensureLuxProp( context ) {
	const __lux = context.__lux = ( context.__lux || {} );
	/*eslint-disable */
	const cleanup = __lux.cleanup = ( __lux.cleanup || [] );
	const subscriptions = __lux.subscriptions = ( __lux.subscriptions || {} );
	/*eslint-enable */
	return __lux;
}

export function *entries( obj ) {
	if ( [ "object", "function" ].indexOf( typeof obj ) === -1 ) {
		obj = {};
	}
	for ( const k of Object.keys( obj ) ) {
		yield [ k, obj[ k ] ];
	}
}
