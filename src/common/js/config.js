/**
 * Created by zhuyu on 2016/10/10.
 * 配置目录，包括api接口地址等信息
 */
module.exports = (function(){
    // 私有变量，通过方法只读
    var debug = true;
    var serverHost = "http://127.0.0.1:8888/mock/"; // 服务器host
    var info = {
        timeOut:20 // 支付超时时间 min
    };
    var api = debug ? {
        // debug mock测试接口
        demoApi : "http://127.0.0.1:8888/mock/demo.json"
    } : {
        // release 正式接口
        demoApi : serverHost + "demo.json"

    }
    // 返回获取器对象
    return {
        getApi : function(in_name) {
            return api[in_name] ? api[in_name] : null;
        },
        getInfo : function(in_name) {
            return info[in_name] ? info[in_name] : null;
        },
        isDebug : function(){
            return debug;
        }
    }
})();