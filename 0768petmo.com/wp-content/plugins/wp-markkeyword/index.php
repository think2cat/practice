<?php
/*
Plugin Name: wp-markkeyword
Plugin URI: http://conis.cn/1365/
Description: This plugin can high light keyword after someone searchecd it, which supports the search engines like google, baidu, ask,  yahoo&bing.&#119;&#112;&#45;&#109;&#97;&#114;&#107;&#75;&#101;&#121;&#119;&#111;&#114;&#100;&#21487;&#20197;&#39640;&#20142;&#26174;&#31034;&#26469;&#33258;&#25628;&#32034;&#24341;&#25806;&#30340;&#20851;&#38190;&#23383;&#65292;&#25903;&#25345;&#22810;&#20010;&#25628;&#32034;&#24341;&#25806;&#65292;&#26356;&#22810;&#35831;&#35775;&#38382;&#25105;&#30340;&#21338;&#23458;
Version: 0.8
Author: Conis
Author URI: http://conis.cn/
*/

$mmkKeyword;
$mmkIsShowMsg;
function momoReplace($content)
{
	global $mmkKeyword;
	if(isset($mmkKeyword))
	{
		$arrKeyword = explode(' ', $mmkKeyword);
		foreach($arrKeyword as $item)
		{
			$pattern = "/(".$item.")(?=[^<>]*<)/";
			$content = preg_replace($pattern,'<span class="wmkHighLight">\1</span>',$content);
		}
	}
	return $content;	
}
function momoMarkKeywordMsg()
{
	global $mmkKeyword;
	if(isset($mmkKeyword))
	{
		$arrKeyword = explode(' ', $mmkKeyword);
		foreach($arrKeyword as $item)
		{
			$mmkMsg = $mmkMsg.'<a href="'.get_bloginfo('url').'/?s='.$item.'">'.$item.'</a>&nbsp;';
		}
		$mmkMsg = '<fieldset class="wmkFrame" id="wmkFrame">Your keyword is:&nbsp;<span class="wmkHighLight">'.$mmkMsg.'</span>';
		$mmkMsg = $mmkMsg . '<span class="wmkPowerBy">Powered by: <a href ="http://conis.cn" target="_blank">conis.cn</a></span></fieldset>';
		return $mmkMsg;
	}	
	return '';
}

function momoMarkKeyword($content = '')
{		
	global $mmkKeyword;
	global $mmkIsShowMsg;
	if($mmkIsShowMsg) return $content;
	$content = momoReplace($content);
	$mmkIsShowMsg = true;
	return momoMarkKeywordMsg().$content;
}

function momoMarkKeywordExcerpt($content = '')
{		
	$content = momoReplace($content);
	return $content;
}


function momoPrintCSS()
{
	echo "
	<style type='text/css'>
	.wmkHighLight {
		font-weight: bolder;
		color: #F00;
		font-size: 14px;
	}
	.wmkFrame
	{
		margin: 5px 0px 5px 0px;
		background-color:#FCF4D3;
		padding: 5px 0px 5px 0px;
		border: 1px solid #CCC;
		text-indent: 10px;	
		text-align: left;
		-moz-border-radius: 6px;
	}
	.wmkPowerBy
	{
		float: right;
		text-align: right;
		color: #000;
		font-size: 11px;
		margin-right: 5px;
	}
	.wmkPowerBy a
	{
		color: #666;
	}
	</style>
	";
}

function mmkInit()
{
	global $mmkKeyword;
	$mmkReferer = $_SERVER['HTTP_REFERER'];			//get referfer url
	$url = $_SERVER['REQUEST_URI'];
	if(preg_match("/\?s=.+/", $url))
	{
		$mmkReferer = $url;
	}

	if(!isset($mmkReferer)) return;
	if(strpos($mmkReferer, 'baidu.com') != false)
	{
		$mmkReferer = urldecode($mmkReferer);
		$mmkReferer = iconv('gb2312', 'utf-8', $mmkReferer);
		if(preg_match("/(word|wd)=(.+)&*/im", $mmkReferer, $arr))
	   {
			$mmkKeyword = $arr[2];
	   }
	}
	else
	{
		$mmkReferer = urldecode($mmkReferer);
		if(preg_match("/[&\?]([qps]|query)=(.+?)&/im", $mmkReferer, $arr))
	   {
			$mmkKeyword =  $arr[2];
	   }
		if(!isset($mmkKeyword))
	   {
		   if(preg_match("/[&\?]([qps]|query)=(.+)/im", $mmkReferer, $arr))
		   {
				$mmkKeyword =  $arr[2];
		   }
	   }
	}
}

mmkInit();
if(isset($mmkKeyword))
{
	add_action('wp_head','momoPrintCSS');
	add_filter('the_content', 'momoMarkKeyword', 0);
	add_filter('the_excerpt', 'momoMarkKeywordExcerpt', 0);
}
?>
