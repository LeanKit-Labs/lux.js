/* global entries, actionChannel, pluck */
/* jshint -W098 */
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

var actionCreators = {};
var actionGroups = {};

function getActionCreatorFor( group ) {
	return actionGroups[group] ? pluck(actionCreators, actionGroups[group]) : {};
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

function customActionCreator(action) {
	actionCreators = Object.assign(actionCreators, action);
}

function createActionGroup(groupName, actions) {
	actionGroups[groupName] = actions;
}
