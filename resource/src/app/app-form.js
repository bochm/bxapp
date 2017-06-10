
define('app/form',["jquery","app/common","app/api","moment",
                   "jquery/validate","jquery/form",
					"switch","jquery/select2","jquery/summernote","bootstrap/typeahead","bootstrap/datepicker"],function($,APP,API) {
	var moment = require('moment');
	moment.locale("zh-cn");
	var FORM = {
			initDatePicker : function(ct){
	        	APP.queryContainer(ct).find('[form-role="date"]').each(function(){
	        		$(this).datePicker();
	        	});
	        }
	};
	/**
	 * 将form格式化为json
	 * @param  {Object} form form对象
	 * @return {Object} json对象
	 */
	FORM.formToJson = function(form){
		var serializeObj={};  
        var array=form.serializeArray();
        $(array).each(function(){  
            if(serializeObj[this.name]){  
                if($.isArray(serializeObj[this.name])){  
                    serializeObj[this.name].push(this.value);  
                }else{  
                    serializeObj[this.name]=[serializeObj[this.name],this.value];  
                }  
            }else{  
                serializeObj[this.name]=this.value;   
            }  
        });  
        return serializeObj;  
	};
	//--------------------------------------datePicker------------------------------
	/**
	 * 日期 bootstrap datePicker
	 * @param  {Object} opts  设置参数
	 * @param  {Function} callback  日期变化时调用的函数(或者在opt中设置onChange)
	 */
	$.fn.datePicker = function(opts,callback){
		var _target = $(this);
		var default_opt = $.extend(true,{
			language:'zh-CN',autoclose: true,todayHighlight:true,format:'yyyy-mm-dd',zIndexOffset:9999,orientation:'auto'
		},opts);
		var _event_type = "changeDate";
		if(default_opt.viewType == "year"){
			default_opt.startView = 2;
			default_opt.minViewMode = 2;
			_event_type="changeYear";
		}else if(default_opt.viewType == "month"){
			default_opt.startView = 1;
			default_opt.minViewMode = 1;
			_event_type="changeMonth";
		}
		_target.datepicker(default_opt);
		_target.datepicker('update',APP.formatDate(default_opt.format.toUpperCase(),default_opt.defaultDate));
		_target.data('date-value',APP.formatDate('YYYY-MM-DD',default_opt.defaultDate));
		_target.datepicker().on(_event_type,function(e){
			if(_target.data('date-value') != APP.formatDate('YYYY-MM-DD',e.date)){
				_target.data('date-value',APP.formatDate('YYYY-MM-DD',e.date));
				if(typeof callback === 'function') callback(APP.formatDate('YYYY-MM-DD',e.date));
				else if(typeof opts.onChange === 'function') opts.onChange(APP.formatDate('YYYY-MM-DD',e.date));
			}
		})
	};
	
	/**
	 * 日期区间 bootstrap dateRangePicker
	 * @param  {Object} opts  设置参数
	 * @param  {Function} callback  设置后调用的函数
	 */
	$.fn.dateRangePicker = function(opts,callback){
		var _target = $(this);
		require(['bootstrap/daterangepicker'],function(){
			var default_opt = $.extend(true,{
				opens: (APP.isRTL ? 'left' : 'right'),
				startDate: moment().subtract('days', 29).format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD'),
                minDate: '2012-01-01',
                maxDate: moment().format('YYYY-MM-DD'),
                dateLimit: {days: 365},
                showDropdowns: true,
                showWeekNumbers: true,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                /*ranges: {
                    '今天': [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                    '昨天': [moment().subtract('days', 1).format('YYYY-MM-DD'), moment().subtract('days', 1).format('YYYY-MM-DD')],
                    '近7天': [moment().subtract('days', 6).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                    '近30天': [moment().subtract('days', 29).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
                    '本月': [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')],
                    '上月': [moment().subtract('month', 1).startOf('month').format('YYYY-MM-DD'), moment().subtract('month', 1).endOf('month').format('YYYY-MM-DD')]
                },*/
                buttonClasses: ['btn'],
                applyClass: 'green',
                cancelClass: 'default',
                format: 'YYYY-MM-DD',
                separator: ' 到 ',
                locale: {
                    "applyLabel": '确定',
                    "cancelLabel": '取消',
                    "fromLabel": '从',
                    "toLabel": '到',
                    "customRangeLabel": '日期区间选择',
                    "daysOfWeek": ["日","一","二","三","四","五","六"],
			        "monthNames": ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
                    "firstDay": 1
                },
                startName : "startDate",
                endName : "endDate"
			},opts);
			var start_date_field = $("<input type='hidden' name='"+default_opt.startName+"'>");
			var end_date_field = $("<input type='hidden' name='"+default_opt.endName+"'>");
			_target.append(start_date_field).append(end_date_field);
			_target.daterangepicker(default_opt,function(start, end, label){
				if(typeof callback === 'function'){
					callback(start, end, label);
	        	}else{
	        		var _date_range = start.format('YYYY年MM月DD日') + ' - ' + end.format('YYYY年MM月DD日');
	        		if(_target.hasClass('input-group')){
	        			_target.children("input:text").val(_date_range);
	        		}else{
	        			_target.children('span').html(_date_range);
	        		}
	        		start_date_field.val(start.format(default_opt.format));
	        		end_date_field.val(end.format(default_opt.format));
	        		//$(target+' span')
	        	}
			});
			var _date_range_default = moment(default_opt.startDate).format('YYYY年MM月DD日') + ' - ' + moment(default_opt.endDate).format('YYYY年MM月DD日');
			if(_target.hasClass('input-group')){
				_target.children('input:text').val(_date_range_default);
    		}else{
    			_target.children('span').html(_date_range_default);
    		}
			start_date_field.val(default_opt.startDate);
    		end_date_field.val(default_opt.endDate);
			
		})
	};
	
	
	
	//--------------------------form  validate------------------------------
	//jquery.validate默认设置
	var validate_default_settings = {
		errorElement: 'span',
		errorClass: 'help-block help-block-error',
		focusInvalid: true,
		onkeyup: false,
		errorPlacement: function (error, element) {
			/*if(element.siblings("span.input-group-addon").size() > 0){//treeselect控件验证时隐藏错误span
				error.addClass('hide');
			}*/
			if (element.parent(".input-group").size() > 0) {//带图标的输入框
                error.insertAfter(element.parent(".input-group"));
            } else if (element.attr("data-error-container")) { //指定container存放错误
                error.appendTo(element.attr("data-error-container"));
            } else if (element.parents('.radio-list').size() > 0) { //radio 
                error.appendTo(element.parents('.radio-list').attr("data-error-container"));
            } else if (element.parents('.radio-inline').size() > 0) { 
                error.appendTo(element.parents('.radio-inline').attr("data-error-container"));
            } else if (element.parents('.checkbox-list').size() > 0) {
                error.appendTo(element.parents('.checkbox-list').attr("data-error-container"));
            } else if (element.parents('.checkbox-inline').size() > 0) { 
                error.appendTo(element.parents('.checkbox-inline').attr("data-error-container"));
            } else if(element.siblings("i.validate-icon").size() > 0){//图标方式提示错误
            	var icon = element.siblings("i.validate-icon");
                icon.removeClass('fa-check').addClass("fa-warning");  
                icon.attr("data-original-title", error.text()).tooltip({placement:'auto left'});
            }else {
                error.insertAfter(element);
            }
		},
		invalidHandler: function (event, validator) {
		},
		highlight: function (element) {
			$(element).closest('.form-group').removeClass("has-success").addClass('has-error');
		},
		success: function (label,element) {
			if($(element).siblings("i.validate-icon").size() > 0){//图标方式提示错误
				var icon = $(element).siblings("i.validate-icon");
	            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
	            icon.removeClass("fa-warning");
	            if($(element).tagName == 'INPUT') icon.addClass("fa-check");
	            icon.removeAttr("data-original-title");
            }else {
            	label.closest('.form-group').removeClass('has-error');
            }
		}
	};

	//小数位数验证
	$.validator.addMethod("decimal",function(value, element){
		if(APP.isEmpty(value)) return true;
		if(!$.isNumeric(value)) return false;
		var default_digit = $(element).data('digit') || 2;//默认输入两位
		var str_decimal = value.split(".");
		if(str_decimal.length === 2){
			return str_decimal[1].length <= default_digit;
		}
		return true;
	},"小数格式不正确");
	//jquery.validate增加select2验证方法
	$.validator.addMethod("selectOpt", function(value, element) {   
		return this.optional(element) || (value != "-1");
	}, "请选择");
	
	$.validator.addMethod("checkExists", function(value, element,p) {   
		if(APP.isEmpty(value)) return true;
		if(APP.isEmpty(p)){
			alert('请设置字段校验参数');
			return false;
		}
		if(APP.isEmpty(p.url) && APP.isEmpty(p.stmID || p.stmid || p.stmId)){
			alert('请设置字段校验参数中的url或者stmID');
			return false;
		}
		var paramData = {param : (p.data || {})};
		paramData.param[element.name] = value;
		if(p.original) paramData.param["o_"+element.name] = p.original;//修改form中的初始值
		if(p.joinField){//参与验证字段值
			if($.isArray(p.joinField)){
				for(var i=0;i<p.joinField.length;i++){
					var joinField = $(p.joinField[i]);
					paramData.param[joinField.attr("name")] = joinField.val();
					if(joinField.data("original") && joinField.data("original") != joinField.val()) {//当参与验证字段值发生变化的时候，则取消当前字段的初始值验证
						paramData.param["o_"+element.name] = "";
					}
				}
			}else{
				var joinField = $(p.joinField);
				console.log(joinField);
				console.log(joinField.val());
				paramData.param[joinField.attr("name")] = joinField.val();
				if(joinField.data("original") && joinField.data("original") != joinField.val()) {//当参与验证字段值发生变化的时候，则取消当前字段的初始值验证
					paramData.param["o_"+element.name] = "";
				}
			}
		}
		if(!APP.isEmpty(p.url)){
			return API.jsonData(p.url,paramData);
		}else{
			var stmid = p.stmID || p.stmid || p.stmId;
			return APP.isEmpty(API.getListByStmId(stmid,paramData));
		}
		
	}, "已存在");
	//初始化表单字段(select 等特殊字段)
	function _init_field(opts,form,formField,isInitValue){
		var _fieldName = formField.attr('name');
		var _fieldRole = formField.attr('form-role');
		//初始化js定义的验证规则,如有checkExists规则需要将original初始值作为入参
		if(opts.rules && opts.rules[_fieldName]){
			formField.rules( "remove");
			if(opts.rules[_fieldName].checkExists){
				opts.rules[_fieldName].checkExists.original = formField.val();
			}
			formField.rules( "add", opts.rules[_fieldName]);
		}
		//初始化过的form不再重复
		if(form.data("form-init")){
			var _fieldOpt = opts.fieldOpts[_fieldName]
			//file控件由于需要重新绑定参数
			if(_fieldRole == 'file' && opts.initClear) {
				formField.fileUpload(opts.fieldOpts[_fieldName]);
			}
			//summernote控件需要重新初始化值
			if(_fieldRole == 'richEdit'){
				formField.summernote('code',isInitValue ? formField.data('original') : '');
			}
			//date控件需要重新初始化值
			if(_fieldRole == 'date'){
				formField.datepicker('update',APP.formatDate(formField.data('format'),
					isInitValue ? formField.data('original') : APP.formatDate('YYYY-MM-DD')));
			}
			return;
		}

		if(_fieldRole == 'select'){
			var _selectOpt = opts.fieldOpts[_fieldName] || {};
			try{
				if(formField.attr('placeholder') && !isInitValue) _selectOpt.placeholder = JSON.parse(formField.attr('placeholder'));
			}catch(e){alert("placeholder属性值必须为json字符串");}
			if(formField.data('json')) _selectOpt.jsonData = formField.data('json');
			else if(formField.data('stmid')) _selectOpt.stmID = formField.data('stmid');
			else if(formField.data('dict-type')){
				_selectOpt.data = API.getDictByType(formField.data('dict-type'));
				if($.isArray(_selectOpt.data)){
					for(var i=0;i<_selectOpt.data.length;i++){//select2使用text显示
						_selectOpt.data[i].id = _selectOpt.data[i].value;
						_selectOpt.data[i].text = _selectOpt.data[i].name;
					}
				}
				
			}
			formField.select(_selectOpt);
		}
		else if(_fieldRole == 'treeSelect'){
			var _treeSelectOpt = opts.fieldOpts[_fieldName] || {};
			if(formField.data('stmid')) _treeSelectOpt.stmID = formField.data('stmid');
			if(!formField.attr('id')){
				alert("请指定treeSelect表单元素的id属性");
				return;
			}
			formField.treeSelect(_treeSelectOpt);
		} else if(_fieldRole == 'date'){
			var _dateOpt = opts.fieldOpts[_fieldName] || {};
			if(formField.data('view-type')) _dateOpt.viewType = formField.data('view-type');
			if(formField.data('format')) _dateOpt.format = formField.data('format');
			_dateOpt.defaultDate = formField.data('original');
			formField.datePicker(_dateOpt);
		}else if(_fieldRole == 'dateRange'){
			var _dateRangeOpt = opts.fieldOpts[_fieldName] || {};
			if(formField.data('start-date')) _dateRangeOpt.startDate = formField.data('start-date');
			if(formField.data('end-date')) _dateRangeOpt.endDate = formField.data('end-date');
			if(formField.data('min-date')) _dateRangeOpt.minDate = formField.data('min-date');
			if(formField.data('max-date')) _dateRangeOpt.maxDate = formField.data('max-date');
			if(formField.data('format')) _dateRangeOpt.format = formField.data('format');
			if(formField.data('start-name')) _dateRangeOpt.startName = formField.data('start-name');
			if(formField.data('end-name')) _dateRangeOpt.endName = formField.data('end-name');
			formField.wrap("<div class='input-group'></div>")
			formField.after("<span class='input-group-btn'><button class='btn default' type='button'>" +
					"<i class='fa fa-calendar'></i></button></span>");
			formField.parent().dateRangePicker(_dateRangeOpt);
		} else if(_fieldRole == 'richEdit'){
			var _richEditOpt = opts.fieldOpts[_fieldName] || {};
			formField.summerNote(_richEditOpt);
			if(opts.initClear){
				formField.summernote('reset');
			}
			if(isInitValue){
				formField.summernote('code',formField.data('original'));
			}
		}else if(_fieldRole == 'file'){
			var _fileOpt = opts.fieldOpts[_fieldName] || {};
			formField.fileUpload(_fileOpt);
		}

	}
	//初始化表单字段值 
	function _init_field_value(opts,formField){
		var _fieldName = formField.attr('name');
		var _fieldRole = formField.attr('form-role');
		var _fieldValue = opts.formData[_fieldName];
		if(_fieldName.indexOf(".") > 0){
			var _fieldNameSp = _fieldName.split(".");
			_fieldValue = opts.formData[_fieldNameSp[0]];
			for(var i=1;_fieldValue && i<_fieldNameSp.length;i++){
				_fieldValue = _fieldValue[_fieldNameSp[i]]
			}
		}
		if(_fieldValue != undefined){
			if(formField.attr('type') == 'checkbox'){
				var _checked = (_fieldValue == ((formField.data('on-value') !== undefined) ? formField.data('on-value')+'' : '1'));
				formField.attr('checked',_checked);
				if(formField.hasClass('bs-switch')){
					formField.bootstrapSwitch('state', _checked);
					formField.trigger("switch:change", [_checked]);//强制触发change方法赋值
				}
			}else if(_fieldRole == 'file'){

			}else if(_fieldRole == 'date'){
			}else{
				formField.val(_fieldValue).trigger("change");
			}
			//记录该字段的初始值,验证唯一性和初始化特殊控件（summernode）使用
			formField.data("original",_fieldValue);
		}else if(formField.data("init")) {
			formField.val(formField.data("init"));
		}
	}
	/**
	 * 初始化form
	 * @param  {Object} options 初始化参数
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	$.fn.initForm = function (options,callback,errorback) {
		var _this = $(this);

		var opts = $.extend(true,{
			ajax:true,//ajax方式提交
			submitClear : true, //submit之后是否清空数据
			initClear : true,//form初始化时是否清空数据
			dataType : 'json',//返回数据方式
			type : 'post',//提交方式
			includeHidden : true,//是否包含hidden字段
			validate : validate_default_settings,//合法验证配置,jquery.validate配置对象
			fieldOpts:{},//字段初始化对象
			autoClose : false,//form显示在modal中是否在submit后自动关闭modal
			rules : null,//字段验证规则
			formData : null,//form初始化数据，一般为修改form初始化字段值
			url:_this.attr('action'),//form提交url
			submitJson : false,//=true则为扁平json方式提交form,针对springmvc使用@RequestBody注解的参数
			initComplete : null, //form初始化完成后执行
			beforeInit :  null //form初始化之前执行

		},options);

		if(typeof opts.beforeInit === 'function') opts.beforeInit.call(this,opts);
		if(opts.initClear)_this.clearForm(true); //静态modal中的form 先清空再初始化
		_this.validate(opts.validate);//.resetForm();//验证规则
		var isInitValue = !APP.isEmpty(opts.formData);//是否初始化表单值
		_this.find(opts.fieldSelector ? opts.fieldSelector : '*[name]').each(function(){
			var formField = $(this);
			if(isInitValue){
				_init_field_value(opts,formField);
			}else{
				formField.removeData("original");
			}
			_init_field(opts,_this,formField,isInitValue);
			
		});

		//表单显示位置,返回提示使用
		var _in_modal = (_this.parents('.modal').size() > 0) ? _this.parents('.modal').get(0) : APP.getPageContainer(_this);
	    //表单提交url初始化-
		var _form_url = opts.url;
		var _srv,_url;
		if(!APP.isEmpty(_form_url)) {
			_srv = API.getServerByUrl(_form_url);
			_url = _srv.getUrl(_form_url);
			opts.url = _srv.srvUrl + _url;
		}
		//表单中存在文件控件，如果opts.formData直接使用则会导致jquery.form插件无法识别文件提交失败
		if($('input[type=file]:enabled', _this).length > 0){
			opts.formData = null;
		}
		//ajax表单初始化
		var form_opt = $.extend(true,{
			beforeSend : function(request){
				if(!opts.headers){
					return API.createHeader(_srv,_url,request,errorback);
				}
			},
			beforeSubmit : function(formData, jqForm, options){
				//没有定义url则直接调用回调函数
				if(APP.isEmpty(opts.url)) {
					_form_submit_success(_formData2Object(formData),opts,_this,_in_modal,callback);
					return false;
				}
				//本地数据返回不修改任何數據
				if(_srv.isLocalData){
					_local_data_submit(opts,_this,_form_url,_in_modal,callback,errorback);
					return false;
				}
				//spring @RequestBody对于form提交的字符解析有问题，暂时使用json提交代替form提交
				if(opts.queryForm){
					APP.blockUI({target:_in_modal,message:opts.onSubmitMsg || "查询中",gif : 'form-submit'});
					_json_data_submit(opts,_this,_form_url,formData,_in_modal,callback,errorback,true);
					return false;
				}else{
					APP.blockUI({target:_in_modal,message:opts.onSubmitMsg || "提交中",gif : 'form-submit'});
					/*针对spring @RequestBody对于form提交的字符解析有问题，使用两种提交方式*/
					/*使用@RequestBody注解的参数使用json方式  设置opts.submitJson为true*/
					/*表单中如果有明细对象（表格），也使用json提交*/
					if(opts.submitJson){
						//提取表单中的表格数据
						if(jqForm.find("table.datatable[data-form]").length > 0){
							require(['app/datatables'],function(DT){
								jqForm.find("table.datatable[data-form]").each(function(){
									formData.push({"name":$(this).data('form'),"value":$(this).dataTable().api().tableData()});
								})
								_json_data_submit(opts,_this,_form_url,formData,_in_modal,callback,errorback,false);
							});
						}else{
							_json_data_submit(opts,_this,_form_url,formData,_in_modal,callback,errorback,false);
						}
						return false
					}
					return true;
				}
			},
			error:function(error){
				console.error(error);
				APP.unblockUI(_in_modal);
				APP.notice('',"系统错误["+error.status+"] "+error.statusText,'error',_in_modal);
				if(typeof errorback === 'function')errorback(error);
				else if(opts.onError) opts.onError(error);
			},
			success:function(resp, status){
				var response = _srv.resp(resp);
				if(APP.debug)console.log(response);
				APP.unblockUI(_in_modal);
				if(API.isError(response)){
					if(API.isUnAuthorized(response)){
						if(_srv.useLoginForm) {
							API.showLogin();
						}else{
							API.backLogin(_srv,null,_this.get());
						}
						return;
					}
					APP.notice('',API.respMsg(response),'warning',_in_modal);
					if(typeof errorback === 'function')errorback.call(this,response,status);
					else if(typeof opts.onError  === 'function') opts.onError.call(this,response,status);
				}else{
					_form_submit_success(response,opts,_this,_in_modal,callback);
				}
			}
		},opts);
		//已初始化标记
		_this.data("form-init",true);
		if(form_opt.ajax) _this.ajaxForm(form_opt);
		//初始化完成回调
		if(typeof opts.initComplete === 'function') opts.initComplete.call(this,opts);
	}
	/*json方式提交form*/
	function _form_submit_success(response,opts,_form,_in_modal,callback){
		if(!APP.isEmpty(opts.url)) {
			APP.notice('',API.respMsg(response),'success',_in_modal,opts.autoClose);
		}else{
			opts.submitClear = true;
		}
		if(opts.submitClear) {
			_form.clearForm(true);
			//file控件在提交清空后由于hidden发生变化需要重新初始化
			_form.find("input[form-role='file']:hidden").each(function(){
				$(this).fileUpload(opts.fieldOpts[$(this).attr('name')] || {});
			});
			//summernote控件在提交清空后需要手动清空
			_form.find("[form-role='richEdit']").each(function(){
				$(this).summernote('reset');
			});
			//细表数据清空
			require(['app/datatables'],function(DT) {
				_form.find("table.datatable[data-form]").each(function () {
					$(this).dataTable().api().clear().draw();
				})
			});
		}
		//动态更新规格，否则会造成重复提交验证不通过
		_form.find('.checkExists').each(function(){
			var _c_form_field = $(this);
			var _c_field_name = _c_form_field.attr('name');
			if(opts.rules && opts.rules[_c_field_name] && opts.rules[_c_field_name].checkExists){
				_c_form_field.rules( "remove","checkExists");
				opts.rules[_c_field_name].checkExists.original = _c_form_field.val();
				_c_form_field.rules( "add", opts.rules[_c_field_name]);
			}
		});
		if(typeof callback === 'function'){
			if(!APP.isEmpty(opts.url)) {
				callback.call(this,API.respData(response));
			} else {
				callback.call(this,response);
				if(_in_modal != 'body') $(_in_modal).modal('hide');
			}

		} else if(typeof opts.onSuccess === 'function'){
			opts.onSuccess.call(this,API.respData(response));
		}
	}
	/*formData转为json对象,暂时只支持扁平json，多表关联字段（如dept.id）类型还没有实现解析*/
	function _formData2Object(formData){
		var params = {};
		for(var i=0;i<formData.length;i++){
			params[formData[i].name] = formData[i].value;
		}
		return params;
	}
	//form中带有细表数据
	//服务器不支持 multipart/form-data 方式的提交时使用(springmvc @RequestBody注解的参数)
	function _json_data_submit(opts,_form,_form_url,formData,_in_modal,callback,errorback,_is_query){
		if(_form.valid()){
			API.ajax(_form_url,_formData2Object(formData),true,function(data){
				APP.unblockUI(_in_modal);
				if(_is_query){
					if(typeof callback === 'function')callback.call(this,API.respData(data));
				}else{
					_form_submit_success(data,opts,_form,_in_modal,callback);
				}
			},function(err,status){
				APP.unblockUI(_in_modal);
				APP.notice('',API.respMsg(err),'warning',_in_modal);
				if(typeof errorback === 'function')errorback(err);
				else if(opts.onError) opts.onError(err);
			});
		}
	}
	/*本地测试数据提交*/
	function _local_data_submit(opts,_form,_form_url,_in_modal,callback,errorback){
		APP.blockUI({target:_in_modal,message:opts.onSubmitMsg || "提交中",gif : 'form-submit'});
		if(_form.valid()){
			API.ajax(_form_url,{},true,function(data){
				APP.unblockUI(_in_modal);
				if(opts.queryForm){
					if(typeof callback === 'function')callback.call(this,API.respData(data));
				}else{
					if(API.isError(data)){
						APP.notice('',API.respMsg(data),'warning',_in_modal);
						if(typeof errorback === 'function')errorback.call(this,data);
						else if(opts.onError) opts.onError(data);
					}else{
						APP.notice('',API.respMsg(data),'success',_in_modal,opts.autoClose);
						if(typeof callback === 'function')callback.call(this,API.respData(response));
						else if(typeof opts.onSuccess === 'function') opts.onSuccess.call(this,API.respData(response));
					}
				}
			},function(err,status){
				APP.unblockUI(_in_modal);
				APP.notice('',API.respMsg(err),'warning',_in_modal);
				if(typeof errorback === 'function')errorback(err);
				else if(opts.onError) opts.onError(err);
			});
		}
	}

	//------------------------下拉列表----------------------
	//初始化下拉列表语言
	var select2_language =  {
		errorLoading: function () {return '无法载入结果。';},
		inputTooLong: function (args) {
			var overChars = args.input.length - args.maximum;
		    var message = '请删除' + overChars + '个字符';
		    return message;
		},
		inputTooShort: function (args) {
			var remainingChars = args.minimum - args.input.length;
		    var message = '请再输入至少' + remainingChars + '个字符';
		    return message;
		},
		loadingMore: function () {return '载入更多结果…';},
		maximumSelected: function (args) {
			var message = '最多只能选择' + args.maximum + '个项目';
		      return message;
		},
		noResults: function () {return '未找到结果';},
		searching: function () {return '搜索中…'; }
	};
	//select2下拉列表默认设置
	var select2_default_opts = {
		language: select2_language,
		placeholder: {id:"-1",text:"请选择..."},
		maximumSelectionLength: 50, //多选最多选择个数
		allowClear:true,//自动显示清除按钮
		width:"100%" 
	};
	
	/**
	 * select2下拉列表
	 * @param  {Object} opts select2参数,自定义参数如下
	 * jsonData[服务器或静态json文件(static/src/jsons/下)的url] 
	 * stmID[sqlMap语句ID] 
	 * url[服务器url实时获取数据(搜索框实时发送请求)]
	 * 
	 * @return {Object} select控件
	 */
	function _clear_select_validate(select){
		if(select.val() != '-1' && select.val() != ''){
			select.closest('.form-group').removeClass('has-error');
			select.siblings("span#"+select.attr("id")+"-error").remove();
			select.siblings("i.validate-icon").removeClass("fa-check fa-warning").removeAttr("data-original-title");
		}
	}
	function _fill_options(_select,opt_data){
		_select.empty();
		if($.isArray(opt_data)){
			for(var i=0;i<opt_data.length;i++){
				_select.append("<option value='"+opt_data[i].id+"'>"+opt_data[i].text+"</option>");
			}
		}
		_select.change();
		_clear_select_validate(_select);
	}
	function _get_options_data(opts){
		var url = opts.dataUrl || API.urls.stmListUrl;
		var paramData = {};
		if(opts.stmID) url += ("/" + opts.stmID+_CONFIG.HTTP.SUFFIX);
		if(opts.param) paramData.param=opts.param;
		if(opts.paramData) paramData = opts.paramData;
		var _data = API.jsonData(url,paramData);
		if(opts.idProperty || opts.textProperty){
			if($.isArray(_data)){
				for(var i=0;i<_data.length;i++){
					if(opts.idProperty) _data[i].id = _data[i][opts.idProperty];
					if(opts.textProperty) _data[i].text = _data[i][opts.textProperty];
				}
			}else if(!APP.isEmpty(_data)){
				if(opts.idProperty) _data.id = _data[opts.idProperty];
				if(opts.textProperty) _data.text = _data[opts.textProperty];
			}

		}
		return _data;
	}
	$.fn.select = function ( options ) {
		var _select = $(this);
		var opts = options || {};
		select2_default_opts.data = null;
		select2_default_opts.ajax = null;

		if((opts.jsonData||opts.stmID||opts.dataUrl) && opts.data === undefined){//增加jsonData选项获取静态.json文件或者直接通过sqlMapper的sqlID获取数组数据
			if(APP.isEmpty(opts.param)) opts.param = {};
			if(_select.data("parent-for")){
				var _parent_sel = $(_select.data("parent-for"));
				opts.param[_parent_sel.attr("name").replace(".","_")] = _parent_sel.val();//替换参数中的. 否则mapper文件会无法识别
			}

			if(opts.jsonData && opts.jsonData != ""){
				opts.data = API.localData(opts.jsonData);
			}else{
				opts.data = _get_options_data(opts);
			}

		}else if(opts.url && opts.ajax === undefined){//默认ajax方法
			opts.ajax = {
				delay: 250,
				url : opts.url,
				data: function (params) {
					var queryParameters = {
						q: params.term
					}
					return queryParameters;
				}
			};
		}
		//允许增加选项
		if(opts.allowAdd || _select.data("allow-add")){
			if(_select.parent('.input-group').length > 0){
				_select.nextAll(".input-group-btn").remove();
				_select.unwrap();
			}
			var _add_btn_id = "select-add-btn-"+new Date().getTime();
			var _add_btn = $("<span class='input-group-btn' id='"+_add_btn_id+"'><a class='btn blue'><i class='fa fa-plus'></i></a></span>");
			_select.wrap("<div class='input-group'></div>");
			_add_btn.insertAfter(_select);
			_add_btn.click(function(){
				var _this = $(this);
				var _adddiv = $("<div>");
				var _addform = $("<div class='row'><div class='col-md-12'><div class='form-group'><label class='control-label col-md-3'>代码</label><div class='col-md-9'><input type='text' name='_select_type_code' class='form-control input-small'></div></div></div></div>"+
					"<div class='row'><div class='col-md-12'><div class='form-group'><label class='control-label col-md-3'>名称</label><div class='col-md-9'><input type='text' name='_select_type_name' class='form-control input-small'></div></div></div></div>"+
					"<a class='btn blue btn-block'> <i class='fa fa-plus'></i> 增加 </a>");
				_adddiv.append(_addform);
				_adddiv.children(".btn").click(function(){
					var _code = _adddiv.find("input[name='_select_type_code']").val();
					var _name = _adddiv.find("input[name='_select_type_name']").val();
					if($.trim(_code) == "" || $.trim(_name) == ""){
						_adddiv.closest(".popover").removeClass("info").addClass("error");
						_adddiv.closest(".popover-content").prev().html("<i class='fa fa-plus'/> 代码或名称不能为空");
						return;
					}
					if(_select.children("option[value='"+_code+"']").length > 0){
						_adddiv.closest(".popover").removeClass("info").addClass("error");
						_adddiv.closest(".popover-content").prev().html("<i class='fa fa-plus'/> 代码已存在")
						return;
					}
					_adddiv.closest(".popover").removeClass("error");
					_select.append("<option value='"+_code+"'>"+_name+"</option>");
					_select.val(_code).trigger("change");
					_this.popover('destroy');
				})
				APP.popover(_this,_adddiv.get(),"info","fa-plus","增加选择","auto right",235);
			});
		}
		var default_opt = $.extend(true,{},select2_default_opts,opts);
		_select.select2(default_opt);
		if(_select.data("original") || _select.data("init")) _select.val((_select.data("original") || _select.data("init"))).trigger("change");
		else _select.val(_select.val()).trigger("change");
		//避免单页面时重复执行事件
		if(APP.isEmpty(_select.data("event-init"))){
			_select.on("select2:select", function (e) {
				_clear_select_validate(_select);
			});
		}

		//级联下拉框
		if(_select.data("parent-for") && APP.isEmpty(_select.data("event-init"))){//避免单页面时重复执行事件
			$(_select.data("parent-for")).on("change",function(){
				opts.param[$(this).attr("name").replace(".","_")] = $(this).val(); //替换参数中的. 否则mapper文件会无法识别
				_fill_options(_select,_get_options_data(opts));
			});
		}
		_select.data("event-init","init");
		
		return _select;
	};
	
	FORM.getSelectedVal = function(sel){
		return $(sel).val();
	}
	FORM.getSelectedText = function(sel){
		return $(sel).find("option:selected").text();
	}
	/**
	 * 基于ztree的treeSelect
	 * 定义了默认的onClick方法
	 * @param  {Object} settings ztree参数
	 * @param  {String} treeId ztree控件ID
	 */
	$.fn.treeSelect = function(settings){
		var _this = $(this);
		var treeId = _this.attr('id');
		var _parent = _this.parent();
		var _sel_name = _this.attr("name");
		//保存ID的隐藏控件
		var _id_filed = _this.prevAll("input[data-id-for='"+_sel_name+"']");
		if(_id_filed.length == 0){
			alert("请在treeSelect元素之前添加id值控件");
			return _this;
		}
		//保存treeSort的隐藏控件,用于树形排序(祖先节点sort-id)
		var _tree_filed = _this.prevAll("input[data-tree-for='"+_sel_name+"']");
		
		var _key_id = "id";
		var _key_name = "name";
		var _key_parent = "pId";
		var _key_sort = "sort";
		//自定义id、pid、name属性名称
		if(!APP.isEmpty(_this.attr('tree-key-id')))_key_id = _this.attr('tree-key-id');
		if(!APP.isEmpty(_this.attr('tree-key-name')))_key_name = _this.attr('tree-key-name');
		if(!APP.isEmpty(_this.attr('tree-key-pid')))_key_parent = _this.attr('tree-key-pid');
		if(!APP.isEmpty(_this.attr('tree-key-sort')))_key_sort = _this.attr('tree-key-sort');
		if(settings && settings.data ){
			if(settings.data.key && settings.data.key.name) _key_name = settings.data.key.name;
			if(settings.data.simpleData){
				if(settings.data.simpleData.idKey) _key_id = settings.data.simpleData.idKey;
				if(settings.data.simpleData.pIdKey) _key_parent = settings.data.simpleData.pIdKey;
			}
		}
		require(['app/tree'],function(){
			
			//为当前控件增加必要的显示控件和树形下拉菜单
			var inputGroup = $("<div class='input-group'></div>");//为当前控件增加图标
			var inputIconDiv = $("<div class='input-icon'>");
			var inputIcon = $("<i class='fa fa-times fa-fw'></i>");
			inputIconDiv.append(inputIcon);
			var selBtn = $("<span class='input-group-btn' style='cursor: pointer;'><button class='btn btn-success' type='button'><i class='fa fa-list'></i></span>");//图标-点击显示下拉菜单
			inputIconDiv.append(_this);
			_this.css("cursor","pointer");
			//_this.appendTo(inputIconDiv);//将当前控件放入input-group
			inputGroup.append(inputIconDiv);
			inputGroup.append(selBtn);//增加图标
			
			_parent.append(inputGroup);//将input-group放入当前控件原父节点
			var menuContent = $("<div id='"+treeId+"_MenuContent' style='display:none;height: 150px;overflow-y: auto; background-color: #F5F5F5;'></div>");//下拉菜单显示层
			var treeSel = $("<ul id='"+treeId+"' class='ztree treeSelect' style='margin-top:0; width:100%;'></ul>");//ztree控件
			menuContent.append(treeSel);//将树形放入下拉菜单显示层
			_parent.append(menuContent);//将下拉菜单显示层放入当前节点原父节点
			
			var treesel_settings = $.extend(true,{
				data : {
					key : {name : _key_name},
					simpleData: {
						enable: true,
						idKey: _key_id,
						pIdKey: _key_parent
					}
				},
				callback: {
					onClick: function(e, tree_id, treeNode){//点击时将数据传入显示控件
						var zTree = $.fn.zTree.getZTreeObj(tree_id),
						nodes = zTree.getSelectedNodes(),
						_name = "",
						 _id = "";
						nodes.sort(function compare(a,b){return a[_key_id]-b[_key_id];});
						for (var i=0, l=nodes.length; i<l; i++) {
							_name += nodes[i][_key_name] + ",";
							_id += nodes[i][_key_id] + ",";
						}
						if(_tree_filed.length == 1 ){ //如果为单选且页面定义了parentTree隐藏域,则为parentTree赋值
							var _tree_sort = "";
							if(!APP.isEmpty(treeNode[_key_sort])) _tree_sort = treeNode[_key_sort] + "-" + treeNode[_key_id];
							else _tree_sort = "0-" + treeNode[_key_id];
							
							if(!APP.isEmpty(treeNode['parentTree'])) _tree_sort = treeNode['parentTree'] + "," + _tree_sort;
							else if(!APP.isEmpty(treeNode['parent_tree'])) _tree_sort = treeNode['parent_tree'] + "," + _tree_sort;
							_tree_filed.val(_tree_sort);
						}
						if (_name.length > 0 ) _name = _name.substring(0, _name.length-1);
						if (_id.length > 0 ) _id = _id.substring(0, _id.length-1);
						_this.val(_name);
						//validate字段去除
						_this.closest('.form-group').removeClass('has-error');
						_this.parent().siblings("span#"+_this.attr("id")+"-error").remove();
						_this.parent().siblings("i.validate-icon").removeClass("fa-check fa-warning").removeAttr("data-original-title");
						_id_filed.val(_id);
						inputIcon.css('color','red');
						if (settings.onClick) {
				        	settings.onClick.toFunc().call(this, e, tree_id, treeNode);
				        }
					},
					onAsyncSuccess : function(e, tree_id, treeNode, msg){//数据同步成功后显示默认值
						if(treeNode === undefined){//根节点同步时显示默认值
							var zTree = $.fn.zTree.getZTreeObj(tree_id);
							if(_id_filed.attr('value')){
								var _selectedNode = zTree.getNodeByParam(_key_id,_id_filed.attr('value'),null);
								zTree.selectNode(_selectedNode);
								if(_selectedNode) {
									_this.val(_selectedNode[_key_name]);
									inputIcon.css('color','red');
								}
							}
						}
						if (settings.onAsyncSuccess) {
				        	settings.onAsyncSuccess.toFunc().call(this, e, tree_id, treeNode,msg);
				        }
					}
				}
			},settings);
			
			/**
			 * 树形下拉列表隐藏-for-treeSelect
			 * @param  {String} content 下拉列表显示DIV的ID
			 */
			function _treeSelect_hideMenu(content) {
				$("#"+content).fadeOut("fast");
				$("body").unbind("mousedown", _treeSelect_onBodyDown);
			}
			/**
			 * 树形下拉列表触发隐藏点击事件-for-treeSelect
			 * @param  {Object} event 事件对象-传入了menuContentID(下拉列表显示DIV的ID)数据
			 */
			function _treeSelect_onBodyDown(event) {
				if (!(event.target.id == event.data.menuContentID || $(event.target).parents("#"+event.data.menuContentID).length>0)) {
					_treeSelect_hideMenu(event.data.menuContentID);
				}
			}
			//显示树形下拉菜单
			function _treeSelect_showMenu(){
				if(menuContent.css("display") == "none"){
					var offset = _this.offset();
					menuContent.css({width: + offset.width + "px",left:offset.left + "px", top:offset.top + _this.outerHeight() + "px"}).slideDown("fast");
					$("body").bind("mousedown",{menuContentID:treeId+"_MenuContent"}, _treeSelect_onBodyDown);
				}
			}
			//点击显示树形下拉菜单
			selBtn.click(function() {
				_treeSelect_showMenu();
			});
			//回车显示
			_this.keypress(function(e){
				if(e.keyCode == 13) _treeSelect_showMenu();
			});
			_this.click(function() {
				_treeSelect_showMenu();
			});
			//删除数据
			inputIcon.click(function() {
				_this.val('');
				_id_filed.val('');
				if(_tree_filed.length == 1 ){
					_tree_filed.val('');
				}
				$(this).css('color','#ccc');
			});
			var _treeObj = treeSel.tree(treesel_settings); 
			_this.treeObj = _treeObj;
			
		});
		return _this;
	};

	$.fn.typeaHead = function(options){
		var default_settings = $.extend(true,{autoSelect: true},options);
		var input_obj = $(this);
		input_obj.typeahead(default_settings);
	}
	/**
	 * 基于summernote的富文本编辑器
	 * 定义了默认的onImageUpload回调方法和默认参数
	 * @param  {Object} options summernote参数
	 */
	$.fn.summerNote = function(options){
		var _this = $(this);
		var default_settings = $.extend(true,{
			toolbar: [
				['style', ['bold', 'italic', 'underline','color', 'clear','strikethrough', 'superscript', 'subscript','fontsize','height']],
				['para', ['ul', 'ol', 'paragraph']],
				['insert', ['picture','link','video','table','hr']],
				['misc', ['undo','redo','codeview']]
			],
			lang : 'zh-CN',
			placeholder : _this.data('placeholder') || '',
			minHeight : 200,
			dialogsFade : true,// Add fade effect on dialogs
			dialogsInBody : true,// Dialogs can be placed in body, not in
			disableDragAndDrop : true,// default false You can disable drag
			callbacks : {
				onImageUpload : function(files) {
					var _srv = API.getServerByKey(options.fileServer);
					var formData = new FormData();
					formData.append('file',files[0]);
					API.uploadFile(_srv,formData,{type:'_rich_edit_',ownerid:APP.getUniqueID('565')},function(fileRet){
						_this.summernote('insertImage', _srv.fileSrvUrl + fileRet.url, function ($image) {
							$image.css({'width': $image.width() / 3,'height':$image.height() / 3});
							$image.attr('data-fileid', fileRet.id);
						});
					});
				}
			}
		},options);
		_this.summernote(default_settings);

	}

	function _parse_file(response,_srv,_files_box,options,errorback){
		if(API.isError(response)){
			if(API.isUnAuthorized(response)){
				if(_srv.useLoginForm) API.showLogin();
				else API.backLogin(_srv);
				return;
			}
			APP.notice('',API.respMsg(response),'warning');
			if(typeof errorback === 'function')errorback.call(this,response);
		}else{
			var ret = API.respData(response);
			if($.isArray(ret)){
				for(var i=0;i<ret.length;i++){
					if(i > options.maxFiles) break;
					_append_files(_srv,ret[i],_files_box,options);
				}
			}else{
				if(options.savePath)
					_files_box.children("input[form-role='file']:hidden").val(_srv.fileSrvUrl+ret.url);
				_append_files(_srv,ret,_files_box,options);
			}
			if(_files_box.find('div.file').length >= options.maxFiles){
				_files_box.find('.fileinput-button').hide();
			}else{
				_files_box.find('.fileinput-button').show();
			}
		}
	}
	function _append_files(_srv,ret,_files_box,options){

		var _file_div = $("<div class='col-md-"+options.col+" file'><span class='badge badge-danger drop-file'> &times; </span></div>");
		_files_box.children(".file-upload-zone").prepend(_file_div);

		_file_div.children("span.drop-file").click(function(){
			API.ajax(_srv.getFileDropUrl(ret),ret,true,function(resp){
				_file_div.remove();
				if(_files_box.find('div.file').length < options.maxFiles){
					_files_box.find('.fileinput-button').show();
				}
			});
		});
		var _file_dis_name = ret.name.length > options.col*5 ?  ret.name.substr(0,options.col*5-2) + '...' : ret.name;

		if(/\.(GIF|JPG|JPEG|PNG)$/.test(ret.name.toUpperCase())){//匹配图片
			_file_div.prepend("<a href='"+_srv.fileSrvUrl+ret.url+"' data-rel='"+ret.type+
				"' class='thumbnail image-box-button' data-title='"+ret.name+"'>"+
				"<img src='"+_srv.fileSrvUrl+ret.url+"' alt='"+ret.name+"'><span class='file-name' title='"+ret.name+"'>"+_file_dis_name+"</span></a>");
			APP.initImagebox(_file_div);

		}else{
			_file_div.prepend("<a href='"+_srv.fileSrvUrl+ret.url+"' target='_blank' class='thumbnail'>"+
				"<i class='fa fa-file'></i> <span class='file-name' title='"+ret.name+"'>"+_file_dis_name+"</span></a>");
		}

	}
	/**
	 * 基于jquery file upload的文件上传控件
	 * @param  {Object} options fileupload参数
	 */
	$.fn.fileUpload = function(options,errorback){
		var _this = $(this);
		var _files_box = _this.closest("div.files-box");
		if(_files_box.length != 1){
			alert("文件上传控件没有class为files-box的div父标签");
			return;
		}
		//最大文件显示和上传数，如超过则隐藏上传按钮，默认5
		if(options.maxFiles == undefined)  options.maxFiles = 5;
		//文件显示宽度 div class=col-md-4
		if(options.col == undefined) options.col = 4;
		//隐藏文件字段保存图片路径(表中的file字段为路径),只能保存一个文件
		if(options.savePath) options.maxFiles = 1;
		//文件上传控件
		var _srv = API.getServerByKey(options.fileServer);
		//文件上传后保存文件所有者id的隐藏控件--必须
		if(_this.attr("type") != 'hidden'){
			alert("文件上传控件必须为隐藏控件");
			return;
		}
		if(_files_box.children("div.file-upload-zone").length == 0){
			_files_box.append("<div class='row file-upload-zone'><div class='col-md-"+options.col+"'>" +
				"<a class='btn btn-primary fileinput-button'><input type='file' name='_upload_file_'>" +
				"选择文件 <i class='fa fa-upload fa-lg'></i> </a></div></div>");
		}

		var _file = _files_box.find("[name='_upload_file_']:file");

		var _file_upload_btn = _files_box.find('.fileinput-button');


		//编辑页面显示已上传的文件
		if(!APP.isEmpty(_this.data('original'))){
			var ownerid = _this.data('original');
			_this.val(ownerid);
			if(options.savePath){//保存文件url则ownerid失效，临时生成随机id，将url作为参数查询文件
				options.param.ownerid = APP.getUniqueID('200');
				options.param.path = ownerid.replace(_srv.fileSrvUrl,'');
				var params = _srv.getFileListParam(options.param);
				API.ajax(_srv.getFileListUrl(),params,true,function(resp){
					var response = _srv.respFile(resp);
					_parse_file(response,_srv,_files_box,options,errorback);
				});
			}else{
				options.param.ownerid = ownerid;
				var params = _srv.getFileListParam(options.param);
				API.ajax(_srv.getFileListUrl(params),params,true,function(resp){
					var response = _srv.respFile(resp);
					_parse_file(response,_srv,_files_box,options,errorback);
				});
			}

		}else{
			var ownerid = APP.getUniqueID('100');
			options.param.ownerid = ownerid;
			if(!options.savePath) _this.val(ownerid);
			_file_upload_btn.show();
		}

		require(['jquery/fileupload'],function(){
			var _upload_url = _srv.getFileUploadUrl(options.param || {});
			var _url = _srv.getUrl(_upload_url);
			var _err_msg = '';
			var default_settings = $.extend(true,{
				url: _srv.srvUrl + _url,
				dataType: 'json',
				maxFileSize : 4000000, //4 MB
				paramName : _srv.fileParamName,
				formData : function(form){
					var data = new FormData();
					data.append(_srv.fileParamName, _file);
					return data;
				},
				beforeSend : function(request){
					return API.createHeader(_srv,_url,request,errorback);
				},
				send : function(e,data){
					_file_upload_btn.hide();
					if(_files_box.find("[title='"+data.files[0].name+"']").length > 0){
						_err_msg = '相同名称文件已存在';
						return false;
					}
					return true;
				},
				done: function (e, data) {
					_file_upload_btn.show();
					var response = _srv.respFile(data.result);
					_parse_file(response,_srv,_files_box,options,errorback);

				},
				fail : function(e,data){
					_file_upload_btn.show();
					APP.notice('文件上传错误',data.textStatus||_err_msg,'error');
				},
				progressall: function (e, data) {
					var progressBar = APP.progressBar(_files_box);
					var progress = parseInt(data.loaded / data.total * 100, 10);
					progressBar.go(progress);
				}
			},options);
			_file.fileupload(default_settings)
				.prop('disabled', !$.support.fileInput)
				.parent().addClass($.support.fileInput ? undefined : 'disabled');
		})

	}
	function _initModalForm(mid,formOtps,submitback,errorback){
		var formModal = $(mid);
		var form = formModal.find('form');
		form.initForm(formOtps,function(data){
			if(typeof submitback === 'function') submitback.call(this,data,function(){formModal.modal('hide')});
			else formModal.modal('hide');
		},function(err){
			if(typeof errorback === 'function') errorback.call(this,err);
		});
	}
	FORM.queryForm = function(opts,queryback){
		var queryOtps = {"queryForm" : true,"url" : opts.url};
		if(opts.queryForm){
			$(opts.queryForm).initForm(queryOtps,function(data){
				if(typeof queryback === 'function') queryback.call(this,data);
			});
		}else if(opts.queryModal){
			var modalDefOpts = {
				title : "<i class='fa fa-search'/></i> 查询",
				clear : false,show : false,
				buttons : {"text" : "查询","classes" : "btn-primary",action : function(e,btn,modal){
					modal.find('form').submit();
				}}
			}
			var modalOpts = {};
			//只指定modal.id的静态modal
			if(typeof opts.queryModal === 'string'){
				modalOpts = $.extend(modalDefOpts,{id:opts.queryModal})
			}else if(typeof opts.queryModal === 'object'){//指定modal初始化参数
				modalOpts = $.extend(true,modalDefOpts,opts.queryModal);
			}
			APP.modal(modalOpts.id,modalOpts,function(){
				_initModalForm(modalOpts.id,queryOtps,queryback);
			});
		}
		
	}
	FORM.editForm = function(opts,editback,errorback){
		var formOtps = $.extend(true,{
			submitClear : false,initClear : true,autoClose : false
		},opts);
		if(opts.editForm){
			$(opts.editForm).initForm(formOtps,function(data){
				if(typeof editback === 'function') editback.call(this,data);
			},function(err){
				if(typeof errorback === 'function') errorback.call(this,data);
			});
		}else if(opts.editModal){
			formOtps.title = "<i class='fa fa-edit'/></i> " + (opts.title || "编辑");
			var modalDefOpts = {
				title : formOtps.title,
				show : true,
				buttons : {"text" : "保存","classes" : "btn-primary",action : function(e,btn,modal){
					modal.find('form').submit();
				}}
			}
			var modalOpts = {};
			//只指定modal.id的静态modal
			if(typeof opts.editModal === 'string'){
				modalOpts = $.extend(modalDefOpts,{id:opts.editModal})
			}else if(typeof opts.editModal === 'object'){//指定modal初始化参数
				modalOpts = $.extend(true,modalDefOpts,opts.editModal);
			}
			APP.modal(modalOpts.id,modalOpts,function(){
				_initModalForm(modalOpts.id,formOtps,editback,errorback);
			});
		}
		
	}
	$.fn.field = function(name){
		return $(this).find("[name='"+name+"']");
	}
	return FORM;
});

