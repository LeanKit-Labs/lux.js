/** @jsx React.DOM */
define([
	"lux",
	"react"
], function(lux, React) {

	var ActionCounter = lux.createControllerView({

		stores: {
      		listenTo: "pointlessActionCounting"
      	},

		getInitialState: function() {
			return {
				pointlessActionCounting: 0
			};
		},

		render: function() {
			return <div>
				<h2>Actions Taken So Far:&nbsp;{this.state.pointlessActionCounting}</h2>
			</div>;
		}
	});

	return ActionCounter;
});