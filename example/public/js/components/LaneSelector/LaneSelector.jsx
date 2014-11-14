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
		getActionGroup: ["api"],
		stores: {
			listenTo: ["board"],
			onChange: function() {
				var newState = boardStore.getBoard(this.props.boardId);
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
