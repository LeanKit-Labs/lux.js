// Setup for running Mocha via Node
var jsdom = require( "jsdom" ).jsdom;
global.document = jsdom( "<html><body></body></html>" );
global.window = document.parentWindow;

// For React (And its stupid console statement );
global.navigator = { userAgent: "Not Chrom3" };

var chai = require( "chai" );
chai.use( require( "dirty-chai" ) );
chai.use( require( "sinon-chai" ) );
global.should = chai.should();

global.React = require( "react" );
global.ReactDOM = require( "react-dom" );
global.utils = require( "react-addons-test-utils" );

global.postal = require( "postal" );
global.machina = require( "machina" );
global._ = require( "lodash" );
global.sinon = require( "sinon" );

global.luxStoreCh = global.postal.channel( "lux.store" );
global.luxActionCh = global.postal.channel( "lux.action" );

require( "babel-register" )( {
	only: /spec/
} );

global.lux = require( "../../lib/lux" );
