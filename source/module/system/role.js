define('module/system/role',['app/common','app/api','app/datatables','app/form','app/tree'],function(APP,API,DT,FORM) {
	var columnDefs = [
	   {"targets": 2,"render" : function(data){return API.getDictName("sys_role_type",data)}},
	   {"targets": 3,"render" : function(data){return API.getDictName("sys_data_scope",data)}}
	];
	function permissionRole(dt, node,e){
		var selectedId = dt.selectedRows()[0].id;
		APP.showModal("pages/system/role/role-permissions","#system-role-permissions",{},function(){
			var tree = $("#system-role-permissions-tree").tree({
				stmID : "cn.bx.system.mapper.RoleMapper.selectAllMenuTree",
				param : {"roleId" : selectedId},
				check: {enable: true},
				data : {simpleData: {pIdKey: "parent_id"}},
				queryTools : true
			});
			
			$('#system-role-permissions .btn-primary').on('click',function(){
				var checkedNode = tree.getCheckedNodes(true);
				var l = checkedNode.length;
				if(l > 0){
					var menuIds = new Array();
					for(var i=0;i<l;i++){
						menuIds.push(checkedNode[i].id);
					}
					API.ajax('ADMIN/system/role/menu/'+selectedId,menuIds,true,function(ret){
						APP.success(ret,'#system-role-permissions');
					})
				}else{
					APP.error('请选择需要授权的菜单','#system-role-permissions');
				}
			})
		});
	}
	function assignRole(dt, node,e){
		var selectedId = dt.selectedRows()[0].id;
		APP.showModal("pages/system/role/role-assign","#system-role-assign",{},function(){
			var tree = $("#system-role-assign-tree").tree({
				stmID : "cn.bx.system.mapper.RoleMapper.selectAllUserTree",
				param : {"roleId" : selectedId},
				check: {enable: true},
				data : {simpleData: {pIdKey: "parent_id"}},
				queryTools : true,
				onNodeCreated : function(event, treeId, treeNode){
					var treeObj = $.fn.zTree.getZTreeObj(treeId);
					if(treeNode.icons != 'fa fa-user' && 
							treeObj.getNodesByParam("icons", "fa fa-user", treeNode).length == 0){
						treeObj.removeNode(treeNode);
					}
					if(treeNode.checked){//由于人员树形包含组织机构,组织机构node不带有checked和open属性，需要重新展开节点
						treeObj.checkNode(treeNode, true, true);
					}
				}
			},null,function (treeObj) {
				//由于人员树形包含组织机构,组织机构node不带有checked和open属性，需要重新展开节点
				var nodes = treeObj.getNodesByFilter(function (node) { return node.level == 0 });
				for(var i=0;i<nodes.length;i++){
					if(treeObj.getNodesByParam("checked", true, nodes[i]).length > 0)
						treeObj.expandNode(nodes[i], true, true, true);
				}
			});

			$('#system-role-assign .btn-primary').on('click',function(){
				var checkedNode = tree.getCheckedNodes(true);
				var l = checkedNode.length;
				if(l > 0){
					var userIds = new Array();
					for(var i=0;i<l;i++){
						if(checkedNode[i].icons == 'fa fa-user')userIds.push(checkedNode[i].id);
					}
					API.ajax('ADMIN/system/role/user/'+selectedId,userIds,true,function(ret){
						APP.success(ret,'#system-role-assign',true);
					})
				}else{
					APP.error('请选择需要分配的用户','#system-role-assign');
				}
			})
		});
	}
	function inti_table(param){
		$('table#table-system-role-list').initTable({
			"autoWidth": true,
			"columnDefs" : columnDefs,
			"permission" : true,
			"deleteRecord" : {"url" : 'ADMIN/system/role/delete',"id" : 'id'},
			"addEditForm" : {
				"title":"角色维护",
				"editModal":"#system-role-list-edit",
				"id" : "#system-role-edit-form",
				"rules":{
					"enname":{"checkExists":{stmid:'cn.bx.system.mapper.RoleMapper.checkEnname'},
						"messages":{"checkExists" : "已存在该英文名称"}}
				}
			},
			"permissionRole" : permissionRole,"assignRole" : assignRole
		},function(dt){
			
		});
	}
	
	return {
		inti_table : inti_table,
		init : function(param){
			this.inti_table(param);
		}
		
	}
});

