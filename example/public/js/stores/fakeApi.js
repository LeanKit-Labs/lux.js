define([
	"./boardData.json",
	"lux"
], function(mockData, lux){

	var http = lux.actionListener({
		handlers: {
			loadBoard: function(boardId) {
				// simulate an http response
				setTimeout(function(){
					var board = mockData.boards.find(function(x) {
						return x.boardId.toString() === boardId.toString();
					});
					this.dispatchAction("boardLoaded", boardId, board);
				}.bind(this), 200);
			}
		}
	});

	lux.mixin(http, lux.mixin.actionDispatcher);

	return http;
});
