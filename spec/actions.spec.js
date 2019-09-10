describe( "luxJS - Actions", function() {
	describe( "lux.dispatch", function() {
		let listener, spy;
		before( function() {
			spy = sinon.spy();
			listener = lux.actionListener( {
				handlers: {
					globalDispatch: spy
				}
			} );
		} );
		after( function() {
			listener.luxCleanup();
		} );
		it( "should trigger the correct action", function() {
			lux.dispatch( "globalDispatch" );
			spy.should.be.calledOnce();
		} );
	} );

	describe( "When calling customActionCreator", function() {
		it( "Should create the new action", function() {
			const actionName = "create-custom-action";
			const customAction = {};

			customAction[ actionName ] = sinon.spy();

			lux.customActionCreator( customAction );

			const actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method called is actually
			// the one we defined via customActionCreator
			actionCreator[ actionName ]();
			customAction[ actionName ].should.be.calledOnce();
		} );

		it( "Should overwrite any existing action", function() {
			const actionName = "overwrite-custom-action";
			const handlerOne = sinon.spy();
			const handlerTwo = sinon.spy();
			const customAction = {
				[ actionName ]: handlerOne
			};

			lux.customActionCreator( customAction );

			// overwrite action
			customAction[ actionName ] = handlerTwo;
			lux.customActionCreator( customAction );

			const actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method is the newly overwritten one
			actionCreator[ actionName ]();
			handlerTwo.should.be.calledOnce();
			handlerOne.should.not.be.called();
		} );

		it( "Should not be overwritten by automatic action creation", function() {
			const handler = sinon.spy();
			const wrongHandler = sinon.spy();

			lux.customActionCreator( {
				automaticActionCreationTest: handler
			} );

			// this should not overwrite the custom action in place
			lux.actionListener( {
				handlers: {
					automaticActionCreationTest: wrongHandler
				}
			} );

			const actionCreator = lux.actionCreator( {
				getActions: "automaticActionCreationTest"
			} );

			actionCreator.automaticActionCreationTest();

			handler.should.be.calledOnce();
			wrongHandler.should.not.be.called();
		} );
	} );

	describe( "When calling actionCreator", function() {
		it( "Should take input object and add luxActionCreatorMixin", function() {
			const actionCreator = lux.actionCreator( {} );

			actionCreator.dispatch.should.be.a( "function" );
		} );
	} );
	describe( "When calling actionListener", function() {
		it( "Should take input object and add luxActionListenerMixin", function() {
			const handler = sinon.spy();
			const testValue = "test-value";

			lux.actionListener( {
				handlers: {
					testAction: handler
				}
			} );

			const actionCreator = lux.actionCreator( {} );

			actionCreator.dispatch( "testAction", testValue );

			handler.should.be.calledOnce
				.and.calledWithExactly( testValue );
		} );
	} );
	describe( "When calling actionCreatorListener", function() {
		it( "Should take input object and add both luxActionListenerMixin and luxActionCreator", function() {
			const handler = sinon.spy();
			const testValue = "test-value";

			const actionCreatorListener = lux.actionCreatorListener( {
				handlers: {
					testAction: handler
				}
			} );

			// action creator would add dispatch method and action listener would listen for it
			actionCreatorListener.dispatch.should.be.a( "function" );
			actionCreatorListener.dispatch( "testAction", testValue );

			handler.should.be.calledOnce
				.and.calledWithExactly( testValue );
		} );
	} );
} );
