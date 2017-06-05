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
                "deleteRecord": {url: 'WEIXIN/gift/deleteBatch', row: true, id: "id"}
            }
        },
        "form" : {
            "title":"礼品维护",
            "editModal":"#weixin-gift-edit-modal",
            "id" : "#weixin-gift-edit-form",
            "addUrl" : "WEIXIN/gift/add",
            "saveUrl" : "WEIXIN/gift/update",
            "submitJson" : true,
            "fieldOpts" : {
                "picture" : {
                    "fileServer":"WEIXIN",//文件上传服务key
                    "param" : {type:'gift'},//传给上传服务getFileUploadUrl方法的参数
                    "maxFiles":2,//最多上传文件个数
                    "col" : 4,//文件显示宽度 div class=col-md-4
                    "savePath":true, //picture字段保存文件url(只能用于单个图片，maxFiles参数失效)
                }
            }
        },
        "init" : function(param){
            this.table.options.params = param || {};
            this.table.options.addEditForm = this.form;
            this.form.submitCallback = function(data){
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
                    {"data": "id", "title": "id", "visible": false},
                    {"data": "applyNo", "title": "购进单号"},
                    {"data": "applyDate", "title": "购进日期"},
                    {"data": "amount", "title": "金额"},
                    {"data": "qtyPurchase", "title": "数量"}
                ],
                "ordering": false,
                "deleteRecord": {url: 'WEIXIN/gift/deleteBatch', row: true, id: "id"},
                "addRecord" : function(dt,node,e){

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

    return {
        initPurchase : function(param){
            purchase.init(param);
        },
        init : function(param){
            gift.init(param);
        }

    }
});

