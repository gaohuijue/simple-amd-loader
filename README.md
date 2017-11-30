# simple-amd-loader
阉割版AMD加载器，造轮子玩的。
* 没有任何参数检查。
* 没有循环依赖的检查并且不支持循环依赖。
* 没有任何异常处理。
* 全局仅能调用一次require :joy:

```js
// 仅仅能配置baseUrl
require.config({
  baseUrl:'YOUR_BASE_URL'
})
// 定义模块时三个参数都必须有
define('MODULE_ID',['REQUIRE_1','REQUIRE_2'],function(require1,require2){
});
// 只能全局require，function内部不能require.
require(['REQUIRE_1','REQUIRE_2'],function(require1,require2){
});
```

