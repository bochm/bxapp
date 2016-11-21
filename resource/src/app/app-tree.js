/**
 * 基于Ztree的基本封装
 */
define('app/tree',['jquery','app/common','app/api','jquery/ztree'],function($,APP,API){
	//重写同步tree节点，改为调用API.ajax
	var zt = $.fn.zTree,
	tools = zt._z.tools,
	consts = zt.consts,
	view = zt._z.view,
	data = zt._z.data,
	event = zt._z.event,
	$$ = tools.$;
	$.fn.zTree._z.view.asyncNode = function(setting, node, isSilent, callback) {
		var i, l;
		
		if (node && !node.isParent) {
			tools.apply(callback);
			return false;
		} else if (node && node.isAjaxing) {
			return false;
		} else if (tools.apply(setting.callback.beforeAsync, [setting.treeId, node], true) == false) {
			tools.apply(callback);
			return false;
		}
		if (node) {
			node.isAjaxing = true;
			var icoObj = $$(node, consts.id.ICON, setting);
			icoObj.attr({"style":"", "class":consts.className.BUTTON + " " + consts.className.ICO_LOADING});
		}

		var tmpParam = {};
		for (i = 0, l = setting.async.autoParam.length; node && i < l; i++) {
			var pKey = setting.async.autoParam[i].split("="), spKey = pKey;
			if (pKey.length>1) {
				spKey = pKey[1];
				pKey = pKey[0];
			}
			tmpParam[spKey] = node[pKey];
		}
		if (tools.isArray(setting.async.otherParam)) {
			for (i = 0, l = setting.async.otherParam.length; i < l; i += 2) {
				tmpParam[setting.async.otherParam[i]] = setting.async.otherParam[i + 1];
			}
		} else {
			for (var p in setting.async.otherParam) {
				tmpParam[p] = setting.async.otherParam[p];
			}
		}
		var _tmpV = data.getRoot(setting)._ver;
		API.ajax(tools.apply(setting.async.url, [setting.treeId, node], setting.async.url),
				setting.async.contentType.indexOf('application/json') > -1 ? JSON.stringify(tmpParam) : tmpParam,
				setting.async.type,
				true,function(msg) {
					if (_tmpV != data.getRoot(setting)._ver) {
						return;
					}
					var newNodes = [];
					try {
						if (!msg || msg.length == 0) {
							newNodes = [];
						} else if (typeof msg == "string") {
							newNodes = eval("(" + msg + ")");
						} else {
							newNodes = msg;
						}
					} catch(err) {
						newNodes = msg;
					}

					if (node) {
						node.isAjaxing = null;
						node.zAsync = true;
					}
					view.setNodeLineIcos(setting, node);
					if (newNodes && newNodes !== "") {
						newNodes = tools.apply(setting.async.dataFilter, [setting.treeId, node, newNodes], newNodes);
						view.addNodes(setting, node, -1, !!newNodes ? tools.clone(newNodes) : [], !!isSilent);
					} else {
						view.addNodes(setting, node, -1, [], !!isSilent);
					}
					setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
					tools.apply(callback);
				},
				function(XMLHttpRequest, textStatus, errorThrown) {
					if (_tmpV != data.getRoot(setting)._ver) {
						return;
					}
					if (node) node.isAjaxing = null;
					view.setNodeLineIcos(setting, node);
					setting.treeObj.trigger(consts.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
				}
		);
		return true;
	}
	$.fn.tree = function(settings,zNodes){
		var _this = $(this);
		var _nodeData = zNodes;
		if(settings){
			if(settings.stmID && settings.async === undefined && zNodes === undefined){//增加stmID选项获取sqlMapper的sqlID获取数组数据
				var url = settings.url || API.stmidListUrl;
				var paramData = {};
				if(settings.stmID) paramData.stmID=settings.stmID;
				if(settings.param) paramData.param=settings.param;
				settings.async = {
					'enable' : true,
					'otherParam' : paramData,
					'url' : url,
					'autoParam'  : ["id"]
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