(function() {
    var keyCodeArr = {left:37,up:38,right:39,down:40};
    var focusArr = [],initDone = false;
    var getElementPos = function(el){
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
            return {x:box.left + scrollLeft, y:box.top + scrollTop,w:el.offsetWidth,h:el.offsetHeight};
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
        return {x:pos[0], y:pos[1],w:el.offsetWidth,h:el.offsetHeight};
    };
    var isCoverX = function(objRoot,objClient){
        if(objClient.y >= objRoot.y && objClient.y < (objRoot.y + objRoot.h)
        || (objClient.y + objClient.h) > objRoot.y && (objClient.y + objClient.h) <= (objRoot.y+ objRoot.h)){
            return 1;
        }
        return 0;
    };
    var isCoverY = function(objRoot,objClient){
        var ret = 0;
        if(objClient.x >= objRoot.x && objClient.x < (objRoot.x + objRoot.w)
        || (objClient.x + objClient.w) > objRoot.x && (objClient.x + objClient.w) <= (objRoot.x+ objRoot.w)){
            var tmpDiff = (objRoot.x + objRoot.w) - (objClient.x + objClient.w);
            var tmpS = objClient.x, tmpE = objClient.x + objClient.w;
            if(objClient.x < objRoot.x){
                tmpS = objRoot.x;
            }
            if((objClient.x+objClient.w) > (objRoot.x+objRoot.w)){
                tmpE = objRoot.x + objRoot.w;
            }
            ret = (tmpE - tmpS)/objRoot.w;
            if(ret > 1){
                console.log("!!!!!!!!!!",objClient.d);
            }
            //TODEL
            console.log("tmpDiff",(tmpE - tmpS), objRoot.w, ret,objClient.d);
        }
        return ret;
        /*
        if((objClient.x >= objRoot.x && objClient.x < (objRoot.x + objRoot.w))
        || (objClient.x + objClient.w) > objRoot.x && (objClient.x + objClient.w) <= (objRoot.x + objRoot.w)){
            return true;
        }
        return false;
        */
    };
    var filterArr = function(obj, pos){
        var ret = {t:[], f:[]};
        for(var i =0; i< focusArr.length; i++){
            var tmpObj = null;
            //TODEL
            $(focusArr[i].d).css("border","none");
            if(obj != focusArr[i]){
                switch(pos){
                    case keyCodeArr.up:
                        if(focusArr[i].y < obj.y){
                            tmpObj = focusArr[i];
                        }
                        break;
                    case keyCodeArr.down:
                        if(focusArr[i].y > obj.y){
                            tmpObj = focusArr[i];
                        }
                        break;
                    case keyCodeArr.left:
                        if(focusArr[i].x < obj.x){
                            tmpObj = focusArr[i];
                        }
                        break;
                    case keyCodeArr.right:
                        if(focusArr[i].x > obj.x){
                            tmpObj = focusArr[i];
                        }
                        break;
                }
                if(tmpObj){
                    var tmpC = 0;
                    if(
                        ((keyCodeArr.up == pos || keyCodeArr.down == pos) && (tmpC = isCoverY(obj, tmpObj)))
                       || ((keyCodeArr.left == pos || keyCodeArr.right == pos) && isCoverX(obj, tmpObj))){
                       //TODEL
                        $(tmpObj.d).css("border","3px solid blue");
                        //console.log("tmpC",tmpC);
                        tmpC && (tmpObj.c = tmpC);
                        ret.t.push(tmpObj);
                    }else{
                        ret.f.push(tmpObj);
                    }
                }
            }
        }
        if(ret.t.length >0){
            ret = ret.t; 
        }else{
            ret = ret.f;
        }
        switch(pos){
            case keyCodeArr.up:
                ret.sort(function(a,b){
                    return b.c * b.y - a.c * a.y;
                });
                break;
            case keyCodeArr.down:
                ret.sort(function(a,b){
                    return a.c * a.y - b.c * b.y;
                });
                break;
            case keyCodeArr.left:
                ret.sort(function(a,b){
                    return b.x+b.w - a.x-a.w;
                });
                break;
            case keyCodeArr.right:
                ret.sort(function(a,b){
                    return a.x - b.x;
                });
                break;
        }
        return ret;
    };
    var init = function(){
        if(!initDone){
            var tmpArr = document.getElementsByTagName("a");
            for(var i =0; i<tmpArr.length; i++){
                if(tmpArr[i].getAttribute("href")){
                    var tmpPos = getElementPos(tmpArr[i]);
                    tmpPos.d = tmpArr[i];
                    tmpPos.i = i;
                    focusArr.push(tmpPos);
                }
            }
            initDone = true;
            focusArr[0] && focusArr[0].d.focus();
            console.log("focusArr",focusArr.length);
        }
        return focusArr.length;
    }
    var KeyEvent = function(evn){
        if(focusArr.length ==0){
            if(!init()) return;
        }
        if(k < keyCodeArr.left || k > keyCodeArr.down){
            return;
        }
        var activeDOM = document.activeElement;
        //console.log("activeDOM",activeDOM);
        var findPos = null;
        for(var i=0;i<focusArr.length;i++){
            if(activeDOM == focusArr[i].d){
                findPos = focusArr[i];
                console.log("find!");
                break;
            }
        }
        if(!findPos && focusArr[0]){
            findPos = focusArr[0];
            console.log("can't find!");
        }
        
        var k = evn.keyCode;
        var goPosArr = [];
        //if(k >= keyCodeArr.left && k <= keyCodeArr.down){
        goPosArr = filterArr(findPos,k);
        //}
        //TODEL
        for(var i =0; i<goPosArr.length;i++){
            $(goPosArr[i].d).css("border","3px solid yellow");
        }
        try{
            //console.log("---------------------------"+goPosArr.length);
            if(goPosArr.length > 0){
                console.log(activeDOM, goPosArr[0].d);
                //TODEL
                goPosArr[0].d.style.border = "3px solid red";
                goPosArr[0].d.focus();
                console.log("OOOO",goPosArr[0]);
            }
        }catch(e){
            alert(e);
        }
        //evn.returnValue = false;
    }
    document.addEventListener('keydown', KeyEvent, false);
	window.onload = function(){
		var tmp = document.getElementsByClassName("a");
		tmp.length && tmp[0].focus();
	}
})();
