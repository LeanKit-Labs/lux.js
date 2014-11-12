/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Controller Views", function() {
	var fakeStore2;
	before(function(){
		fakeStore2 = new lux.Store({
			namespace: "fakeStore2",
			handlers: {
				doYourControllerViewThing: function() {
					return { yay: true };
				}
			}
		});
		lux.addToActionGroup("fakeyactiongroup", [ "doYourControllerViewThing" ]);
	});
	describe( "When Instantiating a lux Controller View", function() {
		describe( "When Listening to One Store", function() {
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
			it("Should invoke onChange when the store updates" );
		});
		describe( "When Listening to Multiple Stores", function() {
			it("Should invoke onChange when a store updates" );
		});
	});
});
