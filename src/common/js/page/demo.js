/**
 * Created by zhuyu on 2016/10/9.
 */
// 样式引入
require('./../../skin/common/mgui.less');
require('./../../skin/page/demo.less');

// js引入
window.CONFIG = require('./../config.js');      // 配置文件，含：api接口信息，项目信息
window.mgui = require('./../lib/mgui/mgui.js'); // mgui主框架
window.mgui.template = require('./../lib/template.js');
require('./../lib/common.js');
require('./../lib/location.js');

(function($) {
    
    /**
     * 初始化
     */
    // ajax 基础调用方法
    $.ajax('http://127.0.0.1:8888/mock/demo.json',{
        data:{
            username:'username',
            password:'password'
        },
        dataType:'json',//服务器返回json格式数据
        type:'get',//HTTP请求类型
        timeout:10000,//超时时间设置为10秒；
        headers:{'Content-Type':'application/json'},
        success:function(res){
            //
            console.log(JSON.stringify(res));
        },
        error:function(xhr,type,errorThrown){
            //异常处理；
            console.log(type);
        }
    });
    // ajax 封装后调用方法
    $.apiCaller.call({
        api:CONFIG.getApi('demoApi'),
        showLoading     :true,                      // 显示loading
        loadcfg         :{msg:"加载列表.."},      // loading 消息配置
        data:{
            name:'eric',
            id:'001'
        }
    },function(res){
        // template.js 使用
        var html = $.template('list-template', res.data);
        $('#main-content')[0].innerHTML = html;
    });

    /**
     * 业务方法
     */
    // loading组件使用demo
    $.loading.show({msg:"测试消息.."});
    setTimeout(function(){
        $.loading.hide();
    },2000);

    // $.msg({
    //     type: 'alert',
    //     text: '信息有误',
    //     callback: function(){
    //     }
    // });

    $.getLocation(function(data){
        console.log(data);
    });
    /**
     * 事件监听
     */
    $('#main-content').on('click', 'li.mg-table-view-cell', function(e) {
        //console.log('shown', e.detail.id);//detail为当前popover元素
        alert('item clicked');
    });

})(mgui);
