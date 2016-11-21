/**
 * 服务端方法调用
 */
define('app/api',['jquery','app/digests'],function($,DIGESTS) {

	var _dict_srv_url = "system/dict/query/";//服务端字典数据获取URL
	var _stmid_map_url = "app/common/selectMapByStmID";//服务端根据sqlmapper ID获取map数据URL
	var _stmid_list_url = "app/common/selectArrayByStmID";//服务端根据sqlmapper ID获取List数据URL
	var _stmid_maplist_url = "app/common/selectMapListByStmID";//服务端根据sqlmapper ID获取mapList数据URL,需要在param中指定key
	
	function _error(msg){
		require(['jquery/gritter'],function(){
			$.gritter.add({
				title: "系统错误",
				text: msg,
				sticky: true,
				time: '3000',
				class_name: 'gritter-error'
			});
		})
	}
	/**
	 * json数据提交,服务器端接收JSON格式的对象
	 * @param  {String} url 提交url
	 * @param  {Boolean} isSync 是否同步
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	function _ajax(url,data,type,isSync,callback,errorback){
		var async = true;
		if(isSync != undefined || isSync != null) async = isSync;
		var retData;
		$.ajax({ 
			type:type, 
		    url: _ctx+((url.indexOf("?") >0) ? (url.split("?")[0]+".json?" + url.split("?")[1]) : url+".json"), 
		    contentType : 'application/json;charset=utf-8',             
		    data: JSON.stringify(data),
		    async:async,
		    success:function(ret,status){
		    	if(typeof callback === 'function'){
		    		callback(ret,status);
		        }else{
		        	retData = ret;
		        }
		    },
		    error:function(xhr,status,error){
		    	if(typeof errorback === 'function'){
		        	errorback(xhr,status,error);
		        }else{
		        	_error('系统错误,错误代码['+status+'] 错误名称['+xhr.statusText+']');
		        	retData = xhr;
		        }
		    }
		});
		return retData;  
	}
	if(! ('API' in window) ){
		window['API'] = {
			"dict" : {},
			"DATA" : "data",//ajax返回json数据对象{"data":[{},{}]}
			"MSG" : "message",
			"STATUS" : "status",
			"OK" : "seccuss",
			"FAIL" : "fail",
			"ERROR" : "error",
			"WORN" : "warning",
			"EXCEPTION" : "exception",
			"ctx" : _ctx,
			"stmidListUrl" : _stmid_list_url,
			"stmidMapUrl" : _stmid_map_url,
			"stmidMapListUrl" : _stmid_maplist_url,
	        ajax : _ajax,
			postJson : function(url,param,isSync,callback,errorback){
				return _ajax(url,param,'POST',isSync,callback,errorback);  
			},
			getJson : function(url,param,isSync,callback,errorback){
				return _ajax(url,param,'GET',isSync,callback,errorback);  
			},
			getJsonData : function(url,param){
				var _data;
				this.getJson(url,param || {},false,function(ret){
					_data = ret;
				});
				return _data;
			},
			getMapByStmId : function(param){
				return this.getJsonData(_stmid_map_url,param);
			},
			getListByStmId : function(param){
				return this.getJsonData(_stmid_list_url,param);
			},
			getMapListByStmId : function(param){
				return this.getJsonData(_stmid_maplist_url,param);
			},
			getDictByType : function(type){
				if(this.isEmpty(this.dict[type])) {
					var _dict_list = this.getJsonData(_dict_srv_url+type);
					if($.isArray(_dict_list) && _dict_list.length > 0){
						this.dict[type] = _dict_list;
					}
				}
				return this.dict[type];
			},
			getDictMap : function(type){
				var _dict_array = this.getDictByType(type);
				var _dict_map = {};
				if($.isArray(_dict_array)){
					for(var i=0;i<_dict_array.length;i++){
						_dict_map[_dict_array[i].value] = _dict_array[i].name;
					}
				}
				return _dict_map;
			},
			getDictName : function(type,value){
				var _dict_map = this.getDictMap(type);
				if(_dict_map[value]) return _dict_map[value];
				else return "";
			}
		}
	}
	
	return API;
});

