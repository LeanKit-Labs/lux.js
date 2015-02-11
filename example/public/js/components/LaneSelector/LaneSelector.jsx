/** @jsx React.DOM */
define( [
	"react",
	"lux",
	"lodash",
	"LaneSelectorTable",
	"LaneSelectorRow",
	"LaneSelectorCell",
	"Lane",
	"postal",
	"boardStore",
	"./lane-selector.css"
 ],
 function( React, lux, _, LaneSelectorTable, LaneSelectorRow, LaneSelectorCell, Lane, postal, boardStore ) {
	var LaneSelector = lux.controllerView( {
		displayName: "LaneSelector",
		stores: {
			listenTo: ["board"],
			onChange: function() {
				var newState = boardStore.getCurrentBoard();
				this.setState(newState);
			}
		},
		getInitialState: function() {
			return boardStore.getCurrentBoard() || { lanes: [] };
		},
		render: function() {
			var siblingSize = this.state.lanes.length;
			return <div className = "lane-sel-container">
				<LaneSelectorTable>
					<LaneSelectorRow>
					{
						this.state.lanes.map( function( item ) {
							return <Lane
									key={item.id}
									id={item.id}
									name={item.name}
									items={item.items}
									depth={0}
									siblingSize={siblingSize}
									isActive={item.isActive} />;
						})
					}
					</LaneSelectorRow>
				</LaneSelectorTable>
			</div> ;
		}
	});
	return LaneSelector;
});
