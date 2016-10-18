/**
 * Created by zhuyu on 2016/10/10.
 *
 */
(function($){
    /**
     * 克隆对象 用于避免对象数据操作是造成的数据污染
     * @param obj
     * @returns {*}
     */
    $.clone = function clone(obj){
        var o;
        switch(typeof obj){
            case 'undefined': break;
            case 'string'   : o = obj + '';break;
            case 'number'   : o = obj - 0;break;
            case 'boolean'  : o = obj;break;
            case 'object'   :
                if(obj === null){
                    o = null;
                }else{
                    if(obj instanceof Array){
                        o = [];
                        for(var i = 0, len = obj.length; i < len; i++){
                            o.push(clone(obj[i]));
                        }
                    }else{
                        o = {};
                        for(var k in obj){
                            o[k] = clone(obj[k]);
                        }
                    }
                }
                break;
            default:
                o = obj;break;
        }
        return o;
    };
    
    /**
     * loading方法
     * @type {{show: mgui.loading.show}}
     */
    $.loading = {
        _domLoading:null,
        _retainCount:0, // 当存在多个并发loading时，根据加载次数关闭
        show: function (inConfig) {
            // 默认参数
            var config = {
                msg:"加载中...",
                className:"mg-loading",
            };
            config = $.extend(config,inConfig);
            this._retainCount++;
            // 检查重复项，如已加载loading 则不予重复显示
            if(this._domLoading){
                this._domLoading.querySelector("span").innerHTML = config.msg;
                return;
            }
            this._domLoading = document.createElement("div");
            this._domLoading.className = config.className;
            this._domLoading.innerHTML ='<div class="container"><i></i><span>'+config.msg+'</span></div>';
            document.body.appendChild(this._domLoading);
        },
        hide: function () {
            this._retainCount--;
            if(this._domLoading && this._retainCount<=0){
                this._domLoading.parentNode.removeChild(this._domLoading);
                this._domLoading = null;
            }
        }
    };
    /**
     * 锁屏方法
     * @type {{show: mgui.screenLock.show, hide: mgui.screenLock.hide}}
     */
    $.screenLock = {
        show: function (inConfig) {

        },
        hide: function () {

        }
    };
    /**
     * 消息提示方法
     * @param inConfig
     */
    $.tomsg = function(inConfig) {

    };


    $.apiCaller = {
        _subData: null,
        call: function (inConfig, func) {
            var config = {
                awaysRunFunc    :false,     // 总是执行func方法 不论成功失败
                showLoading     :false,     // 显示loading
                loadcfg         :{msg:"加载中..."},         // loading 消息配置
                lockScreen      :false,     // 锁屏
                failedmsg       :"",         // 错误提示信息
                succmsg         :"",         // 不存在func 回调方法时显示成功消息
                formid          :"",         // input 容器id
                data            :{},         // 提交数据
                method          :'post',     // 提交方法
                dataType        :'json',     // 数据类型
                headers:{
                    'Content-Type':'application/json'
                }
            }
            config = $.extend(config,inConfig);
            if(CONFIG.isDebug()){
                config.method = 'get'; // debug 打开时需要通过get方法才能获取参数
            }
            // 如果存在显示loading
            if (config.showLoading) {
                $.loading.show(config.loadcfg);
            }
            if (config.lockScreen) {
                $.screenLock.show();
            }
            this._subData = config.data;
            if (config.formid) {
                var subForm = $("form[id='"+config.formid+"']");
                for (var i=0; i<subForm[0].length; i++) {
                    if(subForm[0][i].type === "checkbox") {
                        if ( subForm[0][i].checked ){
                            if ( !this._subData[ subForm[0][i].name ] ) {
                                this._subData[ subForm[0][i].name ] = subForm[0][i].value;
                            } else {
                                this._subData[ subForm[0][i].name ] += (","+subForm[0][i].value);
                            }
                        }
                    } else if(subForm[0][i].name) {
                        this._subData[ subForm[0][i].name ] = subForm[0][i].value;
                    }
                }
            }
            var ajaxData = {
                type: config.method,
                data: config.method=='post'?JSON.stringify(this._subData):this._subData,
                dataType: config.dataType,
                contentType: config.contentType,
                success: function (data) {
                    if (config.lockScreen) {
                        $.screenLock.hide();
                    }
                    if (config.showLoading) {
                        $.loading.hide();
                    }
                    if (config.dataType!=="json") {
                        func(data);
                        return;
                    }
                    if (data.code == 1 || config.awaysRunFunc) {
                        if ( func ) {
                            func(data);
                        } else if ( config.succmsg ) {
                            $.tomsg({msg:config.succmsg});
                        }
                    } else {
                        switch (data.code) {
                            case 2 : // 服务器异常
                                data.message ? $.tomsg({msg:data.message}) : $.tomsg({msg:config.failedmsg});
                                break;
                            case 3 : // 业务异常
                                data.message ? $.tomsg({msg:data.message}) : $.tomsg({msg:config.failedmsg});
                                break;
                            default : // 后台输出错误消息
                                $.tomsg({msg:'请求失败'});
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    if (config.lockScreen) {
                        $.screenLock.hide();
                    }
                    if (config.showLoading) {
                        $.loading.hide();
                    }
                    switch (XMLHttpRequest.status) {
                        case 500: {
                            $.tomsg({msg:'服务器请求错误，请尝试其他参数'});
                            break;
                        }
                        case 404: {
                            $.tomsg({msg:'404:未找到该请求接口'});
                            break;
                        }
                        default: {
                            $.tomsg({msg: errorThrown});
                            break;
                        }
                    }
                }
            }
            $.ajax(config.api,ajaxData);
        }
    };

    /**
     * [Msg description]
     * 弹窗
     * type,'' 'tip','alert','cofirm' 
     * title:'',       //标题文字
     * text :'',       //内容文字
     * btnSure : '确定',   //按钮文字
     * btnCancel : '取消',   //按钮文字
     * auto_close:false,   //自动消失
     * success //成功回调函数
     * failed //失败回调函数
     * callback
     */
    function Msg(options,callback) {
        this.seting = {
            type: 'alert',
            title: '',       
            text: '',       
            btnSure: '确定',   
            btnCancel: '取消',     
            autoClose: false,
            autoCloseTime: 2000, 
            success: function(){},
            failed: function(){}
        }
        
        this.callback = callback || function(){};

        $.extend(true,this.seting,options);

        this.init();

        return $;
    };
    Msg.prototype = {
        constructor: Msg,
        init: function(){
            var doc = document,
                bd =  doc.body,
                dialogExist = doc.querySelector('#dialog');

            var dialog = '<div class="dialog" id="dialog">'
                            +'<div class="dialog-mask" id="dialog-mask" name="dialog-mask"></div>'
                            +'<div name="dialog-msg" class="dialog-msg" id="dialog-msg"></div>'
                        +'</div>',
                        dialogMsgTitle = '<div class="dialog-title"><strong class="dialog-title-content">'+this.seting.title+'</strong></div>',
                        dialogMsgContent = '<div class="dialog-msg-content">'+this.seting.text+'</div>';


            if(dialogExist){
                return false;
            }

            bd.insertAdjacentHTML('beforeEnd', dialog);

            this.dialog = doc.querySelector('#dialog');
            this.dialogMsg = this.dialog.querySelector('#dialog-msg');

            this.dialogMsg.insertAdjacentHTML('beforeEnd', dialogMsgTitle);
            this.dialogMsg.insertAdjacentHTML('beforeEnd', dialogMsgContent);

            switch(this.seting.type){
                case "tip":
                    //确认框
                    this.tip();
                    break;
                case "alert":
                    //警告框
                    this.alert();
                    break;
                case "confirm":
                    //确认框
                    this.confirm();
                    break;
                default:
                    //警告框
                    this.alert();
                    break;
            }
        },
        tip: function(){
            var dialogMsgBottom = '<div class="dialog-bottom"></div>';

            this.dialogMsg.insertAdjacentHTML('beforeEnd', dialogMsgBottom);
            this.autoHide(true);
        },
        alert: function(){
            var dialogMsgBottom = '<div class="dialog-bottom">'
                            +'<span href="javascript:;" class="dialog-bottom-sure">'+this.seting.btnSure+'</span>'
                        +'</div>';
            this.dialogMsg.insertAdjacentHTML('beforeEnd', dialogMsgBottom);
            this.autoHide();
            this.handlerSuccess();
        },
        confirm: function(){
            var dialogMsgBottom = '<div class="dialog-bottom">'
                            +'<span href="javascript:;" class="dialog-bottom-cancel">'+this.seting.btnSure+'</span>'
                            +'<span href="javascript:;" class="dialog-bottom-sure">'+this.seting.btnCancel+'</span>'
                        +'</div>';

            this.dialogMsg.insertAdjacentHTML('beforeEnd', dialogMsgBottom);
            this.autoHide();
            this.handlerSuccess();
            this.handlerFailed();
        },
        handlerSuccess: function(){
            this.dialogMsg.querySelector('.dialog-bottom-sure').addEventListener('click',function(event){
                var event=event||window.event;
                if(event.stopPropagation){
                    event.stopPropagation();
                }else{
                    event.cancelBulle=true;
                }

                if(this.seting.success && Object.prototype.toString.call(this.seting.success) == "[object Function]"){
                    this.seting.success.call(this,this.dialog);
                    this.hide();
                }

            }.bind(this),false);
        },
        handlerFailed: function(){
            this.dialogMsg.querySelector('.dialog-bottom-cancel').addEventListener('click',function(event){
                var event=event||window.event;
                if(event.stopPropagation){
                    event.stopPropagation();
                }else{
                    event.cancelBulle=true;
                }
                if(this.seting.failed && Object.prototype.toString.call(this.seting.failed) == "[object Function]"){
                    this.seting.failed.call(this,this.dialog);
                    this.hide();
                }
            }.bind(this),false);
        },
        hide: function(){
            this.dialog.parentNode.removeChild(this.dialog);
            this.callback.call(this);
        },
        autoHide: function(auto){
            if(typeof auto !== "undefined"){
                this.seting.autoClose = auto;
            }
            if(this.seting.autoClose){
                setTimeout(function(){
                    this.hide();
                }.bind(this),this.seting.autoCloseTime);
            }
        }
    }
    /**
     * [$.msg description]
     * 绑定到$
     */
    $.msg = function(options,callback){
        var m = new Msg(options,callback);
        return m;
    }

    $.cookieUtil = {

        /**
         * 根据opt中设置的值设置cookie
         * 
         * @param {Object} opt 包含cookie信息的对象，选项如下
         *   key {string} 需要设置的名字
         *   value {string} 需要设置的值
         *   maxAge {number} 有效期
         *   domain {string} domain
         *   path {string} path
         *   secure {boolean} secure
         * 
         * @return {string} opt对应的设置cookie的字符串
         */
        setItem: function (opt) {
            var result = [];
            var str;

            if (opt.key) {
                result.push(encodeURIComponent(opt.key) + '=' +
                    encodeURIComponent(opt.value));
                if ('maxAge' in opt) {
                    result.push('max-age=' + opt.maxAge);
                }
                if ('domain' in opt) {
                    result.push('domain=' + opt.domain);
                }
                if ('path' in opt) {
                    result.push('path=' + opt.path);
                }
                if (opt.secure) {
                    result.push('secure');
                }

                str = result.join('; ');
                window.document.cookie = str;

            }
            return str;
        },

        /**
         * 从cookie读取指定key的值，如果key有多个值，返回数组，如果没有
         * 对应key，返回undefined
         * 
         * @param {string} key 需要从cookie获取值得key
         * @return {string|Array|undefined} 根据cookie数据返回不同值
         */
        getItem: function (key) {
            key = encodeURIComponent(key);

            var result;
            var pairs = window.document.cookie.split('; ');
            var i, len, item, value;

            for (i = 0, len = pairs.length; i < len; ++i) {
                item = pairs[i];
                if (item.indexOf(key) === 0) {
                    value = decodeURIComponent(item.slice(item.indexOf('=') + 1));
                    if (typeof result === 'undefined') {
                        result = value;
                    } else if (typeof result === 'string') {
                        result = [result];
                        result.push(value);
                    } else {
                        result.push(value);
                    }
                } // end if
            } // end for
            return result;
        },


        /**
         * 解析cookie返回对象，键值对为cookie存储信息
         * 
         * @return {Object} 包含cookie信息的对象
         */
        getAll: function () {
            var obj = {};
            var i, len, item, key, value, pairs, pos;

            pairs = window.document.cookie.split('; ');
            for (i = 0, len = pairs.length; i < len; ++i) {
                item = pairs[i].split('=');
                key = decodeURIComponent(item[0]);
                value = decodeURIComponent(item[1] ? item[1] : '');
                obj[key] = value;
            }
            return obj;
        },

        /**
         * 清除当前文档能访问的所有cookie
         * 
         */
        clear: function () {
            var pairs = window.document.cookie.split('; ');
            var i, len, item, key;

            for (i = 0, len = pairs.length; i < len; ++i) {
                item = pairs[i];
                key = item.slice(0, item.indexOf('='));
                window.document.cookie = key + '=; max-age=0';
            }
        }
    };

    $.sessionUtil = {
        /**
         * [MgSessionSet sessionStorage set]
         * @param  {[type]} key [key值]
         * @param  {[type]} value  [value值]
         */
        setSession:function(key, value) {
            window.sessionStorage.setItem(key, value);
        },
        /**
         * [MgSessionGet sessionStorage get]
         * @param {[type]} key [key值]
         */
        getSession: function(key) {
            var result = window.sessionStorage.getItem(key);
            if (result == '' || result == "undefined" || result == "null" || result == null || result == undefined) {
                return '';
            };
            return result;
        }
    }

    $.localStorageUtil = {
        /**
         * [MgLocalSet localStorage set]
         * @param {[type]} key   [key值]
         * @param {[type]} value [value值]
         */
        setLocalStorage: function(key, value) {
            window.localStorage.setItem(key, value);
        },
        /**
         * [MgLocalGet localStorage get]
         * @param {[type]} key [key值]
         */
        getLocalStorage: function(key) {
            var result = window.localStorage.getItem(key);
            if (result == '' || result == "undefined" || result == "null" || result == null || result == undefined) {
                return '';
            };
            return result;
        }
    }

})(mgui)