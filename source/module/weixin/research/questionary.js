define('module/weixin/research/questionary',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var questionaryTable = "#table-weixin-research-questionary";
    var questionaryQueryForm = "#weixin-research-questionary-queryform";
    var questionaryModal = "#weixin-research-questionary-items-modal";

    function _format_questionary(data){
        var form_body = $(questionaryModal + " .form-body");
        form_body.empty();
        for(var i=0;i<data.length;i++){
            form_body.append("<h3 class='form-section'>"+data[i].groupDesc+"</h3><div class='row'>" +
                "<div class='col-md-12' id='"+data[i].groupId+"'></div></div>");
            if($.isArray(data[i].questionList)){
                for(var j=0;j<data[i].questionList.length;j++){
                    $("#"+data[i].groupId).append("<div class='form-group'><label class='control-label'>"+
                        data[i].questionList[j].seqNum+"."+data[i].questionList[j].indexDesc+
                        "</label>"+_format_answer(data[i].questionList[j].showMode,data[i].questionList[j].answerList).get(0).outerHTML+"</div>");
                }
            }

        }
    }
    function _format_answer(mode,asList){
        if(!$.isArray(asList)) return "";
        var _html = $("<div>");
        if(mode == 1 || mode == 2){
            var input_type = (mode == 1 ? 'radio' : 'checkbox');
            var input_class = (mode == 1 ? 'radio' : 'check');
            _html.addClass("x-"+input_class+" "+input_class+"-primary");
            for(var x=0;x<asList.length;x++){
                _html.append("<input type='"+input_type+"' "+(asList[x].isAnswer == "1" ? "checked" : "")+"><label>"+asList[x].itemDesc+"</label>");
            }
        }else{
            _html.addClass("form-control-static");
            for(var x=0;x<asList.length;x++){
                _html.append(" <label class='font-green'>"+asList[x].itemContent+"</label>");
            }
        }
        return _html;
    }
    var questionary = {
        "table" : {
            "id" : questionaryTable,
            "options" : {
                "title": "问卷表",
                "dataUrl":"WEIXIN/researchquestionary/selectList",
                "columns": [
                    {"data": "submitTime", "title": "提交日期"},
                    {"data": "name", "title": "调查对象"},
                    {"data": "phone", "title": "联系电话"}
                ],
                "rowOperation" : ["view"],
                "viewRecord": function(dt){
                    var rowData = dt.selectedRowsData()[0];
                    var paramData = {"questionNum":rowData.id,"scenarioId":rowData.scenarioId};
                    API.jsonData("WEIXIN/researchscenario/selectQuestionaryDetailList",paramData,function(data){
                        _format_questionary(data);
                        APP.modal(questionaryModal,{"title":"问卷查看"});
                    });

                },
                "queryForm" : {
                    "id" : questionaryQueryForm,
                    "fieldOpts": {
                        "scenarioId":{
                            "dataUrl" : "WEIXIN/researchscenario/selectList",
                            "allowClear" : false,
                            "placeholder" : {id:"-1",text:"请选择调查方案"},
                            "textProperty" : "scenarioDesc"
                        }
                    }
                }
            }
        },
        init : function(param){
            this.table.options.params = {scenarioId:"-1"};
            this.table.options.queryForm.initComplete = function(opts){
                $(questionaryQueryForm).field('scenarioId').on('change',function(){
                    questionary.table.obj.query({scenarioId:$(this).val()});
                });
            }
            $(questionaryTable).initTable(this.table.options,function(otable){
                questionary.table.obj = otable;
            });
            
        }
    }


    var questionaryAnalysisTable = "#table-weixin-research-questionary-analysis";
    var questionaryAnalysisQueryForm = "#weixin-research-questionary-analysis-queryform";
    var questionaryAnalysis = {
        "table" : {
            "id" : questionaryAnalysisTable,
            "options" : {
                "title": "问卷分析表",
                "dataUrl":"WEIXIN/researchscenario/selectQuestionaryGroupList",
                "columns": [
                    {"data": "indexDesc","visible": false},
                    {"data": "itemDesc", "title": "指标"},
                    {"data": "selected", "title": "选择数量"},
                    {"data": "proportion", "title": "占比(%)"}
                ],
                "orderFixed": [[0, 'asc']],
                "rowGroup": {
                    dataSrc: "indexDesc"
                },
                "queryForm" : {
                    "id" : questionaryAnalysisQueryForm,
                    "fieldOpts": {
                        "scenarioId":{
                            "dataUrl" : "WEIXIN/researchscenario/selectList",
                            "allowClear" : false,
                            "placeholder" : {id:"-1",text:"请选择调查方案"},
                            "textProperty" : "scenarioDesc"
                        }
                    }
                }
            }
        },
        init : function(param){
            this.table.options.params = {scenarioId:"-1"};
            this.table.options.queryForm.initComplete = function(opts){
                $(questionaryAnalysisQueryForm).field('scenarioId').on('change',function(){
                    questionaryAnalysis.table.obj.query({scenarioId:$(this).val()});
                });
            }
            $(questionaryAnalysisTable).initTable(this.table.options,function(otable){
                questionaryAnalysis.table.obj = otable;
            });

        }
    }
    return {
        init : function(param){
            questionary.init(param);
        },
        initAnalysis : function(param){
            questionaryAnalysis.init(param);
        }
    }
});

