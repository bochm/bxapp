define('module/weixin/research/scenario',['app/common','app/datatables','app/form','app/tree'],function(APP,DT,FM) {
    var _companyId = API.localUser().company_id;
    var scenarioPortal = "#weixin-research-scenario-portlet";
    var scenarioTree = "#tree-weixin-research-scenario";
    var scenarioForm = "#weixin-research-scenario-form";
    var scenarioGroupForm = "#weixin-research-scenario-group-form";
    var scenarioIndexPortal = "#weixin-research-scenario-index-portlet";
    var scenarioIndexTable = "#table-weixin-research-scenario-index";
    var scenarioIndexAddModal= "#weixin-research-scenario-index-add-modal";

    function _check_tree_select(treeNode,msg,type){
        if(APP.isEmpty(treeNode) || treeNode.type != type){
            APP.notice('请选择',msg,'warning');
            return false;
        }
        return true;
    }
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
            callback:{},
            onNodeCreated : function(event, treeId, treeNode) {
                $('#'+ treeNode.tId +'_a').css('color',treeNode.status == '0' ? 'red' : 'blue');
            }
        },
        form:{
            "id" : scenarioForm,
            "submitJson" : true,
            "editModal" : "#weixin-research-scenario-modal",
            "autoClose" : true,
            "fieldOpts": {
                "objectId":{
                    "dataUrl" : "WEIXIN/researchindex/selectObject",
                    "allowClear" : false
                }
            }
        },
        groupForm : {
            "id" : scenarioGroupForm,
            "submitJson" : true,
            "editModal" : "#weixin-research-scenario-group-modal",
            "autoClose" : true
        },
        init : function(param){
            var _scenarioPortal = $(scenarioPortal);
            var _form = $(scenarioForm);
            var _groupForm = $(scenarioGroupForm);

            scenario.options.callback.onClick = function(event, treeId, treeNode){
                if(treeNode.type == 'scenario') {
                    scenario_index.table.obj.query({scenarioId: treeNode.id});
                }else if(treeNode.type == 'group') {
                    scenario_index.table.obj.query({scenarioId: treeNode.pId, groupId: treeNode.id});
                }else if(treeNode.type == 'object'){
                    scenario_index.table.obj.query({scenarioId: '-1'});
                }
            }
            scenario.form.initComplete = function(opts){
                _form.field('companyId').val(_companyId);
            }
            this.treeObj = $(scenarioTree).tree(this.options);
            _scenarioPortal.on('click',"[data-role='addScenario']",function(){
                scenario.form.url = "WEIXIN/researchscenario/insert";
                scenario.form.title = "新增方案";
                FM.editForm(scenario.form,function(ret){
                    scenario.treeObj.reAsyncChildNodes(null, "refresh");
                });
            });
            _scenarioPortal.on('click',"[data-role='editScenario']",function(){
                var selectedScenario = scenario.treeObj.getSelectedNodes()[0];
                if(!_check_tree_select(selectedScenario,'请选择树形中需要修改的方案','scenario')) return;
                scenario.form.url = "WEIXIN/researchscenario/update";
                scenario.form.title = "修改方案";
                scenario.form.formData = {id:selectedScenario.id,scenarioDesc:selectedScenario.name,objectId:selectedScenario.pid,
                    integral:selectedScenario.integral,status : selectedScenario.status};
                FM.editForm(scenario.form,function(ret){
                    scenario.treeObj.reAsyncChildNodes(null, "refresh");
                    scenario.treeObj.selectNode(scenario.treeObj.getNodeByParam("id", selectedScenario.id, null));

                });
            });
            _scenarioPortal.on('click',"[data-role='deleteScenario']",function(){
                var selectedScenario = scenario.treeObj.getSelectedNodes()[0];
                if(!_check_tree_select(selectedScenario,'请选择树形中需要删除的方案','scenario')) return;
                APP.confirm('','是否删除所选方案（同时会删除方案的分类和指标）?',function(){
                    API.ajax("WEIXIN/researchscenario/delete",{"id":selectedScenario.id},false,function(ret,status){
                        if(API.isError(ret)){
                            APP.error(ret);
                        }else{
                            APP.success('方案已删除',null,true);
                            scenario.treeObj.removeNode(selectedScenario);
                        }
                    },function(err){
                        APP.error(err);
                    });
                })
            });
            //方案分组信息
            scenario.groupForm.initComplete = function(opts){
                var selectedScenario = scenario.treeObj.getSelectedNodes()[0];
                _groupForm.field('companyId').val(_companyId);
                if(selectedScenario.type == 'scenario'){
                    _groupForm.field('scenarioId').val(selectedScenario.id);
                    _groupForm.find("[data-for='scenarioName']").html(selectedScenario.name);
                }else if(selectedScenario.type == 'group'){
                    _groupForm.field('scenarioId').val(selectedScenario.getParentNode().id);
                    _groupForm.find("[data-for='scenarioName']").html(selectedScenario.getParentNode().name);
                }

            }
            _scenarioPortal.on('click',"[data-role='addScenarioGroup']",function(){
                var selectedScenario = scenario.treeObj.getSelectedNodes()[0];
                if(!_check_tree_select(selectedScenario,'请选择树形中需要新增分组的方案','scenario')) return;
                scenario.groupForm.url = "WEIXIN/researchscenario/insertGroup";
                scenario.groupForm.title = "新增分组";
                FM.editForm(scenario.groupForm,function(ret){
                    scenario.treeObj.reAsyncChildNodes(null, "refresh");
                    scenario.treeObj.selectNode(scenario.treeObj.getNodeByParam("id", selectedScenario.id, null));
                    scenario.treeObj.expandNode(scenario.treeObj.getNodeByParam("id", selectedScenario.id, null), true, true, true);
                });
            });
            _scenarioPortal.on('click',"[data-role='editScenarioGroup']",function(){
                var selectedScenarioGroup = scenario.treeObj.getSelectedNodes()[0];
                if(!_check_tree_select(selectedScenarioGroup,'请选择树形中需要修改的分组','group')) return;
                scenario.groupForm.url = "WEIXIN/researchscenario/updateGroup";
                scenario.groupForm.title = "修改分组";
                scenario.groupForm.formData = {id:selectedScenarioGroup.id,groupDesc:selectedScenarioGroup.name,
                    seqNum:selectedScenarioGroup.seqnum, status : selectedScenarioGroup.status};
                FM.editForm(scenario.groupForm,function(ret){
                    scenario.treeObj.reAsyncChildNodes(null, "refresh");
                    scenario.treeObj.selectNode(scenario.treeObj.getNodeByParam("id", selectedScenarioGroup.id, null));
                    scenario.treeObj.expandNode(scenario.treeObj.getNodeByParam("id", selectedScenarioGroup.pid, null), true, true, true);
                });
            });
            _scenarioPortal.on('click',"[data-role='deleteScenarioGroup']",function(){
                var selectedScenarioGroup = scenario.treeObj.getSelectedNodes()[0];
                if(!_check_tree_select(selectedScenarioGroup,'请选择树形中需要删除的分组','group')) return;
                APP.confirm('','是否删除所选分组（同时会删除分组中的指标）?',function(){
                    API.ajax("WEIXIN/researchscenario/deleteGroup",{"id":selectedScenarioGroup.id},false,function(ret,status){
                        if(API.isError(ret)){
                            APP.error(ret);
                        }else{
                            APP.success('分组已删除',null,true);
                            scenario.treeObj.removeNode(selectedScenarioGroup);
                        }
                    },function(err){
                        APP.error(err);
                    });
                })
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
                    {"data": "seqNum", "title": "序号","width":"5%" ,"orderable" : false},
                    {"data": "indexDesc", "title": "题目名称","orderable" : false},
                    {"data": "showMode", "title": "类型","render" : function(data){return API.getDictName("researchindex_showmode",data);},"orderable" : false},
                    {"data": "id", "title": "id", "visible": false},
                    {"data" : "indexId", "visible": false },
                    {"data" : "companyId", "visible": false },
                    {"data" : "scenarioId", "visible": false },
                    {"data" : "groupId", "visible": false }
                ],
                "order": [0,'asc'],
                "portlet": scenarioIndexPortal,
                "deleteRecord": {url: 'WEIXIN/researchscenario/deleteBatch', row: true, id: "id"},
                "addRecord" : function(dt){
                    var selectedScenarioGroup = scenario.treeObj.getSelectedNodes()[0];
                    if(!_check_tree_select(selectedScenarioGroup,'请选择树形中需要新增指标的分组','group')) return;
                    var modalOpts = {
                        url:"pages/weixin/research/scenario-index-add",clear:true,
                        params : {"scenarioId" : selectedScenarioGroup.getParentNode().id,
                            "groupId" : selectedScenarioGroup.id,"objectId":selectedScenarioGroup.getParentNode().getParentNode().id}
                    }
                    APP.modal(scenarioIndexAddModal,modalOpts,function(){
                        $(scenarioIndexAddModal+" span[data-for='scenario']").html(selectedScenarioGroup.getParentNode().name);
                        $(scenarioIndexAddModal+" span[data-for='group']").html(selectedScenarioGroup.name);
                    });
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

    var scenario_index_add = {
        "table" : {
            "id" : "#table-weixin-research-scenario-indexes",
            "options" : {
                "title": "调查指标表",
                "dataUrl" : "WEIXIN/researchindex/selectListForScenario",
                "columns": [
                    {"data": "id", "title": "id", "visible": false},
                    {"data": "indexDesc", "title": "题目名称"},
                    {"data": "showMode", "title": "分组类型","render" : function(data){return API.getDictName("researchindex_showmode",data);}}
                ],
                "ordering": false,
                "select": {style: 'multi'}
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            $("#table-weixin-research-scenario-indexes").initTable(this.table.options,function(otable){
                scenario_index_add.table.obj = otable;
            });
            $(scenarioIndexAddModal).on('click',"button[data-act='choose']",function(){
                var selectedData = scenario_index_add.table.obj.selectedRows();
                if(selectedData.length == 0){
                    APP.alertS('',"请选择需要新增的指标!","info",scenarioIndexAddModal);
                    return;
                }
                var addData = new Array();
                var maxSeq = 1;
                var scenario_index_seq = DT.getTable(scenarioIndexTable).columnData('seqNum');
                if(scenario_index_seq.length > 0) maxSeq = scenario_index_seq[scenario_index_seq.length-1]*1 + 1;
                for(var i=0;i<selectedData.length;i++){
                    addData.push({"id":'',"seqNum":maxSeq++,"indexId":selectedData[i].id,"indexDesc":selectedData[i].indexDesc,
                        "showMode":selectedData[i].showMode,"companyId":_companyId,"scenarioId":param.scenarioId,"groupId":param.groupId});
                }
                API.ajax("WEIXIN/researchscenario/insertIndexes",addData,false,function(ret,status){
                    if(API.isError(ret)){
                        APP.error(ret,scenarioIndexAddModal);
                    }else{
                        APP.success(ret,scenarioIndexAddModal,true);
                        DT.getTable(scenarioIndexTable).addRows(addData);
                    }
                });
            })
        }
    };
    return {
        init : function(param){
            scenario.init(param);
            scenario_index.init();
        },
        initIndexAdd : function(param){
            scenario_index_add.init(param);
            $(scenarioIndexAddModal).css('top','18%');

        }
    }
});

