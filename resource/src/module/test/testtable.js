define('module/test/testtable',['app/common','app/datatables','app/form','app/tree'],function(APP,DT,FM) {
    function inti_table(param){
        $('table#table-system-test-list').initTable({
            "title" : "用户1111表",
            "testmmmm" : function(e,dt){
                console.log(dt.rows('.selected').data());
            }
        });
    }
    return {
        init : function(param){
            $("#btn-test-system-test-list").click(function(){
                alert("dddd");
            });
            inti_table(param);
            $('#tree-system-test-list').tree({"stmID":'system-test-tree',callback:{
                onClick : function(event, treeId, treeNode){
                    alert(treeNode.tId + ", " + treeNode.name);
                }
            }});

        }

    }
});

