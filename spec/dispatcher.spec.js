/* global describe, it, before, lux, utils, luxStoreCh, postal, sinon */

describe( "luxJS - Dispatcher", function() {
	var dispatcher,
		dispatcherChannel = postal.channel( "lux.dispatcher" ),
		testAction = "test",
		handler = sinon.spy();

	beforeEach( function() {
		// lux exposes the single dispatcher instance, but for tests create a new one each time
		dispatcher = new lux.dispatcher.constructor();

		handler.reset();
	} );

	afterEach( function() {
		dispatcher.dispose();
	} );

	it( "should dispatch actions to store action listeners", function() {
		dispatcher.registerStore( {
			namespace: "alpha",
			actions: [
				{ actionType: "test", waitFor: [] }
			]
		} );

		var subscription = dispatcherChannel.subscribe( "alpha.handle.test", handler );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		subscription.unsubscribe();

		handler.should.be.calledOnce;
		handler.lastCall.args[ 0 ].actionType.should.equal( testAction );
		handler.lastCall.args[ 1 ].channel.should.equal( "lux.dispatcher" ); // test that this is an envelope
	} );

	it( "should dispatch actions to dependent stores in the correct order", function() {
		dispatcher.registerStore( {
			namespace: "alpha",
			actions: [
				{ actionType: "test", waitFor: [ "beta" ] }
			]
		} );

		dispatcher.registerStore( {
			namespace: "beta",
			actions: [
				{ actionType: "test", waitFor: [] }
			]
		} );

		var alphaSubscription = dispatcherChannel.subscribe( "alpha.handle.test", handler );
		var betaSubscription = dispatcherChannel.subscribe( "beta.handle.test", handler );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		alphaSubscription.unsubscribe();
		betaSubscription.unsubscribe();

		handler.should.be.calledTwice;
		handler.firstCall.args[ 1 ].topic.should.equal( "beta.handle.test" );
		handler.secondCall.args[ 1 ].topic.should.equal( "alpha.handle.test" );
	} );

	it( "should properly handle when new stores are registered", function() {
		dispatcher.registerStore( {
			namespace: "alpha",
			actions: [
				{ actionType: "test", waitFor: [] }
			]
		} );

		var alphaSubscription = dispatcherChannel.subscribe( "alpha.handle.test", handler );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		// register a new store after actions have already been dispatched
		dispatcher.registerStore( {
			namespace: "beta",
			actions: [
				{ actionType: "test", waitFor: [ "alpha" ] }
			]
		} );

		var betaSubscription = dispatcherChannel.subscribe( "beta.handle.test", handler );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		alphaSubscription.unsubscribe();
		betaSubscription.unsubscribe();

		handler.should.be.calledThrice;
		handler.firstCall.args[ 1 ].topic.should.equal( "alpha.handle.test" );
		handler.secondCall.args[ 1 ].topic.should.equal( "alpha.handle.test" );
		handler.lastCall.args[ 1 ].topic.should.equal( "beta.handle.test" );
	} );

	it( "should properly handle when a store is removed", function() {
		dispatcher.registerStore( {
			namespace: "alpha",
			actions: [
				{ actionType: "test", waitFor: [ "beta" ] }
			]
		} );

		dispatcher.registerStore( {
			namespace: "beta",
			actions: [
				{ actionType: "test", waitFor: [] }
			]
		} );

		var alphaSubscription = dispatcherChannel.subscribe( "alpha.handle.test", handler );
		var betaSubscription = dispatcherChannel.subscribe( "beta.handle.test", handler );

		dispatcher.removeStore( "alpha", true );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		alphaSubscription.unsubscribe();
		betaSubscription.unsubscribe();

		handler.should.be.calledOnce;
		handler.firstCall.args[ 1 ].topic.should.equal( "beta.handle.test" );
	} );

	it( "should properly finish an action cycle by publishing a notify message", function() {
		dispatcher.registerStore( {
			namespace: "alpha",
			actions: [
				{ actionType: "test", waitFor: [] }
			]
		} );

		var subscription = dispatcherChannel.subscribe( "notify", handler );

		dispatcher.handleActionDispatch( {
			actionType: testAction
		} );

		subscription.unsubscribe();

		handler.should.be.calledOnce;
		handler.lastCall.args[ 0 ].action.actionType.should.equal( testAction );
		handler.lastCall.args[ 1 ].channel.should.equal( "lux.dispatcher" ); // test that this is an envelope
	} );

	it( "should ignore handled messages when there is no current actionContext", function() {
		dispatcher.handle = sinon.spy();

		dispatcherChannel.publish( "alpha.handled.test" );

		dispatcher.handle.should.not.be.called;
	} );

	it( "should unsubscribe and remove all subscriptions when disposed", function() {
		var subscriptions = dispatcher.__subscriptions.slice();

		dispatcher.dispose();

		subscriptions.forEach( ( sub ) => sub.inactive.should.be.ok );

		should.equal( dispatcher.__subscriptions, null );
	} );

	describe("when exiting dispatching state", function(){
		var hasChanged, namespace, prenotifySent, alphaSubscription, prenotifySubscription;

		beforeEach(function(){
			namespace = "alpha";
			prenotifySent = false;
			dispatcher.registerStore( {
				namespace: "alpha",
				actions: [
					{ actionType: "test", waitFor: [ "beta" ] }
				]
			} );
			alphaSubscription = dispatcherChannel.subscribe( namespace + ".handle." + testAction, function() {
				dispatcherChannel.publish(
					namespace + ".handled." + testAction,
					{ hasChanged: hasChanged, namespace: namespace }
				);
			} );
			prenotifySubscription = dispatcherChannel.subscribe( "prenotify", function() {
				prenotifySent = true;
			} );
		});

		afterEach(function() {
			alphaSubscription.unsubscribe();
			prenotifySubscription.unsubscribe();
		});

		it( "should send a prenotify message if there are stores that have updated", function(){
			hasChanged = true;
			dispatcher.handleActionDispatch( {
				actionType: testAction
			} );
			prenotifySent.should.be.true;
		});

		it( "should not send a prenotify message if there are no stores that updated", function(){
			hasChanged = false;
			dispatcher.handleActionDispatch( {
				actionType: testAction
			} );
			prenotifySent.should.be.false;
		});
	});
} );
