define( [
	"react",
	"traceur",
	"lux",
	"postal.request-response",
	"when",
	"jquery",
	"./stores/boardData.json",
	"imports?jQuery=jquery!mockjax"
], function( React, traceur, lux, postal, when, $, mockData) {
	// For Devtools, etc.
	window.React = React;
	window.lux = lux;
	window.when = when;
	window.postal = postal;
	postal.addWireTap( function( d, e ) {
		if(e.channel === "postal") { return; }
		console.log( JSON.stringify( e, null, 2 ).substr(0,330) );
	});

	// We need to tell postal how to get a deferred instance
	postal.configuration.promise.createDeferred = function() {
		return when.defer();
	};
	// We need to tell postal how to get a "public-facing"/safe promise instance
	postal.configuration.promise.getPromise = function( dfd ) {
		return dfd.promise;
	};

	$.mockjax({
		url: /\/board\/([\d]+)/,
		urlParams: [ "boardId" ],
		response: function(settings) {
			this.responseText = mockData.boards.find(function(x) {
				return x.boardId.toString() === settings.urlParams.boardId;
			});
		} 
	});

	require( [
		"boardStore", 
		"loggingStore",
		"pointlessActionCountingStore",
		"fakeNotificationStore", 
		"LaneSelector",
		"Notification",
		"ActionCounter",
		"otherLogger"
	], function( boardStore, loggingStore, pointlessActionCountingStore, fakeNotification, LaneSelector, Notification, ActionCounter, OtherLogger ) {
		window.boardStore = boardStore;
		window.logger = new OtherLogger();
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