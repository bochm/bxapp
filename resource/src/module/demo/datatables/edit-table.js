define('module/demo/datatables/edit-table',['app/common','app/api','app/datatables','app/form'],function(APP,API,DT,FORM) {
    var dynamic_columns = [
        {"deptId" : 101,"deptName" : "区县1"},
        {"deptId" : 102,"deptName" : "区县2"},
        {"deptId" : 103,"deptName" : "区县3"},
        {"deptId" : 104,"deptName" : "区县4"},
        {"deptId" : 105,"deptName" : "区县5"},
        {"deptId" : 106,"deptName" : "区县6"}
    ];
    var data = [
        {"id" : 1,"productId" : 10001,"productName" : "规格1","101-value" : 1000,"102-value" : 3445,"103-value" : 454,
            "104-value" : 334,"105-value" : 556,"106-value" : 1234},
        {"id" : 7,"productId" : 10002,"productName" : "规格2","101-value" : 445,"102-value" : 4453,"103-value" : 221,
            "104-value" : 2213,"105-value" : 54,"106-value" : 334}
    ];

    var columns = [
        { "data": "id","visible" : false},
        { "data": "productId","visible" : false},
        { "data": "productName","title":"规格","width": "30%"}
    ];
    for(var i=0;i<dynamic_columns.length;i++){
        columns.push({"data":dynamic_columns[i]["deptId"]+"-value","title":dynamic_columns[i]["deptName"]});
    }
    columns.push({ "title":"编辑","width": "8%","render" : function(data){return "<a><i class='fa fa-pencil-square-o'></i></a>";},"orderable":false});
    function inti_table(param){
        $('table#table-demo-datatables-edit-table').initTable({
            "columns": columns,data:data
        },function(otable){
        });
    }


    return {
        inti_table : inti_table,
        init : function(param){
            this.inti_table(param);
            var s_data = [{id: "someId1", name: "Display name 1"},
                {id: "someId2", name: "Display name 2"}];
            for(var i=3;i<20000;i++){
                s_data.push({id: "someId"+i, name: "Display name "+i});
            }
            $("input[name='testTypeAhead']").typeaHead({source: s_data});
        }
    }
});

