/** @jsx React.DOM */
define([
	"lux",
	"react",
	"pointlessActionCountingStore"
], function(lux, React, pointlessActionCountingStore) {

	var ActionCounter = lux.controllerView({

		displayName: "ActionCounter",

		stores: {
      		listenTo: "pointlessActionCounting",
      		onChange: function() {
      			this.setState({count: pointlessActionCountingStore.getState().count});
      		}
      	},

		getInitialState: function() {
			return {
				pointlessActionCounting: 0
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
