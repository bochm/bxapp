define('module/demo/main-detail-table',['app/common','app/datatables'],function(APP,DT) {

	var main = {
		"table" : {
			"id" : "#table-demo-main-detail-m",
			"options" : {
				"title" : "明细测试表",
				"columns": [
					{"data": "id", "title": "id", "visible": false},
					{"data": "students", "title": "学生","visible": false},
					{"data": "className", "title": "班级名称"},
					{"data": "studentCount", "title": "学生数量"},
					{"data": "classMaster", "title": "班主任"}
				],
				"ordering": false,
				"paging" : true,
				"info" : true,
				"addRecord" : function(e,dt){
					APP.loadInnerPage(APP.getPageContainer('#table-demo-main-detail-m'),'pages/demo/datatable/main-detail/detail-table');
				}
			}
		},
		"init" : function(param){
			this.table.options.params = param || {};
			var _table = this.table;
			$(this.table.id).initTable(this.table.options,function(otable){
				_table.obj = otable;
			});

		}
	};

	function handleEdit(){
		
	}
	return {
		init : function(param){
			main.init({});
		},
		initDetail : function(param){
			
		}
		
	}
});

