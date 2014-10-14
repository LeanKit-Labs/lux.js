/** @jsx React.DOM */
define( [
	"react",
	"lux",
	"lodash",
	"LaneSelectorTable",
	"LaneSelectorRow",
	"LaneSelectorCell",
	"Lane",
	"./lane-selector.css"
 ],
 function( React, lux, _, LaneSelectorTable, LaneSelectorRow, LaneSelectorCell, Lane ) {
	var LaneSelector = lux.createControllerView( {
		displayName: "LaneSelector",
		getActionsFor: ["board"],
		stores: {
			listenTo: ["board"],
			onChange: function(stores) {
				var newState = stores.board.state[this.props.boardId];
				this.setState(newState);
			},
			immediate: true
		},
		getInitialState: function() {
			return { lanes: [] };
		},
		componentWillMount: function() {
			window.laneSelector = this;
			this.loadBoard( this.props.boardId );
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
