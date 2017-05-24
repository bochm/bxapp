/*服务配置,不同的前缀可以访问不同的server服务，如'ADMIN/system/user'为ADMIN server的system/user服务*/
define('app/servers',['jquery','app/digests'],function($,DIGESTS) {
    var _DEFAULT_SERVER = {
        "KEY" : "ADMIN",
        "isLocalData" : false,//本地数据模式,在服务端还不存在的时候使用，json数据通过本地文件的方式请求
        "localUserName" : "localuser",//本地用户名,不登录默认缓存在本地的用户名称
        "srvUrl" : "http://localhost:9080",
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
        "getUrl" : function(url){
            if(url.indexOf(this.KEY) == 0)
                return this.ctx+url.substr(this.KEY.length+1,url.length) + this.SUFFIX;
            return this.ctx + url+ this.SUFFIX;
        },
        "SUFFIX": ""
    }
    var _SERVERS = {
        "ADMIN" : _DEFAULT_SERVER,
        "WEIXIN" :$.extend(true,{},_DEFAULT_SERVER,{
            "KEY" : "WEIXIN",
            "srvUrl" : "http://10.20.5.106:8080",
            "ctx" : "/neu-weixin-web/",
            "useLoginForm" : false,
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
                console.log(request);
                return true;
            },
            "resp" : function(response){
                
                response[_CONFIG.KEYS.STATUS] = response["code"];
                return response;
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

