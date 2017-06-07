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
                    {"data": "sale", "title": "是否上架", "render": function (data) {return data == '1' ? "是" : "否"}, "width": "10%"}
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
                "deleteRecord": {url: 'WEIXIN/gift/deleteBatch', row: true, id: "id"},
                "addRecord" : function(dt,node,e){
                    APP.loadInnerPage(APP.getPageContainer("#table-weixin-gift-purchase"),'pages/weixin/gift/gift-purchase-edit',{id:-1});
                },
                "saveRecord" : function(dt,node,e){

                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
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
                "addEditForm" : {
                    "title":"礼品购进明细",
                    "editModal":"#weixin-gift-purchase-detail-edit-modal",
                    "id" : "#weixin-gift-purchase-detail-form",
                    "fieldOpts": {
                        "giftId": {
                            "dataUrl": "WEIXIN//gift/selectList",
                            "textProperty" : "giftName"
                        }
                    }
                }
            }
        },
        "form" : {
            "id" : "#weixin-gift-purchase-form",
            "url" : "WEIXIN/giftpurchase/insert",
            "submitJson" : true
        },
        "init" : function(param){
            this.table.options.params = param || {};
            this.form.formData = param.id == -1 ? {} : param;//新增时id为-1
            var _form = $(this.form.id);
            var _addEditForm = $(this.table.options.addEditForm.id);

            $(this.form.id).initForm(this.form,function(data){
                purchase.table.obj.query();
                APP.returnPage("#weixin-gift-purchase-form");
            });
            $(this.table.id).initTable(this.table.options,function(otable){
                purchaseEdit.table.obj = otable;
            });
            $(this.table.id).on( 'draw.dt', function () {
                if(purchaseEdit.table.obj !== undefined){
                    _form.find("[name='qtyPurchase']").val(purchaseEdit.table.obj.column(7).data().sum());
                    _form.find("[name='amount']").val(purchaseEdit.table.obj.column(8).data().sum());
                }
            } );
            _addEditForm.on("select2:select","[name='giftId']",function(){
                var _selected_data = $(this).select2('data')[0];
                _addEditForm.find("[name='giftName']").val(_selected_data.giftName);
                _addEditForm.find("[name='price']").val(_selected_data.price);
                _addEditForm.find("[name='unit']").val(_selected_data.unit);
            })
            _addEditForm.on("change","[name='qtyPurchase']",function(){
                _addEditForm.find("[name='amount']").val(
                    APP.numeral(_addEditForm.find("[name='price']").val()).multiply($(this).val()).format('0.00'));
            })
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
        }

    }
});

