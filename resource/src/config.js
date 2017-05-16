var _is_local_data = false;//本地数据模式,在服务端还不存在的时候使用，json数据通过本地文件的方式请求
var _local_user_name = "localuser";//本地用户名,不登录默认缓存在本地的用户名称
var _is_debug = true;
var require = {
	waitSeconds: 15,
	urlArgs : _is_debug ? "t="+new Date().getTime() : "v=1.0"
};
//var _srv_url = "http://10.20.11.95:9080";
var _srv_url = "http://localhost:9080";
var _ctx = "/xsrv/";
var _app_js_base_url = "resource/src";//datatable引用的swf路径
var _app_img_base_url = "resource/src/images";//图片路径

if(_is_local_data){
	_srv_url = "resource/jsons/";
	_ctx = ""
}