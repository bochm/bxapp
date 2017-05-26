/**
 * 服务端方法调用
 */
define('app/api',['jquery','store','app/servers'],function($,STORE,_SERVERS) {
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
			"urls" : _CONFIG.URLS,
			"defaultError" : function(error){
				_sysError('系统错误['+error[API.STATUS]+']',error[API.MSG]);
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
				if($.isArray(_CONFIG.SERVERS.LIST)){
					for(var i=0;i<_CONFIG.SERVERS.LIST.length;i++){
						STORE.remove(_CONFIG.SERVERS.LIST[i]+_key_user);
					}
				}
			},
			"isForbidden" : function(response){
				if(response[API.STATUS] === undefined) return false;
				return response[API.STATUS] == _CONFIG.HTTP.FORBIDDEN.status;
			},
			"isUnAuthorized" : function(response){
				if(response[API.STATUS] === undefined) return false;
				return response[API.STATUS] == _CONFIG.HTTP.UNAUTHORIZED.status;
			},
			"isError" : function(response){
				if(response[API.STATUS] === undefined) return false;
				return response[API.STATUS] !== _CONFIG.HTTP.OK.status ;
			},
			"respData" : function(response){
				return response[API.DATA];
			},
			"respMsg" : function(response){
				return response[API.MSG];
			},
			"getServerByKey" : function(key){
				return _SERVERS[key];	
			},
			createHeader : _create_header,
			ajax : _ajax,
			localUser : _local_user,
			storeUser : _store_user,
			showLogin : _showLogin,
			createLoginHeader : _create_login_header,
			getServerByUrl :_get_server_by_url,
			backLogin : _backLogin
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
	function _local_user(server){
		if(server) return API.getLocalData(server+_key_user);
		return API.getLocalData(_key_user);
	}
	function _store_user(u,server){
		if(server) API.setLocalData(server+_key_user,u);
		else API.setLocalData(_key_user,u);
	}
	function _get_server_by_url(url){
		try{
			var _s_key = url.substring(0,url.indexOf("/"));
			var _s_index = $.inArray(_s_key,_CONFIG.SERVERS.LIST);
			if(_s_index > -1) {
				return _SERVERS[_CONFIG.SERVERS.LIST[_s_index]];
			}
		}catch(e){
			console.error("server未找到",e);
		}
		return _SERVERS.DEFAULT;
	}
	function _create_header(srv,url,request,errorback){
		if(srv.isLocalData) return true;//本地数据模式
		return srv.createHeader(_local_user(srv.KEY),url,request,errorback);
	}
	function _create_login_header(request,form,url){
		return _get_server_by_url(url).createLoginHeader(request,form);
	}
	function _backLogin(srv,url,form,data,isSync,callback,errorback){
		$.ajax({
			type:'POST',
			url : srv.srvUrl + srv.ctx + srv.loginUrl(),
			contentType : 'application/json;charset=utf-8',
			data: JSON.stringify(srv.loginParam || {}),
			dataType : 'json',
			async:false,
			beforeSend : function(request){
				return srv.createLoginHeader(request);
			},
			success:function(response,status){
				var ret = srv.resp(response);
				if(API.isError(ret)){
					API.defaultError(ret);
				}else{
					var _user = API.respData(ret);
					if(_user != null && _user != undefined){
						_store_user(_user,srv.KEY);
						if(url != undefined && url != null)_ajax(url,data,isSync,callback,errorback);
						else if(form != undefined && url != null) form.submit();
					}else{
						API.defaultError(ret);
					}
				}
			},
			error:function(xhr,status,error){
				console.error(xhr);
				_sysError("系统错误["+xhr[API.STATUS]+"]","服务网络异常!!");
			}
		});
	}
	function _showLogin(url,data,isSync,callback,errorback){
		require(['bootstrap','app/form'],function(){
			if($('#sys-login').length > 0){
				$('#sys-login').modal('show');
				_initLoginForm(url,data,isSync,callback,errorback);
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
						_initLoginForm(url,data,isSync,callback,errorback);
					},
					error: function(xhr, ajaxOptions, thrownError) {
						_sysError("登陆页面加载错误["+xhr.status+"]",xhr.statusText);
					}
				});
			}
		})

	}
    function _initLoginForm(url,data,isSync,callback,errorback){
		var _srv = _get_server_by_url(url);
    	var local_user = _local_user(_srv.KEY);
    	if(local_user != null && local_user != undefined) {
    		document.forms['login-form'].loginname.value = local_user[_srv.AUTH.userName];
    	}
		$('form.login-form').initForm({
			beforeSend : function(request){
				return _srv.createLoginHeader(request,$('form.login-form'));
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
			success:function(resp, status){
				$(".login-form button[type='submit']").removeAttr("disabled").text("登录");
				var response = _srv.resp(resp);
				if(API.isError(response)){
					$('.login-form').prepend("<div class='alert alert-danger'>" +
						"<button class='close' type='button' data-dismiss='alert'>×</button>" +
						"<span></span>"+API.respMsg(response)+"</div>");
				}else{
					API.storeUser(API.respData(response),_srv.KEY);
					$('#sys-login').modal('hide');
					if(url != undefined && url != null)_ajax(url,data,isSync,callback,errorback);
					else if(typeof callback == 'function') callback.call(this,API.respData(response));
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
	 * @param  {Boolean} isLogin 是否登录调用
	 */
	function _ajax(url,data,isSync,callback,errorback,isLogin){
		var _srv = _get_server_by_url(url);
		var _url = _srv.getUrl(url);
		var _errorback = errorback || API.defaultError;
		if(_srv.isLocalData) {//本地数据以json形式存在
			return API.localData(_srv.srvUrl + url,isSync,callback,_errorback);
		}
		var async = true;
		if(isSync != undefined || isSync != null) async = isSync;
		var retData;
		$.ajax({ 
			type:'POST',//统一为post请求，get请求会在url后加参数导致请求失败
			/*url: _CONFIG.ctx+((url.indexOf("?") >0) ? (url.split("?")[0]+_CONFIG.HTTP.SUFFIX+"?" + url.split("?")[1])
				: url+_CONFIG.HTTP.SUFFIX),*/
		    url : _srv.srvUrl + _url,
			contentType : 'application/json;charset=utf-8',
		    data: JSON.stringify(data),
		    async:async,
			dataType : 'json',
		    beforeSend : function(request){
		    	return _create_header(_srv,_url,request,function(err){
					if(_srv.useLoginForm)
						_showLogin(url,data,isSync,callback,_errorback);
					else
						_backLogin(_srv,url,null,data,isSync,callback,_errorback);
				});
			},
		    success:function(response,status){
				var ret = _srv.resp(response);
		    	if(API.isError(ret)){
		    		if(API.isUnAuthorized(ret) && isLogin === undefined){
						if(_srv.useLoginForm)
		    				_showLogin(url,data,isSync,callback,_errorback);
						else
							_backLogin(_srv,url,null,data,isSync,callback,_errorback);
						return;
		        	}else if(API.isForbidden(ret)){
						_sysError("未授权","禁止访问!!");
					}
					_errorback(ret);
		    	}else{
		    		if(typeof callback === 'function'){
			    		callback.call(this,ret);
			        }else{
			        	retData = ret;
			        }
		    	}
		    },
		    error:function(xhr,status,error){
		    	//后端异常以全局处理,前端跨域无法处理后端异常
		    	console.error(xhr);
				_sysError("系统错误["+xhr[API.STATUS]+"]","服务网络异常!!");
		    }
		});
		return retData;  
	}
	/**
	 * json数据同步获取,返回数据查询结果,用于查询类操作
	 */
	API.jsonData = function(url,param,callback){
		var _data;
		_ajax(url,param || {},false,function(ret){
			_data = API.respData(ret);
			if(typeof callback === 'function') callback.call(this,_data);
		});
		if(callback === undefined) return _data;
	}
	//首页获取user
	API.getLoginUser = function(callback,errorback){
		var _srv = _SERVERS.DEFAULT;
		if(_srv.isLocalData){
			return _ajax(_srv.userUrl(),{},true,function(response){
				var ret = _srv.resp(response);
				var _user = API.respData(ret);
				_store_user(_user,_srv.KEY);
				if(typeof callback == "function") callback(_user);
			},function(err,status){
				if(typeof errorback == "function") errorback.call(this,err,status);
			},true);
		}else{
			var _user = _local_user(_srv.KEY);
			if(_user == null || _user == undefined){
				if(typeof errorback == "function") errorback(_CONFIG.HTTP.UNAUTHORIZED);
				return null;
			}else{
				return _ajax(_srv.userUrl(_user),{},true,function(response){
					var ret = _srv.resp(response);
					var _user = API.respData(ret);
					_store_user(_user,_srv.KEY);
					if(typeof callback == "function") callback.call(this,_user);
				},function(err,status){
					if(typeof errorback == "function") errorback.call(this,err,status);
				},true);
			}
		}
		
		
		
	}
	/*
	 * 根据后端sqlmap ID获取数据
	 * 加上后缀避免sqlmap中的 . 造成路径错误
	 */
	API.getMapByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmMapUrl+"/"+stmid+_CONFIG.HTTP.SUFFIX,param);
	}
	API.getListByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmListUrl+"/"+stmid+_CONFIG.HTTP.SUFFIX,param);
	}
	API.getMapListByStmId = function(stmid,param){
		return API.jsonData(_CONFIG.URLS.stmMapListUrl+"/"+stmid+_CONFIG.HTTP.SUFFIX,param);
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
		    url : (url.indexOf(".json") != (url.length -5)) ? url + ".json" : url,
			contentType : 'application/json;charset=utf-8',
		    async: async ? async : false,
		    cache: false,
		    success:function(ret,status){
		    	retData = ret
		    	if(typeof callback === 'function') callback.call(this,ret);
		    },
		    error:function(xhr,status,error){
		    	console.error(xhr);
		    	_sysError("系统异常",url+"数据不存在");
		    	//if(typeof errorback === 'function') errorback.call(this,xhr);
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
		var _srv = _get_server_by_url(_CONFIG.URLS.permissionUrl);
		if(_srv.isLocalData){
			callback.call(this,null,true);
		}else{
			var _user = _local_user(_srv.KEY);
			if(_user == null || _user == undefined){
				_showLogin(null,null,null,null,function(user){
					API.jsonData(_CONFIG.URLS.permissionUrl+user.id+"/"+role,{},function(data){
						callback.call(this,data,false);
					})
				})
			}else{
				API.jsonData(_CONFIG.URLS.permissionUrl+_user.id+"/"+role,{},function(data){
					callback.call(this,data,false);
				});
			}
		}

	}
	//本地直接加載所有字典數據
	if(_SERVERS.DEFAULT.isLocalData){
		var _dict_local = API.jsonData(_SERVERS.DEFAULT.KEY+"/dict-map");
		API.setLocalData(_key_dict,_dict_local);
	}
	
	return API;
});

