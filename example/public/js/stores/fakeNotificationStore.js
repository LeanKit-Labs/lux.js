define( [
	"lux",
	"./loggingStore"
], function( lux, loggingStore ) {

		var lookup = {};

		var getNotice = function() {
			var key = loggingStore.getLastMsg() || "Unknown";
			lookup[ key ] = ( lookup[ key ] || 0 ) + 1;
			return "'" + key + "' (notification has been published " +
					lookup[ key ] + ( lookup[ key ] > 1 ? " times" : " time" ) + ")";
		};

		var fakeNotificationStore = new lux.Store( {
			namespace: "fakeNotification",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId ) {
						this.setState({ notice: getNotice() });
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				},
				loadBoard: {
					handler: function( boardId ) {
						this.setState({ notice: getNotice() });
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				}
			}
		} );

		return fakeNotificationStore;
	} );
