/* global entries, actionChannel, pluck */
/* jshint -W098 */
var actions = Object.create(null);
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
		if(!actions[action]) {
			actions[action] = function() {
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
	if ( actionGroups[group] ) {
		return pluck(actions, actionGroups[group]);
	} else {
		throw new Error( `There is no action group named '${group}'`);
	}
}

function customActionCreator(action) {
	actions = Object.assign(actions, action);
}

function addToActionGroup(groupName, actionList) {
	var group = actionGroups[groupName];
	if(!group) {
		group = actionGroups[groupName] = [];
	}
	actionList = typeof actionList === "string" ? [actionList] : actionList;
	actionList.forEach(function(action){
		if(group.indexOf(action) === -1 ) {
			group.push(action);
		}
	});
}
