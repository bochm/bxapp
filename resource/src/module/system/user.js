define('module/system/user',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
	var userTable;
	var columns = [
		{ "data": "id","title":"id","visible":false},
		{ "data": "loginName","title":"登录账号"},
		{ "data": "name","title":"姓名"},
		{ "data": "no","title":"工号"},
		{ "data": "email","title":"email"},
		{"data": "company.name","title":"公司"},
		{"data": "remarks","title":"备注"}
	];
	var form_rules = {
		"loginName":{
			"checkExists":{
				"url":"ADMIN/system/user/checkLoginName"
			},
			"messages":{
				"checkExists" : "登录名已存在"
			}
		}
	}
	var field_opts = {
		"company.id" : {param : {type : "公司"}},
		"dept.id" : {param : {type : "部门"}},
		"photo" : {fileServer:"ADMIN",param : {type:'user'}}
	}
	function _update_user(dt,node,e){
		if(dt.selectedCount() != 1){
			APP.info('请选择一条需要修改的用户');
			return;
		}
		$('#sys-user-password').removeClass('required');//密码不填写视为不修改密码
		FM.editForm({title:'修改用户',rules : form_rules,fieldOpts : field_opts,submitClear : false,formData : dt.selectedRows()[0],
			"submitJson" : false,autoClose : true,url : "ADMIN/system/user/edit",editModal:"#system-user-list-edit"},function(data){
			dt.updateSelectedRow(data);
		});

		//修改时密码显示为空
		$('#sys-user-password').attr('type','text');
		$('#sys-user-password').val('');
		$('#sys-user-password').attr('type','password');
	}
	function inti_table(param){
		$('table#table-system-user-list').initTable({
			"title" : "用户表",
			"columns" : columns,
			"footer" : [{"data":"loginName","title":"合计"},{"data":"name","type":"count"},{"data":"no","type":"sum","format":"0.00"}],
			"params" : param, //测试
			"permission":true,
			"checkboxSelect":true,
			"ordering" : false,
			"info" : false,
			"queryModal" : "#system-user-query",
			"rowOperation" : [{operation:"updateUser",icon:"iconfont icon-edit",title:"修改记录"},{operation:"viewUser",text:"查看"},"delete"],
			"deleteRecord" : {url : 'ADMIN/system/user/delete',id : 'id'},
			"addRecord" : function(dt){
				if(!$('#sys-user-password').hasClass('required'))$('#sys-user-password').addClass('required');//新增必须输入密码
				FM.editForm({title:'新增用户',submitClear : true,rules : form_rules,fieldOpts : field_opts,url : "ADMIN/system/user/add",editModal:"#system-user-list-edit"},function(data){
					dt.addRow(data);
				});
			},
			"viewUser" : function(dt){
				FM.editForm({title:'查看用户',fieldOpts : field_opts,formData : dt.selectedRows()[0],editModal:"#system-user-list-edit",isView:true});
			},
			"updateUser" : _update_user
		},function(otable){
			userTable = otable;
		});
	}
	function handleEdit(){
		$("#system-user-edit-form [name='company.id']").on("change",function(){
			$("#system-user-edit-form [name='company.name']").val($(this).children(":selected").text());
		})
		$('#test-detail-1111').on('click',function(){
			APP.loadInnerPage('system-user','pages/demo/datatable/main-detail/detail-table');
		})
	}
	return {
		inti_table : inti_table,
		handleEdit : handleEdit,
		init : function(param){
			this.inti_table({"company_id" : "1"});
			this.handleEdit();
		}
		
	}
});

