// Setup for when running with Karma
var chai = require( "chai" );
chai.use( require( "sinon-chai" ) );
window.should = chai.should();
require( "6to5/polyfill" );
window.React = require( "react" );
window.utils = window.React.addons.TestUtils;
window.postal = require( "postal" );
window.luxStoreCh = window.postal.channel( "lux.store" );
window.luxActionCh = window.postal.channel( "lux.action" );
window.machina = require( "machina" );
window.lux = require( "lux" );
window.sinon = require( "sinon" );
window._ = require( "lodash" );
