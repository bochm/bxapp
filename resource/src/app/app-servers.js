/*服务配置,不同的前缀可以访问不同的server服务，如'ADMIN/system/user'为ADMIN server的system/user服务*/
define('app/servers',['jquery','app/digests'],function($,DIGESTS) {
    var _DEFAULT_SERVER = {
        "KEY" : "ADMIN",
        "isLocalData" : false,//本地数据模式,在服务端还不存在的时候使用，json数据通过本地文件的方式请求
        "localUserName" : "localuser",//本地用户名,不登录默认缓存在本地的用户名称
        "srvUrl" : "http://localhost:9080",
        "fileSrvUrl" : "http://localhost/upfiles/",//文件服务器地址,用于非本地图片显示
        "ctx" :"/xsrv/",
        "useLoginForm" : true,//会话或者本地缓存失效后是否需要登陆
        "AUTH" : {
            "rpToken" : "rp_token",//服务端token名称,服务端验证header中的token名称
            "userName" : "loginname",//服务端用户登陆名称,header中的名称
            "pwd" : "password",//服务端用户登陆密码,header中的密码
            "usToken" : "rsToken", //服务端返回token名称,user对象的getRsToken
            "loginParam" : {}
        },
        "loginUrl" : function(user){//登录url
            return "login";
        },
        "userUrl" : function(user){//获取服务端user对象的URL
            return this.KEY+"/login";
        },
        "createHeader" : function(_user,url,request,errorback){
            if(_user == null || _user == undefined || _user[this.AUTH.usToken] == null){
                if(typeof errorback === 'function') errorback.call(this,_CONFIG.HTTP.UNAUTHORIZED);
                return false;
            }
            request.setRequestHeader(this.AUTH.userName,_user[this.AUTH.userName]);
            request.setRequestHeader(this.AUTH.rpToken,
                DIGESTS.hex_hmac_sha256(_user[this.AUTH.usToken], encodeURI(url)));
            return true;
        },
        "createLoginHeader" : function(request,form){
            request.setRequestHeader(this.AUTH.userName,form.find("input[data-role='username']").val());
            request.setRequestHeader(this.AUTH.pwd,form.find("input[data-role='password']").val());
            return true;
        },
        "resp" : function(response){
            return response;
        },
        "respFile" : function(response){
            var resp = {};
            resp[_CONFIG.KEYS.STATUS] = response["status"];
            resp[_CONFIG.KEYS.MSG] = response["message"];
            if(response["data"] !== undefined){
                if($.isArray(response["data"])){
                    resp[_CONFIG.KEYS.DATA] = new Array();
                    for(var i=0;i<response["data"].length;i++){
                        var _file_data = {};
                        _file_data[_CONFIG.KEYS.FILE_ID] = response["data"][i].id;
                        _file_data[_CONFIG.KEYS.FILE_NAME] = response["data"][i].name;
                        _file_data[_CONFIG.KEYS.FILE_URL] = response["data"][i].path;
                        _file_data[_CONFIG.KEYS.FILE_TYPE] = response["data"][i].type;
                        _file_data[_CONFIG.KEYS.FILE_OWNER] = response["data"][i].ownerid;
                        resp[_CONFIG.KEYS.DATA].push(_file_data);
                    }
                }else{
                    resp[_CONFIG.KEYS.DATA] = {};
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_ID] = response["data"].id;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_NAME] = response["data"].name;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_URL] = response["data"].path;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_TYPE] = response["data"].type;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_OWNER] = response["data"].ownerid;
                }
            }
            return resp;
        },
        "getUrl" : function(url){
            if(url.indexOf(this.KEY) == 0)
                return this.ctx+url.substr(this.KEY.length+1,url.length) + this.SUFFIX;
            return this.ctx + url+ this.SUFFIX;
        },
        "getFileUploadUrl" : function(params){
            return "ADMIN/system/file/upload/" + params.ownerid + "/" + params.type;
        },
        "getFileDropUrl" : function(params){
            return "ADMIN/system/file/drop/" + params.id;
        },
        "getFileListUrl" : function(params){
            return "ADMIN/system/file/list/" + params.ownerid + "/" + params.type;
        },
        "SUFFIX": ""
    }
    var _SERVERS = {
        "ADMIN" : _DEFAULT_SERVER,
        "WEIXIN" :$.extend(true,{},_DEFAULT_SERVER,{
            "KEY" : "WEIXIN",
            "srvUrl" : "http://10.20.5.106:8080",
            "fileSrvUrl" : "http://10.20.11.63/",//文件服务器地址,用于非本地图片显示
            "ctx" : "/neu-weixin-web/",
            "useLoginForm" : false,//后台登陆,不使用form
            "AUTH" : {
                "rpToken" : "authToken",
                "userName" : "userCode",
                "pwd" : "password",
                "usToken" : "authToken",
            },
            "loginUrl" : function(user){
                return "login.do";
            },
            "createLoginHeader" : function(request,form){
                request.setRequestHeader("userCode","admin");
                request.setRequestHeader("password","123456admin");
                return true;
            },
            "resp" : function(response){
                response[_CONFIG.KEYS.STATUS] = response["code"];
                return response;
            },
            "respFile" : function(response){
                var resp = {};
                resp[_CONFIG.KEYS.STATUS] = response["code"];
                resp[_CONFIG.KEYS.MSG] = response["message"];
                if(response["data"] !== undefined){
                    resp[_CONFIG.KEYS.DATA] = {};
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_ID] = response["data"].id;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_NAME] = response["data"].attachName;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_URL] = response["data"].attachPath;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_TYPE] = response["data"].attachType;
                    resp[_CONFIG.KEYS.DATA][_CONFIG.KEYS.FILE_OWNER] = response["data"].ownerId;
                }
                return resp;
            },
            "getFileUploadUrl" : function(params){
                return "WEIXIN/attachment/upload/" + params.ownerid + "/" + params.type;
            },
            "getFileDropUrl" : function(params){
                return "WEIXIN/attachment/delete/" + params.ownerid + "/" + params.type;
            },
            "SUFFIX": ".do"
        }),
        "DEFAULT" : {}
    }
    //设置启用本地数据的server
    for(var i=0;i<_CONFIG.SERVERS.LOCAL_DATA.length;i++){
        _SERVERS[_CONFIG.SERVERS.LOCAL_DATA[i]].isLocalData = true;
        _SERVERS[_CONFIG.SERVERS.LOCAL_DATA[i]].srvUrl = _CONFIG.localDataUrl;
        _SERVERS[_CONFIG.SERVERS.LOCAL_DATA[i]].ctx = "";
    }
    //默认服务server
    _SERVERS.DEFAULT = _SERVERS[_CONFIG.SERVERS.DEFAULT];
    return _SERVERS;
});