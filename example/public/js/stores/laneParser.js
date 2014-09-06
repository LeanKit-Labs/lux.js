define([], function() {

	var sortMap = {
		"0": 1,
		"1": 0,
		"2": 2
	};

	function laneComparator(a, b) {
		return sortMap[a.laneClassType] - sortMap[b.laneClassType];
	}

	function childLaneComparator(a,b) {
		return a.index - b.index;
	}

	return {
		transform: function(data) {
			var laneTree = [];
			var laneLookup = {};
			_.each(data.lanes, function(lane){
				if(!laneLookup[lane.id]) {
					laneLookup[lane.id] = lane;
					var nm = lane.name.split(":");
					var oldName = lane.name;
					lane.name = nm[nm.length-1] || lane.name;
					lane.isActive = lane.isActive || false;
					lane.activeChildren = lane.activeChildren || [];
					if(lane.parentLaneId === null) {
						laneTree.splice(lane.index, 0, lane);
					} else {
						var parent = laneLookup[lane.parentLaneId];
						if(parent) {
							parent.items = parent.items || [];
							parent.items.push(lane);
							parent.items.sort(childLaneComparator);
						}
					}
				}
			});
			return { lookup: laneLookup, lanes: laneTree.sort(laneComparator) };
		}
	};
});