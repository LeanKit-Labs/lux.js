var LuxContainer = lux.LuxContainer;
function storeFactory( options ) {
	options = Object.assign( {
		namespace: "storeOne",
		handlers: {
			one: function() {}
		}
	}, options || {} );
	return new lux.Store( options );
}
function getMockReactComponent( options ) {
	return React.createClass( _.extend( {
		displayName: "MOCKT",
		render: function() {
			return React.createElement( "div" );
		}
	}, options ) );
}
describe( "luxJS - LuxContainer", function() {
	describe( "when listening to stores", function() {
		var store1, store2, container, child, onStoreChange, containerProps, willReceivePropsStub, component;
		beforeEach( function() {
			store1 = storeFactory( {
				namespace: "store1",
				getStore1State: sinon.spy( function( x ) {
					return { store1: "state" };
				} )
			} );
			store2 = storeFactory( {
				namespace: "store2",
				handlers: {
					one: function() {},
					two: function() {}
				},
				getStore2State: sinon.spy( function( x ) {
					return { store2: "statey state state" };
				} )
			} );
			willReceivePropsStub = sinon.stub();
			child = React.createElement( getMockReactComponent( {
				componentWillReceiveProps: willReceivePropsStub
			} ) );
			onStoreChange = sinon.spy( function( props ) {
				return _.extend( {}, store1.getStore1State( "foo" ), store2.getStore2State( "bar" ) );
			} );
			containerProps = {
				wrapperProp: "thingy",
				stores: [ "store1", "store2" ],
				onStoreChange: onStoreChange
			};
			container = React.createElement( LuxContainer, containerProps, child );
			component = utils.renderIntoDocument( container );
		} );
		afterEach( function() {
			if ( component ) {
				ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
			}
			store1.getStore1State.reset();
			store2.getStore2State.reset();
			onStoreChange.reset();
			store1.dispose();
			store2.dispose();
			store1 = null;
			store2 = null;
		} );
		describe( "when one store updates", function() {
			beforeEach( function() {
				lux.publishAction( "two" );
			} );
			it( "should invoke onStoreChange prop function", function() {
				onStoreChange.should.be.calledOnce
					.and.calledWithMatch( containerProps );
			} );
			it( "should invoke read accessors on stores", function() {
				store1.getStore1State.should.be.calledOnce
					.and.calledWithMatch( "foo" );
				store2.getStore2State.should.be.calledOnce
					.and.calledWithMatch( "bar" );
			} );
			it( "should pass expected props to the child", function() {
				willReceivePropsStub.should.be.calledOnce
					.and.calledWith( {
						wrapperProp: "thingy",
						store2: "statey state state",
						store1: "state"
					} );
			} );
		} );
		describe( "when more than one store updates", function() {
			beforeEach( function() {
				lux.publishAction( "one" );
			} );
			it( "should invoke onStoreChange prop function once", function() {
				onStoreChange.should.be.calledOnce
					.and.calledWithMatch( containerProps );
			} );
			it( "should invoke read accessors on stores", function() {
				store1.getStore1State.should.be.calledOnce
					.and.calledWithMatch( "foo" );
				store2.getStore2State.should.be.calledOnce
					.and.calledWithMatch( "bar" );
			} );
			it( "should pass expected props to the child", function() {
				willReceivePropsStub.should.be.calledWith( {
						wrapperProp: "thingy",
						store2: "statey state state",
						store1: "state"
					} );
			} );
		} );
	} );
} );
