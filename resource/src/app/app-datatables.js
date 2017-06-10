/**
 * @fileOverview jquery.dataTables扩展
 * @author bx
 * @ignore
 */
define('app/datatables',['jquery','app/common','app/api',
        "datatables.net",
        "datatables/buttons/flash",
        "datatables/buttons/print","datatables/select",
        "datatables/responsive","datatables/fixedHeader",
        "css!lib/jquery/datatables/dataTables.bootstrap.css"],function($,APP,API,DataTable) {
	//-------------------默认参数初始化及修改----------------------------------
	
	//工具按钮设置
	var btn_opts = {
			"pdf": {"icon":"<i class='fa fa-file-pdf-o'></i> ","text":"导出PDF"},
			"copy":{"icon":"<i class='fa fa-copy'></i> ","text":"复制"},
			"excel":{"icon":"<i class='fa fa-file-excel-o'></i> ","text":"导出"},
			"print":{"icon":"<i class='fa fa-print'></i> ","text":"打印"}
	}
	/**
     * 默认参数设置
     */
	var default_opts = {
			//B不能包含在任何自定义div中，否则flash导出失效
			//f改为自定义回车搜索
			"dom": "B<'dataTables_filter'><'table-scrollable'tr<'table-foot-bar' ilp>>",
			//"dom": "Bfrtip",//
			"oLanguage": {
				"sLengthMenu": "_MENU_/页",
				"sSearch":"<div class='input-icon input-icon-sm'><i class='iconfont icon-search'></i>_INPUT_</div>",
				"sInfo": " _START_-_END_ 共_TOTAL_条记录",
				"sLoadingRecords":"",
				"sProcessing":"<img src='"+APP.imgPath+"/load-tables.gif' />",
				"sInfoEmpty" : "0/0 共 0条记录",
				//"sInfoFiltered":"过滤前_MAX_ 条记录",
				"sInfoFiltered":"",
				"sZeroRecords":"没有数据",
				"sEmptyTable":"没有数据",
				"buttons":{
						"pdf":btn_opts.pdf.icon + btn_opts.pdf.text,
						"copy":btn_opts.copy.icon + btn_opts.copy.text,
						"copyTitle":"复制到剪贴板",
						"copyInfo":{_: '以复制 %d 行到剪贴板',1: '复制 1 行到剪贴板'},
						"excel":btn_opts.excel.icon+btn_opts.excel.text,
						"print":btn_opts.print.icon+btn_opts.print.text
				},
				"oPaginate":{
					"sNext":">",
					"sPrevious":"<",
					"sFirst":"",
					"sLast":""
				}
			},
			renderer: 'bootstrap'
	};
	$.extend( true, DataTable.defaults,  default_opts);
	$.fn.dataTableExt.oStdClasses.sWrapper = $.fn.dataTableExt.oStdClasses.sWrapper + " dataTables_extended_wrapper";
    $.fn.dataTableExt.oStdClasses.sFilterInput = "form-control input-sm";
    //$.fn.dataTableExt.oStdClasses.sLengthSelect = "form-control input-xsmall input-sm input-inline";
    
    //responsive bootstrap扩展
    var _display = DataTable.Responsive.display;
    var _original = _display.modal;
    _display.modal = function ( options ) {
    	return function ( row, update, render ) {
    		if ( ! $.fn.modal ) {
    			_original( row, update, render );
    		}
    		else {
    			if ( ! update ) {
    				var modal = $(
    					'<div class="modal fade" role="dialog">'+
						'<div class="modal-header">'+
						'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
						'</div>'+
						'<div class="modal-body"/>'+
    					'</div>'
    				);

    				if ( options && options.header ) {
    					modal.find('div.modal-header').append( '<h4 class="modal-title">'+options.header( row )+'</h4>' );
    				}

    				modal.find( 'div.modal-body' ).append( render() );
    				modal.appendTo( 'body' ).modal('show');
    			}
    		}
    	};
    };
	/**
	 * @override
     * 表格log方法
     */

    DataTable.ext.sErrMode = function(settings, tn, msg){
    	APP.notice("表格错误信息",msg,'error');
	};
	/* Bootstrap paging button renderer */
	DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
		var api     = new DataTable.Api( settings );
		var classes = settings.oClasses;
		var lang    = settings.oLanguage.oPaginate;
		var btnDisplay, btnClass;

		var attach = function( container, buttons ) {
			var i, ien, node, button;
			var clickHandler = function ( e ) {
				e.preventDefault();
				if ( !$(e.currentTarget).hasClass('disabled') ) {
					api.page( e.data.action ).draw( false );
				}
			};

			for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
				button = buttons[i];

				if ( $.isArray( button ) ) {
					attach( container, button );
				}
				else {
					btnDisplay = '';
					btnClass = '';

					switch ( button ) {
						case 'ellipsis':
							btnDisplay = '&hellip;';
							btnClass = 'disabled';
							break;

						case 'first':
							btnDisplay = lang.sFirst;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'previous':
							btnDisplay = lang.sPrevious;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'next':
							btnDisplay = lang.sNext;
							btnClass = button + (page < pages-1 ?
								'' : ' disabled');
							break;

						case 'last':
							btnDisplay = lang.sLast;
							btnClass = button + (page < pages-1 ?
								'' : ' disabled');
							break;

						default:
							btnDisplay = button + 1;
							btnClass = page === button ?
								'active' : '';
							break;
					}

					if ( btnDisplay ) {
						node = $('<li>', {
								'class': classes.sPageButton+' '+btnClass,
								'aria-controls': settings.sTableId,
								'tabindex': settings.iTabIndex,
								'id': idx === 0 && typeof button === 'string' ?
									settings.sTableId +'_'+ button :
									null
							} )
							.append( $('<a>', {
									'href': '#'
								} )
								.html( btnDisplay )
							)
							.appendTo( container );

						settings.oApi._fnBindAction(
							node, {action: button}, clickHandler
						);
					}
				}
			}
		};

		attach(
			$(host).empty().html('<ul class="pagination pagination-sm"/>').children('ul'),
			buttons
		);
	};
	//--------------------------------按钮设置--------------------------------
	/**
	 * @override
     * 设置Buttons默认属性
     */
	$.extend( true, DataTable.Buttons.defaults, {
		dom: {
			container: {
				className: 'dt-buttons btn-group'
			},
			button: {
				tag: 'a',
				className: 'btn btn-sm btn-info'
			},
			buttonLiner: {
				tag: '',
				className: ''
			},
			collection: {
				tag: "ul role='menu'",
				className: 'dt-button-collection dropdown-menu',
				button: {
					tag: 'li',
					className: 'dt-button'
				},
				buttonLiner: {
					tag: 'a',
					className: ''
				}
			}
		}
	} );
	/**
	 * @override
     * 重写信息输出方法
     */
	DataTable.Api.register( 'buttons.info()', function ( title, message, time ) {
		var that = this;
		APP.notice(title,message,'info');
		return this;
	} );
	
	
	DataTable.Buttons.swfPath = APP.jsPath+'/lib/jquery/datatables/swf/flashExport.swf';
	/**
     * 表格默认行处理方法
     */
	function _addEditRecord(e,dt, node,type){
		var _options = dt.init();
		if(typeof _options[type+'Record'] === 'function'){
			_options[type+'Record'].call(this,dt,node,e);
		}else if(!APP.isEmpty(_options.addModal) || !APP.isEmpty(_options.addEditModal) || !APP.isEmpty(_options.editModal)){
			//初始化表格编辑modal --针对表格页面和编辑页面不在同一个html中
			var _modal =  _options.addEditModal || _options.addModal || _options.editModal;
			if(_modal.url && _modal.id){
				var _modalUrl = _modal.url;
				if(!APP.isEmpty(_options.addEditModal)){ //新增、修改共用modal区分act
					if(_modal.url.indexOf("?") >0) _modalUrl = _modal.url + '&act='+type;
					else _modalUrl = _modal.url + '?act='+type;
				}
				var modalOpts = $.extend(true,{
					buttons : [{"text" : "保存","classes" : "btn-primary",action : function(e,btn,modal){
						modal.find('form').submit();
		    		}}],
		    		params : {"act" : type,"table" : dt} //参数方式传递act和table
				},_modal);
				modalOpts.url = _modalUrl;
				APP.modal(_modal.id,modalOpts);
			}else{
				alert("请指定modal的url和id属性");
			}
		}else if(!APP.isEmpty(_options.addForm) || !APP.isEmpty(_options.addEditForm) || !APP.isEmpty(_options.editForm)){
			//初始化表格编辑form --针对表格和表单在同一个html中
			var _form = _options.addEditForm || _options.addForm || _options.editForm;
			var form_opts = $.extend(true,{},{
				formData : (type == 'save' ? dt.selectedRows()[0] : null),
				submitClear : !(type == 'save'),
				autoClose : (type == 'save')
			},_form);
			if(_form[type+'Validate']){
				if(typeof _form[type+'Validate'] === 'object') form_opts.validate = _form[type+'Validate'];
				else if(typeof _form[type+'Validate'] === 'function') form_opts.validate = _form[type+'Validate'].call(this,dt);
			}

			if( _form[type+'Url'] !== undefined || _form.url !== undefined || $(_form.id).attr("action") !== undefined){
				form_opts.url = _form[type+'Url'] || _form.url || $(_form.id).attr("action") + "/" + type;
			}
			require(['app/form'],function(FORM){
				FORM.editForm(form_opts,function(data){
					if(typeof _form.submitCallback === 'function'){
						_form.submitCallback.call(this,data);
					}else{
						if(type == 'add') dt.addRow(data);
						if(type == 'save') dt.updateSelectedRow(data);
					}
				});
			});
		}else{
			alert("请初始化表格参数中的addForm|addEditForm|addModal|addEditModal|addRecord|saveRecord选项");
		}
	}
	/**
     * 表格默认删除方法
     */
	function _deleteRecord(e,dt,node){
		if(dt.selectedCount() < 1){
			APP.info('请选择需要删除的记录');
			return;
		}
		var _options = dt.init();
		if(typeof _options.deleteRecord === 'function'){
			_options.deleteRecord.call(this,dt,node,e);
		}else{
			APP.confirm('','是否删除选择的记录?',function(){
				if(!APP.isEmpty(_options.deleteRecord) && !APP.isEmpty(_options.deleteRecord.url)){
				//按选定行的id列删除（_options.deleteRecord.id），或者按选择的行数据删除（_options.deleteRecord.row=id）
					var params = _options.deleteRecord.row ? dt.selectedRowsData(_options.deleteRecord.id) : dt.selectedColumn(_options.deleteRecord.id ? _options.deleteRecord.id : 'id');
					API.ajax(_options.deleteRecord.url,params,false,function(ret,status){
						if(API.isError(ret)){
							APP.error(ret);
						}else{
							dt.deleteSelectedRow();
							APP.success(API.respMsg(ret),null,true);
						}
						if(typeof _options.deleteRecord.onDeleted === 'function') _options.deleteRecord.onDeleted.call(this,ret);
					},function(err){
						APP.error(err);
					});
				}else{
					dt.deleteSelectedRow();
					APP.success(API.respMsg("记录已删除"),null,true);
					if(typeof _options.deleteRecord.onDeleted === 'function') _options.deleteRecord.onDeleted.call(this,null);
				}
			})
		}
	}
	/**
     * 自定义按钮--新增
     */
	$.fn.dataTable.ext.buttons.addRecord = {
		text: "<i class='fa fa-copy'></i> 新增",
		className: 'btn btn-sm btn-primary',
		action: function ( e, dt, node, config ) {
			_addEditRecord(e,dt, node,'add');
		}
	};
	/**
     * 自定义按钮--修改
     */
	$.fn.dataTable.ext.buttons.saveRecord = {
		text: "<i class='fa fa-edit'></i> 修改",
		className: 'btn btn-sm btn-primary btn-selectOne',
		action: function ( e, dt, node, config ) {
			if(dt.selectedCount() != 1){
				APP.info('请选择一条需要修改的记录');
				return;
			}
			_addEditRecord(e, dt, node,'save');
		}
	};
	/**
     * 自定义按钮--删除
     */
	$.fn.dataTable.ext.buttons.deleteRecord = {
		text: "<i class='fa fa-trash-o'></i> 删除",
		className: 'btn btn-sm btn-warning btn-selectMore',
		action: function ( e, dt, node, config ) {
			_deleteRecord(e,dt,node);
		}
	};
	DataTable.getTable = function(selector){
		return new $.fn.dataTable.Api(selector);
	}
	
	
	//------------------------------------------初始化---------------------------------------
	/**
    * 基础表格处理
    * @param  {Object} opts 初始化参数
    * @return {DataTable}
    **/
	$.fn.initTable = function (opts,callback) {
		var _table = $(this);
		if(opts === undefined) opts = {};
		var tableid = _table.attr('id');
		if(APP.isEmpty(tableid)){
			alert("请指定table id");
			return;
		}
		DataTable.getTable("#"+tableid).destroy();
		var default_opt = $.extend(true,{
			"tableId" : tableid,
			"processing" : true,
			"serverSide" : false,
			"paging": true,
			"info": true,
			"lengthMenu": [[5,10, 25, 50, -1], [5,10, 25, 50, "全部"]],
			"pageLength": 10,
			"autoWidth": true,
			"permission" : true, //检测权限,buttons按页面toolbar中的按钮显示
			"scrollCollapse": true,
			"select": {style: 'os',info:false},
			"scrollY": "",
			"scrollX" : false,
			"buttons": [],
			//"buttons":[{extend: 'collection',text: '导出', buttons : ['selectAll','selectNone','print']},"addRecord","deleteRecord"],
			"createdRow": function (nRow, aData, iDataIndex) {},
			"footerCallback": function( tfoot, data, start, end, display ) {
				if(tfoot){
					//没有数据不显示footer
					if(end == 0){
						$("div#"+tableid+"_wrapper div.dataTables_scrollFoot").hide();
					} else{
						$("div#"+tableid+"_wrapper div.dataTables_scrollFoot").show();
					}
					//数据汇总
					var api = this.api();
					if(typeof opts.footerFormat === 'function') {
						opts.footerFormat.call(this,api, tfoot, data, start, end, display);
					}else{
						//sum类型汇总,带分页且页数大于1则显示当前页和总和
						$(tfoot).children("th[data-sum-column]").each(function(){
							var idx = $(this).data("sum-column");
							var pageTotal = api.column( idx, { page: 'current'} ).data().reduce( function (a, b) {
								return APP.numeral(a).value()+APP.numeral(b).value();
							},0);
							//numeral格式化
							var format = $(this).data("format") ? $(this).data("format") : '0';
							if(api.page.info() && api.page.info().pages > 1){
								var total = api.column( idx ).data().reduce( function (a, b) {
									return APP.numeral(a).value()+APP.numeral(b).value();
								},0);
								$(api.column(idx).footer()).html(APP.numeral(pageTotal).format(format) +
									'/'+ APP.numeral(total).format(format) );
							}else{
								$(api.column(idx).footer()).html(APP.numeral(pageTotal).format(format));
							}

						});
					}

				}
			},
			"headerCallback": function( thead, data, start, end, display ) {
			},
	        "initComplete":function(oSettings, json){
	        	APP.unblockUI(_table.get());
				var api = _table.dataTable().api();
				//搜索控件初始化
	        	if(oSettings.searching == undefined || oSettings.searching){ //未定义则为默认启用
	        		var searchHTML = "<label><div class='input-icon left'>" +
	        				"<input type='search' class='form-control input-sm' placeholder='请输入搜索内容' aria-controls='"+tableid+"'>" +
	        				"<i class='iconfont icon-search'></i></div></label>";
	        		var _filter = $("div#"+tableid+"_wrapper .dataTables_filter");
	        		_filter.html(searchHTML);
		            //搜索事件
	        		_filter.on('keyup','input',function(e) {
		                if (e.keyCode == 13 || (e.keyCode == 8 && (this.value.length == 0))) {
		                	api.search(this.value).draw();
		                }
		            });
	        		_filter.on('click','.icon-search',function(e) {
		            	var _input = $(this).prev('input');
		                if (_input.val().length > 0) {
		                	api.search(_input.val()).draw();
		                }
		            });
		            //自定义查询表单
		            if(opts.queryModal){
		            	require(['app/form'],function(FM){
		            		var queryBtn = $("<button class='btn btn-sm green' style='margin-bottom: 2px;'>" +
		            				"<i class='fa fa-ellipsis-h fa-lg'/></i></button>");
		            		var modalId = opts.queryModal;
		            		if(typeof opts.queryModal === 'object') modalId = opts.queryModal.id;

		            		FM.queryForm({url:_table.data('url'),queryModal : opts.queryModal},function(data,done){
		            			api.clear().draw();
            					api.rows.add(data).draw();
            					if(typeof done === 'function') done();
		            		});

		            		queryBtn.on('click',function(){
		            			$(modalId).modal('show');
			            	})

			            	_filter.find('.input-icon').append(queryBtn);
							queryBtn.tooltip({"title":"更多查询条件","placement":"auto left"});
		            	})
		            	
		            }else{
		            	_filter.css('margin-right','0');
		            }
	        	}
				//当使用footer，表格没有数据时会出现横向滚动条
				$("div#"+tableid+"_wrapper div.dataTables_scroll").children().css("width","100%");
	         }
		},opts);
		//checkbox选择
		if(default_opt.checkboxSelect){
			var checkBoxolumnDefs = [{
				orderable: false,
				width : "0.7em",
				className: 'select-checkbox',
				targets: 0
			}];
			default_opt = $.extend(default_opt,{
				select: {
					style:    'multi',
					selector: 'td:first-child',
					info : false
				}}
			,true);
			if((default_opt.ordering || _table.data("ordering")) && !$.isArray(default_opt.order)){
				default_opt.order = [[1,'asc']];
			}
			if($.isArray(default_opt.columnDefs)){
				default_opt.columnDefs = checkBoxolumnDefs.concat(default_opt.columnDefs);
			}else{
				default_opt.columnDefs = checkBoxolumnDefs;
			}
			if($.isArray(default_opt.columns)){
				default_opt.columns = [{"data":null,
					"defaultContent" : "",
					"title":"<i class='fa fa-square-o'></i>"}].concat(default_opt.columns);
			}else{
				var _checkboxSelect = $("<th data-column='select-checkbox'><i class='fa fa-square-o'></i></th>");
				_table.find("thead>tr").prepend(_checkboxSelect);
			}
		}

		//buttons清空,按页面toolbar中的按钮显示
		default_opt.buttons = [];
		$("#"+(default_opt.toolbar ? default_opt.toolbar : (tableid+"-toolbar"))).children().each(function(){
			var _btn = $(this);
			var _btn_type = _btn.data('role');
			if(_btn.html() != ""){
				default_opt.buttons.push({
					text: _btn.html(),
					className: _btn.attr("class"),
					action: function ( e, dt, node, config ) {
						if(_btn_type == 'addRecord') _addEditRecord(e,dt, node,'add');
						else if(_btn_type == 'saveRecord') _addEditRecord(e,dt, node,'save');
						else if(_btn_type == 'deleteRecord') _deleteRecord(e,dt, node);
						else if(typeof default_opt[_btn.data("role")] === 'function') default_opt[_btn.data("role")].call(this,e,dt, node);
					}
				});
			}else{
				default_opt.buttons.push(_btn_type);
			}
			_btn.remove();
		});
		return _getDataTable(_table,default_opt,function(otable){
			//初始化表格工具栏 ，增加ID约束
			var toolbar = $("div#"+tableid+"_wrapper>div.dt-buttons");
			var pageToolbar = $("#"+(default_opt.toolbar ? default_opt.toolbar : (tableid+"-toolbar")));
			//初始化页面toolbar中的自定义按钮
			pageToolbar.children('.btn[data-role]').each(function(){
				var _btn = $(this);
				var _btn_type = _btn.data('role');
				_btn.click(function(e){
					if(_btn_type == 'addRecord') _addEditRecord(e,otable, _btn.get(),'add');
					else if(_btn_type == 'saveRecord') _addEditRecord(e,otable, _btn.get(),'save');
					else if(_btn_type == 'deleteRecord') _deleteRecord(e,otable, _btn.get());
					else if(typeof default_opt[_btn_type] === 'function') default_opt[_btn_type](e,otable, _btn.get());
				});
			});

			//页面toolbar中的按钮追加至dt-buttons
			pageToolbar.children().appendTo(toolbar);
			/*if(opts.exportBtns){
				var _export_btn_group = $("<div class='btn-group'>");
				var _export_btn_main = $("<button type='button' class='btn btn-sm btn-info'>测试</button>");
				_export_btn_main.click(function(){
					console.log(otable.button(2));
					otable.button(1).trigger();
				});
				_export_btn_group.append(_export_btn_main);
				if(opts.exportBtns.length > 1){
					_export_btn_group.append("<button type='button' class='btn btn-sm btn-info dropdown-toggle' data-toggle='dropdown'><i class='fa fa-angle-down'></i></button>");
					var __export_btn_dropdown = $("<ul class='dropdown-menu' role='menu'>");
					for(var i=0;i<opts.exportBtns.length;i++){
						var _export_btn_menu = $("<li>");
						_export_btn_menu.append(otable.button(i).node());
						__export_btn_dropdown.append(_export_btn_menu);
					}
					_export_btn_group.append(__export_btn_dropdown);
				}
				
				pageToolbar.prepend(_export_btn_group);
			}*/
			
			//表格选择一条和多条记录(如新增、删除等必须要选择记录才能启用)按钮禁用约束
			var _one_btn = toolbar.children('.btn-selectOne');
			var _more_btn = toolbar.children('.btn-selectMore');
			APP.disableBtn(_one_btn);
			APP.disableBtn(_more_btn);
			otable.on( 'draw.dt', function () {
				if(otable.selectedCount() == 0){
					APP.disableBtn(_one_btn);
					APP.disableBtn(_more_btn);
				}
			});
			otable.on( 'select', function ( e, dt, type, indexes ) {
				if(type === 'row'){
					APP.enableBtn(_more_btn);
					if(otable.selectedCount() == 1) {
						APP.enableBtn(_one_btn);
					}else{
						APP.disableBtn(_one_btn);
					}
				}
			});
			otable.on( 'deselect', function ( e, dt, type, indexes ) {
				if(type === 'row'){
					if(otable.selectedCount() == 1) {
						APP.enableBtn(_one_btn);
					}else if(otable.selectedCount() > 1) {
						APP.disableBtn(_one_btn);
						APP.enableBtn(_more_btn);
					}else{
						APP.disableBtn(_one_btn);
						APP.disableBtn(_more_btn);
					}
				}
			});

			//按钮使用文字标识，暂时不使用title
			/*$('a.buttons-copy.buttons-flash').attr("title","复制");
			$('a.buttons-excel.buttons-flash').attr("title","导出为Excel");
			$('a.buttons-pdf.buttons-flash').attr("title","导出为Pdf");
			$('a.buttons-print').attr("title","打印");*/
			/*$(window).resize(function(){
				otable.draw(false);
			});*/
			//滚动条处理,当没有显示滚动条时列宽100%
			if(default_opt.scrollY){
				var _scrollBody = $("div#"+tableid+"_wrapper .dataTables_scrollBody");
				if(_scrollBody.height() > _table.height()){
					$("div#"+tableid+"_wrapper .dataTables_scrollHeadInner").css({width: "100%"});
					$("div#"+tableid+"_wrapper .dataTables_scrollHeadInner table").css({width: "100%"});
				}else if(default_opt.tableType == 'treetable'){
					_scrollBody.css("overflow-y","scroll");
				}
			}
			/*otable.on( 'column-sizing.dt', function ( e, settings ) {

			} );*/


			_table.on('click','td a[dt-detail]',function(){
				var curr_row = otable.row($(this).closest('td'));
				curr_row.select();
				if(default_opt.detailPage)
					APP.loadInnerPage(APP.getPageContainer(_table),default_opt.detailPage,curr_row);
			})
			if($.isArray(default_opt.rowOperation)){
				_table.on('click','td a[dt-edit]',function(e){
					var curr_row = otable.row($(this).closest('td'));
					curr_row.select();
					_addEditRecord(e,otable, curr_row,'save');
				});
				_table.on('click','td a[dt-delete]',function(e){
					var curr_row = otable.row($(this).closest('td'));
					curr_row.select();
					_deleteRecord(e,otable, curr_row,'save');
				})

			}

			//checkbox选择
			if(default_opt.checkboxSelect){
				$(otable.column('.select-checkbox').header()).click(function(){
					if(otable.rows().count() > 0){
						var _sel_all = $(this).children('i');
						if(_sel_all.hasClass('fa-square-o')){
							otable.rows().select();
							_sel_all.removeClass('fa-square-o').addClass('fa-check-square-o');
						}else{
							otable.rows().deselect();
							_sel_all.removeClass('fa-check-square-o').addClass('fa-square-o');
						}
					}
				});
			}
			if(callback && typeof callback == "function")callback(otable);
		});
	};
	/**
	* 表格初始化
	* @param  {Arrays} opts 初始化参数,兼容多表格的数组形式[{},{}]
	**/
	function _getDataTable($table,default_opt,callback){
		if(APP.isEmpty(default_opt.dataUrl)) default_opt.dataUrl = $table.data('url');

		default_opt.serverSide = ($table.data('server-side') != undefined && $table.data('server-side') == "true");
		
		var ajax_params = {};
		if(default_opt.params) ajax_params = default_opt.params;//页面定义Ajax请求参数

		//行操作([edit,view,delete]),暂时只支持columns数组方式，权限还未考虑
		if($.isArray(default_opt.rowOperation) && $.isArray(default_opt.columns)){
			var _operation = '';
			for(var i=0;i<default_opt.rowOperation.length;i++){
				_operation += "<a dt-"+default_opt.rowOperation[i]+"><i class='iconfont icon-"+default_opt.rowOperation[i]+"' style='font-size:1.5em'></i></a> "
			}
			default_opt.columns.push({'data' : null,'orderable':false,'title':'操作','defaultContent' : _operation});
		}
		
		if(default_opt.dataUrl != undefined){
			if($.isArray(default_opt.columns)){
				//treetable排序使用TreeBean中的treeSort(parentIds + id),否则显示层级不正确
				if(default_opt.tableType == 'treetable'){
					default_opt.ordering = true;//暂时只能使用treeSort列排序
					for(var i=0;i<default_opt.columns.length;i++){
						default_opt.columns[i].orderable = false;
					}
					default_opt.columns.push({'data' : 'treeSort','visible' : false,'name':'treeSort'});
					default_opt.order = [[default_opt.columns.length-1, 'asc']];
				}
			}else{//两种方式并立，不能同时存在，否则列次序混乱
				var columnArray = new Array();
				$table.find('thead th[data-column]').each(function(index){
					var col_data = $(this).data('column');
					if(col_data === 'dt-detail'){
						columnArray.push({'data' : null,'orderable':false,'defaultContent' : "<a dt-detail><i class='iconfont icon-chevronright'></i></a>"});
					}else if(col_data === ''){
						columnArray.push({'data' : null,'defaultContent' : '','orderable':false});
					}else if(col_data ==='select-checkbox'){
						columnArray.push({'data' : null,'defaultContent' : ''});
					}else{
						columnArray.push({'data' : col_data});
					}
					
				});
				default_opt['columns'] = columnArray;
			}

			//启用data-server-side时表格,不启用搜索框,适合于数据量较大，需要物理分页	
			if(default_opt.serverSide){ 
				default_opt.ajax = {
					"url" : default_opt.dataUrl,
					"data": function ( d ) {
						if(d.order && d.order.length === 1){
							ajax_params.orderBy = columnArray[d.order[0].column].data + " " + d.order[0].dir;
						}
						ajax_params.pageNO = d.start/d.length+1;
						ajax_params.pageSize = d.length < 0 ? 0 : d.length;
						ajax_params.tableDraw = d.draw;
						return ajax_params;
					},
					"dataSrc":function (json) {
						json.recordsFiltered = json.recordsTotal;
						return json.data;
					}
				}
				default_opt["searching"] = false;
				callback($table.DataTable(default_opt));
			}
			//先从服务器加载数据，然后再绘制表格
			else{
				var _data_table = $table.DataTable(default_opt);
				APP.blockUI({'target':$table.get(),'gif':'load-tables'});
				setTimeout(function(){
					API.ajax(default_opt.dataUrl,ajax_params,false,function(ret,status){
						_data_table.rows.add(API.respData(ret)).draw();
						APP.unblockUI($table.get());
						callback(_data_table);
					},function(err){
						APP.unblockUI($table.get());
						APP.notice("系统错误","表格数据获取错误:"+API.respMsg(err),'error');
					});
				},200);

			}
		}else{
			callback($table.DataTable(default_opt));
		}

	}
	
	
	
	//-----------------------------------自定义方法---------------------------------
	/**
     * 获取选择行数据
     */
	DataTable.Api.register( 'selectedRows()', function () {
		return this.rows('.selected').data();
	} );
	/**
	 * 获取选择行数据,转换为纯数组,可指定列，默认全部列
	 */
	DataTable.Api.register( 'selectedRowsData()', function (col) {
		var selectedData = this.rows('.selected').data();
		var listData = new Array();
		for(var i=0;i<selectedData.length;i++){
			if(APP.isEmpty(col))
				listData.push(selectedData[i]);
			else{
				var d = {};
				d[col] = selectedData[i][col];
				listData.push(d);
			}
		}
		return listData;
	} );
	/**
	 * 获取表格数据,转换为纯对象数组
	 */
	DataTable.Api.register( 'tableData()', function (col) {
		var data = this.rows().data();
		console.log(data);
		var listData = new Array();
		for(var i=0;i<data.length;i++){
			if(APP.isEmpty(col))
				listData.push(data[i]);
			else{
				var d = {};
				d[col] = data[i][col];
				listData.push(d);
			}
		}
		return listData;
	} );
	/**
     * 获取选择行的指定列数据 col列名
     */
	DataTable.Api.register( 'selectedColumn()', function (col) {
		var selectedRows = this.rows('.selected');
		var a = [];
		for(var i = 0;i<selectedRows.count();i++){
			a.push(selectedRows.data()[i][col]);
		}
		return a;
	} );
	/**
     * 查询方法
     */
	DataTable.Api.register( 'query()', function (params,callback) {
		var _table = this;
		var opts = _table.init();
		if(params) opts.params = params;
		var $table = $("#"+opts.tableId).get();
		if(opts.tableType == 'treetable'){
			/*_table.destroy();
			$("#"+opts.tableId).empty();
			$("#"+opts.tableId).treetable(opts);*/
		}else{
			_table.clear().draw();
			APP.blockUI({'target':$table,'gif':'load-tables'});
			API.ajax(opts.dataUrl,opts.params,true,function(ret,status){
				_table.rows.add(API.respData(ret)).draw();
				APP.unblockUI($table);
			});
		}
	} );
	/**
     * 增加一行数据
     */
	DataTable.Api.register( 'addRow()', function (row) {
		var newRow = this.row.add(row).draw();
		//treetable调用move方法保持树形结构
		if(this.init().tableType == 'treetable'){
			this.search('').draw();
			$(this.table().node()).treetable("move",newRow.node(), row.parentId);
		}
		return newRow;
	} );
	
	/**
     * 修改已选择行数据
     */
	DataTable.Api.register( 'updateSelectedRow()', function (row) {
		var updatedRow = this.row(this.rows('.selected')[0]).data(row);
		//treetable调用move方法保持树形结构
		if(this.init().tableType == 'treetable'){
			//this.search('').draw();
			var $treeTable = $(this.table().node());
			var node = $treeTable.treetable("node",row.id);
			node.treeCell.prepend(node.indenter);
			node.render();
			//先移动节点以渲染,后循环子节点更新节点数据,效率待检测,如低效则刷新表格
			$(this.table().node()).treetable("move",row.id, row.parentId);
			this.rows( function ( idx, data, node ) {
				return data.parentTree.indexOf(row.id) > 0 ? true : false;
		    }).every( function ( rowIdx, tableLoop, rowLoop ) {
		    	var d = this.data();
		    	var p_idx = d.parentIds.indexOf(row.id);
				var parent_rep = d.parentIds.substring(0,p_idx);
				var parent_rep_t = (!APP.isEmpty(row.parentIds)) ? (row.parentIds + ",'") : "'";
				d.parentIds = d.parentIds.replace(parent_rep,parent_rep_t);
				var tree_idx = d.parentTree.indexOf(row.id);
				parent_rep = d.parentTree.substring(0,tree_idx);
				var parent_tre = (!APP.isEmpty(row.parentTree)) ? (row.parentTree + "," + row.sort + "-") : (row.sort + "-");
				d.parentTree = d.parentTree.replace(parent_rep,parent_tre);
				d.treeSort = d.treeSort.replace(parent_rep,parent_tre);
				this.data(d);
				node = $treeTable.treetable("node",d.id);
				node.treeCell.prepend(node.indenter);
				node.render();
		    });
		}
		return updatedRow.draw();
	} );
	/**
     * 删除已选择行数据
     */
	DataTable.Api.register( 'deleteSelectedRow()', function () {
		var dt = this;
		var tableNode = dt.table().node();
		if(dt.init().tableType == 'treetable'){
			dt.rows('.selected').every(function ( rowIdx, tableLoop, rowLoop ) {
				if(this.data() && this.data().id){
					var selectedId = this.data().id;
					$(tableNode).treetable("removeNode",selectedId);
					dt.rows( function ( idx, data, node ) {
						return data.parentTree.indexOf(selectedId) > 0 ? true : false;
				    }).remove();
				}
		    });
		}
		dt.rows('.selected').remove().draw();
		
	} );
	
	/**
     * 已选总行数
     */
	DataTable.Api.register( 'selectedCount()', function () {
		return this.rows('.selected').count();
	} );
	/**
	 * 汇总
	 */
	DataTable.Api.register( 'sum()', function ( ) {
		return this.flatten().reduce( function ( a, b ) {
			if ( typeof a === 'string' ) {
				a = a.replace(/[^\d.-]/g, '') * 1;
			}
			if ( typeof b === 'string' ) {
				b = b.replace(/[^\d.-]/g, '') * 1;
			}

			return a + b;
		}, 0 );
	} );

	
	return DataTable;
});