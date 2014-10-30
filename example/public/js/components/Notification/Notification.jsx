/** @jsx React.DOM */
define([
	"lux",
	"react",
	"fakeNotificationStore"
], function(lux, React, fakeNotificationStore) {

	var Notification = lux.controllerView({

		displayName: "Notification",

		stores: {
      		listenTo: ["fakeNotification", "pointlessActionCounting"],
      		onChange: function() {
      			this.setState({ notice: fakeNotificationStore.getState() });
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
