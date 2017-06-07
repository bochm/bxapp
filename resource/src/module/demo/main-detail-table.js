define('module/demo/main-detail-table',['app/common','app/datatables','app/form'],function(APP,DT,FM) {

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
					APP.loadInnerPage(APP.getPageContainer('#table-demo-main-detail-m'),'pages/demo/datatable/main-detail/detail-table',
						{classId:-1});
				}
			}
		},
		"init" : function(param){
			this.table.options.params = param || {};
			$(this.table.id).initTable(this.table.options,function(otable){
				
			});

		}
	};

	var detail = {
		"table" : {
			"id" : "#table-demo-main-detail-student",
			"options" : {
				"title" : "明细测试表-细表",
				"dataUrl":"ADMIN/demo/datatable/maindetail/student",
				"columns": [
					{"data": "id",  "visible": false},
					{"data": "classId", "visible": false},
					{"data": "no", "title": "学号"},
					{"data": "name", "title": "姓名"},
					{"data": "age", "title": "年龄"}
				],
				"ordering": false,
				"paging" : true,
				"info" : true,
				"rowOperation" : ["edit","delete"],
				"addEditForm" : {
					"title":"明细测试表-细表",
					"editModal":"#demo-main-detail-student-modal",
					"id" : "#demo-main-detail-student-form"
				}
			}
		},
		"form" : {
			"id" : "#demo-main-detail-class-form",
			"url" : "ADMIN/demo/datatable/maindetail/classes/add",
			"submitJson" : true
		},
		"init" : function(param){
			this.table.options.params = param || {};
			this.form.formData = param;
			this.form.autoClose = true;
			this.form.submitClear = true;
			$(this.form.id).initForm(this.form,function(ret){
				DT.getTable(main.table.id).addRow(ret);
			});

			$(this.table.id).initTable(this.table.options,function(otable){
				
			});

		}
	};
	return {
		init : function(param){
			main.init({});
		},
		initDetail : function(param){
			console.log(param);
			detail.init(param);
		}
		
	}
});

