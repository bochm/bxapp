define('module/system/menu',['app/common','app/api','app/treetable','app/form'],function(APP,API,DT,FORM) {
	
	var columns = [
	    { "data": "id","visible" : false},
	    { "data": "parentId","visible" : false},
	    { "data": "name","title":"菜单名称","width": "30%"},
	    { "data": "icon","title":"图标","width": "7%"},
	    { "data": "target","title":"链接","width": "30%"},
	    { "data": "permission","title":"权限"},
	    { "data": "status","title":"状态","width": "8%","render" : function(data){return API.getDictName("on_off",data)}}
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
		$('table#table-system-menu-list').treetable({
			"tid":"id","tpid":"parentId",
			"expandable": true,"expandBtn" : true,
			"columns": columns,"columnDefs": columnDefs,
			"buttons" : ['addRecord','editRecord','deleteRecord'],
			"addEditModal" : {"url" : "pages/system/menu/menu-edit","id":"#system-menu-edit","title":"菜单维护"},
			"deleteRecord" : function(dt,node,e){
				APP.confirm('','是否删除选择的菜单及包含的所有子菜单?',function(){
					API.ajax("ADMIN/system/menu/delete",dt.selectedColumnData("id"),null,function(ret,status){
						if(API.isError(ret)){
							APP.error(API.respMsg(ret));
						}else{
							dt.deleteSelectedRow();
							APP.success(API.respMsg(ret));
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
	
	function handleEdit(params){
		var menuTable = params.table;
		$("#system-menu-edit-form input[name='type']").on("switch:change",function(e,state){
			if(!state) {
				$("#system-menu-edit-form input[name='permission']").removeClass('required');
				$("#system-menu-edit-form select[name='icon']").addClass('required selectOpt');
			}else{
				$("#system-menu-edit-form input[name='permission']").addClass('required');
				$("#system-menu-edit-form select[name='icon']").removeClass('required selectOpt');
			}
		})
		var act = params.act;
		var _formInitOpt = {
				 validate : {},submitClear : true,url:"ADMIN/system/menu/"+act,
				 fieldOpts : {
					 "icon" : {"templateResult" : sys_menuedit_formatResult, "templateSelection":sys_menuedit_formatResult},
					 "parentMenuName" : {"view" : {"selectedMulti": false},"queryTools" : true}
				 },
				 onSuccess : function(ret){
					 $.fn.zTree.getZTreeObj('system_menu_forms_parentTree').reAsyncChildNodes(null, "refresh");
					 menuTable.addRow(ret);
				 }
		};
		 
		if(act == 'edit'){
			_formInitOpt.formData = menuTable.selectedRows()[0];
			_formInitOpt.submitClear = false;
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

