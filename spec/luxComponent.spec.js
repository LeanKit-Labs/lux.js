/* global describe, it, before, lux, utils, luxActionCh */

describe( "luxJS - components", function() {
	var fakeStore;
	before(function(){
		fakeStore = new lux.Store({
			namespace: "testytesttest",
			handlers: {
				doYourLuxThing: function() {
					return { yay: true };
				}
			}
		});
	});
	describe( "When Calling getActionCreatorFor", function(){
		it("should return expected actions for given store", function() {
			lux.getActionCreatorFor("testytesttest").should.have.property("doYourLuxThing");
		});
	} );
    describe( "When Instantiating a lux Component", function() {
    	var Component;
    	var innerRef;
    	var mocked;
    	before(function(){
    		Component = lux.createComponent({
    			displayName: "testComponent",
    			getActionsFor: ["testytesttest"],
    			componentWillMount: function() {
    				innerRef = this;
    			},
    			render: function() {
    				return null;
    			}
    		});
    		mocked = utils.renderIntoDocument( Component() );
    	});
    	it("Should provide a `doYourLuxThing` method to the component", function() {
    		innerRef.should.have.property("doYourLuxThing");
    	});
    	it("Should publish expected message when invoke action method", function(done) {
    		luxActionCh.subscribe("execute.doYourLuxThing", function(data) {
    			data.should.have.property("actionType", "doYourLuxThing");
    			data.should.have.property("actionArgs");
    			data.actionArgs[0].should.eql("foo");
    			data.actionArgs[1].should.eql(8675309);
    			data.should.have.property("component", "testComponent");
    			data.should.have.property("rootNodeID");
    			done();
    		}).once();
    		innerRef.doYourLuxThing("foo", 8675309);
    	});
    });
});
