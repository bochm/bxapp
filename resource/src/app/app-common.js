/**
 * 通用工具
 */
define('app/common',['jquery','app/api','bootstrap','moment'],function($,API) {
	
	var brandColors = {
			'blue': '#89C4F4',
	        'red': '#F3565D',
	        'green': '#1bbc9b',
	        'purple': '#9b59b6',
	        'grey': '#95a5a6',
	        'yellow': '#F8CB00'
	};
	//模态窗口中 select2失去焦点问题
	$.fn.modal.Constructor.prototype.enforceFocus = function() {};
	//设置moment本地化
	var moment = require('moment');
	moment.locale("zh-cn");
	
	//客户端设备处理,device.js,去除blackberry、fxos、meego 检测
	var device = {};
	var _userAgent = window.navigator.userAgent.toLowerCase();
	function _findDevice(needle) {
		return _userAgent.indexOf(needle) !== -1;
	};
	device.ios = function () {return device.iphone() || device.ipod() || device.ipad();};
	device.iphone = function () {return !device.windows() && _findDevice('iphone');};
	device.ipod = function () {return _findDevice('ipod');};
	device.ipad = function () {return _findDevice('ipad');};
	device.android = function () {return !device.windows() && _findDevice('android');};
	device.androidPhone = function () {return device.android() && _findDevice('mobile');};
	device.androidTablet = function () {return device.android() && !_findDevice('mobile');};
	device.windows = function () {return _findDevice('windows');};
	device.windowsPhone = function () {return device.windows() && _findDevice('phone');};
	device.windowsTablet = function () {return device.windows() && (_findDevice('touch') && !device.windowsPhone());};

	if(! ('APP' in window) ){
		window['APP'] = {
			"isIE8" : false,
			"isIE9" : false,
			"isIE10": false,
			"isRTL" : false,
			"ctx" : _srv_url + _ctx,
			"debug" : _is_debug,
			"device" : device,
			"isMobile" :  (device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone()),
			"isTablet" : (device.ipad() || device.androidTablet() || device.windowsTablet()),
			"currentUrl" : "index",
			getParameterByName : function(name) {
		        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		            results = regex.exec(APP.currentUrl);
		        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		    },
	        
	        getURLParameter: function(paramName) {
	            var searchString = window.location.search.substring(1),
	                i, val, params = searchString.split("&");
	            for (i = 0; i < params.length; i++) {
	                val = params[i].split("=");
	                if (val[0] == paramName) {
	                    return unescape(val[1]);
	                }
	            }
	            return null;
	        },
	        
	        getViewPort: function() {
	            var e = window,
	                a = 'inner';
	            if (!('innerWidth' in window)) {
	                a = 'client';
	                e = document.documentElement || document.body;
	            }

	            return {
	                width: e[a + 'Width'],
	                height: e[a + 'Height']
	            };
	        },
	        log : function(obj){
	        	if(_is_debug) console.log(obj);
	        },
	        getUniqueID: function(prefix) {
	            return 'webapp_' + Math.floor(Math.random() * (new Date()).getTime());
	        },
	        isEmpty : function(v){
	        	return v === undefined || v === null || $.trim(v) === '';
	        },
	        jsPath:_app_js_base_url,
	        
	        imgPath:_app_img_base_url,
	        
	        queryContainer : _queryContainer,
	        /**
			 *moment日期格式化,也可以直接在程序中使用var moment = require('moment');
			 * @param  {String} patterm 转换日期格式 YYYYMMDD HH:mm:SS,更多格式http://momentjs.cn/docs/#/parsing/string-format/
			 * @param  {Date/String} d 需要转换的日期或字符串
			 * @param  {String} d_patterm 需要转换的字符串格式
			 */
	        formatDate : function(patterm,d,d_patterm){
	        	if(this.isEmpty(d))
	        		return moment().format(patterm);
	        	else if(this.isEmpty(d_patterm))
	        		return moment(d).format(patterm);
	        	else
	        		return moment(d,d_patterm).format(patterm);
	        },
			loadPage : function(target,url,data,callback,errorback){
				if(url){
					APP.blockUI({target:target,message:'页面加载中',});
					$.ajax({
			            type: "GET",
			            cache: false,
			            url: url,
			            data: data,
			            dataType: "html",
			            success: function(res) {
			            	APP.currentUrl = url;
			            	var _html = $(res);
		            		APP.initComponents(_html.get());
			            	APP.unblockUI(target);
			            	$(target).children().remove();
			            	$(target).append(_html);
			            	if(typeof callback === 'function'){
			            		callback(res);
			            	}
			            	if($('.loading-page').data("js-module")){
			            		require([$('.loading-page').data("js-module")],function(m){
			            			m.init(data);
			            		})
			            	}
			            	$('.loading-page').fadeIn('slow');
			            },
			            error: function(xhr, ajaxOptions, thrownError) {
			            	if(typeof errorback === 'function'){
				        		errorback(xhr.status,xhr.statusText);
			            	}else{
			            		APP.unblockUI(target);
				            	_sysError("页面加载错误:状态["+xhr.status+"]错误["+xhr.statusText+"]");
			            	}
			            	
			            }
			        });
				}
			},
			getResponsiveBreakpoint: function(size) {
	            // bootstrap 响应尺寸
	            var sizes = {
	                'xs' : 480, 
	                'sm' : 768,
	                'md' : 900, 
	                'lg' : 1200 
	            };
	            return sizes[size] ? sizes[size] : 0; 
	        },
	        //获取常用颜色
	        getColor: function(name) {
	            if (brandColors[name]) {
	                return brandColors[name];
	            } else {
	                return '';
	            }
	        },
	        //滚动条定位
	        scrollTo: function(el, offeset) {
	            var pos = (el && el.size() > 0) ? el.offset().top : 0;
	            if(el) {
	                if ($('body').hasClass('page-header-fixed')) {
	                    pos = pos - $('.page-header').height();
	                }
	                pos = pos + (offeset ? offeset : -1 * el.height());
	            }
	            $('html,body').animate({
	                scrollTop: pos
	            }, 'slow');
	        },
	        disableBtn : function(btn){
	        	if(btn.length == 0) return;
	        	if(!btn.hasClass('disabled')) btn.addClass('disabled');
	        	btn.attr('disabled','disabled');
	        },
	        enableBtn : function(btn){
	        	if(btn.length == 0) return;
	        	if(btn.hasClass('disabled')) btn.removeClass('disabled');
	        	btn.removeAttr('disabled');
	        },
	        initScroll: function(el,ct) {
	        	var _scrollbar = _queryContainer(ct).find(el);
	        	if(_scrollbar.length == 0) return;
	        	require(['jquery/scrollbar'],function(){
	        		_scrollbar.each(function() {
		                if ($(this).attr("data-scrolled")) return;
		                $(this).slimScroll({
		                    allowPageScroll: true,
		                    size: '7px',
		                    color: ($(this).attr("data-scroll-color") ? $(this).attr("data-scroll-color") : '#bbb'),
		                    wrapperClass: ($(this).attr("data-scroll-wrapper") ? $(this).attr("data-scroll-wrapper") : 'slimScrollDiv'),
		                    railColor: ($(this).attr("data-scroll-railcolor") ? $(this).attr("data-scroll-railcolor") : '#eaeaea'),
		                    position: APP.isRTL ? 'left' : 'right',
		                    height: ($(this).attr("data-scroll-height") ? $(this).attr("data-scroll-height") : $(this).css('height')),
		                    alwaysVisible: ($(this).attr("data-scroll-alwaysvisible") == "1" ? true : false),
		                    railVisible: ($(this).attr("data-scroll-railvisible") == "1" ? true : false),
		                    disableFadeOut: true
		                });
		                $(this).attr("data-scrolled", "1");
		            });
	        	});
	            
	        },

	        destroyScroll: function(el) {
	        	var _scrollbar = $(el);
	        	if(_scrollbar.length == 0) return;
	        	require(['jquery/scrollbar'],function(){
	        		_scrollbar.each(function() {
		                if ($(this).attr("data-scrolled") === "1") {
		                    $(this).removeAttr("data-scrolled");
		                    $(this).removeAttr("style");
		                    $(this).slimScroll({
		                        wrapperClass: ($(this).attr("data-scroll-wrapper") ? $(this).attr("data-scroll-wrapper") : 'slimScrollDiv'),
		                        destroy: true
		                    });
		                }
		            });
	        	});
	        },
	        //tab控件
	        initTab : function(ct,reload,defaultIdx){
	        	var _tab_toggle = _queryContainer(ct).find('a[data-toggle="tab"]');
	        	if(_tab_toggle.length == 0) return;
	        	_tab_toggle.data('show','0');
	        	_tab_toggle.parent('li').removeClass("active");
	        	_tab_toggle.on('show.bs.tab', function (e) {
	    	    	var _target = $(e.target);
	    	    	if(APP.isEmpty(_target.data('url'))){
	    	    		return;
	    	    	}
	    	    	if(_target.data('show') === '1') return;//只加载一次
	    	    	APP.loadPage(_target.attr('href'),_target.data('url'));
	    	    	if(reload) _target.data('show','0');
	    	    	else _target.data('show','1');
	    	    });
	        	var _default_idx = (defaultIdx !== undefined) ? defaultIdx : 0;
	        	
	        	if(!APP.isEmpty(_tab_toggle.eq(_default_idx).data('url'))){
	        		setTimeout(function(){//tab页在首次加载时需要延时，否则无法显示
	        			_tab_toggle.eq(_default_idx).tab('show');
	        		},10);
	        		
	        	}
	        },
	        //tooltip控件
	        initTooltip : function(ct){
	        	_queryContainer(ct).find('.tooltips').tooltip();
	        },
	        //popover控件
	        initPopover : function(ct){
	        	_queryContainer(ct).find('.popovers').popover();
	        },
	        //闪动提示
	        initPulsate : function(ct){
	        	var _pulsate = _queryContainer(ct).find('div.pulsate');
	        	if(_pulsate.length == 0) return;
	        	require(['jquery/pulsate'],function(){
	        		_pulsate.each(function(){
	        			var _this = $(this);
	        			_this.pulsate({
	                        color: _this.attr('pulsate-color') ?  _this.attr('pulsate-color') : '#C43C35',
	                        reach: 20,
	                        speed: 1000,
	                        pause: 0,
	                        glow: true,
	                        repeat: true,
	                        onHover: _this.attr('pulsate-hover')
	                    });
	        		});
	        	});
	        },
	        initSwitch : function(ct){	
	        	var _bs_switch = _queryContainer(ct).find('.bs-switch');
	        	if(_bs_switch.length == 0) return;
	        	require(['switch'],function(){
	        		_bs_switch.each(function(){
	        			var _this = $(this);
	        			_this.bootstrapSwitch('destroy');
	        			if(_this.data("dict-type")){//按字典数据初始化
	        				var _dict_data = API.getDictByType(_this.data("dict-type"));
	        				if($.isArray(_dict_data) && _dict_data.length == 2){
	        					_this.data("on-value",_dict_data[0].value);
	        					_this.data("on-text",_dict_data[0].name);
	        					_this.data("off-value",_dict_data[1].value);
	        					_this.data("off-text",_dict_data[1].name);
	        				}
	        			}
	        			_this.bootstrapSwitch({
	        				'state' : _this.is(":checked"),
	        				'onSwitchChange' : function(event, state){
	        					if(state) _this.val((_this.data('on-value') !== undefined) ? _this.data('on-value')+'' : '1');
	        					else _this.val((_this.data('off-value') !== undefined) ? _this.data('off-value')+'' : '0');
	        				 },
	        				 'onInit' : function(event, state){
	        					 if(state) _this.val((_this.data('on-value') !== undefined) ? _this.data('on-value')+'' : '1');
		        				 else _this.val((_this.data('off-value') !== undefined) ? _this.data('off-value')+'' : '0');
	        				 }
	        			});
	        			
	        		});
	        	});
	        },
	        //初始化控件
	        initComponents: function(target){
	        	
	        	APP.initTab(target,false);
	        	APP.initPopover(target);
	        	APP.initTooltip(target);
	        	APP.initPulsate(target);
	        	APP.initPortletPanel(target);
	        	APP.initDropdowns(target);
	        	APP.initScroll('.scroller',target);
	        	APP.initSwitch(target);
	        	//初始化提交按钮
	        	_queryContainer(target).find(".btn[data-submit]").each(function(){
	        		var _submit_btn = $(this);
	        		_submit_btn.click(function(){
	        			$(_submit_btn.data("submit")).submit();
	        		});
	        	});
	        }
		};
	}
	/**
	 * 查找dom
	 * @param  {Object} ct 需要查找的dom
	 */
	function _queryContainer(ct){
		if(APP.isEmpty(ct)) return $('body');
		if($(ct).length > 0) return $(ct);
		return $('body');
	}
	 /**
	 * 提示错误信息
	 * @param  {String} msg 错误信息
	 */
	function _sysError(msg){
		APP.notice("系统错误",msg,"error");
	}
	
	APP.loadPortlet = function(_portlet){
		var body = _portlet.children('div.portlet-body');
		if (_portlet.attr('data-url')) {
			APP.loadPage(body,_portlet.attr('data-url'));
        }
	}
	APP.setPortletTitle = function(_portlet,title){
		_portlet.find('span.caption-subject').html(title);
	}
	APP.removePortlet = function(_portlet){
		var body = _portlet.children('div.portlet-body');
		if ($('body').hasClass('page-portlet-fullscreen')) {
            $('body').removeClass('page-portlet-fullscreen');
        }
		_portlet.remove();
	}
    //Portlet工具栏
	function _handlePortlet(_portlet){
		var head = _portlet.children('div.portlet-title');
		var body = _portlet.children('div.portlet-body');
		//收起展开
		head.on('click','a.expand',function(e){
			e.preventDefault();
			if ($(this).hasClass("cls")) {
                $(this).removeClass("cls");
                body.slideDown(200);
            } else {
                $(this).addClass("cls");
                body.slideUp(200);
            }
		});
		//最大化
		head.on('click','a.fullscreen',function(e){
			e.preventDefault();
            if (_portlet.hasClass('portlet-fullscreen')) {
                $(this).removeClass('on');
                _portlet.removeClass('portlet-fullscreen');
                $('body').removeClass('page-portlet-fullscreen');
                _portlet.children('.portlet-body').css('height', 'auto');
                $(this).siblings('a.expand,close').removeClass('hide');
            } else {
                var height = APP.getViewPort().height -
                _portlet.children('.portlet-title').outerHeight() -
                    parseInt(_portlet.children('.portlet-body').css('padding-top')) -
                    parseInt(_portlet.children('.portlet-body').css('padding-bottom'));

                $(this).addClass('on');
                _portlet.addClass('portlet-fullscreen');
                $('body').addClass('page-portlet-fullscreen');
                _portlet.children('.portlet-body').css('height', height);
                $(this).siblings('a.expand,close').addClass('hide');
            }
		});
		//刷新
		head.on('click','a.reload',function(e){
			e.preventDefault();
			APP.loadPortlet(_portlet);
		});
		//删除
		head.on('click','a.remove',function(e){
			e.preventDefault();
			APP.removePortlet(_portlet);
		});
	}
	APP.initPortletPanel = function(ct){
		_queryContainer(ct).find(' div.portlet').each(function(){
			var _portlet = $(this);
			var _data_url = _portlet.attr('data-url');
			if(!APP.isEmpty(_data_url)){
				var _head = $("<div class='portlet-title'>");
				
				_head.append("<div class='caption'><i class='"+(_portlet.attr('panel-icon') ? _portlet.attr('panel-icon') : "fa fa-external-link")+"'></i>" + "<span class='caption-subject bold uppercase'>" + (_portlet.attr('panel-title') ? _portlet.attr('panel-title') : "") + "</span></div>");
				var _tools = _portlet.attr('panel-tools');
				
				if(_tools){
					var _headtools = $("<div class='tools'>");
					var toolList = _tools.split(",");
					for(var i=0;i<toolList.length;i++){
						_headtools.append("<a class='"+toolList[i]+"' href='#'></a>");
					}
					_head.append(_headtools);
				}else if(_portlet.children('div.actions').length > 0){
					_head.append(_portlet.children('div.actions'));
				}
				_portlet.append(_head);
				var _body = $("<div class='portlet-body'>");
				if(_portlet.attr('data-scroll-height')){
					var _scroller = $("<div class='scroller' data-scroll-height="+_portlet.attr('data-scroll-height')+" data-always-visible='1' data-rail-visible='0'>");
					APP.loadPage(_scroller,_data_url);
					APP.initScroll(_scroller.get());
					_body.append(_scroller);
				}else{
					APP.loadPage(_body,_data_url);
				}
				_portlet.append(_body);
			}
			_handlePortlet(_portlet);
			
		});
	}
    
    APP.initDropdowns = function (ct) {
        _queryContainer(ct).find('.dropdown-menu.hold-on-click').on('click',function(e){
        	
        	var _this = $(this);
        	if(_this.hasClass('dropdown-checkboxes')){
        		var _checkbox = $(e.target).prev('[type=checkbox]');
        		if(_checkbox && _checkbox.length == 1){
        			_checkbox.get().checked = !_checkbox.get().checked;
        		}
        	}
        	e.stopPropagation();
        	
        });
    }
    
    /**
	 * jquery 遮罩插件
	 * @param  {Object} options target:目标
	 */
	APP.blockUI = function(options) {
    	require(['jquery/blockui'],function(){
    		options = $.extend(true, {}, options);
            var html = "<img src='"+APP.imgPath+"/"+(options.gif ? options.gif :"loading")+".gif' /> "+(options.message ? options.message : "加载中"); 

            if (options.target) {
                var el = $(options.target);
                if (el.height() <= ($(window).height())) {
                    options.cenrerY = true;
                }
                el.block({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    centerY: options.cenrerY !== undefined ? options.cenrerY : false,
                    css: {
                        top: '10%',
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            } else {
                $.blockUI({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    css: {
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            }
    	})
        
    }
    APP.unblockUI = function(target) {
    	require(['jquery/blockui'],function(){
	        if (target) {
	            $(target).unblock({
	                onUnblock: function() {
	                    $(target).css('position', '');
	                    $(target).css('zoom', '');
	                }
	            });
	        } else {
	            $.unblockUI();
	        }
    	})
    }
    
    /**
	 * 显示通知 jquery.gritter调用
	 * @param  {String} title 通知抬头
	 * @param  {String} text  通知主体
	 * @param  {String} type  通知类型 error|warning|info|light default:info 
	 * @param  {String} ele  显示位置 调用alertS
	 */
	APP.notice = function(title,text,type,ele){
		if(!APP.isEmpty(ele)){
			APP.alertS(title,text,type,ele);
		}else{
			require(['jquery/gritter'],function(){
				$.gritter.add({
					title: title,
					text: text,
					sticky: (type === 'error'),
					time: '3000',
					class_name: 'gritter-'+((type && type != undefined) ? type : 'info')
				});
			})
		}
		
	};

	/**
	 * 显示通知 自定义显示位置，默认使用在body中
	 * @param  {String} title 提示标题
	 * @param  {String} message 提示内容
	 * @param  {String} type  通知类型 error|warning|info|success default:info 
	 * @param  {String} ele  显示位置
	 */
	APP.alertS = function(title,message,type,ele){
		var default_options = {
			ele: ele ? ele : "body",
			type: type ? type : "info",
			offset: {from: "top",amount: 1},
			width: 250,
			delay: 2000,
			allow_dismiss: true,
			stackup_spacing: 2
		};
		default_options.width = $(default_options.ele).width();
		var $alert, css, offsetAmount;
	    $alert = $("<div>");
	    $alert.attr("class", "app-noticeS alert alert-block fade in");
	    if (default_options.type) {
	    	$alert.addClass("alert-" + (default_options.type == 'error' ? 'danger' : default_options.type));
	    }
	    if (default_options.allow_dismiss) {
	    	$alert.append("<button type='button' class='close' data-dismiss='alert'></button>");
	    }
	    if(!APP.isEmpty(title))$alert.append("<h4 class='alert-heading'>"+title+"</h4>");
	    $alert.append("<p>"+message+"</p>");
	    offsetAmount = default_options.offset.amount;
	    $(".app-noticeS").each(function() {
	    	return offsetAmount = Math.max(offsetAmount, parseInt($(this).css(default_options.offset.from)) + $(this).outerHeight() + default_options.stackup_spacing);
	    });
	    css = {
	    	"position": (default_options.ele === "body" ? "fixed" : "absolute"),
	    	"margin": 1,
	    	"z-index": "9999999",
	    	"display": "none",
	    	"width" : default_options.width-2 + "px"
	    };
	    css[default_options.offset.from] = offsetAmount + "px";
	    $alert.css(css);

	    $(default_options.ele).append($alert);

	    $alert.slideDown("slow");
	    if (default_options.delay > 0) {
	    	$alert.delay(default_options.delay).slideUp('slow',function() {
	    		$alert.remove();
	    	});
	    }
	};
	
	/**
	 * 显示模态窗口
	 * @param  {String} src modal请求url
	 * @param  {String} mid modal显示div的id,参数不为空则src页面必须为<div class='modal fade'>下的页面
	 * @param  {opts} mid为空时指定标题,传递参数
	 */
	APP.showModal = function(src,mid,opts){
		opts = opts || {title : '标题'};
		require(['bootstrap'],function(){
			$.ajax({
	            type: "GET",
	            cache: false,
	            url: src,
	            data:opts.param,
	            dataType: "html",
	            success: function(html) {
	            	APP.currentUrl = src;
	            	var _html = $(html);
            		APP.initComponents(_html.first().get());
	            	if(mid){
		            	$('#'+mid).remove();
		            	$('body').append(_html);
		            	if($('#'+mid).data("js-module")){
		            		require([$('#'+mid).data("js-module")],function(m){
		            			if($('#'+mid).data("js-main")) m[$('#'+mid).data("js-main")].apply(this);
		            			else m.init(data);
		            		})
		            	}
						$('#'+mid).modal('show');
	            	}else{
	            		var _modal = $("<div class='modal fade' tabindex='-1' data-focus-on='input:first' role='dialog' data-backdrop='static'></div>");
	            		var _modal_width = opts.width ? "style='width:"+opts.width+"px;'" : "";
	            		var _modal_dialog = $("<div class='modal-dialog' "+_modal_width+"></div>");
	            		var _modal_context = $("<div class='modal-content'></div>");
	            		_modal_context.append("<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'></button>"+
	            				"<h4 class='modal-title'>"+opts.title+"</h4></div>");
	            		var _modal_body = $("<div class='modal-body'></div>");
	            		_modal_body.html(_html);
	            		_modal_context.append(_modal_body);
	            		_modal_dialog.append(_modal_context);
	            		_modal.append(_modal_dialog);
	            		_modal.modal('show');
	            		_modal.on('hide.bs.modal', function () {
	            			_modal.remove();
	            		 });
	            	}
	            	
	            },
	            error: function(xhr, ajaxOptions, thrownError) {
	            	_sysError("页面加载错误:状态["+xhr.status+"]错误["+xhr.statusText+"]");
	            }
	        });
		})
	};
	
	/**
	 * 加载模态窗口，src页面为非modal页面是使用，暂时不支持显示页脚按钮
	 * @param  {String} src modal请求url
	 * @param  {opts} 标题和参数
	 */
	APP.loadModal = function(src,opts){
		APP.showModal(src,null,opts);
	};
	/**
	 * sweet-alert插件封装，简单的alert
	 * @param  {String} title 标题
	 * @param  {String} text 内容
	 * @param  {String} type error', 'warning', 'info', 'success
	 */
	APP.alert = function(title,text,type){
		require(['sweetalert'],function(){
			swal({title : title, text : APP.isEmpty(text) ? '' : text, 
					type : APP.isEmpty(type) ? 'success' : type,
							confirmButtonText:'确定',cancelButtonText : '取消'});
		});
	};
	/**
	 * APP.alert简单的info
	 * @param  {String} text 内容
	 */
	APP.info = function(text){
		APP.alert('',text,'info');
	};
	/**
	 * APP.alert简单的success
	 * @param  {String} text 内容
	 */
	APP.success = function(text){
		APP.alert('',text,'success');
	};
	/**
	 * APP.alert简单的error
	 * @param  {String/Object} error 内容或者错误对象
	 */
	APP.error = function(error){
		if(typeof error == 'object') APP.alert('',error[API.MSG],'error');
		else APP.alert('',error,'error');
	};
	/**
	 * APP.alert系统全局的error
	 */
	APP.sysError  =function(){
		APP.alert('服务异常','请确认是否存在网络或服务器异常!','error');
	}
	/**
	 * sweet-alert插件封装，简单的confirm
	 * @param  {String} title 标题
	 * @param  {String} text 内容
	 * @param  {function} confirmCallBack 点击确定后的执行函数
	 * @param  {String} type error', 'warning', 'info', 'success
	 */
	APP.confirm = function(title,text,confirmCallBack){
		require(['sweetalert'],function(){
			swal({title : title, text : APP.isEmpty(text) ? '' : text,
				type: "info",   showCancelButton: true,   closeOnConfirm: false,confirmButtonText:'确定',cancelButtonText : '取消',
				showLoaderOnConfirm: true},function(){
					confirmCallBack();
				});
		});
	};
	/**
	 * 工具按钮提示 bootstrap.popover调用
	 * @param  {Object} pobj  需要弹出提示的对象 
	 * @param  {String} content  提示内容
	 * @param  {String} type  显示类型 error|warning|info|success default:info 
	 * @param  {String} icon  title图标
	 * @param  {String} title  title内容
	 * @param  {String} placement  显示的位置 top|bottom|left|right|auto  默认left
	 * @param  {int} width  宽度
	 */
	APP.popover = function(pobj,content,type,icon,title,placement,width){
		require(['bootstrap'],function(){
			if(APP.isEmpty(pobj.attr('id'))) {
				alert("popover显示对象需要有id属性");
				return;
			}
			var _type = APP.isEmpty(type) ? 'info' : type;
			var _icon = APP.isEmpty(icon) ? 'fa-info-circle' : icon;
			var _title = APP.isEmpty(title) ? '提示消息' : title; 
			var _placement = APP.isEmpty(placement) ? 'auto left' : placement;
			
			pobj.popover({
				html: true,
				trigger: 'manual',
				title: "<i class='fa "+_icon+"'/> "+_title,
				container: $(this).attr('id'),
				content: content,
				placement: _placement
			}).on("mouseleave", function () {
		        var _this = this;
		        setTimeout(function () {
		            if (!$(".popover:hover").length) {
		                $(_this).popover("hide")
		            }
		        }, 100);
		    });
			pobj.popover("show");
			pobj.siblings('.popover').removeClass("error warning info success").addClass(type);
			if(!APP.isEmpty(width)){
				pobj.siblings(".popover").css({"max-width":"600px","width":width+"px"});
			}
			pobj.siblings(".popover").on("mouseleave", function () {
				pobj.popover('hide');
	        });
		})
	};
	
	/**
	 * 轮播 jquery owlCarousel,items里面如有事件绑定需要在参数中的回调事件中绑定
	 * @param  {Object} target  需要显示轮播插件的对象
	 * @param  {Object} opts  设置参数
	 */
	APP.carousel = function(target,opts){
		require(['jquery/carousel'],function(){
			var default_opt = $.extend(true,{
				loop:true,
				margin:5
			},opts);
			var _target = $(target);
			_target.owlCarousel(default_opt);
			_target.on('mouseover',function(e){
				_target.trigger('stop.owl.autoplay');
			});
			_target.on('mouseleave',function(e){
				_target.trigger('play.owl.autoplay');
			});
		});
	};

	
	/**
	 * 页面进度条
	 * @param  {String} opts  id  classname target 需要显示的地方
	 * @returns {Object} progressBar
	 */
	APP.progressBar = function(target,id,classname){
	    var el = document.createElement('div'),applyGo,
	        progressbar = {
	        	el: el,
	        	go: function (p) {
	        		applyGo(p)
	        		if (p === 100) init();
	        	}
	        };
	    
	    function init () {
	    	var bar = _createProgressBar(el);
	    	el.appendChild(bar.el);
	    	applyGo = bar.go;
	    }
	    $(el).css({'width':'100%','height':'4px','top':0,'z-index':9999});
	    if (!APP.isEmpty(id)) el.id = id;
	    if (!APP.isEmpty(classname)) $(el).addClass(classname);

	    if (target) {
	    	el.style.position = 'relative';
	    	$(target).prepend(el);
	    } else {
	    	el.style.position = 'fixed';
	    	document.getElementsByTagName('body')[0].appendChild(el);
	    }
	    init();
	    return progressbar;
	};
	/**
	 * 创建系统精度条 加载页面使用
	 */
	function _createProgressBar(parent){
		var el = document.createElement('div'),
	    width = 0,here = 0,on = 0,
	    bar = {
	    	el: el,
	    	go: go
	    }
		$(el).css({'width':0,'height':'100%','transition':'height .3s','background':'blue'});
	    function move () {
	    	var dist = width - here;
	    	if (dist < 0.1 && dist > -0.1) {
	    		place(here);
	    		on = 0;
	    		if (width === 100) {
	    			el.style.height = 0;
	    			setTimeout(function () {
	    				$(el).remove();
	    				$(parent).remove();
	    			}, 300);
	    		}
	    	} else {
	    		place(width - dist / 4);
	    		setTimeout(go, 16);
	    	}
	    }

	    function place (num) {
	    	width = num;
	    	el.style.width = width + '%';
	    }

	    function go (num) {
	    	if (num >= 0) {
	    		here = num;
	    		if (!on) {
	    			on = 1;
	    			move();
	    		}
	    	} else if (on) {
	    		move();
	    	}
	    }
	    return bar;
	}
	
	return APP;
});

