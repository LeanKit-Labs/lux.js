define(["lux"], function ( lux ) {
	var OtherLogger = function() {
		this.initialize.apply( this, arguments );
	};

	OtherLogger.prototype = {
		constructor: OtherLogger,
		getActionGroup: ["api"],
		stores: {
			listenTo: [ "board", "logging" ],
			onChange: function( data ) {
				console.log( "OTHER LOGGER", "Received new state", data );
			},
			immediate: false
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
