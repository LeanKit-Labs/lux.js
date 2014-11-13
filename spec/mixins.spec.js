/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Mixins", function() {
	describe( "When calling lux.mixin with no mixins specified", function() {
		it( "Should mixin both luxStoreMixin and luxActionCreatorMixin" );
		it( "Should add a luxCleanup method" );
		it( "Should prepare to handle cleanup on the luxStoreMixin" );
	});
	describe( "When using the Store Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should parse the stores property from the object" );
			it( "Should support either a single string or array for listenTo" );
			it( "Should throw an error when no change handler is provided" );
			it( "Should call onChange when a store is changed" );
			it( "Should wait for all stores to update before calling the onChange" );
			it( "Should cleanup when teardown is called" );
		});

		describe( "When using the React mixin", function () {
			it( "Should initialize during componentWillMount" );
			it( "Should cleanup during componentWillUnmount" );
		});
	});
	describe( "When Using the Creator Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should look at getActionGroup and create methods for each action in the group" );
			it( "Should look at getActions and create methods for each action" );

			it( "Should throw an error when requested a group that does not exist" );
			it( "Should throw an error when requested an action that does not exist" );

			it( "Should add a publishAction method" );
			it( "Should publish a correctly formed action when publishAction is called" );
		});

		describe( "When using the React mixin", function () {
			it( "Should initialize during componentWillMount" );
		});
	});
	describe( "When Using the Listener Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should look for handlers on the source object" );
			it( "Should call the appropriate handler when the topic is published" );
			it( "Should auto-generate action creator methods" );
			it( "Should cleanup when teardown is called" );
		});
		describe( "when using on its own", function () {
			// Do we want to test using the luxActionListenerMixin directly?
			// Passing in custom handlers, handlerFn, etc?
		});
	});
});
