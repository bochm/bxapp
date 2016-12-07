var _is_debug = true;
var require = {
	waitSeconds: 15,
	urlArgs : _is_debug ? "t="+new Date().getTime() : "v=1.0"
};
var _srv_url = "http://10.20.11.95:9080";
var _ctx = "/xsrv/";
var _app_js_base_url = "resource/src";//datatable引用的swf路径
var _app_img_base_url = "resource/src/images";//图片路径