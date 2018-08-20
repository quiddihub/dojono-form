"use strict" ;
window.interstitial = function( options ) {

  /*
    Override the default logging console to remove the need to wrap all the logging in conditional statements, making the code hard to read/maintain.
  */
  (function( enable_logging ) {
      //saving the original console.log function
      var preserved_console_log = console.log;

      //overriding console.log function
      console.log = function( ) {
        if ( enable_logging ) {
          if ( arguments.length == 1 ) {
            arguments[0] = '%c'+ arguments[0] ;
            arguments[1] = 'background: #e7c6ff; color: #000' ;
            arguments.length++ ;
          }
          preserved_console_log.apply( console, arguments ) ;
        }
      }
  } )( options.console_logging ) ;

  /*
  Create a new socket object. The domain should be api.dojono.co.uk in normal live operation.
  */
  this.socket = io.connect('https://' + options.domain + ':443' ) ;
  this.connected = false ;
  this.request_count_value = 0 ;
  /*
    Deal with socket connection events and related logging and notifications.
  */
  this.socket.on( 'connect', function() {
    console.log( "websocket connected" ) ;
    this.connected = true ;
    if (typeof options.on_connected === "function") {
      options.on_connected() ;
    }

  } ) ;

  this.socket.on( 'connect_error', function( error ) {
    console.log( "websocket connection_error" ) ;
    this.connected = false ;
  } ) ;

  this.socket.on( 'reconnect', function( ) {
    console.log( "websocket reconnect" ) ;
    this.connected = true ;
  } ) ;

  this.socket.on( 'reconnect_attempt', function( ) {
    console.log( "websocket reconnect_attempt" ) ;
  } ) ;

  this.socket.on( 'reconnect_error', function( ) {
  } ) ;

  /*
  Register the socket.
  */
  this.register = function( name, cb ) {
    console.log( "registering event name "+ name +" against function "+ cb )

    if (typeof cb === "function") {
      this.socket.on( name, cb ) ;
    } else {
      console.log( 'registered '+ name +' but cb, '+ cb +' is not a function.' ) ;
    }

  } ;
  /*
    Send some thing over the socket.
  */
  this.send = function( name, data ) {
    console.log( "sending data to "+ name )
    console.log( "data is: ", data ) ;
    this.socket.emit( name, data ) ;
  } ;
  /*
    Undo our handywork.
  */
  this.deregister = function( ) {
    this.socket.close( ) ;
  } ;
  /*
    Is the socket connected?
  */
  this.connected = function( ) {
    return this.connected ;
  }
  /*
    Helper functions.
  */
  this.get_cookie = function( cname ) {
    var name = cname + "=" ;
    var decoded_cookie = decodeURIComponent( document.cookie ) ;
    var ca = decoded_cookie.split( ';' ) ;
    for( var i = 0; i <ca.length; i++ ) {
      var c = ca[i];
      while ( c.charAt(0) == ' ' ) { c = c.substring(1) ; }
      if ( c.indexOf(name) == 0 ) {
        return c.substring( name.length, c.length ) ;
      }
    }
    return "" ;
  } ;

  this.set_cookie = function( cname, cvalue, exdays, path ) {
    var d = new Date();
    d.setTime( d.getTime() + ( exdays*24*60*60*1000 ) ) ;
    var expires = "expires="+ d.toUTCString( );
    document.cookie = cname +"="+ cvalue +";"+ expires +";path=/"+ path ;
  } ;

  /*
    Extract the GA code from dataLayer (used by gtag) if it has been defined.
  */
  this.get_ga_code = function() {
    var code = undefined ;
    if ( window.dataLayer ) {
      for ( var i=0; i<window.dataLayer.length; i++) {
        var item = window.dataLayer[1].valueOf() ;
        console.log( item ) ;
        if ( item[0] == 'config' ) {
          code = item[1] ;
        }
      }
    }
    return code ;
  }

  this.query_string = function( name ) {
    var url = window.location.href ;
    name = name.replace( /[\[\]]/g, "\\$&" ) ;
    var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ), results = regex.exec( url ) ;
    if ( !results ) return null ;
    if ( !results[2] ) return '' ;
    return decodeURIComponent( results[2].replace( /\+/g, " " ) ) ;
}

  this.request_count = function() {
    return this.request_count_value ;
  }
  this.request_counter = function() {
    return this.request_count_value++ ;
  }
  /*
    Return the amount of time the script will wait before abandoning the task.
  */
  this.total_wait_time = function() {
//    return 600 * 1000 ;
    return 6 * 1000 ;
  }
  this.interval_timer = function() {
    return 5 * 1000 ;
  }
}
