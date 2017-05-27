

var _CONFIG = {
	"debug" : true,
	"jsBaseUrl" : "resource/dist",//datatable引用的swf路径
	"imgBaseUrl" : "resource/dist/images",//图片路径
	"localDataUrl" : "resource/jsons/",//本地数据路径
	"pageContainer" : ".loading-page",//页面容器
	"URLS" : {
		"menuUrl" : "ADMIN/system/index/menu/",//菜单获取Url
		"permissionUrl" : "ADMIN/system/permissions/",//权限获取Url
		"dictUrl" : "ADMIN/system/dict/query/",//服务端字典数据获取URL
		/*sqlmapper ID请求必须在同一个server*/
		"stmMapUrl" : "ADMIN/app/common/selectMapByStmID",//服务端根据sqlmapper ID获取map数据URL
		"stmListUrl" : "ADMIN/app/common/selectArrayByStmID",//服务端根据sqlmapper ID获取List数据URL
		"stmMapListUrl" : "ADMIN/app/common/selectMapListByStmID",//服务端根据sqlmapper ID获取mapList数据URL,需要在param中指定key
	},
	//服务配置,不同的前缀可以访问不同的server服务，如'ADMIN/system/user'为ADMIN server的system/user服务
	"SERVERS" : {
		"LIST" : ["ADMIN","WEIXIN"],//启用服务列表
		"LOCAL_DATA" : ["ADMIN"],
		"DEFAULT" : "ADMIN"
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
		"ATTACH_NAME" : "name",
		"ATTACH_URL" : "url",
		"ATTACH_TYPE" : "type",
		"ATTACH_ID" : "id",
		"ATTACH_OWNER" : "ownerid",
	},
	"HTTP" : {
		/*sqlmapper ID 公共请求的后缀*/
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

var require = {
	waitSeconds: 15,
	urlArgs : _CONFIG.debug ? "t="+new Date().getTime() : "v=1.0"
}