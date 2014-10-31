/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Controller Views", function() {
	describe( "When Instantiating a lux Controller View", function() {
		var Component;
		var innerRef;
		var mocked;
		before(function(){
    		Component = lux.controllerView({
    			displayName: "testControllerView",
    			stores: {
    				listenTo: "testytesttest",
    				onChange: function(stores) {

    				}
    			},
    			componentWillMount: function() {
    				innerRef = this;
    			},
    			render: function() {
    				return null;
    			}
    		});
			mocked = utils.renderIntoDocument( Component() );
		});
	});
});
