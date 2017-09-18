function linkFocus() {
	//分站点顶部菜单初始化 --AG
	//menuCtrl && menuCtrl.init();
	//获取URL
	var tmp = document.URL.split("/");
	if(tmp[tmp.length-1] != "errors.html" && tmp[tmp.length-1] != "error.html" ){
		setAD();
	}
	/*var scroll = document.body.scrollTop;

	var tmpArr = document.getElementsByTagName("a");

	for(var i = 0; i < tmpArr.length; i++) {
		var offset = getElementPos(tmpArr[i]);
		if(offset.y >= scroll) {
			tmpArr[i].focus();
			return ;
		}
	}*/
	
}

/**
* 设置广告属性
*/
function setAD(){
	try{
        var script = document.createElement('div');
        script.style.width = "100%";
        script.style.textAlign = "center";
		script.style.margin = "10px auto";
        document.getElementsByTagName("div")[1].appendChild(script);
        document.getElementsByTagName("div")[1].style.height = "auto";
        var container = document.getElementsByTagName("div")[1].childNodes;
        container = container[container.length -1];
		
		//获取服务器域名
		var server = "http://"+ document.domain +"/";
		var iframe = document.createElement('iframe');
        iframe.scrolling = "no";
        iframe.frameBorder = 0;
		iframe.width = "100%";
		if( window.screen.width >= 1000 ){
			iframe.height = "114";
		}else{
			iframe.height = "52";
		}
        iframe.marginHeight = 0;
        iframe.marginWidth = 0;
        iframe.src = server + "ad.html";
        container.appendChild(iframe);
      
	}catch(e){
	
	}
	
}

window.onload = linkFocus;

function getElementPos(el) {
	var ua = navigator.userAgent.toLowerCase();
	var isOpera = (ua.indexOf('opera') != -1);
	var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof
	if(el.parentNode === null || el.style.display == 'none') {
		return false;
	}
	var parent = null;
	var pos = [];
	var box;
	if(el.getBoundingClientRect) {//IE
		box = el.getBoundingClientRect();
		var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
		var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
		return {x:box.left + scrollLeft, y:box.top + scrollTop};
	} else if(document.getBoxObjectFor) {// gecko
		box = document.getBoxObjectFor(el);
		var borderLeft = (el.style.borderLeftWidth)?parseInt(el.style.borderLeftWidth):0;
		var borderTop = (el.style.borderTopWidth)?parseInt(el.style.borderTopWidth):0;
		pos = [box.x - borderLeft, box.y - borderTop];
	} else {// safari & opera
		pos = [el.offsetLeft, el.offsetTop];
		parent = el.offsetParent;
		if (parent != el) {
			while (parent) {
				pos[0] += parent.offsetLeft;
				pos[1] += parent.offsetTop;
				parent = parent.offsetParent;
			}
		}
		if (ua.indexOf('opera') != -1  || ( ua.indexOf('safari') != -1 && el.style.position == 'absolute' )) {
			pos[0] -= document.body.offsetLeft;
			pos[1] -= document.body.offsetTop;
		}
	}
	if (el.parentNode) {
		parent = el.parentNode;
	} else {
		parent = null;
	}
	while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors
		pos[0] -= parent.scrollLeft;
		pos[1] -= parent.scrollTop;
		if (parent.parentNode) {
			parent = parent.parentNode;
		} else {
			parent = null;
		}
	}
	return {x:pos[0], y:pos[1]};
}


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
		return;
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


