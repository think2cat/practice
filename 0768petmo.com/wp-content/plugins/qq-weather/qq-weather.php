<?php
/*
Plugin Name: QQ weather
Plugin URI: http://www.webucd.com/qq-weather/
Description: This pulgin generates QQ weather for WordPress Blog. 以QQ首页天气数据为基础，支持国内所有城市, 根据访客IP自动获取所在城市的天气，支持多粒，自定义模板、样式，异步加载, 代码压缩，缓存JS, 对网站的性能影响较小。 
Version: 1.0.0
Author: webbeast
Author URI: http://www.webucd.com
*/

/*  Copyright 2010 webbeast  (email : admin _at_ webucd.com)
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/

/**
 * 常量
 */
define (QQ_WEATHER_VERSION_PLUGIN, '1.0.0', true);

/**
 * 设置配置项
 * @param unknown_type $option_name
 * @param unknown_type $option_value
 */
function QQWeather_set_option($option_name, $option_value) {	
	$QQWeather_options = get_option ( 'QQWeather_options' );	
	$QQWeather_options [$option_name] = $option_value;	
	update_option ( 'QQWeather_options', $QQWeather_options );
}

/**
 * 获取配置项
 * @param unknown_type $option_name
 * @param unknown_type $option_value
 */
function QQWeather_get_option($option_name) {	
	$QQWeather_options = get_option ( 'QQWeather_options' );	
	if (! $QQWeather_options || ! array_key_exists ( $option_name, $QQWeather_options )) {		
		$QQWeather_default_options = array ();		
		$QQWeather_default_options ["container"] = "WeatherContainerId";
		$QQWeather_default_options ["template"] = "<a href='http://www.webucd.com/qq-weather/' target='_blank'><img src='{0}' onload='MiniSite.loadPng(this)' border='0' /></a><span>{1}</span><span>{2}</span><span>{3}</span>";
		$QQWeather_default_options ["templateError"] = "<span>{0}</span><a href='http://www.webucd.com/qq-weather/' target='_blank'>{1}</a><span>{2}</span>";				
		$QQWeather_default_options ['enable'] = true;				
		add_option ( 'QQWeather_options', $QQWeather_default_options, 'Settings for QQ weather plugin' );
		$result = $QQWeather_options[$option_name];	
	} else {		
		$result = $QQWeather_options[$option_name];	
	}	
	return $result;
}

/**
 * 管理菜单
 */
function QQWeatherAdmin() {	
	if (function_exists ( 'add_options_page' )) {		
		add_options_page ( 'QQ Weather Install', 'QQ Weather', 8, basename ( __FILE__ ), 'QQWeather_options' );
	}
}

/**
 * 管理表单提交处理
 */
function QQWeather_options() {	
	$container = trim ( $_POST ['container'] );	
	$submit = trim ( $_POST ['Submit'] );	
	if($submit) {
		if ($container) {
			QQWeather_set_option ( 'container', $container );		
			echo QQWeather_Tip ( "设置成功！" );	
		} else {		
			echo QQWeather_error ( "统计代码格式不正确，请重新输入!" );	
		}		
		if (isset ( $_POST ['enable'] )) {		
			QQWeather_set_option ('enable', true );	
		} else {
			QQWeather_set_option ('enable', false );			
		}
		if (isset ( $_POST ['template'] )) {		
			QQWeather_set_option ( 'template', $_POST ['template'] );	
		}	
		if (isset ( $_POST ['templateError'] )) {		
			QQWeather_set_option ( 'templateError', $_POST ['templateError'] );	
		}
	} else {
		QQWeather_get_option('container');
	}
	QQWeather_admin_html (get_option ( 'QQWeather_options' ));
}

/**
 * 输出提示信息
 * @param {String} $msg 提示信息
 */
function QQWeather_Tip($msg) {	
	return '<div class="updated"><p><strong>' . $msg . '</strong></p></div>';
}

/**
 * 输出错误提示信息
 * @param {String} $msg 提示信息
 */

function QQWeather_error($msg) {	
	return '<div class="error settings-error"><p><strong>' . $msg . '</strong></p></div>';

}

/**
 * 输出设置页HTMl
 * @param {Array} $options 配置项信息
 */
function QQWeather_admin_html($options) {
	$enable = $options ['enable'] ? ' checked="true"' : '';		
	echo '<div class=wrap>';	
	echo '<form method="post">';	
	echo '<h2>设置</h2>';	
	echo '<fieldset class="options" name="general"><legend>需要显示天气的页面元素Id, 多个容器逗号隔开:</legend>';	
	echo '<p><input type="text" style="width:95%" value="'. stripslashes ( $options ['container'] ) . '" id="QQ_container" name="container"></p>';	
	echo '<p>正常模板:<textarea rows="5" class="large-text code" id="QQ_template" name="template">' . stripslashes ( $options ['template'] ) . '</textarea></p>';	
	echo '<p>异常模板:<textarea rows="5" class="large-text code" id="QQ_templateError" name="templateError">' . stripslashes ( $options ['templateError'] ) . '</textarea></p>';	
	echo '<input type="checkbox" value="true" id="Enable_QQ" name="enable"' . $enable . '>&nbsp;开启';	
	echo '&nbsp;显示天气</p>';	
	echo '<p class="submit"><input type="submit" value="保存设置" class="button-primary" name="Submit"></p>';	
	echo '</fieldset>';	
	echo '</form>';	
	echo '</div>';
}

/**
 * 初始化QQ天气
 */
function QQWeatherInit() {
echo '<!-- added by QQ天气插件  v' . QQ_WEATHER_VERSION_PLUGIN . ': http://www.webucd.com/qq-weather/ -->';
echo "\n";
echo '<script type="text/javascript" src="'.plugins_url('qq-weather/scripts/qqweather.js').'"></script>';
echo "\n";
echo '<script type="text/javascript">';
echo "\n";
echo 'var weatherList = ["'.str_replace(",", "\",\"", preg_replace("/\n|\r/i","", QQWeather_get_option('container'))).'"];';
echo "\n";
echo 'MiniSite.template = "'.preg_replace("/\n|\r/i","", QQWeather_get_option('template')).'";';
echo "\n";
echo 'MiniSite.templateError = "'.preg_replace("/\n|\r/i","", QQWeather_get_option('templateError')).'";';
echo "\n";
echo <<< QQJS
for(var i = 0, n = weatherList.length; i < n; i++) {
	var weatherContainer = weatherList[i];
	if(document.getElementById(weatherContainer)) {
		MiniSite.Weather.print(weatherContainer);
	}
}
QQJS;
echo "\n";
echo '</script>';
echo "\n";
echo '<!-- end QQ天气插件 -->';
}

/**
 * 事件初始化
 */
if (QQWeather_get_option ('enable')) {
	add_action ( 'wp_footer', 'QQWeatherInit' );
}
add_action ( 'admin_menu', 'QQWeatherAdmin');
?>