# luxJS

## What Is It
luxJS is an *opinionated* implementation of a [Flux](http://facebook.github.io/flux/docs/overview.html) architecture using ReactJS, postal.js and machina.js. In a nutshell, the React components, dispatcher and stores are *highly* de-coupled. Here's a gist of the opinions at play:

* *All* communication happens via message passing.
* Each message payload should be fully serializable(!)
* Components use an ActionCreator API as a proxy to stores.
* Store state should never *ever* **EVER** be mutated directly. In fact, it's only possible to mutate store state inside a store's action handler. For mutable operations, you should ONLY communicate with a store via the Dispatcher (using an action creator API), or an equivalent message-capable API that follows the lux message contracts for these operations.
* Stores can be used for read operations by other modules.
* ActionCreator APIs generate message payloads that are routed to the Dispatcher, which coordinates when and how the stores are told to handle the actions.
* The Dispatcher ensures that all stores involved in an action perform their tasks in the correct order.
* Once all stores involved in processing an action have completed their tasks, the Dispatcher signals (via msg) that it's OK for the stores send change notifications.
* ControllerViews (see below) that are wired up to listen to specific stores will receive their updates, etc.

### The Pieces
#### ControllerViews
A ControllerView is a component that contains state that will be updated from a store - they will typically appear at the top (or near) of logical sections of your component tree. In lux, a ControllerView gets two primary mixins: `lux.mixin.actionCreator` and `lux.mixin.store` (see the section on mixins below for more information on the mixins' API). The `actionCreator` mixin gives the ControllerView an `ActionCreator` API for the specified action(s) or action group(s). The `store` mixin wires the component into the bus to listen for updates from the specified store(s).

You get an instance of a ControllerView by calling `lux.controllerView()`. For example, the ControllerView below is being given all the actions associated with the "board" action group, and is also listening to the board store for data:


```javascript
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

As of v0.2.0, a lux ControllerView will wait on all the stores involved in an action to signal state changes before it calls `onChange`. This means your component will only call render once even if it's listening to multiple stores that change state during an action dispatch.

>Opinionation: In a lux app, ControllerViews are the *only* React components that should be allowed listen to stores for state. Other non-ControllerViews might have internal state (that's not from a store) and that's OK, but only ControllerViews should be wired to listen to stores.

#### "Normal" Lux Components
For components that need an ActionCreator API (i.e. - they need to dispatch actions), but *don't* need to listen to a store, you can call `lux.component()`. For example, this component is being given an ActionCreator API for the "board" store (which adds the `toggleLaneSelection` method to the component), but is NOT listening to the board store for state, since it's not a ControllerView:

```javascript
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

> What if I have a component that doesn't care about listening to stores or dispatching actions?

I'm glad you asked. We use normal React components for those concerns. Lux is there to *complement*, not take the place of nor hide React.

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
		this.dispatchAction("myActionName", something, anotherThing);
	}
});
```

#### lux.mixin.actionCreator mixin
The `actionCreator` mixin (which is provided automatically when you call `lux.controllerView` and `lux.component`) will look for a `getActionGroup` array or a `getActions` array on your component options. The `getActionGroup` array should contain the string action group name(s) that contain the actions you want. The `getActions` should contain the action names you want on the component (you can use either or both). The ActionCreator APIs will appear on the component as top level method names.

#### lux.mixin.store mixin
The `store` mixin (which is provided automatically when you call `lux.createControllerView`) will look for a `stores` property on your component options. This property should be an object with a `listenTo` array containing the list of store namespaces your component wants state from, and an `onChange` handler for when any of those stores publish state changes. You will need to include the store(s) as module dependencies to access their state from within the handler.

#### lux.mixin.actionListener
The `actionListener` mixin wires an instance into the message bus to listen for `execute.*` messages on the `lux.action` channel. The subscription handler looks for a `handlers` property on the instance it's mixed into, and will fire any method that matches the action type passed on the message envelope. This is useful for integration non-lux modules into lux operations. For example, you may have a "remote data" (i.e. - HTTP/websockets) wrapper that uses this mixin to listen for actions that indicate an AJAX request needs to be made, etc.

#### lux.mixin
The `lux.mixin()` method allows you to add support for lux stores and actions into any object. *You will not need to use this on React components or existing lux components.* Simply call `lux.mixin( this )` on your object, and lux will do the following steps:

1. If it finds a `stores` property on your object it will wire up stores and the `onChange` handler.
2. If it finds a `getActionGroup` or `getActions` property on your object it will add top level methods for the needed actions.
3. It will add a `luxCleanup()` method to your object. Invoke this method during a destroy or teardown lifecycle event to cleanup the mixin's subscriptions.

You can also specify the lux mixins you wish to use by calling `lux.mixin(taget, lux.mixin.actionListener, lux.mixin.store);`.

#### Other Helpers
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
				this.dispatchAction("boardLoaded", boardId, board);
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

##### Utils

lux currently has two console utility methods:

* `lux.utils.printStoreDepTree()` - prints (in Chrome) a table of each action, and the dependency tree of participating stores, showing them in the order they will handle the action.
* `lux.utils.printActions()` - prints (in Chrome) a table of the known actions.

## What It Lacks & Other Caveats
Boy this thing is rough. Right now it doesn't have, but *might* have soon:

* A Store implementation that utilizes immutable.js
* An API wrapper for things like HTTP/websockets, etc.
* Debug helpers/add-ons to enhance dev-time visibility

## Dependencies

* [ReactJS](http://facebook.github.io/react/) (NOTE: ReactJS is a *peer dependency*. You will need to make sure you include it in your project's dependencies.)
* [postal](https://github.com/postaljs/postal.js)
* [machina](https://github.com/ifandelse/machina.js)
* [6to5 polyfill](https://6to5.org/docs/usage/polyfill/) lux is written in ES6 and then transpiled to ES5, so you need to include the 6to5 polyfill either in your build, or on your page(s) before lux is loaded. (The polyfill is necessary because lux uses generator functions.) 6to5 is a peer dependency of lux.

>NOTE: If you're using bower, you will need to grab the 6to5 polyfill and include it manually. If you're using npm, you will need to `npm install 6to5` in your project.

## Installation & Example

### To build the project:

* navigate to root of project and run `npm install`
* type `gulp` in the console.
* built files appear under `/lib` in the project root.

###To Run Tests:
* `npm test` runs a console test suite
* `npm run coverage` runs istanbul coverage reporter in console (and generates an .html report)
* `npm run show-coverage` opens the above coverage report in your browser (if you're on a Mac)

### To run the example:
* navigate to the `/example` directory
* run `npm install`
* run `gulp` and your browser should open to <http://localhost:3080>
