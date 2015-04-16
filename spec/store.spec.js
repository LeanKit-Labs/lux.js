describe( "luxJS - Store", function() {
	function storeFactory( options, m1, m2, m3, m4, m5, m6, m7 ) {
		options = Object.assign( {
			namespace: "storeOne",
			handlers: {
				one: function() {}
			}
		}, options || {} );
		return new lux.Store( options, m1, m2, m3, m4, m5, m6, m7 );
	}
	describe( "When creating a Store", function() {
		describe( "When validating options", function() {
			it( "Should throw an error if the namespace is already used", function() {
				var store = storeFactory();
				var secondStore;
				( function() {
					secondStore = new lux.Store( {
						namespace: "storeOne",
						handlers: {
							one: function() {}
						}
					} );
				} ).should.throw( /already exists/ );
				store.dispose();
				if ( secondStore && secondStore.dispose ) {
					secondStore.dispose();
				}
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
				var tmpStore;
				( function() {
					tmpStore = new lux.Store( {
						namespace: "storeOne"
					} );
				} ).should.throw( /must have action/ );

				( function() {
					tmpStore = new lux.Store( {
						namespace: "storeOne",
						handlers: []
					} );
				} ).should.throw( /must have action/ );
				if ( tmpStore && tmpStore.dispose ) {
					tmpStore.dispose();
				}
			} );
		} );
		describe( "When initializing", function() {
			it( "Should use state passed into the constructor as initial state", function() {
				var store = storeFactory( {
					state: { something: true }
				} );

				store.getState().should.eql( { something: true } );
				store.dispose();
			} );
			it( "Should pass along any extra property or method names to the new object", function() {
				var store = storeFactory( {
					getSomethingCool: function() {
						return true;
					}
				} );

				store.should.have.property( "getSomethingCool" );
				store.getSomethingCool.should.be.an.instanceOf( Function );
				store.getSomethingCool().should.be.true;
				store.dispose();
			} );
			it( "Should make action creator methods for each handler", function() {
				var store = storeFactory( {
					handlers: {
						one: function() {},
						two: function() {},
					}
				} );
				var creator = lux.actionCreator( {
					getActions: [ "one", "two" ]
				} );

				creator.should.have.property( "one" );
				creator.one.should.be.an.instanceOf( Function );
				creator.should.have.property( "two" );
				creator.two.should.be.an.instanceOf( Function );
				store.dispose();
			} );
			it( "Should create an action group for all handlers", function() {
				var store = storeFactory( {
					handlers: {
						one: function() {},
						two: function() {},
					}
				} );
				var creator = lux.actionCreator( {
					getActionGroup: [ "storeOne" ]
				} );

				creator.should.have.property( "one" );
				creator.one.should.be.an.instanceOf( Function );
				creator.should.have.property( "two" );
				creator.two.should.be.an.instanceOf( Function );
				store.dispose();
			} );
			it( "Should remove action handlers from public object", function() {
				var store = storeFactory();
				store.should.not.have.property( "handlers" );
				store.dispose();
			} );
			it( "Should remove direct access to state", function() {
				var store = storeFactory();
				store.should.not.have.property( "state" );
				store.dispose();
			} );
		} );
		describe( "When initializing with multiple mixins", function() {
			it( "Should blend state passed into intial state", function() {
				var store = storeFactory(
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
				store.dispose();
			} );
			it( "Should blend any extra props or methods onto the store instance", function() {
				var store = storeFactory(
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

				store.should.contain.key( "getSomethingCool" );
				store.getSomethingCool.should.be.an.instanceOf( Function );
				store.getSomethingCool().should.be.true;

				store.should.contain.key( "getSomethingEvenCooler" );
				store.getSomethingEvenCooler.should.be.an.instanceOf( Function );
				store.getSomethingEvenCooler().should.equal( "Truer than true" );
				store.dispose();
			} );
			it( "Should create an action group for all handlers", function() {
				var store = storeFactory(
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

				creator.should.contain.all.keys( "one", "two", "three", "four" );
				creator.one.should.be.an.instanceOf( Function );
				creator.two.should.be.an.instanceOf( Function );
				creator.three.should.be.an.instanceOf( Function );
				creator.four.should.be.an.instanceOf( Function );
				store.dispose();
			} );
			it( "Should allow for same-named handlers from multiple mixins", function() {
				var backInTimeSpy = sinon.spy();
				var forwardInTimeSpy = sinon.spy();
				var feedMrFusionSpy = sinon.spy();

				var store = storeFactory(
					{
						namespace: "multiplicity",
						handlers: {
							backInTime: backInTimeSpy,
							feedMrFusion: feedMrFusionSpy
						}
					},
					{
						handlers: {
							backInTime: backInTimeSpy,
							forwardInTime: forwardInTimeSpy
						}
					},
					{
						handlers: {
							backInTime: backInTimeSpy,
							forwardInTime: forwardInTimeSpy
						}
					}
				);
				var creator = lux.actionCreator( {
					getActionGroup: [ "multiplicity" ]
				} );
				creator.backInTime();
				creator.forwardInTime();
				creator.feedMrFusion();
				backInTimeSpy.should.be.calledThrice;
				forwardInTimeSpy.should.be.calledTwice;
				feedMrFusionSpy.should.be.calledOnce;
				store.dispose();
			} );
			it( "Should support store dependency ordering with mixin handler collision", function() {
				var invocations = [];

				var store = storeFactory( {
					namespace: "mefirst",
					handlers: {
						backInTime: {
							handler: function() {
								invocations.push( "mefirst" );
							}
						}
					}
				} );

				var store2 = storeFactory( {
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

				var store3 = storeFactory(
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
				store.dispose();
				store2.dispose();
				store3.dispose();
			} );
		} );
		describe( "When using extend to create an extended constructor function", function() {
			it( "Should properly handle one level of inheritance", function() {
				var handlerInvoked = false;
				var MyStore = lux.Store.extend( {
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
				} );
				var store = new MyStore( { namespace: "levelone" } );
				store.namespace.should.equal( "levelone" );
				store.getState().should.eql( {
					dontblink: true,
					angelsHavePhonebox: true
				} );
				store.someCustomAccessor().should.be.ok;
				var creator = lux.actionCreator( {
					getActionGroup: [ "levelone" ]
				} );

				creator.angelicTouch();
				handlerInvoked.should.be.true;
				store.dispose();
			} );
			it( "Should properly handle more than one level of inheritance", function() {
				var angelicTouchInvoked = false;
				var listenToEasterEggsInvoked = false;
				var keyInTardisInvoked = false;
				var GrandparentStore = lux.Store.extend( {
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
				} );
				var ParentStore = GrandparentStore.extend( {
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
				} );
				var ChildStore = ParentStore.extend( {
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
				} );
				var store = new ChildStore( { namespace: "weepingangels" } );
				store.namespace.should.equal( "weepingangels" );
				store.getState().should.eql( {
					dontblink: true,
					angelsHavePhonebox: true,
					doctor: "wibbly-wobbly timey-wimey",
					author: "Moffat"
				} );
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
				store.dispose();
			} );
			it( "Should not mutate original mixins as part of store construction", function() {
				var mixin = {
					state: {
						danglingMixin: true
					},
					handlers: {
						justStopIt: function() {}
					}
				};
				var storeA = storeFactory( {}, mixin );
				var storeB = storeFactory( {}, mixin, { namespace: "WAT" } );

				storeB.getState().should.eql( {
					danglingMixin: true
				} );

				storeA.dispose();
				storeB.dispose();
			} );
			it( "Should be able to create, dispose and re-create a store", function() {
				var mixin = {
					state: {
						danglingMixin: true
					},
					handlers: {
						justStopIt: function() {}
					}
				};
				var Store = lux.Store.extend( { namespace: "wat" }, mixin );
				var store = new Store();
				store.dispose();
				store = new Store();
				store.getState().should.eql( {
					danglingMixin: true
				} );
				store.dispose();

			} );
		} );
	} );
	describe( "When using a Store", function() {
		it( "Should only allow setState while handling an action", function() {
			var store = storeFactory( {
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
			store.dispose();
		} );
		it( "Should only allow replaceState while handling an action", function() {
			var store = storeFactory( {
				state: {},
				handlers: {
					anotherAction: function() {
						this.replaceState( { flag: true } );
					}
				}
			} );

			( function() {
				store.replaceState( { flag: true } );
			} ).should.throw( /during a dispatch cycle/ );

			var creator = lux.actionCreator( {
				getActions: [ "anotherAction" ]
			} );

			store.getState().should.not.have.property( "flag" );

			creator.anotherAction();

			store.getState().flag.should.be.true;
			store.dispose();
		} );
		it( "Should replace state if replaceState is called during an action cycle", function() {
			var store = storeFactory( {
				state: {
					lots: true,
					andLots: 12345,
					ofKeys: "yessir"
				},
				handlers: {
					aReplaceAction: function() {
						this.replaceState( { replaced: true } );
					}
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "aReplaceAction" ]
			} );

			store.getState().should.have.property("lots");
			store.getState().should.have.property("andLots");
			store.getState().should.have.property("ofKeys");

			creator.aReplaceAction();

			store.getState().should.not.have.property("lots");
			store.getState().should.not.have.property("andLots");
			store.getState().should.not.have.property("ofKeys");
			store.getState().replaced.should.be.true;
			store.dispose();
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
							storeOne.should.be.calledOnce;
							storeTwo();
						}
					}
				}
			} );

			var store = storeFactory( {
				handlers: {
					myTest: storeOne
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest();
			storeOne.should.be.calledOnce;
			storeTwo.should.be.calledOnce;
			store.dispose();
			otherStore.dispose();
		} );
		it( "Should warn when an action is dependent on a store that does not participate in that action (or does not exist)", function () {
			sinon.stub( console, "warn" );
			var storeOne = sinon.stub();
			var store = storeFactory( {
				handlers: {
					myTest: {
						waitFor: [ "doesNotExist" ],
						handler: storeOne
					}
				}
			} );

			lux.publishAction( "myTest" );
			storeOne.should.be.calledOnce;

			console.warn.should.be.calledOnce.and.calledWithMatch( /doesNotExist/ );
			console.warn.restore();

			store.dispose();
		} );
		it( "Should throw an error when a direct circular dependency between stores is detected", function() {
			var storeOne = sinon.spy();
			var storeTwo = sinon.spy();

			var circular1 = new lux.Store( {
				namespace: "circular1",
				handlers: {
					myTest: {
						waitFor: [ "circular2" ],
						handler: storeOne
					}
				}
			} );

			var circular2 = new lux.Store( {
				namespace: "circular2",
				handlers: {
					myTest: {
						waitFor: [ "circular1" ],
						handler: storeTwo
					}
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest.should.throw( /circular dependency/i );

			storeOne.should.not.be.called;
			storeTwo.should.not.be.called;
			circular1.dispose();
			circular2.dispose();
		} );
		it( "Should throw an error when a more distant circular dependency between stores is detected", function() {
			var storeOne = sinon.spy();
			var storeTwo = sinon.spy();
			var storeThree = sinon.spy();
			var storeFour = sinon.spy();

			var circular1 = new lux.Store( {
				namespace: "circular1",
				handlers: {
					myTest: {
						waitFor: [ "circular4" ],
						handler: storeOne
					}
				}
			} );

			var circular2 = new lux.Store( {
				namespace: "circular2",
				handlers: {
					myTest: {
						waitFor: [ "circular1" ],
						handler: storeTwo
					}
				}
			} );

			var circular3 = new lux.Store( {
				namespace: "circular3",
				handlers: {
					myTest: {
						waitFor: [ "circular2" ],
						handler: storeThree
					}
				}
			} );

			var circular4 = new lux.Store( {
				namespace: "circular4",
				handlers: {
					myTest: {
						waitFor: [ "circular3" ],
						handler: storeFour
					}
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest.should.throw( /circular dependency/i );

			storeOne.should.not.be.called;
			storeTwo.should.not.be.called;
			storeThree.should.not.be.called;
			storeFour.should.not.be.called;
			circular1.dispose();
			circular2.dispose();
			circular3.dispose();
			circular4.dispose();
		} );
		it( "Should assume there were changes unless a handler explicitly returns `false`", function() {
			var store = storeFactory( {
				handlers: {
					change: function() {
						this.setState( { newVal: true } );
					},
					inferredChange: function() {},
					noChange: function() {
						return false;
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
			onChange.should.be.calledOnce;
			creator.inferredChange();
			onChange.should.be.calledTwice;
			creator.noChange();
			onChange.should.be.calledTwice;
			store.dispose();
		} );
		it( "Should publish a 'changed' message when flush is called and there are changes", function() {
			var handler = sinon.spy();
			postal.subscribe( {
				channel: "lux.store",
				topic: "storeOne.changed",
				callback: handler
			} ).once();

			var store = storeFactory();
			var creator = lux.actionCreator( {
				getActions: [ "one" ]
			} );
			creator.one();
			handler.should.be.calledOnce;
			store.dispose();
		} );
		it( "Should not swallow exceptions if one occurs in a store handler", function() {
			var store = storeFactory( {
				handlers: {
					taseMeBro: function() {
						throw new Error( "Don't Tase Me Bro!" );
					},
				}
			} );

			var creator = lux.actionCreator( {
				getActions: [ "taseMeBro" ]
			} );

			( function() {
				creator.taseMeBro();
			} ).should.throw;
			store.dispose();
		} );
	} );
	describe( "When removing a Store", function() {
		it( "Should remove all subscriptions", function() {
			var store = storeFactory();
			postal.subscriptions[ "lux.dispatcher" ].should.have.property( "storeOne.handle.*" );
			store.dispose();
			store = undefined;
		} );
		it( "Should remove the namespace from the stores cache", function() {
			var store = storeFactory();
			store.dispose();
			store = undefined;
			// Since actual namespaces are in a hidden variable, we simply try to create a new one
			store = storeFactory();
			// It will throw an error if still defined as a namespace (Unit test for throwing the error is above)
			store.dispose();
		} );
		it( "Should remove the store from the Dispatcher action map", function() {
			var storeIsInActionMap = function() {
				var actionMap = lux.dispatcher.actionMap;
				var isPresent = false;
				var filterFn = function( x ) {
					return x.namespace === "storeOne";
				};
				for (var action in actionMap) {
					if ( actionMap[ action ].filter( filterFn ).length ) {
						isPresent = true;
						break;
					}
				}
				return isPresent;
			};
			var store = storeFactory();
			storeIsInActionMap().should.be.true;
			store.dispose();
			store = undefined;
			storeIsInActionMap().should.be.false;
		} );
	} );
} );
