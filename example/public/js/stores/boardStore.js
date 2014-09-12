define([
	"lux",
	"lodash",
	"laneParser",
	"./boardData.json",
	"jquery",
	"when",
	"imports?jQuery=jquery!mockjax"
], function(lux, _, parser, mockData, $, when) {

	$.mockjax({
		url: /\/board\/([\d]+)/,
		urlParams: [ "boardId" ],
		response: function(settings) {
			this.responseText = mockData.boards.find(function(x) {
				return x.boardId.toString() === settings.urlParams.boardId;
			});
		} 
	});

	function toggleAncestors(lookup, target) {
		var parentId = target.parentLaneId;
		var parent = lookup[parentId];
		var index;
		if(parent) {
			index = parent.activeChildren.indexOf(target.id);
			if(target.isActive && index === -1) {
				parent.activeChildren.push(target.id);
			} else if (!target.isActive && index !== -1) {
				parent.activeChildren.splice(index, 1);
			}
			if(parent.activeChildren.length > 0 && !parent.isActive) {
				parent.isActive = true;
			} else if(parent.activeChildren.length === 0 && parent.isActive){
				parent.isActive = false;
			}
			toggleAncestors(lookup, parent);
		}
	}

	function toggleDescendants(target) {
		var isActive = target.isActive;
		_.each(target.items, function(item) {
			var index = target.activeChildren.indexOf(item.id);
			if(item.isActive !== isActive) {
				if(item.isActive && !isActive && index !== -1) {
					target.activeChildren.splice(index, 1);
				} else if(!item.isActive && isActive && index === -1) {
					target.activeChildren.push(item.id);
				}
				item.isActive = isActive;
				toggleDescendants(item);
			}
		});
	}

	var boardStore = lux.createStore({
		namespace: "board",
		handlers: {
			toggleLaneSelection: function(boardId, laneId) {
				return this.getState().then(
					function(boards) {
						var target = boards[boardId] && boards[boardId].lookup[laneId];
						if(target) {
							target.isActive = !target.isActive;
							toggleAncestors(boards[boardId].lookup, target);
							toggleDescendants(target);
						}
					}
				);
			},
			loadBoard: function(boardId) {
				return $.ajax({
					url: "/board/" + boardId,
					dataType: "json"
				}).then(
					function(resp) {
						var placeholder = {};
						placeholder[boardId] = parser.transform(resp);
						this.setState(placeholder);
						return placeholder[boardId];
					}.bind(this),
					function(err) { console.log(err); }
				);
			}
		}
	});

	return boardStore;
});