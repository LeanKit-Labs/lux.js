/** @jsx React.DOM */
define([
	"react"
], function(React) {
	var LaneSelectorCell = React.createClass({
		getDefaultProps: function() {
			return { className: "" };
		},
		render: function() {
			var classes = ["lane-sel-cell"].concat(this.props.className.split(" "));
			return this.transferPropsTo(<div className={classes.join(" ")}>
				{this.props.children}
			</div>);
		}
	});

	return LaneSelectorCell;
});