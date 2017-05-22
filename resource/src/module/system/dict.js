define('module/system/dict',['app/common','app/api','app/datatables','app/form'],function(APP,API,DT,FORM) {

	function inti_table(param){
		$('table#table-system-dict-list').initTable({
			"scrollY": "400px",
			"autoWidth": true,
			"order": [2,'asc'],
			"queryModal" : {id : "#system-dict-query",url:"pages/system/dict/dict-query"},
			"deleteRecord" : {"url" : 'system/dict/delete',"id" : 'id'},
			"addEditForm" : {
				"title":"字典维护",
				"editModal":"#system-dict-list-edit",
				"url" : "system/dict",
				"rules":{
					//joinField可以为数组或单值 为jquery选择器
					"name":{"checkExists":{stmid:'cn.bx.system.mapper.DictMapper.checkTypes',joinField:["#system-dict-edit-form-type"]},"messages":{"checkExists" : "已存在该名称"}},
					"value":{"checkExists":{stmid:'cn.bx.system.mapper.DictMapper.checkTypes',joinField:"#system-dict-edit-form-type"},"messages":{"checkExists" : "已存在该值"}}
				}
			}
		},function(dt){
			$("#system-dict-edit-form [name='type']").on('change',function(){
				$("#system-dict-edit-form [name='typeDesc']").val($("#system-dict-edit-form [name='type'] :selected").text());
			})
			
		});
	}
	
	return {
		inti_table : inti_table,
		init : function(param){
			this.inti_table(param);
		}
		
	}
});

