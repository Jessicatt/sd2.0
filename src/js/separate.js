(function(sd,window,document,undefined){

    sd.fn.extend({
        separate:function(pathObj){
            //分离器
            //匹配出需要显示的路由
            var regObj = null;
            var path = pathObj.path;
            //取出对应路由配置
            sd.each(this.routes,function(index,item){
                if(item.path == path){
                    regObj = item;
                    return false;
                }
            })

            if(regObj){

                //资源整合
                this.separateData(regObj);
                this.insertDom();
                console.log(this.separateDataArr);
            }
            
            
        },
        //重组之后的数据
        separateDataArr:[],
        separateData:function(o){
            //资源重组 形式 {el:node,dataArr:[{type:'html',data:''}]}

            var obj = {};
            obj.el = this.getDom(o.el);
            if(!obj.el) throw new Error('找不到对应的dom节点:'+o.el);
            obj.dataArr = [];
            this.separateDataArr.push(obj);
            //读取对应资源
            sd.each(sd.unique(o.assets),function(index,item){
                 //资源id
                 var id = this.pathToId(this.parPath,item);
                 var assetObj = sd.getAssetsById(id);
                 obj.dataArr.push({type:assetObj.type,data:assetObj.data});  

            },this)

            //对子组件也进行遍历
            o.children&&(
                sd.each(o.children,function(index,item){
                    this.separateData(item);
                },this)
            )


        },
        insertDom:function(){
            //将分离的资源插入到dom中
            //暂时只分离html
            console.log(this.separateDataArr);
            sd.each(this.separateDataArr,function(index,item){

                var dom = item.el;
                
                for(var i = 0;i<item.dataArr.length;i++){
                    var obj = item.dataArr[i];
                    if(obj.type=='html'){
                        
                        var jsReg = /<script(?:.)*>((.|\s)*)<\/script>/;
                        var cssReg = /<style(?:.)*>((.|\s)*)<\/style>/;
                        var domReg = /<template(?:\s*[\w'"=\s]+)*>(.*)<\/template>/;


                        if(jsReg.exec(obj.data)){
                            
                            var scriptDom = this.createDom('script');
                            scriptDom.innerHTML = RegExp.$1;
                            var head = this.getDom('head');
                            head.appendChild(scriptDom);

                        }
                        // else if(cssReg.exec(obj.data)){

                        // }
                    }
                }
                // sd.each(item.dataArr,function(dataArrIndex,dataArrItem){

                    // if(dataArrItem.type=='html'){

                    //     var jsReg = /<script(?:.)*>((.|\s)*)<\/script>/;
                    //     var cssReg = /<style(?:.)*>((.|\s)*)<\/style>/;
                    //     var domReg = /<template(?:\s*[\w'"=\s]+)*>(.*)<\/template>/;

                    //     // console.log('---------');
                    //     // /ia/g.test('sdfsdf');
                    //     if(jsReg.exec(dataArrItem.data)){
                            
                    //         var scriptDom = this.createDom('script');
                    //         scriptDom.innerHTML = RegExp.$1;
                    //         var head = this.getDom('head');
                    //         head.appendChild(scriptDom);
                    //     }


                    // }

                // },this)

            },this)

        }

    })

})(sd,window,document)