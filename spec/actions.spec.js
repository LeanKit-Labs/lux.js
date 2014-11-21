/* global describe, it, before, sinon, lux, utils, luxStoreCh */

describe( "luxJS - Actions", function() {
	describe( "When calling addToActionGroup", function() {
		describe( "When creating a new action group" , function() {
			it( "Should create the action group", function() {
				var groupName = "add-group-create";

				lux.addToActionGroup( groupName, [] );
				lux.getActionGroup( groupName ).should.be.type( "object" );
			});

			it("Should add the actions to the group when given an array", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-actions-array";

				lux.addToActionGroup( groupName, actionList );
				lux.getActionGroup( groupName ).should.have.properties( actionList );
			});

			it("Should add the actions to the group when given a string", function() {
				var actionList = "one";
				var groupName = "add-group-actions-string";

				lux.addToActionGroup( groupName, actionList );
				lux.getActionGroup( groupName ).should.have.properties( actionList )
			});
		});

		describe( "When adding to an existing action group", function() {
			it( "Should add the actions to the group", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-existing-actions-string";

				// create a group with a single item
				lux.addToActionGroup( groupName, actionList[0] );
				lux.getActionGroup( groupName ).should.be.type( "object" );

				// add to the existing group with the additional two actions
				lux.addToActionGroup( groupName, actionList.slice(1) );
				lux.getActionGroup( groupName ).should.have.properties( actionList );
			});

			it( "Should not add existing actions a second time", function() {
				var actionList = [ "one", "two", "three" ];
				var groupName = "add-group-existing-actions-string";

				// add first two actions
				lux.addToActionGroup( groupName, actionList.slice(0, 2) );
				// add second (again) and third actions
				lux.addToActionGroup( groupName, actionList.slice(1, 2) );

				// based on how results are plucked, can't tell that existing action was ignored
				// verify that all three actions are returned anyways
				lux.getActionGroup( groupName ).should.have.properties( actionList );
			});

		});
	});

	describe( "When calling customActionCreator", function() {
		it( "Should create the new action", function() {
			var actionName = "create-custom-action";
			var customAction = {};

			customAction[ actionName ] = function() {};

			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator({
				getActions: actionName
			});

			// ensure that the method added is actually the one we defined via customActionCreator
			actionCreator[ actionName ].should.equal( customAction[actionName] );
		});

		it( "Should overwrite any existing action", function() {
			var actionName = "overwrite-custom-action";
			var customAction = {};
			var handlerOne = function() {};
			var handlerTwo = function() {};

			customAction[ actionName ] = handlerOne;
			lux.customActionCreator( customAction );

			// overwrite action
			customAction[ actionName ] = handlerTwo;
			lux.customActionCreator( customAction );

			var actionCreator = lux.actionCreator({
				getActions: actionName
			});

			// ensure that the method is the newly overwritten one
			actionCreator[ actionName ].should.equal( handlerTwo );
		});

		it( "Should not be overwritten by automatic action creation", function() {
			var handler = function() {};

			lux.customActionCreator({
				automaticActionCreationTest: handler
			});

			// this should not overwrite the custom action in place
			var actionListener = lux.actionListener({
				handlers: {
					automaticActionCreationTest: function() {}
				}
			});

			var actionCreator = lux.actionCreator({
				getActions: "automaticActionCreationTest"
			});

			actionCreator.automaticActionCreationTest.should.be.type( "function" );
		});
	});
	describe( "When calling getActionGroup", function() {
		it( "Should return all actions in specified group", function() {

		});
	});
	describe( "When calling actionCreator", function() {
		it( "Should take input object and add luxActionCreatorMixin", function() {

		});
	});
	describe( "When calling actionListener", function() {
		it( "Should take input object and add luxActionListenerMixin", function() {

		});
	});
	describe( "When calling actionCreatorListener", function() {
		it( "Should take input object and add both luxActionListenerMixin and luxActionCreator", function() {

		});
	});
});
