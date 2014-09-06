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
 "./lane-selector.css"
 ],
 function( React, lux, _, LaneSelectorTable, LaneSelectorRow, LaneSelectorCell, Lane, postal ) {
    var channel = postal.channel( "lux" );
    var LaneSelector = lux.createControllerView( {
      getActionsFor: ["board"],
      stores: [ 
      	{
      		store: "board",
      		handler: function(data) {
	      		var newState = data.state[this.props.boardId];
	      		this.setState(newState);
	      	}
      	}
      ],
      getInitialState: function() {
        return { lanes: [] };
      },
      componentWillMount: function() {
        this.actions.board.loadBoard( this.props.boardId );
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
                				isActive={item.isActive} />
							})
						}
						</LaneSelectorRow>
					</LaneSelectorTable>
				</div> ;
      }
    });
    return LaneSelector;
});