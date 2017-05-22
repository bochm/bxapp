/**
 * 服务端方法调用
 */
define('app/api',['jquery','store','app/digests'],function($,STORE,DIGESTS) {
	$.support.cors = true;//ie9必须
	//常量定义

	var _key_user = "_LOCAL_USER_";//本地缓存中user的key
	var _key_dict = "_DICT_CODE_";//本地缓存中dict的key

	if(! ('API' in window) ){
		window['API'] = {
			"dict" : {},
			"DATA" : _CONFIG.KEYS.DATA,
			"MSG" : _CONFIG.KEYS.MSG,
			"STATUS" : _CONFIG.KEYS.STATUS,
			"OK" : _CONFIG.KEYS.OK,
			"FAIL" : _CONFIG.KEYS.FAIL,
			"ERROR" : _CONFIG.KEYS.ERROR,
			"WORN" : _CONFIG.KEYS.WORN,
			"EXCEPTION" : _CONFIG.KEYS.EXCEPTION,
			"CODE" : _CONFIG.KEYS.CODE,
			"ctx" : _CONFIG.ctx,
			"srv" : _CONFIG.srvUrl,
			"urls" : _CONFIG.URLS,
			"defaultError" : function(error,status){
				_sysError('系统错误['+status+']',error[API.MSG]);
			},
			"getLocalData" : function(key, callback) {
				var data = STORE.get(key);
				if (typeof callback === "function") {
					callback.call(this,data);
				}else{
					return data;
				}

			},
			"setLocalData" : function(key, data) {
				STORE.set(key, data);
			},
			"clearLocalData" : function() {
				STORE.clearAll();
			},
			"removeLocalData" : function(key) {
				STORE.remove(key);
			},
			"logout" : function(){
				STORE.remove(_key_user);
			},
			"isUnAuthorized" : function(response){
				return response[API.STATUS] === _CONFIG.HTTP.UNAUTHORIZED.status
			},
			"isError" : function(response){
				return (response[API.ERROR] ||
					response[API.STATUS] !== _CONFIG.HTTP.OK.status ||
					response[API.CODE] !== _CONFIG.HTTP.OK.status);

			},
			"respData" : function(response){
				return response[API.DATA];
			},
			createHeader : _create_header,
			ajax : _ajax,
			localUser : _local_user,
			storeUser : _store_user,
			showLogin : _showLogin,
			createLoginHeader : _create_login_header
		}
	}


	function _sysError(title,msg){
		require(['jquery/gritter'],function(){
			$.gritter.add({
				text: msg,
				title : title,
				sticky: false,
				time: '5000',
				class_name: 'gritter-error'
			});
		})
	}
	function _local_user(){
		return API.getLocalData(_key_user);
	}
	function _store_user(u){
		API.setLocalData(_key_user,u);
	}
	function _create_header(url,request,errorback){
		if(_CONFIG.isLocalData) return true;//本地数据模式
		
		var _user = _local_user();
		if(_user == null || _user == undefined || _user[_CONFIG.AUTH.usToken] == null){
			if(typeof errorback === 'function') errorback(_CONFIG.HTTP.UNAUTHORIZED,_CONFIG.HTTP.UNAUTHORIZED.status);
			else API.defaultError(_CONFIG.HTTP.UNAUTHORIZED,API.HTTP.UNAUTHORIZED.status)
			return false;
		}
		request.setRequestHeader(_CONFIG.AUTH.userName,_user[_CONFIG.AUTH.userName]);
		request.setRequestHeader(_CONFIG.AUTH.rpToken,DIGESTS.hex_hmac_sha256(_user[_CONFIG.AUTH.usToken], encodeURI(url)));
		return true;
	}
	function _create_login_header(request,form){
		request.setRequestHeader(_CONFIG.AUTH.userName,form.find("input[data-role='username']").val());
		request.setRequestHeader(_CONFIG.AUTH.pwd,form.find("input[data-role='password']").val());
		return true;
	}
	function _showLogin(url,data,type,isSync,callback,errorback){
		require(['bootstrap','app/form'],function(){
			if($('#sys-login').length > 0){
        		$('#sys-login').modal('show');
        	}else{
        		$.ajax({
    	            type: "GET",
    	            cache: false,
    	            url: "login-pop.html",
    	            dataType: "html",
					async:false,
    	            success: function(html) {
    	            	$('body').append(html);
    					$('#sys-login').modal('show');
    	            	_initLoginForm(url,data,type,isSync,callback,errorback);
    	            },
    	            error: function(xhr, ajaxOptions, thrownError) {
    	            	_sysError("登陆页面加载错误["+xhr.status+"]",xhr.statusText);
    	            }
    	        });
        	}
			
		})
	}
    function _initLoginForm(url,data,type,isSync,callback,errorback){
    	var local_user = _local_user();
    	if(local_user != null && _local_user != undefined) {
    		document.forms['login-form'].loginname.value = local_user[_CONFIG.AUTH.userName];
    	}
    	$('form.login-form').initForm({
			beforeSend : function(request){
				return API.createLoginHeader(request,$('form.login-form'));
			},
        	rules:{
				"loginname":{"messages":{"required" : "请输入用户名"}},
				"password":{"messages":{"required" : "请输入密码"}}
			},
        	beforeSubmit : function(formData, jqForm, options){
        		$('.login-form .alert-danger').remove();
        		$(".login-form button[type='submit']").attr("disabled","true").text("登录中..");
        		/*options.url = (options.url + "/" + formData[0].value);*/
        		return true;
        	},
        	success:function(response, status){
        		$(".login-form button[type='submit']").removeAttr("disabled").text("登录");
        		if(API.isError(response)){
        			$('.login-form').prepend("<div class='alert alert-danger'>" +
        					"<button class='close' type='button' data-dismiss='alert'>×</button>" +
        					"<span></span>"+response[API.MSG]+"</div>");
        		}else{
        			API.storeUser(response);
        			$('#sys-login').modal('hide');
        			if(url != undefined && url != null)_ajax(url,data,type,isSync,callback,errorback);
        			else if(typeof callback == 'function') callback(response);
        		}
        		
        	},
        	error:function(err){
        		$(".login-form button[type='submit']").removeAttr("disabled").text("登录");
        		$('.login-form').prepend("<div class='alert alert-danger'>" +
    					"<button class='close' type='button' data-dismiss='alert'>×</button>" +
    					"<span></span>系统错误，无法连接服务器</div>");
        	}
        });
    }
	/**
	 * ajax数据请求,服务器端接收JSON格式的对象
	 * @param  {String} url 提交url
	 * @param  {Boolean} isSync 是否同步
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 * @param  {Boolean} indexLogin 是否首页登录调用
	 */
	function _ajax(url,data,type,isSync,callback,errorback,indexLogin){
		var _url = _CONFIG.ctx + url;
		var _errorback = errorback || API.defaultError;
		if(_CONFIG.isLocalData) {//本地数据以json形式存在
			return API.localData(_CONFIG.srvUrl + url,isSync,callback,_errorback);
		}
		var async = true;
		if(isSync != undefined || isSync != null) async = isSync;
		var retData;
		$.ajax({ 
			type:type, 
			/*url: _CONFIG.ctx+((url.indexOf("?") >0) ? (url.split("?")[0]+_CONFIG.HTTP.SUFFIX+"?" + url.split("?")[1])
				: url+_CONFIG.HTTP.SUFFIX),*/
		    url : _CONFIG.srvUrl + _url,
			contentType : 'application/json;charset=utf-8',
		    data: JSON.stringify(data),
		    async:async,
		    beforeSend : function(request){
		    	return _create_header(_url,request,_errorback);
			},
		    success:function(ret,status){
		    	if(API.isError(ret)){
		    		if(API.isUnAuthorized(ret) && indexLogin === undefined){
		    			_showLogin(url,data,type,isSync,callback,_errorback);
						return;
		        	}
					_errorback(ret);
		    	}else{
		    		if(typeof callback === 'function'){
			    		callback(ret);
			        }else{
			        	retData = ret;
			        }
		    	}
		    },
		    error:function(xhr,status,error){
		    	//后端异常以全局处理,前端跨域无法处理后端异常
		    	console.error(xhr);
				_sysError("系统错误["+xhr[API.MSG]+"]","服务网络异常!!");
		    }
		});
		return retData;  
	}
	/**
	 * json数据提交,服务接收JSON格式的对象,返回服务处理结果,用于非查询类操作
	 */
	API.postJson = function(url,param,isSync,callback,errorback){
		return _ajax(url,param,'POST',isSync,callback,errorback);  
	}
	/**
	 * json数据获取,返回数据查询结果,用于简单查询类操作
	 */
	API.getJson = function(url,param,isSync,callback,errorback){
		return _ajax(url,param,'POST',isSync,callback,errorback);
	}
	/**
	 * json数据同步获取,返回数据查询结果,用于查询类操作
	 */
	API.jsonData = function(url,param){
		var _data;
		this.getJson(url,param || {},false,function(ret){
			_data = API.respData(ret);
		});
		return _data;
	}
	/*
	 * 获取本地缓存user，如不存在则进行错误处理或者显示登陆pop页面
	 */
	API.getUser = function(callback,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			if(typeof errorback == "function") errorback(_CONFIG.HTTP.UNAUTHORIZED,_CONFIG.HTTP.UNAUTHORIZED.status);
			else _showLogin(null,null,null,null,callback,errorback);
			return null;
		}else{
			return _user;
		}
		
	}
	//首页获取user
	API.getLoginUser = function(callback,errorback){
		if(_CONFIG.isLocalData){
			return _ajax(_CONFIG.AUTH.loginUrl+"/"+_CONFIG.localUserName,{},'GET',true,function(user){
				_store_user(user);
				if(typeof callback == "function") callback(user);
			},function(err,status){
				if(typeof errorback == "function") errorback(err,status);
			},true);
		}else{
			var _user = _local_user();
			if(_user == null || _user == undefined){
				if(typeof errorback == "function") errorback(_CONFIG.HTTP.UNAUTHORIZED,_CONFIG.HTTP.UNAUTHORIZED.status);
				return null;
			}else{
				return _ajax(_CONFIG.AUTH.loginUrl,{},'POST',true,function(user){
					var _user = API.respData(user);
					_store_user(_user);
					if(typeof callback == "function") callback.call(this,_user);
				},function(err,status){
					if(typeof errorback == "function") errorback.call(this,err,status);
				},true);
			}
		}
		
		
		
	}
	/*
	 * 根据后端sqlmap ID获取数据
	 */
	API.getMapByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmMapUrl+"/"+stmid,param);
	}
	API.getListByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmListUrl+"/"+stmid,param);
	}
	API.getMapListByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmMapListUrl+"/"+stmid,param);
	}
	/*
	 * 根据类型获取后端字典数据,本地缓存
	 */
	API.getDictByType = function(type){
		var _dict_local = API.getLocalData(_key_dict);
		if(_dict_local == null || _dict_local == undefined){
			_dict_local = {};
		}
		if(_dict_local[type] == null || _dict_local[type] == undefined){
			_dict_local[type] = API.jsonData(API.urls.dictUrl+type);
			if($.isArray(_dict_local[type]) && _dict_local[type].length > 0){
				API.setLocalData(_key_dict,_dict_local);
			}
		}
		return _dict_local[type];
	}
	/*
	 * 根据类型获取后端字典数据,转换map类型方便页面判断
	 */
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
	/*
	 * 根据类型和字典值（value）获取后端字典数据的名称（name）,页面显示字典名称使用
	 */
	API.getDictName = function(type,value){
		var _dict_map = API.getDictMap(type);
		if(_dict_map[value]) return _dict_map[value];
		else return "";
	}
	API.localData = function(url,async,callback,errorback){
		var retData;
		$.ajax({ 
		    url : (url.indexOf(_CONFIG.HTTP.SUFFIX) != (url.length -5)) ? url + _CONFIG.HTTP.SUFFIX : url,
			contentType : 'application/json;charset=utf-8',
		    async: async ? async : false,
		    cache: !_CONFIG.isLocalData,
		    success:function(ret,status){
		    	retData = ret
		    	if(typeof callback === 'function') callback.call(this,ret);
		    },
		    error:function(xhr,status,error){
		    	console.error(xhr);
		    	_sysError("系统异常",url+"数据不存在");
		    	if(typeof errorback === 'function') errorback.call(this,xhr);
		    }
		});
		return retData;  
	}
	/**
	 * 获取功能权限
	 * @param  {String} role 权限前缀 如: sys:role
	 * @return  {Array} 功能数组 如:["sys:role:add","sys:role:update"]
	 */
	API.getPermission = function(role,callback){
		//var permissions = ["sys:role:add","sys:role:save","sys:role:delete","sys:role:assignRole"];
		var _user = _local_user();
		if(_user == null || _user == undefined){
			_showLogin(null,null,null,null,function(user){
				callback.call(this,API.jsonData("system/permissions/"+user.id+"/"+role));
			})
		}else{
			callback.call(this,API.jsonData("system/permissions/"+_local_user().id+"/"+role));
		}
	}
	//本地直接加載所有字典數據
	if(_CONFIG.isLocalData){
		var _dict_local = API.jsonData("dict-map");
		API.setLocalData(_key_dict,_dict_local);
	}
	
	return API;
});

