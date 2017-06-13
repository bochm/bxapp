define('module/system/org',['app/common','app/api','app/treetable','app/form'],function(APP,API,DT,FORM) {
	
	var columns = [
	    { "data": "name","title":"组织名称"},
	    { "data": "type","title":"类型","render" : function(data){return API.getDictName("sys_org_type",data)}},
	    { "data": "addr","title":"地址"},
	    { "data": "master.name","title":"负责人"},
	    { "data": "status","title":"状态","render" : function(data){return API.getDictName("on_off",data)}}
	];
	function delete_record(dt,node,e){
		APP.confirm('','是否删除选择的组织及包含的所有子组织?',function(){
			API.ajax("ADMIN/system/org/delete",dt.selectedColumnData("id"),null,function(ret,status){
				if(!API.isError(ret)){
					dt.deleteSelectedRow();
					APP.success(API.respMsg(ret));
				}else{
					APP.error(API.respMsg(ret));
				}
			});
		})
	}
	function inti_table(param){
		$('table#table-system-org-list').treetable({
			"tid":"id","tpid":"parentId","expandable": true,"expandBtn" : true,"columns": columns,
			"addEditModal" : {title:"组织机构维护","url" : "pages/system/org/org-edit","id":"#system-org-edit"},
			"deleteRecord" : delete_record
		});
	}
	
	function handleEdit(params){
		var act = params.act;
		$("#system-org-edit-form [name='master.id']").on("change",function(){
			$("#system-org-edit-form [name='master.name']").val($(this).children(":selected").text());
		})
		
		var table = params.table;
		var _formInitOpt = {
				 validate : {},url:"ADMIN/system/org/"+act,
				 fieldOpts : {
					 "parentOrgName" : {"view" : {"selectedMulti": false}}
				 },
				 onSuccess : function(ret){
					 $.fn.zTree.getZTreeObj('system_org_parentTree').reAsyncChildNodes(null, "refresh");
					 table.addRow(ret);
				 }
		};
		 
		if(act == 'edit'){
			_formInitOpt.formData = table.selectedRows()[0];
			_formInitOpt.submitClear = false;
			_formInitOpt.fieldOpts.parentOrgName.param = {"parentOrg" : _formInitOpt.formData.id};
			_formInitOpt.onSuccess = function(ret){
				 $.fn.zTree.getZTreeObj('system_org_parentTree').reAsyncChildNodes(null, "refresh");
				 table.updateSelectedRow(ret);
			 }
		}
		$('#system-org-edit-form').initForm(_formInitOpt);
	}
	return {
		inti_table : inti_table,
		handleEdit : handleEdit,
		init : function(param){
			this.inti_table(param);
		}
	}
});

