define( [
	"lux",
	"./loggingStore"
], function( lux, loggingStore ) {

		var lookup = {};

		var updateState = function( state ) {
			var key = loggingStore.getLastMsg() || "Unknown";
			lookup[ key ] = ( lookup[ key ] || 0 ) + 1;
			state.notice = "'" + key + "' (notification has been published " +
					lookup[ key ] + ( lookup[ key ] > 1 ? " times" : " time" ) + ")";
		};

		var fakeNotificationStore = new lux.Store( {
			namespace: "fakeNotification",
			handlers: {
				toggleLaneSelection: {
					handler: function( state, boardId, laneId ) {
						console.log(arguments);
						return updateState( state );
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				},
				loadBoard: {
					handler: function( state, boardId ) {
						return updateState( state );
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				}
			}
		} );

		return fakeNotificationStore;
	} );
