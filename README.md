<img src="logo.png?raw=true&amp;v=2" width="375" height="128" alt="lux.js: Illuminating React" />

## What Is It
lux.js is an implementation of a [Flux](http://facebook.github.io/flux/docs/overview.html) architecture using ReactJS, postal.js and machina.js. In a nutshell, the React components, dispatcher and stores are highly de-coupled. Here's a gist of the opinions at play:

* Components use an ActionCreator API as a proxy to stores.
* ActionCreator APIs generate message payloads that are routed to the Dispatcher, which coordinates when and how the stores are told to handle the actions.
* Store operations are synchronous.
* Store state is not mutated directly. In fact, it's only possible to mutate store state inside a store's action handler. Communication with a store is done via the Dispatcher (using an action creator API), or an equivalent message-capable API that follows the lux message contracts for these operations.
* Other modules can take a dependency on a store for read-only operations.
* Once all stores involved in processing an action have completed their tasks, the Dispatcher signals (via msg) that it's OK for the stores to send change notifications.
* ControllerViews (see below) that are wired up to listen to specific stores will receive their updates, etc.
* All communication happens via message passing.
* Each message payload should be fully serializable(!)

### The Pieces
#### ControllerViews
A ControllerView is a component that contains state that will be updated from a store - they will typically appear at the top (or near) of logical sections of your component tree. In lux, a ControllerView gets two primary mixins: `lux.reactMixin.actionCreator` and `lux.reactMixin.store` (see the section on mixins below for more information on the mixins' API). The `actionCreator` mixin gives the ControllerView an `ActionCreator` API for the specified action(s) or action group(s). The `store` mixin wires the component into the bus to listen for updates from the specified store(s).

##### Creating a ControllerView
You can get an instance of a ControllerView by calling `lux.controllerView()` (You must call `lux.initReact( React )` once in your app before using this method). For example, the ControllerView below is being given all the actions associated with the "board" action group, and is also listening to the board store for data:


```javascript
var lux = require( "lux.js" );
// Only needed one time in the app
// (& only if you're using lux.controllerView or lux.component)
lux.initReact( React );

var LaneSelector = lux.controllerView({

	// In this case "board" is an action group that contains
	// at least one action called "loadBoard". Any actions
	// under the "board" action group get added as top level
	// methods to this react element.
    getActionGroup: ["board"],

    stores: {
    	// `listenTo` can also be an array of store namespaces
    	// like [ "board", "card", "user" ], etc.
    	// We're only listening to one store here, so we're
    	// using the string namespace shortcut to specify it
        listenTo: "board",

        // The `boardStore` used below is a module dependency for this
        // element. It contains a helper method (read accessor) which we're
        // invoking to get the specific board data we want. If you're listening
        // to multiple stores, the onChange handler will not fire until
        // all the stores have updated.
        onChange: function() {
            var newState = boardStore.getBoard(this.props.boardId);
            this.setState(newState);
        }
    },

    getInitialState: function() {
        return {
            lanes: []
        };
    },

    componentWillMount: function() {
        this.loadBoard(this.props.boardId);
    },

    render: function() {
        //etc etc, you get the idea
    }
});
```

Lux provides a couple of helper methods to get pre-configured React components, but you can also stick to plain React components, and use the appropriate lux mixins. Since `lux.controllerView` is just a convenience method that calls `React.createClass` with the two mixins, you could also use:

```js
var LaneSelector = React.createClass({
	mixins: [ lux.reactMixin.store, lux.reactMixin.actionCreator ],
	...
});
```

The nice thing about the above approach is that if you just need to listen to a store for state, then you could include *only* the mixin you need:

```js
var LaneSelector = React.createClass({
	mixins: [ lux.reactMixin.store ],
	...
});
```

##### How Components Update When Stores Change

A lux ControllerView will wait on all the stores involved in an action to signal state changes before it calls `onChange`. This means your component will only call render once even if it's listening to multiple stores that change state during an action dispatch.

#### "Normal" Lux Components
For components that need an ActionCreator API (i.e. - they need to dispatch actions), but *don't* need to listen to a store, you can call `lux.component()` (You must call `lux.initReact( React )` once in your app before using this method). For example, this component is being given an ActionCreator API for the "board" store (which adds the `toggleLaneSelection` method to the component), but is NOT listening to the board store for state, since it's not a ControllerView:

```javascript
var lux = require( "lux.js" );
// Only needed one time in the app
// (& only if you're using lux.controllerView or lux.component)
lux.initReact( React );

var Lane = lux.component({

	getActionGroup: ["board"],

	getInitialState: function() {
		return {
			isCollapsed: false
		};
	},

	getDefaultProps: function() {
		return {
			items: [],
			siblingSize: 1,
			depth: 0,
			isParentActive: false
		};
	},

	toggleActive: function(e) {
		e.stopPropagation();
		this.toggleLaneSelection(this.props.boardId, this.props.key);
	},

	render: function() {
		// etc etc, you get the idea....
	}
});
```

Just like `lux.controllerView`, `lux.component` is a convenience method that calls `React.createClass` with one mixin. You could also use:

```js
var Lane = React.createClass({
	mixins: [ lux.reactMixin.actionCreator ],
	...
});
```

#### Dispatcher
The Dispatcher listens for actions that are dispatched by Components using ActionCreator APIs. Underneath, it's a [`BehavioralFSM`](https://github.com/ifandelse/machina.js/wiki/machina.BehavioralFsm). You don't have to do anything special, lux creates a single dispatcher instance for you.

#### Store
A store should contain your data as well as any business logic related to that data. A lux Store can be created by using the Store constructor (i.e. - `var store = new lux.Store({ /* options */ })`. A store should always have a `namespace` (just a logical name for it) and it will have any number of action `handlers`. What you name an action handler on a store is important, as the same name will be used on the corresponding ActionCreator API. If a store action handler returns false explicitly, it tells the action coordinator that the state of the store didn't change. However, returning undefined or *any other value* will result in the action coordinator assuming a change to the store state occurred during the handler's operations. Stores contain the following methods:

* `getState` - synchronously returns the state of a store.
* `setState` - works much like a component's `setState` method (via shallow extending/assigning) - synchronously updates state of a store. It's only possible to invoke this method from inside a store action handler.
* `flush` - causes a change notification to be sent out (via message) if the store's state has changed.
* `dispose` - removes all message bus subscriptions for a store, effectively disabling it from being used any further.

For example, the store below has a namespace of "board", and it contains two action handlers - `toggleLaneSelection` and `loadBoard`, as well as two "read accessor" helper methods call `getCurrentBoard` and `getBoard`:

```javascript
var boardStore = new lux.Store( {
	namespace: "board",
	handlers: {
		toggleLaneSelection: function( boardId, laneId ) {
			var newState = this.getState();
			var target = newState[ boardId ] && newState[ boardId ].lookup[ laneId ];
			if ( target ) {
				target.isActive = !target.isActive;
				toggleAncestors( newState[ boardId ].lookup, target );
				toggleDescendants( target );
				this.setState(newState);
			}
		},
		boardLoaded: function( boardId, board ) {
			var newState = this.getState();
			newState[ boardId ] = parser.transform( board );
			newState._currentBoardId = boardId;
			this.setState(newState);
		}
	},
	getCurrentBoard: function() {
		var state = this.getState();
		return state[state._currentBoardId];
	},
	getBoard: function(id) {
		return this.getState()[id];
	}
} );
```

It's possible to pass multiple "mixins" to the `Store` constructor, should the need arise. It supports deep-merging of state as well as handlers. (Yes, handlers!) If multiple mixins target the same action handler, both handler methods will be queued to execute when the store handles the action (they are queued in the same order they are mixed-in). If you are passing mixins to an extended constructor, your handlers will be queued *after* any handlers of the same name that are inherited from the extended constructor, etc. When merging state, lodash currently follows a "first-write-wins" approach with arrays.

```javascript
var boardStore = new lux.Store(
	{ namespace: "board" },
	boardLoadedMixin,
	laneSelectionMixin,
	apiLoadedMixin
);
```

#### ActionCreator APIs
Components don't talk to stores directly. Instead, they use an ActionCreator API as a proxy to store operations. ActionCreator APIs are built automatically as stores (and any other instance that uses the `lux.mixin.actionListener` mixin) are created. If you use the `actionCreator` mixin (or use a ControllerView or lux Component), action creator APIs will appear as top level methods on your component. The auto-generated ActionCreator APIs use the same method names as the corresponding action type names. ActionCreator methods simply publish the correct message payload for the action. Remember that any arguments you pass to an ActionCreator method should be *fully serializable*. If you really need to, you can create your own ActionCreator API method - either at the component level, or globally. Implementing a method on your component that matches the name of an action allows for a component-specific override, or you can use `lux.customActionCreator` to implement your own global overrides of how an action is dispatched. You just have to honor the message contracts (see the source for information on that now....more documentation later).

You can group actions together under a "label" (known as an action group) by using the `lux.addToActionGroup` method:

```javascript
// if the "board" action group doesn't exist, it will be created. If it does exist
// the actions in the second argument will be added to what's already there
lux.addToActionGroup( "board", ["toggleLaneSelection", "toggleRollUpLane", "loadBoard" ]);
```

By default, lux will generate an action creator method for your actions (which simply publishes a structured message payload defining the action), but you might want to create a custom version of an action creator method:

```javascript
// a contrived example of creating a custom action creator method that console.logs
// the arguments before publishing the action message like the auto-generated method would do
lux.customActionCreator({
	myActionName: function(something, anotherThing) {
		console.log("I want to console log this:", something, anotherThing);
		lux.publishAction("myActionName", something, anotherThing);
	}
});
```

### Mixins

#### lux.mixin.actionCreator and lux.reactMixin.actionCreator
The `actionCreator` mixin (which is provided automatically when you call `lux.controllerView` and `lux.component`) will look for a `getActionGroup` array or a `getActions` array on your component options. The `getActionGroup` array should contain the string action group name(s) that contain the actions you want. The `getActions` should contain the action names you want on the component (you can use either or both). The ActionCreator APIs will appear on the component as top level method names. Use the `lux.reactMixin.actionCreator` with the `React.createClass` mixins property.

#### lux.mixin.store and lux.reactMixin.store
The `store` mixin (which is provided automatically when you call `lux.createControllerView`) will look for a `stores` property on your component options. This property should be an object with a `listenTo` array containing the list of store namespaces your component wants state from, and an `onChange` handler for when any of those stores publish state changes. You will need to include the store(s) as module dependencies to access their state from within the handler. Use the `lux.reactMixin.store` with the `React.createClass` mixins property.

#### lux.mixin.actionListener
The `actionListener` mixin wires an instance into the message bus to listen for `execute.*` messages on the `lux.action` channel. The subscription handler looks for a `handlers` property on the instance it's mixed into, and will fire any method that matches the action type passed on the message envelope. This is useful for integration non-lux modules into lux operations. For example, you may have a "remote data" (i.e. - HTTP/websockets) wrapper that uses this mixin to listen for actions that indicate an AJAX request needs to be made, etc.

#### lux.mixin
The `lux.mixin()` method allows you to add support for lux stores and actions into any object. *You will not need to use this on React components or existing lux components.* Simply call `lux.mixin( this )` on your object, and lux will do the following steps:

1. If it finds a `stores` property on your object it will wire up stores and the `onChange` handler.
2. If it finds a `getActionGroup` or `getActions` property on your object it will add top level methods for the needed actions.
3. It will add a `luxCleanup()` method to your object. Invoke this method during a destroy or teardown lifecycle event to cleanup the mixin's subscriptions.

You can also specify the lux mixins you wish to use by calling `lux.mixin(taget, lux.mixin.actionListener, lux.mixin.store);`.

### Other Helpers
Lux contains some helper methods that enable you to do the following:

##### Quickly Create an Action Listener
In this example, we have an API wrapper that is a lux action listener, so that it will get notified (via messaging) when the loadBoard action is dispatched:

```javascript
var http = lux.actionListener({
	handlers: {
		loadBoard: function(boardId) {
			// simulate an http response
			setTimeout(function(){
				var board = mockData.boards.find(function(x) {
					return x.boardId.toString() === boardId.toString();
				});
				lux.publishAction("boardLoaded", boardId, board);
			}.bind(this), 200);
		}
	}
});
```

##### Quickly Create an Action Creator
In this example, we're creating an instance of a plain object (not a lux component or controller view) that will have any actions associated with the "board" action group:

```javascript
var boardActions = lux.actionCreator({
	getActionGroup: [ "board" ]
});

// assuming the board action group has a "toggleLaneSelection" action

boardAction.toggleLaneSelection(123, 4567);

```

##### Publish A Named Action

If you just need to publish an action, you can do that by calling `lux.publishAction( actionName, arg1, arg2... )`. Just a reminder: even though you can use this anywhere in your application, it is **strongly discouraged** (i.e. - we think it's an anti-pattern) to ever have a store publish actions.

```javascript
lux.publishAction( "initializePage" ); // kick off page setup
```

##### Utils

lux currently has two console utility methods:

* `lux.utils.printStoreDepTree()` - prints (in Chrome) a table of each action, and the dependency tree of participating stores, showing them in the order they will handle the action.
* `lux.utils.printActions()` - prints (in Chrome) a table of the known actions.

### What About Data I/O (e.g. - HTTP, WebSockets)
Some flux implementations handle remote data access inside stores. We believe that the best way to handle this kind of I/O is *outside* a store.

#### Why Not Inside a Store?
In addition to tightly coupling stores to a transport, making HTTP calls from a store handler requires action dispatch cycles to be asynchronous, and typically results in stores publishing actions of their own when responses have been recieved. This scenario undermines the benefits gained from a clean uni-directional data flow and removes the predictable nature of knowing where state changes originated from.

#### So How Do We Do It?
In our apps, we have an API wrapper module (it could wrap `$.ajax`, a WebSocket lib, or whatever you use - we usually wrap [halon](https://github.com/leankit-labs/halon)). This API module uses the `lux.mixin.actionCreator` and `lux.mixin.actionListener` mixins so that it listens for actions (much like the Dispatcher does), and it can also publish actions (when a response is received, for example). For example:

```javascript
var api = lux.actionCreatorListener( {
    handlers: {
        cartCheckout: function( products ) {
            shop.buyProducts( products, function() {
                this.publishAction( "successCheckout", products );
            }.bind( this ) );
        },
        getAllProducts: function() {
            shop.getProducts( function( products ) {
                this.publishAction( "receiveProducts", products );
            }.bind( this ) );
        },
    }
} );
```

The above API wrapper listens for `cartCheckout` and `getAllProducts` actions, and is capable of publishing `successCheckout` and `receiveProducts` actions. Check out the "Examples and More" section at the bottom if you're interested in seeing more.

## What It Lacks & Other Caveats

* A Store implementation that utilizes immutable.js
* An API wrapper for things like HTTP/websockets, etc.
* Debug helpers/add-ons to enhance dev-time visibility

## Dependencies

* [lodash](https://lodash.com/)
* [postal](https://github.com/postaljs/postal.js)
* [machina](https://github.com/ifandelse/machina.js)
* [babel polyfill](https://babeljs.io/docs/usage/polyfill/) lux is written in ES6 and then transpiled to ES5, so you need to include the babel polyfill either in your build, or on your page(s) before lux is loaded. (The polyfill is necessary because lux uses generator functions.) babel is a peer dependency of lux.

>NOTE: If you're using bower, you will need to grab the babel polyfill and include it manually. If you're using npm, you will need to `npm install babel` in your project.

### Optional Dependencies

* [ReactJS](http://facebook.github.io/react/) – The `lux.reactMixin` mixins are made to work with React. Lux only needs a reference to React if you plan on using `lux.component` and `lux.controllerView` methods. In that case, calling `lux.initReact( React )` will allow those methods to work with your version of React.

## Installation

### To build the project:

* navigate to root of project and run `npm install`
* type `gulp` in the console.
* built files appear under `/lib` in the project root.

###To Run Tests:
* `gulp test` runs the tests using webpack + karma
* `gulp mocha` runs the tests in node using mocha + jsdom
* `gulp coverage` runs istanbul coverage reporter in console (and generates an .html report)
* `gulp watch` starts a watch task to auto-build if the `src/` changes, and to run the mocha tests if the `spec/` directory or built output in `lib/` changes.

### Examples and More:
* [Doug Neiner](https://twitter.com/dougneiner) has created a great example app [here](https://github.com/LeanKit-Labs/lux-mail-example).
* Check out the [flux-comparison](https://github.com/voronianski/flux-comparison) project so you can see what lux looks like compared to other great flux implementations.
