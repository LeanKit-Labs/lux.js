/* global entries, luxCh */
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

function getActionCreatorFor( store ) {
    return actionCreators[store];
}

function buildActionCreatorFrom(actionList) {
    var actionCreator = {};
    actionList.forEach(function(action) {
        actionCreator[action] = function() {
            var args = Array.from(arguments);
            luxCh.publish({
                topic: "action",
                data: {
                    actionType: action,
                    actionArgs: args
                }
            });
        };
    });
    return actionCreator;
}