
		
		function $(id) {
			return document.getElementById(id);
		};
		
		function HeatmapEx (id){
			this.keyTag = "";
			this.mapContainerId = id;
			this.heatmap = null; 
			this.hotData = {
				key:"",
				height: 768,
				width: 1024,
				t:new Array()
			};
			this.legendCanvas = document.createElement('canvas');
			this.legendCanvas.width = 100;
			this.legendCanvas.height = 10;
			this.legendCtx = this.legendCanvas.getContext('2d');
			this.gradientCfg = {};
		}; 

		HeatmapEx.prototype = {
			constructor: HeatmapEx,
			
			initialMap: function() {
				if (this.heatmap == null){
					var my = this;
					this.heatmap = h337.create({
						container: $(this.mapContainerId),  
						maxOpacity: .5,
						radius: 10,
						blur: .75,
						onExtremaChange: function onExtremaChange(data) {
							my.updateLegend(data);
						}
					});
				}
				
				return this;
			},
			
			updateLegend: function (data) {
				$('min').innerHTML = data.min;
				$('max').innerHTML = data.max;

				if (data.gradient != this.gradientCfg) {
					this.gradientCfg = data.gradient;
					var gradient = this.legendCtx.createLinearGradient(0, 0, 100, 1);
					for (var key in this.gradientCfg) {
						gradient.addColorStop(key, this.gradientCfg[key]);
					}
					this.legendCtx.fillStyle = gradient;
					this.legendCtx.fillRect(0, 0, 100, 10);
					$('gradient').src = this.legendCanvas.toDataURL();
				}
			},
			
			randomGenerateData: function (num) {
				// boundaries for data generation
				this.hotData.t.splice(0,this.hotData.t.length);
				
				var width = (+window.getComputedStyle(document.body).width.replace(/px/,''));
				var height = (+window.getComputedStyle(document.body).height.replace(/px/,''));
			
				var extremas = [(Math.random() * num) >> 0,(Math.random() * num) >> 0];
				var max = Math.max.apply(Math, extremas);
				var min = Math.min.apply(Math, extremas);

				for (var i = 0; i < num; i++) {
					var x = (Math.random()* width) >> 0;
					var y = (Math.random()* height) >> 0;
					var c = ((Math.random()* max-min) >> 0) + min;
					// btw, we can set a radius on a point basis
					var r = (Math.random()* 80) >> 0;
					// add to dataset
					this.hotData.t.push({ x: x, y:y, value: c, radius: r });
				}

				this.reRender();
				
				return t;
			},
			
			addData: function (key, x, y, value, radius){
				this.hotData.key = key;
				this.hotData.t.push({ x: x, y: y, value: value, radius: radius});
				this.reRender();
				
				//save to store
				var value = JSON.stringify(this.hotData);
				localStorage.setItem(key,value);
				
				return this.hotData;
			},
						
			clearData: function (key){
				this.hotData.t.splice(0,this.hotData.t.length);
				this.reRender();
				
				if (localStorage.getItem(key) != 'null')
					localStorage.removeItem(key);
				
				return this.hotData;
			},
			
			clearAll: function (){
				this.hotData.t.splice(0,this.hotData.t.length);
				this.reRender();
				
				localStorage.clear();
				
				return this.hotData;
			},
			
			removeData: function (key, index){
				var storeHotdata = this.getData(key);
				storeHotdata.t.splice(index, 1);
				
				var value = JSON.stringify(storeHotdata);
				localStorage.setItem(key,value);
				
				this.hotData = storeHotdata;
				this.reRender();
				
				return this.hotData;
			},
			
			editData: function (key, index, x, y, value, radius){
				var newData = {x:x, y:y, value:value, radius:radius};
								
				var storeHotdata = this.getData(key);
				storeHotdata.t[index] = newData;
				
				var value = JSON.stringify(storeHotdata);
				localStorage.setItem(key,value);
				
				this.hotData = storeHotdata;
				this.reRender();
				
				return this.hotData;
			},
		
		    updateContainerSize: function(key, height, width){
				var storeHotdata = this.getData(key);
				storeHotdata.key = key;
				storeHotdata.height = height;
				storeHotdata.width = width;
				
				var value = JSON.stringify(storeHotdata);
				localStorage.setItem(key,value);
				
				this.hotData = storeHotdata;
				return this.hotData;
			},
		
			getData: function(key){
				var jsonString = localStorage.getItem(key);
				
				if (!jsonString || jsonString=='null'){ 
					//alert('isnull');
					this.hotData = {
						key:"",
						height: 768,
						width: 1024,
						t: new Array()
					}
				}else{
					this.hotData = JSON.parse(jsonString);
				}
				this.reRender();
				return this.hotData;
			},
			
			reRender: function (data){
				var extremas = [(Math.random() * 1000) >> 0,(Math.random() * 1000) >> 0];
				var max = Math.max.apply(Math, extremas);
				var min = Math.min.apply(Math, extremas);
					
				var init = +new Date;
				// set the generated dataset
				var newData = data;
				if (data == undefined || data == null)
					newData = this.hotData.t;
				
				this.heatmap.setData({
					min: min,
					max: max,
					data: newData
				});
				console.log('took ', (+new Date) - init, 'ms');
			},
			
			getHotPointPos: function (event){
				var targetNode = $(this.mapContainerId);  
				var e = event || window.event;

				var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
				var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
				
				var elementX = Position.getElementLeft(targetNode);
				var elementY = Position.getElementTop(targetNode);
				
				var x = (e.pageX || e.clientX + scrollX) - elementX;
				var y = (e.pageY || e.clientY + scrollY) - elementY;
				
				return {x:x, y:y};
			}
		}

