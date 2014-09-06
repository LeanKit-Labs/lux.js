/** @jsx React.DOM */
define([
	"react",
	"lodash",
	"./lane-selector.css"
], function(React, _) {

	var laneTree = {};
	var laneIdLookup = {};

	function findNode(tree, id) {
		var node;
		_.each(tree, function(val, key) {
			if(key == id) { // loose equality b/c of string to numeric key comparison :-(
				node = val;
			}
			if(!node && val.children) {
				node = findNode(val.children, id);
			} 
			if(node) {
				return false;
			}
		});
		return node;
	}

	_.each(data.lanes, function(lane){
		if(lane.ParentLaneId === null) {
			laneTree[lane.Id] = lane;
		} else {
			var parent = findNode(laneTree, lane.ParentLaneId);
			if(parent) {
				console.log("adding child");
				parent.children = parent.children || {};
				parent.children[lane.Id] = lane;
			}
		}
	});

	var Lane = React.createClass({
		render: function() {
			var lane;
			switch(this.props.level) {
				case 1:

				break;
				case 2:
			}
			return lane;
		}
	});

	var LaneSelector = React.createClass({
		render: function() {
			return <div className="lane-sel-container">
				<div className="lane-sel-row lane-sel lane-sel-table">
					<div className="lane-sel-cell lane-sel-item">
						<div className="lane-sel-row lane-sel-row-outer">
							<div className="lane-sel-cell lane-sel-item col-1">
								<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Backlog
							</div>
						</div>
					</div>
					<div className="lane-sel-cell">
						<div className="lane-sel-row">
							<div className="lane-sel-cell lane-sel-item col-1">
								<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 1
								<div className="lane-sel-row">
									<div className="lane-sel-row">
										<div className="lane-sel-cell lane-sel-item lane-sel-subcell col-1">Lane 1-A</div>
									</div>

									<div className="lane-sel-row">
										<div className="lane-sel-cell lane-sel-item">
											<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 1-B
											<div className="lane-sel-row">
												<div className="lane-sel-cell lane-sel-item lane-sel-subcell col-3">Lane 1-B-i</div>
												<div className="lane-sel-cell lane-sel-item lane-sel-subcell col-3">Lane 1-B-ii</div> 
												<div className="lane-sel-cell lane-sel-item lane-sel-subcell col-3">Lane 1-B-iii</div>
											</div>
										</div>
									</div>
									
									<div className="lane-sel-row">
										<div className="lane-sel-cell lane-sel-item">
											<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 1-C
											<div className="lane-sel-row">
												<div className="lane-sel-cell lane-sel-item lane-sel-subcellcol-4">Lane 1-C-i</div>
												<div className="lane-sel-row">
													<div className="lane-sel-cell lane-sel-subcell lane-sel-sub-item col-1">
														<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 1-C-ii
														<div className="lane-sel-row">
															<div className="lane-sel-sub-item lane-sel-item">Lane 1-C-ii-b</div>
														</div>
														<div className="lane-sel-row">
															<div className="lane-sel-sub-item lane-sel-item">Lane 1-C-ii-c</div>	
														</div>
													</div>
												</div>
												<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-4">Lane 1-C-iii</div>
												<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-4">Lane 1-C-iv</div>
											</div>
										</div>
									</div>
									<div className="lane-sel-row">
										<div className="lane-sel-cell lane-sel-item">
											<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 1-D
											<div className="lane-sel-row">
												<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-2">Lane 1-D-i</div>
												<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-2">Lane 1-D-i</div> 
											</div>
										</div>
									</div>
									
								</div>

							</div>
						</div>
					</div>
					
					<div className="lane-sel-cell lane-sel-item">
						<div className="lane-sel-row lane-sel-row-outer">
							<div className="lane-sel-cell lane-sel-item">
								Archive
							</div>
						</div>
					</div>
				</div>
			</div>;
		}
	});

	return LaneSelector;
});

/*
<div className="lane-sel-cell">
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-item col-1">
			<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 2
		</div>
	</div>
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-1">Lane 2-A</div>
	</div>

	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-item"><button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 2-B</div>
	</div>
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-3">Lane 2-B-i</div>
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-3">Lane 2-B-ii</div> 
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-3">Lane 2-B-iii</div>
	</div>
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-item"><button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 2-C</div>
	</div>
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-4">Lane 2-C-i</div>
		<div className="lane-sel-cell lane-sel-subcell col-4">
			<div className="lane-sel-sub-item lane-sel-item">
				<button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 2-C-ii
			</div>
			<div className="lane-sel-sub-item lane-sel-item">Lane 2-C-ii-b</div>
			<div className="lane-sel-sub-item lane-sel-item">Lane 2-C-ii-c</div>	
		</div>
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-4">Lane 2-C-iii</div>
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-4">Lane 2-C-iv</div>
	</div>

	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-item"><button className="lane-sel-toggle"><i className="icon-minus-sign-alt"/></button>Lane 2-D</div>
	</div>
	<div className="lane-sel-row">
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-2">Lane 2-D-i</div>
		<div className="lane-sel-cell lane-sel-subcell lane-sel-item col-2">Lane 2-D-i</div> 
	</div>
	
</div>

*/