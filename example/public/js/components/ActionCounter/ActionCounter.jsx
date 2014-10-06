/** @jsx React.DOM */
define([
	"lux",
	"react"
], function(lux, React) {

	var ActionCounter = lux.createControllerView({

		stores: [ 
	      	{
	      		store: "pointlessActionCounting",
	      		handler: function(data) {
	      			this.setState({ count: data.state });
		      	}
	      	}
      	],

		getInitialState: function() {
			return {
				count: 0
			};
		},

		render: function() {
			return <div>
				<h2>Actions Taken So Far:&nbsp;{this.state.count}</h2>
			</div>;
		}
	});

	return ActionCounter;
});