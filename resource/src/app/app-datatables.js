/**
 * @fileOverview jquery.dataTables扩展
 * @author bx
 * @ignore
 */
define(["app/common","datatables","datatables/buttons/flash","datatables/buttons/print","datatables/select",
        "datatables/responsive","datatables/fixedHeader",
        "css!lib/jquery/datatables/dataTables.bootstrap.css"],function(APP,DataTable) {
	//-------------------默认参数初始化及修改----------------------------------
	
	//工具按钮设置
	var btn_opts = {
			"pdf": {"icon":"<i class='fa fa-file-pdf-o'></i> ","text":"导出PDF"},
			"copy":{"icon":"<i class='fa fa-copy'></i> ","text":"复制"},
			"excel":{"icon":"<i class='fa fa-file-excel-o'></i> ","text":"导出EXCEL"},
			"print":{"icon":"<i class='fa fa-print'></i> ","text":"打印"}
	}
	/**
     * 默认参数设置
     */
	var default_opts = {
			"dom": "<'dataTables_btn_toolbar'B><'dataTables_filter'><'table-scrollable'tr<'table-foot-bar' ilp>>",//f改为自定义回车搜索
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
						"pdf":btn_opts.pdf.icon,
						"copy":btn_opts.copy.icon,
						"copyTitle":"复制到剪贴板",
						"copyInfo":{_: '以复制 %d 行到剪贴板',1: '复制 1 行到剪贴板'},
						"excel":btn_opts.excel.icon+btn_opts.excel.text,
						"print":btn_opts.print.icon
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
    						'<div class="modal-dialog" role="document">'+
    							'<div class="modal-content">'+
    								'<div class="modal-header">'+
    									'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
    								'</div>'+
    								'<div class="modal-body"/>'+
    							'</div>'+
    						'</div>'+
    					'</div>'
    				);

    				if ( options && options.header ) {
    					modal.find('div.modal-header')
    						.append( '<h4 class="modal-title">'+options.header( row )+'</h4>' );
    				}

    				modal.find( 'div.modal-body' ).append( render() );
    				modal
    					.appendTo( 'body' )
    					.modal();
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
				className: 'btn btn-sm'
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
	
	
	$.fn.dataTable.Buttons.swfPath = APP.jsPath+'/lib/jquery/datatables/swf/flashExport.swf';
	
	/**
     * 表格默认新增修改方法
     */
	function _addEditRecord(dt, node,e,type){
		var _options = dt.init();
		if(typeof _options.addRecord === 'function' && type == 'add'){
			_options.addRecord(dt,node,e);
		}else if(typeof _options.saveRecord === 'function' && type == 'save'){
			_options.saveRecord(dt,node,e);
		}else if(!APP.isEmpty(_options.addModal) || !APP.isEmpty(_options.addEditModal) || !APP.isEmpty(_options.editModal)){
			var _modal =  _options.addEditModal || _options.addModal || _options.editModal;
			if(_modal.url){
				var _modal_url = _modal.url;
				if(!APP.isEmpty(_options.addEditModal)){ //新增、修改共用modal区分act
					if(_modal.url.indexOf("?") >0) _modal_url = _modal.url + '&act='+type;
					else _modal_url = _modal.url + '?act='+type;
				}
				APP.showModal(_modal_url,_modal.id,_modal);
			}else{
				$(_modal).modal('show');
			}
		}else if(!APP.isEmpty(_options.addForm) || !APP.isEmpty(_options.addEditForm) || !APP.isEmpty(_options.editForm)){
			var _form = _options.addEditForm || _options.addForm || _options.editForm;
			var _form_validate = {};
			if(_form.addValidate && type == 'add'){
				if(typeof _form.addValidate === 'object') _form_validate = _form.addValidate;
				else if(typeof _form.addValidate === 'function') _form_validate = _form.addValidate.call(this,dt);
			}else if(_form.editValidate && type == 'save'){
				if(typeof _form.editValidate === 'object') _form_validate = _form.editValidate;
				else if(typeof _form.editValidate === 'function') _form_validate = _form.editValidate.call(this,dt);
			}else if(_form.validate){
				_form_validate = _form.validate;
			}
			var _field_opts = _form.fieldOpts || {};
			var form_opts = {formAction : type,clearForm : true,autoClear : true,type : 'post',validate : _form_validate,fieldOpts:_field_opts,
					rules : _form.rules,formData : null,url:((_form.url || $(_form.el).attr("action")) + "/" + type)};
			if(type == 'save') {
				form_opts.formData = dt.selectedRows()[0];
				form_opts.clearForm = false;
				//form_opts.autoClear = false;
			}
			require(['app/form'],function(FORM){
				$(_form.el).initForm(form_opts,function(data){
					if(type == 'add') dt.addRow(data);
					else dt.updateSelectedRow(data);
				});
			});
			$(_form.el).closest('.modal.fade').modal('show');
		}else{
			alert("请初始化表格参数中的addForm|addEditForm|addModal|addEditModal|addRecord|saveRecord选项");
		}
	}
	/**
     * 表格默认删除方法
     */
	function _deleteRecord(dt,node,e){
		if(dt.selectedCount() < 1){
			APP.info('请选择需要删除的记录');
			return;
		}
		var _options = dt.init();
		if(typeof _options.deleteRecord === 'function'){
			_options.deleteRecord(dt,node,e);
		}else if(!APP.isEmpty(_options.deleteRecord) && !APP.isEmpty(_options.deleteRecord.url)){
			APP.confirm('','是否删除选择的记录?',function(){
				var _id_column = _options.deleteRecord.id ? _options.deleteRecord.id : 'id';
				APP.postJson(_options.deleteRecord.url,dt.selectedColumn(_id_column),null,function(ret,status){
					if(ret.OK){
						dt.deleteSelectedRow();
						APP.success(ret[APP.MSG]);
					}else{
						APP.success(ret[APP.MSG]);
					}
				});
			})
		}else{
			alert("请初始化表格参数中的deleteRecord选项");
		}
	}
	/**
     * 自定义按钮--新增
     */
	$.fn.dataTable.ext.buttons.addRecord = {
		text: "<i class='fa fa-copy'></i> 新增",
		className: 'btn btn-sm btn-primary btn-addRecord',
		action: function ( e, dt, node, config ) {
			_addEditRecord(dt, node,e,'add');
		}
	};
	/**
     * 自定义按钮--修改
     */
	$.fn.dataTable.ext.buttons.saveRecord = {
		text: "<i class='fa fa-edit'></i> 修改",
		className: 'btn btn-sm btn-primary btn-saveRecord',
		action: function ( e, dt, node, config ) {
			if(dt.selectedCount() != 1){
				APP.info('请选择一条需要修改的记录');
				return;
			}
			_addEditRecord( dt, node,e,'save');
		}
	};
	/**
     * 自定义按钮--删除
     */
	$.fn.dataTable.ext.buttons.deleteRecord = {
		text: "<i class='fa fa-trash-o'></i> 删除",
		className: 'btn btn-sm btn-warning btn-deleteRecord',
		action: function ( e, dt, node, config ) {
			_deleteRecord(dt,node,e);
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
		
		var tableid = _table.attr('id');
		if(APP.isEmpty(tableid)){
			alert("请指定table id");
			return;
		}
		DataTable.getTable("#"+tableid).destroy();
		var default_opt = $.extend(true,{
			"processing" : true,
			"serverSide" : false,
			"paging": false,
			"info": false,
			"lengthMenu": [[5,10, 25, 50, -1], [5,10, 25, 50, "全部"]],
			"pageLength": 10,
			"autoWidth": false,
			"scrollCollapse": true,
			"select": {style: 'os',info:false},
			"buttons": [],
			//"buttons":[{extend: 'collection',text: '导出', buttons : ['selectAll','selectNone','print']},"addRecord","deleteRecord"],
			"createdRow": function (nRow, aData, iDataIndex) {},
	        "initComplete":function(oSettings, json){
	        	if(oSettings.searching == undefined || oSettings.searching){ //未定义则为默认启用
	        		var searchHTML = "<label><div class='input-icon right'><input type='search' class='form-control input-sm' placeholder='请输入搜索内容' aria-controls='"+tableid+"'><i class='iconfont icon-search'></i></div></label>"; 
		            $("div#"+tableid+"_wrapper .dataTables_filter").html(searchHTML);
		            //搜索事件
		            $("div#"+tableid+"_wrapper .dataTables_filter input").on('keyup',function(e) {
		                if (e.keyCode == 13 || (e.keyCode == 8 && (this.value.length == 0))) {
		                	_table.dataTable().api().search(this.value).draw();
		                }
		            });
		            $("div#"+tableid+"_wrapper .dataTables_filter .icon-search").on('click',function(e) {
		            	var _input = $(this).prev('input');
		                if (_input.val().length > 0) {
		                	_table.dataTable().api().search(_input.val()).draw();
		                }
		            });
	        	}
	         }
		},opts);
		return _getDataTable(_table,default_opt,function(otable){
			//初始化表格工具栏 ，增加ID约束
			
			var toolbar = $("div#"+tableid+"_wrapper>div.dataTables_btn_toolbar>div.dt-buttons");
			var pageToolbar = $("#"+(default_opt.toolbar ? default_opt.toolbar : (tableid+"-toolbar")));
			
			pageToolbar.find('.btn[data-role]').each(function(){
				var _btn = $(this);
				var _btn_type = _btn.data('role');
				_btn.click(function(e){
					if(_btn_type == 'addRecord') _addEditRecord(otable, _btn.get(),e,'add');
					else if(_btn_type == 'saveRecord') _addEditRecord(otable, _btn.get(),e,'save');
					else if(_btn_type == 'deleteRecord') _deleteRecord(otable, _btn.get(),e);
				});
			});
			
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
			pageToolbar.children().appendTo(toolbar);
			//修改删除按钮禁用约束
			var _save_btn = toolbar.find('.btn-saveRecord');
			var _delete_btn = toolbar.find('.btn-deleteRecord');
			
			APP.disableBtn(_save_btn);
			APP.disableBtn(_delete_btn);
			otable.on( 'draw.dt', function () {
				if(otable.selectedCount() == 0){
					APP.disableBtn(_save_btn);
					APP.disableBtn(_delete_btn);
				}
			});
			otable.on( 'select', function ( e, dt, type, indexes ) {
				if(type === 'row'){
					APP.enableBtn(_delete_btn);
					if(otable.selectedCount() == 1) {
						APP.enableBtn(_save_btn);
					}else{
						APP.disableBtn(_save_btn);
					}
				}
			});
			otable.on( 'deselect', function ( e, dt, type, indexes ) {
				if(type === 'row'){
					if(otable.selectedCount() == 1) {
						APP.enableBtn(_save_btn);
					}else if(otable.selectedCount() > 1) {
						APP.disableBtn(_save_btn);
						APP.enableBtn(_delete_btn);
					}else{
						APP.disableBtn(_save_btn);
						APP.disableBtn(_delete_btn);
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
			
			if(callback && typeof callback == "function")callback(otable);
		});
	};
	/**
	* 表格初始化
	* @param  {Arrays} opts 初始化参数,兼容多表格的数组形式[{},{}]
	**/
	function _getDataTable($table,default_opt,callback){
		default_opt.dataUrl = $table.data('url');
		default_opt.serverSide = ($table.data('server-side') != undefined && $table.data('server-side') == "true");
		
		var ajax_params = {};
		if(default_opt.params) ajax_params = default_opt.params;//页面定义Ajax请求参数
		
		
		
		if(default_opt.dataUrl != undefined){
			var columnArray = (default_opt.columns ? default_opt.columns : new Array());
			$table.find('th[data-column]').each(function(index){
				columnArray.push({'data' : $(this).data('column')});
			});
			//treetable排序使用TreeBean中的treeSort(parentIds + id),否则显示层级不正确
			if(default_opt.tableType == 'treetable'){
				default_opt.ordering = true;//暂时只能使用treeSort列排序
				for(var i=0;i<columnArray.length;i++){
					columnArray[i].orderable = false;
				}
				columnArray.push({'data' : 'treeSort','visible' : false,'name':'treeSort'});
				default_opt.order = [[columnArray.length-1, 'asc']];
			}
			
			default_opt['columns'] = columnArray;
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
				APP.blockUI({'target':$table.get(),'gif':'load-tables'});
				APP.postJson(default_opt.dataUrl,ajax_params,true,function(ret,status){
					default_opt.data = ret;
					APP.unblockUI($table.get());
					callback($table.DataTable(default_opt));
				});
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
	return DataTable;
});