/**
 * 服务端方法调用
 */
define('app/api',['jquery','app/digests'],function($,DIGESTS) {
	$.support.cors = true;//ie9必须
	var _rp_token = "rp_token"; //服务端token名称,服务端验证header中的token名称
	var _user_name = "loginname";//服务端用户登陆名称,header中的名称
	var _user_login = 'loginName';//客户端获取用户登陆名,user对象的getLoginName
	var _us_token = "rsToken";//服务端返回token名称,user对象的getRsToken
	var _login_url = "login";//获取服务端user对象的URL
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
	function _create_header(url,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			if(errorback && typeof errorback === 'function') errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			return null;
		}
		var _header = {};
		_header[_user_name] = _user[_user_login];
		_header[_rp_token] = DIGESTS.hex_hmac_sha256(_user[_us_token], encodeURI(url));
		return _header;
	}
	/**
	 * json数据提交,服务器端接收JSON格式的对象
	 * @param  {String} url 提交url
	 * @param  {Boolean} isSync 是否同步
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	function _ajax(url,data,type,isSync,callback,errorback){
		var _url = API.ctx + url;
		var _header = _create_header(_url,errorback);
		if(_header == null) return;
		
		var async = true;
		if(isSync != undefined || isSync != null) async = isSync;
		
		var retData;
		$.ajax({ 
			type:type, 
			//url: _ctx+((url.indexOf("?") >0) ? (url.split("?")[0]+".json?" + url.split("?")[1]) : url+".json"), 
		    url : _srv_url + _url,
			contentType : 'application/json;charset=utf-8',
		    data: JSON.stringify(data),
		    async:async,
		    headers : _header,
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
		    	console.log(xhr);
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
			createHeader : _create_header,
	        ajax : _ajax,
	        storeUser : _store_user
		}
	}
	API.postJson = function(url,param,isSync,callback,errorback){
		return _ajax(url,param,'POST',isSync,callback,errorback);  
	}
	API.callSrv = function(url,param,callback,errorback){
		return API.postJson(url,param,true,callback,errorback);  
	}
	API.getJson = function(url,param,isSync,callback,errorback){
		return _ajax(url,param,'GET',isSync,callback,errorback);  
	}
	API.jsonData = function(url,param){
		var _data;
		this.postJson(url,param || {},false,function(ret){
			_data = ret;
		});
		return _data;
	}
	API.getUser = function(callback,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			return null;
		}else{
			return API.callSrv(_login_url+"/"+_user[_user_login],{},function(user){
				_store_user(user);
				callback(user);
			},function(err){
				errorback(err);
			});
		}
		
	}
	API.getMapByStmId = function(param){
		return API.jsonData(_stmid_map_url,param);
	}
	API.getListByStmId = function(param){
		return API.jsonData(_stmid_list_url,param);
	}
	API.getMapListByStmId = function(param){
		return API.jsonData(_stmid_maplist_url,param);
	}
	API.getDictByType = function(type){
		if(API.dict[type] == undefined || API.dict[type] == null) {
			var _dict_list = API.jsonData(_dict_srv_url+type);
			if($.isArray(_dict_list) && _dict_list.length > 0){
				API.dict[type] = _dict_list;
			}
		}
		return API.dict[type];
	}
	API.getDictMap = function(type){
		var _dict_array = API.getDictByType(type);
		var _dict_map = {};
		if($.isArray(_dict_array)){
			for(var i=0;i<_dict_array.length;i++){
				_dict_map[_dict_array[i].value] = _dict_array[i].name;
			}
		}
		return _dict_map;
	}
	API.getDictName = function(type,value){
		var _dict_map = API.getDictMap(type);
		if(_dict_map[value]) return _dict_map[value];
		else return "";
	}
	API.localData = function(url){
		var retData;
		$.ajax({ 
		    url : url,
			contentType : 'application/json;charset=utf-8',
		    async:false,
		    success:function(ret,status){
		    	retData = ret
		    },
		    error:function(xhr,status,error){
		    	_error('系统错误,'+url+'数据不存在');
		    }
		});
		return retData;  
	}
	return API;
});

