define(["lux"], function ( lux ) {
	var OtherLogger = function() {
		this.initialize.apply( this, arguments );
	};

	OtherLogger.prototype = {
		constructor: OtherLogger,
		getActionsFor: ["board"],
		stores: {
			listenTo: "board",
			onChange: function( data ) {
				console.log( "OTHER LOGGER", "Received new state", data );
			}
		},
		initialize: function () {
			lux.mixin( this );
		},
		teardown: function () {
			this.luxCleanup();
		}
	};

	return OtherLogger;
});
