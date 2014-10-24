define( [
	"lux"
], function( lux ) {

		var loggingStore = new lux.Store( {
			namespace: "logging",
			handlers: {
				toggleLaneSelection: {
					handler: function( state, boardId, laneId ) {
						var msg = "Lane " + laneId + " toggled on board " + boardId;
						state.msgs = (state.msgs || []).concat( [ msg ] );
					},
					waitFor: [ "board" ]
				},
				loadBoard: {
					handler: function( state, boardId ) {
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
