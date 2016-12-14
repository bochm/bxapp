define('module/demo/main-detail-table',['app/common','app/datatables'],function(APP,DT) {
	function inti_table(param){
		$('table#table-demo-main-detail-m').initTable({
			"title" : "明细测试表",
			"params" : param,
			"scrollY": "350px",
			"detailPage" : "pages/demo/datatable/main-detail/detail-table"
		});
	}
	function handleEdit(){
		
	}
	return {
		inti_table : inti_table,
		handleEdit : handleEdit,
		init : function(param){
			this.inti_table({"company_id" : "1"});
			this.handleEdit();
		},
		initDetail : function(param){
			console.log(param.data());
		}
		
	}
});

