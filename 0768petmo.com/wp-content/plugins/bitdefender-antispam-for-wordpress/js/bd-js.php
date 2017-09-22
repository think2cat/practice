<?php
include_once('../../../../wp-config.php');
include_once('../../../../wp-includes/wp-db.php');

header('Content-Type: application/x-javascript');
session_start();
$no_cookies=0;
if (isset($_SESSION['bd_session']['keys']['js_cookie_name'])){
  $bd_js_cookie_name = $_SESSION['bd_session']['keys']['js_cookie_name'];
 }
 else $no_cookies=1;
if (!$no_cookies){
  if (isset($_SESSION['bd_session']['keys']['js_cookie_value'])){
    $bd_js_cookie_value = $_SESSION['bd_session']['keys']['js_cookie_value'];
  }else
    $no_cookies=1;
 }
if ($no_cookies)
  die();
?>

function GetCookie( name ) { 
	var start = document.cookie.indexOf( name + '=' ); 
	var len = start + name.length + 1; 
	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) { 
	  return null; 
	} 
	if ( start == -1 ) return null; 
	var end = document.cookie.indexOf( ';', len ); 
	if ( end == -1 ) end = document.cookie.length; 
	return unescape( document.cookie.substring( len, end ) ); 
}  
	
function SetCookie( name, value, expires, path, domain, secure ) { 
	var today = new Date(); 
	today.setTime( today.getTime() ); 
	if ( expires ) { 
		expires = expires * 1000 * 60 * 60 * 24; 
	} 
	var expires_date = new Date( today.getTime() + (expires) ); 
	document.cookie = name+'='+escape( value ) + 
	  ( ( expires ) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString() 
	  ( ( path ) ? ';path=' + path : '' ) + 
	  ( ( domain ) ? ';domain=' + domain : '' ) + 
	  ( ( secure ) ? ';secure' : '' ); 
}  
	
function DeleteCookie( name, path, domain ) { 
	if ( getCookie( name ) ) 
	  document.cookie = name + '=' + 
	    ( ( path ) ? ';path=' + path : '') + 
	    ( ( domain ) ? ';domain=' + domain : '' ) + 
	    ';expires=Thu, 01-Jan-1970 00:00:01 GMT'; 
} 
// Cookie Handler :: END  
 
function commentValidation() { 
  SetCookie(<?php echo "'$bd_js_cookie_name'"?>,<?php echo "'$bd_js_cookie_value'" ?>,'','/');
}  
 
commentValidation();  

