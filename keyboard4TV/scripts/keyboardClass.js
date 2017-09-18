(function() {
    /**
     * 软键盘类
     * for 海尔
     * @class
     * @param {Function}callback 回调函数，可为空
     * @version 0.9.1.21
     * @author Gavin
     * @example
     * 初始化键盘对象，传进回调函数，也可先不传，有setCallback方法可设置回调函数
     * 执行回调函数时对象会把输入字符串作为参数传进去，并隐藏键盘，如无输入，则参数为空字串""
     * var keyObj = new keyboardClass(function(str){});
     *
     * 初始化的时候键盘不显示，需要显示时
     * keyObj.show();
     *
     * 把按键响应传给键盘对象，kCode为键码
     * keyObj.keyPress(kCode);
     */
    keyboardClass = function(callback) {
        //构造函数
        this.keyword = "";
        this.pinyin = {
            'p': "",
            'c': [],
            'page': 1,
            'totalpage': 0,
            'pagesize': 0,
            'DOM': null
        }; //p=拼音, c=中文, page=页码
        this.inputType = ['abc', 'ABC', '123'];
        this.pos = {
            'k': 16,
            'c': 0,
            't': 0
        }; //k=按键默认选择K, c=拼音模式下文字光标位置, t=输入类型
        this.limt = {"t":"","n":0};	//t=类型限制，n=长度限制
        this.keycase = ["1234567890,.?;:!\"()/@#$%_-<>", "qwertyuiopasdfghjkl@zxcvbnm_/."];
        this.callback = function() {
        };
        this.setCallback(callback);
    };
    keyboardClass.prototype = {
        /**
         * 显示键盘
         * @public
         * @function
         */
        show: function() {
            this.creat();
            this.switchInput();
            this.DOM.show();
            this.selectKey(this.pos.k);
        },
        /**
         * 移除键盘，从document中删除键盘html代码
         * @public
         * @function
         */
        remove: function() {
            this.DOM.remove();
            this.callback(this.keyword);
        },
        /**
         * 隐藏键盘
         * @public
         * @function
         */
        hide: function() {
            //TODO 输入限制
            /*
             if(this.limt.t == "number") {
             var tmpKeyword = parseInt(this.keyword);
             if(tmpKeyword == "NaN" || tmpKeyword == 0  || typeof(tmpKeyword) != this.limt.t) {
             this.setTip("只能输入数字");
             return;
             }
             } else if(this.limt.n > 0 && ("" + this.keyword).length > this.limt.n) {
             this.setTip("输入字符超过" + this.limt.n + "个");
             return;
             }
             */
            this.setTip();
            this.DOM.hide();
            this.callback(this.keyword);
            this.clearKeyword();
        },
        /**
         * 回格删除搜索关键字
         * @public
         * @function
         */
        del: function() {
            if (this.getPinyin() == "" && this.getKeyword().length > 0) {
                this.setKeyword(this.getKeyword().substr(0, this.getKeyword().length - 1));
            } else if (this.getPinyin().length > 0) {
                //a("del : " + this.getPinyin());
                if (this.getPinyin().length > 1) {
                    this.setPinyin(this.getPinyin().substr(0, this.getPinyin().length - 1));
                } else {
                    //a("del > clearPinyin()");
                    this.clearPinyin();
                }
            }
        },
        /**
         * 清空搜索关键字
         * @public
         * @function
         */
        clearKeyword: function() {
            this.keyword = "";
            this.setKeyword();
        },
        /**
         * 设置回调函数
         * @public
         * @function
         * @param {function}callback 回调函数
         */
        setCallback: function(callback) {
            if ($.isFunction(callback))
                this.callback = callback;
        },
        /**
         * 设置键盘输入类型
         * @public
         * @function
         * @param {String[]}inputArr 控制键盘大小写或拼音
         * ['123','abc','ABC','拼音'] = [数字、小写字母、大写字母、拼音]，只可调整顺序和删减，字符串不可更改
         * @example
         * setInputType(['123','abc','ABC','拼音'])
         * 或者
         * setInputType(['123','abc'])
         */
        setInputType: function(arr) {
            if ($.isArray(arr)) {
                this.inputType = arr;
            }
        },
        /**
         * 获取搜索关键字
         * @public
         * @function
         * @return {String}keyword 关键字
         */
        getKeyword: function() {
            return this.keyword;
        },
        /**
         * 设置搜索关键字
         * @public
         * @function
         * @param {String}keyword 关键字
         */
        setKeyword: function(str) {
            if (typeof(str) == "string" || typeof(str) == "number") {
                this.keyword = "" + str.toString();
            }
            this.DOM.find("div.keyText").text(this.keyword);
        },
        /**
         * 清空拼音
         * @public
         * @function
         */
        clearPinyin: function() {
            this.pinyin.p = "";
            this.pinyin.c = "";
            this.pinyin.page = 1;
            this.pinyin.totalpage = 1;
            this.setPinyin();
            this.pinyinJumpPage(1);
        },
        /**
         * 获取当前输入框拼音字母
         * @public
         * @function
         * @return {String}pinyin 拼音字母
         */
        getPinyin: function() {
            return "" + this.pinyin.p;
        },
        /**
         * 设置拼音
         * @public
         * @function
         * @param {String}pinyin 全拼字母
         */
        setPinyin: function(str) {
            if (str) {
                //if(this.pinyin.p == "") showTipMsg("输入拼音后，请用数字键1-9选择相应汉字");
                if (("" + str).length <= 6 && (typeof(str) == "string" || typeof(str) == "number")) {
                    this.pinyin.p = "" + str.toString();
                }
            }
            this.pinyin.DOM.eq(0).text(this.pinyin.p);
            if (this.pinyin.p != "" && this.pinyin2ch(this.getPinyin()).length > 0) {
                this.pinyinJumpPage();
            } else {
                //showTipMsg("无此拼音 " + this.getPinyin());
            }
        },
        /**
         * 键盘响应函数
         * @public
         * @function
         * @param {int}keyCode 键码
         */
        keyPress: function(keyNum) {
            //a("keyPress:" + keyNum);
            switch (keyNum) {
                case keyCodeArr.exit:
                    this.keyword = null;
                    this.hide();
                    this.keyword = "";
                    break;
                case keyCodeArr.menu:
                    goHome();
                    break;
                case keyCodeArr.up:
                    this.selectKey(this.pos.k - 11);
                    break;
                case keyCodeArr.down:
                    this.selectKey(this.pos.k + 11);
                    break;
                case keyCodeArr.left:
                    this.selectKey(this.pos.k - 1);
                    break;
                case keyCodeArr.right:
                    this.selectKey(this.pos.k + 1);
                    break;
                case keyCodeArr.enter:
                    this.enterKey();
                    break;
                case keyCodeArr.num0:
                case keyCodeArr.num1:
                case keyCodeArr.num2:
                case keyCodeArr.num3:
                case keyCodeArr.num4:
                case keyCodeArr.num5:
                case keyCodeArr.num6:
                case keyCodeArr.num7:
                case keyCodeArr.num8:
                case keyCodeArr.num9:
                    //如果不是拼音输入，则输入数字
                    var tmpStr = keyNum - keyCodeArr.num0;
                    if (this.getInputType() == "拼音" && this.pinyin.DOM.first().text() != "" && this.pinyin.DOM.eq(tmpStr).text() != "") {
                        tmpStr = this.pinyin.DOM.eq(tmpStr).text().substr(2, 1);
                        this.clearPinyin(); //清空
                    }
                    this.setKeyword(this.keyword + tmpStr);
                    break;
                case keyCodeArr.pageUp:
                case keyCodeArr.pageDn:
                    this.pinyinJumpPage(keyNum == keyCodeArr.pageUp ? -1 : 1);
                    break;
            }
        },
        /**
         * 选中按键
         * @public
         * @function
         * @param {int}keyNum 按键，0=第一个
         */
        selectKey: function(tK) {
            var liArr = this.DOM.find('ul.keyboardList > li');
            liArr.removeAttr("class");
            if (tK < 0) {
                tK += liArr.size();
            } else if (tK > liArr.size() - 1) {
                tK -= liArr.size();
            }
            liArr.eq(tK).addClass("current");
            this.pos.k = tK;
        },
        /**
         * 按键回车响应
         * @public
         * @function
         * 根据光标所在按键，自动判断事件
         */
        enterKey: function() {
            switch (this.pos.k) {
                case 10:
                    //删除
                    this.del();
                    break;
                case 21:
                    //切换大小写
                    this.pos.t++;
                    this.switchInput();
                    break;
                case 32:
                    //enter
                    this.hide();
                    break;
                default:
                    if (this.inputType[this.pos.t] == "拼音") {
                        //拼音
                        this.setPinyin(this.getPinyin() + this.DOM.find('ul.keyboardList > li.current').text());
                    } else {
                        this.setKeyword(this.getKeyword() + this.DOM.find('ul.keyboardList > li.current').text());
                    }
                    break;
            }
        },
        /**
         * 显示提示语
         * @public
         * @function
         * @param {string}str 提示语，参数为空或不传参数则隐藏
         * @example
         * 请在 show()之后调用，例如
         * keyObj.show();
         * keyObj.setTip("啊哩个桂");
         */
        setTip: function(str) {
            if (str == null || str == "") {
                this.DOM.children("div.keyThisTitle").text("").hide();
            } else {
                this.DOM.children("div.keyThisTitle").text(str).show();
            }
        },
        /**
         * 创建键盘DOM
         * @public
         * @function
         */
        creat: function() {
            if ($('section[class="keyboard f36"]').size() < 1 && $("body").size() > 0) {
                reval = "";
                reval += "<section class=\"keyboard f36\">";
                reval += "     <div class=\"keyThisTitle\" style=\"display:none;\"></div>";
                reval += "     <div class=\"keyInput\"><div class=\"keyText\"></div><div class=\"keyCursor\"></div></div>";
                reval += "     <ul class=\"keySelect\">";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "         <li></li>";
                reval += "     </ul>";
                reval += "     <ul class=\"keyboardList\">";
                reval += "         <li>1</li>";
                reval += "         <li>2</li>";
                reval += "         <li>3</li>";
                reval += "         <li>4</li>";
                reval += "         <li>5</li>";
                reval += "         <li>6</li>";
                reval += "         <li>7</li>";
                reval += "         <li>8</li>";
                reval += "         <li>9</li>";
                reval += "         <li>0</li>";
                reval += "         <li><div class=\"keyBackSpace\"></div></li>";
                reval += "         <li>,</li>";
                reval += "         <li>.</li>";
                reval += "         <li>?</li>";
                reval += "         <li>;</li>";
                reval += "         <li>:</li>";
                reval += "         <li>!</li>";
                reval += "         <li>\"</li>";
                reval += "         <li>(</li>";
                reval += "         <li>)</li>";
                reval += "         <li>/</li>";
                reval += "         <li>abc</li>";
                reval += "         <li>@</li>";
                reval += "         <li>#</li>";
                reval += "         <li>$</li>";
                reval += "         <li>%</li>";
                reval += "         <li>*</li>";
                reval += "         <li>&amp;</li>";
                reval += "         <li>_</li>";
                reval += "         <li>-</li>";
                reval += "         <li><</li>";
                reval += "         <li>></li>";
                reval += "         <li>enter</li>";
                reval += "     </ul>";
                reval += "     <div class=\"keyboardLine keyline_1\"></div>";
                reval += "     <div class=\"keyboardLine keyline_2\"></div>";
                reval += "     <div class=\"keyboardLine keyline_3\"></div>";
                reval += "     <div class=\"keyboardLine keyline_4\"></div>";
                reval += "</section>";
                $("body").append(reval);
                this.DOM = $('section[class="keyboard f36"]');
                this.pinyin.DOM = this.DOM.find("ul.keySelect > li");
                this.pinyin.pagesize = this.pinyin.DOM.size() - 1;
            }
        },
        /**
         * 输入切换
         * @public
         * @function
         */
        switchInput: function() {
            if (this.pos.t >= this.inputType.length) {
                this.pos.t = 0;
            }
            var tmpType = this.getInputType();
            var tmpArr;
            if (tmpType == 123 || tmpType == "123") {
                tmpArr = this.keycase[0];
            } else if (tmpType == "abc" || tmpType == "拼音") {
                tmpArr = this.keycase[1];
            } else if (tmpType == "ABC") {
                tmpArr = this.keycase[1].toUpperCase();
            }
            if(tmpArr != "拼音")
                this.clearPinyin();
            var li = this.DOM.find("ul.keyboardList > li");
            var j = 0;
            for (var i = 0; i < li.size() && j < tmpArr.length; i++) {
                if ($.inArray(i, [10, 21, 32]) == -1) {
                    li.eq(i).text(tmpArr.substr(j, 1));
                    j++;
                }
            }
            li.eq(21).text(tmpType);
        },
        /**
         * 获取当前输入类型
         * @public
         * @function
         * @return {String}输入类型，123=数字、abc=小写字母、ABC=大写字母、拼音=拼音输入法
         */
        getInputType: function() {
            return this.inputType[this.pos.t];
        },
        /**
         * 设置输入限制
         * @public
         * @function
         * @param {string}number|string 输入类型
         * @param {int}输入长度
         * @example
         * setLimt("string");			//限制只能输入字符串
         * setLimt("number",11);	//限制只能输入11位数字
         * setLimt();							//取消限制
         */
        setLimt: function() {
            var agrs = arguments;
            if(typeof(agrs) == "undefined") {
                //不传则取消限制
                this.limt = {"t":"","n":0};
            } else {
                this.limt.t = agrs[0];
                if(agrs.length > 1) {
                    this.limt.n = agrs[1];
                }
            }
        },
        /**
         * 全拼转换中文
         * @public
         * @function
         * @param {String}pinyin 全拼字母
         * @return {String[]}pinyin 所有匹配中文
         * @example
         * pinyin2cn("pin");
         * >> return ['拼','品','频','聘','贫','嫔','颦','姘','牝'];
         */
        pinyin2ch: function(str) {
            var tmp = "";
            this.pinyin.c = [];
            this.pinyin.totalpage = 0;
            try {
                //bboBase.pinyin2ch(str);
                tmp = bboBase.pinyin2ch(str);
            } catch (e) {
                //a("bboBase.pinyin2ch(" + str + ") err:" + e);
                tmp = "";
                //TODO 假数据
                tmp = "陈俊成浩方伟郭润桂郭一鸣乔跃舒武孙辉童开宏万友鹏".substr(str.length);
            }
            if (tmp.length > 0) {
                for (var i = 0; i < tmp.length; i++) {
                    this.pinyin.c.push(tmp.substr(i, 1));
                }
                this.pinyin.totalpage = this.countPage(this.pinyin.c.length, this.pinyin.pagesize);
            }
            return this.pinyin.c;
        },
        /**
         * 显示汉字
         * @function
         * @param {int}p 翻页数，-1=向上翻页，1=向下翻页
         */
        pinyinJumpPage: function(p) {
            a("keyboardClass() >> pinyinJumpPage(" + p + ")" + this.pinyin.c);
            if(this.getInputType() != "拼音")
                return;
            if(typeof(p) == "undefined") {
               this.pinyin.page = 1;
                p = 0;
            }
            p += this.pinyin.page;
            if (p < 1) {
                p = this.pinyin.totalpage;
            } else if (p > this.pinyin.totalpage) {
                p = 1;
            }
            //把汉字写进页面
            for (var i = 0; i < this.pinyin.pagesize; i++) {
                var j = (p - 1) * this.pinyin.pagesize + i;
                if (j < this.pinyin.c.length) {
                    this.pinyin.DOM.eq(i + 1).text((i + 1) + "." + this.pinyin.c[j]);
                } else {
                    this.pinyin.DOM.eq(i + 1).text("");
                }
            }
            this.pinyin.page = p;
        },
        /**
         * 选中汉字
         * @function
         * 高亮显示某个汉字，目前无用到，直接用数字键代替高亮选中
         * @param {int}num 第几个汉字，0=第一个
         pinyinSelect : function(n){
         this.pinyin.DOM.removeAttr("class");
         var tmpPage = this.pinyin.page;
         if(n< 0){
         tmpPage --;
         n = this.pinyin.pagesize -1;
         if(tmpPage < 1){
         tmpPage = this.pinyin.totalpage;
         n = this.pinyin.c.length % this.pinyin.pagesize - 1;
         }
         }else if(n >= this.pinyin.pagesize || (this.pinyin.page == this.pinyin.totalpage && n >= this.pinyin.c.length % this.pinyin.pagesize)){
         this.pinyin.page ++;
         if(this.pinyin.page > this.pinyin.totalpage){
         this.pinyin.page = 1;
         }
         n = 0;
         }
         if (tmpPage != this.pinyin.page){
         this.pinyinJumpPage(tmpPage);
         }
         this.pinyin.DOM.eq(n+1).addClass("current");
         this.pos.c = n;
         },
         */
        /**
         * 计算页数
         * @function
         * @param {int}totalRecord 总记录数
         * @param {int}pageSize 每页记录数
         * @return {int}总页数
         * @example
         * countPage(9,3);  //return 3
         * countPage(10,3);  //return 4
         */
        countPage: function(tR, eN) {
            if (tR % eN == 0) {
                //如果整除，则直接除
                return tR / eN;
            } else {
                //非整除，减去余数再除，然后加一
                return (tR - (tR % eN)) / eN + 1;
            }
        }
    };

})();
