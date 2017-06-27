define('module/weixin/research/scenario',['app/common','app/datatables','app/form','app/tree'],function(APP,DT,FM) {
    var scenarioPortal = "#weixin-research-scenario-portlet";
    var scenarioTree = "#tree-weixin-research-scenario";
    var scenarioForm = "#weixin-research-scenario-form";
    var scenarioIndexPortal = "#weixin-research-scenario-index-portlet";
    var scenarioIndexTable = "#table-weixin-research-scenario-index";
    var scenario = {
        id : scenarioTree,
        options:{
            dataUrl:'WEIXIN/researchscenario/selectTree',
            queryTools : true,
            data : {
                simpleData: {
                    idKey: 'id',
                    pIdKey: 'pid'
                }
            },
            view: {
                selectedMulti: false
            },
            callback:{}
        },
        form:{
            "id" : scenarioForm,
            "submitJson" : true,
            "editModal" : "#weixin-research-scenario-modal",
            "fieldOpts": {
                "objectId":{
                    "dataUrl" : "WEIXIN/researchindex/selectObject",
                    "allowClear" : false
                }
            }
        },
        init : function(param){
            var _scenarioPortal = $(scenarioPortal);
            scenario.options.callback.onClick = function(event, treeId, treeNode){
                if(treeNode.type == 'scenario') {
                    scenario_index.table.obj.query({scenarioId: treeNode.id});
                }else if(treeNode.type == 'group') {
                    scenario_index.table.obj.query({scenarioId: treeNode.pId, groupId: treeNode.id});
                }else if(treeNode.type == 'object'){
                    scenario_index.table.obj.query({scenarioId: '-1'});
                }
            }
            this.treeObj = $(scenarioTree).tree(this.options);
            _scenarioPortal.on('click',"[data-role='addScenario']",function(){
                scenario.form.url = "WEIXIN/researchscenario/insert";
                scenario.form.title = "新增方案";
                FM.editForm(scenario.form,function(ret){
                    
                });
            });
        }
    };
    var scenario_index = {
        "table" : {
            "id" : scenarioIndexTable,
            "options" : {
                "title": "调查指标表",
                "dataUrl" : "WEIXIN/researchscenario/selectIndexes",
                "columns": [
                    {"data": "indexDesc", "title": "题目名称"},
                    {"data": "showMode", "title": "分组类型","render" : function(data){return API.getDictName("researchindex_showmode",data);}},
                    {"data": "status", "title": "是否启用","render": function (data, type, row, meta) {return API.getDictName("on_off",data);}},
                    {"data": "id", "title": "id", "visible": false}
                ],
                "ordering": false,
                "portlet": scenarioIndexPortal,
                "deleteRecord": {url: 'WEIXIN/researchscenario/deleteBatch', row: true, id: "id"},
                "addRecord" : function(dt){

                },
                "editRecord" : function(dt){

                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {scenarioId : '-1'};
            $(scenarioIndexTable).initTable(this.table.options,function(otable){
                scenario_index.table.obj = otable;
            });
        }
    };
    return {
        init : function(param){
            scenario.init(param);
            scenario_index.init();
        }
    }
});

