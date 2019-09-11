const stubCallback = function() {
	this.__lux = { cleanup: [] };
	return {};
};

describe( "luxJS - Mixins", function() {
	let store, creator;

	before( function() {
		creator = lux.actionCreator( {} );
	} );
	function storeFactory( options ) {
		options = Object.assign( {
			handlers: {
				one() {}
			}
		}, options || {} );
		store = new lux.Store( options );
	}
	afterEach( function() {
		if ( store ) {
			store.dispose();
			store = undefined;
		}
	} );
	describe( "When calling lux.mixin with no mixins specified", function() {
		it( "Should mixin both luxStoreMixin and luxActionCreatorMixin", sinon.test( function() {
			const adStub = this.stub( lux.mixin.actionCreator, "setup", stubCallback );
			const storeStub = this.stub( lux.mixin.store, "setup", stubCallback );
			lux.mixin( {} );

			adStub.should.be.calledOnce();
			storeStub.should.be.calledOnce();
		} ) );
		it( "Should add a luxCleanup method", function() {
			const obj = {
				stores: {
					listenTo: [ "fakeStore" ],
					onChange() {}
				}
			};
			lux.mixin( obj );
			obj.should.contain.key( "luxCleanup" );
			obj.luxCleanup.should.be.an.instanceOf( Function );
		} );
		it( "Calling luxCleanup should remove subscriptions", function() {
			storeFactory( { namespace: "mixinStore" } );
			const onChange = sinon.spy();
			const obj = {
				stores: {
					listenTo: "mixinStore",
					onChange
				}
			};
			lux.mixin( obj );

			creator.dispatch( "one" );
			onChange.should.be.calledOnce();

			obj.luxCleanup();

			creator.dispatch( "one" );
			onChange.should.be.calledOnce();
		} );
	} );
	describe( "When using the Store Mixin", function() {
		describe( "When using with lux.mixin", function() {
			it( "Should support either a single string or array for listenTo", function() {
				storeFactory( { namespace: "listenToStore" } );
				const onChangeOne = sinon.spy();
				const onChangeTwo = sinon.spy();
				const objOne = {
					stores: {
						listenTo: "listenToStore",
						onChange: onChangeOne
					}
				};
				const objTwo = {
					stores: {
						listenTo: [ "listenToStore" ],
						onChange: onChangeTwo
					}
				};

				lux.mixin( objOne, lux.mixin.store );
				lux.mixin( objTwo, lux.mixin.store );
				creator.dispatch( "one" );
				onChangeOne.should.be.calledOnce();
				onChangeTwo.should.be.calledOnce();
			} );
			it( "Should throw an error when no change handler is provided", function() {
				const objOne = {
					stores: {
						listenTo: "listenToStore"
					}
				};
				( function initializeMixinWithoutOnChange() {
					lux.mixin( objOne );
				} ).should.throw( /no onChange handler/ );
			} );
			it( "Should throw an error if no store namespaces are listed", function() {
				const objOne = {
					stores: {
						listenTo: [],
						onChange: sinon.stub()
					}
				};
				( function initializeMixinWithoutStoresInListenTo() {
					lux.mixin( objOne );
				} ).should.throw( /listenTo must contain at least one store namespace/ );
			} );
			it( "Should throw an error when no stores property is provided", function() {
				( function initializeMixinWithoutOnChange() {
					lux.mixin( {} );
				} ).should.throw( /Your component must provide a "stores" key/ );
			} );
			it( "Should call onChange when a store is changed", function() {
				storeFactory( { namespace: "shouldChange" } );
				const onChange = sinon.spy();
				const obj = {
					stores: {
						listenTo: "shouldChange",
						onChange
					}
				};

				lux.mixin( obj, lux.mixin.store );
				creator.dispatch( "one" );
				onChange.should.be.calledOnce();
			} );
			it( "Should wait for all stores to update before calling the onChange", function() {
				const onActionOne = sinon.spy();
				const storeOne = new lux.Store( {
					namespace: "waitAll",
					handlers: {
						doAction: {
							handler: onActionOne
						}
					}
				} );

				const onActionTwo = sinon.spy();
				const storeTwo = new lux.Store( {
					namespace: "waitExtra",
					handlers: {
						doAction: {
							waitFor: [ "waitAll" ],
							handler: onActionTwo
						}
					}
				} );

				const onChange = sinon.spy();
				const obj = {
					stores: {
						listenTo: [ "waitAll", "waitExtra" ],
						onChange() {
							onActionOne.should.be.calledOnce();
							onActionTwo.should.be.calledOnce();
							onChange();
						}
					}
				};

				lux.mixin( obj, lux.mixin.store );

				creator.dispatch( "doAction" );
				onChange.should.be.calledOnce();

				storeOne.dispose();
				storeTwo.dispose();
			} );
			it( "Should cleanup when teardown is called", function() {
				storeFactory( { namespace: "teardownStore" } );
				const onChange = sinon.spy();
				const obj = {
					stores: {
						listenTo: [ "teardownStore" ],
						onChange
					}
				};
				lux.mixin( obj, lux.mixin.store );

				creator.dispatch( "one" );
				onChange.should.be.calledOnce();

				obj.luxCleanup();

				creator.dispatch( "one" );
				onChange.should.be.calledOnce();
			} );
		} );

		describe( "When using the React mixin", function() {
			let mocked;
			function controllerViewFactory( options ) {
				const Component = createReactClass( Object.assign( {
					mixins: [ lux.reactMixin.store ],
					stores: {
						listenTo: [ "fakeStore" ],
						onChange() {}
					},
					render() {
						return React.createElement( "div" );
					}
				}, options ) );
				mocked = utils.renderIntoDocument( React.createElement( Component ) );
			}

			it( "Should initialize during componentWillMount", function() {
				controllerViewFactory( {
					componentWillMount() {
						this.should.contain.key( "__lux" );

						// Since there is no public API for this mixin, we have to detect
						// an internal change only this component would add
						this.__lux.should.contain.all.keys( "waitFor", "heardFrom" );
					}
				} );
			} );
			it( "Should cleanup during componentWillUnmount", function() {
				controllerViewFactory( {
					componentWillUnmount() {
						this.__lux.subscriptions.prenotify.inactive.should.be.true();
					}
				} );

				ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( mocked ).parentNode );
			} );
		} );
	} );
	describe( "When Using the Creator Mixin", function() {
		describe( "When using with lux.mixin", function() {
			it( "Should look at getActions and create methods for each action", function() {
				lux.customActionCreator( {
					action1() {},
					action2() {}
				} );

				const obj = {
					getActions: [ "action1", "action2" ]
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.contain.all.keys( "action1", "action2" );
			} );

			it( "Should look at getActions and create methods for each action, even if the action does not exist yet", function() {
				lux.customActionCreator( {
					action1() {}
				} );

				const obj = {
					getActions: [ "action1", "action2" ]
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.contain.all.keys( "action1", "action2" );
			} );

			it( "Should support using a string or array for getActions", function() {
				lux.customActionCreator( {
					action1() {},
					action2() {}
				} );

				const objOne = {
					getActions: "action1"
				};

				const objTwo = {
					getActions: [ "action1", "action2" ]
				};

				lux.mixin( objOne, lux.mixin.actionCreator );
				lux.mixin( objTwo, lux.mixin.actionCreator );

				objOne.should.contain.key( "action1" );
				objTwo.should.contain.all.keys( "action1", "action2" );
			} );
			it( "Should throw an error when using an action that does not exist", function() {
				const obj = {
					getActions: "doesNotExist"
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.contain.key( "doesNotExist" );

				obj.doesNotExist.should.throw( /there is no action/i );
			} );

			it( "Should add a dispatch method", function() {
				lux.customActionCreator( {
					toPublish() {}
				} );

				const obj = {
					getActions: "toPublish"
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				obj.should.contain.key( "dispatch" );
			} );
			it( "Should publish a correctly formed action when dispatch is called", function() {
				lux.customActionCreator( {
					publishTest() {}
				} );

				const obj = {
					getActions: "publishTest"
				};

				lux.mixin( obj, lux.mixin.actionCreator );

				postal.subscribe( {
					channel: "lux.action",
					topic: "execute.publishText",
					callback( data ) {
						data.should.eql( {
							actionName: "publishText",
							actionArgs: []
						} );
					}
				} );

				obj.dispatch( "publishTest" );
			} );
		} );

		describe( "When using the React mixin", function() {
			it( "Should initialize during componentWillMount", function() {
				lux.customActionCreator( {
					sample() {}
				} );
				const Component = createReactClass( {
					mixins: [ lux.reactMixin.actionCreator ],
					getActions: "sample",
					componentWillMount() {
						this.should.contain.all.keys( "dispatch", "sample" );
					},
					render() {
						return React.createElement( "div" );
					}
				} );
				utils.renderIntoDocument( React.createElement( Component ) );
			} );
		} );
	} );
	describe( "When Using the Listener Mixin", function() {
		describe( "When using with lux.mixin", function() {
			it( "Should look for handlers on the source object", function() {
				const obj = {};
				( function() {
					lux.mixin( obj, lux.mixin.actionListener );
				} ).should.throw( /at least one action/ );
			} );
			it( "Should call the appropriate handler when the topic is published", function() {
				const handler = sinon.spy();
				const obj = {
					handlers: {
						fireMyHandler: handler
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				const creatr = lux.actionCreator( {} );
				creatr.dispatch( "fireMyHandler", "testy" );
				handler.should.be.calledOnce();
				handler.should.be.calledWith( "testy" );
			} );
			it( "Should auto-generate action creator methods", function() {
				const handler = sinon.spy();
				const obj = {
					handlers: {
						fireMyHandler: handler
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				// This will throw an error if the action isn't found
				const creatr = lux.actionCreator( {
					getActions: "fireMyHandler"
				} );
				creatr.fireMyHandler();
			} );
			it( "Should auto-generate action group if a namespace is provided", function() {
				const handler = sinon.spy();
				const obj = {
					namespace: "nameynamename",
					handlers: {
						fireMyHandler: handler
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				// This will throw an error if the action isn't found
				const creatr = lux.actionCreator( {
					getActionGroup: [ "nameynamename" ]
				} );
				creatr.fireMyHandler();
			} );
			it( "Should cleanup when teardown is called", function() {
				const obj = {
					handlers: {
						fireMyHandler() {}
					}
				};
				lux.mixin( obj, lux.mixin.actionListener );
				obj.luxCleanup();
				obj.__lux.subscriptions.actionListener.inactive.should.be.true();
			} );
			it( "Should throw an error if the target isn't passed as first arg", function() {
				const obj = {
					getActionGroup: [ "grouped" ]
				};

				( function() {
					lux.mixin( lux.mixin.actionListener, obj );
				} ).should.throw( /Lux mixins should have a setup method/i );
			} );
		} );
	} );
} );
