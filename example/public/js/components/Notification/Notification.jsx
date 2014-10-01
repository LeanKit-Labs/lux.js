/** @jsx React.DOM */
define([
	"lux",
	"react"
], function(lux, React) {

	var Notification = lux.createControllerView({

		stores: [ 
	      	{
	      		store: "fakeNotification",
	      		handler: function(data) {
	      			this.setState({ notice: data.state });
		      	}
	      	}
      	],

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