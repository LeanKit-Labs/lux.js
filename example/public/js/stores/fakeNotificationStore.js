define([
	"lux"
], function(lux) {

	var lookup = {};

	var updateState = function(deps, state) {
		var key = deps.logging && deps.logging.result || "Unknown";
		lookup[key] = (lookup[key] || 0) + 1; 
		var newState =
			{ notice: "'" + key + "' (notification has been published " +
				lookup[key] + (lookup[key] > 1 ? " times" : " time") + ")" };
		this.setState(newState);
		return newState;
	};

	var fakeNotificationStore = lux.createStore({
		namespace: "fakeNotification",
		handlers: {
			toggleLaneSelection: {
				handler: function(boardId, laneId, deps) {
					return this.getState().then(updateState.bind(this, deps));
				},
				waitFor: ["pointlessActionCounting", "logging"]
			},
			loadBoard: {
				handler: function(boardId, deps) {
					return this.getState().then(updateState.bind(this, deps));
				},
				waitFor: ["pointlessActionCounting", "logging"]
			}
		}
	});

	return fakeNotificationStore;
});