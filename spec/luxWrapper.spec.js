
var luxWrapper = lux.luxWrapper;
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
		getDefaultProps: function() {
			return { foo: "bar" };
		},
		render: function() {
			return React.createElement( "div", { displayName: "MOM", className: "childy" }, "This is a test DIV" );
		}
	}, options ) );
}

describe( "luxWrapper", function() {
	describe( "when generating the component", () => {
		it( "should default to using React.Component", () => {
			const ComponentClass = luxWrapper( getMockReactComponent(), {} );
			const component = utils.renderIntoDocument( React.createElement( ComponentClass ) );
			component.should.be.an.instanceOf( React.Component );
			ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
		} );
		it( "should support using React.PureComponent", () => {
			const ComponentClass = luxWrapper( getMockReactComponent(), { pureComponent: true } );
			const component = utils.renderIntoDocument( React.createElement( ComponentClass ) );
			component.should.be.an.instanceOf( React.PureComponent );
			ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
		} );
	} );

	describe( "when generating resulting component name", function() {
		it( "should use a displayName if provided", function() {
			luxWrapper( getMockReactComponent(), {} ).displayName.should.equal( "LuxWrapped(MOCKT)" );
		} );
		it( "should use 'Component' if displayName is not provided", function() {
			luxWrapper( getMockReactComponent( { displayName: null } ), {} ).displayName.should.equal( "LuxWrapped(Component)" );
		} );
	} );

	describe( "when listening to stores", function() {
		var store1, store2, container, targetComponent, getState, config, willReceivePropsStub, component;
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
			targetComponent = getMockReactComponent( {
				componentWillReceiveProps: willReceivePropsStub
			} );
			getState = sinon.stub().returns(
				_.extend(
					{},
					store1.getStore1State( "foo" ),
					store2.getStore2State( "bar" )
				)
			);
			config = {
				stores: [ "store1", "store2" ],
				getState: getState
			};
			container = React.createElement( luxWrapper( targetComponent, config ), { wrapperProp: "thingy" } );
			component = utils.renderIntoDocument( container );
		} );
		afterEach( function() {
			if ( component ) {
				ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
			}
			store1.getStore1State.reset();
			store2.getStore2State.reset();
			getState.reset();
			store1.dispose();
			store2.dispose();
			store1 = null;
			store2 = null;
		} );
		it( "should call getState to set up initial wrapper state", function() {
			getState.should.be.calledOnce();
		} );
		it( "should pass component props and onChange initial payload to the getState method", function() {
			getState.should.be.calledWithExactly( { wrapperProp: "thingy" }, { store1: true, store2: true } );
		} );
		describe( "when one store updates", function() {
			beforeEach( function() {
				lux.dispatch( "two" );
			} );
			it( "should invoke getState twice", function() {
				// getState is called for initial state
				// and also when store state updates
				getState.should.be.calledTwice();
				getState.firstCall.should.be.calledWithExactly( { wrapperProp: "thingy" }, { store1: true, store2: true } );
				getState.secondCall.should.be.calledWithExactly( { wrapperProp: "thingy" }, { store2: true } );
			} );
			it( "should invoke read accessors on stores", function() {
				store1.getStore1State.should.be.calledOnce
					.and.calledWithMatch( "foo" );
				store2.getStore2State.should.be.calledOnce
					.and.calledWithMatch( "bar" );
			} );
			it( "should pass expected props to the targetComponent", function() {
				willReceivePropsStub.should.be.calledOnce
					.and.calledWith( {
						foo: "bar",
						wrapperProp: "thingy",
						store2: "statey state state",
						store1: "state"
					} );
			} );
		} );
		describe( "when more than one store updates", function() {
			beforeEach( function() {
				lux.dispatch( "one" );
			} );
			it( "should invoke getState twice", function() {
				// getState is called for initial state
				// and also when store state updates
				getState.should.be.calledTwice();
			} );
			it( "should invoke read accessors on stores", function() {
				store1.getStore1State.should.be.calledOnce
					.and.calledWithMatch( "foo" );
				store2.getStore2State.should.be.calledOnce
					.and.calledWithMatch( "bar" );
			} );
			it( "should pass expected props to the targetComponent", function() {
				willReceivePropsStub.should.be.calledWith( {
					foo: "bar",
					wrapperProp: "thingy",
					store2: "statey state state",
					store1: "state"
				} );
			} );
		} );
	} );

	describe( "when mapping prop handlers to action creators", function() {
		var container, targetComponent, config, component, fakeActionStub, fakeActionStub2, targetDiv;
		beforeEach( function() {
			fakeActionStub = sinon.stub();
			fakeActionStub2 = sinon.stub();
			lux.actionListener( {
				handlers: {
					fakeActionBecauseClicketyClick: fakeActionStub
				}
			} );
			targetComponent = React.createClass( {
				propTypes: {
					onThingThang: React.PropTypes.func,
					onAnotherThang: React.PropTypes.func
				},
				displayName: "ActionMockt",
				handleClick: function( e ) {
					this.props.onThingThang( e, "another", "value" );
				},
				render: function() {
					return React.createElement( "div", {
						onClick: this.handleClick,
						onDoubleClick: this.props.onAnotherThang
					}, "This is a test DIV" );
				}
			} );
			config = {
				wrapperProp: "thingy",
				actions: {
					onThingThang: "fakeActionBecauseClicketyClick",
					onAnotherThang: fakeActionStub2
				}
			};
			container = React.createElement( luxWrapper( targetComponent, config ), { wrapperProp: "thingy" } );
			component = utils.renderIntoDocument( container );
			targetDiv = utils.findRenderedComponentWithType( component, targetComponent );
		} );
		afterEach( function() {
			if ( component ) {
				ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
			}
		} );
		it( "should dispatch action when passing string action name", function() {
			utils.Simulate.click( ReactDOM.findDOMNode( targetDiv ) );
			fakeActionStub.should.be.calledOnce
				.and.calledWith( "another", "value" );
		} );
		it( "should invoke action handler when passing a function", function() {
			function isSyntheticEvent( e ) {
				return e.hasOwnProperty( "eventPhase" ) &&
					e.hasOwnProperty( "nativeEvent" ) &&
					e.hasOwnProperty( "target" ) &&
					e.hasOwnProperty( "type" );
			}
			utils.Simulate.doubleClick( ReactDOM.findDOMNode( targetDiv ) );
			fakeActionStub2.should.be.calledOnce();
			isSyntheticEvent( fakeActionStub2.getCall( 0 ).args[ 0 ] ).should.equal( true );
		} );
		it( "should throw if invalid action values are provided", function() {
			( function() {
				container = React.createElement(
					luxWrapper(
						targetComponent,
						{
							actions: {
								notGonnaWork: 2
							}
						}
					)
				);
				component = utils.renderIntoDocument( container );
			} ).should.throw( /The values provided to the luxWrapper actions parameter must be a string or a function/ );
		} );
	} );

	describe( "when passing lifecyle methods", () => {
		let component,
			componentWillMount,
			componentDidMount,
			componentWillReceiveProps,
			componentWillUpdate,
			componentDidUpdate,
			componentWillUnmount,
			ComponentClass,
			el;

		beforeEach( () => {
			componentWillMount = sinon.stub();
			componentDidMount = sinon.stub();
			componentWillReceiveProps = sinon.stub();
			componentWillUpdate = sinon.stub();
			componentDidUpdate = sinon.stub();
			componentWillUnmount = sinon.stub();

			el = document.createElement( "div" );
			document.body.appendChild( el );

			ComponentClass = luxWrapper( getMockReactComponent(), {
				componentWillMount,
				componentDidMount,
				componentWillReceiveProps,
				componentWillUpdate,
				componentDidUpdate,
				componentWillUnmount
			} );
			component = ReactDOM.render( React.createElement( ComponentClass ), el );
		} );

		it( "should invoke componentWillMount", () => {
			componentWillMount.should.be.calledOnce();
		} );

		it( "should invoke componentDidMount", () => {
			componentDidMount.should.be.calledOnce();
		} );

		it( "should invoke componentWillReceiveProps", () => {
			component = ReactDOM.render( React.createElement( ComponentClass, { cal: "zone" } ), el );
			componentWillReceiveProps.should.be.calledOnce.and.calledWithMatch( { cal: "zone" } );
		} );

		it( "should invoke componentWillUpdate", () => {
			component = ReactDOM.render( React.createElement( ComponentClass, { cal: "zone" } ), el );
			componentWillUpdate.should.be.calledOnce.and.calledWithMatch( { cal: "zone" } )();
		} );

		it( "should invoke componentDidUpdate", () => {
			ReactDOM.render( React.createElement( ComponentClass, { cal: "ories" } ), el );
			componentDidUpdate.reset();
			ReactDOM.render( React.createElement( ComponentClass, { cal: "zone" } ), el );
			componentDidUpdate.should.be.calledOnce.and.calledWithMatch( { cal: "ories" } );
		} );

		it( "should invoke componentWillUnmount", () => {
			if ( component ) {
				ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( component ).parentNode );
			}
			componentWillUnmount.should.be.calledOnce();
		} );
	} );
} );
