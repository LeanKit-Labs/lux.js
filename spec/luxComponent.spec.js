function verifyAction( name, args ) {
	args = args || [];
	luxActionCh.subscribe( "execute." + name, function( data ) {
		data.should.have.property( "actionType", name );
		data.should.have.property( "actionArgs" );
		args.forEach( function( arg, i ) {
			should.equal( data.actionArgs[ i ], arg );
		} );
	} ).once();
}

describe( "luxJS - components", function() {
	var Component, innerRef, mocked, fakeStore;

	function componentFactory( options ) {
		options = Object.assign( {
			displayName: "testComponent",
			componentWillMount: function() {
				innerRef = this;
			},
			render: function() {
				return null;
			}
		}, options );

		Component = lux.component( options );
		mocked = utils.renderIntoDocument( React.createElement( Component ) );
	}

	before( function() {
		fakeStore = new lux.Store( {
			namespace: "testytesttest",
			handlers: {
				doYourLuxThing: function() {
					return { yay: true };
				},
				doAnotherThing: function() {
					return { sweet: true };
				},
				notInGroup: function() {
					return { emo: true };
				}
			}
		} );
		lux.addToActionGroup( "testyactiongroup", [ "doYourLuxThing" ] );
		lux.addToActionGroup( "testyextragroup", [ "doYourLuxThing", "doAnotherThing" ] );
	} );
	describe( "When Calling getActionGroup", function() {
		it( "should return expected actions for given action group", function() {
			lux.getActionGroup( "testyactiongroup" ).should.have.property( "doYourLuxThing" );
		} );
	} );
	describe( "When Instantiating a lux Component", function() {
		describe( "When React is not initialized", function() {
			it( "should throw a friendly error", function() {
				lux.initReact();
				componentFactory.should.throw( /initReact/ );
				lux.initReact( React );
			} );
		} );
		describe( "When using getActionGroup for one group", function() {
			before( function() {
				componentFactory( {
					getActionGroup: [ "testyactiongroup" ]
				} );
			} );
			it( "Should provide a `doYourLuxThing` method to the component", function() {
				innerRef.should.have.property( "doYourLuxThing" );
			} );
			it( "Should publish expected message when invoking action method", function() {
				verifyAction( "doYourLuxThing", [ "foo", 8675309 ] );
				innerRef.doYourLuxThing( "foo", 8675309 );
			} );
		} );
		describe( "When using getActionGroup for multiple groups", function() {
			before( function() {
				componentFactory( {
					getActionGroup: [ "testyactiongroup", "testyextragroup" ]
				} );
			} );
			it( "Should provide the correct methods to the component", function() {
				innerRef.should.have.property( "doYourLuxThing" );
				innerRef.should.have.property( "doAnotherThing" );
			} );
			it( "Should publish expected message when invoking action method", function() {
				verifyAction( "doYourLuxThing", [ "foo", 8675309 ] );
				verifyAction( "doAnotherThing", [ "bar", 8675310 ] );
				innerRef.doYourLuxThing( "foo", 8675309 );
				innerRef.doAnotherThing( "bar", 8675310 );
			} );
		} );
		describe( "When using getActions", function() {
			before( function() {
				componentFactory( {
					getActions: [ "doAnotherThing", "notInGroup" ]
				} );
			} );
			it( "Should provide the correct method(s) to the component", function() {
				innerRef.should.have.property( "doAnotherThing" );
				innerRef.should.have.property( "notInGroup" );
			} );
			it( "Should publish expected message when invoking action method", function() {
				verifyAction( "doAnotherThing", [ "bar", 8675310 ] );
				verifyAction( "notInGroup", [ "foo", 8675309 ] );
				innerRef.doAnotherThing( "bar", 8675310 );
				innerRef.notInGroup( "foo", 8675309 );
			} );
		} );
	} );
} );
