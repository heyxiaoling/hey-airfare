/**
 * Created by hey on 2016/10/10.
 *
 */
(function($){
/**
 * 地图位置定位
 * callback 回调函数，取位置
 * 如：$.getLocation(function(data){
 *          alert(data);
 *     });
 * 
 */
$.getLocation = function(callback){
    var location = "深圳";
    var callback = callback || function(){};
    if (navigator.geolocation){   
        navigator.geolocation.getCurrentPosition(success,failed);   
    }else{     
        $.msg({
            type: 'tip',
            text:'浏览器不支持地理定位。',
        }); 
    }

    function success(){
        var latlon = position.coords.latitude+','+position.coords.longitude;
        //baidu百度接口  
        var url = "http://api.map.baidu.com/geocoder/v2/?ak=C93b5178d7a8ebdb830b9b557abce78b&callback=renderReverse&location="+latlon+"&output=json&pois=0";
        $.ajax({    
            type: "GET",    
            dataType: "jsonp",    
            url: url,  
            async: false, 
            beforeSend: function(){    
                $.msg({
                    text:'正在定位...',
                }); 
            },   
            success: function (json) {    
                if(json.status==0){ 
                    location = json.result.addressComponent.city.replace("市","");
                }else{
                    $.msg({
                        text:'地址位置获取失败',
                    }); 
                }
                callback.call(null,location);
            },   
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $.msg({
                    text:'地址位置获取失败',
                });
                callback.call(null,location);
            }   
        }); 
    }

    function failed(error){
        switch(error.code) {   
            case error.PERMISSION_DENIED:
                $.msg({
                    type: 'tip',
                    text:'定位失败,用户拒绝请求地理定位',
                });   
                break;   
            case error.POSITION_UNAVAILABLE: 
                $.msg({
                    type: 'tip',
                    text:'定位失败,位置信息不可用',
                });   
                break;   
            case error.TIMEOUT:  
                $.msg({
                    type: 'tip',
                    text:'定位失败,请求获取用户位置超时',
                }); 
                break;   
            case error.UNKNOWN_ERROR:
                $.msg({
                    type: 'tip',
                    text:'定位失败,定位系统失效',
                });  
                break;   
        }
        callback.call(null,location);
    }    
}

})(mgui)