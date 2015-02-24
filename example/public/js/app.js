define( [
	"babel/polyfill",
	"react",
	"lux",
	"postal",
	"when",
	"jquery",
	"./stores/boardData.json",
	"./stores/fakeApi",
	"imports?jQuery=jquery!mockjax"
], function( babel, React, lux, postal, when, $, mockData) {
	// For Devtools, etc.
	window.React = React;
	window.lux = lux;
	window.when = when;
	window.postal = postal;
	postal.addWireTap( function( d, e ) {
		if(e.channel === "postal") { return; }
		console.log( JSON.stringify( e, null, 2 ).substr(0,300));
	});

	$.mockjax({
		url: /\/board\/([\d]+)/,
		urlParams: [ "boardId" ],
		response: function(settings) {
			this.responseText = mockData.boards.find(function(x) {
				return x.boardId.toString() === settings.urlParams.boardId;
			});
		}
	});

	var api = lux.actionCreator({ getActionGroup: ["api"] });
	api.loadBoard( 304355117 );

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
			LaneSelector(),
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
