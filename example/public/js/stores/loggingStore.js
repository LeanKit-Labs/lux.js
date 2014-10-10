define( [
	"lux"
], function( lux ) {

		var loggingStore = new lux.Store( {
			namespace: "logging",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId, deps ) {
						var msg = "Lane " + laneId + " toggled on board " + boardId;
						this.setState( {
							msgs: ( this.getState().msgs || [] ).concat( [ msg ] )
						} );
						return msg;
					},
					waitFor: [ "board" ]
				},
				loadBoard: {
					handler: function( boardId, deps ) {
						var msg = "Loaded board " + boardId;
						this.setState( {
							msgs: ( this.getState().msgs || [] ).concat( [ msg ] )
						} );
						return msg;
					},
					waitFor: [ "board" ]
				}
			}
		} );

		return loggingStore;
	} );
