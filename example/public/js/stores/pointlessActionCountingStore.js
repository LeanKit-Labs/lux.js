define([
	"lux"
], function(lux) {

	function updateState(state) {
		var newState = { count: (state.count || 0) + 1 };
		this.setState(newState);
		return newState;
	}

	var pointlessActionCountingStore = lux.createStore({
		namespace: "pointlessActionCounting",
		handlers: {
			toggleLaneSelection: {
				handler: function(boardId, laneId, deps) {
					return this.getState().then( updateState.bind( this ) );
				},
				waitFor: ["board", "logging"]
			},
			loadBoard: {
				handler: function(boardId, deps) {
					return this.getState().then( updateState.bind( this ) );
				},
				waitFor: ["board", "logging"]
			}
		}
	});

	return pointlessActionCountingStore;
});