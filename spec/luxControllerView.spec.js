/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Controller Views", function() {
	describe( "When Instantiating a lux Controller View", function() {
		var Component;
		var innerRef;
		var mocked;
		before(function(){
    		Component = lux.createControllerView({
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
    	it("Should publish expected message when invoking loadState method", function(done) {
    		luxStoreCh.subscribe("testytesttest.state", function(data, env) {
    			env.should.have.property("reply");
    			env.reply(null, { changedKeys: [], state: {} });
    			done();
    		}).once();
    		innerRef.loadState();
    	});
	});
});
