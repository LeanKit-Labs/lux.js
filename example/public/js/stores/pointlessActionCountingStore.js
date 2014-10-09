define( [
	"lux"
], function( lux ) {

		function updateState( state ) {
			var newState = { count: ( state.count || 0 ) + 1 };
			this.setState( newState );
			return newState;
		}

		var pointlessActionCountingStore = new lux.Store( {
			namespace: "pointlessActionCounting",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId, deps ) {
						return updateState.call( this, this.getState() );
					},
					waitFor: [ "board", "logging" ]
				},
				loadBoard: {
					handler: function( boardId, deps ) {
						return updateState.call( this, this.getState() );
					},
					waitFor: [ "board", "logging" ]
				}
			}
		} );

		return pointlessActionCountingStore;
	} );