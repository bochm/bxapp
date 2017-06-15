define('module/demo/main-detail-table',['app/common','app/datatables','app/form'],function(APP,DT,FM) {

	var main = {
		"table" : {
			"id" : "#table-demo-main-detail-m",
			"options" : {
				"title" : "明细测试表",
				"dataUrl" : "ADMIN/demo/datatable/maindetail/classes",
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
				"deleteRecord" : {url : 'ADMIN/demo/datatable/maindetail/classes/delete',id : 'id'},
				"addRecord" : function(dt){
					APP.loadInnerPage(APP.getPageContainer('#table-demo-main-detail-m'),'pages/demo/datatable/main-detail/detail-table',
						{act:'add'});
				},
				"editRecord" : function(dt){
					APP.loadInnerPage(APP.getPageContainer('#table-demo-main-detail-m'),'pages/demo/datatable/main-detail/detail-table',
						{act:'update',formData:dt.selectedRowsData()[0]});
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
			"submitJson" : true,
			"autoClose" : true
		},
		"init" : function(param){
			if(param.act == 'add'){
				this.table.options.params = {id:-1};//新增默认查询参数
				this.form.formData = null;
				this.form.submitClear = true;
				this.form.url = "ADMIN/demo/datatable/maindetail/classes/add";
			}else if(param.act == 'update'){
				this.table.options.params = {classId : param.formData.id};
				this.form.formData = param.formData;
				this.form.submitClear = false;
				this.form.url = "ADMIN/demo/datatable/maindetail/classes/edit";
			}
			var _form = $(this.form.id);
			_form.initForm(this.form,function(ret){
				if(param.act == 'add')
					DT.getTable(main.table.id).addRow(ret);
				if(param.act == 'update')
					DT.getTable(main.table.id).updateSelectedRow(ret);
			});

			$(this.table.id).initTable(this.table.options,function(otable){
				detail.table.obj = otable;
			});
			$(this.table.id).on( 'draw.dt', function () {
				if(detail.table.obj !== undefined){
					_form.field("studentCount").val(detail.table.obj.dataCount());
				}
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

