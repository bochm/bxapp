var _APP_RESOURCES_DIR = "source";//应用js、css、images根路径,应用打包发布时为 dist,开发是为 source

var _CONFIG = {
	"debug" : true,
	"jsBaseUrl" : _APP_RESOURCES_DIR,//datatable引用的swf路径
	"imgBaseUrl" : _APP_RESOURCES_DIR + "/images",//图片路径
	"localDataUrl" : "jsons/",//本地数据路径
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
		"LOCAL_DATA" : [],
		"DEFAULT" : "ADMIN",
		"ADMIN" : {
			"srvUrl" : "http://localhost:9080",
			"fileSrvUrl" : "http://localhost/upfiles/",//文件服务器地址,用于非本地图片显示
			"ctx" :"/xsrv/"
		},
		"WEIXIN" : {
			"srvUrl" : "http://localhost:8080",
			"fileSrvUrl" : "http://10.20.11.63/",//文件服务器地址,用于非本地图片显示
			"ctx" :"/neu-weixin-web/"
		}
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
		"FILE_NAME" : "name",//文件上传服务返回的文件名称关键字
		"FILE_URL" : "url",//文件上传服务返回的文件URL关键字
		"FILE_TYPE" : "type",//文件上传服务返回的文件类型关键字
		"FILE_ID" : "id",//文件上传服务返回的文件ID关键字
		"FILE_OWNER" : "ownerid",//文件上传服务返回的文件所有者ID关键字
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