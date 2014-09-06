class MemoryStorage {
  constructor(state) {
    this.state = state || {};
    this.changedKeys = [];
  }

  getState() {
    return new Promise(
      function(resolve, reject) {
        resolve(this.state);
      }.bind(this)
    );
  }

  setState(newState) {
    Object.keys(newState).forEach((key) => {
      this.changedKeys[key] = true;
    });
    this.state = Object.assign(this.state, newState);
  }

  replaceState(newState) {
    Object.keys(newState).forEach((key) => {
      this.changedKeys[key] = true;
    });
    this.state = newState;
  }

  flush() {
    var changedKeys = Object.keys(this.changedKeys);
    this.changedKeys = {};
    return {
      changedKeys,
      state : this.state
    };
  }
}

class Store {
  constructor( namespace, handlers, storageStrategy ) {
		this.namespace = namespace;
    this.storage = storageStrategy;
    this.actionHandlers = transformHandlers(this, handlers);
    this.__subscription = {
      dispatch: configSubscription(this, luxCh.subscribe( `dispatch.${namespace}`, this.handlePayload )),
      notify  : configSubscription(this, luxCh.subscribe( `notify`, this.flush ))
    };
    luxCh.publish("register", {
      namespace,
      actions: buildActionList(handlers)
    });
  }

  dispose() {
    for(var [k, subscription] of entries(this.__subscription)) {
      subscription.unsubscribe();
    }
  }

  getState(...args) {
    return this.storage.getState(...args);
  }

  setState(...args) {
    return this.storage.setState(...args);
  }

  replaceState(...args) {
    return this.storage.replaceState(...args);
  }

  flush() {
    luxCh.publish(`notification.${this.namespace}`, this.storage.flush());
  }

  handlePayload(data, envelope) {
    var namespace = this.namespace;
    if(this.actionHandlers.hasOwnProperty(data.actionType)) {
      this.actionHandlers[data.actionType]
        .call( this, data )
        .then(
          (result) => envelope.reply(null, { result, namespace }),
          (err)    => envelope.reply(err)
        );
    }
  }
}

function transformHandler(store, target, key, handler) {
  target[key] = function(data) {
    var res = handler.apply(store, data.actionArgs);
    if(res instanceof Promise || ( res && typeof res.then === "function")) {
      return res;
    } else {
      return new Promise(function(resolve, reject){
        resolve(res);
      });
    }
  }
}

function transformHandlers(store, handlers) {
  var target = {};
  if(!("getState" in handlers)) {
    handlers.getState = function(...args) {
      return this.getState(...args);
    }
  }
  for (var [key, handler] of entries(handlers)) {
    transformHandler(
      store,
      target,
      key,
      typeof handler === "object" ? handler.handler : handler
    );
  }
  return target;
}

function createStore({ namespace, handlers={}, storageStrategy=new MemoryStorage() }) {
  if(namespace in stores) {
    throw new Error(` The store namespace "${namespace}" already exists.`);
  }
  
  var store = new Store(namespace, handlers, storageStrategy);
  actionCreators[namespace] = buildActionCreatorFrom(Object.keys(handlers));
  return store;
}

function removeStore(namespace) {
  stores[namespace].dispose();
  delete stores[namespace];
}