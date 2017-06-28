//扩展ajax插件
(function(sd, window, document,undefined){

    sd.extend({
        createAjax:function(){
            var i = 0;
            for(;i<this.cacheAjax.length;i++){
                if(this.cacheAjax[i].readyState == 0|| this.cacheAjax[i].readyState == 4){
                    return this.cacheAjax[i];
                }
            }
            var xmlhttp = null;
            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            }
            else
            {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.withCredentials = true;//允许跨域发送cookie
            this.cacheAjax[this.cacheAjax.length] = xmlhttp;
            return xmlhttp;
        },
        //ajax请求
        //{data:{},url:'',upload:true,mothed:'post,get',success:function(){},error:function(){},async:true,timeout:6000};
        ajax:function(obj){
            
            var xhr = this.createAjax();
            let url = obj.url;
            let mothed = obj.mothed;
            let timeout = obj.timeout;
            // var keyTimer = '';

            //解析参数
            if(mothed === 'get'&&obj.data) url +=  '?' + this.paramsAjaxData(obj.data);
            if(url.indexOf('?')>0) url+='&r=' + Math.random();
            else url+='?r=' + Math.random();

            //判断是否完成
            if(obj.async){
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        // Timer.clear(keyTimer);
                    
                        if(xhr.status===0) {
                            return;
                        }
                        if(xhr.status == 200){
                            obj.success&&obj.success(xhr.responseText);
                        }
                        else{
                            obj.error&&obj.error('服务器错误,请稍后重新尝试!!');
                        }

                    }
                }
            }

            //到时间后取消请求
            if(timeout&&timeout>0){
                function ajaxTimeOut(){
                    obj.error&&obj.error('服务器错误,请稍后重新尝试!!');
                    xhr.abort();
                }
                // keyTimer = Timer.add(ajaxTimeOut,timeout,1);
            }

            //发送请求
            xhr.open(mothed,url,obj.async);
            if(mothed === 'post'){
                if(!obj.upload) xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                xhr.send(obj.upload?obj.data:this.paramsAjaxData(obj.data,obj.dataType));
            }
            else{
                xhr.send(null);
            }

            console.log('ajax url is:',url);
            //同步的话
            // if(!obj.async)  this.ajaxCallBack(xhr,obj.callback,obj.error);
    
        },
        paramsAjaxData(data,json){

            if(!data) return '';
            if(json) return JSON.stringify(json);
            let arr = [];
            for(let str in data){
                arr.push( encodeURIComponent(str) + '=' + encodeURIComponent(data[str]));
            }
            return arr.join('&');

        },
        cacheAjax:[]
    })
    


  })(sd,window,document)
  