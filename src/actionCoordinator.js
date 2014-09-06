function processGeneration( generation, action ) {
  return Promise.all(
   [
      for ( store of generation ) luxCh.request( {
        topic: `dispatch.${store.namespace}`,
        data: action
      } ) ] ).then(
    ( responses ) => {
      for ( var response of responses ) {
        this.stores[ response.namespace ] = this.stores[ response.namespace ] || {};
        this.stores[ response.namespace ].result = response.result;
      }
    } );
}
/*
	Example of `config` argument:
	{
		generations: [],
		action : {
			actionType: "",
			actionArgs: []
		}
	}
*/
class ActionCoordinator extends machina.Fsm {
  constructor( config ) {
    Object.assign( this, {
      generationIndex: 0,
      stores: {}
    }, config );
    super( {
      initialState: "uninitialized",
      states: {
        uninitialized: {
          start: "dispatching"
        },
        dispatching: {
          _onEnter() {
            Promise.all(
       			[ for ( generation of config.generations ) processGeneration.call( this, generation, config.action ) ]
       		).then( function( ...results ) {
              this.results = results;
              this.transition( "success" );
            }.bind( this ), function( err ) {
              this.err = err;
              this.transition( "failure" );
            }.bind( this ) );
          },
          _onExit: function() {
            luxCh.publish( "dispatchCycle" )
          }
        },
        success: {
          _onEnter: function() {
            luxCh.publish( "notify", {
              action: this.action
            } );
            this.emit( "success" );
          }
        },
        failure: {
          _onEnter: function() {
            luxCh.publish( "failure.action", {
              action: this.action,
              err: this.err
            } );
            this.emit( "failure" );
          }
        }
      }
    } );
  }
  success( fn ) {
    this.on( "success", fn );
    if ( !this._started ) {
      setTimeout( () => this.handle( "start" ), 0 );
      this._started = true;
    }
    return this;
  }
  failure( fn ) {
    this.on( "error", fn );
    if ( !this._started ) {
      setTimeout( () => this.handle( "start" ), 0 );
      this._started = true;
    }
    return this;
  }
}