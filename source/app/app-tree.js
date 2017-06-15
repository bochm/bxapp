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
				false,function(ret) {
					if (_tmpV != data.getRoot(setting)._ver) {
						return;
					}
					var msg = API.respData(ret);
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
	$.fn.tree = function(settings,zNodes,callback){
		var _this = $(this);
		var _nodeData = zNodes;
		var tree_id = _this.attr("id")
		if(APP.isEmpty(tree_id)){
			alert("请指定tree的id属性");
			return null;
		}
		if(settings){
			if(settings.stmID && settings.async === undefined && APP.isEmpty(zNodes)){//增加stmID选项获取sqlMapper的sqlID获取数组数据
				var url = settings.url || API.urls.stmListUrl;
				var paramData = {};
				if(settings.stmID) url += ("/" + settings.stmID+_CONFIG.HTTP.SUFFIX);
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
			//默认显示图标,显示自定义字体图标判断
			if(settings.view == undefined) settings.view = {};
			if(settings.view.showIcon == undefined) settings.view.showIcon = true;
		}
		
		var tree_settings = $.extend(true,{
			view: {
				dblClickExpand: true,
				nameIsHTML: true,
				fontCss: function(treeId, treeNode){
					return (!!treeNode.highlight) ? {color:"#428bca", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};
				}
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onNodeCreated : function(event, treeId, treeNode) {
			        if (settings.view.showIcon && treeNode.icons) {//iconfont FontAwesome 两种字体
			            $('#'+ treeNode.tId +'_a').addClass(treeNode.icons.indexOf('iconfont') == 0 ? 'icon_fonts' : "icons")
			            						  .find('> span.button').append('<i class="'+ treeNode.icons +'"></i>');
			        }
			        if (settings.onNodeCreated) {
			        	settings.onNodeCreated.call(this, event, treeId, treeNode)
			        }
			    },
	            onCollapse: function(event, treeId, treeNode) {
	                if (treeNode.iconsClose) {
	                    $('#'+ treeNode.tId +'_ico').find('> i').attr('class', treeNode.iconsClose)
	                }
	                if (settings.onCollapse) {
	                	settings.onCollapse.call(this, event, treeId, treeNode);
	                }
	            },
	            onExpand : function(event, treeId, treeNode) {
	                if (treeNode.icons && treeNode.iconsClose) {
	                    $('#'+ treeNode.tId +'_ico').find('> i').attr('class',treeNode.icons)
	                }
	                if (settings.onExpand) {
	                	settings.onExpand.call(this, event, treeId, treeNode);
	                }
	            }
			}
		},settings);
		
		var zTree_obj = $.fn.zTree.init(_this, tree_settings, _nodeData);
		//树形搜索工具
		if(tree_settings.queryTools){
			var nodes = [];
			var queryContent = $("<div class='input-group'>");
			queryContent.html("<span class='input-group-btn'>"+
					"<button type='button' class='btn btn-default btn-expand'><i class='fa fa-plus'></i></button></span>"+
					"<input type='text' class='form-control'>"+
					"<span class='input-group-btn'>"+
					"<button class='btn blue btn-query' type='button'><i class='fa fa-search'></i></button></span>");
			//treeselect放在同级隐藏域中
			if(_this.hasClass("treeSelect")) _this.before(queryContent);
			else _this.parent().before(queryContent);
			var queryInput = queryContent.find('input');
			queryInput.on('keyup',function(e){
				if (e.keyCode == 13 || (e.keyCode == 8 && (this.value.length == 0))) {
					queryTree();
                }
			});
			queryContent.find('button.btn-query').on('click',queryTree);
			queryContent.on('click','.btn-expand',function(){
				$(this).removeClass("btn-expand").addClass("btn-collapse");
				$(this).children('i').removeClass("fa-plus").addClass("fa-minus");
				zTree_obj.expandAll(true)
			});
			queryContent.on('click','.btn-collapse',function(){
				$(this).removeClass("btn-collapse").addClass("btn-expand");
				$(this).children('i').removeClass("fa-minus").addClass("fa-plus");
				zTree_obj.expandAll(false)
			});
			function updateNodes(highlight) {
				for( var i=0, l=nodes.length; i<l; i++) {
					nodes[i].highlight = highlight;
					zTree_obj.updateNode(nodes[i]);
					if(highlight)expandNodeParent(nodes[i]);
				}
			}
			function expandNodeParent(node){
				var parentNode = node.getParentNode();
				if(parentNode != null ){
					zTree_obj.expandNode(parentNode, true, false, true);
					expandNodeParent(parentNode);
				}
			}
			function queryTree(){
				var value = $.trim(queryInput.val());
				if (value != '') {
					updateNodes(false);
					nodes = zTree_obj.getNodesByParamFuzzy("name",value);
					updateNodes(true);
		        }else{
		        	updateNodes(false);
		        }
			}
		}
		if(typeof callback === 'function'){
			callback.call(this,zTree_obj);
		}
		return zTree_obj;
	}
	
	
	
	
});