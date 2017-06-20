require.config({
	paths:{
		'app/index':'app/app-index',
		'app/common':'app/app-common',
		'app/servers':'app/app-servers',
		'app/api':'app/app-api',
		'app/digests':'app/app-digests',
		'app/form':'app/app-form',
		'app/datatables':'app/app-datatables',
		'app/treetable':'app/app-treeTable',
		'app/tree':'app/app-tree',
		'bootstrap':'lib/bootstrap/bootstrap',
		'bootstrap/daterangepicker':'lib/bootstrap/daterangepicker/daterangepicker',
		'bootstrap/datepicker':'lib/bootstrap/datepicker/bootstrap-datepicker',
		'bootstrap/typeahead':'lib/bootstrap/typeahead/bootstrap3-typeahead',
		'sweetalert':'lib/bootstrap/sweetalert/sweet-alert',//弹出窗口
		'switch':'lib/bootstrap/switch/bootstrap-switch',//开关选择
		'moment':'lib/utils/moment',//时间工具
		'jquery':'lib/jquery/jquery-2.2.0.min',
		'jquery/migrate':'lib/jquery/jquery-migrate-min',//jquery版本迁移插件
		'jquery/iframe':'lib/jquery/jquery.iframe-transport',//jquery iframe支持插件(文件上传)
		'jquery/ui/widget':'lib/jquery/jquery.ui.widget',//jquery ui widget(文件上传)
		'jquery/scrollbar':'lib/jquery/scrollbar/jquery.slimscroll',//滚动条
		'jquery/blockui':'lib/jquery/blockui/jquery.blockUI',//遮罩
		'jquery/gritter':'lib/jquery/gritter/jquery.gritter', //弹出提示
		'jquery/pulsate':'lib/jquery/pulsate/jquery.pulsate', //突出闪动
		'jquery/colorbox':'lib/jquery/colorbox/jquery.colorbox',//图片展示
		'jquery/carousel':'lib/jquery/carousel/owl.carousel',//滚动轮播
		'jquery/form':'lib/jquery/form/jquery.form',//ajax form
		'jquery/validate':'lib/jquery/validate/jquery.validate',//验证
		'jquery/select2':'lib/jquery/select2/select2.full',//下拉列表
		'jquery/ztree':'lib/jquery/ztree/jquery.ztree.all',//树形
		'jquery/summernote':'lib/jquery/summernote/summernote',//富文本编辑
		'jquery/fileupload':'lib/jquery/fileupload/jquery.fileupload',//文件上传
		'datatables.net':'lib/jquery/datatables/jquery.dataTables',
		'datatables.net-buttons':'lib/jquery/datatables/dataTables.buttons',
		'datatables/buttons/flash':'lib/jquery/datatables/buttons.flash',
		'datatables/buttons/print':'lib/jquery/datatables/buttons.print',
		'datatables/select':'lib/jquery/datatables/dataTables.select',
		'datatables/responsive':'lib/jquery/datatables/dataTables.responsive',
		'datatables/fixedHeader':'lib/jquery/datatables/dataTables.fixedHeader',
		'echarts':'lib/echarts/echarts',
		'store' : 'lib/ie-need/store.everything.min',
		'numeral' : 'lib/utils/numeral'
	},
	map: {
        '*': {'css': 'css-builder'}//css加载css-builder。js
    },
	shim:{
		'bootstrap':['jquery'],
		'jquery/blockui':['jquery'],
		'jquery/gritter':['jquery','css!lib/jquery/gritter/jquery.gritter.css'],
		'jquery/colorbox':['jquery'],
		'jquery/carousel':['jquery','css!lib/jquery/carousel/owl.carousel.css'],
		'jquery/select2':['jquery','css!lib/jquery/select2/select2.css'],
		'jquery/ztree':['jquery','css!lib/jquery/ztree/metroStyle.css'],
		'bootstrap/daterangepicker':['bootstrap','moment','css!lib/bootstrap/daterangepicker/daterangepicker.css'],
		'bootstrap/datepicker':['bootstrap','css!lib/bootstrap/datepicker/bootstrap-datepicker3.css'],
		'sweetalert':['jquery','css!lib/bootstrap/sweetalert/sweet-alert.css'],
    	'bootstrap/typeahead' : ['bootstrap']
    }
});

define(['app/index'],function(APP){
	var _now_hour = APP.formatDate('H');
	if(_now_hour > 13 || _now_hour < 8){
		require(['css!app/main-themes-default.css']);
	}else{
		require(['css!app/main-themes-light.css']);
	}
	var url = APP.getURLParameter("page");
	if(!APP.isEmpty(url)) {
		$("div.page-content").css({"padding-left":"3px","margin":"5px","width":"98%"});
		APP.loadPage("div.page-content",url);
	}else{
		$("div.page-container").remove();
		APP.showIndex();
	}
	return APP;
});
