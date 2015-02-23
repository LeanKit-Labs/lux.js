describe( "luxJS - Actions", function() {
	describe( "When calling addToActionGroup", function() {
		describe( "When creating a new action group", function() {
			before( function() {
				lux.customActionCreator({
					one: function() {},
					two: function() {},
					three: function() {},
				});
			} );
			after( function() {
				_.each(lux.actions, function(v, k) {
					delete lux.actions[k];
				});
			} );
			it( "Should create the action group", function() {
				var groupName = "add-group-create";
				lux.addToActionGroup( groupName, [] );
				lux.getActionGroup( groupName ).should.be.an.Object;
			} );

			it( "Should add the actions to the group when given an array", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-actions-array";

				lux.addToActionGroup( groupName, actionList );
				lux.getActionGroup( groupName ).should.contain.all.keys( actionList );
			} );

			it( "Should add the actions to the group when given a string", function() {
				var actionList = "one";
				var groupName = "add-group-actions-string";

				lux.addToActionGroup( groupName, actionList );
				lux.getActionGroup( groupName ).should.contain.all.keys( actionList );
			} );

			it( "Should throw an exception if invalid action names are used", function() {
				var actionList = [ "one", "two", "three", "shfifty" ];
				var groupName = "Not-gonna-happen";

				(function() {
					lux.addToActionGroup( groupName, actionList );
				}).should.throw();
			} );
		} );

		describe( "When adding to an existing action group", function() {
			before( function() {
				lux.customActionCreator({
					one: function() {},
					two: function() {},
					three: function() {},
				});
			} );
			after( function() {
				_.each(lux.actions, function(v, k) {
					delete lux.actions[k];
				});
			} );
			it( "Should add the actions to the group", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-existing-actions-string";

				// create a group with a single item
				lux.addToActionGroup( groupName, actionList[ 0 ] );
				lux.getActionGroup( groupName ).should.be.an.Object;

				// add to the existing group with the additional two actions
				lux.addToActionGroup( groupName, actionList.slice( 1 ) );
				lux.getActionGroup( groupName ).should.contain.all.keys( actionList );
			} );

			it( "Should not add existing actions a second time", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-existing-actions-string";

				// add first two actions
				lux.addToActionGroup( groupName, actionList.slice( 0, 2 ) );
				// add second (again) and third actions
				lux.addToActionGroup( groupName, actionList.slice( 1, 2 ) );

				// based on how results are plucked, can't tell that existing action was ignored
				// verify that all three actions are returned anyways
				lux.getActionGroup( groupName ).should.contain.all.keys( actionList );
			} );

			it( "Should throw an exception if invalid action names are used", function() {
				var actionList = [ "one", "two", "three", "shfifty" ];
				var groupName = "Not-gonna-happen";

				(function() {
					lux.addToActionGroup( groupName, actionList );
				}).should.throw();
			} );

		} );
	} );

	describe( "When calling customActionCreator", function() {
		it( "Should create the new action", function() {
			var actionName = "create-custom-action";
			var customAction = {};

			customAction[ actionName ] = function() {};

			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method added is actually the one we defined via customActionCreator
			actionCreator[ actionName ].should.equal( customAction[ actionName ] );
		} );

		it( "Should overwrite any existing action", function() {
			var actionName = "overwrite-custom-action";
			var handlerOne = function() {};
			var handlerTwo = function() {};
			var customAction = {
				[ actionName ]: handlerOne
			};

			lux.customActionCreator( customAction );

			// overwrite action
			customAction[ actionName ] = handlerTwo;
			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator( {
				getActions: actionName
			} );

			// ensure that the method is the newly overwritten one
			actionCreator[ actionName ].should.equal( handlerTwo );
		} );

		it( "Should not be overwritten by automatic action creation", function() {
			var handler = function() {};

			lux.customActionCreator( {
				automaticActionCreationTest: handler
			} );

			// this should not overwrite the custom action in place
			lux.actionListener( {
				handlers: {
					automaticActionCreationTest: function() {}
				}
			} );

			var actionCreator = lux.actionCreator( {
				getActions: "automaticActionCreationTest"
			} );

			actionCreator.automaticActionCreationTest.should.equal( handler );
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
			var handler = sinon.spy(),
				testValue = "test-value";

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
			var handler = sinon.spy(),
				testValue = "test-value";

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
