/* global describe, it, before, lux, utils, luxStoreCh */

describe( "luxJS - Dispatcher", function () {
	it( "should dispatch actions to action listeners" );
	it( "should dispatch actions to dependent stores in the correct order" );
	it( "should properly handle when new stores are registered" );
	it( "should properly finish an action cycle by publishing a notify message" );
	it( "should properly finish a failed action cycle by publishing a failure message" );
});
