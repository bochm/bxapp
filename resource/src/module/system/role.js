define('module/system/role',['app/common','app/api','app/datatables','app/form','app/tree'],function(APP,API,DT,FORM) {
	var columnDefs = [
	   {"targets": 2,"render" : function(data){return API.getDictName("sys_role_type",data)}},
	   {"targets": 3,"render" : function(data){return API.getDictName("sys_data_scope",data)}}
	];
	var buttons = {
		"sys:role:addRecord" : "addRecord",
		"sys:role:saveRecord" : "saveRecord",
		"sys:role:deleteRecord" : "deleteRecord",
		"sys:role:assignRole" : {
			text : "<i class='fa fa-share-alt'></i> 分配",
			className: 'btn-selectOne',
			action : assignRole
		}
	};
	function permissionRole(dt,node,e){
		APP.showModal("pages/system/role/role-permissions","system-role-permissions",{},function(){
			$("#system-role-permissions-tree").tree({
				stmID : "cn.bx.system.mapper.MenuMapper.selectAllMenuTree",
				data : {
					key : {name : "name"},
					simpleData: {
						enable: true,
						idKey: "id",
						pIdKey: "parent_id"
					}
				}
			});
		});
	}
	function assignRole(e, dt, node, config){
		APP.showModal("pages/system/role/role-assign","system-role-assign",{},function(){
			
		});
	}
	function inti_table(param){
		$('table.datatable').initTable({
			"scrollY": "400px",
			"autoWidth": true,
			"columnDefs" : columnDefs,
			"buttons":API.getButtons("sys:role:",buttons),
			"deleteRecord" : {"url" : 'system/role/delete',"id" : 'id'},
			"addEditForm" : {
				"el" : "#system-role-edit-form",
				"rules":{
					"enname":{"checkExists":{stmid:'cn.bx.system.mapper.RoleMapper.checkEnname'},
						"messages":{"checkExists" : "已存在该英文名称"}}
				}
			},
			"permissionRole" : permissionRole
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

