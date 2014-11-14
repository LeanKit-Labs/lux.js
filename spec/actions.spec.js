/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Actions", function() {
	describe( "When calling addToActionGroup", function() {
		describe("When creating a new action group", function() {
			it("Should create the action group");
			it("Should add the actions to the group");
		});
		describe("When adding to an existing action group", function() {
			it("Should add the actions to the group" );
			it("Should not add existing actions a second time" );
		});
	});
	describe( "When calling customActionCreator", function() {
		it( "Should create the new action" );
		it( "Should overwrite any existing action" );
		it( "Should not be overwritten by automatic action creation" );
	});
	describe( "When calling getActionGroup", function() {
		it( "Should return all actions in specified group" );
	});
	describe( "When calling actionCreator", function() {
		it( "Should take input object and add luxActionCreatorMixin" );
	});
	describe( "When calling actionListener", function() {
		it( "Should take input object and add luxActionListenerMixin" );
	});
	describe( "When calling actionCreatorListener", function() {
		it( "Should take input object and add both luxActionListenerMixin and luxActionCreator" );
	});
});
