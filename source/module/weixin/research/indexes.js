define('module/weixin/research/indexes',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var resourceTableId = "#table-weixin-research-indexes";
    var editPage = "pages/weixin/research/indexes-edit";
    var editModal = "#weixin-research-indexes-modal";
    var resource = {
        "table" : {
            "id" : resourceTableId,
            "options" : {
                "title": "调查指标表",
                "dataUrl" : "WEIXIN/researchindex/selectList",
                "columns": [
                    {"data": "id", "title": "id", "visible": false},
                    {"data": "indexDesc", "title": "题目名称"},
                    {"data": "showMode", "title": "分组类型","render" : function(data){return API.getDictName("researchindex_showmode",data);}},
                    {"data": "status", "title": "是否启用","render": function (data, type, row, meta) {return API.getDictName("on_off",data);}},
                    {"data": "indexExplain", "title": "题目说明"}
                ],
                "ordering": false,
                "rowOperation" : ["view","edit","delete"],
                "deleteRecord": {url: 'WEIXIN/researchindex/deleteBatch', row: true, id: "id"},
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
                submitClear : true,url:"WEIXIN/researchindex/insert",
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
                _formInitOpt.url = "WEIXIN/researchindex/update";
                _formInitOpt.onSuccess = function(ret){
                    dt.updateSelectedRow(ret);
                }
            }
            $('#weixin-question-resource-form').initForm(_formInitOpt);
        }
    }
});

