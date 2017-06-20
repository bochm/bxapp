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
            var dt = param.table;
            var act = param.act;
            var editForm = $('#weixin-question-resource-form');
            var _formInitOpt = {
                submitClear : true,url:"WEIXIN/questionresource/insert",
                fieldOpts : {
                    "type" : {
                        "dictType" : "question_type",
                        "dataInit" : "radio",
                        "allowClear" : false
                    }
                },
                initComplete : function(opts){
                    $(" [data-option-add]").click(function(){
                        $(this).closest(".form-group").after("<div class='form-group' data-option='A'>"+
                            "<label class='control-label col-md-2'>选项B</label>"+
                            "<input type='hidden' name='resourceOpts.id'>"+
                            "<input type='hidden' name='resourceOpts.resourceId'>"+
                            "<input type='hidden' name='resourceOpts.optionCode' value='B'>"+
                            "<div class='col-md-10'>"+
                            "<div class='input-group'>"+
                            "<div class='input-icon'> <i class='fa validate-icon'></i>"+
                            "<input type='text' name='resourceOpts.optionDesc' maxlength='100' class='form-control required'>"+
                            "</div>"+
                            "<span class='input-group-btn'>"+
                            "<button class='btn btn-success' type='button' data-option-add='B'><i class='fa fa-minus'/></i></button>"+
                            "<button class='btn btn-success' type='button' data-option-add='B'><i class='fa fa-plus'/></i></button>"+
                            "</span></div></div></div>");
                    });
                    editForm.field("type").on('change',function(){
                        var type = $(this).val();
                        $(editModal + " div.row[data-hide]").each(function(){
                            var _hide = $(this);
                            if(_hide.data('hide').indexOf(type) == -1){
                                 _hide.fadeOut(function(){
                                     _hide.appendTo("div[data-form-hidden]").attr("data-show",_hide.data('hide')).removeAttr("data-hide");
                                })
                            }
                        });
                        $(editModal + " div.row[data-show]").each(function(){
                            var _show = $(this);
                            if(_show.data('show').indexOf(type) >= 0){
                                _show.fadeIn(function(){
                                    _show.appendTo(editForm).attr("data-hide",_show.data('show')).removeAttr("data-show").removeClass('hide');
                                })
                            }
                        });
                        $(editModal + " div.row[data-hide]").removeClass('hide');
                    })
                    editForm.field("type").trigger('change');
                },
                onSuccess : function(ret){
                    dt.addRow(ret);
                }
            };

            if(act == 'edit'){
                _formInitOpt.formData = dt.selectedRows()[0];
                _formInitOpt.submitClear = false;
                _formInitOpt.url = "WEIXIN/questionresource/update";
                _formInitOpt.onSuccess = function(ret){
                    dt.updateSelectedRow(ret);
                }
            }
            $('#weixin-question-resource-form').initForm(_formInitOpt);
        }
    }
});

