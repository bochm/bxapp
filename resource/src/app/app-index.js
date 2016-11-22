/**
 * 首页初始化
 */
define(['jquery','app/common'],function($,APP) {
	var resizeHandlers = [];
	
	
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var ieversion = new Number(RegExp.$1);
        if (ieversion == 8) {
        	APP.isIE8 = true;
        } else if (ieversion == 9) {
        	APP.isIE9 = true;
        }
        $('html').addClass('ie');
    }
	if ($('body').css('direction') === 'rtl') {
        APP.isRTL = true;
    }
	APP.addResizeHandler = function(func) {
        resizeHandlers.push(func);
    }

    APP.runResizeHandlers = function() {
        _runResizeHandlers();
    }
	
  //当前显示页面URL
	var $currPage;
	var resBreakpointMd = APP.getResponsiveBreakpoint('md');
	//计算固定边栏栏高度
	var _calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = APP.getViewPort().height - $('.page-header').outerHeight();
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.page-footer').outerHeight();
        }
        return sidebarHeight;
    };
	var handleSidebarAndContentHeight = function () {
		var content = $('.page-content');
        var sidebar = $('.page-sidebar');
        var body = $('body');
        var height;

        if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
            var available_height = APP.getViewPort().height - $('.page-footer').outerHeight() - $('.page-header').outerHeight();
            if (content.height() < available_height) {
                content.attr('style', 'min-height:' + available_height + 'px');
            }
        } else {
            if (body.hasClass('page-sidebar-fixed')) {
                height = _calculateFixedSidebarViewportHeight();
                if (body.hasClass('page-footer-fixed') === false) {
                    height = height - $('.page-footer').outerHeight();
                }
            } else {
                var headerHeight = $('.page-header').outerHeight();
                var footerHeight = $('.page-footer').outerHeight();

                if (APP.getViewPort().width < resBreakpointMd) {
                    height = APP.getViewPort().height - headerHeight - footerHeight;
                } else {
                    height = sidebar.height() + 20;
                }

                if ((height + headerHeight + footerHeight) <= APP.getViewPort().height) {
                    height = APP.getViewPort().height - headerHeight - footerHeight;
                }
            }
            content.attr('style', 'min-height:' + height + 'px');
        }
		
    };
	
    
	var _runResizeHandlers = function() {
        for (var i = 0; i < resizeHandlers.length; i++) {
            var each = resizeHandlers[i];
            each.call();
        }
    };
    //固定侧边菜单处理
    var handleFixedSidebar = function () {
        var menu = $('.page-sidebar-menu');

        APP.destroyScroll(menu);

        if ($('.page-sidebar-fixed').size() === 0) {
            handleSidebarAndContentHeight();
            return;
        }

        if (APP.getViewPort().width >= resBreakpointMd) {
            menu.attr("data-scroll-height", _calculateFixedSidebarViewportHeight());
            APP.initScroll(menu);
            handleSidebarAndContentHeight();
        }
    };
    // 窗口大小变化时的响应事件
    var handleOnResize = function() {
        var resize;
        if (APP.isIE8) {
            var currheight;
            $(window).resize(function() {
                if (currheight == document.documentElement.clientHeight) {
                    return;
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function() {
                    _runResizeHandlers();
                }, 50);  //50毫秒等待后响应              
                currheight = document.documentElement.clientHeight; //body高度设置
            });
        } else {
            $(window).resize(function() {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function() {
                    _runResizeHandlers();
                }, 50); //50毫秒等待后响应
            });
        }
    };
    // 侧边菜单固定时鼠标事件
    var handleFixedSidebarHoverEffect = function () {
        var body = $('body');
        if (body.hasClass('page-sidebar-fixed')) {
            $('.page-sidebar').on('mouseenter', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').removeClass('page-sidebar-menu-closed');
                }
            }).on('mouseleave', function () {
                if (body.hasClass('page-sidebar-closed')) {
                    $(this).find('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
                }
            });
        }
    };
    //固定样式的菜单展开时如果太长，显示滚动条
    var handleSidebarScroll  = function(autoScroll,menu,pos){
    	if (autoScroll === true && $('body').hasClass('page-sidebar-closed') === false) {
            if ($('body').hasClass('page-sidebar-fixed')) {
            	require(['jquery/scrollbar'],function(){
            		menu.slimScroll({
                        'scrollTo': (pos.position()).top
                    });
            	});
            } else {
                APP.scrollTo(pos, -200);
            }
        }
        handleSidebarAndContentHeight();
    }
    //点击菜单加载页面
    var handleMenuAction = function(isInSidebar,actMenu){
        var pageContent = 'div.page-content';
        if(isInSidebar){
	        var menuContainer = $('.page-sidebar ul');
	        menuContainer.children('li.active').removeClass('active');
	        menuContainer.children('.arrow.open').removeClass('open');
	
	        actMenu.parents('li').each(function () {
	            $(this).addClass('active');
	            $(this).children('a > span.arrow').addClass('open');
	        });
	
        }

        if (APP.getViewPort().width < resBreakpointMd && $('.page-sidebar').hasClass("in")) { //移动端加载页面时隐藏菜单
            $('.page-header .responsive-toggler').click();
        }
        
        if(actMenu.attr("href")){
        	var url = actMenu.attr("href");
        	$('.page-content-wrapper>.page-content').children().remove();
        	$('.page-content-wrapper>.page-content').css('display','none');
        	APP.loadPage(pageContent,url,{},function(){
        		if (isInSidebar && actMenu.parents('li.open').size() === 0) {
                    $('.page-sidebar-menu > li.open > a').click();
                }
        		handleSidebarAndContentHeight();
                $currPage = url;
                var _page_bar = $("<div class='page-bar'>");
                var _page_breadcrumb = $("<ul class='page-breadcrumb'>");
                actMenu.parentsUntil("#index-page-sidebar-menu",'li').each(function(){
                	var _parent_menu = $(this).children('a');
                	var _p_menu_icon = _parent_menu.children('i').attr('class');
                	var _p_menu_text = _parent_menu.text();
                	_page_breadcrumb.prepend("<li><i class='fa fa-angle-right'></i><i class='"+_p_menu_icon+"'></i>"+_p_menu_text+"</li>");
                });
                _page_breadcrumb.find('i.fa-angle-right').first().remove();
                _page_bar.append(_page_breadcrumb);
                var _page_tool_bar = $('<div class="page-toolbar">');
                if(APP.debug){
                	var _page_debug_tool = $("<div class='btn-group pull-right'>" +
                			"<button class='btn btn-fit-height grey-salt dropdown-toggle' " +
                			"data-toggle='dropdown' data-hover='dropdown' data-delay='1000' " +
                			"data-close-others='true'>调试 <i class='fa fa-angle-down'></button></div>");
                	var _page_debug_tool_menu = $("<ul class='dropdown-menu pull-right' role='menu'>");
                	var _page_debug_tool_src = $("<li><a><i class='iconfont icon-code'></i> 链接</a></li>");
                	var _page_debug_tool_ref = $("<li><a><i class='iconfont icon-undo'></i> 刷新</a></li>");
                	_page_debug_tool_src.click(function(){
                		APP.info(url);
                	})
                	_page_debug_tool_ref.click(function(){
                		handleMenuAction(true,actMenu);
                	})
                	_page_debug_tool_menu.append(_page_debug_tool_src);
                	_page_debug_tool_menu.append(_page_debug_tool_ref);
                	_page_debug_tool.append(_page_debug_tool_menu);
                	_page_tool_bar.append(_page_debug_tool);
                }
                _page_bar.append(_page_tool_bar);
                $(pageContent).prepend(_page_bar); 
        	});
        }
    }
    var handleSidebarMenu = function () {
        //菜单点击事件
        $('.page-sidebar').on('click', 'li > a', function (e) {
            var hasSubMenu = $(this).next().hasClass('sub-menu');

            if (APP.getViewPort().width >= resBreakpointMd && 
            		$(this).parents('.page-sidebar-menu-hover-submenu').size() === 1) { // 离开鼠标停留菜单
                return;
            }

            if (hasSubMenu === false) {
                if (APP.getViewPort().width < resBreakpointMd && 
                		$('.page-sidebar').hasClass("in")) { //移动端加载页面时隐藏菜单
                    $('.page-header .responsive-toggler').click();
                }
                return;
            }

            if ($(this).next().hasClass('sub-menu always-open')) {
                return;
            }

            var parent = $(this).parent().parent();
            var the = $(this);
            var menu = $('.page-sidebar-menu');
            var sub = $(this).next();

            var autoScroll = menu.data("auto-scroll");
            var slideSpeed = parseInt(menu.data("slide-speed"));
            var keepExpand = menu.data("keep-expanded");

            if (keepExpand !== true) {
                parent.children('li.open').children('a').children('.arrow').removeClass('open');
                parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
                parent.children('li.open').removeClass('open');
            }


            if (sub.is(":visible")) {
                $('.arrow', $(this)).removeClass("open");
                $(this).parent().removeClass("open");
                sub.slideUp(slideSpeed, function () {
                	handleSidebarScroll(autoScroll,menu,the);
                });
            } else if (hasSubMenu) {
                $('.arrow', $(this)).addClass("open");
                $(this).parent().addClass("open");
                sub.slideDown(slideSpeed, function () {
                	handleSidebarScroll(autoScroll,menu,the);
                });
            }

            e.preventDefault();
        });

        //加载菜单链接
        $('.page-sidebar').on('click', ' li > a.act-menu', function (e) {
            e.preventDefault();
            handleMenuAction(true,$(this));
        });

        //页面中的点击加载
        $('.page-content').on('click', '.act-menu', function (e) {
            e.preventDefault();
            handleMenuAction(false,$(this));
        });
     
        handleFixedSidebarHoverEffect();
    };
    
    //侧边菜单收起展开事件
    var handleSidebarToggler = function() {
        var body = $('body');
        if ($.cookie && $.cookie('sidebar_closed') === '1' && APP.getViewPort().width >= resBreakpointMd) {
            $('body').addClass('page-sidebar-closed');
            $('.page-sidebar-menu').addClass('page-sidebar-menu-closed');
        }

        //展开收起按钮
        $('body').on('click', '.sidebar-toggler', function(e) {
            var sidebar = $('.page-sidebar');
            var sidebarMenu = $('.page-sidebar-menu');
            $(".sidebar-search", sidebar).removeClass("open");

            if (body.hasClass("page-sidebar-closed")) {
                body.removeClass("page-sidebar-closed");
                sidebarMenu.removeClass("page-sidebar-menu-closed");
                if ($.cookie) {
                    $.cookie('sidebar_closed', '0');
                }
            } else {
                body.addClass("page-sidebar-closed");
                sidebarMenu.addClass("page-sidebar-menu-closed");
                if (body.hasClass("page-sidebar-fixed")) {
                    sidebarMenu.trigger("mouseleave");
                }
                if ($.cookie) {
                    $.cookie('sidebar_closed', '1');
                }
            }

            $(window).trigger('resize');
        });

        handleFixedSidebarHoverEffect();

        // 侧边菜单搜索
        $('.page-sidebar').on('click', '.sidebar-search .remove', function(e) {
            e.preventDefault();
            $('.sidebar-search').removeClass("open");
        });

        // 侧边菜单搜索点击回车
        $('.page-sidebar .sidebar-search').on('keypress', 'input.form-control', function(e) {
            if (e.which == 13) {
                $('.sidebar-search').submit();
                return false; 
            }
        });

        // 侧边菜单搜索提交
        $('.sidebar-search .submit').on('click', function(e) {
            e.preventDefault();
            if ($('body').hasClass("page-sidebar-closed")) {
                if ($('.sidebar-search').hasClass('open') === false) {
                    if ($('.page-sidebar-fixed').size() === 1) {
                        $('.page-sidebar .sidebar-toggler').click(); 
                    }
                    $('.sidebar-search').addClass("open");
                } else {
                    $('.sidebar-search').submit();
                }
            } else {
                $('.sidebar-search').submit();
            }
        });

        // 点击页面其它部位隐藏搜索框
        if ($('.sidebar-search').size() !== 0) {
            $('.sidebar-search .input-group').on('click', function(e) {
                e.stopPropagation();
            });

            $('body').on('click', function() {
                if ($('.sidebar-search').hasClass('open')) {
                    $('.sidebar-search').removeClass("open");
                }
            });
        }
    };

    // 页面顶部搜索框事件
    var handleHeader = function() {
    	//TAB页响应事件
        $('.page-header').on('click', '.hor-menu a[data-toggle="tab"]', function (e) {
            e.preventDefault();
            var nav = $(".hor-menu .nav");
            var active_link = nav.find('li.current');
            $('li.active', active_link).removeClass("active");
            $('.selected', active_link).remove();
            var new_link = $(this).parents('li').last();
            new_link.addClass("current");
            new_link.find("a:first").append('<span class="selected"></span>');
        });

        // 搜索框展开收起
        $('.page-header').on('click', '.search-form', function (e) {
            $(this).addClass("open");
            $(this).find('.form-control').focus();

            $('.page-header .search-form .form-control').on('blur', function (e) {
                $(this).closest('.search-form').removeClass("open");
                $(this).unbind("blur");
            });
        });

        // 搜索框点击回车
        $('.page-header').on('keypress', '.hor-menu .search-form .form-control', function (e) {
            if (e.which == 13) {
                $(this).closest('.search-form').submit();
                return false;
            }
        });

        //搜索框展开时点击提交
        $('.page-header').on('mousedown', '.search-form.open .submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).closest('.search-form').submit();
        });

        //桌面megamenu mouseover事件
        $('[data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function() {   
            $(this).dropdownHover(); 
            $(this).addClass('hover-initialized'); 
        });
        
        $(document).on('click', '.mega-menu-dropdown .dropdown-menu', function (e) {
            e.stopPropagation();
        });
    	
        if(APP.isMobile){
        	$('body').addClass('page-header-fixed-mobile');
        }
    };
    function _initLoginForm(){
    	require(['app/form'],function(FM){
    		$('form.login-form').initForm({
    			beforeSubmit : function(formData, jqForm, options){
    				APP.blockUI({target:'.content',message:'登陆中',gif : 'form-submit'});
    				return true;
    			},
    			success:function(response, status){
    				APP.unblockUI('.content');
    				if(response.ERROR){
    					APP.error(response);
    				}else{
    					API.storeUser(response);
        				$('.login-page').slideUp('slow',function() {
        					$(this).remove();
        					APP.initIndex();
        		    	});
    				}
    				
    			},
    			error:function(err){
    				if(APP.debug)console.log(err);
    				APP.unblockUI('.content');
    				APP.sysError();
    			}
    		});
    	})
    }
    APP.showLogin = function(){
    	$('body').fadeOut('fast',function(){
    		APP.loadPage('body','login.html',{},function(){
    			$('.login-page').slideDown('fast',function(){
    				$('body').removeClass().addClass('login').show();
    				document.forms[0].loginname.focus();
    				_initLoginForm();
    	    	});
    		})
    	});
    };
    APP.showIndex = function(){
    	API.getUser(function(user){
    		APP.initIndex();
    	},function(err){
    		if(err[API.STATUS] == "401") APP.showLogin();
			else APP.sysError();
    	});
    }
    APP.initIndex = function(){
    	$('body').removeClass().addClass('page-header-fixed page-sidebar-fixed').css('display','none');
		APP.loadPage('body','main.html',{},function(){
			handleFixedSidebar();
	    	handleOnResize();
	    	handleSidebarMenu();
	    	handleSidebarToggler();
	    	handleHeader();
	    	APP.initScroll('.scroller');
	    	APP.addResizeHandler(handleFixedSidebar);
	    	APP.addResizeHandler(handleSidebarAndContentHeight);
	    	require(['domReady!'],function(doc){
	    		$('body').fadeIn('fast');		
	    	});
	    	$("a[data-toggle='refresh-page']").on('click',function(){
	    		//APP.showLogin();
	    		//if($currPage) APP.loadPage('div.page-content',$currPage);
	    	})
		},function(err){
			APP.error(err);
		});
    }
	return APP;

});

