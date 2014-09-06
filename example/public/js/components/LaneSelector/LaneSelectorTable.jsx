/** @jsx React.DOM */
define([
	"react"
], function(React) {
	var LaneSelectorTable = React.createClass({
		getDefaultProps: function() {
			return { className: "" };
		},
		render: function() {
			var classes = ["lane-sel-table"].concat(this.props.className.split(" "));
			return <div className={classes.join(" ")}>
				{this.props.children}
			</div>;
		}
	});

	return LaneSelectorTable;
});