define('module/weixin/question/resource',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var resourceTableId = "#table-weixin-question-resource";
    var editPage = "pages/weixin/question/resource-edit";
    var editModal = "#weixin-question-resource-modal";
    var resource = {
        "table" : {
            "id" : resourceTableId,
            "options" : {
                "title": "题目表",
                "dataUrl" : "WEIXIN/questionresource/selectList",
                "columns": [
                    {"data": "id", "title": "id", "visible": false},
                    {"data": "subject", "title": "题目"},
                    {"data": "optionNumber", "title": "选项数量"},
                    {"data": "groupType", "title": "分组类型",
                        "render": function (data, type, row, meta) {
                            return data == 'consume' ? "个人消费" : "个人背景"
                        }
                    },
                    {"data": "type", "title": "控件类型",
                        "render": function (data, type, row, meta) {
                            switch (data){
                                case 'radio' : return '单选按钮';
                                case 'checkbox' : return '复选按钮';
                                case 'text' : return '文本';
                                case 'fixedSelect' : return '固定值单选';
                                case 'fixedMultiselect' : return '固定值多选';
                            }
                        }
                    },
                    {"data": "status", "title": "是否启用","render": function (data, type, row, meta) {return data == '1' ? "是" : "否"}}
                ],
                "ordering": false,
                "rowOperation" : ["view","edit","delete"],
                "deleteRecord": {url: 'WEIXIN/questionresource/deleteBatch', row: true, id: "id"},
                "addEditModal" : {"url" : editPage,"id":editModal,"title":"题目维护"}
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};

            $(resourceTableId).initTable(this.table.options,function(otable){
                resource.table.obj = otable;
            });
        }
    };

    return {
        init : function(param){
            resource.init(param);
        },
        initEdit : function(param){

        }
    }
});

