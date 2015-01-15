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

	var mergeBehavior = {
        "*": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = sourcePropVal;
        },
        "object": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = merge({}, obj[sourcePropKey] || {}, sourcePropVal);
        },
        "array": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = [];
            sourcePropVal.forEach( function (item, idx) {
                mergeBehavior[getHandlerName(item)](obj[sourcePropKey], idx, item);
            }, this);
        }
    };

    function getHandlerName(val) {
    	var propType = getType(val);
    	return mergeBehavior[propType] ? propType : "*";
    }

	function getType(val) {
		if (Array.isArray(val)) {
		    return "array";
		}
		return typeof val;
	}

	function merge() {
		var sources = Array.from(arguments);
		var target = sources.shift();
		var nextSource;
		while(nextSource = sources.shift()) {
			for(var [k,v] of entries( nextSource )) {
				mergeBehavior[getHandlerName(v)](target, k, v);
			}
		}
		return target;
	}

	function configSubscription(context, subscription) {
		return subscription.context(context)
		                   .constraint(function(data, envelope){
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
	//import("./utils.js");

	// jshint ignore: start
	return {
		actions,
		addToActionGroup,
		component,
		controllerView,
		customActionCreator,
		dispatcher,
		getActionGroup,
		actionCreatorListener,
		actionCreator,
		actionListener,
		mixin: mixin,
		removeStore,
		Store,
		stores,
		utils
	};
	// jshint ignore: end

}));
