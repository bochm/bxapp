({
	/**
	 * r.js优化压缩,使用dist目录需要修改spring-mvc中的js映射路径为/static/dist/
	 */
    appDir: 'src',//应用源文件路径
    baseUrl: '.',//js目录(相对与appDir)
    dir: 'dist',//目标路径
    modules: [
		/*{
			name: "main",
			//包含所有文件,css需要在外部链接(或者css!定义在define中)
			include: ["app.init","app.datatables", "app.common",
			          "jquery","bootstrap",
		              "datatables","jquery.form","jquery.gritter",
		              "jquery.validate","typeahead","jquery.slimscroll"]
		}*/
        {
            name: "main", //app-init模块合并,名称可以使用main中定义
			//create: true,
			//包含文件,已经在main.js中引用,不能将exclude选项中的jquery插件去除，否则会照成app.init中jquery引用失败
			include: ["jquery/scrolltotop","css-builder"],
            exclude: ["app/index"]
        }
		,{
            name: "app/index", //所有datatables合并,app.datatables文件define引用部分
            include: ["bootstrap","app/common","app/form","jquery/blockui",
					 "jquery/scrollbar","jquery/gritter"],
			exclude: ["css-builder"]
        }
        ,{
            name: "app/datatables", //所有datatables合并,app.datatables文件define引用部分
            exclude: ["bootstrap","css-builder"]
        }
        ,{
            name: "echarts", //所有echarts合并
        }
    ],
    optimize: "uglify",
    uglify: {
        toplevel: true,//混淆顶级作用域的变量和函数名称
        ascii_only: true,//字符编码转换为ascii
        beautify: false//格式化输出
        //max_line_length: 1000
    },
    fileExclusionRegExp: /\.bak$|\.htm$|\.html$|\.old$/,//排除文件
    optimizeCss: 'standard',//css压缩
    removeCombined: true,//删除目标文件夹中所有以合并文件
    mainConfigFile:'src/main.js'//requirejs的main配置文件
})