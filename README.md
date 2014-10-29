#luxJS (v0.3.0-RC1)

##Be Warned
This project is experiencing a lot of flux (yes, we love puns). The API will change. This README will change. Change will change. Hope and Change. Don't go changin', to try to please me...

##What Is It
luxJS is an *opinionated* implementation of a Flux architecture using ReactJS, postal.js and machina.js. In a nutshell, the React components, dispatcher and stores are *highly* de-coupled. Here's a gist of the opinions at play:

* *All* communication happens via message passing.
* Each message payload should be fully serializable(!)
* Components use an ActionCreator API as a proxy to stores.
* Store state should never *ever* **EVER** be mutated directly. In fact, it's only possible to mutate store state inside a store's action handler. For mutable operations, you should ONLY communicate with a store via the Dispatcher (using an action creator API), or an equivalent message-capable API that follows the lux message contracts for these operations.
* ActionCreator APIs generate message payloads that are routed to the Dispatcher, which coordinates when and how the stores are told to handle the actions.
* The Dispatcher spins up an ActionCoordinator for any action being processed. The ActionCoordinator ensures that all stores involved in an action perform their tasks in the correct order.
* Once all stores involved in processing an action have completed their tasks, the ActionCoordinator signals (via msg) that it's OK for the stores send change notifications.
* ControllerViews (see below) that are wired up to listen to specific stores will receive their updates, etc.

###The Pieces
####ControllerViews
A ControllerView is a component that contains state that will be updated from a store - they will typically appear at the top (or near) of logical sections of your component tree. In lux, a ControllerView gets two primary mixins: `lux.mixin.actionDispatcher` and `lux.mixin.store` (see the section on mixins below for more information on the mixins' API). The `actionDispatcher` mixin gives the ControllerView an `ActionCreator` API for the specified action(s) or action group(s). The `store` mixin wires the component into the bus to listen for updates from the specified store(s).

You get an instance of a ControllerView by calling `lux.createControllerView()`. For example, the ControllerView below is being given all the actions associated with the "board" action group, and is also listening to the board store for data:


```javascript
var LaneSelector = lux.createControllerView({

	// In this case "board" is an action group that contains
	// at least one action called "loadBoard". Any actions
	// under the "board" action group get added as top level
	// methods to this react element.
    getActionsFor: ["board"],

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

>Opinionation: In a lux app, ControllerViews are the *only* components that should be allowed listen to stores for state. Other non-ControllerViews might have internal state (that's not from a store) and that's OK, but only ControllerViews should be wired to listen to stores.

####"Normal" Lux Components
For components that need an ActionCreator API (i.e. - they need to dispatch actions), but *don't* need to listen to a store, you can call `lux.createComponent()`. For example, this component is being given an ActionCreator API for the "board" store (which adds the `toggleLaneSelection` method to the component), but is NOT listening to the board store for state, since it's not a ControllerView:

```javascript
var Lane = lux.createComponent({

	getActionsFor: ["board"],

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

> What if I have a component that doesnt' care about listening to stores or dispatching actions?

I'm glad you asked. We use normal React components for those concerns. Lux is there to *complement*, not take the place of nor hide React.

####Dispatcher
The Dispatcher listens for actions that are dispatched by Components using ActionCreator APIs. Underneath, it's an FSM. While only *currently* allowing one action at at time, it might be expanded in the future to allow for more fine-tuned throttling, etc. You don't have to do anything special, lux creates a single dispatcher instance for you.

####ActionCoordinator
The Dispatcher will stand one of these up any time it processes an action. An ActionCoordinator is also an FSM underneath. A tree structure of stores is passed to the ActionCoordinator as it stands up. The store action handlers are invoked in the correct order, based on any dependencies that might exist. Once complete, the ActionCoordinator tells the stores to notify any listening components of state changes. You do not have to create an ActionCoordinator, the Dispatcher does this for you.

####Store
A store should contain your data as well as any business logic related to that data. A lux Store can be created by using the Store constructor (i.e. - `var store = new lux.Store({ /* options */ })`. A store should always have a `namespace` (just a logical name for it) and it will have any number of action `handlers`. What you name an action handler on a store is important, as the same name will be used on the corresponding ActionCreator API. If a store action handler returns false explicitly, it tells the action coordinator that the state of the store didn't change. However, returning undefined or any other value will result in the action coordinator assuming a change to the store state occurred during the handler's operations. Stores contain the following methods:

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

####ActionCreator APIs
Components don't talk to stores directly. Instead, they use an ActionCreator API as a proxy to store operations. ActionCreator APIs are built automatically as stores (and any other instance that uses the `lux.mixin.actionDispatcher` mixin) are created. If you use the `actionDispatcher` mixin (or use a ControllerView or lux Component), action creator APIs will appear as top level methods on your component. The auto-generated ActionCreator APIs use the same method names as the corresponding action type names. ActionCreator methods simply publish the correct message payload for the action. Remember that any arguments you pass to an ActionCreator method should be *fully serializable*. If you really need to, you can create your own ActionCreator API method - either at the component level, or globally. Implementing a method on your component that matches the name of an action allows for a component-specific override, or you can use `lux.customActionCreator` to implement your own global overrides of how an action is dispatched. You just have to honor the message contracts (see the source for information on that now....more documentation later).

####lux.mixin.actionDispatcher mixin
The `actionDispatcher` mixin (which is provided automatically when you call `lux.createControllerView` and `lux.createComponent`) will look for a `getActionsFor` array or a `getAction` array on your component options. The `getActionsFor` array should contain the string action group name(s) that contain the actions you want. The `getActionsFor` should contain the action names you want on the component (you can use either or both). The ActionCreator APIs will appear on the component as top level method names.

####lux.mixin.store mixin
The `store` mixin (which is provided automatically when you call `lux.createControllerView`) will look for a `stores` property on your component options. This property should be an object with a `listenTo` array containing the list of store namespaces your component wants state from, and an `onChange` handler for when any of those stores publish state changes. You will need to include the store(s) as module dependencies to access their state from within the handler.

####lux.mixin.actionListener
The `actionListener` mixin wires an instance into the message bus to listen for `execute.*` messages on the `lux.action` channel. The subscription handler looks for a `handlers` property on the instance it's mixed into, and will fire any method that matches the action type passed on the message envelope.

####lux.mixin
The `lux.mixin()` method allows you to add support for lux stores and actions into any object. *You will not need to use this on React components or existing lux components.* Simply call `lux.mixin( this )` on your object, and lux will do the following steps:

1. If it finds a `stores` property on your object it will wire up stores and a store handler (Including adding the `loadState` method to your object).
2. If it finds a `getActionsFor` or `getActions` property on your object it will add top level methods for the needed actions.
3. It will add a `luxCleanup()` method to your object. Invoke this method during a destroy or teardown lifecycle event to cleanup the mixin's subscriptions.

##What It Lacks & Other Caveats
Boy this thing is rough. Right now it doesn't have, but *might* have soon:

* A Store implemention that utlizes immutable.js
* An API wrapper for things like HTTP/websockets, etc.
* Debug helpers/add-ons to enhance dev-time visibility

##Dependencies

* [ReactJS](http://facebook.github.io/react/)
* [traceur](https://github.com/google/traceur-compiler) (lux is written in ES6, so it depends on the traceur runtime lib for non-ES6 environments)
* [postal](https://github.com/postaljs/postal.js)
* [machina](https://github.com/ifandelse/machina.js)

##Installation & Example

###To build the project:

* navigate to root of project and run `npm install`
* type `gulp` in the console.
* built files appear under `/lib` in the project root.

### To run the example:
* navigate to the `/example` directory
* run `npm install`
* run `gulp` and your browser should open to <http://localhost:3080>
