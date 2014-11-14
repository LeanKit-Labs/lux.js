/* global describe, it, before, beforeEach, afterEach, React, sinon, postal, lux, utils, luxStoreCh */

var stubCallback = function () {
	this.__lux = { cleanup: [] };
	return {};
};

describe( "luxJS - Mixins", function() {
	var store, creator;

	before( function () {
		creator = lux.actionCreator({});
	});
	function storeFactory( options ) {
		options = Object.assign({
			handlers: {
				one: function () {}
			}
		}, options || {} );
		store = new lux.Store( options );
	}
	afterEach( function (){
		if ( store ) {
			store.dispose();
			store = undefined;
		}
	});
	describe( "When calling lux.mixin with no mixins specified", function() {
		it( "Should mixin both luxStoreMixin and luxActionCreatorMixin", sinon.test(function () {
			var adStub = this.stub( lux.mixin.actionCreator, "setup", stubCallback );
			var storeStub = this.stub( lux.mixin.store, "setup", stubCallback );
			var obj = lux.mixin({});

			adStub.calledOnce.should.be.true;
			storeStub.calledOnce.should.be.true;
		} ) );
		it( "Should add a luxCleanup method", function () {
			var obj = {
				stores: {
					listenTo: [],
					onChange: function () {}
				}
			};
			lux.mixin(obj);
			obj.should.have.property( "luxCleanup" ).which.is.a.Function;
		});
		it( "Calling luxCleanup should remove subscriptions", function () {
			storeFactory({ namespace: "mixinStore" });
			var onChange = sinon.spy();
			var obj = {
				stores: {
					listenTo: "mixinStore",
					onChange: onChange
				}
			};
			lux.mixin(obj);

			creator.publishAction( "one" );
			onChange.callCount.should.equal(1);

			obj.luxCleanup();

			creator.publishAction( "one" );
			onChange.callCount.should.equal(1);

		});
	});
	describe( "When using the Store Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should support either a single string or array for listenTo", function () {
				storeFactory({ namespace: "listenToStore" });
				var onChangeOne = sinon.spy();
				var onChangeTwo = sinon.spy();
				var objOne = {
					stores: {
						listenTo: "listenToStore",
						onChange: onChangeOne
					}
				};
				var objTwo = {
					stores: {
						listenTo: [ "listenToStore" ],
						onChange: onChangeTwo
					}
				};

				lux.mixin(objOne, lux.mixin.store);
				lux.mixin(objTwo, lux.mixin.store);
				creator.publishAction( "one" );
				onChangeOne.calledOnce.should.be.true;
				onChangeTwo.calledOnce.should.be.true;
			} );
			it( "Should throw an error when no change handler is provided", function () {
				var objOne = {
					stores: {
						listenTo: "listenToStore"
					}
				};
				(function initializeMixinWithoutOnChange() {
					lux.mixin(objOne);
				}).should.throw( /no onChange handler/);
			});
			it( "Should call onChange when a store is changed", function () {
				storeFactory({ namespace: "shouldChange" })
				var onChange = sinon.spy();
				var obj = {
					stores: {
						listenTo: "shouldChange",
						onChange: onChange
					}
				};

				lux.mixin(obj, lux.mixin.store);
				creator.publishAction( "one" );
				onChange.calledOnce.should.be.true;
			});
			it( "Should wait for all stores to update before calling the onChange", function () {

				var onActionOne = sinon.spy();
				var storeOne = new lux.Store({
					namespace: "waitAll",
					handlers: {
						doAction: {
							handler: onActionOne
						}
					}
				});

				var onActionTwo = sinon.spy();
				var storeTwo = new lux.Store({
					namespace: "waitExtra",
					handlers: {
						doAction: {
							waitFor: [ "waitAll" ],
							handler: onActionTwo
						}
					}
				});

				var onChange = sinon.spy();
				var obj = {
					stores: {
						listenTo: [ "waitAll", "waitExtra" ],
						onChange: function () {
							onActionOne.calledOnce.should.be.true;
							onActionTwo.calledOnce.should.be.true;
							onChange();
						}
					}
				};

				lux.mixin(obj, lux.mixin.store);

				creator.publishAction( "doAction" );
				onChange.calledOnce.should.be.true;

				storeOne.dispose();
				storeTwo.dispose();

			});
			it( "Should cleanup when teardown is called", function () {
				storeFactory({ namespace: "teardownStore" })
				var onChange = sinon.spy();
				var obj = {
					stores: {
						listenTo: [ "teardownStore" ],
						onChange: onChange
					}
				};
				lux.mixin(obj, lux.mixin.store);

				creator.publishAction( "one" );
				onChange.callCount.should.equal( 1 );

				obj.luxCleanup();

				creator.publishAction( "one" );
				onChange.callCount.should.equal( 1 );
			});
		});

		describe( "When using the React mixin", function () {
			var mocked;
			function controllerViewFactory ( options ) {
				var Component = lux.controllerView(Object.assign({
					stores: {
						listenTo: [],
						onChange: function () {}
					},
					render: function () {
						return React.DOM.div();
					}
				}, options ));
				mocked = utils.renderIntoDocument( React.createElement( Component ) );
			}

			it( "Should initialize during componentWillMount", function () {
				controllerViewFactory({
					componentWillMount: function () {
						this.should.have.property( "__lux" );

						// Since there is no public API for this mixin, we have to detect
						// an internal change only this component would add
						this.__lux.should.have.properties( "waitFor", "heardFrom" );
					}
				});
			});
			it( "Should cleanup during componentWillUnmount", function () {
				controllerViewFactory({
					componentWillUnmount: function () {
						this.__lux.subscriptions.prenotify.inactive.should.be.true;
					}
				});

				React.unmountComponentAtNode( mocked.getDOMNode().parentNode );
			});
		});
	});
	describe( "When Using the Creator Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should look at getActionGroup and create methods for each action in the group", function () {
				lux.customActionCreator({
					group1: function (){},
					group2: function (){}
				});
				lux.addToActionGroup( "grouped", [ "group1", "group2" ]);

				var obj = {
					getActionGroup: [ "grouped" ]
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.have.property( "group1" ).which.is.a.Function;
				obj.should.have.property( "group2" ).which.is.a.Function;
			});
			it( "Should support using a string or array for getActionGroup", function () {
				lux.customActionCreator({
					group1: function (){},
					group2: function (){}
				});
				lux.addToActionGroup( "grouped", [ "group1", "group2" ]);

				var objOne = {
					getActionGroup: "grouped"
				};

				var objTwo = {
					getActionGroup: [ "grouped" ]
				};

				lux.mixin( objOne, lux.mixin.actionCreator );
				lux.mixin( objTwo, lux.mixin.actionCreator );

				objOne.should.have.properties( "group1", "group2" );
				objTwo.should.have.properties( "group1", "group2" );
			});
			it( "Should look at getActions and create methods for each action", function () {
				lux.customActionCreator({
					action1: function (){},
					action2: function (){}
				});

				var obj = {
					getActions: [ "action1", "action2" ]
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.have.properties( "action1", "action2" );
			});

			it( "Should support using a string or array for getActions", function () {
				lux.customActionCreator({
					action1: function (){},
					action2: function (){}
				});

				var objOne = {
					getActions: "action1"
				};

				var objTwo = {
					getActions: [ "action1", "action2" ]
				};

				lux.mixin( objOne, lux.mixin.actionCreator );
				lux.mixin( objTwo, lux.mixin.actionCreator );

				objOne.should.have.property( "action1" );
				objTwo.should.have.properties( "action1", "action2" );
			});

			it( "Should throw an error when requested a group that does not exist", function () {
				var obj = {
					getActionGroup: "doesNotExist"
				};

				(function () {
					lux.mixin( obj, lux.mixin.actionCreator );
				}).should.throw(/there is no action group/i);
			});
			it( "Should throw an error when requested an action that does not exist", function () {
				var obj = {
					getActions: "doesNotExist"
				};

				(function () {
					lux.mixin( obj, lux.mixin.actionCreator );
				}).should.throw(/there is no action/i);
			});

			it( "Should add a publishAction method", function () {
				lux.customActionCreator({
					toPublish: function (){},
				});

				var obj = {
					getActions: "toPublish"
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.have.property( "publishAction" );
			});
			it( "Should publish a correctly formed action when publishAction is called", function () {
				lux.customActionCreator({
					publishTest: function (){},
				});

				var obj = {
					getActions: "publishTest"
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				postal.subscribe({
					channel: "lux.action",
					topic: "execute.publishText",
					callback: function ( data ) {
						data.should.eql({
							actionName: "publishText",
							actionArgs: []
						});
					}
				});

				obj.publishAction( "publishTest" );
			});
		});

		describe( "When using the React mixin", function () {
			it( "Should initialize during componentWillMount", function () {
				var mocked;
				lux.customActionCreator({
					sample: function () {}
				});
				var Component = lux.component({
					getActions: "sample",
					componentWillMount: function () {
						this.should.have.property( "publishAction" );
						this.should.have.property( "sample" );
					},
					render: function () {
						return React.DOM.div();
					}
				});
				mocked = utils.renderIntoDocument( React.createElement( Component ) );
			});
		});
	});
	describe( "When Using the Listener Mixin", function() {
		describe( "When using with lux.mixin", function () {
			it( "Should look for handlers on the source object", function () {
				var obj = {};
				(function(){
					lux.mixin( obj, lux.mixin.actionListener );
				}).should.throw( /at least one action/ );
			} );
			it( "Should call the appropriate handler when the topic is published", function () {
				var handler = sinon.spy();
				var obj = {
					handlers: {
						fireMyHandler: handler
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				var creator = lux.actionCreator({});
				creator.publishAction( "fireMyHandler", "testy" );
				handler.calledOnce.should.be.true;
				handler.calledWith( "testy" ).should.be.true;
			});
			it( "Should auto-generate action creator methods", function () {
				var handler = sinon.spy();
				var obj = {
					handlers: {
						fireMyHandler: handler
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				// This will throw an error if the action isn't found
				var creator = lux.actionCreator({
					getActions: "fireMyHandler"
				});
				creator.fireMyHandler();
			});
			it( "Should cleanup when teardown is called", function () {
				var obj = {
					handlers: {
						fireMyHandler: function (){}
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				obj.luxCleanup();
				obj.__lux.subscriptions.actionListener.inactive.should.be.true;
			});
		});
	});
});
