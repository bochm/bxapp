
define('app/form',["app/common","moment","jquery/validate","jquery/form"],function(APP) {
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
	 * @param  {Function} callback  日期变化时调用的函数
	 */
	$.fn.datePicker = function(opts,callback){
		var _target = $(this);
		require(['bootstrap/datepicker'],function(){
			var default_opt = $.extend(true,{
				language:'zh-CN',autoclose: true,todayHighlight:true,format:'yyyy-mm-dd'
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
			var _default_date = default_opt.defaultDate ? default_opt.defaultDate : APP.formatDate('YYYY-MM-DD');
			_target.datepicker('update',APP.formatDate(default_opt.format.toUpperCase(),_default_date));
			_target.data('date-value',APP.formatDate('YYYY-MM-DD',_default_date));
			_target.datepicker().on(_event_type,function(e){
				if(_target.data('date-value') != APP.formatDate('YYYY-MM-DD',e.date)){
					_target.data('date-value',APP.formatDate('YYYY-MM-DD',e.date));
					if(typeof callback === 'function') callback(APP.formatDate('YYYY-MM-DD',e.date));
				}
			})
    	});
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
                }                
			},opts);
			_target.daterangepicker(default_opt,function(start, end, label){
				if(typeof callback === 'function'){
					callback(start, end, label);
	        	}else{
	        		_target.children('span').html(start.format('YYYY年MM月DD日') + ' - ' + end.format('YYYY年MM月DD日'));
	        		//$(target+' span')
	        	}
			});
			_target.children('span').html(moment().subtract('days', 29).format('YYYY年MM月DD日') + ' - ' + moment().format('YYYY年MM月DD日'));
			//$(target+' span').html(moment().subtract('days', 29).format('YYYY年MM月DD日') + ' - ' + moment().format('YYYY年MM月DD日'));
			
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
                icon.attr("data-original-title", error.text()).tooltip();
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
				paramData.param[joinField.attr("name")] = joinField.val();
				if(joinField.data("original") && joinField.data("original") != joinField.val()) {//当参与验证字段值发生变化的时候，则取消当前字段的初始值验证
					paramData.param["o_"+element.name] = "";
				}
			}
		}
		if(!APP.isEmpty(p.url)){
			return APP.postJson(p.url,paramData,false);
		}else{
			paramData.stmID = p.stmID || p.stmid || p.stmId;
			return APP.isEmpty(APP.postJson('/app/common/selectMapByStmID',paramData,false));
		}
		
	}, "已存在");
	
	/**
	 * 初始化form
	 * @param  {Object} opts 初始化参数
	 * @param  {Function} callback 成功回调函数
	 * @param  {Function} errorback 失败回调函数
	 */
	$.fn.initForm = function (opts,callback,errorback) {
		var _this = $(this);
		if(opts.autoClear)_this.clearForm(true); //静态modal中的form 先清空再初始化
		if(APP.isEmpty(opts)) opts = {};
		if(APP.isEmpty(opts.fieldOpts)) opts.fieldOpts = {};//fieldOpts表单元素的初始化参数
		var validate_settings = $.extend(true,validate_default_settings,opts.validate);
		var _validate = _this.validate(validate_settings);
		//_validate.resetForm();
		
		var isInitValue = !APP.isEmpty(opts.formData);
		var formField;
		_this.find(opts.fieldSelector ? opts.fieldSelector : '*[name]').each(function(){
			formField = $(this);
			var _fieldName = formField.attr('name');
			var _fieldRole = formField.attr('form-role');
			if(formField.data("init")) formField.val(formField.data("init"));

			if(isInitValue){
				var _fieldValue = opts.formData[_fieldName];
				if(_fieldName.indexOf(".") > 0){
					var _fieldNameSp = _fieldName.split(".");
					_fieldValue = opts.formData[_fieldNameSp[0]];
					for(var i=1;_fieldValue && i<_fieldNameSp.length;i++){
						_fieldValue = _fieldValue[_fieldNameSp[i]]
					}
				}
				if(_fieldValue != undefined){
					if(this.type == 'checkbox'){
						var _checked = (_fieldValue == ((formField.data('on-value') !== undefined) ? formField.data('on-value')+'' : '1'));
						formField.attr('checked',_checked);
						if(formField.hasClass('bs-switch')){
							formField.bootstrapSwitch('state', _checked);
							formField.trigger("switch:change", [_checked]);//强制触发change方法赋值
						}
					}else{
						formField.val(_fieldValue);
						if(formField.data("init")) formField.data("init",_fieldValue);
					}
					formField.data("original",_fieldValue);//记录该字段的初始值,验证唯一性使用
				}
			}else{
				formField.removeData("original");
			}
			
			//初始化js定义的验证规则,如有checkExists规则需要将original初始值作为入参
			if(opts.rules && opts.rules[_fieldName]){
				formField.rules( "remove");
				if(opts.rules[_fieldName].checkExists){
					opts.rules[_fieldName].checkExists.original = formField.val();
				}
				formField.rules( "add", opts.rules[_fieldName]);
			}
			
			if(_fieldRole == 'select'){
				var _selectOpt = opts.fieldOpts[_fieldName] || {};
				try{
					if(formField.attr('placeholder') && !isInitValue) _selectOpt.placeholder = JSON.parse(formField.attr('placeholder'));
				}catch(e){alert("placeholder属性值必须为json字符串");}
				if(formField.data('json')) _selectOpt.jsonData = formField.data('json');
				else if(formField.data('stmid')) _selectOpt.stmID = formField.data('stmid');
				else if(formField.data('dict-type')){
					_selectOpt.data = APP.getDictByType(formField.data('dict-type'));
					if($.isArray(_selectOpt.data)){
						for(var i=0;i<_selectOpt.data.length;i++){//select2使用text显示
							_selectOpt.data[i].id = _selectOpt.data[i].value;
							_selectOpt.data[i].text = _selectOpt.data[i].name;
						}
					}
					
				}
				formField.select(_selectOpt);
			}
			if(_fieldRole == 'treeSelect'){
				var _treeSelectOpt = opts.fieldOpts[_fieldName] || {};
				if(formField.data('stmid')) _treeSelectOpt.stmID = formField.data('stmid');
				if(!formField.attr('id')){
					alert("请指定treeSelect表单元素的id属性");
					return;
				}
				formField.treeSelect(_treeSelectOpt);
			}
			
		});
		
		
		
		var _in_modal = (_this.parents('.modal-dialog').size() > 0) ? '.modal-dialog' : '';
		//提交是初始化bean的提交类型  add save delete  对应BaseBean 的form_action属性
		if(opts.formAction){
			if(_this.children(":hidden[name='form_action']").size()>0){
				_this.children(":hidden[name='form_action']").val(opts.formAction);
			}else{
				_this.append("<input type='hidden' name='form_action' value='"+opts.formAction+"'>");
			}
		}
		opts.url = APP.ctx + opts.url;
		var form_opt = $.extend(true,{
			ajax:true,
			beforeSubmit : function(formData, jqForm, options){
				APP.blockUI({target:_in_modal ? '.modal-dialog' : 'body',message:'提交中',gif : 'form-submit'});
				return true;
			},
			type : 'post',
			dataType : 'json',
			includeHidden : true,
			error:function(error){
				if(APP.debug)console.log(error);
				APP.unblockUI(_in_modal ? '.modal-dialog' : 'body');
				APP.notice('',"系统错误 错误代码:"+error.status+" 错误名称:"+error.statusText,'error',_in_modal);
				if(typeof errorback === 'function')errorback(error);
				else if(opts.onError) opts.onError(error);
			},
			success:function(response, status){
				if(APP.debug)console.log(response);
				APP.unblockUI(_in_modal ? '.modal-dialog' : 'body');
				if(response.OK){
					APP.notice('',response[APP.MSG],'success',_in_modal);
					//动态更新规格，否则会造成重复提交验证不通过
					_this.find('.checkExists').each(function(){
						var _c_form_field = $(this);
						var _c_field_name = formField.attr('name');
						if(opts.rules && opts.rules[_c_field_name] && opts.rules[_c_field_name].checkExists){
							_c_form_field.rules( "remove","checkExists");
							opts.rules[_c_field_name].checkExists.original = _c_form_field.val();
							_c_form_field.rules( "add", opts.rules[_c_field_name]);
						}
					});
					if(typeof callback === 'function')callback(response[APP.DATA]);
					else if(opts.onSuccess) opts.onSuccess(response[APP.DATA]);
				}else{
					APP.notice('',response[APP.MSG],'warning',_in_modal);
					if(typeof errorback === 'function')errorback(response,status);
					else if(opts.onError) opts.onError(response,status);
				}
			}
		},opts);
		if(form_opt.ajax) _this.ajaxForm(form_opt);
	}
	
	
	/**
	 * form表单提交
	 * @param  {String} url form提交url
	 * @param  {Function} callback 回调函数
	 */
	$.fn.postForm = function(url,callback){
		var _form = $(this);
		if(_form.is('form')){
			$.ajax({ 
		        type:"POST", 
		        url:url, 
		        dataType:"json",      
		        contentType:"application/json",               
		        data:JSON.stringify(FORM.formToJson(_form)), 
		        success:function(ret,status){
		        	callback(result,status);
		        },
		        error:function(xhr){
		        	APP.notice('系统错误','错误代码['+xhr.status+'] 错误名称['+xhr.statusText+']','error');
		        }
			});
		}else
			alert("对象不是表单");
		  
	};
	
	
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
	function _fill_options(_select,opt_data){
		_select.empty();
		if($.isArray(opt_data)){
			for(var i=0;i<opt_data.length;i++){
				_select.append("<option value='"+opt_data[i].id+"'>"+opt_data[i].text+"</option>");
			}
		}
		_select.change();
	}
	$.fn.select = function ( opts ) {
		var _select = $(this);
		
		require(['jquery/select2'],function(){
			select2_default_opts.data = null;
			select2_default_opts.ajax = null;
			
			if(opts){
				if((opts.jsonData||opts.stmID) && opts.data === undefined){//增加jsonData选项获取静态.json文件或者直接通过sqlMapper的sqlID获取数组数据
					if(APP.isEmpty(opts.param)) opts.param = {};
					if(_select.data("parent-for")){
						var _parent_sel = $(_select.data("parent-for"));
						opts.param[_parent_sel.attr("name").replace(".","_")] = _parent_sel.val();//替换参数中的. 否则mapper文件会无法识别
					}
					var url = opts.url || APP.stmidListUrl;
					var type = "POST";
					if(opts.jsonData && opts.jsonData != ""){
						url = opts.jsonData;
						type = "GET";
					}
					var paramData = {};
					if(opts.stmID) paramData.stmID=opts.stmID;
					if(opts.param) paramData.param=opts.param;
					//同步方式防止数据量大是无法加载
					APP.ajax(url,paramData,type,false,function(ret){
						opts.data = ret;
					});
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
			var default_opt = $.extend(true,select2_default_opts,opts);
			_select.select2(default_opt);
			if(_select.data("original") || _select.data("init")) _select.val((_select.data("original") || _select.data("init"))).trigger("change");
			else _select.val(_select.val()).trigger("change");

			_select.on("select2:select", function (e) { 
				if(_select.val() != '-1' && _select.val() != ''){
					_select.closest('.form-group').removeClass('has-error');
					_select.siblings("span#"+_select.attr("id")+"-error").remove();
					_select.siblings("i.validate-icon").removeClass("fa-check fa-warning").removeAttr("data-original-title");
				}
			});
			//级联下拉框
			if(_select.data("parent-for")){
				$(_select.data("parent-for")).on("change",function(){
					opts.param[$(this).attr("name").replace(".","_")] = $(this).val(); //替换参数中的. 否则mapper文件会无法识别
					var url = opts.url || APP.stmidListUrl;
					var type = "POST";
					var paramData = {};
					if(opts.stmID) paramData.stmID=opts.stmID;
					if(opts.param) paramData.param=opts.param;
					//同步方式防止数据量大是无法加载
					APP.ajax(url,paramData,type,false,function(ret){
						_fill_options(_select,ret);
					});
					
				});
			}
			
		});
		
		return _select;
	};
	
	FORM.getSelectedVal = function(sel){
		require(['jquery/select2'],function(){
			return $(sel).val();
		})
	}
	FORM.getSelectedText = function(sel){
		require(['jquery/select2'],function(){
			return $(sel).find("option:selected").text();
		})
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
			var treeSel = $("<ul id='"+treeId+"' class='ztree' style='margin-top:0; width:100%;'></ul>");//ztree控件
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
									_this.attr('value',_selectedNode[_key_name]);
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
	
	return FORM;
});

