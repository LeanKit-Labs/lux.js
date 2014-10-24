define( [
	"lux"
], function( lux ) {

		function updateState( state ) {
			state.count = ( state.count || 0 ) + 1;
		}

		var pointlessActionCountingStore = new lux.Store( {
			namespace: "pointlessActionCounting",
			handlers: {
				toggleLaneSelection: {
					handler: function( state, boardId, laneId ) {
						return updateState( state );
					},
					waitFor: [ "board", "logging" ]
				},
				loadBoard: {
					handler: function( state, boardId ) {
						return updateState( state );
					},
					waitFor: [ "board", "logging" ]
				}
			}
		} );

		return pointlessActionCountingStore;
	} );
