/**
 * 基于Ztree的基本封装
 */
define(['app/common','jquery/ztree'],function(APP){
	$.fn.tree = function(settings,zNodes){
		var _this = $(this);
		var _nodeData = zNodes;
		if(settings){
			if(settings.stmID && settings.async === undefined && zNodes === undefined){//增加stmID选项获取sqlMapper的sqlID获取数组数据
				var url = "app/common/selectArrayByStmID.json";
				var paramData = {};
				if(settings.stmID) paramData.stmID=settings.stmID;
				if(settings.param) paramData.param=settings.param;
				settings.async = {
					'enable' : true,
					'contentType': "application/json;charset=utf-8",
					'otherParam' : paramData,
					'url' : APP.ctx + url,
					'autoParam'  : ["id"],
					'dataType' : "json" 
				}
				//同步方式防止数据量大是无法加载
				/*APP.ajax(url,paramData,'POST',false,function(ret){
					_nodeData = ret;
				});*/
			}
		}
		var tree_settings = $.extend(true,{
			view: {
				dblClickExpand: true,
				nameIsHTML: true
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onNodeCreated : function(event, treeId, treeNode) {
			        if (treeNode.icons) {//iconfont FontAwesome 两种字体
			            $('#'+ treeNode.tId +'_a').addClass(treeNode.icons.indexOf('iconfont') == 0 ? 'icon_fonts' : "icons")
			            						  .find('> span.button').append('<i class="'+ treeNode.icons +'"></i>');
			        }
			        if (settings.onNodeCreated) {
			        	settings.onNodeCreated.toFunc().call(this, event, treeId, treeNode)
			        }
			    },
	            onCollapse: function(event, treeId, treeNode) {
	                if (treeNode.iconsClose) {
	                    $('#'+ treeNode.tId +'_ico').find('> i').attr('class', treeNode.iconsClose)
	                }
	                if (settings.onCollapse) {
	                	settings.onCollapse.toFunc().call(this, event, treeId, treeNode);
	                }
	            },
	            onExpand : function(event, treeId, treeNode) {
	                if (treeNode.icons && treeNode.iconsClose) {
	                    $('#'+ treeNode.tId +'_ico').find('> i').attr('class',treeNode.icons)
	                }
	                if (settings.onExpand) {
	                	settings.onExpand.toFunc().call(this, event, treeId, treeNode);
	                }
	            }
			}
		},settings);
		return $.fn.zTree.init(_this, tree_settings, _nodeData);
	}
	
	
	
	
});