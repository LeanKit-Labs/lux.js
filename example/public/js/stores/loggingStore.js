define( [
	"lux"
], function( lux ) {

		var loggingStore = new lux.Store( {
			namespace: "logging",
			handlers: {
				toggleLaneSelection: {
					handler: function( boardId, laneId ) {
						var newState = this.getState();
						var msg = "Lane " + laneId + " toggled on board " + boardId;
						newState.msgs = (newState.msgs || []).concat( [ msg ] );
						this.setState(newState);
					},
					waitFor: [ "board" ]
				},
				loadBoard: {
					handler: function( boardId ) {
						var msg = "Loaded board " + boardId;
						this.setState( {
							msgs: ( this.getState().msgs || [] ).concat( [ msg ] )
						} );
						return msg;
					},
					waitFor: [ "board" ]
				}
			},
			getLastMsg: function() {
				var msgs = this.getState().msgs;
				return msgs[ msgs.length-1 ];
			}
		} );

		return loggingStore;
	} );
