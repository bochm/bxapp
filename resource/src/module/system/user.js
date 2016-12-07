define('module/system/user',['app/common','app/datatables','app/form'],function(APP,DT,FORM) {
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
		$('#system-user-edit-form').initForm({
			url : "system/user/save.json",clearForm : false,formAction : "save",autoClear : true,type : 'post',rules : form_rules,
			formData : dt.selectedRows()[0],fieldOpts : field_opts
		},function(data){
			dt.updateSelectedRow(data);
		});
		//修改时密码显示为空
		$('#sys-user-password').attr('type','text');
		$('#sys-user-password').val('');
		$('#sys-user-password').attr('type','password');
		$('#system-user-list-edit').modal('show');
	}
	function inti_table(param){
		$('table.datatable').initTable({
			"title" : "用户表",
			"params" : param, //测试
			"scrollY": "350px",
			"permission":true,
			"deleteRecord" : {url : 'system/user/delete',id : 'id'},
			"addRecord" : function(dt){
				if(!$('#sys-user-password').hasClass('required'))$('#sys-user-password').addClass('required');//新增必须输入密码
				$('#system-user-edit-form').initForm({
					url : "system/user/add.json",clearForm : true,formAction : "add",autoClear : true,type : 'post',rules : form_rules,
					fieldOpts : field_opts
				},function(data){
					dt.addRow(data);
				});
				$('#system-user-list-edit').modal('show');
			},
			"updateUser" : _update_user,
			"queryUser" : function(e,dt,node){
				dt.query({"company_id":"d0d128c38b9a400981b6a3ac0e1f805c"});
			}
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
			this.inti_table(param);
			this.handleEdit();
		}
		
	}
});

