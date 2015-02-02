/* global describe, it, before, afterEach, lux, utils, luxStoreCh, sinon, postal */

describe( "luxJS - Store", function() {
	var store;
	function storeFactory( options, m1, m2, m3, m4, m5, m6, m7 ) {
		options = Object.assign( {
			namespace: "storeOne",
			handlers: {
				one: function() {}
			}
		}, options || {} );
		store = new lux.Store( options, m1, m2, m3, m4, m5, m6, m7 );
	}
	afterEach( function() {
		if ( store ) {
			store.dispose();
			store = undefined;
		}
	} );
	describe( "When creating a Store", function() {
		describe( "When validating options", function() {
			it( "Should throw an error if the namespace is already used", function() {
				storeFactory();
				( function() {
					var secondStore = new lux.Store( {
						namespace: "storeOne",
						handlers: {
							one: function() {}
						}
					} );
				} ).should.throw( /already exists/ );
			} );
			it( "Should throw an error if the namespace is not provided", function() {
				( function() {
					var tmpStore = new lux.Store( {
						handlers: {
							one: function() {}
						}
					} );
				} ).should.throw( /must have a namespace/ );
			} );
			it( "Should throw an error if there are no action handlers", function() {
				( function() {
					var tmpStore = new lux.Store( {
						namespace: "storeOne"
					} );
				} ).should.throw( /must have action/ );

				( function() {
					var tmpStore = new lux.Store( {
						namespace: "storeOne",
						handlers: []
					} );
				} ).should.throw( /must have action/ );
			} );
		} );
		describe( "When initializing", function() {
			it( "Should use state passed into the constructor as initial state", function() {
				storeFactory( {
					state: { something: true }
				} );

				store.getState().should.eql( { something: true } );
			} );
			it( "Should pass along any extra property or method names to the new object", function() {
				storeFactory( {
					getSomethingCool: function() {
						return true;
					}
				} );

				store.should.have.property( "getSomethingCool" ).which.is.a.Function;
				store.getSomethingCool().should.be.true;
			} );
			it( "Should make action creator methods for each handler", function() {
				storeFactory( {
					handlers: {
						one: function() {},
						two: function() {},
					}
				} );
				var creator = lux.actionCreator( {
					getActions: [ "one", "two" ]
				} );

				creator.should.have.property( "one" ).which.is.a.Function;
				creator.should.have.property( "two" ).which.is.a.Function;
			} );
			it( "Should create an action group for all handlers", function() {
				storeFactory( {
					handlers: {
						one: function() {},
						two: function() {},
					}
				} );
				var creator = lux.actionCreator( {
					getActionGroup: [ "storeOne" ]
				} );

				creator.should.have.property( "one" ).which.is.a.Function;
				creator.should.have.property( "two" ).which.is.a.Function;
			} );
			it( "Should remove action handlers from public object", function() {
				storeFactory();
				store.should.not.have.property( "handlers" );
			} );
			it( "Should remove direct access to state", function() {
				storeFactory();
				store.should.not.have.property( "state" );
			} );
		} );
		describe( "When initializing with multiple mixins", function() {
			it( "Should blend state passed into intial state", function() {
				storeFactory(
					{ state: { something: true } },
					{ state: { anotherThing: "yep" } },
					{ state: { nested: { doc: "Great Scot!" } } },
					{ state: { nested: { marty: "It's Heavy." } } }
				);
				store.getState().should.eql( {
					something: true,
					anotherThing: "yep",
					nested: {
						doc: "Great Scot!",
						marty: "It's Heavy."
					}
				} );
			} );
			it( "Should blend any extra props or methods onto the store instance", function() {
				storeFactory(
					{
						getSomethingCool: function() {
							return true;
						}
					},
					{
						getSomethingEvenCooler: function() {
							return "Truer than true";
						}
					}
				);

				store.should.have.property( "getSomethingCool" ).which.is.a.Function;
				store.should.have.property( "getSomethingEvenCooler" ).which.is.a.Function;
				store.getSomethingCool().should.be.true;
				store.getSomethingEvenCooler().should.equal( "Truer than true" );
			} );
			it( "Should create an action group for all handlers", function() {
				storeFactory(
					{
						handlers: {
							one: function() {},
							two: function() {},
						}
					},
					{
						handlers: {
							three: function() {},
							four: function() {},
						}
					}
				);
				var creator = lux.actionCreator( {
					getActionGroup: [ "storeOne" ]
				} );

				creator.should.have.property( "one" ).which.is.a.Function;
				creator.should.have.property( "two" ).which.is.a.Function;
				creator.should.have.property( "three" ).which.is.a.Function;
				creator.should.have.property( "four" ).which.is.a.Function;
			} );
			it( "Should allow for same-named handlers from multiple mixins", function() {
				var backInTimeInvocations = 0;
				var forwardInTimeInvocations = 0;
				var feedMrFusionInvocations = 0;

				storeFactory(
					{
						namespace: "multiplicity",
						handlers: {
							backInTime: function() {
								backInTimeInvocations++;
							},
							feedMrFusion: function() {
								feedMrFusionInvocations++;
							}
						}
					},
					{
						handlers: {
							backInTime: function() {
								backInTimeInvocations++;
							},
							forwardInTime: function() {
								forwardInTimeInvocations++;
							}
						}
					},
					{
						handlers: {
							backInTime: function() {
								backInTimeInvocations++;
							},
							forwardInTime: function() {
								forwardInTimeInvocations++;
							}
						}
					}
				);
				var creator = lux.actionCreator( {
					getActionGroup: [ "multiplicity" ]
				} );
				creator.backInTime();
				creator.forwardInTime();
				creator.feedMrFusion();
				backInTimeInvocations.should.equal( 3 );
				forwardInTimeInvocations.should.equal( 2 );
				feedMrFusionInvocations.should.equal( 1 );
			} );
			it( "Should support store dependency ordering with mixin handler collision", function() {
				var invocations = [];

				storeFactory( {
					namespace: "mefirst",
					handlers: {
						backInTime: {
							handler: function() {
								invocations.push( "mefirst" );
							}
						}
					}
				} );

				storeFactory( {
					namespace: "mesecond",
					handlers: {
						backInTime: {
							handler: function() {
								invocations.push( "mesecond-mixin1" );
							}
						}
					}
				}, {
						handlers: {
							backInTime: {
								waitFor: [ "mefirst" ],
								handler: function() {
									invocations.push( "mesecond-mixin2" );
								}
							}
						}
					} );

				storeFactory(
					{
						namespace: "multiplicity",
						handlers: {
							backInTime: {
								waitFor: [ "mefirst" ],
								handler: function() {
									invocations.push( "multiplicity-mixin1" );
								}
							}
						}
					},
					{
						handlers: {
							backInTime: {
								waitFor: [ "mesecond" ],
								handler: function() {
									invocations.push( "multiplicity-mixin2" );
								}
							}
						}
					},
					{
						handlers: {
							backInTime: function() {
								invocations.push( "multiplicity-mixin3" );
							}
						}
					}
				);


				var creator = lux.actionCreator( {
					getActionGroup: [ "multiplicity" ]
				} );
				creator.backInTime();
				invocations.should.eql( [
					"mefirst",
					"mesecond-mixin1",
					"mesecond-mixin2",
					"multiplicity-mixin1",
					"multiplicity-mixin2",
					"multiplicity-mixin3"
				] );
			} );
		} );
		describe( "When using extend to create an extended constructor function", function(){
			it( "Should properly handle one level of inheritance", function() {
				var handlerInvoked = false;
				var MyStore = lux.Store.extend({
					state: {
						dontblink: true,
						angelsHavePhonebox: true
					},
					handlers: {
						angelicTouch: function() {
							handlerInvoked = true;
						}
					},
					someCustomAccessor: function() {
						return this.getState().angelsHavePhonebox;
					}
				});
				var store = new MyStore({ namespace: "levelone" });
				store.namespace.should.equal("levelone");
				store.getState().should.eql({
					dontblink: true,
					angelsHavePhonebox: true
				});
				store.someCustomAccessor().should.be.ok;
				var creator = lux.actionCreator( {
					getActionGroup: [ "levelone" ]
				} );

				creator.angelicTouch();
				handlerInvoked.should.be.true;
			} );
			it( "Should properly handle more than one level of inheritance", function() {
				var angelicTouchInvoked = false;
				var listenToEasterEggsInvoked = false;
				var keyInTardisInvoked = false;
				var GrandparentStore = lux.Store.extend({
					state: {
						dontblink: true,
						angelsHavePhonebox: true
					},
					handlers: {
						angelicTouch: function() {
							angelicTouchInvoked = true;
						}
					},
					someCustomAccessor: function() {
						return this.getState().angelsHavePhonebox;
					}
				});
				var ParentStore = GrandparentStore.extend({
					state: {
						doctor: "wibbly-wobbly timey-wimey"
					},
					handlers: {
						listenToEasterEggs: function() {
							listenToEasterEggsInvoked = true;
						}
					},
					someOtherAccessor: function() {
						return this.getState().doctor;
					}
				});
				var ChildStore = ParentStore.extend({
					state: {
						author: "Moffat"
					},
					handlers: {
						keyInTardis: function() {
							keyInTardisInvoked = true;
						}
					},
					andYetAnotherAccessor: function() {
						return this.getState().author;
					}
				});
				var store = new ChildStore( { namespace: "weepingangels" } );
				store.namespace.should.equal( "weepingangels" );
				store.getState().should.eql({
					dontblink: true,
					angelsHavePhonebox: true,
					doctor: "wibbly-wobbly timey-wimey",
					author: "Moffat"
				});
				store.someCustomAccessor().should.be.ok;
				store.someOtherAccessor().should.equal( "wibbly-wobbly timey-wimey" );
				store.andYetAnotherAccessor().should.equal( "Moffat" );
				var creator = lux.actionCreator( {
					getActionGroup: [ "weepingangels" ]
				} );

				creator.angelicTouch();
				creator.listenToEasterEggs();
				creator.keyInTardis();
				angelicTouchInvoked.should.be.true;
				listenToEasterEggsInvoked.should.be.true;
				keyInTardisInvoked.should.be.true;
			} );
			it( "Should not mutate original mixins as part of store construction", function() {
				var handlerInvoked = false;
				var mixin = {
					state: {
						danglingMixin: true
					},
					handlers: {
						justStopIt: function() {
							hanlderInvoked = true;
						}
					}
				};
				var storeA = new lux.Store({ namespace: "yep" }, mixin);
				var storeB = new lux.Store({}, mixin, { namespace: "WAT" });
				storeB.getState().should.eql({
					danglingMixin: true
				});

				storeA.dispose();
				storeB.dispose();
			} );
			it( "Should be able to create, dispose and re-create a store", function() {
				var mixin = {
					state: {
						danglingMixin: true
					},
					handlers: {
						justStopIt: function() {
							hanlderInvoked = true;
						}
					}
				};
				var Store = lux.Store.extend({ namespace: "wat" }, mixin);
				var store = new Store();
				store.dispose();
				store = new Store();
				store.getState().should.eql({
					danglingMixin: true
				});
				store.dispose();

			});
		} );
	} );
	describe( "When using a Store", function() {
		it( "Should only allow setState while handling an action", function() {
			storeFactory( {
				state: {
					flag: false
				},
				handlers: {
					anAction: function() {
						this.setState( { flag: true } );
					}
				}
			} );

			( function() {
				store.setState( { flag: true } );
			} ).should.throw( /during a dispatch cycle/ );

			var creator = lux.actionCreator( {
				getActions: [ "anAction" ]
			} );

			store.getState().flag.should.be.false;

			creator.anAction();

			store.getState().flag.should.be.true;
		} );
		it( "Should wait for other stores to update before dependent action is handled", function() {
			var storeOne = sinon.spy();
			var storeTwo = sinon.spy();
			var otherStore = new lux.Store( {
				namespace: "store2",
				handlers: {
					myTest: {
						waitFor: [ "storeOne" ],
						handler: function() {
							storeOne.calledOnce.should.be.true;
							storeTwo();
						}
					}
				}
			} );

			storeFactory( {
				handlers: {
					myTest: storeOne
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest();
			storeOne.calledOnce.should.be.true;
			storeTwo.calledOnce.should.be.true;
		} );
		it( "Should assume there were changes unless a handler explicitly returns `false`", function() {
			storeFactory( {
				handlers: {
					change: function() {
						this.setState( { newVal: true } );
					},
					inferredChange: function() {},
					noChange: function() {
						return false
						}
						}
					} );
				var onChange = sinon.spy();
				var listener = {
					stores: {
						listenTo: "storeOne",
						onChange: onChange
						}
					};
				lux.mixin( listener, lux.mixin.store );
				var creator = lux.actionCreator( {
					getActions: [ "change", "inferredChange", "noChange" ]
				} );

				creator.change();
				onChange.callCount.should.equal( 1 );
				creator.inferredChange();
				onChange.callCount.should.equal( 2 );
				creator.noChange();
				onChange.callCount.should.equal( 2 );

			} );
			it( "Should publish a 'changed' message when flush is called and there are changes", function() {
				var handler = sinon.spy();
				postal.subscribe( {
					channel: "lux.store",
					topic: "storeOne.changed",
					callback: handler
				} ).once();

				storeFactory();
				var creator = lux.actionCreator( {
					getActions: [ "one" ]
				} );
				creator.one();
				handler.calledOnce.should.be.true;
			} );
		} );
		describe( "When removing a Store", function() {
			it( "Should remove all subscriptions", function() {
				storeFactory();
				postal.subscriptions[ 'lux.store' ].should.have.property( "storeOne.changed" );
				store.dispose();
				store = undefined;
			} );
			it( "Should remove the namespace from the stores cache", function() {
				storeFactory();
				store.dispose();
				store = undefined;
				// Since actual namespaces are in a hidden variable, we simply try to create a new one
				storeFactory();
				// It will throw an error if still defined as a namespace (Unit test for throwing the error is above)
			} );
			it( "Should remove the store from the Dispatcher action map", function() {
				var storeIsInActionMap = function() {
					var actionMap = lux.dispatcher.actionMap;
					var isPresent = false;
					for (var action in actionMap) {
						if ( actionMap[ action ].filter( function( x ) {
									return x.namespace === "storeOne";
								} ).length ) {
							isPresent = true;
							break;
							}
						}
					return isPresent;
				}
				storeFactory();
				storeIsInActionMap().should.be.true;
				store.dispose();
				store = undefined;
				storeIsInActionMap().should.be.false;
			} );
		} );
	} );
