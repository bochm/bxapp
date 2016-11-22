/**
 * 服务端方法调用
 */
define('app/api',['jquery','app/digests'],function($,DIGESTS) {
	var _rp_token = "rp_token"; //服务端token名称
	var _user_name = "loginname";//服务端用户登陆名称
	var _us_token = "rsToken";//服务端返回token名称
	var _login_url = "login";
	var _dict_srv_url = "system/dict/query/";//服务端字典数据获取URL
	var _stmid_map_url = "app/common/selectMapByStmID";//服务端根据sqlmapper ID获取map数据URL
	var _stmid_list_url = "app/common/selectArrayByStmID";//服务端根据sqlmapper ID获取List数据URL
	var _stmid_maplist_url = "app/common/selectMapListByStmID";//服务端根据sqlmapper ID获取mapList数据URL,需要在param中指定key
	var storage = window.localStorage;
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
	
	function _local_user(){
		return JSON.parse(storage.getItem('_LOCAL_USER_'));
	}
	function _store_user(u){
		return storage.setItem('_LOCAL_USER_',JSON.stringify(u));
	}
	/**
	 * json数据提交,服务器端接收JSON格式的对象
	 * @param  {String} url 提交url
	 * @param  {Boolean} isSync 是否同步
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	function _ajax(url,data,type,isSync,callback,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			return null;
		}
		console.log(_user);
		var async = true;
		if(isSync != undefined || isSync != null) async = isSync;
		var _url = _ctx + url;
		var retData;
		$.ajax({ 
			type:type, 
			//url: _ctx+((url.indexOf("?") >0) ? (url.split("?")[0]+".json?" + url.split("?")[1]) : url+".json"), 
		    url : _srv_url + _url,
			contentType : 'application/json;charset=utf-8',             
		    data: JSON.stringify(data),
		    async:async,
		    beforeSend: function(request) {
		    	request.setRequestHeader(_user_name, _user['loginName']);
                request.setRequestHeader(_rp_token, DIGESTS.hex_hmac_sha256(_user[_us_token], encodeURI(_url)));
            },
		    success:function(ret,status){
		    	if(ret.ERROR){
		    		if(typeof errorback === 'function'){
			        	errorback(ret,ret[API.STATUS]);
			        }else{
			        	retData = ret;
			        	_error('系统错误,错误代码['+ret[API.STATUS]+'] 错误名称['+xhr[API.MSG]+']');
			        }
		    	}else{
		    		if(typeof callback === 'function'){
			    		callback(ret,status);
			        }else{
			        	retData = ret;
			        }
		    	}
		    },
		    error:function(xhr,status,error){
		    	//后端异常以全局处理,前端跨域无法处理后端异常
		    	_error('系统错误,请确认服务或网络是否正常!');
		    	/*if(typeof errorback === 'function'){
		        	errorback(xhr,status,error);
		        }else{
		        	_error('系统错误,错误代码['+status+'] 错误名称['+xhr.statusText+']');
		        	retData = xhr;
		        }*/
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
			callSrv : function(url,param,callback,errorback){
				return this.postJson(url,param,true,callback,errorback);  
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
			getUser : function(callback,errorback){
				return this.callSrv(_login_url,{},function(user){
					_store_user(user);
					callback(user);
				},function(err){
					errorback(err);
				});
			},
			storeUser : _store_user,
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

