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
			API.postJson("system/org/delete",dt.selectedColumn("id"),null,function(ret,status){
				if(ret.OK){
					dt.deleteSelectedRow();
					APP.success(ret[APP.MSG]);
				}else{
					APP.error(ret[APP.MSG]);
				}
			});
		})
	}
	function inti_table(param){
		$('table.datatable').treetable({
			"tid":"id","tpid":"parentId","expandable": true,"expandBtn" : true,"columns": columns,
			"scrollY": "190px",
			"buttons" : ['addRecord','saveRecord','deleteRecord'],
			"addEditModal" : {"url" : "pages/system/org/org-edit","id":"system-org-edit"},
			"deleteRecord" : delete_record
		});
	}
	
	function handleEdit(){
		var act = APP.getParameterByName("act");
		$("#system-org-edit-form [name='master.id']").on("change",function(){
			$("#system-org-edit-form [name='master.name']").val($(this).children(":selected").text());
		})
		
		var table = DT.getTable('#table-system-org-list');
		var _formInitOpt = {
				 formAction : act,validate : {},clearForm : true,url:"system/org/"+act,
				 fieldOpts : {
					 "parentOrgName" : {"view" : {"selectedMulti": false}}
				 },
				 onSuccess : function(ret){
					 $.fn.zTree.getZTreeObj('system_org_parentTree').reAsyncChildNodes(null, "refresh");
					 table.addRow(ret);
				 }
		};
		 
		if(act == 'save'){
			_formInitOpt.formData = table.selectedRows()[0];
			_formInitOpt.clearForm = false;
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

