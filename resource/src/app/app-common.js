/**
 * 通用工具
 */
define('app/common',['jquery','app/api','numeral','bootstrap','moment','jquery/blockui',
	'css!lib/bootstrap/bootstrap.css',
	'css!lib/font-awesome/font-awesome.css',
	'css!app/main.css'],function($,API) {

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
	//模态窗口加载
	$.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner =
		'<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +
		'<div class="progress progress-striped active">' +
		'<div class="progress-bar progress-bar-info" style="width: 100%;"><span class="sr-only"> 页面加载中</span>页面加载中</div>' +
		'</div>' +
		'</div>';
	//设置moment本地化
	var moment = require('moment');
	moment.locale("zh-cn");

	//设置数字格式化工具
	var numeral = require('numeral');
	numeral.locale('chs');
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
			"debug" : _CONFIG.debug,
			"device" : device,
			"isMobile" :  (device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone()),
			"isTablet" : (device.ipad() || device.androidTablet() || device.windowsTablet()),
			"currentUrl" : "index",
			"pageContainer" : _CONFIG.pageContainer,//页面容器
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
			getPageContainer:function(self){
				return _queryContainer(self).closest(APP.pageContainer).get();
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
				if(_CONFIG.debug) console.log(obj);
			},
			getUniqueID: function(prefix) {
				return (prefix || 'app_') + Math.floor(Math.random() * (new Date()).getTime());
			},
			isEmpty : function(v){
				return v === undefined || v === null || $.trim(v) === '';
			},
			jsPath:_CONFIG.jsBaseUrl,

			imgPath:_CONFIG.imgBaseUrl,

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
			numeral : numeral,
			loadPage : function(target,url,params,callback,errorback){
				if(url){
					APP.blockUI({target:target,message:'页面加载中',});
					$.ajax({
						type: "GET",
						cache: false,
						//data: params, //静态工程改为直接传递
						url: ((url.indexOf("?") >0) ? (url.split("?")[0]+".html?" + url.split("?")[1]) : url+".html"),
						dataType: "html",
						success: function(res) {
							APP.currentUrl = url;
							APP.initComponents($(res),params,target,callback);
						},
						error: function(xhr, ajaxOptions, thrownError) {
							APP.unblockUI(target);
							if(typeof errorback === 'function'){
								errorback.call(this,xhr,xhr.status);
							}else{
								_sysError("页面加载错误:状态["+xhr.status+"]错误["+xhr.statusText+"]");
							}

						}
					});
				}
			},
			loadInnerPage : function(target,url,params,callback,errorback){
				if(url){
					$.ajax({
						type: "GET",
						cache: false,
						//data: params, //静态工程改为直接传递
						url: ((url.indexOf("?") >0) ? (url.split("?")[0]+".html?" + url.split("?")[1]) : url+".html"),
						dataType: "html",
						success: function(res) {
							var page = $(res);
							if(page.find("[data-page-return='true']").length == 0) {
								page.prepend("<a class='btn btn-circle btn-icon-only blue return-page' data-page-return='true'> 返回 </a>");
							}
							page.on("click","[data-page-return='true']",function(){
								page.fadeOut(function(){
									$(target).fadeIn();
									$(target).find("table.datatable").resize();//datatable在隐藏时会有列宽显示不正常问题
									page.remove();
								})

							})

							APP.initComponents(page,params,target,callback);
						},
						error: function(xhr, ajaxOptions, thrownError) {
							if(typeof errorback === 'function'){
								errorback(xhr,xhr.status);
							}else{
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
			initTab : function(ct,reload,params,defaultIdx){
				var _tab_toggle = _queryContainer(ct).find('a[data-toggle="tab"]');
				if(_tab_toggle.length == 0) return;
				_tab_toggle.data('show','0');

				_tab_toggle.on('show.bs.tab', function (e) {
					var _target = $(e.target);
					if(APP.isEmpty(_target.data('url'))){
						return;
					}
					if(_target.data('show') === '1') return;//只加载一次
					APP.loadPage(_target.attr('href'),_target.data('url'),params||{});
					if(reload) _target.data('show','0');
					else _target.data('show','1');
				});
				var _active_index = _tab_toggle.parent('li.active').index();
				var _default_idx =  (_active_index == -1) ? 0 : _active_index;
				if(defaultIdx !== undefined) _default_idx = defaultIdx;

				if(!APP.isEmpty(_tab_toggle.eq(_default_idx).data('url'))){
					//动态TAB页需要删除li上的active，否则无法显示
					_tab_toggle.eq(_default_idx).parent('li').removeClass("active");
					setTimeout(function(){//tab页在首次加载时需要延时，否则无法显示
						_tab_toggle.eq(_default_idx).tab('show');
					},100);
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
								if(_this.data("on-value") !== undefined){
									if(_this.data("on-value") == _dict_data[0].value){
										_this.data("on-text",_dict_data[0].name);
										_this.data("off-value",_dict_data[1].value);
										_this.data("off-text",_dict_data[1].name);
									}
									if(_this.data("on-value") == _dict_data[1].value){
										_this.data("on-text",_dict_data[1].name);
										_this.data("off-value",_dict_data[0].value);
										_this.data("off-text",_dict_data[0].name);
									}
								}else{
									_this.data("on-value",_dict_data[0].value);
									_this.data("on-text",_dict_data[0].name);
									_this.data("off-value",_dict_data[1].value);
									_this.data("off-text",_dict_data[1].name);
								}

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
			initComponents: function(page,params,target,callback){
				var page_permission = page.data("permission");
				if(page_permission){
					API.getPermission(page_permission,function(pmis,localData){
						if(!localData){
							page.find("[data-permission]").each(function(){
								var pm = $(this).data("permission");
								if($.inArray(page_permission+":"+pm,pmis) === -1) $(this).remove();
							});
						}
						_initPageComponents(page,params,target,callback);
					});
				}else{
					_initPageComponents(page,params,target,callback);
				}

			}
		};
	}
	/**
	 * 初始化页面控件
	 * @param  {String} page 目标页面DOM
	 */
	function _initPageComponents(page,params,target,callback){
		APP.initTab(page,false);
		APP.initPopover(page);
		APP.initTooltip(page);
		APP.initPulsate(page);
		APP.initPortletPanel(page);
		APP.initDropdowns(page);
		APP.initScroll('.scroller',page);
		APP.initSwitch(page);
		APP.initImagebox(page);
		//初始化提交按钮
		page.find(".btn[data-submit]").each(function(){
			var _submit_btn = $(this);
			_submit_btn.click(function(){
				$(_submit_btn.data("submit")).submit();
			});
		});
		//ie对于placeholder的支持
		if (APP.isIE8 || APP.isIE9) {
			page.find('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function () {
				var input = $(this);
				if (input.val() == '' && input.attr("placeholder") != '') {
					input.addClass("placeholder").val(input.attr('placeholder'));
				}
				input.focus(function () {
					if (input.val() == input.attr('placeholder')) {
						input.val('');
					}
				});
				input.blur(function () {
					if (input.val() == '' || input.val() == input.attr('placeholder')) {
						input.val(input.attr('placeholder'));
					}
				});
			});
		}
		if(target) {
			if(!page.hasClass('inner')){
				APP.unblockUI(target);
				$(target).children().each(function(){
					if($(this).attr("id") != "topcontrol") $(this).remove();
				});
				$(target).append(page);
			}else{
				$(target).after(page);
			}


			if(typeof callback === 'function'){
				callback.call(this,page);
			}
			_callJsModal(page,params);
			if(page.hasClass('inner')){
				$(target).fadeOut(function(){
					page.fadeIn();
				})

			}else {
				page.fadeIn('slow');
			}
		}

	}
	/**
	 * 执行页面dom中的js-module主文件
	 * @param  {Object} page 带js-module属性的dom对象
	 */
	function _callJsModal(page,params){
		if(page.data("js-module")){
			requirejs.undef(page.data("js-module"));
			require([page.data("js-module")],function(m){
				if(page.data("js-main")) m[page.data("js-main")].call(this,params);
				else m.init(params);
			})
		}
	}
	/**
	 * 查找dom
	 * @param  {Object} ct 需要查找的dom
	 */
	function _queryContainer(ct){
		if(APP.isEmpty(ct)) return $('body');
		if(ct instanceof $ && ct.length > 0) return ct;
		var $ct = $(ct);
		if($ct.length > 0) return $ct;
		return $('body');
	}
	/**
	 * 提示错误信息
	 * @param  {String} msg 错误信息
	 */
	function _sysError(msg){
		APP.notice("系统错误",msg,"error");
	}

	APP.loadPortlet = function(_portlet,params,callback){
		var body = _portlet.children('div.portlet-body');
		if(body.length == 0){
			body = $("<div class='portlet-body'>");
			_portlet.append(body);
		}
		if (_portlet.attr('data-url')) {
			APP.loadPage(body.get(0),_portlet.attr('data-url'),params,callback);
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
				$(this).siblings('a.expand,a.close').removeClass('hide');
			} else {
				var height = APP.getViewPort().height -
					_portlet.children('.portlet-title').outerHeight() -
					parseInt(_portlet.children('.portlet-body').css('padding-top')) -
					parseInt(_portlet.children('.portlet-body').css('padding-bottom'));

				$(this).addClass('on');
				_portlet.addClass('portlet-fullscreen');
				$('body').addClass('page-portlet-fullscreen');
				_portlet.children('.portlet-body').css('height', height);
				$(this).siblings('a.expand,a.close').addClass('hide');
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
			}
			if(_portlet.children('div.actions').length > 0){
				_head.append(_portlet.children('div.actions'));
			}
			if(_portlet.children('ul.nav-tabs').length > 0){
				_head.append(_portlet.children('ul.nav-tabs'));
			}
			_portlet.prepend(_head);
			if(!APP.isEmpty(_data_url)){
				var _body = $("<div class='portlet-body'>");
				if(_portlet.data('scroll-height')){
					var _scroller = $("<div class='scroller' data-scroll-height="+_portlet.data('scroll-height')+" data-always-visible='1' data-rail-visible='0'>");
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
	}
	APP.unblockUI = function(target) {
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
	}

	/**
	 * 显示通知 jquery.gritter调用
	 * @param  {String} title 通知抬头
	 * @param  {String} text  通知主体
	 * @param  {String} type  通知类型 error|warning|info|light default:info
	 * @param  {String} ele  显示位置 调用alertS
	 * @param  {Boolean} autoClose 显示的容器(modal)是否自动关闭
	 */
	APP.notice = function(title,text,type,ele,autoClose,callback){
		if(!APP.isEmpty(ele)){
			APP.alertS(title,text,type,ele,autoClose);
		}else{
			require(['jquery/gritter'],function(){
				$.gritter.add({
					title: title,
					text: text,
					sticky: false,
					time: (type === 'error' ? '5000' : '3000'),
					class_name: 'gritter-'+((type && type != undefined) ? type : 'info')
				});
				if(typeof callback === 'function') callback.call(this);
			})
		}

	};
	/**
	 * 显示通知 自定义显示位置，默认使用在body中
	 * @param  {String} title 提示标题
	 * @param  {String} message 提示内容
	 * @param  {String} type  通知类型 error|warning|info|success default:info
	 * @param  {String} ele  显示位置
	 * @param  {Boolean} autoClose 显示的容器(modal)是否自动关闭
	 */
	APP.alertS = function(title,message,type,ele,autoClose){
		var default_options = {
			ele: ele ? ele : "body",
			type: type ? type : "info",
			offset: {from: "bottom",amount: 0},
			width: 250,
			delay: 1500
		};
		default_options.width = $(default_options.ele).width();
		var $alert, css, offsetAmount;
		$alert = $("<div class='app-noticeS alert'>");
		if (default_options.type) {
			$alert.addClass("alert-" + (default_options.type == 'error' ? 'danger' : default_options.type));
		}
		if(!APP.isEmpty(title))$alert.append("<h4 class='alert-heading'>"+title+"</h4>");
		$alert.append("<p>"+message+"</p>");
		offsetAmount = default_options.offset.amount;
		$(".app-noticeS").each(function() {
			return offsetAmount = Math.max(offsetAmount,
				parseInt($(this).css(default_options.offset.from)) + $(this).outerHeight());
		});
		var css = {
			"position": (default_options.ele === "body" ? "fixed" : "absolute"),
			"z-index": "9999999",
			/*	    	"display": "none",*/
			"width" : default_options.width + "px",
			"margin-bottom" : "0px"
		};
		css[default_options.offset.from] = offsetAmount + "px";
		$alert.css(css);

		$(default_options.ele).append($alert);
		$alert.css("display","none");
		$alert.fadeIn(500);
		if (default_options.delay > 0) {
			$alert.delay(default_options.delay).slideUp('fast',function() {
				$(this).remove();
				if(autoClose) $(default_options.ele).closest('.modal').modal('hide');
			});
		}
	};


	//创建按钮 opt : {text:"确认",classes : "btn-sm btn-warning",attr:{"data-role":"###","height":"150px"},action : function(e,btn){}}
	function _createModalButton(opt,modal){
		var btn = $("<button type='button' class='btn'>"+(opt.text ? opt.text : '')+"</button>");
		if(opt.classes) btn.addClass(opt.classes);
		if(opt.attr) btn.attr(opt.attr);
		if(typeof opt.action === 'function'){
			btn.on('click',function(e){
				opt.action.call(this,e,btn,modal);
			})
		}
		return btn;
	}
	function _loadModal(src,params,callback,errorback){
		$.ajax({
			type: "GET",
			cache: false,
			url: ((src.indexOf("?") >0) ? (src.split("?")[0]+".html?" + src.split("?")[1]) : src+".html"),
			dataType: "html",
			success: function(html) {
				APP.currentUrl = src;
				var modal = $(html).filter(".modal");
				APP.initComponents(modal);
				$('body').append(modal);
				if(typeof callback === 'function'){
					callback.call(this);
				}
				_callJsModal(modal,params);
			},
			error: function(xhr, ajaxOptions, thrownError) {
				if(typeof errorback === 'function'){
					errorback.call(this,xhr,xhr.status);
				}else{
					_sysError("页面加载错误:状态["+xhr.status+"]错误["+xhr.statusText+"]");
				}

			}
		});
	}

	function _initModal(mid,opts){
		var _modal = $(mid);

		_modal.attr({"tabindex" : "-1","data-focus-on":"input:first"}).css("display","none");
		if(_modal.children(".modal-body").length == 0){
			_modal.children().wrapAll("<div class='modal-body'></div>");
		}
		if(_modal.children(".modal-header").length == 0){
			_modal.prepend("<div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>"+
				"<h4 class='modal-title'>"+opts.title+"</h4></div>");
		}
		if(opts.hasFooter && _modal.children(".modal-footer").length == 0){
			_modal.append("<div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>关闭</button></div>");
			var _footer = _modal.children(".modal-footer");
			if(opts.buttons){
				if($.isArray(opts.buttons)){
					for(var i=0;i<opts.buttons.length;i++){
						_footer.append(_createModalButton(opts.buttons[i],_modal));
					}
				}else{
					_footer.append(_createModalButton(opts.buttons,_modal));
				}
			}
		}


	}
	/**
	 * 创建模态窗口，用于将当前页面HTML元素在modal中显示
	 * @param  {String} mid modal唯一标识,防止重复创建modal
	 * @param  {Object} options 标题和参数等(包括footer中的按钮属性)
	 * @param  {Function} callback 成功回调
	 */
	APP.modal = function(mid,options,callback,errorback){
		var opts = $.extend(true,{
			"title" : "",
			"show" : true,
			"clear" : false,
			"hasFooter" : true,
			"params" : {}
		},options);

		if(opts.url){
			if($(mid).length > 0){
				$(mid).remove();
			}
			if(opts.show) $('body').modalmanager('loading');
			_loadModal(opts.url,opts.params,function(){
				_initModal(mid,opts);
				if(opts.clear){
					$(mid).on('hidden.bs.modal',function(){
						$(this).remove();
					})
				}
				if(opts.show) $(mid).modal('show');
				if(typeof callback === 'function') callback.call(this);
			},errorback);

		}else{
			_initModal(mid,opts);
			if(typeof callback === 'function') callback.call(this);
			if(opts.show) $(mid).modal('show');
		}
	}
	APP.showModal = function(src,mid,params,showback){
		APP.modal(mid,{url:src,params:params},showback);
	}
	/**
	 * sweet-alert插件封装，简单的alert
	 * @param  {String} title 标题
	 * @param  {String} text 内容
	 * @param  {String} type error', 'warning', 'info', 'success
	 * @param  {String} ele alertS显示容器,一般用于modal中
	 * @param  {Boolean} autoClose 显示的容器(modal)是否自动关闭
	 */
	APP.alert = function(title,text,type,ele,autoClose){
		if(ele){
			APP.alertS(title,text,type,ele,autoClose);
		}else{
			require(['sweetalert'],function(){
				swal({title : title, text : APP.isEmpty(text) ? '' : text,
					type : APP.isEmpty(type) ? 'success' : type,timer:autoClose ? 1000 : null,
					confirmButtonText:'确定',cancelButtonText : '取消'});
			});
		}

	};
	/**
	 * APP.alert简单的info
	 * @param  {String} msg 内容
	 * @param  {Dom} ele alertS显示的容器
	 * @param  {Boolean} autoClose 显示的容器(modal)是否自动关闭
	 */
	APP.info = function(msg,ele,autoClose){
		if(typeof msg == 'object') APP.alert('',msg[API.MSG],'info',ele,autoClose);
		else APP.alert('',msg,'info',ele,autoClose);
	};
	/**
	 * APP.alert简单的success
	 * @param  {String} msg 内容
	 * @param  {Dom} ele alertS显示的容器
	 * @param  {Boolean} autoClose 显示的容器(modal)是否自动关闭
	 */
	APP.success = function(msg,ele,autoClose){
		if(typeof msg == 'object') APP.alert('',msg[API.MSG],'success',ele,autoClose);
		else APP.alert('',msg,'success',ele,autoClose);
	};
	/**
	 * APP.alert简单的error
	 * @param  {String/Object} error 内容或者错误对象
	 * @param  {Dom} ele alertS显示的容器
	 */
	APP.error = function(error,ele){
		if(typeof error == 'object') APP.alert('',error[API.MSG],'error',ele,false);
		else APP.alert('',error,'error',ele,false);
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
				confirmCallBack.call(this);
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
	};

	/**
	 * 轮播 jquery owlCarousel,items里面如有事件绑定需要在参数中的回调事件中绑定
	 * @param  {Object} target  需要显示轮播插件的对象
	 * @param  {Object} opts  设置参数
	 */
	APP.carousel = function(target,opts){
		require(['jquery/carousel'],function(){
			var default_opt = $.extend(true,{
				autoplay:true,
				loop : true,
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
		_queryContainer(target).children("div[data-role='progressbar']").remove();
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
		$(el).attr("data-role","progressbar");
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
		$(el).css({'width':0,'height':'100%','transition':'height .3s','background':'#66afe9'});
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
	//图片弹出层初始化
	APP.initImagebox = function (ct) {
		require(['jquery/colorbox'],function(){
			_queryContainer(ct).find(".image-box-button").each(function(){
				var rel = $(this).data('rel');
				$(this).colorbox({
					maxWidth : '85%',
					maxHeight : '85%',
					rel : rel,
					title : $(this).data('title') || ''
				});
			});
			_queryContainer(ct).find('.video-box-button').colorbox({iframe:true, innerWidth:640, innerHeight:480});
		});
	}
	return APP;
});

