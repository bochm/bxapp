define('module/system/user',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
	var userTable;
	var form_rules = {
		"loginName":{
			"checkExists":{
				"url":"system/user/checkLoginName"
			},
			"messages":{
				"checkExists" : "登录名已存在"
			}
		}
	}
	var field_opts = {
		"company.id" : {param : {type : "公司"}},
		"dept.id" : {param : {type : "部门"}}
	}
	function _update_user(e,dt,node){
		if(dt.selectedCount() != 1){
			APP.info('请选择一条需要修改的用户');
			return;
		}
		$('#sys-user-password').removeClass('required');//密码不填写视为不修改密码
		FM.editForm({title:'修改用户',rules : form_rules,fieldOpts : field_opts,clearForm : false,formAction : "save",formData : dt.selectedRows()[0],
			autoClose : true,url : "system/user/save.json",editModal:"#system-user-list-edit"},function(data){
			dt.updateSelectedRow(data);
		});

		//修改时密码显示为空
		$('#sys-user-password').attr('type','text');
		$('#sys-user-password').val('');
		$('#sys-user-password').attr('type','password');
	}
	function inti_table(param){
		$('table.datatable').initTable({
			"title" : "用户表",
			"params" : param, //测试
			"scrollY": "350px",
			"permission":true,
			"queryModal" : "#system-user-query",
			"deleteRecord" : {url : 'system/user/delete',id : 'id'},
			"addRecord" : function(dt){
				if(!$('#sys-user-password').hasClass('required'))$('#sys-user-password').addClass('required');//新增必须输入密码
				FM.editForm({title:'新增用户',rules : form_rules,fieldOpts : field_opts,url : "system/user/add.json",editModal:"#system-user-list-edit"},function(data){
					dt.addRow(data);
				});
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

