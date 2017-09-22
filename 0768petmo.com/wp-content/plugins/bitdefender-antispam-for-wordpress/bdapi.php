<?php
/**
*
* @package BitdefenderAntispam
* @version 0.1
* @copyright (c) 2010 Bitdefender
* @license http://opensource.org/licenses/gpl-license.php GNU Public License
**/

define('BD_SCANNER_TIMEOUT', '3');

define('BD_HOST', '91.199.104.17');    
if (!defined('BD_PATH')){
  define('BD_PATH', '/blogspam/0.1');
 }
define('BD_PORT', '80');    
define('BD_TIMEOUT', '10');    

define('BD_DEBUG', 0);
define('BD_CHECK_COOKIE_EXPIRE', 60);

function bd_perform($method, $post_vars, $client_id, $charset = 'UTF-8', $service = BD_SERVICE_TYPE)
{
 
  $post='';

  if (is_array($post_vars) || is_object($post_vars))
    foreach($post_vars as $key=>$val){
      if (is_scalar($key) && is_scalar($val))
	$post .= urlencode($key).'='.urlencode($val).'&';
    }
  else 
    return -1;
  
  $get_variables = "authVersion=1&client_id=". $client_id;
  $req  = "POST ".BD_PATH."/$method?$get_variables HTTP/1.0\r\n";
  $req .= "Host: ".BD_HOST."\r\n";
  $req .= "Content-Type: application/x-www-form-urlencoded; charset=" . $charset . "\r\n";
  $req .= "Content-Length: " . strlen($post) . "\r\n";
  $req .= "\r\n";
  $req .= $post;
  $rsp = array("","");
  if ($fs = @fsockopen(BD_HOST, BD_PORT, $errno, $errstr, BD_TIMEOUT)){
    stream_set_timeout($fs, BD_TIMEOUT);
    
    fwrite($fs, $req);
    $metadata = stream_get_meta_data($fs);
    while(!feof($fs) && !$metadata['timed_out']){
      $rsp .= fgets($fs, 1160);
      $metadata = stream_get_meta_data($fs);     
    }
    fclose($fs);
    if (!$metadata['timed_out']){
      $rsp = explode("\r\n\r\n", $rsp);
    }else{
      $result['response_type'] = 'error';
      $result['message'] = 'Client timeout';
    }
  }else{
    $result['response_type'] = 'error';
    $result['message'] = $errstr;
  }
  
  $status_line = explode("\r\n", $rsp[0]);
  if (count($status_line) < 1){
    $result['response_type'] = 'error';
    $result['message'] = 'Invalid HTTP response';
	return $result;
  }
  $response_code = explode(' ', $status_line[0], 3);  
  if (count($response_code) != 3){
    $result['response_type'] = 'error';
    $result['message'] = 'Invalid HTTP response';
	return $result;
  } else {
	$response_message = $response_code[2];
	$response_code = $response_code[1];
  }
  
  if (strncmp($response_code, '2', 1)){
	$result['response_type']='error';
	$result['message'] = $response_message;
	return $result;
  }

  $parser = xml_parser_create();
  xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
  xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
  $tmp = xml_parse_into_struct($parser, $rsp[1], $xml_values);

  if ( !$tmp ) {
    $result['response_type'] = "error";
    $result['message'] = "Invalid response";
    if (BD_DEBUG){
      echo "<pre>";
      echo $post;
      print_r($post_vars);
      print_r($rsp);
    };
    return $result;
    }
  xml_parser_free($parser);

  $result['response_type'] = $xml_values[0]['attributes']['type'];
  if ($result['response_type'] == "success"){
    $result['status'] = $xml_values[1]['value'];
  }else{
    $result['message'] = $xml_values[2]['value'];
    $result['code'] = $xml_values[3]['value'];
  }
  
  if (BD_DEBUG){
    echo  "<pre>";
    print_r($data);
    echo "$post";
    print_r($post_vars);
    print_r($xml_values);
    print_r($result);
    print_r($rsp);
    die();
  }  
  $result['xml'] = $rsp[1];
  return $result;
}

?>
