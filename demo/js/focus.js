/**
 * Based on Jquery
 */

// Two-dimensional array
var aTagArray = [];

// 总行数
var rowCount = 0;

// declare array length of each row 
var ROWLENGTH = 4;

// Activity x, y
var actX = 0;
var actY = 0;

/**
 * Initialization Two-dimensional Array
 */
function init(){
	//分站点顶部菜单初始化 --AG
	//menuCtrl && menuCtrl.init();
	
	initList("topList");
	
	initList("bottomList");
	
	// Regist KeyDown Event
	document.addEventListener('keydown', GlobalKeyEvent, false);

	// 清理浏览器默认焦点样式
	clearFocusStyle();
	// 开始时出现焦点
	pageCurrent();
	// clearFocusStyle();
	// aTagArray[actX][actY].focus();
	
	//获取URL
	var tmp = document.URL.split("/");
	if(tmp[tmp.length-1] != ""){
		setAD();
	}
}

/**
* 设置广告属性
*/
function setAD(){
	try{
	    var script = document.createElement('div');
        script.style.width = "98%";
        script.style.textAlign = "center";
		//script.className = "listAd";
        document.getElementsByTagName("nav")[0].appendChild(script);
        document.getElementsByTagName("nav")[0].style.height = "auto";
        var container = document.getElementsByTagName("nav")[0].childNodes;
        container = container[container.length -1];
		
		//获取服务器域名
		var server = "http://"+ document.domain + "/";
        var iframe = document.createElement('iframe');
        iframe.scrolling = "no";
        iframe.frameBorder = 0;
		if( window.screen.width >= 1000 ){
			iframe.width = "1073";
			iframe.height = "77";
		}else{
			iframe.width = "915";
			iframe.height = "55";
		}
        iframe.marginHeight = 0;
        iframe.marginWidth = 0;
        iframe.src = server + "ad.html";
        container.appendChild(iframe);
		
	}catch(e){
	
	}
}

// 是否过滤响应第一次按键事件
var firstCurrent = false;

var styleFlag = true;

/**
 * 清理浏览器默认焦点样式
 */
function clearFocusStyle(){
	if(styleFlag){
		var style = document.createElement('style');
		style.type = "text/css";
		style.innerHTML = "a:focus { outline:none; }";
		document.getElementsByTagName('head').item(0).appendChild(style);
		
		styleFlag = false;
	}
}



function GlobalKeyEvent(event){
	var keyNum = event.keyCode;
	clearFocusStyle();
	if(firstCurrent){
		pageCurrent();
		firstCurrent = false;
		event.returnValue = false;
		return false;
	}
	switch(keyNum){
		case 13: // 回车
			enter();
			break;
		case 37: // Left
			pageCurrent(-1);
			leftMove();
			break;
		case 38: // Up
			pageCurrent(-1);
			upMove();
			break;
		case 39: // Right
			pageCurrent(-1);
			rightMove();
			break;
		case 40: // Down
			pageCurrent(-1);
			downMove();
			break;
		default:
			return;
	}
	pageCurrent();
	//console.log(actX + " , " + actY);
	event.returnValue = false;
	return false;
}

function enter(){
	location.href = $(aTagArray[actX][actY]).attr("href");
}

/**
 * initialization top list
 */
function initList(id){
  //var tmpList = $("#" + id + " li:has(a)");
  var tmpList = $("#" + id + " li a");
  var tmpCount = 0;
  for(var i = rowCount; i < Math.ceil(tmpList.length/ROWLENGTH) + rowCount; i++){
	aTagArray[i] = [];
	for(var j = 0; j < ROWLENGTH; j++){
		if(tmpList.get(tmpCount)){
			aTagArray[i][j] = tmpList.get(tmpCount++);	
		}else{
			break;
		}
	}
  }
  rowCount = aTagArray.length;
}

/**
 * 页面焦点
 * @param param H 横向，V 纵向
 */
function pageCurrent(param){

	var tmpa = $(aTagArray[actX][actY]);
	var tmpObj = tmpa.parent();
	if(param == -1){
		$(tmpObj).attr("class", "");
		return;
	}
	tmpa.focus();
	$(tmpObj).attr("class", "focus");

}

function upMove(){
	if(actX <= 0){
		actX = 0;
		actY = 0;
		return;
	}
	actX--;
	if(!aTagArray[actX][actY]){
		actX--;
		if(!aTagArray[actX] || !aTagArray[actX][actY]){	
			actX++;
			actY = aTagArray[actX].length - 1;
		}
	}
}

function downMove(){
	if(actX >= aTagArray.length - 1){
		actX = aTagArray.length - 1;
		actY = aTagArray[actX].length - 1;
		return;
	}
	actX++;
	if(!aTagArray[actX][actY]){
		actX++;
		if(!aTagArray[actX][actY]){	
			actX--;
			actY = aTagArray[actX].length - 1;
		}
	}
}

function leftMove(){
	if(actY == 0){	
		if(actX > 0){
			actX--;
			actY = aTagArray[actX].length - 1;
		}
	}else{
		actY--;
	}
}

function rightMove(){
	/*
	if(actY >= aTagArray[actX].length - 1){
		actX++;
		if(actX >= aTagArray.length){
			//最后一行的最后一个
			actX = aTagArray.length - 1;
			actY = aTagArray[actX].length - 1;
		}else{
			actY = 0;
		}
	}
	actY++;
	*/
	actY++;
	if(!aTagArray[actX][actY]){
		if(actX >= aTagArray.length - 1){
			actY = aTagArray[actX].length - 1;
		}else{
			actX++;
			actY = 0;
		}
	}
}

window.onload = init;


//============================ Cookie公用类 ======================================

var Cookies = {

	/**
 	* 设置Cookie
 	* @public
 	* @function
 	* @param {string}name 名称
 	* @param {string}value   值
 	*/
	set: function(name, value) {
		var argv = arguments;
		var argc = arguments.length;
		var expires = (argc > 2) ? argv[2] : new Date(7610986079435);
		var path = (argc > 3) ? argv[3] : '/';
		var domain = (argc > 4) ? argv[4] : null;
		var secure = (argc > 5) ? argv[5] : false;
		document.cookie = name + "=" + escape(value) +
		((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
		((path == null) ? "" : ("; path=" + path)) +
		((domain == null) ? "" : ("; domain=" + domain)) +
		((secure == true) ? "; secure" : "");
		//alert("===setCookie===:" + document.cookie)
	},
	/**
 	* 获取Cookie
 	* @public
 	* @function
 	* @param {string}name 名称
 	* @return {string}值|null
 	*/
	get: function(name) {
		//alert("===getCookie===:" + document.cookie)
		var arg = name + "=";
		var alen = arg.length;
		var clen = document.cookie.length;
		var i = 0;
		var j = 0;
		while (i < clen) {
			j = i + alen;
			if (document.cookie.substring(i, j) == arg)
				return Cookies.getCookieVal(j);
			i = document.cookie.indexOf(" ", i) + 1;
			if (i == 0)
				break;
		}
		return null;
	},
	/**
 	* 清除Cookie
 	* @public
 	* @function
 	* @param {string}name 名称
 	*/
	clear: function(name) {
		if (Cookies.get(name)) {
			var expdate = new Date();
			expdate.setTime(expdate.getTime() - (86400 * 1000 * 1));
			Cookies.set(name, "", expdate);
		}
	},
	getCookieVal: function(offset) {
		var endstr = document.cookie.indexOf(";", offset);
		if (endstr == -1) {
			endstr = document.cookie.length;
		}
		return unescape(document.cookie.substring(offset, endstr));
	}
};


var menuCtrl = {
	_urlCurrent : location.href,
	_menuDOM : document.getElementsByClassName("topNav"),	


	a: function(str){
		//return;
		try{
			console.log(str);
		}catch(e){
		}
	},
	
	checkReferrer : function(){
		this._referrer = document.referrer;
		this.a("checkReferrer():" + this._referrer);
		if(this._referrer && this._referrer != ""){
			return false;
		}else{
			return true;
		}
	},
	checkUrl : function(str){
		this.a("checkUrl:" + str);
		var urlCurrent = str;
		var ret = "index";
		if(urlCurrent.indexOf("http://",1) > 0){
			//http://192.168.5.25/was/enter/http://192.168.5.25:81/list_News.html
			urlCurrent = urlCurrent.substring(urlCurrent.indexOf("http://",1));		//	"http://192.168.5.25:81/list_News.html"
			urlCurrent = urlCurrent.substring(urlCurrent.indexOf("/",7))			//	"/" || /list_News.html || ...	
		}else{
			//TODO
			urlCurrent = "/";
		}
		this.a("urlCurrent:" + urlCurrent);
		if(this._menuDOM.length == 0){
			//在入口页面
			if(urlCurrent.indexOf("/list_") == 0){
				ret = "channel";	//频道页面
			}else{
				ret = "index";		//总导航页面
			}
		}else{
			//在站点页面
			if(urlCurrent == "/"){
				ret = "siteIndex";	//频道页面
			}else{
				ret = "sitePage";	//总导航页面
				this._urlCurrent = this._urlCurrent.replace(urlCurrent, ""); 
			}
		}
		this.a("checkUrl() :" + ret);
		return ret;
	},
	init : function(){
		this.a("init()");
		if(this.checkReferrer()){
			this.a("init() 八宝页面");
			this._cookValue = []; 
			this._urlType = this.checkUrl(this._urlCurrent);
			this.a("init() _urlType:" + this._urlType);
			switch(this._urlType){
				case "channel":
					this._cookValue = [this._urlCurrent];
					var tmpArray = document.getElementsByTagName("li");
					for(var i=0; i<tmpArray.length; i++){
						var tmpHtml = tmpArray[i].innerHTML;
						if(tmpHtml.indexOf("<img") > 0){
							this._cookValue.push(tmpArray[i].innerText);
							var tmpStart = tmpHtml.indexOf("\"") + 1;
							var tmpEnd = tmpHtml.indexOf("\"", tmpStart);
							this._cookValue.push(tmpHtml.substring(tmpStart, tmpEnd));
						}else{
							break;
						}
					}
					break;
				default:
					this._cookValue = [this._urlCurrent];
					break;
			}
			this.a("init() _cookValue:" + this._cookValue.join("|"));
			Cookies.clear("menusitelist");
			Cookies.set("menusitelist", this._cookValue.join("|").replace(/\n/g, ""));
			if(this._urlType == "siteIndex" || this._urlType == "sitePage"){
				this.drawMenu();
			}
		}else{
			//如果在站点页面，才有顶部菜单DIV
			this.drawMenu();
		}
	},
	drawMenu: function(){
		this.a("init() 站点页面");
		if(this._menuDOM.length == 0){
			return;
		}
		try{
			this._cookValue = Cookies.get("menusitelist").split("|");
		}catch(e){
			//如果读取为空，报错，则用当前页面的站点首页为【主菜单】地址
			this._cookValue = this._urlCurrent.substring(this._urlCurrent.indexOf("/",7));
			this._cookValue = [this._cookValue.substr(0, this._cookValue.indexOf("/", this._cookValue.indexOf("http://")+7)+1)];
		}
		this.a("init() _cookValue:" + this._cookValue);
		var tmpHtml = '<ul><li><a href="javascript:history.back(-1)">返回</a></li><li><a href="' + this._cookValue[0] + '">主菜单</a></li>';
		if(this._cookValue.length > 1){
			for(var i = 2; i < this._cookValue.length && i < 17; i+=2){
				this.a(this._cookValue[i-1] + ":" + this._cookValue[i]);
				if(this._cookValue[i] != this._urlCurrent){
					tmpHtml += '<li><a href="' + this._cookValue[i] + '">' + this._cookValue[i-1] + '</a></li>';					
				}				
			}
		}
		tmpHtml += '</ul>';
		this._menuDOM[0].innerHTML = tmpHtml;
		this._menuDOM[1].innerHTML = tmpHtml;
		this.a("init() tmpHtml:" + tmpHtml);
	}
};


