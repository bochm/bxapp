/**
 * 服务端方法调用
 */
define('app/api',['jquery','app/common','app/digests'],function($,APP,DIGESTS) {
	$.support.cors = true;//ie9必须
	var _rp_token = "rp_token"; //服务端token名称,服务端验证header中的token名称
	var _user_name = "loginname";//服务端用户登陆名称,header中的名称

	var _us_token = "rsToken";//服务端返回token名称,user对象的getRsToken
	var _login_url = "login";//获取服务端user对象的URL
	var _dict_srv_url = "system/dict/query/";//服务端字典数据获取URL
	var _stmid_map_url = "app/common/selectMapByStmID";//服务端根据sqlmapper ID获取map数据URL
	var _stmid_list_url = "app/common/selectArrayByStmID";//服务端根据sqlmapper ID获取List数据URL
	var _stmid_maplist_url = "app/common/selectMapListByStmID";//服务端根据sqlmapper ID获取mapList数据URL,需要在param中指定key
	var storage = window.localStorage;
	function _sysError(msg){
		require(['jquery/gritter'],function(){
			$.gritter.add({
				text: msg,
				title : "系统异常",
				sticky: true,
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
	function _create_header(url,request,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			if(errorback && typeof errorback === 'function') errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			return false;
		}
		request.setRequestHeader(_user_name,_user[_user_name]);
		request.setRequestHeader(_rp_token,DIGESTS.hex_hmac_sha256(_user[_us_token], encodeURI(url)));
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
    	            success: function(html) {
    	            	$('body').append(html);
    					$('#sys-login').modal('show');
    	            	$('#sys-login').on('hide.bs.modal', function () {
    	            		$('#sys-login').remove();
               		 	});
    	            	_initLoginForm(url,data,type,isSync,callback,errorback);
    	            },
    	            error: function(xhr, ajaxOptions, thrownError) {
    	            	_sysError("登陆页面加载错误:状态["+xhr.status+"]错误["+xhr.statusText+"]");
    	            }
    	        });
        	}
			
		})
	}
    function _initLoginForm(url,data,type,isSync,callback,errorback){
    	var local_user = _local_user();
    	if(local_user != null && _local_user != undefined) {
    		document.forms['login-form'].loginname.value = local_user[_user_name];
    	}
    	$('form.login-form').initForm({
        	headers : {},
        	rules:{
				"loginname":{"messages":{"required" : "请输入用户名"}},
				"password":{"messages":{"required" : "请输入密码"}}
			},
        	beforeSubmit : function(formData, jqForm, options){
        		$('.login-form .alert-danger').remove();
        		$(".login-form button[type='submit']").attr("disabled","true").text("登录中..");
        		options.url = (options.url + "/" + formData[0].value);
        		return true;
        	},
        	success:function(response, status){
        		$(".login-form button[type='submit']").removeAttr("disabled").text("登录");
        		if(response.ERROR){
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
	 * json数据提交,服务器端接收JSON格式的对象
	 * @param  {String} url 提交url
	 * @param  {Boolean} isSync 是否同步
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	function _ajax(url,data,type,isSync,callback,errorback,indexLogin){
		var _url = API.ctx + url;
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
		    beforeSend : function(request){
		    	return _create_header(_url,request,errorback);
			},
		    success:function(ret,status){
		    	if(ret.ERROR){
		    		if(ret[API.STATUS] == "401" && indexLogin === undefined){
		    			_showLogin(url,data,type,isSync,callback,errorback);
		        	}
		    		else if(typeof errorback === 'function'){
			        	errorback(ret,ret[API.STATUS]);
			        }else{
			        	retData = ret;
			        	_sysError('系统错误,错误代码['+ret[API.STATUS]+'] 错误名称['+ret[API.MSG]+']');
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
		    	_sysError("请确认是否存在网络或服务器异常!");
		    	errorback(xhr,status);
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
			"srv" : _srv_url,
			"stmidListUrl" : _stmid_list_url,
			"stmidMapUrl" : _stmid_map_url,
			"stmidMapListUrl" : _stmid_maplist_url,
			createHeader : _create_header,
	        ajax : _ajax,
	        localUser : _local_user,
	        storeUser : _store_user,
	        showLogin : _showLogin
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
			if(typeof errorback == "function") errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			else _showLogin(null,null,null,null,callback,errorback);
			return null;
		}else{
			return _user;
		}
		
	}
	//首页获取user
	API.getLoginUser = function(callback,errorback){
		var _user = _local_user();
		if(_user == null || _user == undefined){
			if(typeof errorback == "function") errorback({"status":"401" ,"message":"登陆过期失效"},"401");
			return null;
		}else{
			return _ajax(_login_url+"/"+_user[_user_name],{},'POST',true,function(user){
				_store_user(user);
				if(typeof callback == "function") callback(user);
			},function(err,status){
				if(typeof errorback == "function") errorback(err,status);
			},true);
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
		    	APP.notice('','系统错误,'+url+'数据不存在','error');
		    }
		});
		return retData;  
	}
	/**
	 * 获取功能权限
	 * @param  {String} role 权限前缀 如: sys:role
	 * @return  {Array} 功能数组 如:["sys:role:add","sys:role:update"]
	 */
	API.getPermission = function(role){
		var permissions = API.jsonData("system/permissions/"+_local_user().id+"/"+role);
		//var permissions = ["sys:role:add","sys:role:save","sys:role:delete","sys:role:assignRole"];
		return permissions;
	}
	return API;
});

