//广告文件for web
//本文件所有bbweb通用
//更新时间 2012-9-11 10:21:31

u_a_client = "1006";
u_a_type = "1";
bbadJSON = {
	"tv.babao.com" : {
		"big" : [[1300, 141, 109], [1073, 77, 35]],
		"small" : [[900, 98, 39], [915, 55, 40]]
	},
	"tv2.babao.com" : {
		"big" : [[1300, 141, 107], [1073, 77, 35]],
		"small" : [[900, 98, 110], [915, 55, 40]]
	},
	"tvhaier.babao.com" : {
		"big" : [[1300, 141, 105], [1073, 77, 35]],
		"small" : [[900, 98, 106], [915, 55, 40]]
	},
	"tv960.babao.com" : {
		"big" : [[1300, 141, 103], [1073, 77, 35]],
		"small" : [[900, 98, 104], [915, 55, 40]]
	},
	"tvweb.babao.com" : {
		"big" : [[1300, 141, 101], [1073, 77, 35]],
		"small" : [[900, 98, 102], [915, 55, 40]]
	},
	"tvapk.babao.com" : {
		"big" : [[1300, 141, 15], [1073, 77, 35]],
		"small" : [[900, 98, 39], [915, 55, 40]]
	}
};
var tmp = ["tv.babao.com", "big", 0];
try{
	if(bbadJSON[location.host]){
		tmp[0] = location.host;
	}else if (bbadJSON[parent.location.host]) {
		tmp[0] = parent.location.host;
	}else if (bbadJSON[top.location.host]) {
		tmp[0] = top.location.host;
	}	
}catch(e){}
//tmp[0] = "tv960.babao.com";
if (window.screen.width < 1000 || tmp[0] == "tv960.babao.com") {
	tmp[1] = "small";
}
try{
	if (parent.location.pathname.indexOf(tmp[0]) > 0 && parent.location.pathname.match(/\/http:\/\/.*\/(.*)_.*.html/)) {
		//二级页面
		tmp[2] = 1;
	}
}catch(e){}
//alert("AAAAAAAAAAAAAAAAAAAAAAAAAA:" + tmp.join());
//这里tmp被重新指向
tmp = bbadJSON[tmp[0]][tmp[1]][tmp[2]];
//alert("BBBBBBBBBBBBBBBBBBBBBBBBBBB:" + tmp.join());
u_a_width = tmp[0];
u_a_height = tmp[1];
u_a_zones = tmp[2];
document.write('<script type="text/javascript" src="http://ads.babao.com/i.js"></script>');
