describe( "luxJS - Store", function() {
	// eslint-disable-next-line max-params
	function storeFactory( options, m1, m2, m3, m4, m5, m6, m7 ) {
		options = Object.assign( {
			namespace: "storeOne",
			handlers: {
				one() {}
			}
		}, options || {} );
		return new lux.Store( options, m1, m2, m3, m4, m5, m6, m7 );
	}
	describe( "When creating a Store", function() {
		describe( "When validating options", function() {
			it( "Should throw an error if the namespace is already used", function() {
				const store = storeFactory();
				let secondStore;
				( function() {
					secondStore = new lux.Store( {
						namespace: "storeOne",
						handlers: {
							one() {}
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
					return new lux.Store( {
						handlers: {
							one() {}
						}
					} );
				} ).should.throw( /must have a namespace/ );
			} );

			it( "Should throw an error if there are no action handlers", function() {
				let tmpStore;
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
				const store = storeFactory( {
					state: { something: true }
				} );

				store.getState().should.eql( { something: true } );
				store.dispose();
			} );
			it( "Should pass along any extra property or method names to the new object", function() {
				const store = storeFactory( {
					getSomethingCool() {
						return true;
					}
				} );

				store.should.have.property( "getSomethingCool" );
				store.getSomethingCool.should.be.an.instanceOf( Function );
				store.getSomethingCool().should.be.true();
				store.dispose();
			} );
			it( "Should make action creator methods for each handler", function() {
				const store = storeFactory( {
					handlers: {
						one() {},
						two() {}
					}
				} );
				const creator = lux.actionCreator( {
					getActions: [ "one", "two" ]
				} );

				creator.should.have.property( "one" );
				creator.one.should.be.an.instanceOf( Function );
				creator.should.have.property( "two" );
				creator.two.should.be.an.instanceOf( Function );
				store.dispose();
			} );
			it( "Should create an action group for all handlers", function() {
				const store = storeFactory( {
					handlers: {
						one() {},
						two() {}
					}
				} );
				const creator = lux.actionCreator( {
					getActionGroup: [ "storeOne" ]
				} );

				creator.should.have.property( "one" );
				creator.one.should.be.an.instanceOf( Function );
				creator.should.have.property( "two" );
				creator.two.should.be.an.instanceOf( Function );
				store.dispose();
			} );
			it( "Should remove action handlers from public object", function() {
				const store = storeFactory();
				store.should.not.have.property( "handlers" );
				store.dispose();
			} );
			it( "Should remove direct access to state", function() {
				const store = storeFactory();
				store.should.not.have.property( "state" );
				store.dispose();
			} );
		} );
		describe( "When initializing with multiple mixins", function() {
			it( "Should blend state passed into intial state", function() {
				const store = storeFactory(
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
				const store = storeFactory(
					{
						getSomethingCool() {
							return true;
						}
					},
					{
						getSomethingEvenCooler() {
							return "Truer than true";
						}
					}
				);

				store.should.contain.key( "getSomethingCool" );
				store.getSomethingCool.should.be.an.instanceOf( Function );
				store.getSomethingCool().should.be.true();

				store.should.contain.key( "getSomethingEvenCooler" );
				store.getSomethingEvenCooler.should.be.an.instanceOf( Function );
				store.getSomethingEvenCooler().should.equal( "Truer than true" );
				store.dispose();
			} );
			it( "Should create an action group for all handlers", function() {
				const store = storeFactory(
					{
						handlers: {
							one() {},
							two() {}
						}
					},
					{
						handlers: {
							three() {},
							four() {}
						}
					}
				);
				const creator = lux.actionCreator( {
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
				const backInTimeSpy = sinon.spy();
				const forwardInTimeSpy = sinon.spy();
				const feedMrFusionSpy = sinon.spy();

				const store = storeFactory(
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
				const creator = lux.actionCreator( {
					getActionGroup: [ "multiplicity" ]
				} );
				creator.backInTime();
				creator.forwardInTime();
				creator.feedMrFusion();
				backInTimeSpy.should.be.calledThrice();
				forwardInTimeSpy.should.be.calledTwice();
				feedMrFusionSpy.should.be.calledOnce();
				store.dispose();
			} );
			it( "Should support store dependency ordering with mixin handler collision", function() {
				const invocations = [];

				const store = storeFactory( {
					namespace: "mefirst",
					handlers: {
						backInTime: {
							handler() {
								invocations.push( "mefirst" );
							}
						}
					}
				} );

				const store2 = storeFactory( {
					namespace: "mesecond",
					handlers: {
						backInTime: {
							handler() {
								invocations.push( "mesecond-mixin1" );
							}
						}
					}
				}, {
					handlers: {
						backInTime: {
							waitFor: [ "mefirst" ],
							handler() {
								invocations.push( "mesecond-mixin2" );
							}
						}
					}
				} );

				const store3 = storeFactory(
					{
						namespace: "multiplicity",
						handlers: {
							backInTime: {
								waitFor: [ "mefirst" ],
								handler() {
									invocations.push( "multiplicity-mixin1" );
								}
							}
						}
					},
					{
						handlers: {
							backInTime: {
								waitFor: [ "mesecond" ],
								handler() {
									invocations.push( "multiplicity-mixin2" );
								}
							}
						}
					},
					{
						handlers: {
							backInTime() {
								invocations.push( "multiplicity-mixin3" );
							}
						}
					}
				);

				const creator = lux.actionCreator( {
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
	} );
	describe( "When using a Store", function() {
		it( "Should only allow setState while handling an action", function() {
			const store = storeFactory( {
				state: {
					flag: false
				},
				handlers: {
					anAction() {
						this.setState( { flag: true } );
					}
				}
			} );

			( function() {
				store.setState( { flag: true } );
			} ).should.throw( /during a dispatch cycle/ );

			const creator = lux.actionCreator( {
				getActions: [ "anAction" ]
			} );

			store.getState().flag.should.be.false();

			creator.anAction();

			store.getState().flag.should.be.true();
			store.dispose();
		} );
		it( "Should only allow replaceState while handling an action", function() {
			const store = storeFactory( {
				state: {},
				handlers: {
					anotherAction() {
						this.replaceState( { flag: true } );
					}
				}
			} );

			( function() {
				store.replaceState( { flag: true } );
			} ).should.throw( /during a dispatch cycle/ );

			const creator = lux.actionCreator( {
				getActions: [ "anotherAction" ]
			} );

			store.getState().should.not.have.property( "flag" );

			creator.anotherAction();

			store.getState().flag.should.be.true();
			store.dispose();
		} );
		it( "Should replace state if replaceState is called during an action cycle", function() {
			const store = storeFactory( {
				state: {
					lots: true,
					andLots: 12345,
					ofKeys: "yessir"
				},
				handlers: {
					aReplaceAction() {
						this.replaceState( { replaced: true } );
					}
				}
			} );

			const creator = lux.actionCreator( {
				getActions: [ "aReplaceAction" ]
			} );

			store.getState().should.have.property( "lots" );
			store.getState().should.have.property( "andLots" );
			store.getState().should.have.property( "ofKeys" );

			creator.aReplaceAction();

			store.getState().should.not.have.property( "lots" );
			store.getState().should.not.have.property( "andLots" );
			store.getState().should.not.have.property( "ofKeys" );
			store.getState().replaced.should.be.true();
			store.dispose();
		} );
		it( "Should wait for other stores to update before dependent action is handled", function() {
			const storeOne = sinon.spy();
			const storeTwo = sinon.spy();
			const otherStore = new lux.Store( {
				namespace: "store2",
				handlers: {
					myTest: {
						waitFor: [ "storeOne" ],
						handler() {
							storeOne.should.be.calledOnce();
							storeTwo();
						}
					}
				}
			} );

			const store = storeFactory( {
				handlers: {
					myTest: storeOne
				}
			} );

			const creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest();
			storeOne.should.be.calledOnce();
			storeTwo.should.be.calledOnce();
			store.dispose();
			otherStore.dispose();
		} );
		it( "Should warn when an action is dependent on a store that does not participate in that action (or does not exist)", function() {
			sinon.stub( console, "warn" );
			const storeOne = sinon.stub();
			const store = storeFactory( {
				handlers: {
					myTest: {
						waitFor: [ "doesNotExist" ],
						handler: storeOne
					}
				}
			} );

			lux.dispatch( "myTest" );
			storeOne.should.be.calledOnce();

			/* eslint-disable no-console */
			console.warn.should.be.calledOnce.and.calledWithMatch( /doesNotExist/ );
			console.warn.restore();
			/* eslint-enable no-console */

			store.dispose();
		} );
		it( "Should throw an error when a direct circular dependency between stores is detected", function() {
			const storeOne = sinon.spy();
			const storeTwo = sinon.spy();

			const circular1 = new lux.Store( {
				namespace: "circular1",
				handlers: {
					myTest: {
						waitFor: [ "circular2" ],
						handler: storeOne
					}
				}
			} );

			const circular2 = new lux.Store( {
				namespace: "circular2",
				handlers: {
					myTest: {
						waitFor: [ "circular1" ],
						handler: storeTwo
					}
				}
			} );

			const creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest.should.throw( /circular dependency/i );

			storeOne.should.not.be.called();
			storeTwo.should.not.be.called();
			circular1.dispose();
			circular2.dispose();
		} );
		it( "Should throw an error when a more distant circular dependency between stores is detected", function() {
			const storeOne = sinon.spy();
			const storeTwo = sinon.spy();
			const storeThree = sinon.spy();
			const storeFour = sinon.spy();

			const circular1 = new lux.Store( {
				namespace: "circular1",
				handlers: {
					myTest: {
						waitFor: [ "circular4" ],
						handler: storeOne
					}
				}
			} );

			const circular2 = new lux.Store( {
				namespace: "circular2",
				handlers: {
					myTest: {
						waitFor: [ "circular1" ],
						handler: storeTwo
					}
				}
			} );

			const circular3 = new lux.Store( {
				namespace: "circular3",
				handlers: {
					myTest: {
						waitFor: [ "circular2" ],
						handler: storeThree
					}
				}
			} );

			const circular4 = new lux.Store( {
				namespace: "circular4",
				handlers: {
					myTest: {
						waitFor: [ "circular3" ],
						handler: storeFour
					}
				}
			} );

			const creator = lux.actionCreator( {
				getActions: [ "myTest" ]
			} );

			creator.myTest.should.throw( /circular dependency/i );

			storeOne.should.not.be.called();
			storeTwo.should.not.be.called();
			storeThree.should.not.be.called();
			storeFour.should.not.be.called();
			circular1.dispose();
			circular2.dispose();
			circular3.dispose();
			circular4.dispose();
		} );
		it( "Should assume there were changes unless a handler explicitly returns `false`", function() {
			const store = storeFactory( {
				handlers: {
					change() {
						this.setState( { newVal: true } );
					},
					inferredChange() {},
					noChange() {
						return false;
					}
				}
			} );
			const onChange = sinon.spy();
			const listener = {
				stores: {
					listenTo: "storeOne",
					onChange
				}
			};
			lux.mixin( listener, lux.mixin.store );
			const creator = lux.actionCreator( {
				getActions: [ "change", "inferredChange", "noChange" ]
			} );

			creator.change();
			onChange.should.be.calledOnce();
			creator.inferredChange();
			onChange.should.be.calledTwice();
			creator.noChange();
			onChange.should.be.calledTwice();
			store.dispose();
		} );
		it( "Should publish a 'changed' message when flush is called and there are changes", function() {
			const handler = sinon.spy();
			postal.subscribe( {
				channel: "lux.store",
				topic: "storeOne.changed",
				callback: handler
			} ).once();

			const store = storeFactory();
			const creator = lux.actionCreator( {
				getActions: [ "one" ]
			} );
			creator.one();
			handler.should.be.calledOnce();
			store.dispose();
		} );
		it( "Should not swallow exceptions if one occurs in a store handler", function() {
			const store = storeFactory( {
				handlers: {
					taseMeBro() {
						throw new Error( "Don't Tase Me Bro!" );
					}
				}
			} );

			const creator = lux.actionCreator( {
				getActions: [ "taseMeBro" ]
			} );

			( function() {
				creator.taseMeBro();
			} ).should.throw( /Don't Tase Me Bro/ );
			store.dispose();
		} );
	} );
	describe( "When removing a Store", function() {
		it( "Should remove all subscriptions", function() {
			let store = storeFactory();
			postal.subscriptions[ "lux.dispatcher" ].should.have.property( "storeOne.handle.*" );
			store.dispose();
			store = undefined;
		} );
		it( "Should remove the namespace from the stores cache", function() {
			let store = storeFactory();
			store.dispose();
			store = undefined;
			// Since actual namespaces are in a hidden variable, we simply try to create a new one
			store = storeFactory();
			// It will throw an error if still defined as a namespace (Unit test for throwing the error is above)
			store.dispose();
		} );
		it( "Should remove the store from the Dispatcher action map", function() {
			const storeIsInActionMap = function() {
				const actionMap = lux.dispatcher.actionMap;
				let isPresent = false;
				const filterFn = function( x ) {
					return x.namespace === "storeOne";
				};
				for ( const action in actionMap ) {
					if ( actionMap[ action ].filter( filterFn ).length ) {
						isPresent = true;
						break;
					}
				}
				return isPresent;
			};
			let store = storeFactory();
			storeIsInActionMap().should.be.true();
			store.dispose();
			store = undefined;
			storeIsInActionMap().should.be.false();
		} );
		describe( "via lux.removeStore", function() {
			it( "should call store.dispose", function() {
				const store = storeFactory();
				const spy = sinon.spy( store, "dispose" );
				lux.removeStore( "storeOne" );
				spy.should.be.calledOnce();
				spy.restore();
			} );
		} );
	} );
} );
