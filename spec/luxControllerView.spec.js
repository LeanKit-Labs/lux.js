/* global describe, it, before, after, beforeEach, lux, utils, React, sinon, luxStoreCh */

describe( "luxJS - Controller Views", function() {
	var fakeStore, fakeStore2;
	before(function(){
		fakeStore = new lux.Store({
			state: {},
			namespace: "fakeStore",
			handlers: {
				doYourControllerViewThing: function() { },
				doYourFakeStoreThing: function() { },
				dontChange: function() { return false; }
			}
		});
		fakeStore2 = new lux.Store({
			state: {},
			namespace: "fakeStore2",
			handlers: {
				doYourControllerViewThing: function() { },
				dontChange: function() { return false; }
			}
		});
		lux.addToActionGroup("fakeyactiongroup", [ "doYourControllerViewThing" ]);
	});
	after(function () {
		fakeStore.dispose();
		fakeStore2.dispose();
	});
	describe( "When Instantiating a lux Controller View", function() {
		var ControllerView;
		var innerRef;
		var mocked;
		var creator;

		function controllerViewFactory( options ) {
			options = Object.assign( {
				displayName: "testControllerView",
				componentWillMount: function() {
					innerRef = this;
				},
				render: function() {
					return null;
				}
			}, options );

			ControllerView = lux.controllerView( options );
			mocked = utils.renderIntoDocument( React.createElement( ControllerView ) );
		}

		before( function () {
			creator = lux.actionDispatcher({});
		});

		describe( "When Listening to One Store", function() {
			var onChange;
			beforeEach( function () {
				onChange = sinon.spy();
				controllerViewFactory({
					stores: {
						listenTo: "fakeStore",
						onChange: onChange
					}
				});
			});
			it("Should invoke onChange when a store updates", function () {
				creator.dispatchAction( "doYourControllerViewThing" );
				onChange.calledOnce.should.be.true;
			});
			it("Should not invoke onChange if the store has not changed", function () {
				creator.dispatchAction( "dontChange" );
				onChange.calledOnce.should.be.false;
			});
		});
		describe( "When Listening to Multiple Stores", function() {
			var onChange;
			beforeEach( function () {
				onChange = sinon.spy();
				controllerViewFactory({
					stores: {
						listenTo: [ "fakeStore", "fakeStore2" ],
						onChange: onChange
					}
				});
			});
			it("Should invoke onChange once after both stores have updated", function () {
				creator.dispatchAction( "doYourControllerViewThing" );
				onChange.calledOnce.should.be.true;
			});
			it("Should invoke onChange if only one store is affected by an action", function () {
				creator.dispatchAction( "doYourFakeStoreThing" );
				onChange.calledOnce.should.be.true;
			});
			it("Should not invoke onChange if neither store changed", function () {
				creator.dispatchAction( "dontChange" );
				onChange.calledOnce.should.be.false;
			});
		});
	});
});
