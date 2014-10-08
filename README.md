#luxJS

##Be Warned
This is, at best, a proof-of-concept effort currently. The API will change. This README will change. Change will change. Hope and Change. Don't go changin', to try to please me...

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

    stores: [{
        store: "board",
        handler: function(data) {
            var newState = data.state[this.props.boardId];
            this.setState(newState);
        },
        // immediate: t/f - optional (defaults to false). True tells
        // store to notify component of state during componentWillMount
        // and when state is received the above `handler` fn is invoked
        immediate: true 
    }],

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

>Opinionation: In a lux app, ControllerViews are the *only* components that should be allowed listen to stores for state. Other non-ControllerViews might have internal state (that's not from a store) and that's OK, but only ControllerViews should be wired to listen to stores.

####"Normal" Lux Components
For components that need an ActionCreator API (i.e. - they need to dispatch actions), but *don't* need to listen to a store, you can call `lux.createComponent()`. For example, this component is being given an ActionCreator API for the "board" store, but is NOT listening to the board store for state, since it's not a ControllerView:

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

####Dispatcher
This Dispatcher listens for actions that are dispatched by Components using ActionCreator APIs. Underneath, it's an FSM. While only *currently* allowing one action at at time, it will be expanded in the future to allow for more fine-tuned throttling, etc. You don't have to do anything special, just new it up:

```javascript
yourApp.dispatcher = new lux.Dispatcher();
```

####ActionCoordinator
The Dispatcher will stand one of these up any time it processes an action. An ActionCoordinator is also an FSM underneath. A tree structure of stores is passed to the ActionCoordinator as it stands up. The store action handlers are invoked in as parallel a fashion as possible. Once complete, the ActionCoordinator tells the stores to notify any listening components of state changes. You do not have to create an ActionCoordinator, the Dispatcher does this for you.

####Store
A store should contain your data as well as any business logic related to that data. A lux Store can be created by calling `lux.createStore()`. A store should always have a `namespace` (just a logical name for it) and it will have any number of action handlers. What you name an action handler on a store is important, as the same name will be used on the corresponding ActionCreator API. A store action handler can return a value synchronously, or return a promise. Inside the action handler is where you'd manage storing/retrieving your data (in memory, local storage, over HTTP, etc.). Stores contain the following methods:

* `getState` - returns a promise, that when resolved will pass the current state of the store to the callback.
* `setState` - works much like a component's `setState` method (via shallow extending/assigning).
* `replaceState` - works much like a component's `replaceState` method.
* `flush` - causes a notification to be sent out (via message) containing a list of changed keys (properties) as well as the updated state for a store.
* `dispose` - removes all message bus subscriptions for a store, effectively disabling it from being used any further.
* `handlePayload` - message bus subscription handler for any actions being relayed by the Dispatcher.

For example, the store below has a namespace of "board", and it contains two action handlers - `toggleLaneSelection` and `loadBoard`:

```javascript
var boardStore = lux.createStore({
	namespace: "board",
	handlers: {
		toggleLaneSelection: function(boardId, laneId) {
			return this.getState().then(
				function(boards) {
					var target = boards[boardId] && boards[boardId].lookup[laneId];
					if(target) {
						target.isActive = !target.isActive;
						toggleAncestors(boards[boardId].lookup, target);
						toggleDescendants(target);
						return target;
					}
				}
			);
		},
		loadBoard: function(boardId) {
			return $.ajax({
				url: "/board/" + boardId,
				dataType: "json"
			}).then(
				function(resp) {
					var placeholder = {};
					placeholder[boardId] = parser.transform(resp);
					this.setState(placeholder);
					return placeholder[boardId];
				}.bind(this),
				function(err) { console.log(err); }
			);
		}
	}
});
```

The options argument passed to `lux.createStore` takes an optional `transportStrategy` property. By default, lux will use the `InMemoryTransport` strategy- which acts as an in-memory cache for your data (you can still retrieve data from over the wire/localStorage, etc.). You can easily implement your own transport strategy - please see the `InMemoryTransport` class in the source for more information. (I will document this more later on.)

####ActionCreator APIs
Components don't talk to stores directly. Instead, they use an ActionCreator API as a proxy to store operations. ActionCreator APIs are built automatically as stores are created. You can get one for a specific store by calling `lux.getActionCreatorFor(storeNamespace)`. If you use the luxAction mixin (or use a ControllerView or lux Component), action creator APIs will appear under this.actions.storeNamespace. The auto-generated ActionCreator APIs use the same method names as the corresponding store handler method. ActionCreator methods simply publish the correct message payload for the action. Remember that any arguments you pass to an ActionCreator method should be *fully serializable*. If you really need to, you can create your own ActionCreator API for a store, or even override the methods on an auto-generated one. You just have to honor the message contracts (see the source for information on that now....more documentation later).

####luxAction mixin
The luxAction mixin (which is provided automatically when you call `lux.createControllerView` and `lux.createComponent`) will look for a `getActionsFor` array on your component options. This array should contain the string namespace values for the store(s) the component wants ActionCreators for. The ActionCreator APIs will appear on the component under `this.actions.storeNamespace`.

####luxStore mixin
The luxStore mixin (which is provided automatically when you call `lux.createControllerView` and `lux.createComponent`) will look for a `stores` array on your component options. The elements in this array should either be the string namespace of a store, or an object containing a `store` property that's the string namespace and a `handler` property that's a method that takes a data argument (updated state from a store) and handles updating the component's state. A default handler which simply calls `setState(newData)` is provided if you just use the store's string namespace as the value in the array.

####lux.mixin
The `lux.mixin()` method allows you to add support for lux stores and actions into any object. *You will not need to use this on React components or existing lux components.* Simply call `lux.mixin( this )` on your object, and lux will do the following steps:

1. If it finds a `stores` property on your object it will wire up stores and store handlers (Including adding the `loadState` method to your object).
2. If it finds a `getActionsFor` property on your object it will add top level methods for the needed actions.
3. It will add a `luxCleanup()` method to your object. Invoke this method during a destroy or teardown lifecycle event to cleanup the mixin's subscriptions.

##What It Lacks & Other Caveats
Boy this thing is rough. Right now it doesn't have, but *might* have soon:

* The ability to process multiple actions simultaneously, but with the Dispatcher preventing action/store collision.
* Additional mixins and/or storage strategies
* More efficient component state update utilities (possibly looking into immutability helpers).

Other thoughts:

* Stores are super rough right now. We may want finer-grained detail on what keys changed and how (add, update, delete, assignment, etc.).
* We might want to provide some out-of-the-box storage strategies that implement HTTP, Web Sockets, local storage and/or IndexedDB, etc. 
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