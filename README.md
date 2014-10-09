#luxJS (v0.2.0)

##Be Warned
This project is experiencing a lot of flux (yes, we love puns). The API will change. This README will change. Change will change. Hope and Change. Don't go changin', to try to please me...

##What Is It
luxJS is an *opinionated* implementation of a Flux architecture using ReactJS, postal.js and machina.js. In a nutshell, the React components, dispatcher and stores are *highly* de-coupled. Here's a gist of the opinions at play:

* *All* communication happens via message passing.
* Each message payload should be fully serializable(!)
* Components use an ActionCreator API as a proxy to stores.
* Stores should never *ever* **EVER** be used directly. You should ONLY communicate with a store via ActionCreator APIs, or an equivalent message-capable API that follows the lux message contracts for these operations.
* ActionCreator APIs generate message payloads that are routed to the Dispatcher, which handles when and how the stores are told to handle the actions.
* The Dispatcher spins up an ActionCoordinator for any action being processed. The ActionCoordinator ensures that all stores involved in an action perform their tasks in the correct order.
* Once all stores involved in processing an action have completed their tasks, the ActionCoordinator signals (via msg) that it's OK for the stores to event their changes out.
* ControllerViews (see below) that are wired up to listen to specific stores will receive their updates, etc.

###The Pieces
####ControllerViews
A ControllerView is a component that contains state that will be updated from a store - they will typically appear at the top (or near) of logical sections of your component tree. In lux, a ControllerView gets two primary mixins: `luxAction` and `luxStore` (see the section on mixins below for more information on the mixins' API). The `luxAction` mixin gives the ControllerView an `ActionCreator` API for the specified store(s). The `luxStore` mixin wires the component into the bus to listen for updates from the specified store(s).

You get an instance of a ControllerView by calling `lux.createControllerView()`. For example, the ControllerView below is being given an ActionCreator API for the "board" store, and is also listening to the board store for data:


```javascript
var LaneSelector = lux.createControllerView({

    getActionsFor: ["board"],

    stores: {
    	// `listenTo` can also be an array of store namespaces
    	// like [ "board", "card", "user" ], etc.
    	// We're only listening to one store here, so we're
    	// using the string namespace shortcut to specify it
        listenTo: "board",

        // The `stores` argument contains a top level property
        // for each store listed in `listenTo` above
        onChange: function(stores) {
            var newState = data.board.state[this.props.boardId];
            this.setState(newState);
        },

        // immediate: t/f - optional (defaults to false). True tells
        // store(s) to notify component of state during componentWillMount
        // and when state is received the above `onChange` fn is invoked
        immediate: true
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

As of v0.2.0, a lux ControllerView will wait on all the stores involved in an action to send state changes before it calls `setState`. This means your component will only call render once even if it's listening to multiple stores that change state during an action dispatch.

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
This Dispatcher listens for actions that are dispatched by Components using ActionCreator APIs. Underneath, it's an FSM. While only *currently* allowing one action at at time, it will be expanded in the future to allow for more fine-tuned throttling, etc. You don't have to do anything special, lux creates a single dispatcher instance for you.

####ActionCoordinator
The Dispatcher will stand one of these up any time it processes an action. An ActionCoordinator is also an FSM underneath. A tree structure of stores is passed to the ActionCoordinator as it stands up. The store action handlers are invoked in as parallel a fashion as possible. Once complete, the ActionCoordinator tells the stores to notify any listening components of state changes. You do not have to create an ActionCoordinator, the Dispatcher does this for you.

####Store
A store should contain your data as well as any business logic related to that data. A lux Store can be created by using the Store constructor (i.e. - `var store = new lux.Store({ /* options */ })`. A store should always have a `namespace` (just a logical name for it) and it will have any number of action `handlers`. What you name an action handler on a store is important, as the same name will be used on the corresponding ActionCreator API. A store action handler can return a value synchronously, or return a promise. Inside the action handler is where you'd manage storing/retrieving your data (in memory, local storage, over HTTP, etc.). Stores contain the following methods:

* `getState` - synchronously returns the in-memory/cached state of a store (you're not required to cache locally, but this is there for your convenience).
* `setState` - works much like a component's `setState` method (via shallow extending/assigning) - synchronously updates the in-memory/cached state of a store.
* `replaceState` - works like `setState` but replaces the existing state with what you pass in.
* `flush` - causes a notification to be sent out (via message) containing an optional list of changed keys (properties) as well as the updated state for a store.
* `dispose` - removes all message bus subscriptions for a store, effectively disabling it from being used any further.
* `handlePayload` - message bus subscription handler for any actions being relayed by the Dispatcher.

For example, the store below has a namespace of "board", and it contains two action handlers - `toggleLaneSelection` and `loadBoard`:

```javascript
var boardStore = new lux.Store({
	namespace: "board",
	handlers: {
		toggleLaneSelection: function( boardId, laneId ) {
			var boards = this.getState();
			var target = boards[ boardId ] && boards[ boardId ].lookup[ laneId ];
			if ( target ) {
				target.isActive = !target.isActive;
				toggleAncestors( boards[ boardId ].lookup, target );
				toggleDescendants( target );
				return target;
			}
		},
		loadBoard: function( boardId ) {
			return $.ajax( {
				url: "/board/" + boardId,
				dataType: "json"
			} ).then( function( resp ) {
				var placeholder = {};
				placeholder[ boardId ] = parser.transform( resp );
				this.setState( placeholder );
				return placeholder[ boardId ];
			}.bind( this ), function( err ) {
					console.log( err );
				}
			);
		}
	}
});
```

####ActionCreator APIs
Components don't talk to stores directly. Instead, they use an ActionCreator API as a proxy to store operations. ActionCreator APIs are built automatically as stores are created. You can get one for a specific store by calling `lux.getActionCreatorFor(storeNamespace)`. If you use the luxAction mixin (or use a ControllerView or lux Component), action creator APIs will appear as top level methods on your component. The auto-generated ActionCreator APIs use the same method names as the corresponding store handler method. ActionCreator methods simply publish the correct message payload for the action. Remember that any arguments you pass to an ActionCreator method should be *fully serializable*. If you really need to, you can create your own ActionCreator API for a store, or even override the methods on an auto-generated one. You just have to honor the message contracts (see the source for information on that now....more documentation later).

####luxAction mixin
The luxAction mixin (which is provided automatically when you call `lux.createControllerView` and `lux.createComponent`) will look for a `getActionsFor` array on your component options. This array should contain the string namespace values for the store(s) the component wants ActionCreators for. The ActionCreator APIs will appear on the component as top level method names.

####luxStore mixin
The luxStore mixin (which is provided automatically when you call `lux.createControllerView`) will look for a `stores` property on your component options. This property should be an object with a `listenTo` array containing the list of store namespaces your component wants state from, and an optional `onChange` handler for when any of those stores publish state changes. Your store's data will appear on the `stores` argument, under the namespace of the store. For example, if you listen to `user`, `organization` and `orders` stores, the `stores` argument to your `onChange` handler will contain top level properties `user`, `organization` and `orders`. Each store's state will be available on their namespace under the `state` property. A default handler which simply calls `setState(stores)` is provided if you don't provide an `onChange` handler - and it will take the `state` property from each store and set it on your component's state under the store namespace.

####lux.mixin
The `lux.mixin()` method allows you to add support for lux stores and actions into any object. *You will not need to use this on React components or existing lux components.* Simply call `lux.mixin( this )` on your object, and lux will do the following steps:

1. If it finds a `stores` property on your object it will wire up stores and a store handler (Including adding the `loadState` method to your object).
2. If it finds a `getActionsFor` property on your object it will add top level methods for the needed actions.
3. It will add a `luxCleanup()` method to your object. Invoke this method during a destroy or teardown lifecycle event to cleanup the mixin's subscriptions.

##What It Lacks & Other Caveats
Boy this thing is rough. Right now it doesn't have, but *might* have soon:

* The ability to process multiple actions simultaneously, but with the Dispatcher preventing action/store collision.
* Additional mixins and/or storage strategies
* More efficient component state update utilities (possibly looking into immutability helpers).

Other thoughts:

* Stores are super rough right now. We may want finer-grained detail on what keys changed and how (add, update, delete, assignment, etc.).
* We might want to provide some out-of-the-box Stores that implement HTTP, Web Sockets, local storage and/or IndexedDB, etc.
* Cross frame/worker communication with Dispatcher and Stores needs to be tested.


##Installation & Example

###To build the project:

* navigate to root of project and run `npm install`
* type `gulp` in the console.
* built files appear under `/lib` in the project root.

### To run the example:
* navigate to the `/example` directory
* run `npm install`
* run `gulp` and your browser should open to <http://localhost:3080>
