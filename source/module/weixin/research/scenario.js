define('module/weixin/research/scenario',['app/common','app/datatables','app/form','app/tree'],function(APP,DT,FM) {
    var _companyId = API.localUser().company_id;
    var scenarioPortal = "#weixin-research-scenario-portlet";
    var scenarioTree = "#tree-weixin-research-scenario";
    var scenarioTable = "#table-weixin-research-scenario";
    var scenarioEditPortal = "#weixin-research-scenario-edit-portlet";
    var scenarioForm = "#weixin-research-scenario-form";
    var scenarioGroupForm = "#weixin-research-scenario-group-form";
    var scenarioGroupTable = "#table-weixin-research-scenario-group";
    var scenarioGroupPortal = "#weixin-research-scenario-group-portlet";
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
        table : {
            "id" : scenarioTable,
            "options" : {
                "title": "调查方案表",
                "scrollY": "380px",
                "dataUrl" : "WEIXIN/researchscenario/selectList",
                "select": {style: 'single'},
                "columns": [
                    {"data": "scenarioDesc", "title": "方案名称"},
                    {"data": "integral", "title": "积分"},
                    {"data": "status", "title": "是否启用","render": function (data, type, row, meta) {return API.getDictName("on_off",data);}}
                ],
                "portlet": scenarioEditPortal,
                "deleteRecord": {url: 'WEIXIN/researchscenario/delete', row: true, id: "id",onDeleted:function(ret,params){
                    var selectedScenario = scenario.treeObj.getNodeByParam("id", params.id, null);
                    scenario.treeObj.removeNode(selectedScenario);
                }},
                "addEditForm" : {
                    "title":"调查方案维护",
                    "id" : scenarioForm,
                    "submitJson" : true,
                    "editModal" : "#weixin-research-scenario-modal",
                    "autoClose" : true,
                    "addUrl": "WEIXIN/researchscenario/insert",
                    "editUrl": "WEIXIN/researchscenario/update",
                    "fieldOpts": {
                        "objectId":{
                            "dataUrl" : "WEIXIN/researchindex/selectObject",
                            "allowClear" : false
                        }
                    }
                }
            }
        },
        init : function(param){
            var _form = $(scenarioForm);

            scenario.options.callback.onClick = function(event, treeId, treeNode){
                if(treeNode.type == 'scenario') {
                    if(scenario_group.table.obj == undefined) {
                        scenario_group.init({scenarioId: treeNode.id});
                    }else {
                        scenario_group.table.obj.query({scenarioId: treeNode.id});
                    }
                    $('#weixin-research-scenario-edit-portlet').hide();
                    $('#weixin-research-scenario-group-portlet').show();
                    $('#weixin-research-scenario-index-portlet').hide();
                }else if(treeNode.type == 'group') {
                    if(scenario_index.table.obj == undefined) {
                        scenario_index.init({scenarioId: treeNode.pId, groupId: treeNode.id});
                    }else {
                        scenario_index.table.obj.query({scenarioId: treeNode.pId, groupId: treeNode.id});
                    }
                    $('#weixin-research-scenario-edit-portlet').hide();
                    $('#weixin-research-scenario-group-portlet').hide();
                    $('#weixin-research-scenario-index-portlet').show();

                }else if(treeNode.type == 'object'){
                    scenario.table.obj.query({objectId : treeNode.id});
                    $('#weixin-research-scenario-edit-portlet').show();
                    $('#weixin-research-scenario-group-portlet').hide();
                    $('#weixin-research-scenario-index-portlet').hide();
                }
            }
            scenario.table.options.addEditForm.initComplete = function(opts){
                _form.field('companyId').val(_companyId);
            }
            scenario.table.options.addEditForm.submitCallback = function(data){
                var selectedObject = scenario.treeObj.getSelectedNodes()[0];
                scenario.table.obj.query({objectId : selectedObject.id});
                scenario.treeObj.reAsyncChildNodes(null, "refresh");
                scenario.treeObj.selectNode(scenario.treeObj.getNodeByParam("id", selectedObject.id, null));
            };
            this.treeObj = $(scenarioTree).tree(this.options);
            var objectNodes = this.treeObj.getNodesByParam("type", "object", null);
            if(objectNodes && objectNodes.length > 0){
                this.treeObj.selectNode(objectNodes[0]);
                this.table.options.params = {objectId : objectNodes[0].id};
            }else{
                this.table.options.params = {objectId : '-1'};
            }

            $(scenarioTable).initTable(this.table.options,function(otable){
                scenario.table.obj = otable;
            });
        }
    };

    var scenario_group = {
        "table" : {
            "id" : scenarioGroupTable,
            "options" : {
                "title": "调查方案分组表",
                "scrollY": "380px",
                "dataUrl" : "WEIXIN/researchscenario/selectGroups",
                "select": {style: 'single'},
                "order": [[ 2, 'asc' ]],
                "columns": [
                    {
                        "className":      'details-control',
                        "orderable":      false,
                        "data":           null,
                        "defaultContent": ''
                    },
                    {"data": "groupDesc", "title": "分组名称"},
                    {"data": "seqNum", "title": "序号","width":"5%" },
                    {"data": "status", "title": "是否启用","render": function (data, type, row, meta) {return API.getDictName("on_off",data);}}
                ],
                "portlet": scenarioGroupPortal,
                "deleteRecord": {url: 'WEIXIN/researchscenario/deleteGroup', row: true, id: "id",onDeleted:function(ret,params){
                    var selectedGroup = scenario.treeObj.getNodeByParam("id", params.id, null);
                    scenario.treeObj.removeNode(selectedGroup);
                }},
                "addEditForm" : {
                    "title":"方案分组维护",
                    "id" : scenarioGroupForm,
                    "addUrl": "WEIXIN/researchscenario/insertGroup",
                    "editUrl": "WEIXIN/researchscenario/updateGroup",
                    "submitJson" : true,
                    "editModal" : "#weixin-research-scenario-group-modal",
                    "autoClose" : true
                }
            }
        },
        formatIndex : function ( d ) {
            var detail_table = '<table class="table table-striped table-hover" style="width:50%"><thead><tr><td>序号</td><td>指标名称</td></tr></thead><tbody>';
            var indexes = API.jsonData('WEIXIN/researchscenario/selectIndexes',{scenarioId: d.scenarioId, groupId: d.id});
            for(var i=0;i<indexes.length;i++){
                detail_table += "<tr><td>"+indexes[i].seqNum+"</td><td>"+indexes[i].indexDesc+"</td></tr>";
            }
            detail_table += '</tbody></table>';
            return detail_table;
        },
        "init" : function(param){
            this.table.options.params = param || {scenarioId : '-1'};
            var _groupForm = $(scenarioGroupForm);
            scenario_group.table.options.addEditForm.initComplete = function(opts){
                _groupForm.field('companyId').val(_companyId);
                _groupForm.field('scenarioId').val(param.scenarioId);
                _groupForm.find("[data-for='scenarioName']").html(scenario.treeObj.getNodeByParam("id",param.scenarioId,null).name);
            }
            scenario_group.table.options.addEditForm.submitCallback = function(data){
                scenario_group.table.obj.query(param);
                scenario.treeObj.reAsyncChildNodes(null, "refresh");
                scenario.treeObj.selectNode(scenario.treeObj.getNodeByParam("id", param.scenarioId, null));
                scenario.treeObj.expandNode(scenario.treeObj.getNodeByParam("id", param.scenarioId, null), true, true, true);
            };
            $(scenarioGroupTable).initTable(this.table.options,function(otable){
                scenario_group.table.obj = otable;
                $(scenarioGroupTable).on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = otable.row( tr );

                    if ( row.child.isShown() ) {
                        row.child.hide();
                        tr.removeClass('shown');
                    }
                    else {
                        row.child( scenario_group.formatIndex(row.data()) ).show();
                        tr.addClass('shown');
                    }
                } );
            });

        }
    };


    var scenario_index = {
        "table" : {
            "id" : scenarioIndexTable,
            "options" : {
                "title": "调查指标表",
                "scrollY": "380px",
                "scrollX": true,
                "dataUrl" : "WEIXIN/researchscenario/selectIndexes",
                "columns": [
                    {"data": "seqNum", "title": "序号","width":"5%" },
                    {"data": "indexDesc", "title": "题目名称"},
                    {"data": "showMode", "title": "类型","render" : function(data){return API.getDictName("researchindex_showmode",data);}}
                ],
                "rowReorder" : {dataSrc: 'seqNum'},
                "columnDefs": [
                    { orderable: true, className: 'reorder', targets: 0 },
                    { orderable: false, targets: '_all' }
                ],
                "portlet": scenarioIndexPortal,
                "deleteRecord": {url: 'WEIXIN/researchscenario/deleteIndexes', row: true, id: ["id","groupId"],onDeleted:function(ret){
                    DT.getTable(scenarioIndexTable).query();
                }},
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
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {scenarioId : '-1'};
            $(scenarioIndexTable).initTable(this.table.options,function(otable){
                scenario_index.table.obj = otable;
                otable.on( 'row-reordered', function ( e, diff, edit ) {
                    var changeArray = new Array();
                    for ( var i=0, ien=diff.length ; i<ien ; i++ ) {
                        var rowData = otable.row( diff[i].node ).data();
                        changeArray.push({"id":rowData.id,"seqNum" : rowData.seqNum});
                    }
                    API.ajax("WEIXIN/researchscenario/updateIndexesSeq",changeArray);
                });
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
                        DT.getTable(scenarioIndexTable).query();
                    }
                });
            })
        }
    };
    return {
        init : function(param){
            $(scenarioEditPortal).removeClass('hide').show();
            $(scenarioGroupPortal).removeClass('hide').hide();
            $(scenarioIndexPortal).removeClass('hide').hide();
            scenario.init(param);

        },
        initIndexAdd : function(param){
            scenario_index_add.init(param);
            $(scenarioIndexAddModal).css('top','18%');
        }
    }
});

