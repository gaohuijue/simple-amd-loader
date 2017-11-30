var define,require;
(function(global){
	var NOT_LOAD = 0,
		LOADING = 1,
		DEFINING = 2,
		DEFINED = 3;
	
	var requireConfig = {
		baseUrl:null
	}
	
	var requireCallback,requireDeps,requireDepsCopy,requireCallbackCalled;
	require = function(deps,callback){
		requireDepsCopy = [];
		each(deps,function(depId){
			loadModule(depId);
			requireDepsCopy.push(depId);
		});
		requireCallback = callback;
		requireDeps = deps;
	};
	
	require.config = function(config){
		requireConfig.baseUrl = config.baseUrl+(config.baseUrl.lastIndexOf('/')===config.baseUrl.length-1?'':'/');
	};
	var modules = {},parentMap = {};
	define = function(id,deps,factory){
		modules[id].factory = factory;
		modules[id].deps = deps;
		modules[id].state = DEFINING;
		if(deps.length){
			each(deps,function(depId){
				if(parentMap[depId]){
					parentMap[depId].push(id);
				}else{
					parentMap[depId] = [id];
				}
				loadModule(depId,function(){
					if(modules&&modules[id].state!==DEFINED){
						tryDefine(id);
					}
				});
			});
		}else{
			defineModule(id);
		}
		
		function defineModule(id){
			modules[id].state = DEFINED;
			modules[id].exports = modules[id].factory.apply(global,getDepsExports(modules[id].deps));
			// 自己定义完成，通知所有父尝试定义自己。
			if(parentMap[id]){
				tryDefineParentModule(parentMap[id]);
			}else{// 如果没有父了，说明是require的依赖。
				if(requireDeps.indexOf(id)>=0){
					requireDeps.splice(requireDeps.indexOf(id),1);
				}
				if(requireDeps.length===0&&!requireCallbackCalled){
					requireCallback.apply(global,getDepsExports(requireDepsCopy));
					requireCallbackCalled = true;
					modules = null;
					parentMap = null;
				}
			}
		}
		function tryDefineParentModule(ids){
			if(ids){
				each(ids,tryDefine);
			}
		}
		function tryDefine(id){
			var count = 0;
			each(modules[id].deps,function(depId){
				if(modules[depId].state === DEFINED){
					count++;
					return true;
				}else{
					return false;
				}
			});
			if(count === modules[id].deps.length){
				defineModule(id);
			}
		}
	};
	
	function getDepsExports(deps){
		var depsExports = [];
		each(deps,function(depId){
			depsExports.push(modules[depId].exports);
		});
		return depsExports;
	}
	
	function loadModule(modId,onLoad){
		if(!modules[modId]){
			modules[modId] = {
				id:modId,
				state:LOADING
			}
		}else if(modules[modId].state){
			return;
		}
		createScript(modId,function(){
			if(typeof onLoad === 'function'){
				onLoad();
			}
		});
	}
	
	var headElement = document.getElementsByTagName('head')[0];
	var baseElement = document.getElementsByTagName('base')[0];
	if (baseElement) {
		headElement = baseElement.parentNode;
	}
	function createScript(moduleId, onload) {
		// 创建script标签
		//
		// 这里不挂接onerror的错误处理
		// 因为高级浏览器在devtool的console面板会报错
		// 再throw一个Error多此一举了
		var script = document.createElement('script');
		script.setAttribute('data-require-id', moduleId);
		script.src = toUrl(moduleId + '.js');
		script.async = true;
		if (script.readyState) {
			script.onreadystatechange = innerOnload;
		}
		else {
			script.onload = innerOnload;
		}

		function innerOnload() {
			var readyState = script.readyState;
			if (
				typeof readyState === 'undefined'
				|| /^(loaded|complete)$/.test(readyState)
			) {
				script.onload = script.onreadystatechange = null;
				script = null;
				onload();
			}
		}
		currentlyAddingScript = script;

		// If BASE tag is in play, using appendChild is a problem for IE6.
		// See: http://dev.jquery.com/ticket/2709
		baseElement
			? headElement.insertBefore(script, baseElement)
			: headElement.appendChild(script);

		currentlyAddingScript = null;
	}
	
	function toUrl(modId){
		return requireConfig.baseUrl + modId;
	}
	
	function each(source, iterator) {
        if (source instanceof Array) {
            for (var i = 0, len = source.length; i < len; i++) {
                if (iterator(source[i], i) === false) {
                    break;
                }
            }
        }
    }
})(this)