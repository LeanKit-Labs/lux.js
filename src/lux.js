( function( root, factory ) {
  if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( [ "traceur", "react", "postal.request-response", "machina" ], factory );
  } else if ( typeof module === "object" && module.exports ) {
    // Node, or CommonJS-Like environments
    module.exports = function( postal, machina ) {
      return factory( require("traceur"), require("react"), postal, machina, this );
    }
  } else {
    throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
  }
}( this, function( traceur, React, postal, machina, global, undefined ) {
  
  var luxCh = postal.channel( "lux" );
  var stores = {};

  function* entries(obj) {
    for(var k of Object.keys(obj)) {
      yield [k, obj[k]];
    }
  }

  function configSubscription(context, subscription) {
    return subscription.withContext(context)
                       .withConstraint(function(data, envelope){
                          return !(envelope.hasOwnProperty("originId")) || 
                           (envelope.originId === postal.instanceId())
                       });
  }

  //import("./actionCreator.js");
  //import("./store.js");
  //import("./actionCoordinator.js");
  //import("./dispatcher.js");
  //import("./components.js");

  return {
    channel: luxCh,
    stores,
    createStore,
    createControllerView,
    createComponent,
    removeStore,
    Dispatcher,
    ActionCoordinator,
    getActionCreatorFor( store ) {
      return actionCreators[store];
    }
  };

}));