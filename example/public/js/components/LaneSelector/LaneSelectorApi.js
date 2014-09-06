define(["postal"], function(postal){

	var channel = postal.channel("analytics");

	return {
		toggleLane: function(laneId) {
			channel.publish("laneselector.togglelane", { id: laneId });
		}
	}

});