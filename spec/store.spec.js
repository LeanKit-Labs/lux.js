/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Store", function() {
	describe( "When creating a Store", function() {
		describe( "When validating options", function () {
			it( "Should throw an error if the namespace is already used" );
			it( "Should throw an error if the namespace is not provided" );
			it( "Should throw an error if there are no action handlers" );
		});
		describe( "When initializing", function () {
			it( "Should allow a custom state prop to be used" );
			it( "Should use state passed into the constructor as initial state" );
			it( "Should pass along any extra property or method names to the new object" );
			it( "Should make action creator methods for each handler" );
			it( "Should remove action handlers from public object" );
			it( "Should remove direct access to state" );
		});
	});
	describe( "When using a Store", function () {
		it( "Should only allow setState while handling an action" );
		it( "Should wait for other stores to update before dependent action is handled" );
		it( "Should assume there were changes unless a handler explicitly returns `false`");
		it( "Should publish a 'changed' message when flush is called and there are changes" );
	});
	describe( "When removing a Store", function() {
		it( "Should remove all subscriptions" );
		it( "Should remove the namespace from the stores cache" );
	});
});
