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
                    {"data": "stock", "title": "库存",
                        "render": function (data, type, row, meta) {
                            return "<a href='#' data-view='"+meta.row+"'>"+data+"</a>"
                    }},
                    {"data": "sale", "title": "是否上架", "render": function (data, type, row, meta) {return data == '1' ? "是" : "否"}, "width": "12%"}
                ],
                "ordering": false,
                "deleteRecord": {url: 'WEIXIN/gift/deleteBatch', row: true, id: "id"},
                "addEditForm" : {
                    "title": "礼品维护",
                    "editModal": "#weixin-gift-edit-modal",
                    "id": "#weixin-gift-edit-form",
                    "addUrl": "WEIXIN/gift/add",
                    "saveUrl": "WEIXIN/gift/update",
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
            $(this.table.id).on('click', "a[data-view]", function () {
                var data = gift.table.obj.row( $(this).data('view')).data();
                APP.modal("#weixin-gift-stock-modal",
                    {url:"pages/weixin/gift/gift-stock",params : {giftId : data.id},title:"礼品购进明细"})
            } );
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
                    {"data": "qtyPurchase", "title": "数量"}
                ],
                "ordering": false,
                "deleteRecord": {url: 'WEIXIN/giftpurchase/deleteBatch', row: true, id: "id"},
                "addRecord" : function(dt,node,e){
                    APP.loadInnerPage(APP.getPageContainer("#table-weixin-gift-purchase"),'pages/weixin/gift/gift-purchase-edit',{act:'add'});
                },
                "saveRecord" : function(dt,node,e){
                    APP.loadInnerPage(APP.getPageContainer("#table-weixin-gift-purchase"),
                        'pages/weixin/gift/gift-purchase-edit',{act:'update',formData:dt.selectedRowsData()[0]});
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            this.table.options.deleteRecord.onDeleted = function(){
                DT.getTable(gift.table.id).query();
            }
            $(this.table.id).initTable(this.table.options,function(otable){
                purchase.table.obj = otable;
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
                            "dataUrl": "WEIXIN//gift/listGift",
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
                this.form.url = "WEIXIN/giftpurchase/insert";
            }else if(param.act == 'update'){
                this.table.options.params = {applyId : param.formData.id};
                this.form.formData = param.formData;
                this.form.submitClear = false;
                this.form.url = "WEIXIN/giftpurchase/update";
            }
            var _form = $(this.form.id);
            var _addEditForm = $(this.table.options.addEditForm.id);

            $(this.form.id).initForm(this.form,function(data){
                DT.getTable(purchase.table.id).query();
                DT.getTable(gift.table.id).query();
            });
            purchaseEdit.table.options.addEditForm.initComplete = function(opts){
                //修改下拉框请求参数，表格中已存在的礼品，下拉框中disable
                var selectedGiftIds = DT.getTable(purchaseEdit.table.id).columns(3).data()[0];
                for(var i=0;i<selectedGiftIds.length;i++){
                    _addEditForm.field("giftId").children("option[value='"+selectedGiftIds[i]+"']").remove();
                }

            };
            $(this.table.id).initTable(this.table.options,function(otable){
                purchaseEdit.table.obj = otable;
            });
            $(this.table.id).on( 'draw.dt', function () {
                if(purchaseEdit.table.obj !== undefined){
                    _form.field("qtyPurchase").val(purchaseEdit.table.obj.column(7).data().sum());
                    _form.field("amount").val(purchaseEdit.table.obj.column(8).data().sum());
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

