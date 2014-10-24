define([
	"./boardData.json",
	"postal",
	"lux"
], function(mockData, postal, lux){

	var ch = postal.channel("lux.action");

	var fakeness = {
		handlers: {
			loadBoard: function(boardId) {
				setTimeout(function(){
					var board = mockData.boards.find(function(x) {
						return x.boardId.toString() === boardId.toString();
					});
					ch.publish("execute.boardLoaded", {
						actionType: "boardLoaded",
						actionArgs: [boardId, board]
					});
				}, 0);
			}
		}
	};

	lux.mixin(fakeness, lux.mixin.actionListener);

	return fakeness;
});
