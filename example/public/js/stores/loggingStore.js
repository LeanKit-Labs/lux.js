define([
	"lux"
], function(lux) {

	var loggingStore = lux.createStore({
		namespace: "logging",
		handlers: {
			toggleLaneSelection: {
				handler: function(boardId, laneId, deps) {
					var msg = "Lane " + laneId + " toggled on board " + boardId;
					return this.getState().then(
						function(state) {
							this.setState({
								msgs: (state.msgs || []).concat([msg])
							});
							return msg;
						}.bind(this)
					);
				},
				waitFor: ["board"]
			},
			loadBoard: {
				handler: function(boardId, deps) {
					var msg = "Loaded board " + boardId;
					return this.getState().then(
						function(state) {
							this.setState({
								msgs: (state.msgs || []).concat([msg])
							});
							return msg;
						}.bind(this)
					);
				},
				waitFor: ["board"]
			}
		}
	});

	return loggingStore;
});