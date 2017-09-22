<?php
/*
Plugin Name: BitDefender Anti-Spam
Plugin URI: http://labs.bitdefender.com
Description: The Anti-Spam module from Bitdefender ensures your blog stays free of unsolicited comments, by employing some state of the art scan engines and techniques, using a web service offered freely by Bitdefender. Besides the advantage of using advanced spam filtering, it also offers comment management features beyond the capabilities of Wordpress and can be configured to work from invisible (and completely non-interfering) to highly secure.
Version: 0.7
Author: Andrei Vereha
*/


include_once('bdapi.php');


$bd_db_version= "1.0";
$bd_meta_log="";
$bd_feedback_message='';

$bd_plugin_path = dirname(__FILE__);
$bd_sub = strstr($bd_plugin_path,"/wp-content/plugins/");
if (!$bd_sub)
  $bd_plugin_path = "/wp-content/plugins/bdscan/";

if (function_exists(site_url))
  $bd_plugin_path = site_url().$bd_sub."/";
else
  $bd_plugin_path = get_option("siteurl").$bd_sub."/";

 


add_action('preprocess_comment', 'bd_check_post',1);
add_action('admin_menu', 'bd_create_menu_entries');
add_action('wp_head', 'bd_head_intercept');
add_action('comment_form', 'bd_comment_form');
add_action('get_header', 'bd_get_header');
add_filter('comment_post_redirect', 'bd_comment_redirect');
add_action('wp_set_comment_status', 'bd_report_spam_comment');
add_action('edit_comment','bd_report_spam_comment');
add_action('comment_post','bd_save_log');
add_action('admin_head','bd_admin_head');
add_action('admin_init','bd_admin_init');
add_filter('sanitize_option_bd_delete_spam_days', 'bd_sanitize_delete_days');
add_filter('sanitize_option_bd_delete_log_days',  'bd_sanitize_delete_days');
add_action('save_post', 'bd_save_post');
add_filter('comment_text','bd_comment_text');
add_filter('comment_row_actions', 'bd_comment_row_actions');
add_action('init', 'bd_powered_by_widget_register');

function bd_powered_by_widget_register()
{
  register_sidebar_widget('Powered by Bitdefender', 'bd_widget_powered_by_bitdefender');
}

function bd_widget_powered_by_bitdefender($args)
{
  global $bd_plugin_path;
  extract($args);

  echo $before_widget;
  echo $before_title;
  ?>
	Antispam Protection
	  <?php echo $after_title;
	echo '<a href="http://labs.bitdefender.com">';
	echo "<img src=".$bd_plugin_path."/powered_by_BD.jpg>";
   	echo '</a>';
	echo $after_widget;
}


function bd_check_post($c)
{
  global $bd_meta_log;
  
  if(!isset($_SESSION)){
    session_start();
  }

  $comment = array();

  foreach($c as $key=>$val)
    if (get_magic_quotes_gpc())
      $comment[stripslashes($key)] = stripslashes($val);
    else
      $comment[$key] = $val;
  $comment['client_type'] = "blog";
  $comment['client'] = get_option('home');
  $comment['language'] = get_option('bd_blog_language');
  $comment['http_referer'] = $_SERVER['HTTP_REFERER'];
  $comment['comment_agent'] = $_SERVER['HTTP_USER_AGENT'];
  $comment['comment_author_ip'] = $_SERVER['REMOTE_ADDR'];
  include_once("bdrevision.php");
  $comment['plugin_revision'] = $bd_revision;
  $user= @wp_get_current_user();
  if ($user && $user->id!=0){
    $comment['user_logged_in'] = 1;
    $comment['user_id'] = $user->id;
  }
  else
    $comment['user_logged_in'] = 0;
  
  if (isset($_SESSION['bd_session']['keys'])){    
    $keys = $_SESSION['bd_session']['keys'];
    $comment['js_enabled'] = ($_POST[$keys['input_field_name']] == $keys['input_field_value'])?1:0;
    $comment['js_cookies_enabled'] = ($_COOKIE[$keys['js_cookie_name']] == $keys['js_cookie_value'])?1:0;
    $comment['cookies_enabled'] = ($_COOKIE[$keys['cookie_name']] == $keys['cookie_value'])?1:0;
    $comment['session_time'] = time() - $_SESSION['bd_session']['started'];
    $comment['img_loaded'] = $_SESSION['bd_session']['img_loaded']?1:0;
    $comment['session_expired'] = 0;
  }else{
    $comment['session_expired'] = 1;
  }
  $comment['blog_charset'] = get_option('blog_charset');
  $comment['cyrillic_filter'] =  get_option('bd_filter_cyrillic')?"1":"0";
  $comment['asiatic_filter']  =  get_option('bd_filter_asiatic')?"1":"0";;
  $comment['aggresivity_level']  =  get_option('bd_aggresivity_level');
  
  $rez = bd_perform("scan",$comment, get_option('bd_client_id'));
  $action="";
  $verbose_rez="";
  if (BD_DEBUG){
    echo "<pre>";
    print_r($comment);
    print_r($_COOKIE);
    echo "SESSION<br>";
    print_r($_SESSION);
    echo "REZ<br>";
    print_r($rez);
    echo "USER<br>";
    die();
  };
  if ($rez['response_type']=='error'){
    $action = 'moderate';
    $verbose_rez = $rez['message'];    
    add_filter('pre_comment_approved', create_function('$a', 'return \'0\';'));		
  }elseif ($rez['response_type']=='success'){
    $action = 'pass';
    $verbose_rez = 'clean';
    if ($rez['status'] == 'spam') {
      add_filter('pre_comment_approved', create_function('$a', 'return \'spam\';'));		
      $action='move to spam';
      $verbose_rez = 'spam';
	  update_option('bd_spam_count', get_option('bd_spam_count') + 1);
    }
	update_option('bd_legit_count', get_option('bd_legit_count') + 1);
	bd_send_unscanned_comments();
  }  
  $bd_meta_log[0]=$verbose_rez;
  $bd_meta_log[1]=$action;
  bd_delete_old_spam();
  bd_delete_old_logs();
  return $c;
}


function bd_send_unscanned_comments()
{
  global $wpdb, $bd_meta_log;
  
  $table_name = $wpdb->prefix."bd_log";
  $table_comments = $wpdb->prefix."comments";
  $query = "SELECT  * 
	FROM $table_name as complete,
	(SELECT comment_id, max(timestamp)  AS mt FROM  $table_name GROUP BY comment_id) AS max_timestamp,
    $table_comments AS comments
    WHERE comments.comment_ID = complete.comment_id AND
          comments.comment_approved like '0' AND
          max_timestamp.comment_id = complete.comment_id AND 
          max_timestamp.mt = complete.timestamp AND 
          complete.action like 'moderate'
    LIMIT 2";
  // $wpdb->show_errors();
  $rez = $wpdb->get_results($query);
  $total = $wpdb->num_rows;

  if (!$total)
	return;
  
  for($i = 0; $i<$total; $i++){
	
	$c = get_comment($rez[$i]->comment_ID, ARRAY_A);
	$comment = array();
	foreach($c as $key=>$val)
	  $comment[$key] = $val;

	$comment['user_logged_in'] = $comment['user_id']!=0;
	$comment['client_type'] = "blog";
	$comment['client'] = get_option('home');
	$comment['blog_charset'] = get_option('blog_charset');
	$comment['rescan'] = 1;
	$comment['language'] = get_option('bd_blog_language');
	$comment['cyrillic_filter'] =  get_option('bd_filter_cyrillic')?"1":"0";
	$comment['asiatic_filter']  =  get_option('bd_filter_asiatic')?"1":"0";;
	$comment['aggresivity_level']  =  get_option('bd_aggresivity_level');

	include_once("bdrevision.php");
	$comment['plugin_revision'] = $bd_revision;
	$scan_rez = bd_perform("scan", $comment, get_option('bd_client_id'));

	$verbose_rez = "Rescan: ";
	$action = "moderate";
	if ($scan_rez['response_type'] == 'error'){ // unlikely, do nothing except logging
	  $action = 'moderate';
	  $verbose_rez .= $scan_rez['message'];
	} elseif ($scan_rez['response_type']=='success'){
	  $action = 'pass';
	  $verbose_rez .= 'clean';
	  $c['comment_approved'] = 1; 
	  if ($scan_rez['status'] == 'spam') {
		$action='move to spam';
		$verbose_rez .= 'spam';
		$c['comment_approved'] = 0; 
		update_option('bd_spam_count', get_option('bd_spam_count') + 1);
	  }
	  update_option('bd_legit_count', get_option('bd_legit_count') + 1);
	  wp_update_comment($c);
	}
	$bd_meta_log[0]=$verbose_rez;
	$bd_meta_log[1]=$action;
	bd_save_log($c['comment_ID']);
  }
}

function bd_generate_keys()
{
  srand(time());
  $keys['js_cookie_name'] = rand();
  $keys['js_cookie_value'] = rand();
  $keys['input_field_name'] = rand();
  $keys['input_field_value'] = rand();

  $keys['cookie_name'] = rand();
  $keys['cookie_value'] = rand();
  return $keys;
}  

function bd_comment_text($text)
{
  global $comment, $wpdb;
  
  if ($comment->comment_approved == 'spam'){
	$id = $comment->comment_ID;
	$count = $wpdb->get_var($wpdb->prepare('SELECT * FROM '.$wpdb->prefix.'bd_log  WHERE message LIKE "spam"  AND comment_id = '.$id));
	if ($count)
	  return "[Bitdefender SPAM]" . $text;
  }
  return $text;
}

function bd_save_post($post_id)
{
  $post = false;
  if (function_exists("wp_is_post_revision"))
    $post = wp_is_post_revision($post_id);
  if ($post === false)
    $post = $post_id;
  $p = get_post($post);
  if ($p->post_status != 'publish' || $p->post_type != 'post')
    return;
  $p->post_date_gmt = strtotime($p->post_date_gmt);
  $p->post_password = ($p->post_password != '')?1:0;
  $p->post_modified_gmt = strtotime($p->post_modified_gmt);
  if ($p->post_content_filtered != '')
    $p->post_content = $post_content_filtered;

  $rez = bd_perform("report_post", $p, get_option('bd_client_id'));
}

function bd_admin_init()
{
  $bd_page = isset($_GET['bd_page'])?$_GET['bd_page']:'';
  if($bd_page == 'send_feedback'){
    bd_send_feedback();  
	die();
  }
  $action = isset($_GET['action'])?$_GET['action']:'';
  if ($action == 'bd_blacklist_ip' or $action == 'bd_unblacklist_ip'){
	$comment_id = absint($_GET['c']);
	if ( !current_user_can('edit_post', $comment->comment_post_ID) )
	  comment_footer_die( __('You are not allowed to edit comments on this post.') );
	if ( !$comment = get_comment( $comment_id ) )
	  comment_footer_die( __('Oops, no comment with this ID.'));
	bd_update_blacklist($comment_id);
	$redir = admin_url('edit-comments.php');
	if ( '' != wp_get_referer() && false == $noredir && false === strpos(wp_get_referer(), 'comment.php') )
	  $redir = wp_get_referer();
	elseif ( '' != wp_get_original_referer() && false == $noredir )
	  $redir = wp_get_original_referer();
	else
	  $redir = admin_url('edit-comments.php');
	wp_redirect($redir);
	die();
  }
}

function bd_delete_old_spam()
{
  global $wpdb;
  
  $now = current_time('mysql', 1);
  $interval = bd_sanitize_delete_days(get_option('bd_delete_spam_days'));
  $wpdb->query('DELETE FROM '.$wpdb->prefix."comments WHERE DATE_SUB('$now', INTERVAL $interval DAY) > comment_date_gmt AND comment_approved='spam'");
}

function bd_delete_old_logs()
{
  global $wpdb;
  
  $now = current_time('mysql', 1);
  $interval = bd_sanitize_delete_days(get_option('bd_delete_log_days'));
  $wpdb->query("DELETE FROM ".$wpdb->prefix."bd_log WHERE DATE_SUB('$now', INTERVAL $interval DAY) > timestamp");
}

function bd_sanitize_delete_days($value)
{
  $value = (int) $value;
  if ( empty($value) ) $value = 30;
  if ( $value < -1 ) $value = abs($value);
  return $value;
}

function bd_admin_head()
{
  global $bd_plugin_path;
 
  echo "<link rel='stylesheet' href='".$bd_plugin_path."bdscan.css' type='text/css' media='all' />";
}

function bd_save_log($comment_id)
{
  global $bd_meta_log, $wpdb;
  
  if (!isset($bd_meta_log) || !isset($bd_meta_log[0]) || !isset($bd_meta_log[1]))
      return;
  $msg=""; 
  
  $action = $bd_meta_log[1];
  $msg = $bd_meta_log[0];
  $q = "INSERT INTO ".$wpdb->prefix."bd_log (comment_id,format, message, action) VALUES (".$comment_id.",1,'".$msg."','".$action."')";
  $wpdb->query($q);
}

function bd_get_header()
{
  if(!isset($_SESSION)){
    session_start(); 
  }
  if (!isset($_SESSION['bd_session']['started']))
    $_SESSION['bd_session']['started'] = time();
  if (!isset($_COOKIE["bd_check_cookie"]))
    setcookie("bd_check_cookie","1");
  //Generate keys here???
  if (!isset($_SESSION['bd_session']['keys'])){
    $keys = bd_generate_keys();
    $_SESSION['bd_session']['keys']=$keys;
  }else
    $keys = $_SESSION['bd_session']['keys'];
  if (!isset($_COOKIE[$keys["cookie_name"]]))
    setcookie($keys["cookie_name"],$keys["cookie_value"]);
}


function bd_comment_redirect($location)
{  
  if (!$_SESSION){
    session_start();
  }
  $rez = $location;
  if (!isset($_COOKIE["bd_check_cookie"])){
    $rez = str_replace("?", "?".htmlspecialchars(SID)."&", $location);  
  }
  return $rez;
}

function bd_comment_form($post_id)
{
  global $bd_plugin_path;

  if (isset($_SESSION['bd_session']['keys']))
    $keys = $_SESSION['bd_session']['keys'];
  else
    return;			// This should not happen!!!
  $sname = session_name();
  $sid = session_id();  
  ?>
    <input type="hidden" name="<?php echo $sname?>" value="<?php echo $sid ?>"/>  
       <input type="hidden" id="bd_scan_input" name="<?php echo $keys['input_field_name'] ?>" value=""/>
       <script type="text/javascript">
       document.getElementById("bd_scan_input").value = "<?php echo $keys['input_field_value'] ?>"; 
  </script>  
     <img src="<?php echo $bd_plugin_path.'img.php?'.$sname.'='.$sid ?>" alt="" height="1" width="1">
      <?php
      }

function bd_head_intercept()
{ 
  global $bd_plugin_path;
  echo '<script type="text/javascript" src="'.$bd_plugin_path.'/js/bd-js.php"></script> ';  
}

function bd_create_menu_entries()
{
  if ( function_exists('add_submenu_page')){
    add_submenu_page('plugins.php', 'BitDefender Antispam', "BitDefender Antispam",  'moderate_comments', 'bd_configure_dispacher', 'bd_configure_dispacher');
  }
}

function bd_configure_dispacher()
{
  $bd_page = isset($_GET['bd_page'])?$_GET['bd_page']:'';
						
  if ($bd_page == 'log' )
    bd_show_log();
  else if ($bd_page == 'log_settings')
    bd_log_settings();
  else if ($bd_page == 'spam_settings')
    bd_spam_settings();
  else if ($bd_page == 'feedback' || $bd_page == "send_feedback")
    bd_feedback();
  else if ($bd_page == 'stats')
    bd_stats();
  else
    bd_configure_page();   
}

function bd_stats()
{
  ?>
  <div class="wrap">
    <div id="icon-bitdefender" class="icon32"><br /></div>
	<h2>BitDefender Stats</h2>
	<?php bd_draw_menu(); ?>

  <script type="text/javascript" src="http://www.google.com/jsapi"></script> 
    <script type="text/javascript"> 
	google.load("visualization", "1", {packages:["piechart"]});
    google.setOnLoadCallback(drawChart);
  
	function drawChart() { 
	  var data = new google.visualization.DataTable();
	  data.addColumn('string', 'Task');
	  data.addColumn('number', 'Numar');
	  data.addRows(2);
	  data.setValue(0, 0, 'Spam');
	  data.setValue(0, 1, <?php echo get_option('bd_spam_count'); ?>);
	  data.setValue(1, 0, 'Legit');
	  data.setValue(1, 1, <?php echo get_option('bd_legit_count'); ?>);
	  var chart = new google.visualization.PieChart(document.getElementById('bd_chart_div'));
	  chart.draw(data, {width: 400, height: 240, is3D: true,  
			colors:[{color:'orange', darker:'darkorange'}, {color:'#00A000', darker:'#00000'}],
		title: 'Bitdefender Stats'});
	}
	
	</script>
		<br class="clear"/>
		<center> <div id="bd_chart_div"></div><br> </center>
</div>
		<?php
		
}

function bd_feedback()
{

    $action_url = add_query_arg("bd_page", "send_feedback");
?>
  <div class="wrap">
     <div id="icon-bitdefender" class="icon32"><br /></div>
     <h2>Send feedback</h2>
	 <?php if (isset($_GET['updated'])) : ?>
	 <div id="message" class="updated fade"><p><strong>Thank you!</strong></p></div>
	  <?php endif; ?>

	 <?php bd_draw_menu(); ?>
     <?php if ($bd_feedback_message != ""){ ?>
  			<div id="message" class="updated fade"><p><strong><?php echo $bd_feedback_message ?></strong></p></div>
     <?php } ?>
     <form method="post" action="<?php echo $action_url ?>">
     <?php echo wp_nonce_field('update-options') ?>
     <table class="form-table">
     <tr valign="top">				
      <th scope="row"> 
     <textarea cols="40" rows="5" id="id_feedback" name="feedback"></textarea>
     </th>					

    </tr>							
    </table>
    <p class="submit">
    <input type="submit" name="Submit" value="<?php  _e('Send feedback') ?>" />
    </p>
    </form>
    </form>

    </div>  
<?php
}

function bd_send_feedback()
{
  $post_data['feedback'] = $_POST['feedback'];
  $post_data['client']   = get_option('home');
  
  $rez = bd_perform("feedback", $post_data, get_option('bd_client_id'));
  if (strstr($rez[0],"200")===False){	// Some error
    $bd_feedback_message = $rez[1];
  }
  $to = add_query_arg(array("bd_page" => "feedback",
							"updated" => "true"));
  wp_redirect($to);

}



function bd_spam_settings()
{

?> 
  
  <div class="wrap">
    <div id="icon-bitdefender" class="icon32"><br /></div>
	<h2>BitDefender Spam options</h2>

	<?php if (isset($_GET['updated'])) : ?>
	<div id="message" class="updated fade"><p><strong><?php _e('Settings saved.') ?></strong></p></div>
	   <?php endif; ?>
	<?php bd_draw_menu(); ?>
    <form method="post" action="options.php">
	  <?php echo wp_nonce_field('update-options') ?>
      <table class="form-table">
		<tr valign="top">				
		  <th scope="row"> <label for="bd_delete_spam_days"> Delete spam older than </label> </th>					
		  <td> 
			<input type="text" name="bd_delete_spam_days" value="<?php echo get_option('bd_delete_spam_days')?>" class="small-text" /> days. </td>
		</tr>					
		<tr valign="top">				
		  <th scope="row"> <label for="bd_aggresivity_level"> Aggresivity level </label></th>					
		  <td>  
			<?php $aggresivity = get_option('bd_aggresivity_level');?>
			<select name="bd_aggresivity_level">
              <option value="0" <?php echo $aggresivity==0?"SELECTED":"" ?> >Permissive</option>							
			  <option value="1" <?php echo $aggresivity==1?"SELECTED":"" ?> >Normal</option>								
		      <option value="2" <?php echo $aggresivity==2?"SELECTED":"" ?> >Aggressive</option>						
			</select>
		</tr>					
		<tr valign="top">				
		  <th scope="row"> <label for="bd_filter_cyrillic"> Activate cyrillic filter </label> </th>					
		  <td> <input type="checkbox" name="bd_filter_cyrillic" value="1"   <?php echo get_option('bd_filter_cyrillic')?"CHECKED":""?>  </td>
		</tr>	
		<tr valign="top">				
		  <th scope="row"> <label for="bd_filter_asiatic"> Activate asiatic filter </label> </th>					
		  <td> <input type="checkbox" name="bd_filter_asiatic" value="1"   <?php echo get_option('bd_filter_asiatic')?"CHECKED":""?>  </td>
		</tr>					
				
      </table>
	  
    <input type="hidden" name="action" value="update" />
<input type="hidden" name="page_options" value="bd_delete_spam_days,bd_aggresivity_level,bd_filter_cyrillic,bd_filter_asiatic" />
    <p class="submit">
      <input type="submit" name="Submit" value="<?php  _e('Save Changes') ?>" />
    </p>
    </form>
    </div>
<?php
}

function bd_log_settings()
{
?>
  <div class="wrap">
    <div id="icon-bitdefender" class="icon32"><br /></div>
    <h2>BitDefender Log options</h2>
	<?php if (isset($_GET['updated'])) : ?>
	<div id="message" class="updated fade"><p><strong><?php _e('Settings saved.') ?></strong></p></div>
	   <?php endif; ?>

	<?php bd_draw_menu(); ?>
	<br class="clear"\>
	   <?php bd_draw_logs_submenu(); ?>
    <form method="post" action="options.php">
    <?php echo wp_nonce_field('update-options') ?>
    <table class="form-table">
    <tr valign="top">				
     <th scope="row"> <label for="bd_delete_log_days"> Delete log older than </label></th>					
     <td>  <input type="text" name="bd_delete_log_days" value="<?php echo get_option('bd_delete_log_days')?>" class="small-text" /> days. </td>
    </tr>    
    </table>
    <input type="hidden" name="action" value="update" />
    <input type="hidden" name="page_options" value="bd_delete_log_days"/>
    <p class="submit">
    <input type="submit" name="Submit" value="<?php  _e('Save Changes') ?>" />
    </p>
    </form>
    </div>
<?php

}

function bd_format_log($log)
{
  if ($log->format!=1)
    return $log;
  if (isset($log->comment_content)){
    $url=add_query_arg(array("action" => "update_blacklist",
			     "comment_id" => $log->comment_id));
    if ($log->blacklisted)
      $log->comment_author_IP .= "<br> <a href=\"$url\" >Remove from blacklist</a></span>";
    else
      $log->comment_author_IP .= "<br> <a href=\"$url\" >Blacklist</a></span>";
    $log->comment_id =  '<a href="comment.php?action=editcomment&c='.$log->comment_id.'" >'.$log->comment_id."</a>";
  }
  return $log;
}

function bd_show_log()
{
  global $wpdb;
  
  $action = isset($_GET['action']) ? $_GET['action']:0;
  if ($action == "update_blacklist") {
    $comment_id = isset($_GET['comment_id'])?$_GET['comment_id']:0;
    if ($comment_id)
      bd_update_blacklist($comment_id);
  };

  $table_name = $wpdb->prefix . "bd_log";
  $comments_per_page = 15;
  $current_page = (isset($_GET['apage']))?intval($_GET['apage']):1;
  if ($current_page<1)
    $current_page=1;

  $search_dirty = ( isset($_GET['s']) ) ? $_GET['s'] : '';
  $search = attribute_escape( $search_dirty ); // XXX more sql escaping???
  $search = trim($search);
  $start_limit = ($current_page-1) * $comments_per_page;
  $end_limit = $comments_per_page;
  $total = -1;
  $retried = false;
  $logs_len=-1;
  $nonce = wp_create_nonce("bd_nonce");
  while(!$retried && ($logs_len<=0)){
    if ($logs_len==0 || $current_page==1){
      $retried = true;
      $start_limit = 0;				
      $current_page = 1;
    }
    $wpdb->show_errors();
    $comment_table = $wpdb->prefix."comments";
    $wpdb->show_errors();
    $blacklist = get_option('blacklist_keys');
    $logs= $wpdb->get_results("SELECT SQL_CALC_FOUND_ROWS *, LOCATE(comment_author_IP, '$blacklist') AS blacklisted
                               FROM ".$table_name." 
                               LEFT JOIN $comment_table ON $table_name.comment_id=$comment_table.comment_ID 
                               WHERE concat(message,comment_author_IP,action) LIKE '%".$search."%' 
                               ORDER by timestamp DESC  LIMIT ".$start_limit.", ".$end_limit);
    
    $total = $wpdb->get_var( "SELECT FOUND_ROWS()" );
    $logs_len=count($logs);   
  }
  $total_pages = ceil($total / $comments_per_page);
  if ($current_page>$total_pages)
    $current_page=$total_pages;
  $base = add_query_arg('apage','%#%');
  $pagination_links=array();
  $k=0; 
  if ($current_page>1){
    $link=str_replace("%#%",$current_page-1,$base);
    $prev_text = '&laquo';
    $pagination_links[$k++]="<a class='prev page-numbers' href='" . clean_url($link) . "'>$prev_text</a>";
  }

  $end_size = 1;
  $mid_size = 3;
  $dots=false;
  for($i=1;$i<=$total_pages;$i++){
    if ($i==$current_page){
      $pagination_links[$k++]="<span class='page-numbers current'>$i</span>";
      $dots=true;
    }else{
      if ( ($i<=$end_size)  || ($total_pages-$end_size<$i) || (abs($current_page-$i) < $mid_size)){
	$link=str_replace("%#%",$i,$base);
	$pagination_links[$k++]="<a class='page-numbers' href='" . clean_url($link) . "'>$i</a>";
	$dots=true;
      } else if ($dots){
	$pagination_links[$k++]="<span class='page-numbers dots'>...</span>";
	$dots=false;
      }     
    } 
  }
  if ($current_page<$total_pages && $total_pages>=2){
    $link=str_replace("%#%",$current_page+1,$base);
    $next_text = '&raquo;';
    $pagination_links[$k++]="<a class='next page-numbers' href='" . clean_url($link) . "'>$next_text</a>";
  }
  $search_excerpt = wp_specialchars( stripslashes( $_GET['s'] ) );
  if (function_exists('wp_html_excerpt'))
      $search_excerpt = wp_html_excerpt($search_excerpt, 50);
  //print_r($pagination_links);
  //echo "TOTAL: $total $logs_len";
?>
<div class="wrap">

<div id="icon-bitdefender" class="icon32"><br /></div>

<h2>BitDefender Log
<?php if ( isset($_GET['s']) && $_GET['s'] )
	printf( '<span class="subtitle">' . sprintf( __( 'Search results for &#8220;%s&#8221;' ), $search_excerpt. '</span>')); ?>
</h2>

	<?php bd_draw_menu() ?>

<form id="search-form" action="" method="get">
<p class="search-box">
	<label class="hidden" for="comment-search-input"><?php _e( 'Search Logs' ); ?>:</label>
	<input type="text" class="search-input" id="comment-search-input" name="s" value="<?php the_search_query(); ?>" />
	<input type="submit" value="<?php _e( 'Search Logs' ); ?>" class="button" />
</p>
       <input type="hidden" name="page" value="<?php echo $_GET['page']; ?>" > </input>
       <input type="hidden" name="bd_page" value="<?php echo $_GET['bd_page']; ?>" > </input>
</form>

<br class="clear" />
   <?php bd_draw_logs_submenu(); ?>
<br class="clear" />

<?php
   if (!$total){
     _e('No results found.');
   }else{
?>
											       
  <table class="widefat">
    <thead>
    <tr>
    <th scope="col">Timestamp </th>
    <th scope="col">Author IP</th>
    <th scope="col">Comment</th>
    <th scope="col">Message</th>
    <th scope="col">Action</th>
    </tr>
    </thead>
    
    <tbody>
     <?php
     foreach($logs as $log){
       $log = bd_format_log($log);
     ?>
    <tr>
     <td><?php echo $log->timestamp ?></td>
     <td><?php echo $log->comment_author_IP ?></td>
     <td><?php echo $log->comment_id ?></td>
     <td><?php echo $log->message ?></td>
     <td><?php echo $log->action ?></td>
  </tr>
<?php
  };
   }
?>
    </tbody>
</table>

<div class="tablenav">
<?php
  $k=count($pagination_links);
  if ($k>1){
    echo "<div class='tablenav-pages'>";
    for ($i=0; $i<$k; $i++){
      echo $pagination_links[$i]."\n";
    }
    echo "</div>";
  }
?>
<br class="clear" />
</div>

</div>

</div>
<?php
   
   }


function bd_plugin_activate()
{
  global $wpdb, $bd_db_version;

  if (function_exists('add_option')){
    add_option('bd_client_id');
    add_option('bd_delete_spam_days',30);
    add_option('bd_delete_log_days',30);
	add_option('bd_blog_language',0);
	add_option('bd_filter_cyrillic',0);	
	add_option('bd_filter_asiatic',0);
	add_option('bd_aggresivity_level', 1); //0-permissive, 1-normal, 2-high
  }
  
  $table_name = $wpdb->prefix . "bd_log";
  if($wpdb->get_var("show tables like '$table_name'") != $table_name) {
    $sql = "CREATE TABLE " . $table_name . " (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            format int(11) NOT NULL,
            comment_id int(11) NULL, 
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message VARCHAR(255),
            action  VARCHAR(255),
            UNIQUE KEY id (id)
            );";
    add_option("bd_db_version", $bd_db_version);
    $wpdb->query($sql);
  }
  
  $spam_count = get_option('bd_spam_count',-1);
  if ($spam_count == -1){
	$count = $wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM '.$wpdb->prefix.'bd_log  WHERE message="spam"'));
	add_option('bd_spam_count', $count);
  }
  $clean_count = get_option('bd_legit_count',-1);
  if ($clean_count == -1){
	$count = $wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM '.$wpdb->prefix.'bd_log  WHERE message="clean"'));
	add_option('bd_legit_count', $count);
  }

}

register_activation_hook( __FILE__, 'bd_plugin_activate');

function bd_draw_logs_submenu()
{	
  $bd_page = isset($_GET['bd_page'])?$_GET['bd_page']:'';
  $class = "";
?>
   <ul class="subsubsub">
	  <?php $class = $bd_page=="log"?'class="current"':''; ?>
	  <li> &nbsp; <a <?php echo $class; ?> href="plugins.php?page=bd_configure_dispacher&bd_page=log">Show logs</a></li>|
      <?php $class = $bd_page=="log_settings"?'class="current"':''; ?>
	<li><a <?php echo $class; ?> href="plugins.php?page=bd_configure_dispacher&bd_page=log_settings">Logging options</a></li>							  
   </ul>
	
<?php
}

function bd_draw_menu()
{  
  $bd_page = isset($_GET['bd_page'])?$_GET['bd_page']:'';
  $class="";
  $bd_links=array()
?>
	
	<div class="filter">
	   <form id="list-filter" action="" method="get">
	   <ul class="subsubsub">
   <?php
	
	$class = ($bd_page == 'log_settings' || $bd_page == 'log')? 'class="current"':'';
    $bd_links[] = '<li><a  href="plugins.php?page=bd_configure_dispacher&bd_page=log" '.$class.'>Logging</a>';
    $class = ($bd_page == 'spam_settings')? 'class="current"':'';
    $bd_links[] = '<li><a  href="plugins.php?page=bd_configure_dispacher&bd_page=spam_settings" '.$class.'>Spam Settings</a>';
    $class = ($bd_page == 'stats')? 'class="current"':'';
    $bd_links[] = '<li><a  href="plugins.php?page=bd_configure_dispacher&bd_page=stats" '.$class.'>Stats</a>';
    $class = ($bd_page == 'feedback' || $bd_page == 'send_feedback')? 'class="current"':'';
    $bd_links[] = '<li><a  href="plugins.php?page=bd_configure_dispacher&bd_page=feedback" '.$class.'>Feedback</a>';
  
  echo implode( " |</li>\n", $bd_links) . '</li>';
  ?>

	</ul>
	</form>
	</div>
<?php
}

function bd_configure_page()
{
  $selected_language=get_option('bd_blog_language');

?>
  
  <div class="wrap">
    <div id="icon-bitdefender" class="icon32"><br /></div>
    <h2>BitDefender Anti-Spam</h2
     <?php if (isset($_GET['updated'])) : ?>
	<div id="message" class="updated fade"><p><strong><?php _e('Settings saved.') ?></strong></p></div>
     <?php endif; ?>

     <?php bd_draw_menu(); ?>
     <br class="clear" />
     <p>
    Plugin revision: <?php  include_once("bdrevision.php"); echo $bd_revision ?>
    </p>
    <h3>An experimental AntiSpam solution for WordPress based blogs</h3>
    This experimental WordPress Plugin will work with the API on BitDefender's cloud based scanning servers to  ensure no spam hits your blog. This version of BitDefender AntiSpam for WordPress was released as PREVIEW and we welcome any form of feedback or suggestions.Please tell us what you think about: detection rate (both undetected spam and false positives), the overall look&feel when installing or working with the plugin and basically any other information (including flames) you feel would help us improve this project. <br>
    <b>BitDefender AntiSpam for WordPress is released by BitDefender's Innovation and Technology team and is Free to use.</b> For feedback, flames and suggestions you can contact us at <a href="mailto:asblog@labs.bitdefender.com">asblog@labs.bitdefender.com</a> <br>
    <form method="post" action="options.php">
    <?php echo wp_nonce_field('update-options') ?>
    <table class="form-table">
    <tr valign="top">
     <th scope="row">BitDefender Client ID<p class="explain">Enter your e-mail address to identify yourself to the BitDefender AntiSpam API
	 This identifies your blog to the Bitdefender servers hosting the scanning services.</p></th>
     <td><input type="text" size="35" name="bd_client_id" value="<?php echo get_option('bd_client_id') ?>" /></td>

     </tr>
    <tr>
     <th scope="row"> Blog language </th>
	 <td>
	   <select name="bd_blog_language">
 	     <option <?php if ($selected_language=="0") echo 'selected="yes"' ?> value="0"></option>
		 <option <?php if ($selected_language=="aa") echo 'selected="yes"' ?> value="aa">Afar</option>
		 <option <?php if ($selected_language=="ab") echo 'selected="yes"' ?> value="ab">Abkhazian</option>
		 <option <?php if ($selected_language=="af") echo 'selected="yes"' ?> value="af">Afrikaans</option>
		 <option <?php if ($selected_language=="ak") echo 'selected="yes"' ?> value="ak">Akan</option>
		 <option <?php if ($selected_language=="sq") echo 'selected="yes"' ?> value="sq">Albanian</option>
		 <option <?php if ($selected_language=="am") echo 'selected="yes"' ?> value="am">Amharic</option>
		 <option <?php if ($selected_language=="ar") echo 'selected="yes"' ?> value="ar">Arabic</option>
		 <option <?php if ($selected_language=="an") echo 'selected="yes"' ?> value="an">Aragonese</option>
		 <option <?php if ($selected_language=="hy") echo 'selected="yes"' ?> value="hy">Armenian</option>
		 <option <?php if ($selected_language=="as") echo 'selected="yes"' ?> value="as">Assamese</option>
		 <option <?php if ($selected_language=="av") echo 'selected="yes"' ?> value="av">Avaric</option>
		 <option <?php if ($selected_language=="ae") echo 'selected="yes"' ?> value="ae">Avestan</option>
		 <option <?php if ($selected_language=="ay") echo 'selected="yes"' ?> value="ay">Aymara</option>
		 <option <?php if ($selected_language=="az") echo 'selected="yes"' ?> value="az">Azerbaijani</option>
		 <option <?php if ($selected_language=="ba") echo 'selected="yes"' ?> value="ba">Bashkir</option>
		 <option <?php if ($selected_language=="bm") echo 'selected="yes"' ?> value="bm">Bambara</option>
		 <option <?php if ($selected_language=="eu") echo 'selected="yes"' ?> value="eu">Basque</option>
		 <option <?php if ($selected_language=="be") echo 'selected="yes"' ?> value="be">Belarusian</option>
		 <option <?php if ($selected_language=="bn") echo 'selected="yes"' ?> value="bn">Bengali</option>
		 <option <?php if ($selected_language=="bh") echo 'selected="yes"' ?> value="bh">Bihari languages</option>
		 <option <?php if ($selected_language=="bi") echo 'selected="yes"' ?> value="bi">Bislama</option>
		 <option <?php if ($selected_language=="bs") echo 'selected="yes"' ?> value="bs">Bosnian</option>
		 <option <?php if ($selected_language=="br") echo 'selected="yes"' ?> value="br">Breton</option>
		 <option <?php if ($selected_language=="bg") echo 'selected="yes"' ?> value="bg">Bulgarian</option>
		 <option <?php if ($selected_language=="my") echo 'selected="yes"' ?> value="my">Burmese</option>
		 <option <?php if ($selected_language=="ca") echo 'selected="yes"' ?> value="ca">Catalan</option>
		 <option <?php if ($selected_language=="ch") echo 'selected="yes"' ?> value="ch">Chamorro</option>
		 <option <?php if ($selected_language=="ce") echo 'selected="yes"' ?> value="ce">Chechen</option>
		 <option <?php if ($selected_language=="zh") echo 'selected="yes"' ?> value="zh">Chinese</option>
		 <option <?php if ($selected_language=="cu") echo 'selected="yes"' ?> value="cu">Church Slavic</option>
		 <option <?php if ($selected_language=="cv") echo 'selected="yes"' ?> value="cv">Chuvash</option>
		 <option <?php if ($selected_language=="kw") echo 'selected="yes"' ?> value="kw">Cornish</option>
		 <option <?php if ($selected_language=="co") echo 'selected="yes"' ?> value="co">Corsican</option>
		 <option <?php if ($selected_language=="cr") echo 'selected="yes"' ?> value="cr">Cree</option>
		 <option <?php if ($selected_language=="cs") echo 'selected="yes"' ?> value="cs">Czech</option>
		 <option <?php if ($selected_language=="da") echo 'selected="yes"' ?> value="da">Danish</option>
		 <option <?php if ($selected_language=="dv") echo 'selected="yes"' ?> value="dv">Divehi</option>
		 <option <?php if ($selected_language=="nl") echo 'selected="yes"' ?> value="nl">Dutch</option>
		 <option <?php if ($selected_language=="dz") echo 'selected="yes"' ?> value="dz">Dzongkha</option>
		 <option <?php if ($selected_language=="en") echo 'selected="yes"' ?> value="en">English</option>
		 <option <?php if ($selected_language=="eo") echo 'selected="yes"' ?> value="eo">Esperanto</option>
		 <option <?php if ($selected_language=="et") echo 'selected="yes"' ?> value="et">Estonian</option>
		 <option <?php if ($selected_language=="ee") echo 'selected="yes"' ?> value="ee">Ewe</option>
		 <option <?php if ($selected_language=="fo") echo 'selected="yes"' ?> value="fo">Faroese</option>
		 <option <?php if ($selected_language=="fj") echo 'selected="yes"' ?> value="fj">Fijian</option>
		 <option <?php if ($selected_language=="fi") echo 'selected="yes"' ?> value="fi">Finnish</option>
		 <option <?php if ($selected_language=="fr") echo 'selected="yes"' ?> value="fr">French</option>
		 <option <?php if ($selected_language=="fy") echo 'selected="yes"' ?> value="fy">Western Frisian</option>
		 <option <?php if ($selected_language=="ff") echo 'selected="yes"' ?> value="ff">Fulah</option>
		 <option <?php if ($selected_language=="ka") echo 'selected="yes"' ?> value="ka">Georgian</option>
		 <option <?php if ($selected_language=="de") echo 'selected="yes"' ?> value="de">German</option>
		 <option <?php if ($selected_language=="gd") echo 'selected="yes"' ?> value="gd">Gaelic</option>
		 <option <?php if ($selected_language=="ga") echo 'selected="yes"' ?> value="ga">Irish</option>
		 <option <?php if ($selected_language=="gl") echo 'selected="yes"' ?> value="gl">Galician</option>
		 <option <?php if ($selected_language=="gv") echo 'selected="yes"' ?> value="gv">Manx</option>
		 <option <?php if ($selected_language=="el") echo 'selected="yes"' ?> value="el">Greek, Modern (1453-)</option>
		 <option <?php if ($selected_language=="gn") echo 'selected="yes"' ?> value="gn">Guarani</option>
		 <option <?php if ($selected_language=="gu") echo 'selected="yes"' ?> value="gu">Gujarati</option>
		 <option <?php if ($selected_language=="ht") echo 'selected="yes"' ?> value="ht">Haitian</option>
		 <option <?php if ($selected_language=="ha") echo 'selected="yes"' ?> value="ha">Hausa</option>
		 <option <?php if ($selected_language=="he") echo 'selected="yes"' ?> value="he">Hebrew</option>
		 <option <?php if ($selected_language=="hz") echo 'selected="yes"' ?> value="hz">Herero</option>
		 <option <?php if ($selected_language=="hi") echo 'selected="yes"' ?> value="hi">Hindi</option>
		 <option <?php if ($selected_language=="ho") echo 'selected="yes"' ?> value="ho">Hiri Motu</option>
		 <option <?php if ($selected_language=="hr") echo 'selected="yes"' ?> value="hr">Croatian</option>
		 <option <?php if ($selected_language=="hu") echo 'selected="yes"' ?> value="hu">Hungarian</option>
		 <option <?php if ($selected_language=="ig") echo 'selected="yes"' ?> value="ig">Igbo</option>
		 <option <?php if ($selected_language=="is") echo 'selected="yes"' ?> value="is">Icelandic</option>
		 <option <?php if ($selected_language=="io") echo 'selected="yes"' ?> value="io">Ido</option>
		 <option <?php if ($selected_language=="ii") echo 'selected="yes"' ?> value="ii">Sichuan Yi</option>
		 <option <?php if ($selected_language=="iu") echo 'selected="yes"' ?> value="iu">Inuktitut</option>
		 <option <?php if ($selected_language=="ie") echo 'selected="yes"' ?> value="ie">Interlingue</option>
		 <option <?php if ($selected_language=="ia") echo 'selected="yes"' ?> value="ia">Interlingua (I.A.L.A.)</option>
		 <option <?php if ($selected_language=="id") echo 'selected="yes"' ?> value="id">Indonesian</option>
		 <option <?php if ($selected_language=="ik") echo 'selected="yes"' ?> value="ik">Inupiaq</option>
		 <option <?php if ($selected_language=="it") echo 'selected="yes"' ?> value="it">Italian</option>
		 <option <?php if ($selected_language=="jv") echo 'selected="yes"' ?> value="jv">Javanese</option>
		 <option <?php if ($selected_language=="ja") echo 'selected="yes"' ?> value="ja">Japanese</option>
		 <option <?php if ($selected_language=="kl") echo 'selected="yes"' ?> value="kl">Kalaallisut</option>
		 <option <?php if ($selected_language=="kn") echo 'selected="yes"' ?> value="kn">Kannada</option>
		 <option <?php if ($selected_language=="ks") echo 'selected="yes"' ?> value="ks">Kashmiri</option>
		 <option <?php if ($selected_language=="kr") echo 'selected="yes"' ?> value="kr">Kanuri</option>
		 <option <?php if ($selected_language=="kk") echo 'selected="yes"' ?> value="kk">Kazakh</option>
		 <option <?php if ($selected_language=="km") echo 'selected="yes"' ?> value="km">Central Khmer</option>
		 <option <?php if ($selected_language=="ki") echo 'selected="yes"' ?> value="ki">Kikuyu</option>
		 <option <?php if ($selected_language=="rw") echo 'selected="yes"' ?> value="rw">Kinyarwanda</option>
		 <option <?php if ($selected_language=="ky") echo 'selected="yes"' ?> value="ky">Kirghiz</option>
		 <option <?php if ($selected_language=="kv") echo 'selected="yes"' ?> value="kv">Komi</option>
		 <option <?php if ($selected_language=="kg") echo 'selected="yes"' ?> value="kg">Kongo</option>
		 <option <?php if ($selected_language=="ko") echo 'selected="yes"' ?> value="ko">Korean</option>
		 <option <?php if ($selected_language=="kj") echo 'selected="yes"' ?> value="kj">Kuanyama</option>
		 <option <?php if ($selected_language=="ku") echo 'selected="yes"' ?> value="ku">Kurdish</option>
		 <option <?php if ($selected_language=="lo") echo 'selected="yes"' ?> value="lo">Lao</option>
		 <option <?php if ($selected_language=="la") echo 'selected="yes"' ?> value="la">Latin</option>
		 <option <?php if ($selected_language=="lv") echo 'selected="yes"' ?> value="lv">Latvian</option>
		 <option <?php if ($selected_language=="li") echo 'selected="yes"' ?> value="li">Limburgan</option>
		 <option <?php if ($selected_language=="ln") echo 'selected="yes"' ?> value="ln">Lingala</option>
		 <option <?php if ($selected_language=="lt") echo 'selected="yes"' ?> value="lt">Lithuanian</option>
		 <option <?php if ($selected_language=="lb") echo 'selected="yes"' ?> value="lb">Luxembourgish</option>
		 <option <?php if ($selected_language=="lu") echo 'selected="yes"' ?> value="lu">Luba-Katanga</option>
		 <option <?php if ($selected_language=="lg") echo 'selected="yes"' ?> value="lg">Ganda</option>
		 <option <?php if ($selected_language=="mk") echo 'selected="yes"' ?> value="mk">Macedonian</option>
		 <option <?php if ($selected_language=="mh") echo 'selected="yes"' ?> value="mh">Marshallese</option>
		 <option <?php if ($selected_language=="ml") echo 'selected="yes"' ?> value="ml">Malayalam</option>
		 <option <?php if ($selected_language=="mi") echo 'selected="yes"' ?> value="mi">Maori</option>
		 <option <?php if ($selected_language=="mr") echo 'selected="yes"' ?> value="mr">Marathi</option>
		 <option <?php if ($selected_language=="ms") echo 'selected="yes"' ?> value="ms">Malay</option>
		 <option <?php if ($selected_language=="mg") echo 'selected="yes"' ?> value="mg">Malagasy</option>
		 <option <?php if ($selected_language=="mt") echo 'selected="yes"' ?> value="mt">Maltese</option>
		 <option <?php if ($selected_language=="mn") echo 'selected="yes"' ?> value="mn">Mongolian</option>
		 <option <?php if ($selected_language=="na") echo 'selected="yes"' ?> value="na">Nauru</option>
		 <option <?php if ($selected_language=="nv") echo 'selected="yes"' ?> value="nv">Navajo</option>
		 <option <?php if ($selected_language=="nr") echo 'selected="yes"' ?> value="nr">Ndebele, South</option>
		 <option <?php if ($selected_language=="nd") echo 'selected="yes"' ?> value="nd">Ndebele, North</option>
		 <option <?php if ($selected_language=="ng") echo 'selected="yes"' ?> value="ng">Ndonga</option>
		 <option <?php if ($selected_language=="ne") echo 'selected="yes"' ?> value="ne">Nepali</option>
		 <option <?php if ($selected_language=="nn") echo 'selected="yes"' ?> value="nn">Norwegian Nynorsk</option>
		 <option <?php if ($selected_language=="nb") echo 'selected="yes"' ?> value="nb">Bokmål, Norwegian</option>
		 <option <?php if ($selected_language=="no") echo 'selected="yes"' ?> value="no">Norwegian</option>
		 <option <?php if ($selected_language=="ny") echo 'selected="yes"' ?> value="ny">Chichewa</option>
		 <option <?php if ($selected_language=="oc") echo 'selected="yes"' ?> value="oc">Occitan (post 1500)</option>
		 <option <?php if ($selected_language=="oj") echo 'selected="yes"' ?> value="oj">Ojibwa</option>
		 <option <?php if ($selected_language=="or") echo 'selected="yes"' ?> value="or">Oriya</option>
		 <option <?php if ($selected_language=="om") echo 'selected="yes"' ?> value="om">Oromo</option>
		 <option <?php if ($selected_language=="os") echo 'selected="yes"' ?> value="os">Ossetian</option>
		 <option <?php if ($selected_language=="pa") echo 'selected="yes"' ?> value="pa">Panjabi</option>
		 <option <?php if ($selected_language=="fa") echo 'selected="yes"' ?> value="fa">Persian</option>
		 <option <?php if ($selected_language=="pi") echo 'selected="yes"' ?> value="pi">Pali</option>
		 <option <?php if ($selected_language=="pl") echo 'selected="yes"' ?> value="pl">Polish</option>
		 <option <?php if ($selected_language=="pt") echo 'selected="yes"' ?> value="pt">Portuguese</option>
		 <option <?php if ($selected_language=="ps") echo 'selected="yes"' ?> value="ps">Pushto</option>
		 <option <?php if ($selected_language=="qu") echo 'selected="yes"' ?> value="qu">Quechua</option>
		 <option <?php if ($selected_language=="rm") echo 'selected="yes"' ?> value="rm">Romansh</option>
		 <option <?php if ($selected_language=="ro") echo 'selected="yes"' ?> value="ro">Romanian</option>
		 <option <?php if ($selected_language=="rn") echo 'selected="yes"' ?> value="rn">Rundi</option>
		 <option <?php if ($selected_language=="ru") echo 'selected="yes"' ?> value="ru">Russian</option>
		 <option <?php if ($selected_language=="sg") echo 'selected="yes"' ?> value="sg">Sango</option>
		 <option <?php if ($selected_language=="sa") echo 'selected="yes"' ?> value="sa">Sanskrit</option>
		 <option <?php if ($selected_language=="si") echo 'selected="yes"' ?> value="si">Sinhala</option>
		 <option <?php if ($selected_language=="sk") echo 'selected="yes"' ?> value="sk">Slovak</option>
		 <option <?php if ($selected_language=="sl") echo 'selected="yes"' ?> value="sl">Slovenian</option>
		 <option <?php if ($selected_language=="se") echo 'selected="yes"' ?> value="se">Northern Sami</option>
		 <option <?php if ($selected_language=="sm") echo 'selected="yes"' ?> value="sm">Samoan</option>
		 <option <?php if ($selected_language=="sn") echo 'selected="yes"' ?> value="sn">Shona</option>
		 <option <?php if ($selected_language=="sd") echo 'selected="yes"' ?> value="sd">Sindhi</option>
		 <option <?php if ($selected_language=="so") echo 'selected="yes"' ?> value="so">Somali</option>
		 <option <?php if ($selected_language=="st") echo 'selected="yes"' ?> value="st">Sotho, Southern</option>
		 <option <?php if ($selected_language=="es") echo 'selected="yes"' ?> value="es">Spanish</option>
		 <option <?php if ($selected_language=="sc") echo 'selected="yes"' ?> value="sc">Sardinian</option>
		 <option <?php if ($selected_language=="sr") echo 'selected="yes"' ?> value="sr">Serbian</option>
		 <option <?php if ($selected_language=="ss") echo 'selected="yes"' ?> value="ss">Swati</option>
		 <option <?php if ($selected_language=="su") echo 'selected="yes"' ?> value="su">Sundanese</option>
		 <option <?php if ($selected_language=="sw") echo 'selected="yes"' ?> value="sw">Swahili</option>
		 <option <?php if ($selected_language=="sv") echo 'selected="yes"' ?> value="sv">Swedish</option>
		 <option <?php if ($selected_language=="ty") echo 'selected="yes"' ?> value="ty">Tahitian</option>
		 <option <?php if ($selected_language=="ta") echo 'selected="yes"' ?> value="ta">Tamil</option>
		 <option <?php if ($selected_language=="tt") echo 'selected="yes"' ?> value="tt">Tatar</option>
		 <option <?php if ($selected_language=="te") echo 'selected="yes"' ?> value="te">Telugu</option>
		 <option <?php if ($selected_language=="tg") echo 'selected="yes"' ?> value="tg">Tajik</option>
		 <option <?php if ($selected_language=="tl") echo 'selected="yes"' ?> value="tl">Tagalog</option>
		 <option <?php if ($selected_language=="th") echo 'selected="yes"' ?> value="th">Thai</option>
		 <option <?php if ($selected_language=="bo") echo 'selected="yes"' ?> value="bo">Tibetan</option>
		 <option <?php if ($selected_language=="ti") echo 'selected="yes"' ?> value="ti">Tigrinya</option>
		 <option <?php if ($selected_language=="to") echo 'selected="yes"' ?> value="to">Tonga (Tonga Islands)</option>
		 <option <?php if ($selected_language=="tn") echo 'selected="yes"' ?> value="tn">Tswana</option>
		 <option <?php if ($selected_language=="ts") echo 'selected="yes"' ?> value="ts">Tsonga</option>
		 <option <?php if ($selected_language=="tk") echo 'selected="yes"' ?> value="tk">Turkmen</option>
		 <option <?php if ($selected_language=="tr") echo 'selected="yes"' ?> value="tr">Turkish</option>
		 <option <?php if ($selected_language=="tw") echo 'selected="yes"' ?> value="tw">Twi</option>
		 <option <?php if ($selected_language=="ug") echo 'selected="yes"' ?> value="ug">Uighur</option>
		 <option <?php if ($selected_language=="uk") echo 'selected="yes"' ?> value="uk">Ukrainian</option>
		 <option <?php if ($selected_language=="ur") echo 'selected="yes"' ?> value="ur">Urdu</option>
		 <option <?php if ($selected_language=="uz") echo 'selected="yes"' ?> value="uz">Uzbek</option>
		 <option <?php if ($selected_language=="ve") echo 'selected="yes"' ?> value="ve">Venda</option>
		 <option <?php if ($selected_language=="vi") echo 'selected="yes"' ?> value="vi">Vietnamese</option>
		 <option <?php if ($selected_language=="vo") echo 'selected="yes"' ?> value="vo">Volapük</option>
		 <option <?php if ($selected_language=="cy") echo 'selected="yes"' ?> value="cy">Welsh</option>
		 <option <?php if ($selected_language=="wa") echo 'selected="yes"' ?> value="wa">Walloon</option>
		 <option <?php if ($selected_language=="wo") echo 'selected="yes"' ?> value="wo">Wolof</option>
		 <option <?php if ($selected_language=="xh") echo 'selected="yes"' ?> value="xh">Xhosa</option>
		 <option <?php if ($selected_language=="yi") echo 'selected="yes"' ?> value="yi">Yiddish</option>
		 <option <?php if ($selected_language=="yo") echo 'selected="yes"' ?> value="yo">Yoruba</option>
		 <option <?php if ($selected_language=="za") echo 'selected="yes"' ?> value="za">Zhuang</option>
		 <option <?php if ($selected_language=="zu") echo 'selected="yes"' ?> value="zu">Zulu</option>

 </select>
     </td>

     </tr>

    </table>
    <input type="hidden" name="action" value="update" />
    <input type="hidden" name="page_options" value="bd_client_id,bd_blog_language"/>
    <p class="submit">
    <input type="submit" name="Submit" value="<?php  _e('Save Changes') ?>" />
    </p>
    </form>
    </div>
<?php
}

function bd_report_spam_comment($comment_id)
{
  global $wpdb;
  
  $comment_id = (int)$comment_id;
  $comment_row = $wpdb->get_row("SELECT * FROM $wpdb->comments WHERE comment_ID = '$comment_id'");
  if ( !$comment_row ) {
    return;
  }
  foreach($comment_row as $key=>$val){
    $comment[$key]=$val;
  }
  $comment['client_type'] = "blog";
  $comment['client'] = get_option('home');
  include_once("bdrevision.php"); 
  $comment['plugin_revision'] = $bd_revision; 
  $rez = bd_perform("report", $comment, get_option('bd_client_id'));
  if (BD_DEBUG){
    echo "<pre>";
    print_r($comment);
    print_r($rez);
    die();
  }
}


function bd_update_blacklist($comment_id)
{

  $blacklist = get_option('blacklist_keys');
  $comment = get_comment($comment_id, OBJECT);
  if (!$comment)
    return;
  $ip = $comment->comment_author_IP;  
  $action="";
  if (strstr($blacklist, $ip)===FALSE){ // Blacklist the ip
	if ( $blacklist != '' && substr($blacklist, -2) != "\r\n" )
	  $blacklist .= "\r\n";
    $blacklist .= $ip."\r\n";
	$action="add";
  } else {			// Remove the ip from blacklist
    $blacklist = str_replace($ip."\r\n", "",$blacklist, $count);
    if ($count==0)
      $blacklist = str_replace($ip, "",$blacklist, $count);
	$action="remove";
  }
  $data=array();
  $data['action'] = $action;
  $data['client'] = get_option('home');
  $data['client_type'] = 'blog';
  $data['ip'] = $ip;
  include_once("bdrevision.php"); 
  $data['plugin_revision'] = $bd_revision;
  bd_perform("report_blacklist_ip", $data ,get_option('bd_client_id'));
  update_option('blacklist_keys', $blacklist);
}

function bd_comment_row_actions($actions)
{
  global $comment;
  
  $blacklist = get_option('blacklist_keys');  
  $ip = $comment->comment_author_IP;
  if ($ip == '')
	return $actions;
  if (strstr($blacklist, $ip)===FALSE){ 
	$actions['bd_blacklist_ip'] = "<a href='comment.php?action=bd_blacklist_ip&amp;c={$comment->comment_ID}' title='Blacklist IP'> Blacklist </a>";
  }else{
	$actions['bd_unblacklist_ip'] = "<a href='comment.php?action=bd_unblacklist_ip&amp;c={$comment->comment_ID}' title='Remove IP from Blacklist'> Remove from Blacklist </a>";
  }
  return $actions;
}

?>