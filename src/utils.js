/*global actions, dispatcher, entries, actionGroups */
/* jshint -W098 */

function getGroupsWithAction(actionName) {
	var groups = [];
	for(var [group, list] of entries(actionGroups)) {
		if(list.indexOf(actionName) >= 0) {
			groups.push(group);
		}
	}
	return groups;
}

// NOTE - these will eventually live in their own add-on lib or in a debug build of lux
var utils = {
	printActions() {
		var actionList = Object.keys(actions)
			.map(function(x) {
				return {
					"action name" : x,
					"stores" : dispatcher.getStoresHandling(x).stores.map(function(x) { return x.namespace; }).join(","),
					"groups" : getGroupsWithAction(x).join(",")
				};
			});
		if(console && console.table) {
			console.group("Currently Recognized Actions");
			console.table(actionList);
			console.groupEnd();
		} else if (console && console.log) {
			console.log(actionList);
		}
	},

	printStoreDepTree(actionType) {
		var tree = [];
		actionType = typeof actionType === "string" ? [actionType] : actionType;
		if(!actionType) {
			actionType = Object.keys(actions);
		}
		actionType.forEach(function(at){
			dispatcher.getStoresHandling(at)
			    .tree.forEach(function(x) {
			        while (x.length) {
			            var t = x.pop();
			            tree.push({
			            	"action type" : at,
			                "store namespace" : t.namespace,
			                "waits for" : t.waitFor.join(","),
			                generation: t.gen
			            });
			        }
			    });
		    if(console && console.table) {
				console.group(`Store Dependency List for ${at}`);
				console.table(tree);
				console.groupEnd();
			} else if (console && console.log) {
				console.log(`Store Dependency List for ${at}:`);
				console.log(tree);
			}
			tree = [];
		});
	}
};
