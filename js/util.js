
		var Position = {};
		(function () {
			Position.getAbsolute = function (reference, target) {
				//因为我们会将目标元素的边框纳入递归公式中，这里先减去对应的值
				var result = {
					left: -target.clientLeft,
					top: -target.clientTop
				}
				var node = target;
				while(node != reference && node != document){
					result.left = result.left + node.offsetLeft + node.clientLeft;
					result.top = result.top + node.offsetTop + node.clientTop;
					node = node.parentNode;
				}
				if(isNaN(reference.scrollLeft)){
					result.right = document.documentElement.scrollWidth - result.left;
					result.bottom = document.documentElement.scrollHeight - result.top;
				}else {
					result.right = reference.scrollWidth - result.left;
					result.bottom = reference.scrollHeight - result.top;
				}
				return result;
			}
			Position.getViewport = function (target) {
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
				var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
				var windowHeight = window.innerHeight || document.documentElement.offsetHeight;
				var windowWidth = window.innerWidth || document.documentElement.offsetWidth;
				var absolutePosi = this.getAbsolute(document, target);
				var Viewport = {
					left: absolutePosi.left - scrollLeft,
					top: absolutePosi.top - scrollTop,
					right: windowWidth - (absolutePosi.left - scrollLeft),
					bottom: windowHeight - (absolutePosi.top - scrollTop)
				}
				return Viewport;
			}
			Position.isViewport = function (target) {
				var position = this.getViewport(target);
				//这里需要加上元素自身的宽高，因为定位点是元素的左上角
				if(position.left + target.offsetWidth < 0 || position.top + target.offsetHeight < 0){
					return false;
				}
				if(position.bottom < 0 || position.right < 0){
					return false;
				}
				return true;
			}
			Position.getElementLeft = function (element){
		　　　　var actualLeft = element.offsetLeft;
		　　　　var current = element.offsetParent;

		　　　　while (current !== null){
		　　　　　　actualLeft += current.offsetLeft;
		　　　　　　current = current.offsetParent;
		　　　　}

		　　　　return actualLeft;
		　　}

		　　Position.getElementTop = function (element){
		　　　　var actualTop = element.offsetTop;
		　　　　var current = element.offsetParent;

		　　　　while (current !== null){
		　　　　　　actualTop += current.offsetTop;
		　　　　　　current = current.offsetParent;
		　　　　}

		　　　　return actualTop;
		　　}
			
		})();
		
		//FX获取文件路径方法
		function readFileFirefox(fileBrowser) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			}
			catch (e) {
				alert('无法访问本地文件，由于浏览器安全设置。为了克服这一点，请按照下列步骤操作：(1)在地址栏输入"about:config";(2) 右键点击并选择 New->Boolean; (3) 输入"signed.applets.codebase_principal_support" （不含引号）作为一个新的首选项的名称;(4) 点击OK并试着重新加载文件');
				return;
			}
			var fileName=fileBrowser.value; //这一步就能得到客户端完整路径。下面的是否判断的太复杂，还有下面得到ie的也很复杂。
			var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
			try {
				// Back slashes for windows
				file.initWithPath( fileName.replace(/\//g, "\\\\") );
			}
			catch(e) {
				if (e.result!=Components.results.NS_ERROR_FILE_UNRECOGNIZED_PATH) throw e;
				alert("File '" + fileName + "' cannot be loaded: relative paths are not allowed. Please provide an absolute path to this file.");
				return;
			}
			if ( file.exists() == false ) {
				alert("File '" + fileName + "' not found.");
				return;
			}

			return file.path;
		}

	
	    //根据不同浏览器获取路径
		function getFilePath(obj){
			//判断浏览器
			var Sys = {};
			var ua = navigator.userAgent.toLowerCase();
			var s;
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
				(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
					(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
						(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
							(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
			var file_url="";
			if(Sys.ie<="6.0"){
				//ie5.5,ie6.0
				file_url = obj.value;
			}else if(Sys.ie>="7.0"){
				//ie7,ie8
				obj.select();
				file_url = document.selection.createRange().text;
			}else if(Sys.firefox){
				//fx
				//file_url = document.getElementById("file").files[0].getAsDataURL();//获取的路径为FF识别的加密字符串
				file_url = readFileFirefox(obj);
			}else if(Sys.chrome){
				file_url = obj.value;
			}
			alert(file_url);
			return file_url;
		}
		
		function getTimeSuffixFileName(fileName){
			var fileNameA = fileName.split("."); 
			var a = new Date();
			return  fileNameA[0] + "_" + a.getHours() + a.getMinutes() + a.getSeconds() + "." + fileNameA[1];
		}
		
		function fake_click(obj) {
			var ev = document.createEvent("MouseEvents");
			ev.initMouseEvent(
				"click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
			);
			obj.dispatchEvent(ev);
		}

		function saveImageFile1(fileName, data) {
			var urlObject = window.URL || window.webkitURL || window;

			//var downloadData = new Blob([data],{ type: 'image/octet-stream' });
			var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
			/*因为我们已经做过url数据处理这里直接赋值*/
			save_link.href = data; //urlObject.createObjectURL(downloadData);
			save_link.download = fileName;
			fake_click(save_link);
		}
		//调用方法
		//saveImageFile1("save.txt","内容");
		
		function saveImageFile2 (fileName, data) {
			//mobileCode 为写入文件的内容，可以通过获取文本框的value写入
			var file = new File([data], fileName, { type: "image/jpeg;image/bmp;image/gif;image/png" });
			saveAs(file);
		}
		
		//调用方法
		//saveImageFile2("save.txt","test file save ok!");
		
		function saveImageFile3(selector, name) {
			var image = new Image();
			// 解决跨域 Canvas 污染问题
			image.setAttribute('crossOrigin', 'anonymous');
			image.onload = function () {
				var canvas = document.createElement('canvas');
				canvas.width = image.width;
				canvas.height = image.height;

				var context = canvas.getContext('2d');
				context.drawImage(image, 0, 0, image.width, image.height);
				var url = canvas.toDataURL('image/png');

				// 生成一个a元素
				var a = document.createElement('a');
				// 创建一个单击事件
				var event = new MouseEvent('click');

				// 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
				a.download = name || '下载图片名称';
				// 将生成的URL设置为a.href属性
				a.href = url;
				// 触发a的单击事件
				a.dispatchEvent(event);
			}
			image.src = document.querySelector(selector).src;
		}
		
		//调用方式 参数一： 选择器，代表img标签 参数二： 图片名称，可选
		//saveImageFile3('canvas', '图片名称');

		function getStyle(element,attr) {
			return window.getComputedStyle? window.getComputedStyle(element,null)[attr]:element.currentStyle[attr];
		}
		
		