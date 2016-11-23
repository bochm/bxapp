define('module/system/menu',['app/common','app/treetable','app/form'],function(APP,DT,FORM) {
	
	var columns = [
	    { "data": "id","visible" : false},
	    { "data": "parentId","visible" : false},
	    { "data": "name","title":"菜单名称"},
	    { "data": "icon","title":"图标"},
	    { "data": "target","title":"链接"},
	    { "data": "status","title":"状态","dictType" : "on_off"},
	    { "data": "sort","title":"排序号"}
	];
	var columnDefs = [	
	    {
	    	"targets": 2,
	    	"render": function ( data, type, row ) {
	       			if(row.type == '1'){ //0:模块 1:功能
	       				return "<i class='fa fa-pencil-square-o'></i> "+data;
	       			}else{
	       				if(row.target == '#') return "<i class='fa fa-cog'></i> "+data;
	       				else return "<i class='fa fa-link'></i> "+data;
	       			}
	       	}
	    },
	    {
	    	"targets": 3,
	    	"render": function ( data, type, row ) {
	       	    	return "<i class='"+data+"'></i>";
	       	 }
	    }
	];
	function inti_table(param){
		$('table.datatable').treetable({
			"tid":"id","tpid":"parentId",
			"expandable": true,"expandBtn" : true,
			"columns": columns,"columnDefs": columnDefs,
			"buttons" : ['addRecord','saveRecord','deleteRecord'],
			"addEditModal" : {"url" : "pages/system/menu/menu-edit.html","id":"system-menu-edit"},
			"deleteRecord" : function(dt,node,e){
				APP.confirm('','是否删除选择的菜单及包含的所有子菜单?',function(){
					APP.postJson("system/menu/delete",dt.selectedColumn("id"),null,function(ret,status){
						if(ret.OK){
							dt.deleteSelectedRow();
							APP.success(ret[APP.MSG]);
						}else{
							APP.error(ret[APP.MSG]);
						}
					});
				})
			}
		},function(otable){
			menuTable = otable;
		});
	}
	
	function sys_menuedit_formatResult(data){
		if (!data.id && !data.icons) { return data.text; }
		var icons = data.icons ? data.icons : data.id;
		return $("<span align='left'><i class='"+icons+"'></i>&nbsp;"+data.text+"</span>");
	}
	
	function handleEdit(){
		var menuTable = DT.getTable("#table-system-menu-list");
		$("input[name='type']").on("switch:change",function(e,state){
			if(state) $("input[name='permission']").removeClass('required');
			else $("input[name='permission']").addClass('required');
		})
		var act = APP.getParameterByName("act");
		var _formInitOpt = {
				 formAction : act,validate : {},clearForm : true,url:"system/menu/"+act,
				 fieldOpts : {
					 "icon" : {"templateResult" : sys_menuedit_formatResult, "templateSelection":sys_menuedit_formatResult},
					 "parentMenuName" : {"view" : {"selectedMulti": false}}
				 },
				 onSuccess : function(ret){
					 $.fn.zTree.getZTreeObj('system_menu_forms_parentTree').reAsyncChildNodes(null, "refresh");
					 menuTable.addRow(ret);
				 }
		};
		 
		if(act == 'save'){
			_formInitOpt.formData = menuTable.selectedRows()[0];
			_formInitOpt.clearForm = false;
			_formInitOpt.fieldOpts.parentMenuName.param = {"parentMenu" : _formInitOpt.formData.id};
			_formInitOpt.onSuccess = function(ret){
				 $.fn.zTree.getZTreeObj('system_menu_forms_parentTree').reAsyncChildNodes(null, "refresh");
				 menuTable.updateSelectedRow(ret);
			 }
		}
		$('#system-menu-edit-form').initForm(_formInitOpt);
	}
	return {
		inti_table : inti_table,
		handleEdit : handleEdit,
		init : function(param){
			this.inti_table(param);
		}
	}
});

