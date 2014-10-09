define( [
	"lux"
], function( lux ) {

		var lookup = {};

		var updateState = function( deps ) {
			var key = deps.logging && deps.logging.result || "Unknown";
			lookup[ key ] = ( lookup[ key ] || 0 ) + 1;
			var newState = { notice: "'" + key + "' (notification has been published " +
					lookup[ key ] + ( lookup[ key ] > 1 ? " times" : " time" ) + ")" };
			this.setState( newState );
			return newState;
		};

		var fakeNotificationStore = new lux.Store( {
			namespace: "fakeNotification",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId, deps ) {
						return updateState.call( this, deps );
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				},
				loadBoard: {
					handler: function( boardId, deps ) {
						return updateState.call( this, deps );
					},
					waitFor: [ "pointlessActionCounting", "logging" ]
				}
			}
		} );

		return fakeNotificationStore;
	} );