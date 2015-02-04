// Setup for running Mocha via Node
require("6to5/polyfill");
var jsdom = require( "jsdom" ).jsdom;
global.document = jsdom( "<html><body></body></html>" );
global.window = document.parentWindow;

// For React (And its stupid console statement );
global.navigator = { userAgent: "Not Chrom3" };

require( "should/should" );

require("6to5/register");

global.React = require( "react/dist/react-with-addons" );
global.utils = global.React.addons.TestUtils;

global.postal = require( "postal" );
global.machina = require( "machina" );
global._ = require( "lodash" );
global.sinon = require( "sinon" );

global.luxStoreCh = global.postal.channel( "lux.store" );
global.luxActionCh = global.postal.channel( "lux.action" );

global.lux = require( "../../lib/lux.js" )( React, postal, machina, _ );
