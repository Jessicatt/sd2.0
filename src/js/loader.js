(function(sd,window,document,undefined){

    sd.fn.extend({
        loader:function(assetsArr){
            //加载器
            var type = sd.type(assetsArr);
            if(type==='array'){
                
                var len = assetsArr.length;//{id:"",url:""}
                var num = 0;
                var path = this.parPath.split("/")[0];

                for(var i = 0;i<len;i++){

                    //保留i
                    (function(index,self){
                        var obj = {
                            url:assetsArr[index].url,
                            mothed:"get",
                            async:true,
                            success:function(str){
                                num++;

                                //存储到资源管理器中
                                sd.each(sd.assetsManage,function(n,item){
                                    if(item.id == assetsArr[index].id){
                                        item.data = str;
                                        return false;
                                    }
                                })

                                //加载完成
                                if(num == len){
                                    self.dispatchEvent("EVENT_FILE_COMPLETE",{path:self.parPath});
                                }
                                
                            },
                            error:function(){

                            }
                        }
                        sd.ajax(obj);
                    })(i,this);

                }
            }
            
        }
    })

})(sd,window,document)