/** @jsx React.DOM */
define([
	"lux",
	"react"
], function(lux, React) {

	var Notification = lux.createControllerView({

		displayName: "Notification",

		stores: {
      		listenTo: ["fakeNotification", "pointlessActionCounting"],
      		onChange: function(data) {
      			this.setState({ notice: data.fakeNotification.state });
	      	}
      	},

		getInitialState: function() {
			return {
				notice: ""
			};
		},

		render: function() {
			return <div>
				{
					this.state.notice ? <h3>{this.state.notice}</h3> : null
				}
			</div>;
		}
	});

	return Notification;
});
