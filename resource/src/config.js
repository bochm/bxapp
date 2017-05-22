var _CONFIG = {
	"isLocalData" : true,//本地数据模式,在服务端还不存在的时候使用，json数据通过本地文件的方式请求
	"localUserName" : "localuser",//本地用户名,不登录默认缓存在本地的用户名称
	"debug" : true,
	"srvUrl" : "http://localhost:9080",
	"ctx" : "/xsrv/",
	"jsBaseUrl" : "resource/src",//datatable引用的swf路径
	"imgBaseUrl" : "resource/src/images",//图片路径
	"pageContainer" : ".loading-page",//页面容器
	"AUTH" : {
		"rpToken" : "rp_token",//服务端token名称,服务端验证header中的token名称
		"userName" : "loginname",//服务端用户登陆名称,header中的名称
		"pwd" : "password",//服务端用户登陆密码,header中的密码
		"usToken" : "rsToken", //服务端返回token名称,user对象的getRsToken
		"loginUrl" : "login"//获取服务端user对象的URL
	},
	"URLS" : {
		"dictUrl" : "system/dict/query/",//服务端字典数据获取URL
		"stmMapUrl" : "app/common/selectMapByStmID",//服务端根据sqlmapper ID获取map数据URL
		"stmListUrl" : "app/common/selectArrayByStmID",//服务端根据sqlmapper ID获取List数据URL
		"stmMapListUrl" : "app/common/selectMapListByStmID"//服务端根据sqlmapper ID获取mapList数据URL,需要在param中指定key
	},
	"KEYS" : {
		"DATA" : "data",//ajax返回json数据对象{"data":[{},{}]}
		"MSG" : "message",
		"STATUS" : "status",
		"OK" : "seccuss",
		"FAIL" : "fail",
		"ERROR" : "error",
		"WORN" : "warning",
		"EXCEPTION" : "exception",
		"CODE" : "code",

	},
	"HTTP" : {
		"SUFFIX": ".json",
		/** 200请求成功 */
		"OK" : {"status":"200","message":"处理成功"},
		/** 207频繁操作 */
		"MULTI_STATUS" : {"status":"207","message":"操作频繁"},
		/** 303登录失败 */
		"LOGIN_FAIL" : {"status":"303","message":"登录失败"},
		/** 400请求参数出错 */
		"BAD_REQUEST" : {"status":"400","message":"请求参数错误"},
		/** 401没有登录 */
		"UNAUTHORIZED" : {"status":"401","message":"登陆过期失效"},
		/** 421没有权限 */
		"FORBIDDEN" : {"status":"421","message":"未授权操作"},
		/** 404找不到页面 */
		"NOT_FOUND" : {"status":"404","message":"页面不存在"},
		/** 408请求超时 */
		"REQUEST_TIMEOUT" : {"status":"408","message":"请求超时"},
		/** 500服务器出错 */
		"SERVER_ERROR" : {"status":"500","message":"服务器系统错误"}
	},
}
if(_CONFIG.isLocalData){
	_CONFIG.srvUrl = "resource/jsons/";
	_CONFIG.ctx = "";
}
var require = {
	waitSeconds: 15,
	urlArgs : _CONFIG.debug ? "t="+new Date().getTime() : "v=1.0"
}