define(["lux"], function ( lux ) {
	var OtherLogger = function() {
		this.initialize.apply( this, arguments );
	};

	OtherLogger.prototype = {
		constructor: OtherLogger,
		getActionsFor: ["board"],
		stores: [
			{
				store: "board",
				handler: function( data ) {
					console.log( "OTHER LOGGER", "Received new state", data );
				}
			}
		],
		initialize: function () {
			lux.mixin( this );
		},
		teardown: function () {
			this.luxCleanup();
		}
	};

	return OtherLogger;
});
