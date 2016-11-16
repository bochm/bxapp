define(['app/common','app/datatables'],function(APP,DataTable){
	var Node, Tree, methods;

	  Node = (function() {
	    function Node(row, tree, settings) {
	      var parentId;

	      this.row = row;
	      this.tree = tree;
	      this.settings = settings;

	      // TODO Ensure id/parentId is always a string (not int)
	      this.id = this.row.data(this.settings.nodeIdAttr);

	      // TODO Move this to a setParentId function?
	      parentId = this.row.data(this.settings.parentIdAttr);
	      if (parentId != null && parentId !== "") {
	        this.parentId = parentId;
	      }

	      this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
	      this.expander = $(this.settings.expanderTemplate);
	      this.indenter = $(this.settings.indenterTemplate);
	      this.children = [];
	      this.initialized = false;
	      this.treeCell.prepend(this.indenter);
	    }

	    Node.prototype.addChild = function(child) {
	      return this.children.push(child);
	    };

	    Node.prototype.ancestors = function() {
	      var ancestors, node;
	      node = this;
	      ancestors = [];
	      while (node = node.parentNode()) {
	        ancestors.push(node);
	      }
	      return ancestors;
	    };

	    Node.prototype.collapse = function() {
	      if (this.collapsed()) {
	        return this;
	      }

	      this.row.removeClass("expanded").addClass("collapsed");

	      this._hideChildren();
	      this.expander.attr("title", this.settings.stringExpand);

	      if (this.initialized && this.settings.onNodeCollapse != null) {
	        this.settings.onNodeCollapse.apply(this);
	      }

	      return this;
	    };

	    Node.prototype.collapsed = function() {
	      return this.row.hasClass("collapsed");
	    };

	    // TODO destroy: remove event handlers, expander, indenter, etc.

	    Node.prototype.expand = function() {
	      if (this.expanded()) {
	        return this;
	      }

	      this.row.removeClass("collapsed").addClass("expanded");

	      if (this.initialized && this.settings.onNodeExpand != null) {
	        this.settings.onNodeExpand.apply(this);
	      }

	      if ($(this.row).is(":visible")) {
	        this._showChildren();
	      }

	      this.expander.attr("title", this.settings.stringCollapse);

	      return this;
	    };

	    Node.prototype.expanded = function() {
	      return this.row.hasClass("expanded");
	    };

	    Node.prototype.hide = function() {
	      this._hideChildren();
	      this.row.hide();
	      return this;
	    };

	    Node.prototype.isBranchNode = function() {
	      if(this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
	        return true;
	      } else {
	        return false;
	      }
	    };

	    Node.prototype.updateBranchLeafClass = function(){
	      this.row.removeClass('branch');
	      this.row.removeClass('leaf');
	      this.row.addClass(this.isBranchNode() ? 'branch' : 'leaf');
	    };

	    Node.prototype.level = function() {
	      return this.ancestors().length;
	    };

	    Node.prototype.parentNode = function() {
	      if (this.parentId != null) {
	        return this.tree[this.parentId];
	      } else {
	        return null;
	      }
	    };

	    Node.prototype.removeChild = function(child) {
	      var i = $.inArray(child, this.children);
	      return this.children.splice(i, 1)
	    };

	    Node.prototype.render = function() {
	      var handler,
	          settings = this.settings,
	          target;
	      if (settings.expandable === true && this.isBranchNode()) {
	        handler = function(e) {
	          $(this).parents("table").treetable("node", $(this).parents("tr").data(settings.nodeIdAttr)).toggle();
	          return e.preventDefault();
	        };

	        this.indenter.html(this.expander);
	        target = settings.clickableNodeNames === true ? this.treeCell : this.expander;

	        target.off("click.treetable").on("click.treetable", handler);
	        target.off("keydown.treetable").on("keydown.treetable", function(e) {
	          if (e.keyCode == 13) {
	            handler.apply(this, [e]);
	          }
	        });
	      }
	      if(this.children.length  === 0) this.indenter.html(""); //节点没有子节点时删除expander  mod by bcm
	      this.indenter[0].style.paddingLeft = "" + (this.level() * settings.indent) + "px";

	      return this;
	    };

	    Node.prototype.reveal = function() {
	      if (this.parentId != null) {
	        this.parentNode().reveal();
	      }
	      return this.expand();
	    };

	    Node.prototype.setParent = function(node) {
	      if (this.parentId != null) {
	        this.tree[this.parentId].removeChild(this);
	      }
	      this.parentId = node.id;
	      this.row.data(this.settings.parentIdAttr, node.id);
	      return node.addChild(this);
	    };

	    Node.prototype.show = function() {
	      if (!this.initialized) {
	        this._initialize();
	      }
	      this.row.show();
	      if (this.expanded()) {
	        this._showChildren();
	      }
	      return this;
	    };

	    Node.prototype.toggle = function() {
	      if (this.expanded()) {
	        this.collapse();
	      } else {
	        this.expand();
	      }
	      return this;
	    };

	    Node.prototype._hideChildren = function() {
	      var child, _i, _len, _ref, _results;
	      _ref = this.children;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        child = _ref[_i];
	        _results.push(child.hide());
	      }
	      return _results;
	    };

	    Node.prototype._initialize = function() {
	      var settings = this.settings;

	      this.render();

	      if (settings.expandable === true && settings.initialState === "collapsed") {
	        this.collapse();
	      } else {
	        this.expand();
	      }

	      if (settings.onNodeInitialized != null) {
	        settings.onNodeInitialized.apply(this);
	      }

	      return this.initialized = true;
	    };

	    Node.prototype._showChildren = function() {
	      var child, _i, _len, _ref, _results;
	      _ref = this.children;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        child = _ref[_i];
	        _results.push(child.show());
	      }
	      return _results;
	    };

	    return Node;
	  })();

	  Tree = (function() {
	    function Tree(table, settings) {
	      this.table = table;
	      this.settings = settings;
	      this.tree = {};

	      // Cache the nodes and roots in simple arrays for quick access/iteration
	      this.nodes = [];
	      this.roots = [];
	    }

	    Tree.prototype.collapseAll = function() {
	      var node, _i, _len, _ref, _results;
	      _ref = this.nodes;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        node = _ref[_i];
	        _results.push(node.collapse());
	      }
	      return _results;
	    };

	    Tree.prototype.expandAll = function() {
	      var node, _i, _len, _ref, _results;
	      _ref = this.nodes;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        node = _ref[_i];
	        _results.push(node.expand());
	      }
	      return _results;
	    };

	    Tree.prototype.findLastNode = function (node) {
	      if (node.children.length > 0) {
	        return this.findLastNode(node.children[node.children.length - 1]);
	      } else {
	        return node;
	      }
	    };

	    Tree.prototype.loadRows = function(rows) {
	      var node, row, i;

	      if (rows != null) {
	        for (i = 0; i < rows.length; i++) {
	          row = $(rows[i]);

	          if (row.data(this.settings.nodeIdAttr) != null) {
	            node = new Node(row, this.tree, this.settings);
	            this.nodes.push(node);
	            this.tree[node.id] = node;

	            if (node.parentId != null && this.tree[node.parentId]) {
	              this.tree[node.parentId].addChild(node);
	            } else {
	              this.roots.push(node);
	            }
	          }
	        }
	      }

	      for (i = 0; i < this.nodes.length; i++) {
	        node = this.nodes[i].updateBranchLeafClass();
	      }

	      return this;
	    };

	    Tree.prototype.move = function(node, destination) {
	      // Conditions:
	      // 1: +node+ should not be inserted as a child of +node+ itself.
	      // 2: +destination+ should not be the same as +node+'s current parent (this
	      //    prevents +node+ from being moved to the same location where it already
	      //    is).
	      // 3: +node+ should not be inserted in a location in a branch if this would
	      //    result in +node+ being an ancestor of itself.
	      var nodeParent = node.parentNode();
	      if(destination == undefined || destination == null || destination == ''){//将节点移动至根 mod by bcm
	    	  if (nodeParent) {
	    		  nodeParent.removeChild(node);
	    		  node.parentId = null;
	    		  node.row.data(node.settings.parentIdAttr, null);
	    		  node.render();
	    		  this._moveRows(node, null);
	  	      }
	      }else if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
	        node.setParent(destination);
	        this._moveRows(node, destination);

	        // Re-render parentNode if this is its first child node, and therefore
	        // doesn't have the expander yet.
	        if (node.parentNode().children.length === 1) {
	          node.parentNode().render();
	        }
	      }

	      if(nodeParent){
	        nodeParent.updateBranchLeafClass();
	        if(nodeParent.children.length === 0) nodeParent.render(); //原节点如没有子节点则重新渲染
	      }
	      if(node.parentNode()){
	        node.parentNode().updateBranchLeafClass();
	      }
	      node.updateBranchLeafClass();
	      return this;
	    };

	    Tree.prototype.removeNode = function(node) {
	      // Recursively remove all descendants of +node+
	      this.unloadBranch(node);

	      // Remove node from DOM (<tr>)
	      node.row.remove();

	      // Remove node from parent children list
	      if (node.parentId != null) {
	        node.parentNode().removeChild(node);
	        if(node.parentNode().children.length  === 0) node.parentNode().indenter.html("");//父节点没有子节点
	      }

	      // Clean up Tree object (so Node objects are GC-ed)
	      delete this.tree[node.id];
	      this.nodes.splice($.inArray(node, this.nodes), 1);

	      return this;
	    }

	    Tree.prototype.render = function() {
	      var root, _i, _len, _ref;
	      _ref = this.roots;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        root = _ref[_i];

	        // Naming is confusing (show/render). I do not call render on node from
	        // here.
	        root.show();
	      }
	      return this;
	    };

	    Tree.prototype.sortBranch = function(node, sortFun) {
	      // First sort internal array of children
	      node.children.sort(sortFun);

	      // Next render rows in correct order on page
	      this._sortChildRows(node);

	      return this;
	    };

	    Tree.prototype.unloadBranch = function(node) {
	      // Use a copy of the children array to not have other functions interfere
	      // with this function if they manipulate the children array
	      // (eg removeNode).
	      var children = node.children.slice(0),
	          i;

	      for (i = 0; i < children.length; i++) {
	        this.removeNode(children[i]);
	      }

	      // Reset node's collection of children
	      node.children = [];

	      node.updateBranchLeafClass();

	      return this;
	    };

	    Tree.prototype._moveRows = function(node, destination) {
	      var children = node.children, i;
	      if(destination) node.row.insertAfter(destination.row);
	      node.render();

	      // Loop backwards through children to have them end up on UI in correct
	      // order (see #112)
	      for (i = children.length - 1; i >= 0; i--) {
	        this._moveRows(children[i], node);
	      }
	    };

	    // Special _moveRows case, move children to itself to force sorting
	    Tree.prototype._sortChildRows = function(parentNode) {
	      return this._moveRows(parentNode, parentNode);
	    };

	    return Tree;
	  })();

	  // jQuery Plugin
	  methods = {
	    init: function(options, force) {
	      var settings;
	      settings = $.extend({
	        branchAttr: "ttBranch",
	        clickableNodeNames: false,
	        column: 0,
	        columnElType: "td", // i.e. 'td', 'th' or 'td,th'
	        expandable: false,
	        expanderTemplate: "<a href='#'>&nbsp;</a>",
	        indent: 20,
	        indenterTemplate: "<span class='indenter'></span>",
	        initialState: "collapsed",
	        nodeIdAttr: "ttId", // maps to data-tt-id
	        parentIdAttr: "ttParentId", // maps to data-tt-parent-id
	        stringExpand: "展开",
	        stringCollapse: "收起",

	        // Events
	        onInitialized: null,
	        onNodeCollapse: null,
	        onNodeExpand: null,
	        onNodeInitialized: null
	      }, options);

	      return this.each(function() {
	        var el = $(this), tree;

	        if (force || el.data("treetable") === undefined) {
	          tree = new Tree(this, settings);
	          tree.loadRows(this.rows).render();

	          el.addClass("treetable").data("treetable", tree);

	          if (settings.onInitialized != null) {
	            settings.onInitialized.apply(tree);
	          }
	        }

	        return el;
	      });
	    },

	    destroy: function() {
	      return this.each(function() {
	        return $(this).removeData("treetable").removeClass("treetable");
	      });
	    },

	    collapseAll: function() {
	      this.data("treetable").collapseAll();
	      return this;
	    },

	    collapseNode: function(id) {
	      var node = this.data("treetable").tree[id];

	      if (node) {
	        node.collapse();
	      } else {
	        throw new Error("Unknown node '" + id + "'");
	      }

	      return this;
	    },

	    expandAll: function() {
	      this.data("treetable").expandAll();
	      return this;
	    },

	    expandNode: function(id) {
	      var node = this.data("treetable").tree[id];

	      if (node) {
	        if (!node.initialized) {
	          node._initialize();
	        }
	        
	        node.expand();
	      } else {
	        throw new Error("Unknown node '" + id + "'");
	      }

	      return this;
	    },

	    loadBranch: function(node, rows) {
	      var settings = this.data("treetable").settings,
	          tree = this.data("treetable").tree;

	      // TODO Switch to $.parseHTML
	      rows = $(rows);

	      if (node == null) { // Inserting new root nodes
	        this.append(rows);
	      } else {
	        var lastNode = this.data("treetable").findLastNode(node);
	        rows.insertAfter(lastNode.row);
	      }

	      this.data("treetable").loadRows(rows);

	      // Make sure nodes are properly initialized
	      rows.filter("tr").each(function() {
	        tree[$(this).data(settings.nodeIdAttr)].show();
	      });

	      if (node != null) {
	        // Re-render parent to ensure expander icon is shown (#79)
	        node.render().expand();
	      }

	      return this;
	    },

	    move: function(nodeId, destinationId) {
	      var destination, node;
	      destination = this.data("treetable").tree[destinationId];
	      if(typeof nodeId === 'object'){//新增节点,用于新增的行追加至treetable中的某个节点
	    	  this.data("treetable").loadRows([nodeId]);
	    	  var _nid = $(nodeId).data(this.data("treetable").settings.nodeIdAttr);
	    	  node = this.data("treetable").tree[_nid];
	      }else{
	    	  node = this.data("treetable").tree[nodeId];
	      }
	      //父节点及祖先节点同时展开  add by bcm
    	  if (destination) {
    		  if (!destination.initialized) {
    			  destination._initialize();
    		  }
    		  var parentNd = destination.parentNode();
		      while(parentNd != null){
		    	  if (!parentNd.initialized) {
		    		  parentNd._initialize();
		    	  }
		          parentNd.expand();
		          parentNd = parentNd.parentNode();
		      }
		      if(destination.children.length >= 1) destination.collapse(); //父节点需要重新闭合渲染
    		  destination.expand();
  	      }
	      this.data("treetable").move(node, destination);
	      //新增节点时父节点如果没有子节点则需要渲染
	      if(typeof nodeId === 'object' && destination && destination.children.length === 1) destination.render();
	      return this;
	    },

	    node: function(id) {
	      return this.data("treetable").tree[id];
	    },

	    removeNode: function(id) {
	      var node = this.data("treetable").tree[id];

	      if (node) {
	        this.data("treetable").removeNode(node);
	      } else {
	        throw new Error("Unknown node '" + id + "'");
	      }

	      return this;
	    },

	    reveal: function(id) {
	      var node = this.data("treetable").tree[id];

	      if (node) {
	        node.reveal();
	      } else {
	        throw new Error("Unknown node '" + id + "'");
	      }

	      return this;
	    },

	    sortBranch: function(node, columnOrFunction) {
	      var settings = this.data("treetable").settings,
	          prepValue,
	          sortFun;

	      columnOrFunction = columnOrFunction || settings.column;
	      sortFun = columnOrFunction;

	      if ($.isNumeric(columnOrFunction)) {
	        sortFun = function(a, b) {
	          var extractValue, valA, valB;

	          extractValue = function(node) {
	            var val = node.row.find("td:eq(" + columnOrFunction + ")").text();
	            // Ignore trailing/leading whitespace and use uppercase values for
	            // case insensitive ordering
	            return $.trim(val).toUpperCase();
	          }

	          valA = extractValue(a);
	          valB = extractValue(b);

	          if (valA < valB) return -1;
	          if (valA > valB) return 1;
	          return 0;
	        };
	      }

	      this.data("treetable").sortBranch(node, sortFun);
	      return this;
	    },

	    unloadBranch: function(node) {
	      this.data("treetable").unloadBranch(node);
	      return this;
	    }
	  };

	  $.fn.treetable = function(method) {
		  var _this = this;
		  if (methods[method]) {
			  return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		  } else if (typeof method === 'object' || !method) {
			 
			  var init_opts = $.extend(true,{
				   	//"ajax" : {"async":false,"url":method.url,"dataSrc" : APP_CONF.DATA},//取消同步,树形初始化时间会无法加载样式,ajax返回json结果取值为 APP_CONF.DATA = "data"
					"processing" : true,
					"serverSide" : false,
					"tableType" : "treetable",//treetable排序使用TreeBean中的treeSort(parentIds + sort + id),否则显示层级不正确
					"language": {
					    "info": "共_TOTAL_条记录",
					    "infoEmpty": ""
					},
					"createdRow": function (nRow, aData, iDataIndex) {
						$(nRow).attr("data-tt-id",aData[method.tid]);
						$(nRow).attr("data-tt-parent-id",aData[method.tpid]);
			         }
				},method);
			  init_opts.paging = false;//暂时不支持分页
			  
			  var _table = $(_this);
			  var tableid = _table.attr('id');
			  
			  _table.initTable(init_opts,function(otable){
				  var treetable = methods.init.call(_this, method);
				  //初始化按钮
				  if(init_opts.expandBtn){
					  $("div#"+tableid+"_wrapper>div.dataTables_btn_toolbar>.dt-buttons").prepend(
						"<div class='btn-group'>" +
						"<button type='button' class='btn btn-sm btn-primary dropdown-toggle' data-toggle='dropdown'><i class='fa fa-minus-square-o'></i> 展开 <i class='fa fa-angle-down'></i></button>" + 
						"<ul class='dropdown-menu' role='menu'>"+
						"<li><a href='#' id='"+tableid+"_expand_all'><i class='fa fa-minus-square'></i>&nbsp; 全部展开</a></li>"+
						"<li><a href='#' id='"+tableid+"_collapse_all'><i class='fa fa-plus-square'></i>&nbsp; 全部收起</a></li></ul></div>");
						$('#'+tableid+'_expand_all').click(function(){
							methods.expandAll.apply(_this);
						});
						$('#'+tableid+'_collapse_all').click(function(){
							methods.collapseAll.apply(_this);
						});
						
				  }
			  });
	    	
		  } else {
			  return alert("方法[ " + method + "]不存在");
		  }
	  };

	  // Expose classes to world
	  this.TreeTable || (this.TreeTable = {});
	  this.TreeTable.Node = Node;
	  this.TreeTable.Tree = Tree;
	  
	  DataTable.TreeTable = this.TreeTable;
	  return DataTable;
});