define([
	"./boardData.json",
	"lux"
], function(mockData, lux){

	var http = lux.actionCreatorListener({
		handlers: {
			loadBoard: function(boardId) {
				// simulate an http response
				setTimeout(function(){
					var board = mockData.boards.find(function(x) {
						return x.boardId.toString() === boardId.toString();
					});
					this.publishAction("boardLoaded", boardId, board);
				}.bind(this), 200);
			}
		}
	});
	return http;
});
