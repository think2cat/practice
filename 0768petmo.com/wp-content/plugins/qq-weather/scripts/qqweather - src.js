var MiniSite = new Object();
MiniSite.template = "<a href='http://www.webucd.com/qq-weather/' target='_blank'><img src='{0}' onload='MiniSite.loadPng(this)' border='0' /></a><span>{1}</span><span>{2}</span><span>{3}</span>";
MiniSite.templateError = "<span>{0}</span><a href='http://www.webucd.com/qq-weather/' target='_blank'>{1}</a><span>{2}</span>";
MiniSite.format = function() {
	var argus = [];
	argus = Array.apply(argus, arguments);
	var reStr = argus[0].replace(/\{([0-9]+)\}/g, function($0, num) {
		var str = argus[parseInt(num, 10) + 1];
		return typeof (str) == 'undefined' ? '' : str;
	});
	return reStr;
};
if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
	MiniSite.ie = parseFloat(RegExp['\x241']);
}
MiniSite.Browser = {
	ie : /msie/.test(window.navigator.userAgent.toLowerCase()),
	moz : /gecko/.test(window.navigator.userAgent.toLowerCase()),
	opera : /opera/.test(window.navigator.userAgent.toLowerCase()),
	safari : /safari/.test(window.navigator.userAgent.toLowerCase())
};
MiniSite.$ = function(s) {
	return (typeof s == 'object') ? s : document.getElementById(s);
};
MiniSite.loadPng = function(o) {
	if (MiniSite.ie == "6") {
		try {
			var img = o;
			var imgName = o.src.toUpperCase();
			if (imgName.substring(imgName.length - 3, imgName.length) == "PNG") {
				var imgID = (img.id) ? "id='" + img.id + "' " : "";
				var imgClass = (img.className) ? "class='" + img.className
						+ "' " : "";
				var imgTitle = (img.title) ? "title='" + img.title + "' "
						: "title='" + img.alt + "' ";
				var imgStyle = "display:inline-block;" + img.style.cssText;
				if (img.align == "left")
					imgStyle = "float:left;" + imgStyle;
				if (img.align == "right")
					imgStyle = "float:right;" + imgStyle;
				if (img.parentElement.href)
					imgStyle = "cursor:hand;" + imgStyle;
				var strNewHTML = "<span "
						+ imgID
						+ imgClass
						+ imgTitle
						+ " style=\""
						+ "width:"
						+ img.width
						+ "px; height:"
						+ img.height
						+ "px;"
						+ imgStyle
						+ ";"
						+ "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
						+ "(src=\'" + img.src
						+ "\', sizingMethod='image');\"></span>";
				img.outerHTML = strNewHTML;
			}
		} catch (e) {
		}
	}
};
MiniSite.JsLoader = {
	load : function(sUrl, fCallback) {
		var _script = document.createElement('script');
		_script.setAttribute('charset', 'gb2312');
		_script.setAttribute('type', 'text/javascript');
		_script.setAttribute('src', sUrl);
		document.getElementsByTagName('head')[0].appendChild(_script);
		if (MiniSite.Browser.ie) {
			_script.onreadystatechange = function() {
				if (this.readyState == 'loaded'
						|| this.readyState == 'complete') {
					fCallback();
				}
			};
		} else if (MiniSite.Browser.moz) {
			_script.onload = function() {
				fCallback();
			};
		} else {
			fCallback();
		}
	}
};
MiniSite.Cookie = {
	set : function(name, value, expires, path, domain) {
		if (typeof expires == "undefined") {
			expires = new Date(new Date().getTime() + 24 * 3600 * 100);
		}
		document.cookie = name + "=" + escape(value)
				+ ((expires) ? "; expires=" + expires.toGMTString() : "")
				+ ((path) ? "; path=" + path : "; path=/")
				+ ((domain) ? "; domain=" + domain : "");
	},
	get : function(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name
				+ "=([^;]*)(;|$)"));
		if (arr != null) {
			return unescape(arr[2]);
		}
		return null;
	},
	clear : function(name, path, domain) {
		if (this.get(name)) {
			document.cookie = name + "="
					+ ((path) ? "; path=" + path : "; path=/")
					+ ((domain) ? "; domain=" + domain : "")
					+ ";expires=Fri, 02-Jan-1970 00:00:00 GMT";
		}
	}
};
MiniSite.Weather = {
	defaultCity : 125,
	city : {
		"北京市" : {
			"_" : 125,
			"北京市" : 125
		},
		"上海市" : {
			"_" : 252,
			"上海市" : 252
		},
		"天津市" : {
			"_" : 127,
			"天津市" : 127,
			"塘沽区" : 132
		},
		"重庆市" : {
			"_" : 212,
			"奉节区" : 201,
			"重庆市" : 212,
			"涪陵区" : 213
		},
		"香港" : {
			"_" : 1,
			"香港" : 1
		},
		"澳门" : {
			"_" : 2,
			"澳门" : 2
		},
		"台湾省" : {
			"_" : 280,
			"台北市" : 280
		},
		"云南省" : {
			"昭通市" : 173,
			"丽江市" : 174,
			"曲靖市" : 175,
			"保山市" : 176,
			"大理白族自治州" : 177,
			"楚雄彝族自治州" : 178,
			"昆明市" : 179,
			"瑞丽市" : 180,
			"玉溪市" : 181,
			"临沧市" : 182,
			"思茅市" : 184,
			"红河哈尼族彝族自治州" : 185,
			"文山壮族苗族自治州" : 369,
			"西双版纳傣族自治州" : 370,
			"德宏傣族景颇族自治州" : 371,
			"怒江傈傈族自治州" : 372,
			"迪庆藏族自治州" : 373
		},
		"内蒙古" : {
			"呼伦贝尔市" : 4,
			"兴安盟市" : 7,
			"锡林郭勒盟市" : 16,
			"巴彦淖尔盟市" : 63,
			"包头市" : 64,
			"呼和浩特市" : 69,
			"锡林浩特市" : 99,
			"通辽市" : 101,
			"赤峰市" : 106,
			"乌海市" : 382,
			"鄂尔多斯市" : 383,
			"乌兰察布盟市" : 384
		},
		"吉林省" : {
			"辽源市" : 34,
			"通化市" : 36,
			"白城市" : 37,
			"松原市" : 96,
			"长春市" : 103,
			"吉林市市" : 104,
			"桦甸市" : 109,
			"延边朝鲜族自治州" : 110,
			"集安市" : 118,
			"白山市" : 119,
			"四平市" : 385
		},
		"四川省" : {
			"甘孜藏族自治州" : 162,
			"阿坝藏族羌族自治州" : 163,
			"成都市" : 166,
			"绵阳市" : 167,
			"雅安市" : 168,
			"峨眉山市" : 170,
			"乐山市" : 171,
			"宜宾市" : 172,
			"巴中市" : 199,
			"达州市" : 200,
			"遂宁市" : 204,
			"南充市" : 205,
			"泸州市" : 216,
			"自贡市" : 359,
			"攀枝花市" : 360,
			"德阳市" : 361,
			"广元市" : 362,
			"内江市" : 363,
			"广安市" : 364,
			"眉山市" : 365,
			"资阳市" : 366,
			"凉山彝族自治州" : 367
		},
		"宁夏" : {
			"石嘴山市" : 54,
			"银川市" : 78,
			"吴忠市" : 83,
			"固原市" : 209
		},
		"安徽省" : {
			"淮南市" : 75,
			"马鞍山市" : 76,
			"淮北市" : 77,
			"铜陵市" : 92,
			"滁州市" : 95,
			"巢湖市" : 100,
			"池州市" : 102,
			"宣城市" : 105,
			"亳州市" : 238,
			"宿州市" : 239,
			"阜阳市" : 241,
			"六安市" : 242,
			"蚌埠市" : 243,
			"合肥市" : 248,
			"芜湖市" : 249,
			"安庆市" : 253,
			"黄山市" : 254
		},
		"山东省" : {
			"德州市" : 134,
			"滨州市" : 135,
			"烟台市" : 136,
			"聊城市" : 139,
			"济南市" : 140,
			"泰安市" : 141,
			"淄博市" : 142,
			"潍坊市" : 143,
			"青岛市" : 144,
			"济宁市" : 146,
			"日照市" : 147,
			"泰山市" : 156,
			"枣庄市" : 159,
			"东营市" : 160,
			"威海市" : 164,
			"莱芜市" : 165,
			"临沂市" : 183,
			"菏泽市" : 206
		},
		"山西省" : {
			"长治市" : 9,
			"晋中市" : 22,
			"朔州市" : 70,
			"大同市" : 72,
			"吕梁市" : 80,
			"忻州市" : 81,
			"太原市" : 84,
			"阳泉市" : 85,
			"临汾市" : 88,
			"运城市" : 93,
			"晋城市" : 94,
			"五台山市" : 381
		},
		"广东省" : {
			"南雄市" : 235,
			"韶关市" : 283,
			"清远市" : 284,
			"梅州市" : 285,
			"肇庆市" : 291,
			"广州市" : 292,
			"河源市" : 293,
			"汕头市" : 294,
			"深圳市" : 296,
			"汕尾市" : 297,
			"湛江市" : 300,
			"阳江市" : 301,
			"茂名市" : 302,
			"佛冈市" : 322,
			"梅县市" : 323,
			"电白市" : 324,
			"高要市" : 325,
			"珠海市" : 330,
			"佛山市" : 331,
			"江门市" : 332,
			"东莞市" : 334,
			"中山市" : 335,
			"潮州市" : 336,
			"揭阳市" : 337,
			"云浮市" : 338
		},
		"广西" : {
			"桂林市" : 232,
			"河池市" : 281,
			"柳州市" : 282,
			"百色市" : 288,
			"贵港市" : 289,
			"梧州市" : 290,
			"南宁市" : 295,
			"钦州市" : 298,
			"北海市" : 299,
			"防城港市" : 339,
			"玉林市" : 340,
			"贺州市" : 341,
			"来宾市" : 342,
			"崇左市" : 343
		},
		"新疆" : {
			"昌吉回族自治州" : 19,
			"克孜勒苏柯尔克孜自治州" : 20,
			"伊犁哈萨克自治州" : 21,
			"阿拉尔市" : 23,
			"克拉玛依市" : 24,
			"博尔塔拉蒙古自治州" : 27,
			"乌鲁木齐市" : 28,
			"吐鲁番市" : 31,
			"阿克苏市" : 32,
			"石河子市" : 33,
			"喀什市" : 35,
			"和田市" : 39,
			"哈密市" : 41,
			"奇台市" : 52
		},
		"江苏省" : {
			"无锡市" : 43,
			"苏州市" : 44,
			"盱眙市" : 45,
			"赣榆市" : 46,
			"东台市" : 47,
			"高邮市" : 53,
			"镇江市" : 59,
			"泰州市" : 61,
			"宿迁市" : 62,
			"徐州市" : 236,
			"连云港市" : 237,
			"淮安市" : 240,
			"南京市" : 244,
			"扬州市" : 245,
			"盐城市" : 246,
			"南通市" : 247,
			"常州市" : 250
		},
		"江西省" : {
			"庐山市" : 111,
			"玉山市" : 137,
			"贵溪市" : 138,
			"广昌市" : 145,
			"萍乡市" : 153,
			"新余市" : 154,
			"宜春市" : 224,
			"赣州市" : 234,
			"九江市" : 258,
			"景德镇市" : 259,
			"南昌市" : 264,
			"鹰潭市" : 265,
			"上饶市" : 267,
			"抚州市" : 273
		},
		"河北省" : {
			"邯郸市" : 3,
			"衡水市" : 8,
			"石家庄市" : 82,
			"邢台市" : 86,
			"张家口市" : 120,
			"承德市" : 121,
			"秦皇岛市" : 122,
			"廊坊市" : 126,
			"唐山市" : 128,
			"保定市" : 130,
			"沧州市" : 131
		},
		"河南省" : {
			"安阳市" : 89,
			"三门峡市" : 188,
			"郑州市" : 189,
			"南阳市" : 192,
			"周口市" : 193,
			"驻马店市" : 197,
			"信阳市" : 198,
			"开封市" : 207,
			"洛阳市" : 228,
			"平顶山市" : 231,
			"焦作市" : 251,
			"鹤壁市" : 260,
			"新乡市" : 304,
			"濮阳市" : 305,
			"许昌市" : 306,
			"漯河市" : 307,
			"商丘市" : 308,
			"济源市" : 309
		},
		"浙江省" : {
			"湖州市" : 65,
			"嵊州市" : 66,
			"平湖市" : 67,
			"石浦市" : 68,
			"宁海市" : 71,
			"洞头市" : 73,
			"舟山市" : 74,
			"杭州市" : 255,
			"嘉兴市" : 256,
			"定海市" : 257,
			"金华市" : 261,
			"绍兴市" : 262,
			"宁波市" : 263,
			"衢州市" : 266,
			"丽水市" : 268,
			"台州市" : 269,
			"温州市" : 272
		},
		"海南省" : {
			"海口市" : 303,
			"三亚市" : 344,
			"屯昌市" : 345,
			"琼海市" : 346,
			"儋州市" : 347,
			"文昌市" : 348,
			"万宁市" : 349,
			"东方市" : 350,
			"澄迈市" : 351,
			"定安市" : 352,
			"临高市" : 353,
			"白沙黎族自治县" : 354,
			"乐东黎族自治县" : 355,
			"陵水黎族自治县" : 356,
			"保亭黎族苗族自治县" : 357,
			"琼中黎族苗族自治县" : 358
		},
		"湖北省" : {
			"襄樊市" : 196,
			"荆门市" : 202,
			"黄冈市" : 203,
			"恩施土家族苗族自治州" : 208,
			"武汉市" : 211,
			"黄石市" : 310,
			"鄂州市" : 314,
			"孝感市" : 315,
			"咸宁市" : 316,
			"随州市" : 317,
			"仙桃市" : 318,
			"天门市" : 319,
			"潜江市" : 320,
			"神农架市" : 321
		},
		"湖南省" : {
			"张家界市" : 214,
			"岳阳市" : 215,
			"怀化市" : 217,
			"长沙市" : 218,
			"邵阳市" : 222,
			"益阳市" : 223,
			"郴州市" : 233,
			"桑植市" : 311,
			"沅陵市" : 312,
			"南岳市" : 313,
			"株洲市" : 326,
			"湘潭市" : 327,
			"衡阳市" : 328,
			"娄底市" : 329,
			"常德市" : 387
		},
		"甘肃省" : {
			"张掖市" : 49,
			"金昌市" : 50,
			"武威市" : 51,
			"兰州市" : 57,
			"白银市" : 58,
			"定西市" : 60,
			"平凉市" : 90,
			"庆阳市" : 91,
			"甘南市" : 225,
			"临夏市" : 229,
			"天水市" : 377,
			"嘉峪关市" : 378,
			"酒泉市" : 379,
			"陇南市" : 380
		},
		"福建省" : {
			"莆田市" : 107,
			"浦城市" : 271,
			"南平市" : 274,
			"宁德市" : 275,
			"福州市" : 276,
			"龙岩市" : 277,
			"三明市" : 278,
			"泉州市" : 279,
			"漳州市" : 286,
			"厦门市" : 287
		},
		"西藏" : {
			"那曲市" : 148,
			"日喀则市" : 149,
			"拉萨市" : 150,
			"山南市" : 151,
			"阿里市" : 152,
			"昌都市" : 161,
			"林芝市" : 169
		},
		"贵州省" : {
			"毕节市" : 219,
			"遵义市" : 220,
			"铜仁市" : 221,
			"安顺市" : 226,
			"贵阳市" : 227,
			"黔西南布依族苗族自治州" : 230,
			"六盘水市" : 368
		},
		"辽宁省" : {
			"葫芦岛市" : 25,
			"盘锦市" : 26,
			"辽阳市" : 29,
			"铁岭市" : 30,
			"阜新市" : 108,
			"朝阳市" : 112,
			"锦州市" : 113,
			"鞍山市" : 114,
			"沈阳市" : 115,
			"本溪市" : 116,
			"抚顺市" : 117,
			"营口市" : 123,
			"丹东市" : 124,
			"瓦房店市" : 129,
			"大连市" : 133
		},
		"陕西省" : {
			"榆林市" : 79,
			"延安市" : 87,
			"西安市" : 186,
			"渭南市" : 187,
			"汉中市" : 190,
			"商洛市" : 191,
			"安康市" : 194,
			"铜川市" : 374,
			"宝鸡市" : 375,
			"咸阳市" : 376
		},
		"青海" : {
			"海北藏族自治州" : 48,
			"海南藏族自治州" : 55,
			"西宁市" : 56,
			"玉树藏族自治州" : 155,
			"黄南藏族自治州" : 157,
			"果洛藏族自治州" : 158,
			"海西蒙古族藏族自治州" : 195,
			"海东市" : 210
		},
		"黑龙江省" : {
			"大兴安岭市" : 5,
			"黑河市" : 6,
			"齐齐哈尔市" : 10,
			"绥化市" : 11,
			"鹤岗市" : 12,
			"佳木斯市" : 13,
			"伊春市" : 14,
			"双鸭山市" : 15,
			"哈尔滨市" : 17,
			"鸡西市" : 18,
			"漠河市" : 38,
			"大庆市" : 40,
			"七台河市" : 42,
			"牡丹江市" : 97,
			"绥芬河市" : 98
		}
	},
	timelapse : null,
	defaultUrl : "http://mat1.qq.com/www/images/200801/wealth/",
	WealtherImg : {
		"晴" : {
			"day" : "sun.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"晴，阳光充足" : {
			"day" : "sun.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"晴朗" : {
			"day" : "sun.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"炎热" : {
			"day" : "sun.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"多云" : {
			"day" : "cloud.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"大部多云" : {
			"day" : "cloud.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"局部多云" : {
			"day" : "cloud.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"时有多云" : {
			"day" : "cloud.png",
			"night" : "night.png",
			"nm" : "4.png",
			"em" : "3.png",
			"xm" : "2.png",
			"mm" : "1.png"
		},
		"阴" : {
			"day" : "shade.png",
			"night" : "night.png"
		},
		"冷" : {
			"day" : "shade.png",
			"night" : "night.png"
		},
		"阵雨" : {
			"day" : "brain.png"
		},
		"雷阵雨" : {
			"day" : "lrain.png"
		},
		"雷雨" : {
			"day" : "lrain.png"
		},
		"局部雷雨" : {
			"day" : "lrain.png"
		},
		"零星雷雨" : {
			"day" : "lrain.png"
		},
		"局部阵雨" : {
			"day" : "lrain.png"
		},
		"雷阵雨并伴有冰雹" : {
			"day" : "lrain.png"
		},
		"冰雹雨" : {
			"day" : "lrain.png"
		},
		"雨夹雪" : {
			"day" : "rs.png"
		},
		"雨加雪" : {
			"day" : "rs.png"
		},
		"雨、雨夹雪" : {
			"day" : "rs.png"
		},
		"雪、雨夹雪" : {
			"day" : "rs.png"
		},
		"小雨" : {
			"day" : "srain.png"
		},
		"冰毛雨" : {
			"day" : "srain.png"
		},
		"毛毛雨" : {
			"day" : "srain.png"
		},
		"中雨" : {
			"day" : "mrain.png"
		},
		"大雨" : {
			"day" : "brain.png"
		},
		"暴雨" : {
			"day" : "drain.png"
		},
		"暴风雨" : {
			"day" : "drain.png"
		},
		"大暴雨" : {
			"day" : "drain.png"
		},
		"特大暴雨" : {
			"day" : "drain.png"
		},
		"阵雪" : {
			"day" : "bsnow.png"
		},
		"小阵雪" : {
			"day" : "bsnow.png"
		},
		"零星阵雪" : {
			"day" : "bsnow.png"
		},
		"小雪" : {
			"day" : "ssnow.png"
		},
		"中雪" : {
			"day" : "msnow.png"
		},
		"吹雪" : {
			"day" : "msnow.png"
		},
		"雪" : {
			"day" : "msnow.png"
		},
		"大雪" : {
			"day" : "bsnow.png"
		},
		"暴雪" : {
			"day" : "bsnow.png"
		},
		"暴风雪" : {
			"day" : "bsnow.png"
		},
		"局部暴雪" : {
			"day" : "bsnow.png"
		},
		"雾" : {
			"day" : "fog.png"
		},
		"薄雾" : {
			"day" : "fog.png"
		},
		"烟雾" : {
			"day" : "fog.png"
		},
		"冻雨" : {
			"day" : "rs.png"
		},
		"冰雨" : {
			"day" : "rs.png"
		},
		"沙尘暴" : {
			"day" : "sand.png"
		},
		"小到中雨" : {
			"day" : "srain.png"
		},
		"中到大雨" : {
			"day" : "mrain.png"
		},
		"大到暴雨" : {
			"day" : "brain.png"
		},
		"暴雨-大暴雨" : {
			"day" : "drain.png"
		},
		"大暴雨-特大暴雨" : {
			"day" : "drain.png"
		},
		"热带风暴" : {
			"day" : "drain.png"
		},
		"飓风" : {
			"day" : "drain.png"
		},
		"小到中雪" : {
			"day" : "ssnow.png"
		},
		"大到暴雪" : {
			"day" : "bsnow.png"
		},
		"冰雹" : {
			"day" : "bsnow.png"
		},
		"浮尘" : {
			"day" : "sand.png"
		},
		"灰尘" : {
			"day" : "sand.png"
		},
		"扬沙" : {
			"day" : "sand.png"
		},
		"风" : {
			"day" : "sand.png"
		},
		"大风" : {
			"day" : "sand.png"
		},
		"龙卷风" : {
			"day" : "sand.png"
		},
		"强沙尘暴" : {
			"day" : "sand.png"
		}
	},
	lunarInfo : new Array(0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950,
			0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0,
			0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
			0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60,
			0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95,
			0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0,
			0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2,
			0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0,
			0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50,
			0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57,
			0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250,
			0x0d558, 0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974,
			0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
			0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0,
			0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50,
			0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950,
			0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176,
			0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60,
			0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3,
			0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520,
			0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0,
			0x0aa50, 0x1b255, 0x06d20, 0x0ada0),
	lYearDays : function(y) {
		var i, sum = 348;
		for (i = 0x8000; i > 0x8; i >>= 1)
			sum += (MiniSite.Weather.lunarInfo[y - 1900] & i) ? 1 : 0;
		return (sum + MiniSite.Weather.leapDays(y));
	},
	leapDays : function(y) {
		if (MiniSite.Weather.leapMonth(y))
			return ((MiniSite.Weather.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
		else
			return (0);
	},
	leapMonth : function(y) {
		return (MiniSite.Weather.lunarInfo[y - 1900] & 0xf);
	},
	monthDays : function(y, m) {
		return ((MiniSite.Weather.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30
				: 29);
	},
	Lunar : function(objDate) {
		var i, leap = 0, temp = 0;
		var baseDate = new Date(1900, 0, 31);
		var offset = (objDate - baseDate) / 86400000;
		this.dayCyl = offset + 40;
		this.monCyl = 14;
		for (i = 1900; i < 2050 && offset > 0; i++) {
			temp = MiniSite.Weather.lYearDays(i);
			offset -= temp;
			this.monCyl += 12;
		}
		if (offset < 0) {
			offset += temp;
			i--;
			this.monCyl -= 12;
		}
		this.year = i;
		this.yearCyl = i - 1864;
		leap = MiniSite.Weather.leapMonth(i);
		this.isLeap = false;
		for (i = 1; i < 13 && offset > 0; i++) {
			if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
				--i;
				this.isLeap = true;
				temp = leapDays(this.year);
			} else {
				temp = MiniSite.Weather.monthDays(this.year, i);
			}
			if (this.isLeap == true && i == (leap + 1)) {
				this.isLeap = false;
			}
			offset -= temp;
			if (this.isLeap == false)
				this.monCyl++;
		}
		if (offset == 0 && leap > 0 && i == leap + 1) {
			if (this.isLeap) {
				this.isLeap = false;
			} else {
				this.isLeap = true;
				--i;
				--this.monCyl;
			}
		}
		if (offset < 0) {
			offset += temp;
			--i;
			--this.monCyl;
		}
		this.month = i;
		this.day = offset + 1;
		if (Math.floor(this.day) == MiniSite.Weather.monthDays(this.year,
				this.month)) {
			this.day = 0;
		}
		return Math.floor(this.day);
	},
	getMoon : function(d) {
		if (d == 0) {
			return "night";
		} else if (d > 0 && d < 3) {
			return "nm";
		} else if ((d > 2 && d <= 6) || 23 < d) {
			return "em";
		} else if ((d > 6 && d < 15) || (d > 16 && d < 24)) {
			return "xm";
		} else if (d == 15 || d == 16) {
			return "mm";
		}
	},
	getWealth : function(wealth) {
		var ret, T;
		if (wealth.indexOf("转") >= 0) {
			var tmp = wealth.split("转");
			ret = tmp[1];
		} else {
			ret = wealth;
		}
		var date = new Date();
		var LunarDay = MiniSite.Weather.Lunar(date);
		var t = date.getHours();
		var m = date.getMinutes();
		if (ret == "晴" || ret == "多云" || ret == "炎热" || ret == "晴，阳光充足"
				|| ret == "晴朗" || ret == "时有多云" || ret == "大部多云"
				|| ret == "局部多云") {
			if (t < 19) {
				if (t > 5) {
					T = "day";
				} else {
					T = MiniSite.Weather.getMoon(LunarDay);
				}
			} else {
				T = MiniSite.Weather.getMoon(LunarDay);
			}
		} else {
			T = "day";
		}
		if (typeof this.WealtherImg[ret] !== "undefined") {
			if (typeof MiniSite.Weather.WealtherImg[ret][T] != "undefined") {
				return MiniSite.Weather.WealtherImg[ret][T];
			} else {
				return false;
			}
		} else {
			return false;
		}
		return MiniSite.Weather.WealtherImg[ret][T];
	},
	_print : function(province, city, conainter) {
		if (typeof this.city[province] != "undefined") {
			if (typeof this.city[province][city] != "undefined") {
				var _city_ = this.city[province][city];
			} else if (typeof this.city[province]["_"] != "undefined") {
				var _city_ = this.city[province]["_"];
			} else {
				var _city_ = this.defaultCity;
			}
		} else {
			var _city_ = this.defaultCity;
		}
		MiniSite.JsLoader.load("http://mat1.qq.com/weather/inc/minisite2_"
				+ _city_ + ".js", function() {
			try {
				var tmp = __minisite2__weather__.split(" ");
				var tmp1 = tmp[2] + " " + tmp[1];
				if (MiniSite.Weather.getWealth(tmp[3]) == false) {
					MiniSite.$(conainter).innerHTML = MiniSite.format(
							MiniSite.templateError, tmp[1], tmp[0],tmp[3]);
				} else {
					MiniSite.$(conainter).innerHTML = MiniSite.format(
							MiniSite.template, MiniSite.Weather.defaultUrl
									+ MiniSite.Weather.getWealth(tmp[3]),
							tmp[1], tmp[0],tmp[3]);
				}
			} catch (e) {
			}
		});
	},
	print : function(conainter) {
		var ok = function() {
			var province = null;
			var city = null;
			var ipAddress = MiniSite.Cookie.get("QQ_IPAddress");
			if (ipAddress != null) {
				try {
					var ipAddressArr = ipAddress.split(",");
					province = ipAddressArr[0];
					city = ipAddressArr[1];
				} catch (e) {
				}
			}
			MiniSite.Weather._print(province, city, conainter);
		};
		if (!MiniSite.Cookie.get("QQ_IPAddress")) {
			MiniSite.Weather.timelapse = setTimeout(ok, 20000);
			MiniSite.JsLoader.load("http://fw.qq.com:80/ipaddress", function() {
				if (MiniSite.Weather.timelapse != null) {
					clearTimeout(MiniSite.Weather.timelapse);
				}
				;
				if (typeof IPData != "undefined") {
					MiniSite.Cookie.set('QQ_IPAddress', IPData[2] + ','
							+ IPData[3]);
					ok();
				}
				;
			});
		} else {
			ok();
		}
	}
};
MiniSite.Home = {
	defaultprovince : 4,
	timelapse : null,
	Provinc : {
		"北京市" : 4,
		"上海市" : 28,
		"天津市" : 5,
		"重庆市" : 19,
		"香港" : 32,
		"澳门" : 33,
		"台湾省" : 31,
		"云南省" : 20,
		"内蒙古" : 9,
		"吉林省" : 2,
		"四川省" : 18,
		"宁夏" : 14,
		"安徽省" : 26,
		"山东省" : 8,
		"山西省" : 15,
		"广东省" : 0,
		"广西" : 22,
		"新疆" : 10,
		"江苏省" : 17,
		"江西省" : 27,
		"河北省" : 6,
		"河南省" : 7,
		"浙江省" : 29,
		"海南省" : 23,
		"湖北省" : 25,
		"湖南省" : 24,
		"甘肃省" : 12,
		"福建省" : 30,
		"西藏" : 11,
		"贵州省" : 21,
		"辽宁省" : 3,
		"陕西省" : 16,
		"青海" : 13,
		"黑龙江省" : 1
	},
	_print : function(province) {
		if (typeof this.Provinc[province] != "undefined") {
			var _province_ = this.Provinc[province];
		} else {
			var _province_ = this.defaultprovince;
		}
		tail(_province_);
	},
	print : function() {
		var ok = function() {
			MiniSite.Home._print();
		};
		if (!MiniSite.Cookie.get("QQ_IPAddress")) {
			MiniSite.Home.timelapse = setTimeout(ok, 20000);
			MiniSite.JsLoader.load("http://fw.qq.com:80/ipaddress", function() {
				if (MiniSite.Home.timelapse != null) {
					clearTimeout(MiniSite.Home.timelapse);
				};
				if (typeof IPData != "undefined") {
					MiniSite.Cookie.set('QQ_IPAddress', IPData[2] + ','
							+ IPData[3]);
					MiniSite.Home._print(IPData[2]);
				} else {
					MiniSite.Home._print();
				}
			});
		} else {
			var ipAddress = MiniSite.Cookie.get("QQ_IPAddress");
			var ipAddressArr = ipAddress.split(",");
			return MiniSite.Home._print(ipAddressArr[0]);
		}
	}
};
