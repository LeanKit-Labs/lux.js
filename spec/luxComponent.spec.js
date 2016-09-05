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

/*eslint "no-unused-vars": 0 */
describe( "luxJS - components", function() {
	var Component, innerRef, fakeStore;

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
		utils.renderIntoDocument( React.createElement( Component ) );
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
	} );
	describe( "When Instantiating a lux Component", function() {
		describe( "When React is not initialized", function() {
			it( "should throw a friendly error", function() {
				lux.initReact();
				componentFactory.should.throw( /initReact/ );
				lux.initReact( React );
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
/*eslint "no-unused-vars": 0 */
