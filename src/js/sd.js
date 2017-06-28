(function (win, undefined) {


    var sd = function (routes) {
        return new sd.fn.init(routes);
    }

    sd.fn = sd.prototype = {

        constructor: sd,
        init: function (routes) {

            this.routes = routes;
            //检测hash值
            window.onhashchange = this.getRouterParams;
        },
        //资源路径
        pathArr: [],
        //当前正在解析的顶级路由
        parPath: '',
        readConfig: function (path) {
            //配置
            var path = path;
            this.pathArr.length = 0;

            //读取路径
            sd.each(this.routes,function(index,item){
                this.readPath(item);
            },this)

            for (var j = 0; j < this.pathArr.length; j++) {
                var pathObj = this.pathArr[j];
                var id = this.pathToId(this.parPath, pathObj.url);

                //检测对应的资源是否在管理器中
                if (!this.propInArr('id', id, sd.assetsManage)) {
                    var obj = {
                        id: id,
                        data: '',
                        type:this.getExtName(pathObj.url),
                        status: ''
                    }
                    sd.assetsManage.push(obj);
                }else{
                    //如果已经存在了
                    //先从资源数组中移除
                    sd.each(this.pathArr,function(index,item){
                        if(item.id == id){
                            this.pathArr.splice(id,1);
                            j--;
                            return false;
                        }
                    },this)

                }

            }
            //加载资源开始
            this.loader(this.pathArr);
            //加载完成
            this.addEvent("EVENT_FILE_COMPLETE","loaded",this.separate.bind(this));
        },
        getExtName:function(str){
            //返回后缀名
            return str.replace(/^.+\.(\w+)$/g,'$1');
        },
        pathToId: function (path, str) {
            //路径名转为id
            path = (path == '/' ? 'main' : path).replace(/(\\|\/)/g, '_');
            str = str.replace(/(\\|\/)/g, '_');//将斜线转成下划线
            str = str.replace(/\.(\w)+$/g,'');//去除后缀
            return path + '_' + str;
        },
        readPath: function (obj) {
            //收集对应路由下需要的资源
            if (obj.assets) {
                for (var i = 0; i < obj.assets.length; i++) {
                    var url = obj.assets[i];
                    this.pathArr.push({url:url,id:this.pathToId(this.parPath, url)});
                }
            }
            if (obj.children) {
                for (var j = 0; j < obj.children.length; j++) {
                    this.readPath(obj.children[j]);
                }
            }
        },
        start: function () {
            //判断主页是静态页面还是配在路由中
            var arr = this.routes.filter(function (item) {
                return item.path === '/';
            })
            if (arr && arr.length > 0) {
                this.parPath = '/';
                this.readConfig("/");
            }
            else{
                var page = this.getRouterParams();
                
            }
            // return (arr&&arr.length>0)?true:false;
        },
        propInArr: function (key, value, arr) {
            //对象的key和value是否存在对应的arr中

            for (var i = 0; i < arr.length; i++) {
                var obj = arr[i];
                if (obj[key] && obj[key] === value) {
                    return true;
                }
            }
            return false;
        },
        createDom(str,obj){
            var dom = document.createElement(str);
            obj&&(sd.each(obj,function(key,value){
                dom.setAttribute(key,value);
            }))
            return dom;
        },
        getDom: function (str) {
            //需要扩展
            var domList = null;
            if (document.querySelectorAll) {
                domList = document.querySelectorAll(str);
            }
            return (domList!=null&&domList.length!=0)?(domList.length == 1?domList[0]:domList):(null);
        },
        //配置项
        routes: [],
        //页面的hash处理
        pages: {},
        getRouterParams: function () {
            //取出页面hash值
            
            var hash = window.location.hash;
            
            var obj = '';
            if (hash.indexOf('#') > -1) {
                hash = hash.substring(1, hash.length);
                var params = hash.split('&');
                obj = {
                    'page': params[0]
                };
                this.parPath = params[0];
                for (var i = 1; i < params.length; i++) {
                    var item = params[i].split('=');
                    obj[item[0]] = item[1];
                }
                pages = obj;
                // this.readConfig(params[0]);
                console.log(pages);
            }
            else{
                //没有路由
                obj = '/';
            }
            return obj;
        },
        //事件管理列表
        eventList: {},
        /**
         * 移除所有事件
         */
        removeAllEvent: function () {
            this.eventList = {}
        },
        /**
         * 添加事件
         * 
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         * @param {Function} action 方法，接收一个参数
         */
        addEvent: function (key, onlytag, action) {
            var obj = this.eventList[key];
            if (obj) {
                obj[onlytag] = action;
            } else {
                obj = this.eventList[key] = {};
                obj[onlytag] = action;
            }
        },

        /**
         * 检查是否存在事件侦听
         * 
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         */
        hasEvent: function (key, onlytag) {
            var obj = this.eventList[key];
            if (obj && $.isFunction(obj[onlytag])) {
                return true;
            }
            return false;
        },

        /**
         * 移除事件
         * 
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         */
        removeEvent: function (key, onlytag) {
            if (key === undefined) return;
            if (onlytag === undefined) {
                this.eventList[key] = null;
                delete this.eventList[key];
            } else {
                if (this.eventList[key] === undefined) this.eventList[key] = {};
                this.eventList[key][onlytag] = null;
                delete this.eventList[key][onlytag];
            }
        },
        /**
         * 发布事件
         * 
         * @param {String} key 事件名称
         * @param {Object} params 附带的数据。可选
         */
        dispatchEvent: function (key, params) {
            if (key === undefined) return;
            var obj = this.eventList[key];
            if (obj) {
                for (key in obj) {
                    var action = obj[key];
                    if (action) {
                        if (params !== undefined) action(params);
                        else action();
                    }
                }
            }
        }
        
    }

    sd.hasProp = function (o, prop) {
        //是否拥有属性
        return (prop in o);
    }
    sd.getType = function (o) {
        var s = Object.prototype.toString.call(o);
        return s.substring(8, s.length - 1);
    }
    sd.isRefType = function (o) {
        //是否为引用类型
        var t = sd.getType(o);
        return t !== "String" && t !== "Number" && t !== "Boolean" && t !== "Null";
    }

    //用于扩展sd框架,合并对象到目标对象
    sd.extend = sd.fn.extend = function () {
        var target = arguments[0] || {};
        var len = arguments.length;
        var sourceArr = [];
        if (len == 1) {
            target = this;
            sourceArr = arguments;
        }
        if (len > 1) {
            sourceArr = arguments.slice(1);
        }

        var sl = sourceArr.length;
        for (var i = 0; i < sl; i++) {

            var srcObj = sourceArr[i];
            for (var k in srcObj) {
                //如果有对应的key在sd中 直接返回
                if (target.hasOwnProperty(k)) {
                    throw new TypeError("sd框架中已经存在对应key值,请更换:" + k);
                }

                if (!sd.isRefType(srcObj[k])) {
                    target[k] = srcObj[k];
                } else {
                    var t = sd.getType(srcObj[k]);
                    if (t === "Object") {
                        if (sd.hasProp(target, k)) {
                            sd.extend(target[k], srcObj[k]);
                        } else {
                            target[k] = {};
                            sd.extend(target[k], srcObj[k]);
                        }
                    } else {
                        target[k] = srcObj[k];
                    }
                }
            }

        }


    }

    var classToType = {};

    sd.extend({
        //资源管理器 id 为资源id data 为数据 status 存储状态
        assetsManage: [],
        //根据id读取对应的资源
        getAssetsById:function(id){
            var obj = null;
            sd.each(sd.assetsManage,function(index,item){
                if(id === item.id){
                    obj = item;
                    return false;
                }
            });
            return obj;
        },
        //对象 回调 上下文
        each: function (object, cb, context) {
            //遍历类型化数组
            var name, i = 0, length = object.length;
            var isObj = length == undefined;//判断是对象还是类数组   

            if (isObj) {
                for (name in object) {
                    if (cb.call(context?context:object[name], name, object[name]) === false) {
                        break;
                    }
                }
            }
            else {

                //var value = object[0];   
                //for(; i < length;) {   
                //    if(false === cb.call(value, i, value)) {   
                //        break;   
                //    }   
                //    value = object[++i];   
                //}   
                for (; i < length && false !== cb.call(context?context:object, i, object[i++]);) {
                }

            }

            //则这里返回的object是被修改后的对象或数组   
            return object;
        },
        isObject: function () {

        },
        isFunction: function () {

        },
        //返回数据类型
        type: function (obj) {
            return obj == null ?
                String(obj) :
                classToType[Object.prototype.toString.call(obj)] || "object";
        },
        //数组内简单类型的去重 且无法区分 1 ,'1'
        unique:function(arr){
            var tmp = {},
            ret = [];

            sd.each(arr,function(index,item){
                if (!tmp[item]) {
                    tmp[item] = 1;
                    ret.push(item);
                }
            })

            return ret;
        }
    })

    //将数据类型存储
    sd.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
        classToType["[object " + name + "]"] = name.toLowerCase();
    });

    sd.fn.init.prototype = sd.fn;

    if (win) {
        win.SD = win.sd = sd;
    }

})(window);