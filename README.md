<img src="logo.png?raw=true&amp;v=2" width="375" height="128" alt="lux.js: Illuminating React" />

## What Is It
lux.js is an implementation of a [Flux](http://facebook.github.io/flux/docs/overview.html) architecture using ReactJS, postal.js and machina.js. In a nutshell, the React components, dispatcher and stores are highly de-coupled. Here's a gist of the opinions at play:

* Components use a luxWrapper as a proxy to stores.
* The lux dispatch method generates message payloads that are routed to the Dispatcher. This coordinates when and how the stores and action listeners are told to handle the actions.
* Store operations are synchronous.
* Store state is not mutated directly\*. In fact, it's only possible to mutate store state inside a store's action handler. Communication with a store is done via the Dispatcher (by dispatching an action), or an equivalent message-capable API that follows the lux message contracts for these operations.
* Other modules can take a dependency on a store for read-only operations.
* Once all stores involved in processing an action have completed their tasks, the Dispatcher signals (via msg) that it's OK for the stores to send change notifications.
* luxWrapped components (see below) that are wired up to listen to specific stores will receive their updates, etc.
* All communication happens via message passing.
* Each message payload should be fully serializable(!)

\* _Due to not forcing immutable objects, its possible to change state via reference, but the Store apis encourage explicitly getting and setting state  and the setState helper is only functional in a store's action handler._

## Example Usage

This is a very simple example showing a single store and a lux wrapped component. You can [play with this example online](https://codesandbox.io/embed/lux-js-example-wr5is).

### store.js
```js
import { Store } from "lux.js";

export default new Store( {
	namespace: "light",
	state: {
		light: "off"
	},
	handlers: {
		"toggleLight"() {
			const { light } = this.getState();
			this.setState( {
				light: light === "off" ? "on" : "off"
			} );
		}
	},
	getLightStatus() {
		return this.getState().light;
	}
} );
```

### LightMode.js
```js
import React from "react";
import { luxWrapper, dispatch } from "lux.js";
import lightStore from "./store";

function LightMode({ lightStatus, onToggleLight }) {
	return (
		<div>
			<p>
				Light Status: <b>{lightStatus}</b>
			</p>
			<div className={`light light-${lightStatus}`}>
				<i className="fa fa-lightbulb fa-3x" />
			</div>
			<button onClick={onToggleLight}>Toggle Light</button>
		</div>
	);
}

export default luxWrapper(LightMode, {
	stores: ["light"],
	getState() {
		return {
			lightStatus: lightStore.getLightStatus()
		};
	},
	actions: {
		onToggleLight() {
			dispatch("toggleLight");
		}
	}
});
```

## Development

### To build the project:

```shell
$ npm install
$ npm run build
```

Built files appear under `/lib` in the project root.

### To run tests:

```shell
npm test
```

### Examples and More:
* [Doug Neiner](https://twitter.com/dougneiner) has created a great example app [here](https://github.com/LeanKit-Labs/lux-mail-example).
* Check out the [flux-comparison](https://github.com/voronianski/flux-comparison) project so you can see what lux looks like compared to other great flux implementations.
