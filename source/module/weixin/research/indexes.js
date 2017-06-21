define('module/weixin/research/indexes',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var indexesTableId = "#table-weixin-research-indexes";
    var indexItemsTableId = "#table-weixin-research-indexes-items";

    var editPage = "pages/weixin/research/indexes-edit";
    var editForm = "#weixin-research-indexes-form";
    var indexItemsModal = "#weixin-research-indexes-items-modal";
    var indexItemsForm = "#weixin-research-indexes-items-form";
    var pageContainer = APP.getPageContainer(indexesTableId);
    var options_prefix = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var indexes = {
        "table" : {
            "id" : indexesTableId,
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
                "addRecord" : function(dt){
                    APP.loadInnerPage(pageContainer,editPage,{act:'add'});
                },
                "editRecord" : function(dt){
                    APP.loadInnerPage(pageContainer,editPage,{act:'update',formData:dt.selectedRowsData()[0]});
                },
                "viewRecord" : function(dt){
                    APP.loadInnerPage(pageContainer,editPage,{act:'view',formData:dt.selectedRowsData()[0]});
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            $(indexesTableId).initTable(this.table.options,function(otable){
                indexes.table.obj = otable;
            });
        }
    };
    var indexesEdit = {
        "table" : {
            "id" : indexItemsTableId,
            "options" : {
                "title": "指标选项",
                "dataUrl":"WEIXIN/researchindex/selectItems",
                "columns": [
                    {"data": "id", "visible": false},
                    {"data": "indexId", "visible": false},
                    {"data": "itemGroupId", "visible": false},
                    {"data": "itemDesc", "title": "选项描述"},
                    {"data": "itemGroupDesc", "title": "选项分类"},
                    {"data": "itemId", "title": "选项值"}
                ],
                "rowOperation" : ["edit","delete"],
                "ordering": false,
                "paging" : false,
                "addEditForm" : {
                    "title":"指标选项维护",
                    "editModal":indexItemsModal,
                    "id" : indexItemsForm,
                    "fieldOpts": {
                        "itemGroupId": {
                            "dictType": "researchindexitem_type",
                            "dataInit" : "1",
                            "allowClear" : false
                        },
                        "itemId": {
                            "allowClear" : false
                        }
                    }
                }
            }
        },
        "form" : {
            "id" : editForm,
            "submitJson" : true,
            "autoClose" : true,
            "fieldOpts": {
                "objectId":{
                    "dataUrl" : "WEIXIN/researchindex/selectObject",
                    "allowClear" : false,
                    "width" : "50%"
                },
                "showMode": {
                    "dictType": "researchindex_showmode",
                    "dataInit" : "1",
                    "allowClear" : false,
                    "width" : "50%"
                }
            }
        },
        "init" : function(param){
            if(param.act == 'add'){
                this.table.options.params = {id:-1};//新增默认查询参数
                this.form.formData = null;
                this.form.submitClear = true;
                this.form.url = "WEIXIN/researchindex/insert";
            }else if(param.act == 'update'){
                this.table.options.params = {indexId : param.formData.id};
                this.form.formData = param.formData;
                this.form.submitClear = false;
                this.form.url = "WEIXIN/researchindex/update";
            }else{
                this.table.options.params = {indexId : param.formData.id};
                this.table.options.rowOperation = null;
                $(indexItemsTableId+'-toolbar').remove();
                $(editForm+" [data-submit]").remove();
                this.form.formData = param.formData;
                this.form.isView = true;
            }
            var combobox_data = API.jsonData("WEIXIN/researchindex/selectCombobox");
            if($.isArray(combobox_data) && combobox_data.length > 0){
                indexesEdit.table.options.addEditForm.fieldOpts.itemId.data = combobox_data;
                var combobox_data_map = {};
                $.each(combobox_data,function(index, obj){
                    combobox_data_map[obj.id] = obj.text;
                });
                indexesEdit.table.options.columns[5].render = function(data, type, row, meta){
                    return combobox_data_map[data] || '';
                };
            }

            var _form = $(editForm);
            var _addEditForm = $(indexItemsForm);
            this.form.initComplete = function(opts){
                _form.field('companyId').val(API.localUser().company_id);
            }
            _form.initForm(this.form,function(data){
                DT.getTable(indexesTableId).query();
            });
            indexesEdit.table.options.addEditForm.initComplete = function(opts){
                var _itemGroupId = _addEditForm.field('itemGroupId').val();
                if(APP.isEmpty(_itemGroupId))
                    _addEditForm.field('itemGroupId').val(_form.field('showMode').val()).trigger('change');
                if(_itemGroupId != '4')
                    _addEditForm.field("itemId").val(0).trigger('change');

            };
            $(indexItemsTableId).initTable(this.table.options,function(otable){
                indexesEdit.table.obj = otable;
            });

            _addEditForm.on("change","[name='itemGroupId']",function(){
                var _selected_data = $(this).val();
                _addEditForm.field('itemGroupDesc').val(($(this).children(":selected").text()));
                if(_selected_data == '4'){
                    _addEditForm.field("itemId").closest('.form-group').show();
                }else{
                    _addEditForm.field("itemId").closest('.form-group').hide();
                    _addEditForm.field("itemId").val(0).trigger('change');
                    if((_selected_data == '1' || _selected_data == '2') && _addEditForm.field('itemDesc').val() == ''){
                        _addEditForm.field('itemDesc').val(options_prefix[indexesEdit.table.obj.dataCount()] + ".");
                    }
                }
            });

        }
    };
    return {
        init : function(param){
            indexes.init(param);
        },
        initEdit : function(param){
            indexesEdit.init(param);
        }
    }
});

