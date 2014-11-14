/** @jsx React.DOM */
define([
	"react",
	"lux",
	"LaneSelectorTable",
	"LaneSelectorRow",
	"LaneSelectorCell"
], function(React, lux, LaneSelectorTable, LaneSelectorRow, LaneSelectorCell) {

	var classSet = React.addons.classSet;

	function applyGridClass(classSet) {
		if(this.props.depth > 0 && this.props.siblingSize <= 10) {
			classSet["col-" + this.props.siblingSize] = true;
		}
		return classSet;
	}

	var Lane = lux.component({

		displayName: "Lane",

    	getActionGroup: ["board"],

		getInitialState: function() {
			return {
				isCollapsed: false
			};
		},

		getDefaultProps: function() {
			return {
				items: [],
				siblingSize: 1,
				depth: 0,
				isParentActive: false
			};
		},

		toggleActive: function(e) {
			e.stopPropagation();
			this.toggleLaneSelection(304355117, this.props.id);
		},

		render: function() {
			var classes = classSet(
				applyGridClass.call(
					this,
					{
						"lane-sel-parent"      : this.props.items.length > 0,
						"lane-sel-is-active"   : this.props.isActive,
						"lane-sel-is-inactive" : !this.props.isActive
					}
				)
			);
			var childClasses = classSet({
				"lane-collapsed" : this.state.isCollapsed
			});
			var toggleClasses = classSet({
				"fa" : true,
				"lane-sel-toggle"   : true,
				"fa-plus-square"    : this.state.isCollapsed,
				"fa-minus-square"   : !this.state.isCollapsed,
				"lane-sel-toggle-inactive" : !this.props.isActive,
				"lane-sel-toggle-active" : this.props.isActive
			});
			var newDepth = this.props.depth + 1;
			return <LaneSelectorCell className={classes} onClick={this.toggleActive}>
				<div>
					{
						this.props.items.length ?
							<button className="lane-sel-toggle" onClick={this.toggleChildren}>
								<i className={toggleClasses}/>
							</button> : null
					}
				<span>{this.props.name}</span>
				</div>
				<div className={childClasses}>
					{
						(this.props.depth % 2 === 0) ?
							<VerticalLaneGroup   className={childClasses} items={this.props.items} depth={newDepth} isParentActive={this.props.isActive} /> :
							<HorizontalLaneGroup className={childClasses} items={this.props.items} depth={newDepth} isParentActive={this.props.isActive} />
					}
				</div>
			</LaneSelectorCell>;
		}
	});

	var VerticalLaneGroup = React.createClass({

		displayName: "VerticalLaneGroup",

		getDefaultProps: function() {
			return {
				isParentActive: false
			};
		},
		render: function() {
			var depth = this.props.depth;
			var siblingSize = this.props.items.length;
			return (!siblingSize) ? null :
				<LaneSelectorTable className="lane-sel-vertical">
				{
					this.props.items.map(function(item){
						return <LaneSelectorRow key={item.id} className="lane-sel-vertical">
							<Lane key={item.id}
								  id={item.id}
								  name={item.name}
								  items={item.items}
								  depth={depth}
								  siblingSize={1}
								  isParentActive={this.props.isParentActive}
								  isActive={item.isActive}/>
						</LaneSelectorRow>;
					}.bind(this))
				}
				</LaneSelectorTable>;
		}
	});

	var HorizontalLaneGroup = React.createClass({

		displayName: "HorizontalLaneGroup",

		getDefaultProps: function() {
			return {
				isParentActive: false
			};
		},
		render: function() {
			var depth = this.props.depth;
			var siblingSize = this.props.items.length;
			return (!siblingSize) ? null :
				<LaneSelectorTable className="lane-sel-horizontal">
				{
					this.props.items.map(function(item){
						return <Lane key={item.id}
									 id={item.id}
									 name={item.name}
									 items={item.items}
									 depth={depth}
									 siblingSize={siblingSize}
									 isParentActive={this.props.isParentActive}
									 isActive={item.isActive}/>;
					}.bind(this))
				}
				</LaneSelectorTable>;
		}
	});
	return Lane;
});
