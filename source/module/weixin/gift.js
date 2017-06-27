define('module/weixin/gift',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var gift = {
        "table" : {
            "id" : "#table-weixin-gift-list",
            "options" : {
                "title": "礼品表",
                "columns": [
                    {"data": "id", "title": "id", "visible": false},
                    {"data": "giftId", "title": "giftId", "visible": false},
                    {"data": "giftName", "title": "礼品名称"},
                    {"data": "price", "title": "单价"},
                    {"data": "unit", "title": "单位"},
                    {"data": "exchangeScore", "title": "兑换积分"},
                    {"data": "stock", "title": "库存"},
                    {"data": "sale", "title": "是否上架", "render": function (data, type, row, meta) {return data == '1' ? "是" : "否"}, "width": "12%"}
                ],
                "ordering": false,
                "rowOperation" : ["view"],
                "addEditForm" : {
                    "title": "礼品维护",
                    "editModal": "#weixin-gift-edit-modal",
                    "id": "#weixin-gift-edit-form",
                    "addUrl": "WEIXIN/gift/add",
                    "editUrl": "WEIXIN/gift/update",
                    "submitJson": true,
                    "fieldOpts": {
                        "picture": {
                            "fileServer": "WEIXIN",//文件上传服务key
                            "param": {type: 'gift'},//传给上传服务getFileUploadUrl方法的参数
                            "maxFiles": 2,//最多上传文件个数
                            "col": 4,//文件显示宽度 div class=col-md-4
                            "savePath": true, //picture字段保存文件url(只能用于单个图片，maxFiles参数失效)
                        }
                    }
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            this.table.options.addEditForm.submitCallback = function(data){
                gift.table.obj.query();
            };
            $(this.table.id).initTable(this.table.options,function(otable){
                gift.table.obj = otable;
            });
        }
    };
    var giftStockView = {
        "table" : {
            "id" : "#table-weixin-gift-stock",
            "options" : {
                "title": "礼品购进表",
                "columns": [
                    {"data": "applyNo", "title": "购进单号"},
                    {"data": "purchaseDate", "title": "购进日期"},
                    {"data": "qtyPurchase", "title": "数量"},
                    {"data": "amount", "title": "金额"}
                ]
            }
        },
        "init" : function(param){
            this.table.options.dataUrl = "WEIXIN/giftpurchase/selectDetail";
            this.table.options.params = param;
            $(this.table.id).initTable(this.table.options);
        }
    };
    var purchase = {
        "table" : {
            "id" : "#table-weixin-gift-purchase",
            "options" : {
                "title": "礼品购进",
                "columns": [
                    {"data": "id", "visible": false},
                    {"data": "purchaseDetail", "visible": false},
                    {"data": "applyNo", "title": "购进单号"},
                    {"data": "applyDate", "title": "购进日期"},
                    {"data": "amount", "title": "金额"},
                    {"data": "qtyPurchase", "title": "数量"},
                    {"data": "status", "title": "状态","render": function (data, type, row, meta) {return data == '9' ? "作废" : "提交"}}
                ],
                "ordering": false,
                "select": {style: 'single'},
                "rowOperation" : ["view"],
                "addRecord" : function(dt,node,e){
                    APP.loadInnerPage(APP.getPageContainer("#table-weixin-gift-purchase"),'pages/weixin/gift/gift-purchase-edit',{act:'add'});
                },
                "viewRecord" : function(dt,node,e){
                    APP.loadInnerPage(APP.getPageContainer("#table-weixin-gift-purchase"),
                        'pages/weixin/gift/gift-purchase-edit',{act:'view',formData:dt.selectedRowsData()[0]});
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            this.table.options.cancelRecord = function(dt,node,e){
                APP.confirm('','是否作废选择的记录?',function(){
                    var params = dt.selectedRowsData('id')[0];
                    API.ajax("WEIXIN/giftpurchase/cancelPurchase",params,false,function(ret,status){
                        if(API.isError(ret)){
                            APP.error(ret);
                        }else{
                            var sel = dt.selectedRowsData()[0];
                            sel.status = '9';
                            dt.updateSelectedRow(sel);
                            APP.success('单据已作废',null,true);
                            dt.buttons( '.btn-danger' ).disable();
                            DT.getTable(gift.table.id).query();
                        }
                    },function(err){
                        APP.error(err);
                    });
                })
            };
            $(this.table.id).initTable(this.table.options,function(otable){
                purchase.table.obj = otable;
                otable.on( 'select', function ( e, dt, type, indexes ) {
                    if(dt.rows( indexes ).data()[0].status == '9') dt.buttons( '.btn-danger' ).disable();
                    else dt.buttons( '.btn-danger' ).enable();
                });
            });

        }
    };
    var purchaseEdit = {
        "table" : {
            "id" : "#table-weixin-gift-purchase-detail",
            "options" : {
                "title": "礼品购进",
                "dataUrl":"WEIXIN/giftpurchase/selectDetail",
                "columns": [
                    {"data": "id", "visible": false},
                    {"data": "applyId", "visible": false},
                    {"data": "applyNo", "visible": false},
                    {"data": "giftId", "visible": false},
                    {"data": "giftName", "title": "礼品名称"},
                    {"data": "price", "title": "价格"},
                    {"data": "unit", "title": "单位"},
                    {"data": "qtyPurchase", "title": "数量"},
                    {"data": "amount", "title": "金额"}
                ],
                "rowOperation" : ["edit","delete"],
                "ordering": false,
                "paging" : false,
                "addEditForm" : {
                    "title":"礼品购进明细",
                    "editModal":"#weixin-gift-purchase-detail-edit-modal",
                    "id" : "#weixin-gift-purchase-detail-form",
                    "fieldOpts": {
                        "giftId": {
                            "dataUrl": "WEIXIN/gift/listGift",
                            "textProperty" : "giftName"
                        }
                    }
                }
            }
        },
        "form" : {
            "id" : "#weixin-gift-purchase-form",
            "submitJson" : true,
            "autoClose" : true
        },
        "init" : function(param){
            if(param.act == 'add'){
                this.table.options.params = {id:-1};//新增默认查询参数
                this.form.formData = null;
                this.form.submitClear = true;
                this.form.url = "WEIXIN/giftpurchase/insertPurchase";
            }else if(param.act == 'view'){
                this.table.options.params = {applyId : param.formData.id};
                this.form.formData = param.formData;
                this.table.options.rowOperation = null;
                $(this.table.id+'-toolbar').remove();
                $(this.form.id+" [data-submit]").remove();
                this.form.isView = true;
            }
            var _form = $(this.form.id);
            var _addEditForm = $(this.table.options.addEditForm.id);
            this.form.initComplete = function(opts){
                _form.field('companyId').val(API.localUser().company_id);
                _form.field('deptId').val(API.localUser().dept_id);
                if(param.act == 'add') _form.field('applyNo').val(APP.getUniqueID('LPGJ'+APP.formatDate()));
            }
            $(this.form.id).initForm(this.form,function(data){
                DT.getTable(purchase.table.id).query();
                DT.getTable(gift.table.id).query();
            });
            purchaseEdit.table.options.addEditForm.initComplete = function(opts){
                //修改下拉框请求参数，表格中已存在的礼品，下拉框中disable
                var selectedGiftIds = DT.getTable(purchaseEdit.table.id).columnData('giftId');
                var seleData = _addEditForm.field("giftId").data('options');
                var _giftId = null;
                if(opts.formData) _giftId = opts.formData.giftId;

                for(var i=0;i<seleData.length;i++){
                    if($.inArray(seleData[i].id,selectedGiftIds) >= 0 && _giftId != seleData[i].id) seleData[i].disabled = true;
                    else seleData[i].disabled = false;
                }
                _addEditForm.field("giftId").empty();
                _addEditForm.field("giftId").select({data:seleData});
                if(_giftId) _addEditForm.field("giftId").val(_giftId);
            };
            $(this.table.id).initTable(this.table.options,function(otable){
                purchaseEdit.table.obj = otable;
            });
            $(this.table.id).on( 'draw.dt', function () {
                if(purchaseEdit.table.obj !== undefined){
                    _form.field("qtyPurchase").val(purchaseEdit.table.obj.columnData('qtyPurchase').sum());
                    _form.field("amount").val(purchaseEdit.table.obj.columnData('amount').sum());
                }
            });

            _addEditForm.on("select2:select","[name='giftId']",function(){
                var _selected_data = $(this).select2('data')[0];
                _addEditForm.field("giftName").val(_selected_data.giftName);
                _addEditForm.field("price").val(_selected_data.price);
                _addEditForm.field("unit").val(_selected_data.unit);
            });
            _addEditForm.on("change","[name='qtyPurchase']",function(){
                if(!APP.isEmpty(_addEditForm.field("price").val())){
                    _addEditForm.field("amount").val(
                        APP.numeral(_addEditForm.field("price").val()).multiply($(this).val()).format('0.00'));
                }
            });


        }
    };
    return {
        initPurchase : function(param){
            purchase.init(param);
        },
        initPurchaseEdit : function(param){
            purchaseEdit.init(param);
        },
        init : function(param){
            gift.init(param);
        },
        initGiftStock : function(param){
            giftStockView.init(param);
        }

    }
});

