define( [
	"react",
	"traceur",
	"lux",
	"postal.request-response",
	"when"
], function( React, traceur, lux, postal, when ) {
	window.React = React;
	window.lux = lux;
	window.when = when;
	window.postal = postal;
	postal.addWireTap( function( d, e ) {
		if(e.channel === "postal") { return; }
		console.log( JSON.stringify( e, null, 2 ).substr(0,300) );
	});
	// We need to tell postal how to get a deferred instance
	postal.configuration.promise.createDeferred = function() {
		return when.defer();
	};
	// We need to tell postal how to get a "public-facing"/safe promise instance
	postal.configuration.promise.getPromise = function( dfd ) {
		return dfd.promise;
	};

	require( [
		"boardStore", 
		"loggingStore",
		"pointlessActionCountingStore",
		"fakeNotificationStore", 
		"LaneSelector",
		"Notification",
		"ActionCounter"
	], function( boardStore, loggingStore, pointlessActionCountingStore, fakeNotification, LaneSelector, Notification, ActionCounter ) {
		window.boardStore = boardStore;
		React.renderComponent(
			LaneSelector({ boardId: 304355117 }), 
			document.getElementById( "lane-selector" )
		);
		React.renderComponent(
			Notification(),
			document.getElementById( "notification" )
		);
		React.renderComponent(
			ActionCounter(),
			document.getElementById( "action-counter" )
		);
	} );
} );