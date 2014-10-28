/* global require, module */
/* jshint -W098 */
( function( root, factory ) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "traceur", "react", "postal", "machina" ], factory );
	} else if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function( postal, machina, React ) {
			return factory(
				require("traceur"),
				React || require("react"),
				postal,
				machina);
		};
	} else {
		throw new Error("Sorry - luxJS only support AMD or CommonJS module environments.");
	}
}( this, function( traceur, React, postal, machina ) {

	var actionChannel = postal.channel("lux.action");
	var storeChannel = postal.channel("lux.store");
	var dispatcherChannel = postal.channel("lux.dispatcher");
	var stores = {};

	// jshint ignore:start
	function* entries(obj) {
		if(typeof obj !== "object") {
			obj = {};
		}
		for(var k of Object.keys(obj)) {
			yield [k, obj[k]];
		}
	}
	// jshint ignore:end

	function pluck(obj, keys) {
		var res = keys.reduce((accum, key) => {
			accum[key] = obj[key];
			return accum;
		}, {});
		return res;
	}

	function configSubscription(context, subscription) {
		return subscription.withContext(context)
		                   .withConstraint(function(data, envelope){
		                       return !(envelope.hasOwnProperty("originId")) ||
		                          (envelope.originId === postal.instanceId());
		                   });
	}

	function ensureLuxProp(context) {
		var __lux = context.__lux = (context.__lux || {});
		var cleanup = __lux.cleanup = (__lux.cleanup || []);
		var subscriptions = __lux.subscriptions = (__lux.subscriptions || {});
		return __lux;
	}

	//import("./actionCreator.js");
	//import("./mixins.js");
	//import("./store.js");
	//import("./actionCoordinator.js");
	//import("./dispatcher.js");

	// jshint ignore: start
	return {
		actionCreators,
		createActionGroup,
		createComponent,
		createControllerView,
		customActionCreator,
		dispatcher,
		getActionCreatorFor,
		mixin: mixin,
		removeStore,
		Store
	};
	// jshint ignore: end

}));
