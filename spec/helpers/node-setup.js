// Setup for running Mocha via Node
var traceur = require( "traceur" );
var jsdom = require( "jsdom" ).jsdom;
global.document = jsdom( "<html><body></body></html>" );
global.window = document.parentWindow;

// For React (And its stupid console statement );
global.navigator = { userAgent: "Not Chrom3" };

require( "should/should" );

require( "traceur-source-maps" ).install( traceur );
traceur.require.makeDefault( function( filename ) {
	// only transpile the spec files
	return filename.indexOf( "node_modules" ) === -1 && filename.indexOf( "spec.js" ) > -1;
} );

global.React = require( "react/dist/react-with-addons" );
global.utils = global.React.addons.TestUtils;

global.postal = require( "postal" );
global.machina = require( "machina" );
global._ = require( "lodash" );
global.sinon = require( "sinon" );

global.luxStoreCh = global.postal.channel( "lux.store" );
global.luxActionCh = global.postal.channel( "lux.action" );

global.lux = require( "../../lib/lux.js" )( React, postal, machina, _ );
