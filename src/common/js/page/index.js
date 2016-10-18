/**
 * Created by zhuyu on 2016/10/9.
 */
// 样式引入
require('./../../skin/common/mgui.less');
require('./../../skin/page/index.less');

// js引入
window.CONFIG = require('./../config.js');      // 配置文件，含：api接口信息，项目信息
window.mgui = require('./../lib/mgui/mgui.js'); // mgui主框架
window.mgui.template = require('./../lib/template.js');
require('./../lib/common.js');
require('./../lib/location.js');
require('./../lib/director.js');
require('./../lib/router.js');

(function($) {


})(mgui);
