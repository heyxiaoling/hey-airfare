/**
 * Created by zhuyu on 2016/10/10.
 */
var mgui = (function(document, undefined) {
    var readyRE = /complete|loaded|interactive/;
    var idSelectorRE = /^#([\w-]+)$/;
    var classSelectorRE = /^\.([\w-]+)$/;
    var tagSelectorRE = /^[\w-]+$/;
    var translateRE = /translate(?:3d)?\((.+?)\)/;
    var translateMatrixRE = /matrix(3d)?\((.+?)\)/;

    var $ = function(selector, context) {
        context = context || document;
        if (!selector)
            return wrap();
        if (typeof selector === 'object')
            if ($.isArrayLike(selector)) {
                return wrap($.slice.call(selector), null);
            } else {
                return wrap([selector], null);
            }
        if (typeof selector === 'function')
            return $.ready(selector);
        if (typeof selector === 'string') {
            try {
                selector = selector.trim();
                if (idSelectorRE.test(selector)) {
                    var found = document.getElementById(RegExp.$1);
                    return wrap(found ? [found] : []);
                }
                return wrap($.qsa(selector, context), selector);
            } catch (e) {}
        }
        return wrap();
    };

    var wrap = function(dom, selector) {
        dom = dom || [];
        Object.setPrototypeOf(dom, $.fn);
        dom.selector = selector || '';
        return dom;
    };

    $.uuid = 0;

    $.data = {};
    /**
     * extend(simple)
     * @param {type} target
     * @param {type} source
     * @param {type} deep
     * @returns {unresolved}
     */
    $.extend = function() { //from jquery2
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        if (typeof target === "boolean") {
            deep = target;

            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== "object" && !$.isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];

                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }

                        target[name] = $.extend(deep, clone, copy);

                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };
    /**
     * 基础方法
     */
    $.noop = function() {};

    $.slice = [].slice;

    $.filter = [].filter;

    $.type = function(obj) {
        return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
    };

    $.isArray = Array.isArray ||
        function(object) {
            return object instanceof Array;
        };

    $.isArrayLike = function(obj) {
        var length = !!obj && "length" in obj && obj.length;
        var type = $.type(obj);
        if (type === "function" || $.isWindow(obj)) {
            return false;
        }
        return type === "array" || length === 0 ||
            typeof length === "number" && length > 0 && (length - 1) in obj;
    };

    $.isWindow = function(obj) {
        return obj != null && obj === obj.window;
    };

    $.isObject = function(obj) {
        return $.type(obj) === "object";
    };

    $.isPlainObject = function(obj) {
        return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    };

    $.isEmptyObject = function(o) {
        for (var p in o) {
            if (p !== undefined) {
                return false;
            }
        }
        return true;
    };

    $.isFunction = function(value) {
        return $.type(value) === "function";
    };
    /**
     * 选择器补充方法
     * @param {type} selector
     * @param {type} context
     * @returns {Array}
     */
    $.qsa = function(selector, context) {
        context = context || document;
        return $.slice.call(classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
    };

    /**
     * 将 fn 缓存一段时间后, 再被调用执行
     * 此方法为了避免在 ms 段时间内, 执行 fn 多次. 常用于 resize , scroll , mousemove 等连续性事件中;
     * 当 ms 设置为 -1, 表示立即执行 fn, 即和直接调用 fn 一样;
     * 调用返回函数的 stop 停止最后一次的 buffer 效果
     * @param {Object} fn
     * @param {Object} ms
     * @param {Object} context
     */
    $.buffer = function(fn, ms, context) {
        var timer;
        var lastStart = 0;
        var lastEnd = 0;
        var ms = ms || 150;

        function run() {
            if (timer) {
                timer.cancel();
                timer = 0;
            }
            lastStart = $.now();
            fn.apply(context || this, arguments);
            lastEnd = $.now();
        }

        return $.extend(function() {
            if (
                (!lastStart) || // 从未运行过
                (lastEnd >= lastStart && $.now() - lastEnd > ms) || // 上次运行成功后已经超过ms毫秒
                (lastEnd < lastStart && $.now() - lastStart > ms * 8) // 上次运行或未完成，后8*ms毫秒
            ) {
                run();
            } else {
                if (timer) {
                    timer.cancel();
                }
                timer = $.later(run, ms, null, arguments);
            }
        }, {
            stop: function() {
                if (timer) {
                    timer.cancel();
                    timer = 0;
                }
            }
        });
    };
    /**
     * each
     * @param {type} elements
     * @param {type} callback
     * @returns {_L8.$}
     */
    $.each = function(elements, callback, hasOwnProperty) {
        if (!elements) {
            return this;
        }
        if (typeof elements.length === 'number') {
            [].every.call(elements, function(el, idx) {
                return callback.call(el, idx, el) !== false;
            });
        } else {
            for (var key in elements) {
                if (hasOwnProperty) {
                    if (elements.hasOwnProperty(key)) {
                        if (callback.call(elements[key], key, elements[key]) === false) return elements;
                    }
                } else {
                    if (callback.call(elements[key], key, elements[key]) === false) return elements;
                }
            }
        }
        return this;
    };
    $.focus = function(element) {
        if ($.os.ios) {
            setTimeout(function() {
                element.focus();
            }, 10);
        } else {
            element.focus();
        }
    };
    /**
     * trigger event
     * @param {type} element
     * @param {type} eventType
     * @param {type} eventData
     * @returns {_L8.$}
     */
    $.trigger = function(element, eventType, eventData) {
        element.dispatchEvent(new CustomEvent(eventType, {
            detail: eventData,
            bubbles: true,
            cancelable: true
        }));
        return this;
    };
    /**
     * setTimeout封装
     * @param {Object} fn
     * @param {Object} when
     * @param {Object} context
     * @param {Object} data
     */
    $.later = function(fn, when, context, data) {
        when = when || 0;
        var m = fn;
        var d = data;
        var f;
        var r;

        if (typeof fn === 'string') {
            m = context[fn];
        }

        f = function() {
            m.apply(context, $.isArray(d) ? d : [d]);
        };

        r = setTimeout(f, when);

        return {
            id: r,
            cancel: function() {
                clearTimeout(r);
            }
        };
    };
    $.now = Date.now || function() {
            return +new Date();
        };
    var class2type = {};
    $.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    if (window.JSON) {
        $.parseJSON = JSON.parse;
    }
    /**
     * $.fn
     */
    $.fn = {
        each: function(callback) {
            [].every.call(this, function(el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        }
    };

    return $;
})(document);

/**
 * ajax
 * @param {type} $
 * @returns {undefined}
 */
(function($, window, undefined) {

    var jsonType = 'application/json';
    var htmlType = 'text/html';
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var scriptTypeRE = /^(?:text|application)\/javascript/i;
    var xmlTypeRE = /^(?:text|application)\/xml/i;
    var blankRE = /^\s*$/;

    $.ajaxSettings = {
        type: 'GET',
        beforeSend: $.noop,
        success: $.noop,
        error: $.noop,
        complete: $.noop,
        context: null,
        xhr: function(protocol) {
            return new window.XMLHttpRequest();
        },
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        timeout: 0,
        processData: true,
        cache: true
    };
    var ajaxBeforeSend = function(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false) {
            return false;
        }
    };
    var ajaxSuccess = function(data, xhr, settings) {
        settings.success.call(settings.context, data, 'success', xhr);
        ajaxComplete('success', xhr, settings);
    };
    // type: "timeout", "error", "abort", "parsererror"
    var ajaxError = function(error, type, xhr, settings) {
        settings.error.call(settings.context, xhr, type, error);
        ajaxComplete(type, xhr, settings);
    };
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    var ajaxComplete = function(status, xhr, settings) {
        settings.complete.call(settings.context, xhr, status);
    };

    var serialize = function(params, obj, traditional, scope) {
        var type, array = $.isArray(obj),
            hash = $.isPlainObject(obj);
        $.each(obj, function(key, value) {
            type = $.type(value);
            if (scope) {
                key = traditional ? scope :
                scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
            }
            // handle data in serializeArray() format
            if (!scope && array) {
                params.add(value.name, value.value);
            }
            // recurse into nested objects
            else if (type === "array" || (!traditional && type === "object")) {
                serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
        });
    };
    var serializeData = function(options) {
        if (options.processData && options.data && typeof options.data !== "string") {
            options.data = $.param(options.data, options.traditional);
        }
        if (options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
            options.url = appendQuery(options.url, options.data);
            options.data = undefined;
        }
    };
    var appendQuery = function(url, query) {
        if (query === '') {
            return url;
        }
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };
    var mimeToDataType = function(mime) {
        if (mime) {
            mime = mime.split(';', 2)[0];
        }
        return mime && (mime === htmlType ? 'html' :
                mime === jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml') || 'text';
    };
    var parseArguments = function(url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success, success = data, data = undefined;
        }
        if (!$.isFunction(success)) {
            dataType = success, success = undefined;
        }
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        };
    };
    $.ajax = function(url, options) {
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }
        var settings = options || {};
        settings.url = url || settings.url;
        for (var key in $.ajaxSettings) {
            if (settings[key] === undefined) {
                settings[key] = $.ajaxSettings[key];
            }
        }
        serializeData(settings);
        var dataType = settings.dataType;

        if (settings.cache === false || ((!options || options.cache !== true) && ('script' === dataType))) {
            settings.url = appendQuery(settings.url, '_=' + $.now());
        }
        var mime = settings.accepts[dataType && dataType.toLowerCase()];
        var headers = {};
        var setHeader = function(name, value) {
            headers[name.toLowerCase()] = [name, value];
        };
        var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
        var xhr = settings.xhr(settings);
        var nativeSetHeader = xhr.setRequestHeader;
        var abortTimeout;

        setHeader('X-Requested-With', 'XMLHttpRequest');
        setHeader('Accept', mime || '*/*');
        if (!!(mime = settings.mimeType || mime)) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }
        if (settings.headers) {
            for (var name in settings.headers)
                setHeader(name, settings.headers[name]);
        }
        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = $.noop;
                clearTimeout(abortTimeout);
                var result, error = false;
                var isLocal = protocol === 'file:';
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && isLocal && xhr.responseText)) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType === 'script') {
                            (1, eval)(result);
                        } else if (dataType === 'xml') {
                            result = xhr.responseXML;
                        } else if (dataType === 'json') {
                            result = blankRE.test(result) ? null : $.parseJSON(result);
                        }
                    } catch (e) {
                        error = e;
                    }

                    if (error) {
                        ajaxError(error, 'parsererror', xhr, settings);
                    } else {
                        ajaxSuccess(result, xhr, settings);
                    }
                } else {
                    var status = xhr.status ? 'error' : 'abort';
                    var statusText = xhr.statusText || null;
                    if (isLocal) {
                        status = 'error';
                        statusText = '404';
                    }
                    ajaxError(statusText, status, xhr, settings);
                }
            }
        };
        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort();
            ajaxError(null, 'abort', xhr, settings);
            return xhr;
        }

        if (settings.xhrFields) {
            for (var name in settings.xhrFields) {
                xhr[name] = settings.xhrFields[name];
            }
        }

        var async = 'async' in settings ? settings.async : true;

        xhr.open(settings.type.toUpperCase(), settings.url, async, settings.username, settings.password);

        for (var name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }
        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function() {
                xhr.onreadystatechange = $.noop;
                xhr.abort();
                ajaxError(null, 'timeout', xhr, settings);
            }, settings.timeout);
        }
        xhr.send(settings.data ? settings.data : null);
        return xhr;
    };


    $.param = function(obj, traditional) {
        var params = [];
        params.add = function(k, v) {
            this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        };
        serialize(params, obj, traditional);
        return params.join('&').replace(/%20/g, '+');
    };

    $.fn.load = function(url, data, success) {
        if (!this.length)
            return this;
        var self = this,
            parts = url.split(/\s/),
            selector,
            options = parseArguments(url, data, success),
            callback = options.success;
        if (parts.length > 1)
            options.url = parts[0], selector = parts[1];
        options.success = function(response) {
            if (selector) {
                var div = document.createElement('div');
                div.innerHTML = response.replace(rscript, "");
                var selectorDiv = document.createElement('div');
                var childs = div.querySelectorAll(selector);
                if (childs && childs.length > 0) {
                    for (var i = 0, len = childs.length; i < len; i++) {
                        selectorDiv.appendChild(childs[i]);
                    }
                }
                self[0].innerHTML = selectorDiv.innerHTML;
            } else {
                self[0].innerHTML = response;
            }
            callback && callback.apply(self, arguments);
        };
        $.ajax(options);
        return this;
    };

})(mgui, window);

/**
 * on off 事件处理
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    if ('ontouchstart' in window) {
        $.isTouchable = true;
        $.EVENT_START = 'touchstart';
        $.EVENT_MOVE = 'touchmove';
        $.EVENT_END = 'touchend';
    } else {
        $.isTouchable = false;
        $.EVENT_START = 'mousedown';
        $.EVENT_MOVE = 'mousemove';
        $.EVENT_END = 'mouseup';
    }
    $.EVENT_CANCEL = 'touchcancel';
    $.EVENT_CLICK = 'click';

    var _mid = 1;
    var delegates = {};
    //需要wrap的函数
    var eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };
    //默认true返回函数
    var returnTrue = function() {
        return true
    };
    //默认false返回函数
    var returnFalse = function() {
        return false
    };
    //wrap浏览器事件
    var compatible = function(event, target) {
        if (!event.detail) {
            event.detail = {
                currentTarget: target
            };
        } else {
            event.detail.currentTarget = target;
        }
        $.each(eventMethods, function(name, predicate) {
            var sourceMethod = event[name];
            event[name] = function() {
                this[predicate] = returnTrue;
                return sourceMethod && sourceMethod.apply(event, arguments)
            }
            event[predicate] = returnFalse;
        }, true);
        return event;
    };
    //简单的wrap对象_mid
    var mid = function(obj) {
        return obj && (obj._mid || (obj._mid = _mid++));
    };
    //事件委托对象绑定的事件回调列表
    var delegateFns = {};
    //返回事件委托的wrap事件回调
    var delegateFn = function(element, event, selector, callback) {
        return function(e) {
            //same event
            var callbackObjs = delegates[element._mid][event];
            var handlerQueue = [];
            var target = e.target;
            var selectorAlls = {};
            for (; target && target !== document; target = target.parentNode) {
                if (target === element) {
                    break;
                }
                if (~['click', 'tap', 'doubletap', 'longtap', 'hold'].indexOf(event) && (target.disabled || target.classList.contains('mgui-disabled'))) {
                    break;
                }
                var matches = {};
                $.each(callbackObjs, function(selector, callbacks) { //same selector
                    selectorAlls[selector] || (selectorAlls[selector] = $.qsa(selector, element));
                    if (selectorAlls[selector] && ~(selectorAlls[selector]).indexOf(target)) {
                        if (!matches[selector]) {
                            matches[selector] = callbacks;
                        }
                    }
                }, true);
                if (!$.isEmptyObject(matches)) {
                    handlerQueue.push({
                        element: target,
                        handlers: matches
                    });
                }
            }
            selectorAlls = null;
            e = compatible(e); //compatible event
            $.each(handlerQueue, function(index, handler) {
                target = handler.element;
                var tagName = target.tagName;
                if (event === 'tap' && (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT')) {
                    e.preventDefault();
                    e.detail && e.detail.gesture && e.detail.gesture.preventDefault();
                }
                $.each(handler.handlers, function(index, handler) {
                    $.each(handler, function(index, callback) {
                        if (callback.call(target, e) === false) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, true);
                }, true)
                if (e.isPropagationStopped()) {
                    return false;
                }
            }, true);
        };
    };
    var findDelegateFn = function(element, event) {
        var delegateCallbacks = delegateFns[mid(element)];
        var result = [];
        if (delegateCallbacks) {
            result = [];
            if (event) {
                var filterFn = function(fn) {
                    return fn.type === event;
                }
                return delegateCallbacks.filter(filterFn);
            } else {
                result = delegateCallbacks;
            }
        }
        return result;
    };
    var preventDefaultException = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
    /**
     * delegate events
     * @param {type} event
     * @param {type} selector
     * @param {type} callback
     * @returns {undefined}
     */
    $.fn.on = function(event, selector, callback) { //仅支持简单的事件委托,主要是tap事件使用，类似mouse,focus之类暂不封装支持
        return this.each(function() {
            var element = this;
            mid(element);
            mid(callback);
            var isAddEventListener = false;
            var delegateEvents = delegates[element._mid] || (delegates[element._mid] = {});
            var delegateCallbackObjs = delegateEvents[event] || ((delegateEvents[event] = {}));
            if ($.isEmptyObject(delegateCallbackObjs)) {
                isAddEventListener = true;
            }
            var delegateCallbacks = delegateCallbackObjs[selector] || (delegateCallbackObjs[selector] = []);
            delegateCallbacks.push(callback);
            if (isAddEventListener) {
                var delegateFnArray = delegateFns[mid(element)];
                if (!delegateFnArray) {
                    delegateFnArray = [];
                }
                var delegateCallback = delegateFn(element, event, selector, callback);
                delegateFnArray.push(delegateCallback);
                delegateCallback.i = delegateFnArray.length - 1;
                delegateCallback.type = event;
                delegateFns[mid(element)] = delegateFnArray;
                element.addEventListener(event, delegateCallback);
                if (event === 'tap') { //TODO 需要找个更好的解决方案
                    element.addEventListener('click', function(e) {
                        if (e.target) {
                            var tagName = e.target.tagName;
                            if (!preventDefaultException.test(tagName)) {
                                if (tagName === 'A') {
                                    var href = e.target.href;
                                    if (!(href && ~href.indexOf('tel:'))) {
                                        e.preventDefault();
                                    }
                                } else {
                                    e.preventDefault();
                                }
                            }
                        }
                    });
                }
            }
        });
    };
    $.fn.off = function(event, selector, callback) {
        return this.each(function() {
            var _mid = mid(this);
            if (!event) { //mgui(selector).off();
                delegates[_mid] && delete delegates[_mid];
            } else if (!selector) { //mgui(selector).off(event);
                delegates[_mid] && delete delegates[_mid][event];
            } else if (!callback) { //mgui(selector).off(event,selector);
                delegates[_mid] && delegates[_mid][event] && delete delegates[_mid][event][selector];
            } else { //mgui(selector).off(event,selector,callback);
                var delegateCallbacks = delegates[_mid] && delegates[_mid][event] && delegates[_mid][event][selector];
                $.each(delegateCallbacks, function(index, delegateCallback) {
                    if (mid(delegateCallback) === mid(callback)) {
                        delegateCallbacks.splice(index, 1);
                        return false;
                    }
                }, true);
            }
            if (delegates[_mid]) {
                //如果off掉了所有当前element的指定的event事件，则remove掉当前element的delegate回调
                if ((!delegates[_mid][event] || $.isEmptyObject(delegates[_mid][event]))) {
                    findDelegateFn(this, event).forEach(function(fn) {
                        this.removeEventListener(fn.type, fn);
                        delete delegateFns[_mid][fn.i];
                    }.bind(this));
                }
            } else {
                //如果delegates[_mid]已不存在，删除所有
                findDelegateFn(this).forEach(function(fn) {
                    this.removeEventListener(fn.type, fn);
                    delete delegateFns[_mid][fn.i];
                }.bind(this));
            }
        });

    };
})(mgui);

/**
 * 兼容方法补齐，用于检查并补齐浏览器缺失方法
 * @param {type} undefined
 * @returns {undefined}
 */
(function(undefined) {
    if (String.prototype.trim === undefined) { // fix for iOS 3.2 & android
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
            obj['__proto__'] = proto;
            return obj;
        };

})();

module.exports = mgui;