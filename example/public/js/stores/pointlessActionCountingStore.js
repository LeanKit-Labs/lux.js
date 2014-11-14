define( [
	"lux"
], function( lux ) {

		function getCount( state ) {
			return ( state.count || 0 ) + 1;
		}

		var pointlessActionCountingStore = new lux.Store( {
			namespace: "pointlessActionCounting",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId ) {
						this.setState({ count: getCount( this.getState() ) });
					},
					waitFor: [ "board", "logging" ]
				},
				loadBoard: {
					handler: function( boardId ) {
						this.setState({ count: getCount( this.getState() ) });
					},
					waitFor: [ "board", "logging" ]
				}
			}
		} );

		return pointlessActionCountingStore;
	} );
