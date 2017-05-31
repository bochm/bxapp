define('module/weixin/gift',['app/common','app/datatables','app/form'],function(APP,DT,FM) {
    var table;
    var form_opts = {
        "title":"礼品维护",
        "editModal":"#weixin-gift-edit-modal",
        "id" : "#weixin-gift-edit-form",
        "addUrl" : "WEIXIN/gift/add",
        "saveUrl" : "WEIXIN/gift/update",
        "submitJson" : true,
        "submitCallback" : function(data){
            table.query();
        },
        fieldOpts : {
            "picture" : {
                fileServer:"WEIXIN",//文件上传服务key
                param : {type:'gift'},//传给上传服务getFileUploadUrl方法的参数
                maxFiles:2,//最多上传文件个数
                col : 4,//文件显示宽度 div class=col-md-4
            }
        },
        /*"rules" : {
         "giftName":{
         "checkExists":{
         "url":"WEIXIN/gift/checkGiftName"
         },
         "messages":{
         "checkExists" : "礼品名已存在"
         }
         }
         },*/
    };
    var table_opts = {
        "title" : "礼品表",
        "columns" : [
            { "data": "id","title":"id","visible":false},
            { "data": "giftId","title":"giftId","visible":false},
            { "data": "giftName","title":"礼品名称"},
            { "data": "price","title":"单价"},
            { "data": "unit","title":"单位"},
            { "data": "exchangeScore","title":"兑换积分"},
            { "data": "stock","title":"库存"},
            { "data": "sale","title" : "是否上架","render" : function(data){return data == '1' ? "是" : "否"},"width" : "10%"}
        ],
        "params" : {},
        "scrollY": "350px",
        "ordering" : false,
        "deleteRecord" : {url : 'WEIXIN/gift/delete',id : 'id'},
        "addEditForm" : form_opts,
    }

    function inti_table(param){
        $('table#table-weixin-gift-list').initTable(table_opts,function(otable){
            table = otable;
        });
    }
    function handleEdit(){

    }
    return {
        inti_table : inti_table,
        handleEdit : handleEdit,
        init : function(param){
            this.inti_table({});
            this.handleEdit();
        }

    }
});

