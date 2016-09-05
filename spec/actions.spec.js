describe( "luxJS - Actions", function() {
	describe( "lux.publishAction", function() {
		var listener, spy;
		before( function() {
			spy = sinon.spy();
			listener = lux.actionListener( {
				handlers: {
					globalPublishAction: spy
				}
			} );
		} );
		after( function() {
			listener.luxCleanup();
		} );
		it( "should trigger the correct action", function() {
			lux.publishAction( "globalPublishAction" );
			spy.should.be.calledOnce;
		} );
	} );

	describe( "When calling customActionCreator", function() {
		it( "Should create the new action", function() {
			var actionName = "create-custom-action";
			var customAction = {};

			customAction[ actionName ] = sinon.spy();

			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method called is actually
			// the one we defined via customActionCreator
			actionCreator[ actionName ]();
			customAction[ actionName ].should.be.calledOnce;
		} );

		it( "Should overwrite any existing action", function() {
			var actionName = "overwrite-custom-action";
			var handlerOne = sinon.spy();
			var handlerTwo = sinon.spy();
			var customAction = {
				[ actionName]: handlerOne
			};

			lux.customActionCreator( customAction );

			// overwrite action
			customAction[ actionName ] = handlerTwo;
			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method is the newly overwritten one
			actionCreator[ actionName ]();
			handlerTwo.should.be.calledOnce;
			handlerOne.should.not.be.called;
		} );

		it( "Should not be overwritten by automatic action creation", function() {
			var handler = sinon.spy();
			var wrongHandler = sinon.spy();

			lux.customActionCreator( {
				automaticActionCreationTest: handler
			} );

			// this should not overwrite the custom action in place
			lux.actionListener( {
				handlers: {
					automaticActionCreationTest: wrongHandler
				}
			} );

			var actionCreator = lux.actionCreator( {
				getActions: "automaticActionCreationTest"
			} );

			actionCreator.automaticActionCreationTest();

			handler.should.be.calledOnce;
			wrongHandler.should.not.be.called;
		} );
	} );

	describe( "When calling actionCreator", function() {
		it( "Should take input object and add luxActionCreatorMixin", function() {
			var actionCreator = lux.actionCreator( {} );

			actionCreator.publishAction.should.be.a.Function;
		} );
	} );
	describe( "When calling actionListener", function() {
		it( "Should take input object and add luxActionListenerMixin", function() {
			var handler = sinon.spy();
			var testValue = "test-value";

			lux.actionListener( {
				handlers: {
					testAction: handler
				}
			} );

			var actionCreator = lux.actionCreator( {} );

			actionCreator.publishAction( "testAction", testValue );

			handler.should.be.calledOnce
				.and.calledWithExactly( testValue );
		} );
	} );
	describe( "When calling actionCreatorListener", function() {
		it( "Should take input object and add both luxActionListenerMixin and luxActionCreator", function() {
			var handler = sinon.spy();
			var testValue = "test-value";

			var actionCreatorListener = lux.actionCreatorListener( {
				handlers: {
					testAction: handler
				}
			} );

			// action creator would add publishAction method and action listener would listen for it
			actionCreatorListener.publishAction.should.be.a.Function;
			actionCreatorListener.publishAction( "testAction", testValue );

			handler.should.be.calledOnce
				.and.calledWithExactly( testValue );
		} );
	} );
} );
