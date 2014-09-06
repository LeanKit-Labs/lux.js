define( [
 "react",
 "traceur",
 "lux",
 "postal.request-response",
 "when",
 "LaneSelector"
 ], function( React, traceur, lux, postal, when, LaneSelector ) {
  window.React = React;
  window.lux = lux;
  window.when = when;
  window.postal = postal;
  postal.addWireTap( function( d, e ) {
    if(e.channel === "postal") { return; }
    console.log( JSON.stringify( e, null, 2 ) /*.substr(0,300)*/ );
  } );
  window.dispatcher = new lux.Dispatcher();
  // We need to tell postal how to get a deferred instance
  postal.configuration.promise.createDeferred = function() {
    return when.defer();
  };
  // We need to tell postal how to get a "public-facing"/safe promise instance
  postal.configuration.promise.getPromise = function( dfd ) {
    return dfd.promise;
  };
  require( [ "boardStore" ], function( boardStore ) {
    window.boardStore = boardStore;
    React.renderComponent( LaneSelector({ boardId: 304355117 }), //jshint ignore:line
      document.getElementById( "content" ) );
  } );
} );