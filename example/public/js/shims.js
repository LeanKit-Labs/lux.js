if ( !Array.prototype.find ) {
  Object.defineProperty( Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function( predicate ) {
      if ( this == null ) {
        throw new TypeError( 'Array.prototype.find called on null or undefined' );
      }
      if ( typeof predicate !== 'function' ) {
        throw new TypeError( 'predicate must be a function' );
      }
      var list = Object( this );
      var length = list.length >>> 0;
      var thisArg = arguments[ 1 ];
      var value;
      for ( var i = 0; i < length; i++ ) {
        if ( i in list ) {
          value = list[ i ];
          if ( predicate.call( thisArg, value, i, list ) ) {
            return value;
          }
        }
      }
      return undefined;
    }
  } );
}

if ( !Array.isArray ) {
  Array.isArray = function( arg ) {
    return Object.prototype.toString.call( arg ) === '[object Array]';
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}