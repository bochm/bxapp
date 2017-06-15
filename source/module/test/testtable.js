define('module/test/testtable',['app/common','app/datatables','app/form','app/tree'],function(APP,DT,FM) {
    function inti_table(param){
        $('table#table-system-test-list').initTable({
            "title" : "用户1111表",
            "testmmmm" : function(e,dt){
                console.log(dt.rows('.selected').data());
                console.log($("[name='test-edit']").summernote('code'));
            }
        });
    }
    return {
        init : function(param){
            inti_table(param);
            $('#tree-system-test-list').tree({"stmID":'system-test-tree',callback:{
                onClick : function(event, treeId, treeNode){
                    alert(treeNode.tId + ", " + treeNode.name);
                }
            }});
            $("[name='test-edit']").summerNote();
        }

    }
});

