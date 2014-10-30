/* global entries, actionChannel, pluck */
/* jshint -W098 */
var actionCreators = Object.create(null);
var actionGroups = {};

function buildActionList(handlers) {
	var actionList = [];
	for (var [key, handler] of entries(handlers)) {
		actionList.push({
			actionType: key,
			waitFor: handler.waitFor || []
		});
	}
	return actionList;
}

function generateActionCreator(actionList) {
	actionList = (typeof actionList === "string") ? [actionList] : actionList;
	actionList.forEach(function(action) {
		if(!actionCreators[action]) {
			actionCreators[action] = function() {
				var args = Array.from(arguments);
				actionChannel.publish({
					topic: `execute.${action}`,
					data: {
						actionType: action,
						actionArgs: args
					}
				});
			};
		}
	});
}

function getActionGroup( group ) {
	return actionGroups[group] ? pluck(actionCreators, actionGroups[group]) : {};
}

function customActionCreator(action) {
	actionCreators = Object.assign(actionCreators, action);
}

function addToActionGroup(groupName, actions) {
	var group = actionGroups[groupName];
	if(!group) {
		group = actionGroups[groupName] = [];
	}
	actions = typeof actions === "string" ? [actions] : actions;
	actions.forEach(function(action){
		if(group.indexOf(action) === -1 ) {
			group.push(action);
		}
	});
}
