// Setup for running Mocha via Node
var jsdom = require("jsdom").jsdom;
global.document = jsdom( "<html><body></body></html>");
global.window   = document.parentWindow;

// For React (And its stupid console statement );
global.navigator = { userAgent: "Not Chrom3" };


require( "should/should" );
require( "traceur" );

global.React = require("react/dist/react-with-addons");
global.utils = global.React.addons.TestUtils;

global.postal = require("postal");
global.machina = require("machina");
require("postal.request-response")(postal);

global.luxStoreCh = global.postal.channel("lux.store");
global.luxActionCh = global.postal.channel("lux.action");

global.lux = require("../../lib/lux.js")(postal, machina, React);
