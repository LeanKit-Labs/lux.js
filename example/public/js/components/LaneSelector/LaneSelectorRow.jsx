/** @jsx React.DOM */
define([
	"react"
], function(React) {
	var LaneSelectorRow = React.createClass({
		getDefaultProps: function() {
			return { className: "" };
		},
		render: function() {
			var classes = ["lane-sel-row"].concat(this.props.className.split(" "));
			return <div className={classes.join(" ")}>
				{this.props.children}
			</div>;
		}
	});

	return LaneSelectorRow;
});